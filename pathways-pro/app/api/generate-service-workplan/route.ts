import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RequestSchema = z.object({
  serviceTitle: z.string(),
  serviceCategory: z.string(),
  serviceDescription: z.string().optional(),
  aiTemplate: z.string().optional(),
  requesterOrgName: z.string().optional(),
  requesterName: z.string().optional(),
  subjectClientName: z.string().optional(),
  matterCaption: z.string().optional(),
  jurisdiction: z.string().optional(),
  requesterNotes: z.string().optional(),
  counselorName: z.string().optional(),
});

const SYSTEM_PROMPT = `You are a senior Certified Rehabilitation Counselor
planning the execution of a professional service engagement. Given the
service and request context, produce a WORK PLAN: what information must
be collected, which assessment / collection instruments to use, and the
intake questions the counselor should answer while working the case.

RULES:

1. informationChecklist: 5-9 items. Each names ONE concrete document
   or data element to collect (e.g., "Last 3 years W-2s / tax
   transcripts", "Complete medical records incl. imaging reports",
   "Current job description signed by HR"). why = one line on what the
   item anchors in the deliverable. source = who/where it comes from
   (client, employer HR, treating physician, SSA, counsel, etc.).

2. recommendedTools: 3-6 instruments or collection tools appropriate
   to THIS service — standardized assessments (TSA, FCE, WRAT, WAIS-IV,
   SII), structured surveys (labor market survey, employer contact
   log), or observation protocols (situational assessment). kind is
   one of: "standardized-assessment", "survey", "observation",
   "records-review", "interview-protocol". purpose = one line on what
   the tool contributes. Only recommend tools genuinely needed —
   a benefits-counseling brief does not need a WAIS.

3. intakeQuestions: 6-10 questions the counselor answers as they work
   (findings capture, not client-facing). Each should map to a section
   of the final deliverable. hint = optional example or format cue.
   Order them in the sequence the counselor would naturally work.

4. rationale: 2-3 sentences on how you scoped the plan — what drives
   the information demands for this specific service and matter.

5. When the service is forensic/litigation-adjacent, information and
   tools MUST satisfy Daubert/Frye reproducibility — verified records
   over self-report, named methodologies, dated labor-market sources.

Return ONLY via the tool call. No prose.`;

const RESPONSE_SCHEMA = {
  type: "object" as const,
  properties: {
    rationale: { type: "string" },
    informationChecklist: {
      type: "array",
      items: {
        type: "object",
        properties: {
          item: { type: "string" },
          why: { type: "string" },
          source: { type: "string" },
        },
        required: ["item", "why", "source"],
      },
    },
    recommendedTools: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          purpose: { type: "string" },
          kind: {
            type: "string",
            enum: [
              "standardized-assessment",
              "survey",
              "observation",
              "records-review",
              "interview-protocol",
            ],
          },
        },
        required: ["name", "purpose", "kind"],
      },
    },
    intakeQuestions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          prompt: { type: "string" },
          hint: { type: "string" },
        },
        required: ["prompt"],
      },
    },
  },
  required: ["rationale", "informationChecklist", "recommendedTools", "intakeQuestions"],
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
  if (body.aiTemplate) ctx.push(`DELIVERABLE TEMPLATE: ${body.aiTemplate}`);
  if (body.requesterOrgName)
    ctx.push(`REQUESTER: ${body.requesterName ?? ""} · ${body.requesterOrgName}`);
  if (body.subjectClientName) ctx.push(`SUBJECT: ${body.subjectClientName}`);
  if (body.matterCaption) ctx.push(`MATTER: ${body.matterCaption}`);
  if (body.jurisdiction) ctx.push(`JURISDICTION: ${body.jurisdiction}`);
  if (body.requesterNotes) ctx.push(`REQUESTER NOTES: ${body.requesterNotes}`);
  if (body.counselorName) ctx.push(`COUNSELOR: ${body.counselorName}`);
  ctx.push("");
  ctx.push("Produce the work plan now via the tool call.");

  const client = new Anthropic();
  let response;
  try {
    response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 3072,
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
          name: "service_workplan",
          description:
            "Return the structured work plan: information checklist, recommended tools, intake questions.",
          input_schema: RESPONSE_SCHEMA as Anthropic.Messages.Tool.InputSchema,
        },
      ],
      tool_choice: { type: "tool", name: "service_workplan" },
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
    JSON.stringify({ workplan: toolBlock.input, model: "claude-opus-4-8" }),
    { headers: { "Content-Type": "application/json" } },
  );
}
