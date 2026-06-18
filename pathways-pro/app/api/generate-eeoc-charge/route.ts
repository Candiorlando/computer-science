import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RequestSchema = z.object({
  clientName: z.string(),
  clientAddress: z.string(),
  clientPhone: z.string(),
  clientEmail: z.string(),
  employerName: z.string(),
  employerAddress: z.string(),
  employerCity: z.string(),
  employerState: z.string(),
  employerZip: z.string(),
  employerPhone: z.string().optional(),
  employerEmployees: z.string(),
  basesOfDiscrimination: z.array(z.string()).min(1),
  earliestDate: z.string(),
  latestDate: z.string(),
  continuingAction: z.boolean(),
  briefStatement: z.string().min(20),
});

const SYSTEM_PROMPT = `You are an expert AI Legal Assistant drafting an EEOC
Charge of Discrimination on behalf of a worker who believes they were
discriminated against. The "Particulars" section of EEOC Form 5 is what
you are drafting — a clear, factual, first-person narrative.

NON-NEGOTIABLE RULES:

1. Use ONLY facts in the client's brief statement plus the metadata
   they provided (dates, employer info, bases). Do not invent.

2. Voice: first-person ("I"), past-tense, factual, neutral. No
   adjectives, no editorializing. The EEOC investigator wants facts,
   not adjectives.

3. Structure of the Particulars narrative (~250-450 words):
   I. Personal info: my role at the respondent, my dates of employment.
   II. Protected basis: I am a person with a disability (or other
       basis the client cited). Brief statement of how the employer
       knew (e.g., "I disclosed at hire," "I requested accommodation
       on [date]").
   III. The adverse action: dates, what happened, who did it.
   IV. Comparators / pretext signals if the client mentioned any.
   V. Damages: economic, emotional, loss of advancement, etc., only
       if the client referenced them.
   VI. Closing line: "I believe I have been discriminated against
       because of [bases], in violation of [statute(s)]."

4. Cite the correct statute for each basis:
   - Disability → ADA Title I (42 U.S.C. § 12112) and Rehabilitation
     Act § 501/§ 504 if federal employer / federally funded
   - Race / Color / Religion / Sex / National Origin → Title VII
   - Age (40+) → ADEA (29 U.S.C. § 623)
   - Genetic Information → GINA
   - Retaliation → respective statute's anti-retaliation provision
   - Equal Pay → Equal Pay Act (29 U.S.C. § 206(d))

5. Legal Analysis: a separate 1-paragraph plain-English explanation
   for the client of what the EEOC will look at next. Mention:
   - the prima facie elements they will assess for each basis
   - the 180/300-day filing window
   - the right-to-sue letter pathway

6. Recommended Next Steps: ordered, concrete actions. Include
   evidence preservation, EEOC submission method (online portal at
   publicportal.eeoc.gov), state FEPA cross-filing option, and
   consultation with an employment-law attorney.

Return ONLY valid JSON matching the schema. No prose around it.`;

const RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    formalParticulars: { type: "string" },
    legalAnalysis: { type: "string" },
    recommendedNextSteps: {
      type: "array",
      minItems: 3,
      items: { type: "string" },
    },
  },
  required: ["formalParticulars", "legalAnalysis", "recommendedNextSteps"],
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
  ctx.push(`Address: ${body.clientAddress}`);
  ctx.push(`Phone: ${body.clientPhone} · Email: ${body.clientEmail}`);
  ctx.push(`\nRESPONDENT (employer): ${body.employerName}`);
  ctx.push(
    `Address: ${body.employerAddress}, ${body.employerCity}, ${body.employerState} ${body.employerZip}`,
  );
  if (body.employerPhone) ctx.push(`Phone: ${body.employerPhone}`);
  ctx.push(`Employee count: ${body.employerEmployees}`);
  ctx.push(`\nBASES OF DISCRIMINATION: ${body.basesOfDiscrimination.join(", ")}`);
  ctx.push(`Earliest date: ${body.earliestDate}`);
  ctx.push(`Latest date: ${body.latestDate}`);
  ctx.push(`Continuing action: ${body.continuingAction ? "Yes" : "No"}`);
  ctx.push(`\nCLIENT'S NARRATIVE:\n${body.briefStatement}`);
  ctx.push("\nDraft the EEOC Charge Particulars per the schema. JSON only.");

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
