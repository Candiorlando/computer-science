import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RequestSchema = z.object({
  toolTitle: z.string(),
  toolDescription: z.string().optional(),
  aiInterpretationTemplate: z.string().optional(),
  // Item responses, already serialized to readable form.
  responses: z.array(
    z.object({
      itemId: z.string(),
      prompt: z.string().optional(),
      value: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]),
    }),
  ),
  // What the counselor currently has in the interpretation field —
  // could be the deterministic draft, or their in-progress edit.
  currentDraft: z.string(),
  // Optional context the counselor can add to steer the refinement
  // (e.g., "emphasize accommodation recommendations" or "expand on
  // the leadership-buyin response").
  guidance: z.string().optional(),
  counselorName: z.string().optional(),
  counselorCredentials: z.string().optional(),
});

const SYSTEM_PROMPT = `You are an expert Certified Rehabilitation Counselor
helping ANOTHER counselor refine the interpretation section of a case
assessment. The counselor has a deterministic draft and the raw
responses; your job is to expand it into a polished, clinically sound,
2-4 paragraph interpretation they can review and approve.

NON-NEGOTIABLE RULES:

1. Use ONLY the responses and tool context provided. Do not invent
   findings, scores, or facts that aren't in the responses.

2. Structure as 2-4 paragraphs of natural prose. Do NOT emit Markdown
   markers (#, ##, **, *, _). No bullet lists unless absolutely
   necessary — write as flowing clinical narrative.

3. Each paragraph should accomplish something distinct:
   - Paragraph 1: Summary of overall finding, framing what was assessed
     and what the responses reveal at a high level.
   - Paragraph 2: Specific response patterns — name the items that
     drove the finding, integrate scores into the narrative.
   - Paragraph 3 (optional): Clinical interpretation / hypothesis
     about what's driving the pattern, grounded in the responses.
   - Final paragraph: Concrete next-step recommendations the counselor
     and client/business can act on. Reference the relevant
     framework (WIOA, ADA Title I, JAN, etc.) when applicable.

4. Voice and style: Write in the counselor's voice — first-person
   plural ("we") or omniscient third-person. Sound like a CRC, not
   a chatbot. Avoid filler ("It is important to note…"). Be specific.

5. Length: 250-400 words. Concise wins. Do not pad.

6. If counselor guidance was provided, follow it as the primary
   shaping instruction. Their judgment outranks the deterministic
   draft when they disagree.

7. Output ONLY the refined interpretation. No surrounding meta-
   commentary, no JSON envelope, no Markdown markers.`;

function stripMarkdownMarkers(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*([^*\n]+?)\*\*/g, "$1")
    .replace(/(^|[^*])\*([^*\n]+?)\*(?!\*)/g, "$1$2")
    .replace(/(^|\s)_([^_\n]+?)_(?=\s|$|[.,;:!?])/g, "$1$2")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

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
  ctx.push(`ASSESSMENT TOOL: ${body.toolTitle}`);
  if (body.toolDescription) ctx.push(`PURPOSE: ${body.toolDescription}`);
  if (body.aiInterpretationTemplate)
    ctx.push(`INTERPRETATION FRAMEWORK: ${body.aiInterpretationTemplate}`);
  ctx.push("");
  ctx.push("CLIENT / SUBJECT RESPONSES:");
  for (const r of body.responses) {
    const label = r.prompt ? r.prompt : r.itemId;
    ctx.push(`  - ${label} — ${String(r.value)}`);
  }
  ctx.push("");
  ctx.push("CURRENT INTERPRETATION DRAFT:");
  ctx.push(body.currentDraft || "(empty)");
  if (body.guidance) {
    ctx.push("");
    ctx.push(`COUNSELOR'S REFINEMENT GUIDANCE: ${body.guidance}`);
  }
  if (body.counselorName) {
    ctx.push("");
    ctx.push(
      `COUNSELOR OF RECORD: ${body.counselorName}${body.counselorCredentials ? `, ${body.counselorCredentials}` : ""}`,
    );
  }
  ctx.push("");
  ctx.push(
    "Refine the interpretation into a polished 2-4 paragraph clinical narrative now. Prose only.",
  );

  const client = new Anthropic();
  let response;
  try {
    response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 2048,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      thinking: { type: "adaptive" },
      messages: [{ role: "user", content: ctx.join("\n") }],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({ error: `Anthropic API error: ${message}` }),
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

  return new Response(
    JSON.stringify({
      refined: stripMarkdownMarkers(textBlock.text),
      model: "claude-opus-4-8",
    }),
    { headers: { "Content-Type": "application/json" } },
  );
}
