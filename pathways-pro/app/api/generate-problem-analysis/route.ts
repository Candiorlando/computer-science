import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const IncidentSchema = z.object({
  id: z.string(),
  date: z.string(),
  time: z.string().optional(),
  offenders: z.string(),
  description: z.string(),
  impact: z.string(),
  witnesses: z.string().optional(),
  evidence: z.string().optional(),
});

const RequestSchema = z.object({
  clientName: z.string(),
  clientRole: z.string().optional(),
  natureOfCondition: z.string().optional(),
  employerName: z.string(),
  employerLocation: z.string().optional(),
  employerContact: z.string().optional(),
  clientStartDate: z.string().optional(),
  clientEndDate: z.string().optional(),
  incidents: z.array(IncidentSchema).min(1),
});

const SYSTEM_PROMPT = `You are an expert AI Legal Assistant specializing in US
disability rights, vocational services, and employment law. You help workers
with disabilities document discrimination and prepare evidence-ready reports
for attorneys, advocates, and federal civil-rights agencies.

You are NOT counsel of record. Everything you produce is preparation material.

You will receive a structured list of incidents the client has documented,
along with their employer information and (optionally) the nature of their
disability. Your job is to compile a professional "Problem Analysis Report"
the client can hand to an EEOC investigator, an attorney, or a disability
rights advocacy group.

NON-NEGOTIABLE RULES:

1. Use ONLY facts present in the incident log. Do not invent dates,
   names, places, or actions the client did not describe.

2. Voice: third-person, past-tense, neutral clinical-investigator tone.
   "The complainant reports that…" / "On [date], [offender] [action]."
   No editorial adjectives ("egregious," "outrageous"). No legal threats.

3. Tone toward the client: empowering and respectful. The client is
   the source of truth here. Do not second-guess their account.

4. Legal cross-reference: identify which federal statutes appear
   IMPLICATED by the facts as described. Use precise citation form:
     - ADA Title I (42 U.S.C. § 12112) — disability discrimination
       in employment
     - ADA Title II (42 U.S.C. § 12132) — state/local government
       programs
     - ADA Title III (42 U.S.C. § 12182) — public accommodations
     - Section 504 of the Rehabilitation Act (29 U.S.C. § 794) —
       federally-funded programs
     - Section 501 — federal employees
     - Title VII of the Civil Rights Act (where intersectional)
     - State analogs where named in the facts
   For each cited statute, write 2-3 sentences in plain language
   showing WHICH facts in the timeline map to WHICH element of the
   statute. Never opine on outcome — say "appears to implicate" or
   "may support a claim," never "violates" or "proves."

5. Next Steps must be concrete and ordered. Examples: "Preserve every
   email, text, voicemail, and Slack message referenced in this report
   by exporting and storing a copy offline before any contact with the
   employer's IT department," "File an EEOC Charge of Discrimination
   within 180 days of the most recent incident (or 300 days in
   deferral-state jurisdictions)," "Contact your state's Protection &
   Advocacy (P&A) agency for free legal screening."

6. Executive Summary is 3-5 sentences, narrative, neutral. State the
   employer, the role, the alleged pattern, and the count of documented
   incidents. Do not state legal conclusions.

7. Pattern Analysis is 1-2 paragraphs noting if the incidents cluster
   temporally, geographically, or by actor — only if the data shows it.
   If it doesn't, say "no clear pattern emerges from the documented
   incidents," not made-up themes.

Return ONLY valid JSON matching the schema. No prose around it.`;

const RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    executiveSummary: { type: "string" },
    patternAnalysis: { type: "string" },
    legalCrossReference: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          law: { type: "string" },
          analysis: { type: "string" },
        },
        required: ["law", "analysis"],
      },
    },
    nextSteps: {
      type: "array",
      minItems: 3,
      items: { type: "string" },
    },
  },
  required: [
    "executiveSummary",
    "patternAnalysis",
    "legalCrossReference",
    "nextSteps",
  ],
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
  ctx.push(`COMPLAINANT: ${body.clientName}`);
  if (body.clientRole) ctx.push(`ROLE: ${body.clientRole}`);
  if (body.natureOfCondition)
    ctx.push(`NATURE OF CONDITION: ${body.natureOfCondition}`);
  ctx.push(`EMPLOYER: ${body.employerName}`);
  if (body.employerLocation) ctx.push(`EMPLOYER LOCATION: ${body.employerLocation}`);
  if (body.employerContact) ctx.push(`EMPLOYER CONTACT: ${body.employerContact}`);
  if (body.clientStartDate) ctx.push(`EMPLOYMENT START: ${body.clientStartDate}`);
  if (body.clientEndDate)
    ctx.push(`EMPLOYMENT END: ${body.clientEndDate}`);
  ctx.push("\nINCIDENT LOG (chronological):");
  body.incidents.forEach((inc, i) => {
    ctx.push(
      `\n[${i + 1}] Date: ${inc.date}${inc.time ? ` (${inc.time})` : ""}`,
    );
    ctx.push(`   Offender(s): ${inc.offenders}`);
    ctx.push(`   Description: ${inc.description}`);
    ctx.push(`   Impact: ${inc.impact}`);
    if (inc.witnesses) ctx.push(`   Witnesses: ${inc.witnesses}`);
    if (inc.evidence) ctx.push(`   Evidence: ${inc.evidence}`);
  });
  ctx.push(
    "\nCompile a Problem Analysis Report per the schema. JSON only.",
  );

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
