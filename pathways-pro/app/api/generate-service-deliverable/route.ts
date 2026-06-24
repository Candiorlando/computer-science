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

2. Format as a complete, ready-to-send Markdown document with:
   - A title line
   - A short executive summary (2-3 sentences)
   - Clearly labeled sections specific to the service requested
   - Concrete recommendations the recipient can act on
   - A "Counselor signature block" placeholder at the bottom

3. Apply the SERVICE-SPECIFIC TEMPLATE provided in the user prompt
   exactly — this template was authored for this service and defines
   the required deliverable structure.

4. CRC ethics + WIOA Title IV compliance:
   - Use person-first language by default.
   - Never disclose individual client PHI beyond what the requester
     already provided.
   - Cite the relevant statute/regulation when making compliance
     claims (ADA Title I, Section 504, WIOA § 116, etc.).
   - Recommend specific JAN topic pages by URL when proposing
     accommodations.

5. Length: 600-1200 words. Concise wins. Do not pad.

6. Output ONLY the Markdown document. No surrounding prose, no
   meta-commentary, no JSON envelope.`;

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
    JSON.stringify({ draft: textBlock.text, model: "claude-opus-4-8" }),
    { headers: { "Content-Type": "application/json" } },
  );
}
