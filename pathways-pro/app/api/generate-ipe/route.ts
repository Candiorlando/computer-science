import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RequestSchema = z.object({
  clientName: z.string(),
  dob: z.string(),
  primaryDisability: z.string(),
  secondaryConditions: z.string().optional(),
  employmentGoal: z.string(),
  goalSocCode: z.string().optional(),
  workHistory: z.string().optional(),
  educationLevel: z.string().optional(),
  expectedWage: z.string().optional(),
  expectedOutlook: z.string().optional(),
});

const SYSTEM_PROMPT = `You are a senior Certified Rehabilitation Counselor (CRC)
helping draft an Individualized Plan for Employment (IPE) under WIOA Title IV
§ 102(b). You produce concrete, plan-ready language that the counselor will
review and edit. Your draft is informational — the counselor makes all final
clinical and authorization decisions.

When drafting, you ground every section in:
- The client's specific primary disability and any secondary conditions
- Recognized functional limitations associated with the disability
- The employment goal and its O*NET/BLS context
- Best practices from the Job Accommodation Network (askjan.org), ADA Title I,
  and CRCC ethics

Be specific. "Reasonable accommodations" is not enough — name the actual
accommodation (e.g. "Text-to-speech screen reader (JAWS or NVDA) on all
work-issued computers"). "Counseling services" is not enough — name the
modality and frequency (e.g. "Weekly 50-minute CBT sessions for 12 weeks").

Hard rules:
- Do NOT recommend specific medications, dosages, or medical treatments
- Do NOT determine SSDI/SSI benefits eligibility
- Do NOT make diagnoses — work from the disability the counselor provided
- If something requires a physician's certification, say so explicitly
- Cite AskJAN (askjan.org) for any workplace accommodation
- Cite the ADA National Network (adata.org) for legal rights

Return ONLY valid JSON matching the requested schema. No prose around it.`;

const IPE_SCHEMA = {
  type: "object",
  properties: {
    functionalLimitations: {
      type: "array",
      items: { type: "string" },
      description: "3-6 specific functional limitations from the disability, e.g. 'Sustained attention beyond 30 minutes', 'Lifting > 25 lbs', 'Reading print text < 14pt'",
    },
    goalRationale: {
      type: "string",
      description: "2-3 sentences explaining why this employment goal fits the client's strengths, interests, and accommodation needs",
    },
    vrServices: {
      type: "array",
      items: { type: "string" },
      description: "Specific VR services authorized — e.g. 'Vocational training in [program] at [provider]', 'Job coaching 4 hrs/week × 90 days post-placement', 'Adaptive equipment evaluation by certified ATP'",
    },
    accommodations: {
      type: "object",
      properties: {
        workplace: {
          type: "array",
          items: { type: "string" },
          description: "Concrete workplace accommodations — cite AskJAN where appropriate",
        },
        training: {
          type: "array",
          items: { type: "string" },
          description: "Education / training accommodations (e.g. extended time, note-taking support, accessible materials)",
        },
        assistiveTech: {
          type: "array",
          items: { type: "string" },
          description: "Specific AT recommendations — name the product category and a 1-2 example products",
        },
      },
      required: ["workplace", "training", "assistiveTech"],
    },
    disabilityBarriers: {
      type: "array",
      items: { type: "string" },
      description: "3-5 specific barriers between the client and the employment goal, framed factually",
    },
    supports: {
      type: "array",
      items: { type: "string" },
      description: "Natural supports and resources the client can leverage (family, mentors, community programs)",
    },
    timelineMonths: {
      type: "integer",
      description: "Realistic time-to-employment in months given training requirements and accommodation needs",
    },
  },
  required: [
    "functionalLimitations",
    "goalRationale",
    "vrServices",
    "accommodations",
    "disabilityBarriers",
    "supports",
    "timelineMonths",
  ],
};

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({
        error: "ANTHROPIC_API_KEY not set in Vercel environment variables.",
      }),
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

  const client = new Anthropic();

  const userPrompt = `Draft the auto-fill portions of an IPE for the following client.

CLIENT
- Name: ${body.clientName}
- DOB: ${body.dob}
- Primary disability: ${body.primaryDisability}
${body.secondaryConditions ? `- Secondary conditions: ${body.secondaryConditions}` : ""}
${body.educationLevel ? `- Education: ${body.educationLevel}` : ""}
${body.workHistory ? `- Work history: ${body.workHistory}` : ""}

EMPLOYMENT GOAL
- Target occupation: ${body.employmentGoal}
${body.goalSocCode ? `- O*NET-SOC: ${body.goalSocCode}` : ""}
${body.expectedWage ? `- Median wage band: ${body.expectedWage}` : ""}
${body.expectedOutlook ? `- Job outlook: ${body.expectedOutlook}` : ""}

Return the JSON only.`;

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
        format: { type: "json_schema", schema: IPE_SCHEMA as unknown as Record<string, unknown> },
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
    return new Response(
      JSON.stringify({ error: "No text response from model." }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  try {
    const parsed = JSON.parse(textBlock.text);
    return new Response(JSON.stringify(parsed), {
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(
      JSON.stringify({
        error: "Model response was not valid JSON.",
        raw: textBlock.text,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
