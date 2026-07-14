import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ─── Request schema (all source data the counselor gives Claude) ──────
const RequestSchema = z.object({
  clientName: z.string(),
  caseId: z.string(),
  clientDob: z.string().optional(),
  counselorName: z.string().optional(),
  isTransitionYouth: z.boolean().optional(),

  intake: z
    .object({
      age: z.string().optional(),
      location: z.string().optional(),
      educationLevel: z.string().optional(),
      workHistory: z.string().optional(),
      constraints: z.string().optional(),
      goals: z.string().optional(),
    })
    .partial()
    .optional(),

  bigFive: z
    .object({ E: z.number(), A: z.number(), C: z.number(), N: z.number(), O: z.number() })
    .optional(),
  riasec: z
    .object({ R: z.number(), I: z.number(), A: z.number(), S: z.number(), E: z.number(), C: z.number() })
    .optional(),
  hollandCode: z.string().optional(),

  topMatches: z
    .array(
      z.object({
        title: z.string(),
        socCode: z.string(),
        fit: z.number(),
      }),
    )
    .optional(),

  tsa: z
    .object({
      coreSkills: z.array(
        z.object({
          skill: z.string(),
          category: z.string(),
          evidence: z.string(),
        }),
      ),
      occupationsToConsider: z
        .array(z.object({ title: z.string(), whyItFits: z.string() }))
        .optional(),
      gapsToAddress: z.array(z.string()).optional(),
    })
    .optional(),

  ipe: z
    .object({
      primaryDisability: z.string().optional(),
      secondaryConditions: z.string().optional(),
      functionalLimitations: z.array(z.string()).optional(),
      employmentGoal: z.string().optional(),
      goalSocCode: z.string().optional(),
      goalRationale: z.string().optional(),
      expectedWage: z.string().optional(),
      expectedOutlook: z.string().optional(),
      vrServices: z.array(z.string()).optional(),
      accommodations: z
        .object({
          workplace: z.array(z.string()),
          training: z.array(z.string()),
          assistiveTech: z.array(z.string()),
        })
        .optional(),
      disabilityBarriers: z.array(z.string()).optional(),
      supports: z.array(z.string()).optional(),
      timelineMonths: z.number().optional(),
    })
    .optional(),

  screenerResults: z
    .array(
      z.object({
        acronym: z.string(),
        domain: z.string(),
        totalScore: z.number(),
        maxScore: z.number(),
        bandLabel: z.string(),
        bandGuidance: z.string(),
      }),
    )
    .optional(),
});

// ─── System prompt — verbatim CRC clinical voice ──────────────────────
const SYSTEM_PROMPT = `Role & Objective:
Act as a Master-Level Certified Rehabilitation Counselor (CRC). Your
objective is to synthesize the provided raw client data, medical records,
and vocational assessments into a comprehensive, formal, and highly
structured Individualized Plan for Employment (IPE) report — or IEP if
transition youth.

Tone & Style:
The report must be written in a clinical, objective, and person-centered
tone. It must adhere strictly to WIOA Title IV mandates and ethical CRCC
standards. Do NOT invent or hallucinate any medical conditions, barriers,
or scores that are not explicitly present in the provided data. If a piece
of information is missing, name the gap rather than fabricating content.

Required Output Structure:
Return ONLY valid JSON matching the requested schema. Each section must be
populated from the provided data using person-first language, neutral
clinical voice, and citations to WIOA / JAN / ADA / BLS / O*NET only where
the source material warrants it.

Section guidance:
1. clientProfile — Brief narrative paragraph (3-6 sentences) summarizing
   employment history, educational background, and current living
   situation. Person-first.
2. disabilityAndFunctionalLimitations — Synthesize medical and
   psychological data. Identify primary and any secondary diagnosis as
   given in source. List specific functional limitations (mobility,
   cognitive stamina, interpersonal skills, etc.) as discrete bullets.
   The impedimentNarrative explains how those limitations create a
   substantial impediment to employment.
3. vocationalAssessmentSummary — Summarize assessment results.
   Transferable skills, aptitudes, identified career interests. The
   summaryNarrative draws plain-language conclusions from the numbers.
4. proposedEmploymentGoal — Specific, competitive, integrated employment
   goal. Include O*NET SOC code. Justify why this goal is suitable given
   the client's limitations and (where source data supports it) local
   labor-market context from BLS OOH.
5. barrierMitigationAndServices — Specific VR services required. Three
   buckets: (a) assistiveTechAndAccommodations citing JAN guidelines where
   appropriate, (b) placementServices including supported employment,
   (c) trainingAndEducation.
6. clientResponsibilitiesAndMilestones — Three time horizons (Immediate
   0–30 days, Short-term 1–6 months, Long-term 6+ months) with actionable
   steps the client must take to maintain momentum.

Hard rules:
- Do not invent diagnoses, scores, medications, or services not in source data.
- Do not promise specific salaries, hiring outcomes, or program acceptance.
- Use person-first language ("a client with depression," not "depressed client").
- Cite AskJAN (askjan.org), ADA Title I, and BLS OOH only where supported.
- If transition-age (≤21) and isTransitionYouth is true, frame as joint IEP/IPE.`;

// ─── Output JSON schema (Anthropic structured outputs) ─────────────────
const CLINICAL_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    clientProfile: {
      type: "string",
      description:
        "Brief narrative summary of the client's employment history, educational background, and current living situation. 3-6 sentences, person-first.",
    },
    disabilityAndFunctionalLimitations: {
      type: "object",
      additionalProperties: false,
      properties: {
        primaryDisability: { type: "string" },
        secondaryConditions: {
          type: "string",
          description: "Empty string if none reported in source data",
        },
        functionalLimitations: {
          type: "array",
          items: { type: "string" },
          description: "Discrete, specific limitations (e.g. 'Cannot lift > 25 lbs', 'Reading print < 14pt')",
        },
        impedimentNarrative: {
          type: "string",
          description:
            "How these limitations create a substantial impediment to employment. 2-4 sentences.",
        },
      },
      required: [
        "primaryDisability",
        "secondaryConditions",
        "functionalLimitations",
        "impedimentNarrative",
      ],
    },
    vocationalAssessmentSummary: {
      type: "object",
      additionalProperties: false,
      properties: {
        transferableSkills: {
          type: "array",
          items: { type: "string" },
        },
        aptitudes: {
          type: "array",
          items: { type: "string" },
        },
        careerInterests: {
          type: "array",
          items: { type: "string" },
          description: "Holland code dimensions or specific interest areas",
        },
        summaryNarrative: {
          type: "string",
          description: "Plain-language conclusions drawn from the assessments",
        },
      },
      required: [
        "transferableSkills",
        "aptitudes",
        "careerInterests",
        "summaryNarrative",
      ],
    },
    proposedEmploymentGoal: {
      type: "object",
      additionalProperties: false,
      properties: {
        goal: { type: "string" },
        socCode: { type: "string", description: "O*NET-SOC code, e.g. 15-1252.00" },
        justification: {
          type: "string",
          description:
            "Why this goal fits given client's limitations and labor-market context. 3-5 sentences.",
        },
      },
      required: ["goal", "socCode", "justification"],
    },
    barrierMitigationAndServices: {
      type: "object",
      additionalProperties: false,
      properties: {
        assistiveTechAndAccommodations: {
          type: "array",
          items: { type: "string" },
          description: "Specific AT and workplace accommodations, cite AskJAN where relevant",
        },
        placementServices: {
          type: "array",
          items: { type: "string" },
          description: "Job placement, job coaching, supported employment, follow-along",
        },
        trainingAndEducation: {
          type: "array",
          items: { type: "string" },
          description: "Specific training programs, certifications, or degree paths",
        },
      },
      required: [
        "assistiveTechAndAccommodations",
        "placementServices",
        "trainingAndEducation",
      ],
    },
    clientResponsibilitiesAndMilestones: {
      type: "object",
      additionalProperties: false,
      properties: {
        immediateActions: {
          type: "array",
          items: { type: "string" },
          description: "0-30 days. Concrete actions client must take.",
        },
        shortTermMilestones: {
          type: "array",
          items: { type: "string" },
          description: "1-6 months. Measurable interim milestones.",
        },
        longTermMilestones: {
          type: "array",
          items: { type: "string" },
          description: "6+ months. Employment outcome targets.",
        },
      },
      required: [
        "immediateActions",
        "shortTermMilestones",
        "longTermMilestones",
      ],
    },
  },
  required: [
    "clientProfile",
    "disabilityAndFunctionalLimitations",
    "vocationalAssessmentSummary",
    "proposedEmploymentGoal",
    "barrierMitigationAndServices",
    "clientResponsibilitiesAndMilestones",
  ],
};

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY not set in Vercel." }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  let body: z.infer<typeof RequestSchema>;
  try {
    body = RequestSchema.parse(await req.json());
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // ─── Build the input data section the prompt asks for ──────────────
  const sections: string[] = [];

  sections.push(`CLIENT DEMOGRAPHICS & HISTORY`);
  sections.push(`- Name: ${body.clientName}`);
  sections.push(`- Case ID: ${body.caseId}`);
  if (body.clientDob) sections.push(`- DOB: ${body.clientDob}`);
  if (body.counselorName) sections.push(`- Counselor of record: ${body.counselorName}`);
  if (body.isTransitionYouth)
    sections.push(`- Status: Transition-age youth (≤21) — frame as joint IEP/IPE`);
  if (body.intake) {
    if (body.intake.age) sections.push(`- Age: ${body.intake.age}`);
    if (body.intake.location) sections.push(`- Location: ${body.intake.location}`);
    if (body.intake.educationLevel)
      sections.push(`- Education: ${body.intake.educationLevel}`);
    if (body.intake.workHistory)
      sections.push(`- Work history: ${body.intake.workHistory}`);
    if (body.intake.constraints)
      sections.push(`- Constraints / living situation: ${body.intake.constraints}`);
    if (body.intake.goals)
      sections.push(`- Client-stated goals: ${body.intake.goals}`);
  }

  sections.push(``);
  sections.push(`MEDICAL/PSYCHOLOGICAL ASSESSMENTS`);
  if (body.ipe?.primaryDisability) {
    sections.push(`- Primary disability of record: ${body.ipe.primaryDisability}`);
  } else {
    sections.push(`- Primary disability: not provided`);
  }
  if (body.ipe?.secondaryConditions) {
    sections.push(`- Secondary conditions: ${body.ipe.secondaryConditions}`);
  }
  if (body.ipe?.functionalLimitations && body.ipe.functionalLimitations.length > 0) {
    sections.push(`- Functional limitations on file:`);
    body.ipe.functionalLimitations.forEach((f) => sections.push(`  • ${f}`));
  }
  if (body.screenerResults && body.screenerResults.length > 0) {
    sections.push(`- Clinical screener results:`);
    body.screenerResults.forEach((r) => {
      sections.push(
        `  • ${r.acronym} (${r.domain}): ${r.totalScore}/${r.maxScore} → ${r.bandLabel}. Guidance: ${r.bandGuidance}`,
      );
    });
  }

  sections.push(``);
  sections.push(`VOCATIONAL/APTITUDE ASSESSMENTS`);
  if (body.hollandCode) sections.push(`- Holland code: ${body.hollandCode}`);
  if (body.riasec) {
    const r = body.riasec;
    sections.push(
      `- RIASEC scores (0-100): R=${r.R}, I=${r.I}, A=${r.A}, S=${r.S}, E=${r.E}, C=${r.C}`,
    );
  }
  if (body.bigFive) {
    const b = body.bigFive;
    sections.push(
      `- Big Five (Mini-IPIP, 0-100): Openness=${b.O}, Conscientiousness=${b.C}, Extraversion=${b.E}, Agreeableness=${b.A}, Neuroticism=${b.N}`,
    );
  }
  if (body.topMatches && body.topMatches.length > 0) {
    sections.push(`- Top occupational matches (RIASEC fit ranking):`);
    body.topMatches.slice(0, 8).forEach((m) => {
      sections.push(`  • ${m.title} (O*NET ${m.socCode}) — ${m.fit}% fit`);
    });
  }
  if (body.tsa) {
    sections.push(`- Transferable Skills Analysis core findings:`);
    body.tsa.coreSkills.forEach((s) => {
      sections.push(`  • ${s.skill} [${s.category}] — Evidence: ${s.evidence}`);
    });
    if (body.tsa.occupationsToConsider && body.tsa.occupationsToConsider.length > 0) {
      sections.push(`- TSA-suggested occupations:`);
      body.tsa.occupationsToConsider.forEach((o) =>
        sections.push(`  • ${o.title} — ${o.whyItFits}`),
      );
    }
    if (body.tsa.gapsToAddress && body.tsa.gapsToAddress.length > 0) {
      sections.push(`- Identified skill gaps:`);
      body.tsa.gapsToAddress.forEach((g) => sections.push(`  • ${g}`));
    }
  }

  sections.push(``);
  sections.push(`COUNSELOR OBSERVATIONS (from existing IPE plan)`);
  if (body.ipe?.employmentGoal) {
    sections.push(`- Counselor-proposed employment goal: ${body.ipe.employmentGoal}`);
    if (body.ipe.goalSocCode) sections.push(`  SOC: ${body.ipe.goalSocCode}`);
    if (body.ipe.goalRationale)
      sections.push(`  Rationale: ${body.ipe.goalRationale}`);
    if (body.ipe.expectedWage)
      sections.push(`  Expected wage (BLS): ${body.ipe.expectedWage}`);
    if (body.ipe.expectedOutlook)
      sections.push(`  Outlook (BLS OOH): ${body.ipe.expectedOutlook}`);
    if (body.ipe.timelineMonths)
      sections.push(`  Counselor timeline estimate: ${body.ipe.timelineMonths} months`);
  }
  if (body.ipe?.vrServices && body.ipe.vrServices.length > 0) {
    sections.push(`- VR services already authorized:`);
    body.ipe.vrServices.forEach((s) => sections.push(`  • ${s}`));
  }
  if (body.ipe?.accommodations) {
    const acc = body.ipe.accommodations;
    if (acc.workplace.length > 0) {
      sections.push(`- Workplace accommodations identified:`);
      acc.workplace.forEach((a) => sections.push(`  • ${a}`));
    }
    if (acc.training.length > 0) {
      sections.push(`- Training accommodations identified:`);
      acc.training.forEach((a) => sections.push(`  • ${a}`));
    }
    if (acc.assistiveTech.length > 0) {
      sections.push(`- Assistive technology identified:`);
      acc.assistiveTech.forEach((a) => sections.push(`  • ${a}`));
    }
  }
  if (body.ipe?.disabilityBarriers && body.ipe.disabilityBarriers.length > 0) {
    sections.push(`- Disability-related barriers on file:`);
    body.ipe.disabilityBarriers.forEach((b) => sections.push(`  • ${b}`));
  }
  if (body.ipe?.supports && body.ipe.supports.length > 0) {
    sections.push(`- Natural supports:`);
    body.ipe.supports.forEach((s) => sections.push(`  • ${s}`));
  }

  const userPrompt =
    sections.join("\n") +
    `\n\nUsing the input data above ONLY, synthesize the formal Clinical IPE Report. Return ONLY the JSON object matching the schema. No prose around it.`;

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
          schema: CLINICAL_SCHEMA as unknown as Record<string, unknown>,
        },
      },
      messages: [{ role: "user", content: userPrompt }],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const status =
      err && typeof err === "object" && "status" in err
        ? (err as { status?: number }).status ?? 500
        : 500;
    return new Response(
      JSON.stringify({ error: `Anthropic API error (${status}): ${message}` }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    return new Response(JSON.stringify({ error: "No text response." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    return new Response(JSON.stringify(JSON.parse(textBlock.text)), {
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(
      JSON.stringify({ error: "Model response was not valid JSON.", raw: textBlock.text }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
