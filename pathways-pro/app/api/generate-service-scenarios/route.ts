import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RequestSchema = z.object({
  serviceTitle: z.string(),
  serviceCategory: z.string(),
  serviceDescription: z.string().optional(),
  requesterOrgName: z.string().optional(),
  matterCaption: z.string().optional(),
  requesterNotes: z.string().optional(),
});

const SYSTEM_PROMPT = `You are a senior Certified Rehabilitation Counselor.
Given a professional service from a VR/forensic service catalog, list the
TOP SCENARIOS this service is most commonly requested for in real practice.

RULES:
1. Return 4-6 scenarios, ordered by how frequently they occur in practice.
2. title: max 8 words, the scenario as a practitioner would name it
   (e.g., "Workers' comp earning-capacity dispute", "Post-offer ADA
   accommodation request").
3. description: ONE sentence — who requests it and what question the
   engagement answers.
4. Scenarios must be genuinely distinct postures, not rewordings.
5. When request context (org, matter, notes) is provided, put the
   scenario that best matches that context FIRST.
Return ONLY via the tool call.`;

const RESPONSE_SCHEMA = {
  type: "object" as const,
  properties: {
    scenarios: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
        },
        required: ["title", "description"],
      },
    },
  },
  required: ["scenarios"],
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
  ctx.push(`SERVICE: ${body.serviceTitle} (${body.serviceCategory})`);
  if (body.serviceDescription) ctx.push(`DESCRIPTION: ${body.serviceDescription}`);
  if (body.requesterOrgName) ctx.push(`REQUESTER ORG: ${body.requesterOrgName}`);
  if (body.matterCaption) ctx.push(`MATTER: ${body.matterCaption}`);
  if (body.requesterNotes) ctx.push(`REQUESTER NOTES: ${body.requesterNotes}`);
  ctx.push("");
  ctx.push("List the top scenarios now via the tool call.");

  const client = new Anthropic();
  let response;
  try {
    response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 1024,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      tools: [
        {
          name: "service_scenarios",
          description: "Return the top scenarios this service is requested for.",
          input_schema: RESPONSE_SCHEMA as Anthropic.Messages.Tool.InputSchema,
        },
      ],
      tool_choice: { type: "tool", name: "service_scenarios" },
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
    JSON.stringify({ ...(toolBlock.input as object), model: "claude-opus-4-8" }),
    { headers: { "Content-Type": "application/json" } },
  );
}
