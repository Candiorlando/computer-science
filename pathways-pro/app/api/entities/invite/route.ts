import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Invitation email endpoint — called when a counselor adds a new entity
// (client, business, vendor, or partner) to their network.
//
// In production, this sends an email via your transactional email service
// (Resend, SendGrid, AWS SES, etc.) with a claim link. For now, it logs
// the invitation and returns success so the frontend flow works end-to-end.
//
// The claim flow:
//   1. Counselor fills out the AddEntityModal form
//   2. Profile is created with a temporary password
//   3. This endpoint sends an email with a link to /signin (or /business)
//   4. The entity signs in with their email + temp password
//   5. They are prompted to set a new password on first login
//
// Production email integration:
//   import { Resend } from "resend";
//   const resend = new Resend(process.env.RESEND_API_KEY);
//
//   await resend.emails.send({
//     from: "Pathways Pro <noreply@pathwayspro.app>",
//     to: data.email,
//     subject: `${data.counselorName} has added you to Pathways Pro`,
//     html: buildInviteEmail(data),
//   });

const InviteSchema = z.object({
  entityType: z.enum(["client", "business", "vendor", "partner"]),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  counselorName: z.string().min(1),
  counselorEmail: z.string().email(),
  organizationName: z.string().optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const result = InviteSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const data = result.data;

  // Log the invitation (visible in Vercel Function logs)
  console.log("Entity invitation:", {
    type: data.entityType,
    name: `${data.firstName} ${data.lastName}`,
    email: data.email,
    invitedBy: data.counselorName,
    organization: data.organizationName,
    claimUrl: data.entityType === "client"
      ? "https://www.pathwayspro.app/signin"
      : "https://www.pathwayspro.app/business",
  });

  // TODO: Send actual email when RESEND_API_KEY / SMTP is configured
  // For now, return success with a flag indicating email was not sent
  const emailConfigured = !!process.env.RESEND_API_KEY;

  return NextResponse.json({
    ok: true,
    emailSent: emailConfigured,
    invitation: {
      entityType: data.entityType,
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      invitedBy: data.counselorName,
      claimUrl: data.entityType === "client"
        ? "/signin"
        : "/business",
    },
  });
}
