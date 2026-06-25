import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RequestSchema = z.object({
  serviceTitle: z.string(),
  serviceCategory: z.string(),
  aiTemplate: z.string(),

  requesterOrgName: z.string(),
  requesterName: z.string(),
  requesterTitle: z.string().optional(),

  subjectClientName: z.string().optional(),
  subjectCaseId: z.string().optional(),
  matterCaption: z.string().optional(),
  jurisdiction: z.string().optional(),

  requesterNotes: z.string().optional(),
  urgency: z.string().optional(),
  dueDate: z.string().optional(),

  counselorName: z.string(),
  counselorCredentials: z.string().optional(),
});

const SYSTEM_PROMPT = `You are a senior Certified Rehabilitation Counselor (CRC)
drafting a professional service deliverable for a business, vendor, or
employment-partner client. The deliverable will be reviewed and edited by
the counselor before being released, so write in their voice and at their
standard of care.

NON-NEGOTIABLE RULES:

1. Use ONLY information present in the request context. Do not invent
   facts about the client, the workforce, or the legal posture.

2. Format as a complete, ready-to-send plain-prose document with:
   - A title line on the first line
   - A short executive summary (2-3 sentences)
   - Clearly labeled sections specific to the service requested
   - Concrete recommendations the recipient can act on
   - A "Counselor signature block" placeholder at the bottom

3. FORMATTING — STRICT:
   - DO NOT emit Markdown heading markers (#, ##, ###) anywhere.
   - DO NOT emit asterisk emphasis markers (**bold** or *italic*).
   - DO NOT emit underscore emphasis markers (_italic_) either.
   - Write section headings in Title Case on their own line followed by
     a blank line — for example "Executive Summary" — and let the
     prose underneath carry the section.
   - For lists, use simple hyphens at the start of the line: "- item".
     For numbered steps, use "1. step".
   - Emphasis should come from the prose itself, not from typographic
     markers. Where you would normally bold a phrase, just write it
     plainly — the counselor's typography stack handles styling.

4. Apply the SERVICE-SPECIFIC TEMPLATE provided in the user prompt
   exactly — this template was authored for this service and defines
   the required deliverable structure.

5. CRC ethics + WIOA Title IV compliance:
   - Use person-first language by default.
   - Never disclose individual client PHI beyond what the requester
     already provided.
   - Cite the relevant statute/regulation when making compliance
     claims (ADA Title I, Section 504, WIOA § 116, etc.).
   - Recommend specific JAN topic pages by URL when proposing
     accommodations.

6. Length: 600-1200 words. Concise wins. Do not pad.

7. Output ONLY the prose document. No surrounding meta-commentary, no
   JSON envelope, no Markdown markers.`;

// Strip any stragglers — ## headings and ** bold — that the model
// may still emit despite the strict prompt above. The counselor edits
// this text in a plain textarea and the business viewer renders the
// resulting prose, so raw Markdown markers look like noise.
function stripMarkdownMarkers(text: string): string {
  const cleaned = text
    // Strip heading markers (#, ##, ###, ####) at the start of lines
    .replace(/^#{1,6}\s+/gm, "")
    // Strip leading/trailing ** around inline phrases, keeping the text
    .replace(/\*\*([^*\n]+?)\*\*/g, "$1")
    // Strip leading/trailing single * for italic, keeping the text
    .replace(/(^|[^*])\*([^*\n]+?)\*(?!\*)/g, "$1$2")
    // Strip underscore italic _phrase_ (avoid touching code identifiers
    // by requiring whitespace or line boundary on at least one side)
    .replace(/(^|\s)_([^_\n]+?)_(?=\s|$|[.,;:!?])/g, "$1$2")
    // Collapse any 3+ consecutive blank lines down to 2
    .replace(/\n{3,}/g, "\n\n");
  return cleaned.trim();
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
  ctx.push(`SERVICE: ${body.serviceTitle} (${body.serviceCategory})`);
  ctx.push(`SERVICE-SPECIFIC TEMPLATE: ${body.aiTemplate}`);
  ctx.push("");
  ctx.push(`REQUESTER: ${body.requesterName}${body.requesterTitle ? ` (${body.requesterTitle})` : ""}, ${body.requesterOrgName}`);
  if (body.subjectClientName)
    ctx.push(`SUBJECT CLIENT: ${body.subjectClientName}${body.subjectCaseId ? ` · Case ${body.subjectCaseId}` : ""}`);
  if (body.matterCaption) ctx.push(`MATTER: ${body.matterCaption}`);
  if (body.jurisdiction) ctx.push(`JURISDICTION: ${body.jurisdiction}`);
  if (body.urgency) ctx.push(`URGENCY: ${body.urgency}`);
  if (body.dueDate) ctx.push(`DUE BY: ${body.dueDate}`);
  if (body.requesterNotes) ctx.push(`\nREQUESTER NOTES:\n${body.requesterNotes}`);
  ctx.push("");
  ctx.push(`COUNSELOR OF RECORD: ${body.counselorName}${body.counselorCredentials ? `, ${body.counselorCredentials}` : ""}`);
  ctx.push("");
  ctx.push(
    "Draft the complete service deliverable now per the service-specific template. The counselor will edit, accept, and send. Markdown only.",
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
      messages: [{ role: "user", content: ctx.join("\n") }],
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

  return new Response(
    JSON.stringify({
      draft: stripMarkdownMarkers(textBlock.text),
      model: "claude-opus-4-8",
    }),
    { headers: { "Content-Type": "application/json" } },
  );
}
