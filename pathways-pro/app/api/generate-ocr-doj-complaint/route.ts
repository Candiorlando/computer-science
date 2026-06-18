import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RequestSchema = z.object({
  agency: z.enum(["OCR-ED", "OCR-HHS", "DOJ-DRS"]),
  clientName: z.string(),
  clientAddress: z.string(),
  clientPhone: z.string(),
  clientEmail: z.string(),
  respondentName: z.string(),
  respondentType: z.string(),
  respondentAddress: z.string(),
  respondentContact: z.string().optional(),
  whatHappened: z.string().min(20),
  whenHappened: z.string(),
  rightsViolated: z.array(z.string()).min(1),
  priorComplaints: z.string().optional(),
});

const SYSTEM_PROMPT = `You are an expert AI Legal Assistant drafting a civil
rights complaint for submission to one of:
  - OCR-ED  : Department of Education, Office for Civil Rights
              (public schools, K-12, higher education recipients)
  - OCR-HHS : Department of Health and Human Services, Office for
              Civil Rights (healthcare providers, social-services
              recipients of federal funding)
  - DOJ-DRS : Department of Justice, Civil Rights Division,
              Disability Rights Section (state/local governments,
              public accommodations, ADA Title II and III)

NON-NEGOTIABLE RULES:

1. Use ONLY facts the client provided. Do not invent dates, names,
   or actions.

2. Voice: first-person ("I"), factual, neutral, respectful. Federal
   civil-rights investigators read these by the thousand — clarity
   wins over rhetoric every time.

3. Format the Formal Complaint as a complete letter-style document
   with these sections in order:
     a) Date line
     b) Recipient line scoped to the chosen agency
     c) "Re: Complaint of Disability Discrimination — [respondent]"
     d) Opening: who I am, who the respondent is, that I am filing
        a formal complaint
     e) Background: my disability (general terms only, no detailed
        diagnosis disclosure unless the client supplied it)
     f) Allegations: numbered list of every fact-claim, each a single
        complete sentence
     g) Cited statutes / regulations the facts implicate
     h) Remedies sought
     i) Statement of cooperation: I will provide any documentation
        requested and am available for follow-up
     j) Signature block

4. Cite the right statutes by agency:
   - OCR-ED  : Section 504 of the Rehabilitation Act of 1973
               (34 C.F.R. Part 104); ADA Title II if state/local
               public school; IDEA only if K-12 special-education
               context applies.
   - OCR-HHS : Section 504 (45 C.F.R. Part 84); ADA Title II if
               state/local public; ACA Section 1557 if healthcare
               financing applies.
   - DOJ-DRS : ADA Title II (28 C.F.R. Part 35) for state/local
               government; ADA Title III (28 C.F.R. Part 36) for
               public accommodations; Section 504 if federal funds.

5. Remedies Sought is a separate list of 3-6 items. Concrete only:
   "policy change [specific]," "training of [staff]," "compensatory
   services for the [N] sessions missed," "monitoring agreement,"
   "individual relief (specify)." No money damages — OCR/DOJ
   investigations are non-monetary.

6. Legal Basis is a 1-paragraph plain-English explanation of why the
   facts implicate the cited statute(s), citing the specific subsection
   the facts most directly touch. Never opine on outcome.

Return ONLY valid JSON matching the schema. No prose around it.`;

const RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    formalComplaint: { type: "string" },
    legalBasis: { type: "string" },
    remediesSought: {
      type: "array",
      items: { type: "string" },
      description: "3-6 specific, non-monetary remedies sought.",
    },
  },
  required: ["formalComplaint", "legalBasis", "remediesSought"],
};

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return jsonError("ANTHROPIC_API_KEY not set in Vercel.", 500);
  }
  let body: z.infer<typeof RequestSchema>;
  try {
    body = RequestSchema.parse(await req.json());
  } catch {
    return jsonError("Invalid request body.", 400);
  }

  const ctx: string[] = [];
  ctx.push(`AGENCY: ${body.agency}`);
  ctx.push(`COMPLAINANT: ${body.clientName}`);
  ctx.push(`Address: ${body.clientAddress}`);
  ctx.push(`Phone: ${body.clientPhone} · Email: ${body.clientEmail}`);
  ctx.push(`\nRESPONDENT: ${body.respondentName}`);
  ctx.push(`Type: ${body.respondentType}`);
  ctx.push(`Address: ${body.respondentAddress}`);
  if (body.respondentContact) ctx.push(`Contact: ${body.respondentContact}`);
  ctx.push(`\nRIGHTS ALLEGEDLY VIOLATED: ${body.rightsViolated.join(", ")}`);
  ctx.push(`When it happened: ${body.whenHappened}`);
  ctx.push(`\nWHAT HAPPENED:\n${body.whatHappened}`);
  if (body.priorComplaints)
    ctx.push(`\nPRIOR FILINGS / APPEALS: ${body.priorComplaints}`);
  ctx.push(`\nToday's date: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`);
  ctx.push("\nDraft the formal civil rights complaint per the schema. JSON only.");

  const client = new Anthropic();
  let response;
  try {
    response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 4096,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      thinking: { type: "adaptive" },
      output_config: {
        format: {
          type: "json_schema",
          schema: RESPONSE_SCHEMA as unknown as Record<string, unknown>,
        },
      },
      messages: [{ role: "user", content: ctx.join("\n") }],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const status =
      err && typeof err === "object" && "status" in err
        ? (err as { status?: number }).status ?? 500
        : 500;
    return jsonError(`Anthropic API error (${status}): ${message}`, 500);
  }

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    return jsonError("No text response.", 500);
  }
  try {
    return new Response(JSON.stringify(JSON.parse(textBlock.text)), {
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return jsonError("Model response was not valid JSON.", 500);
  }
}

function jsonError(error: string, status: number) {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
