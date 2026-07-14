import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RequestSchema = z.object({
  clientName: z.string().optional(),
  hollandCode: z.string(),
  riasec: z.object({
    R: z.number(),
    I: z.number(),
    A: z.number(),
    S: z.number(),
    E: z.number(),
    C: z.number(),
  }),
  bigFive: z
    .object({
      E: z.number(),
      A: z.number(),
      C: z.number(),
      N: z.number(),
      O: z.number(),
    })
    .optional(),
  educationLevel: z.string().optional(),
  dreamJob: z.string().optional(),
  constraints: z.string().optional(),
  natureOfCondition: z.string().optional(),
});

const SYSTEM_PROMPT = `You are an expert Certified Rehabilitation Counselor
helping a vocational client expand their list of realistic career options
beyond the standard O*NET match list. The client has already received a
ranked list of best-fit occupations from a static database — your job is
to brainstorm ADDITIONAL ideas, organized by education tier, so they can
see what's possible at every level of training investment.

NON-NEGOTIABLE RULES:

1. Generate 12-15 career ideas total, distributed across the five
   education tiers below. Aim for roughly:
   - no-degree:        3-4 ideas (entry-level, on-the-job training)
   - certificate:      3-4 ideas (short vocational programs, 6-12 mo)
   - associate:        2-3 ideas (community college, 2 yr)
   - bachelor:         2-3 ideas (4-yr degree)
   - graduate:         1-2 ideas (master's / professional)

2. Every idea must be defensible against the client's Holland code AND
   their top RIASEC scores. In whyItFits, name the SPECIFIC RIASEC
   letters or trait combination that drove this match. Vague matches
   ("you'd enjoy this") get rejected.

3. Skip the obvious — do NOT pitch the same occupations that appear in
   any standard O*NET RIASEC match list (electrician, registered nurse,
   accountant, etc.). The client has already seen those. Pitch
   adjacent, specialty, niche, or emerging roles they may not have
   considered.

4. Be realistic about earnings, demand, and accommodation profile.
   Each idea gets a 1-line "real-world note" — a candid line about
   what makes this role harder or easier than it looks from the
   outside.

5. Accommodation-aware: when the client's profile mentions a
   disability, condition, or constraint, factor that into your picks.
   Don't propose roles that clearly conflict with stated constraints,
   and call out accommodations that would make borderline picks work.

6. Each idea includes a "firstStep" — one concrete action the client
   could take this week to test interest (informational interview,
   shadow a worker for a day, watch a specific Day-in-the-Life video,
   take a short free online course, visit a workplace).

7. Use plain language. Avoid jargon ("multidisciplinary praxis",
   "transdisciplinary"). Write like a counselor explaining to a
   client in a coffee shop.

8. Return ONLY valid JSON matching the schema. No surrounding prose.`;

const RESPONSE_SCHEMA = {
  type: "object" as const,
  properties: {
    rationaleNarrative: {
      type: "string",
      description:
        "2-3 sentences explaining the pattern in your picks given the client's Holland code, top RIASEC traits, and education context.",
    },
    ideasByTier: {
      type: "object",
      properties: {
        "no-degree": { type: "array", items: { $ref: "#/$defs/idea" } },
        certificate: { type: "array", items: { $ref: "#/$defs/idea" } },
        associate: { type: "array", items: { $ref: "#/$defs/idea" } },
        bachelor: { type: "array", items: { $ref: "#/$defs/idea" } },
        graduate: { type: "array", items: { $ref: "#/$defs/idea" } },
      },
      required: [
        "no-degree",
        "certificate",
        "associate",
        "bachelor",
        "graduate",
      ],
    },
  },
  required: ["rationaleNarrative", "ideasByTier"],
  $defs: {
    idea: {
      type: "object",
      properties: {
        title: { type: "string", description: "Job title in plain English" },
        riasecMatch: {
          type: "string",
          description:
            "The 2-3 RIASEC letters (e.g., 'SAI') this role draws on most.",
        },
        whyItFits: {
          type: "string",
          description:
            "1-2 sentences naming the specific traits / scores that make this a strong match for THIS client.",
        },
        educationPath: {
          type: "string",
          description:
            "Plain-language description of what training is needed and how long (e.g., '6-month welding certificate at a community college').",
        },
        realWorldNote: {
          type: "string",
          description:
            "1 candid sentence about what makes this role harder or easier than it looks. Earnings range, demand, schedule, physical/sensory profile.",
        },
        firstStep: {
          type: "string",
          description:
            "One concrete thing the client can do THIS WEEK to test interest.",
        },
      },
      required: [
        "title",
        "riasecMatch",
        "whyItFits",
        "educationPath",
        "realWorldNote",
        "firstStep",
      ],
    },
  },
};

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY not set." }),
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

  const ctx: string[] = [];
  ctx.push(`HOLLAND CODE: ${body.hollandCode}`);
  ctx.push(
    `RIASEC SCORES (0-100): R=${body.riasec.R} I=${body.riasec.I} A=${body.riasec.A} S=${body.riasec.S} E=${body.riasec.E} C=${body.riasec.C}`,
  );
  if (body.bigFive) {
    ctx.push(
      `BIG FIVE (0-100): Extraversion=${body.bigFive.E} Agreeableness=${body.bigFive.A} Conscientiousness=${body.bigFive.C} Neuroticism=${body.bigFive.N} Openness=${body.bigFive.O}`,
    );
  }
  if (body.educationLevel) ctx.push(`CURRENT EDUCATION: ${body.educationLevel}`);
  if (body.dreamJob) ctx.push(`STATED DREAM JOB: ${body.dreamJob}`);
  if (body.constraints) ctx.push(`STATED CONSTRAINTS: ${body.constraints}`);
  if (body.natureOfCondition)
    ctx.push(`NATURE OF CONDITION (for accommodation framing): ${body.natureOfCondition}`);
  ctx.push("");
  ctx.push(
    "Generate the structured career-ideas response now. JSON only.",
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
      tools: [
        {
          name: "career_ideas",
          description:
            "Return the structured career-ideas brief grouped by education tier.",
          input_schema: RESPONSE_SCHEMA as Anthropic.Messages.Tool.InputSchema,
        },
      ],
      tool_choice: { type: "tool", name: "career_ideas" },
      messages: [{ role: "user", content: ctx.join("\n") }],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({ error: `Anthropic API error: ${message}` }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const toolBlock = response.content.find((b) => b.type === "tool_use");
  if (!toolBlock || toolBlock.type !== "tool_use") {
    return new Response(JSON.stringify({ error: "No tool response." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({ ideas: toolBlock.input, model: "claude-opus-4-8" }),
    { headers: { "Content-Type": "application/json" } },
  );
}
