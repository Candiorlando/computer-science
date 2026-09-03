# Accommodation Letter Generator — Database Schema

Relational schema for persisting AI-generated ADA Title I accommodation
letters to a client's historical case file. Designed for PostgreSQL.
The TypeScript shape in `lib/accommodation-letters.ts` maps 1:1.

Hooks into the existing platform tables:
- `users` (counselor + client identities)
- `cases` (the VR case the letter belongs to)
- `audit_log` (HIPAA-required access trail)

```sql
-- Generated accommodation letters. One row per drafted letter.
CREATE TABLE accommodation_letters (
  id                       UUID PRIMARY KEY DEFAULT uuidv7(),
  case_id                  UUID REFERENCES cases(id),
  client_user_id           UUID REFERENCES users(id),
  drafted_by_user_id       UUID REFERENCES users(id),     -- client OR counselor
  drafted_by_role          app_role NOT NULL,             -- 'client' | 'counselor'

  -- Inputs
  client_name              TEXT NOT NULL,
  job_title                TEXT,
  employer_name            TEXT,
  hr_contact_name          TEXT,
  hr_contact_title         TEXT,
  work_location            TEXT,
  nature_of_condition      TEXT,                          -- nullable on purpose
  workplace_problem        TEXT NOT NULL,

  -- AI output (top-level)
  barrier_analysis         TEXT NOT NULL,
  jan_citation             TEXT NOT NULL,
  total_paid_low_cents     INTEGER NOT NULL,
  total_paid_high_cents    INTEGER NOT NULL,

  -- Letter document (kept as a single block so it renders fast for
  -- the counselor's review screen; per-section breakdown is queryable
  -- via the JSONB column below).
  letter_text              TEXT NOT NULL,                 -- pre-rendered
  letter_json              JSONB NOT NULL,                -- structured
    -- { date, recipientBlock[], subject, salutation, paragraphs[], closing }

  -- Provenance
  generated_by_model       TEXT NOT NULL,                 -- "claude-opus-4-8"
  ai_prompt_version        TEXT NOT NULL,                 -- "v1.0" — frozen
  price_search_enabled     BOOLEAN NOT NULL DEFAULT false,-- TRUE if Brave was used
  generated_at             TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Lifecycle on the case
  status                   TEXT NOT NULL DEFAULT 'draft',
    -- draft | sent_to_employer | acknowledged_by_employer |
    -- interactive_process_started | resolved | withdrawn
  sent_at                  TIMESTAMPTZ,
  resolved_at              TIMESTAMPTZ,
  resolution_notes         TEXT,

  -- Soft delete (never hard-delete; HIPAA + audit)
  deleted_at               TIMESTAMPTZ
);
CREATE INDEX accommodation_letters_case_idx ON accommodation_letters(case_id);
CREATE INDEX accommodation_letters_client_idx ON accommodation_letters(client_user_id);
CREATE INDEX accommodation_letters_drafted_at_idx ON accommodation_letters(generated_at DESC);

-- Zero-cost solutions. One row per administrative option suggested.
CREATE TABLE accommodation_zero_cost_solutions (
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  letter_id     UUID NOT NULL REFERENCES accommodation_letters(id) ON DELETE CASCADE,
  ordinal       SMALLINT NOT NULL,                        -- display order
  label         TEXT NOT NULL,
  rationale     TEXT NOT NULL,
  category      TEXT NOT NULL,                            -- scheduling | policy | task-restructuring | environmental | other
  -- Outcome tracking (filled in by counselor on review)
  employer_response  TEXT,                                -- accepted | declined | modified | pending
  response_notes     TEXT,
  responded_at       TIMESTAMPTZ
);
CREATE INDEX zero_cost_letter_idx ON accommodation_zero_cost_solutions(letter_id);

-- Paid solutions. One row per hardware/software/furniture suggestion.
CREATE TABLE accommodation_paid_solutions (
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  letter_id            UUID NOT NULL REFERENCES accommodation_letters(id) ON DELETE CASCADE,
  ordinal              SMALLINT NOT NULL,
  label                TEXT NOT NULL,
  rationale            TEXT NOT NULL,
  category             TEXT NOT NULL,                     -- hardware | software | furniture | environmental | assistive-tech | other
  estimated_price_low_cents   INTEGER NOT NULL,
  estimated_price_high_cents  INTEGER NOT NULL,
  example_sources      TEXT[] NOT NULL DEFAULT '{}',     -- ['Amazon', 'askjan.org/limitations/...']
  -- Price provenance
  price_source         TEXT NOT NULL,                     -- 'ai-estimated' | 'live-verified'
  verified_at          TIMESTAMPTZ,
  verified_sources     TEXT[],                            -- URLs Brave returned
  -- Outcome tracking
  employer_response    TEXT,
  actual_purchase_cents INTEGER,                          -- once funded
  response_notes       TEXT,
  responded_at         TIMESTAMPTZ
);
CREATE INDEX paid_letter_idx ON accommodation_paid_solutions(letter_id);

-- Access log scoped to a letter. Counselor reviewers, employer-side
-- HR (if shared via document_routes), and auditors all leave a trace.
CREATE TABLE accommodation_letter_audit (
  id           BIGSERIAL PRIMARY KEY,
  letter_id    UUID NOT NULL REFERENCES accommodation_letters(id),
  actor_id     UUID REFERENCES users(id),
  actor_role   app_role,
  action       TEXT NOT NULL,                             -- viewed | edited | printed | exported_pdf | shared_with_employer | status_changed
  before_status TEXT,
  after_status  TEXT,
  ip_address   INET,
  user_agent   TEXT,
  occurred_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX accommodation_audit_letter_idx
  ON accommodation_letter_audit(letter_id, occurred_at);

-- Row-Level Security
ALTER TABLE accommodation_letters ENABLE ROW LEVEL SECURITY;

-- Clients see their own letters only.
CREATE POLICY accommodation_client_self ON accommodation_letters
  FOR SELECT USING (
    client_user_id = current_setting('app.current_user_id')::UUID
  );

-- Counselors see letters for clients on their caseload.
CREATE POLICY accommodation_counselor_caseload ON accommodation_letters
  FOR SELECT USING (
    case_id IN (
      SELECT id FROM cases
      WHERE counselor_user_id = current_setting('app.current_user_id')::UUID
    )
  );

-- Supervisors see everything in their org.
CREATE POLICY accommodation_supervisor_org ON accommodation_letters
  FOR SELECT USING (
    current_setting('app.current_role')::app_role = 'supervisor'
  );

-- Insert/update: only the drafted_by_user_id can mutate the row
-- pre-send. After status='sent_to_employer' the row is read-only
-- except via a controlled status-update endpoint.
```

## Counselor review query

A single query returns every letter for a case, with the per-solution
breakdown plus the full audit chain:

```sql
SELECT
  l.id, l.workplace_problem, l.status, l.generated_at,
  l.total_paid_low_cents, l.total_paid_high_cents,
  l.price_search_enabled,
  json_build_object(
    'zero_cost', (
      SELECT json_agg(json_build_object(
        'label', z.label, 'category', z.category,
        'rationale', z.rationale, 'response', z.employer_response
      ) ORDER BY z.ordinal)
      FROM accommodation_zero_cost_solutions z
      WHERE z.letter_id = l.id
    ),
    'paid', (
      SELECT json_agg(json_build_object(
        'label', p.label, 'category', p.category,
        'price_low_cents', p.estimated_price_low_cents,
        'price_high_cents', p.estimated_price_high_cents,
        'price_source', p.price_source,
        'verified_sources', p.verified_sources,
        'response', p.employer_response,
        'actual_cents', p.actual_purchase_cents
      ) ORDER BY p.ordinal)
      FROM accommodation_paid_solutions p
      WHERE p.letter_id = l.id
    )
  ) AS solutions,
  (
    SELECT json_agg(json_build_object(
      'action', a.action, 'actor', a.actor_id,
      'at', a.occurred_at
    ) ORDER BY a.occurred_at)
    FROM accommodation_letter_audit a
    WHERE a.letter_id = l.id
  ) AS audit_chain
FROM accommodation_letters l
WHERE l.case_id = $1 AND l.deleted_at IS NULL
ORDER BY l.generated_at DESC;
```

## Why a hybrid (relational + JSONB) shape?

- The per-solution rows are queried by counselors and supervisors for
  outcome reporting ("how many requested standing desks were
  approved?", "what was the median actual purchase cost vs. AI
  estimate?"). Relational beats JSON for these.
- The letter body is rendered as one block in the UI and never
  decomposed. `letter_text` stays a single TEXT column for fast
  reads; `letter_json` lets us re-render the structured form (subject
  line, salutation, recipient block) if we change the print template.

## What feeds where

| TypeScript field (`AccommodationLetter`) | Table.column |
|---|---|
| `id` | `accommodation_letters.id` |
| `caseId` | `accommodation_letters.case_id` |
| `clientName`, `jobTitle`, `employerName`, ... | matching cols on the parent row |
| `workplaceProblem`, `natureOfCondition` | matching cols |
| `barrierAnalysis`, `janCitation` | matching cols |
| `zeroCostSolutions[]` | rows in `accommodation_zero_cost_solutions` |
| `paidSolutions[]` | rows in `accommodation_paid_solutions` |
| `paidSolutions[].priceSource` | `paid_solutions.price_source` |
| `paidSolutions[].verifiedAt` | `paid_solutions.verified_at` |
| `paidSolutions[].verifiedSources` | `paid_solutions.verified_sources` |
| `totalPaidLow` / `totalPaidHigh` | `total_paid_low_cents` / `_high_cents` (stored as cents) |
| `letter` (object) | `letter_json` + `letter_text` |
| `generatedByModel` | `generated_by_model` |
| `createdAt`, `updatedAt` | `generated_at`, derived from audit |
