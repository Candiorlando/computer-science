import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RequestSchema = z.object({
  experiences: z.array(
    z.object({
      type: z.enum(["work", "volunteer", "hobby", "education", "caregiving"]),
      title: z.string(),
      description: z.string(),
      duration: z.string().optional(),
    }),
  ),
});

const SYSTEM_PROMPT = `You are a vocational rehabilitation counselor performing
a Transferable Skills Analysis (TSA). You analyze a client's lived experience —
work, volunteering, hobbies, caregiving, education — and extract specific,
employer-relevant transferable skills.

Methodology:
- Map activities to O*NET skill taxonomy (Basic, Cross-Functional, Resource
  Management) and worker characteristics (Abilities, Work Activities).
- Be SPECIFIC — not "communication" but "explained technical concepts to
  non-technical adults". Not "organized" but "tracked inventory across 200+
  SKUs with 99% accuracy".
- Honor non-work experience. A client who managed a household budget for
  three years has financial planning skills. A long-distance runner has
  goal-setting, discipline, and self-monitoring skills.
- Identify the OCCUPATIONS where each skill set transfers best.

Hard rules:
- Do not invent experience the client didn't describe.
- Do not promise specific jobs or interviews.
- Mark uncertain inferences as such.
- Frame skills the client can put on a resume — verb-led, measurable where
  possible.

Return ONLY valid JSON matching the requested schema. No prose around it.`;

const TSA_SCHEMA = {
  type: "object",
  properties: {
    coreSkills: {
      type: "array",
      items: {
        type: "object",
        properties: {
          skill: {
            type: "string",
            description: "Specific, verb-led skill — 'Resolved customer complaints involving billing disputes' not 'Customer service'",
          },
          category: {
            type: "string",
            enum: [
              "Communication",
              "Technical / Hands-on",
              "Analytical / Problem Solving",
              "Interpersonal / Leadership",
              "Organization / Detail",
              "Physical / Motor",
              "Creative",
            ],
          },
          evidence: {
            type: "string",
            description: "Which 1-2 experiences this skill came from, in plain language",
          },
          resumeBullet: {
            type: "string",
            description: "Polished single-line resume bullet using action verb + measurable impact when possible",
          },
        },
        required: ["skill", "category", "evidence", "resumeBullet"],
      },
    },
    occupationsToConsider: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          whyItFits: { type: "string", description: "1-2 sentences" },
          startingPoint: {
            type: "string",
            description: "Concrete first step: training, certification, entry role",
          },
        },
        required: ["title", "whyItFits", "startingPoint"],
      },
      description: "3-5 occupations where the extracted skills transfer well",
    },
    gapsToAddress: {
      type: "array",
      items: { type: "string" },
      description: "1-3 specific skill gaps to close before target occupations are realistic",
    },
    encouragement: {
      type: "string",
      description: "A short, honest, plain-spoken paragraph naming what's strongest about this profile",
    },
  },
  required: ["coreSkills", "occupationsToConsider", "gapsToAddress", "encouragement"],
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

  if (body.experiences.length === 0) {
    return new Response(
      JSON.stringify({ error: "Add at least one experience to analyze." }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const client = new Anthropic();

  const experiencesText = body.experiences
    .map(
      (e, i) =>
        `${i + 1}. [${e.type.toUpperCase()}] ${e.title}${e.duration ? ` (${e.duration})` : ""}\n   ${e.description}`,
    )
    .join("\n\n");

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
        format: { type: "json_schema", schema: TSA_SCHEMA as unknown as Record<string, unknown> },
      },
      messages: [
        {
          role: "user",
          content: `Analyze this client's experiences and extract transferable skills.\n\n${experiencesText}\n\nReturn the JSON only.`,
        },
      ],
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
