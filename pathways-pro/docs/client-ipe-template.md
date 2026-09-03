<!--
================================================================
CLIENT-FACING IPE — MARKDOWN TEMPLATE
----------------------------------------------------------------
Purpose:
  Render every IPE in a format that is clear, empowering, and
  WCAG 2.1 AA compliant for print/PDF. The clinical-precision
  version (with full clinical scores and regulatory citations)
  lives in /report; this template is what we hand to the client.

Rendering target:
  Markdown -> HTML -> PDF (Puppeteer). The companion stylesheet
  at `pathways-pro/styles/client-ipe.css` sets:
    - font-family: Inter, Roboto, "Open Sans", system-ui
    - base font-size: 14pt; H2: 20pt; H3: 16pt
    - line-height: 1.5 everywhere
    - section padding-block: 24pt
    - callout cards: 1pt border, 6pt radius, 12pt padding, tint bg
    - all text contrast >= 7:1 (AAA where possible)

Variables in [SQUARE BRACKETS] are filled at generation time
by /api/reports/ipe/[caseId]/build.
================================================================
-->

# Your Plan for Employment

<p class="cover-meta">Pathways Pro · Individualized Plan for Employment</p>

<div class="cover-card">

**[Client First Name] [Client Last Initial].**
Case **[Case ID]** · Plan version **[Version]**
Prepared **[Generated Date]** with your counselor, **[Counselor Name]**

</div>

---

## 💼 Your Employment Goal

<div class="callout callout--primary">

### [Employment Goal]

**Plain language:** This is the job we are working toward together. Everything in this plan supports you getting hired into this role.

**Job code:** [O*NET SOC Code] · **Typical entry pathway:** [Job Zone Description]

</div>

## 📅 Your Target Timeline

<div class="callout callout--primary">

### [Timeline Months] months · Goal date: **[Estimated Achievement Date]**

**Plain language:** This is how long we expect the full plan to take from today. Some steps will be faster, some slower — that is normal.

</div>

---

## 🧭 Why This Job Fits You

> **In plain language:** Your interests, strengths, and what you've done before all point toward this kind of work. Here is what we matched.

### What you're interested in

Your Holland Code is **[Holland Code]**, which means you do best in work that is **[Holland Primary Description]**, **[Holland Secondary Description]**, and **[Holland Tertiary Description]**.

### What you bring to this job

- [Transferable Skill 1]
- [Transferable Skill 2]
- [Transferable Skill 3]
- [Transferable Skill 4]

### What the job market looks like

[Labor Market Outlook — 2-3 sentences, plain language, written at grade 8]

<p class="fine-print">
Compliance reference: WIOA Title IV § 102(b)(2)(A) — vocational goal must be consistent with the individual's strengths, resources, priorities, concerns, abilities, capabilities, interests, and informed choice. Full clinical rationale in Appendix A.
</p>

---

## 🧩 What Might Get in the Way (and What We'll Do About It)

> **In plain language:** Everyone has things that make work harder. Here is what we talked about, and how we'll work around each one.

### Things to watch for at work

- [Functional Limitation 1]
- [Functional Limitation 2]
- [Functional Limitation 3]

### Other things we know about

- [Disability Barrier 1]
- [Disability Barrier 2]

### Support that's already in place

- [Existing Support 1]
- [Existing Support 2]

<p class="fine-print">
Compliance reference: WIOA Title IV § 102(b)(2)(B) — IPE must identify the nature and scope of services needed to advance toward the goal. Functional limitations sourced from CVE evaluation and clinical screeners (Appendix B).
</p>

---

## 🛠️ The Services We're Setting Up for You

> **In plain language:** These are the services your state VR program will pay for and arrange. You don't need to figure out how to find them — your counselor will set each one up.

<div class="checklist">

- [ ] [VR Service 1]
- [ ] [VR Service 2]
- [ ] [VR Service 3]
- [ ] [VR Service 4]
- [ ] [VR Service 5]

</div>

### Who delivers each service

| Service | Provider | Setting |
|---|---|---|
| [Service Name 1] | [Provider Name 1] · [Provider Type 1] | [Integrated? Yes/No] |
| [Service Name 2] | [Provider Name 2] · [Provider Type 2] | [Integrated? Yes/No] |
| [Service Name 3] | [Provider Name 3] · [Provider Type 3] | [Integrated? Yes/No] |

<p class="fine-print">
Compliance reference: WIOA Title IV § 102(b)(2)(D) — provider identity and integrated competitive setting must be specified for each service. Provider rate schedules and contract terms in Appendix C.
</p>

---

## 🦾 Tools and Adjustments That Help You

> **In plain language:** These are the changes to your work environment, training setup, or equipment that we'll arrange so you can do the job successfully.

### At your workplace

- [ ] [Workplace Accommodation 1]
- [ ] [Workplace Accommodation 2]
- [ ] [Workplace Accommodation 3]

### During training

- [ ] [Training Accommodation 1]
- [ ] [Training Accommodation 2]

### Assistive technology

- [ ] [Assistive Tech 1]
- [ ] [Assistive Tech 2]

<p class="fine-print">
Job Accommodation Network (JAN) recommendations referenced where applicable. Equipment requests routed through state VR purchasing per agency policy.
</p>

---

## ✅ What You Will Do

> **In plain language:** This is your part of the plan. Each item is something you agreed to do — your counselor will help you with all of them.

<div class="checklist">

- [ ] [Client Responsibility 1]
- [ ] [Client Responsibility 2]
- [ ] [Client Responsibility 3]
- [ ] [Client Responsibility 4]
- [ ] [Client Responsibility 5]

</div>

---

## 🤝 What We Will Do

> **In plain language:** This is what your VR counselor and the agency commit to doing for you.

<div class="checklist">

- [ ] [Agency Responsibility 1]
- [ ] [Agency Responsibility 2]
- [ ] [Agency Responsibility 3]
- [ ] [Agency Responsibility 4]

</div>

---

## 📊 How We'll Know It's Working

> **In plain language:** These are the milestones we'll check at each meeting. When you hit them, we know the plan is on track.

<div class="checklist">

- [ ] [Evaluation Criterion 1]
- [ ] [Evaluation Criterion 2]
- [ ] [Evaluation Criterion 3]

</div>

### Next plan review

**[Review Date]** — we'll sit down together, look at progress, and update anything that needs to change.

<p class="fine-print">
Compliance reference: WIOA Title IV § 102(b)(2)(E) — IPE must include criteria for evaluating progress toward the employment outcome, reviewed at least annually.
</p>

---

## ✍️ Signatures

<div class="signature-block">

**Client:** ____________________________________________
[Client First Name] [Client Last Initial].
Signed on: ____________________________

**Counselor:** ____________________________________________
[Counselor Name], [Counselor Credentials]
Signed on: ____________________________

</div>

<p class="fine-print">
Electronic signatures captured in Pathways Pro are bound to authenticated session, timestamp (UTC), and originating IP, in accordance with E-SIGN Act (15 U.S.C. § 7001). Signature audit trail available on request.
</p>

---

<div class="appendix">

## Appendix A — Clinical & Vocational Detail

**Holland (RIASEC) interest scores:** R [R Score] · I [I Score] · A [A Score] · S [S Score] · E [E Score] · C [C Score]
**Big Five (Mini-IPIP):** O [O Score] · C [C Score] · E [E Score] · A [A Score] · N [N Score]
**O*NET-SOC code:** [O*NET SOC Code] · **Job Zone:** [Job Zone] · **Median wage band:** [Wage Band]

### Clinical screeners on file

| Instrument | Score | Severity band | Administered |
|---|---|---|---|
| GAD-7 | [GAD-7 Score] / 21 | [GAD-7 Band] | [GAD-7 Date] |
| PHQ-9 | [PHQ-9 Score] / 27 | [PHQ-9 Band] | [PHQ-9 Date] |
| WHODAS-2 | [WHODAS Score] | [WHODAS Band] | [WHODAS Date] |

### Vocational rationale (clinical narrative)

[Goal Rationale — full counselor / CVE clinical justification, retained verbatim for the file copy.]

---

## Appendix B — Functional Limitation Sources

[Functional Limitation Sources — per-item provenance: CVE work-sample evaluation, TSA result, screener result, counselor observation, client self-report.]

---

## Appendix C — Provider Authorizations

[Provider Authorizations — service code, provider, contract reference, rate, start/end dates, authorizing counselor.]

---

## Appendix D — Compliance References

This plan is authorized under the **Workforce Innovation and Opportunity Act (WIOA), Title IV, § 102(b)** — Individualized Plan for Employment. Specific subsection references appear in fine print throughout the document above.

State VR agency: **[State Agency Name]**
RSA-911 case identifier: **[RSA-911 Case ID]**

</div>

<!--
================================================================
END TEMPLATE
================================================================
Renderer notes (Puppeteer + print stylesheet):
  - Running header (each page after page 1):
      "[Case ID] · [Client First] [Client Last Initial]. · IPE v[Version]"
  - Running footer (every page):
      "Generated [ISO timestamp] · Authorized under WIOA Title IV § 102(b) · Page X of Y"
  - Page-break-before on every H2 except the first two callouts.
  - Appendix renders at smaller font (11pt) on tinted background.
  - Checklists render with empty squares for hand-marking on paper
    copies; on screen they are interactive checkbox inputs.
  - All emoji icons have an aria-label sibling in the HTML pass so
    screen readers announce "Briefcase: Your Employment Goal" etc.
================================================================
-->
