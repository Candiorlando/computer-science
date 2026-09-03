import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RequestSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  organization: z.string().min(1),
  audience: z.enum(["counselor-agency", "employer"]),
  notes: z.string().optional(),
});

// v1 demo-request intake. Every submission is logged to the server
// console (visible in Vercel function logs). If DEMO_WEBHOOK_URL is
// set (e.g. a Zapier / Make / Slack incoming webhook), the payload is
// forwarded there so requests reach an inbox without a database.
export async function POST(req: Request) {
  let body: z.infer<typeof RequestSchema>;
  try {
    body = RequestSchema.parse(await req.json());
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const record = { ...body, receivedAt: new Date().toISOString() };
  console.log("[demo-request]", JSON.stringify(record));

  const webhook = process.env.DEMO_WEBHOOK_URL;
  if (webhook) {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `New Pathways Pro demo request — ${record.name} (${record.email}), ${record.organization}, audience: ${record.audience}${record.notes ? ` — "${record.notes}"` : ""}`,
          ...record,
        }),
      });
    } catch (err) {
      console.error("[demo-request] webhook forward failed", err);
    }
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
  });
}
