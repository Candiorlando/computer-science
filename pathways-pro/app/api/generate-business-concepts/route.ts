import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RequestSchema = z.object({
  clientName: z.string(),
  hollandCode: z.string().optional(),
  topRiasec: z.array(z.string()).optional(),
  transferableSkills: z.array(z.string()).optional(),
  dreamJob: z.string().optional(),
  employmentGoal: z.string().optional(),
  constraints: z.string().optional(),
  schedulePreference: z.string().optional(),
  educationLevel: z.string().optional(),
  zipCode: z.string().optional(),
  natureOfCondition: z.string().optional(),
});

const SYSTEM_PROMPT = `You are an expert AI Vocational Rehabilitation Counselor
specializing in self-employment for people with disabilities. You pitch
realistic small-business concepts a state VR program would approve as a
self-employment outcome under WIOA Title IV.

NON-NEGOTIABLE RULES:

1. Pitch EXACTLY THREE distinct business concepts. Make them genuinely
   different from each other — different industry, different operating
   model, different startup-cost band. Don't pitch three flavors of the
   same idea.

2. Each concept MUST be defensible against the client's profile data.
   In whyItFits, name the specific RIASEC letters, transferable skills,
   or intake answers that support the match. Vague pitches ("you'd be
   great at this") get rejected.

3. Be realistic about startup costs and time-to-revenue. State VR
   self-employment plans typically authorize $5,000–$25,000 in startup
   support; don't pitch a concept that needs $200k seed capital unless
   the client's profile clearly supports investor-grade entrepreneurship.

4. Accommodation-aware design: for each concept, list specific
   accommodation considerations (sensory load, stamina, schedule
   flexibility, social load) AND name any assistive technology the
   client would need to actually operate the business. Treat AT as a
   line-item, not an afterthought — VR can fund this directly.

5. Honest about risk. Each concept gets a low/moderate/higher risk
   level with 1-3 specific risk factors AND 1-3 red flags (signals
   that mean abandon this concept). A pitched concept without red
   flags is a sales pitch, not counseling.

6. Concrete early wins: 3 specific things the client can do THIS
   WEEK to validate the concept before spending money — talk to N
   potential customers, run a $50 ad test, post a service offer in
   a local Facebook group.

7. Scale ceiling: be honest. "side-income" means $500-$2,000/month
   supplemental, "full-time" means $40,000-$120,000 annual owner
   income, "team" means hiring employees. Most VR self-employment
   plans target full-time.

8. rationaleNarrative: 2-3 sentences explaining why THESE three
   specifically vs. any other ideas. Reference the profile evidence
   that drove the cluster.

9. generalCautions: 3-5 items every VR self-employment client
   should hear (timeline expectations, state VR business plan review
   requirements, intersection with SSDI/SSI work credits, etc.).

Return ONLY valid JSON matching the schema. No prose around it.`;

const RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    concepts: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          name: { type: "string" },
          tagline: { type: "string" },
          whatItIs: { type: "string" },
          whyItFits: { type: "string" },
          startupCostsLow: { type: "number" },
          startupCostsHigh: { type: "number" },
          monthlyOperatingLow: { type: "number" },
          monthlyOperatingHigh: { type: "number" },
          timeToFirstRevenueMonths: { type: "number" },
          scaleCeiling: {
            type: "string",
            enum: ["side-income", "full-time", "team"],
          },
          accommodationConsiderations: {
            type: "array",
            items: { type: "string" },
          },
          assistiveTechNeeded: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                item: { type: "string" },
                estimatedCost: { type: "number" },
              },
              required: ["item", "estimatedCost"],
            },
          },
          riskLevel: {
            type: "string",
            enum: ["low", "moderate", "higher"],
          },
          riskFactors: { type: "array", items: { type: "string" } },
          earlyWins: { type: "array", items: { type: "string" } },
          redFlags: { type: "array", items: { type: "string" } },
        },
        required: [
          "name",
          "tagline",
          "whatItIs",
          "whyItFits",
          "startupCostsLow",
          "startupCostsHigh",
          "monthlyOperatingLow",
          "monthlyOperatingHigh",
          "timeToFirstRevenueMonths",
          "scaleCeiling",
          "accommodationConsiderations",
          "assistiveTechNeeded",
          "riskLevel",
          "riskFactors",
          "earlyWins",
          "redFlags",
        ],
      },
    },
    rationaleNarrative: { type: "string" },
    generalCautions: {
      type: "array",
      minItems: 3,
      items: { type: "string" },
    },
  },
  required: ["concepts", "rationaleNarrative", "generalCautions"],
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
  ctx.push(`CLIENT: ${body.clientName}`);
  if (body.hollandCode) ctx.push(`Holland code: ${body.hollandCode}`);
  if (body.topRiasec && body.topRiasec.length)
    ctx.push(`Top RIASEC: ${body.topRiasec.join(", ")}`);
  if (body.dreamJob) ctx.push(`Dream job: ${body.dreamJob}`);
  if (body.employmentGoal) ctx.push(`Current VR goal: ${body.employmentGoal}`);
  if (body.educationLevel) ctx.push(`Education: ${body.educationLevel}`);
  if (body.schedulePreference) ctx.push(`Schedule: ${body.schedulePreference}`);
  if (body.constraints) ctx.push(`Constraints / accommodations:\n${body.constraints}`);
  if (body.natureOfCondition)
    ctx.push(`Disability context: ${body.natureOfCondition}`);
  if (body.zipCode) ctx.push(`Local market ZIP: ${body.zipCode}`);
  if (body.transferableSkills && body.transferableSkills.length)
    ctx.push(`Transferable skills:\n- ${body.transferableSkills.join("\n- ")}`);
  ctx.push("\nPitch 3 distinct business concepts per the schema. JSON only.");

  const client = new Anthropic();
  let response;
  try {
    response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 6144,
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
