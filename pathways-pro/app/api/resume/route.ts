import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RequestSchema = z.object({
  targetJob: z.string(),
  targetSocCode: z.string().optional(),
  fullName: z.string(),
  contactCity: z.string().optional(),
  contactEmail: z.string().optional(),
  contactPhone: z.string().optional(),
  companyName: z.string().optional(),
  hiringManager: z.string().optional(),
  educationLevel: z.string().optional(),
  workHistory: z.string().optional(),
  hollandCode: z.string().optional(),
  tsaSkills: z.array(z.string()).optional(),
  tsaResumeBullets: z.array(z.string()).optional(),
  experiences: z
    .array(
      z.object({
        type: z.string(),
        title: z.string(),
        description: z.string(),
        duration: z.string().optional(),
      }),
    )
    .optional(),
  goals: z.string().optional(),
});

const SYSTEM_PROMPT = `You are a senior rehabilitation counselor and resume
writer drafting BOTH a one-page resume AND a matching one-page cover
letter, both tailored to a specific job for a vocational-rehabilitation
client.

Resume constraints:
- ONE PAGE. Lean ruthlessly. Cut anything that doesn't help land THIS job.
- Lead with the candidate's strongest evidence for THIS specific job.
- Use verb-led bullets with measurable impact when possible. Real numbers
  beat adjectives.
- Translate non-traditional experience (caregiving, volunteering, hobbies)
  into employer-relevant accomplishments without overselling.
- No clichés ("hard worker", "team player", "passionate"). No buzzwords.
- ATS-friendly: standard section headings, no tables, no emojis, no graphics.
- Honor the candidate's actual experience. Do NOT invent jobs, dates,
  degrees, or certifications.

Resume sections in this order:
1. Header (name, city/state, email, phone)
2. Summary (2-3 sentences pitching THIS candidate for THIS job)
3. Skills (3-6 specific skill items, chosen to match the target job)
4. Experience (most recent first, 3-5 bullets each)
5. Education / Training
6. Additional Qualifications (optional)

Cover letter constraints:
- ONE PAGE, 3-4 short paragraphs total, ~250-350 words.
- Conversational but professional — speak to a hiring manager, not a
  committee. Active voice.
- Open with a specific reason the candidate wants THIS job at THIS
  company (if company name given), not a generic "I am writing to
  apply…".
- Middle paragraph(s) must reference 2-3 concrete pieces of evidence
  from the candidate's actual background that map to the target job.
  No invented experience.
- Briefly, honestly address transferable strengths for candidates
  changing fields or returning to work after a gap — without
  apologizing or oversharing disability information.
- Close with a clear next step and gratitude. Avoid "Please find my
  resume attached" — assume it's attached.
- Salutation: "Dear [Hiring Manager Name]," if given, otherwise
  "Dear Hiring Team," — never "To Whom It May Concern."
- Closing: "Sincerely," then candidate's full name on a new line.

Return ONLY valid JSON matching the requested schema. No prose around it.`;

const RESUME_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    resume: {
      type: "object",
      additionalProperties: false,
      properties: {
        header: {
          type: "object",
          additionalProperties: false,
          properties: {
            name: { type: "string" },
            location: { type: "string" },
            email: { type: "string" },
            phone: { type: "string" },
          },
          required: ["name"],
        },
        summary: {
          type: "string",
          description: "2-3 sentences pitching THIS candidate for THE TARGET JOB",
        },
        skills: {
          type: "array",
          items: { type: "string" },
          description: "3-6 specific skill phrases tailored to the target job",
        },
        experience: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              title: { type: "string" },
              organization: { type: "string" },
              location: { type: "string" },
              dates: { type: "string" },
              bullets: { type: "array", items: { type: "string" } },
            },
            required: ["title", "bullets"],
          },
        },
        education: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              credential: { type: "string" },
              institution: { type: "string" },
              dates: { type: "string" },
              details: { type: "string" },
            },
            required: ["credential"],
          },
        },
        additionalQualifications: {
          type: "array",
          items: { type: "string" },
          description: "Optional — only include if it materially helps land the target job",
        },
      },
      required: ["header", "summary", "skills", "experience"],
    },
    coverLetter: {
      type: "object",
      additionalProperties: false,
      properties: {
        date: {
          type: "string",
          description: "Today's date in 'Month Day, Year' format, e.g. 'June 18, 2026'",
        },
        recipient: {
          type: "object",
          additionalProperties: false,
          properties: {
            name: { type: "string" },
            title: { type: "string" },
            company: { type: "string" },
          },
        },
        salutation: {
          type: "string",
          description: "e.g. 'Dear Ms. Patel,' or 'Dear Hiring Team,'",
        },
        paragraphs: {
          type: "array",
          items: { type: "string" },
          description: "3-4 paragraphs of letter body. Each is one paragraph as a single string.",
        },
        closing: {
          type: "string",
          description: "Sign-off line, e.g. 'Sincerely,'",
        },
      },
      required: ["date", "salutation", "paragraphs", "closing"],
    },
  },
  required: ["resume", "coverLetter"],
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

  const client = new Anthropic();

  const ctx: string[] = [];
  ctx.push(`TARGET JOB: ${body.targetJob}${body.targetSocCode ? ` (O*NET ${body.targetSocCode})` : ""}`);
  if (body.companyName) ctx.push(`HIRING COMPANY: ${body.companyName}`);
  if (body.hiringManager) ctx.push(`HIRING MANAGER: ${body.hiringManager}`);
  ctx.push(`CANDIDATE: ${body.fullName}`);
  if (body.contactCity) ctx.push(`Location: ${body.contactCity}`);
  if (body.contactEmail) ctx.push(`Email: ${body.contactEmail}`);
  if (body.contactPhone) ctx.push(`Phone: ${body.contactPhone}`);
  if (body.educationLevel) ctx.push(`Education: ${body.educationLevel}`);
  if (body.hollandCode) ctx.push(`Holland code: ${body.hollandCode}`);
  if (body.workHistory) ctx.push(`\nWork history narrative:\n${body.workHistory}`);
  if (body.goals) ctx.push(`\nCareer goals:\n${body.goals}`);
  ctx.push(`\nToday's date: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`);
  if (body.tsaSkills && body.tsaSkills.length > 0) {
    ctx.push(
      `\nTransferable skills identified from prior TSA:\n- ${body.tsaSkills.join("\n- ")}`,
    );
  }
  if (body.tsaResumeBullets && body.tsaResumeBullets.length > 0) {
    ctx.push(
      `\nReady-to-use resume bullets from TSA (pick the most relevant):\n- ${body.tsaResumeBullets.join("\n- ")}`,
    );
  }
  if (body.experiences && body.experiences.length > 0) {
    ctx.push(`\nFull experiences:\n`);
    body.experiences.forEach((e, i) => {
      ctx.push(
        `${i + 1}. [${e.type}] ${e.title}${e.duration ? ` (${e.duration})` : ""}\n   ${e.description}`,
      );
    });
  }

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
        format: { type: "json_schema", schema: RESUME_SCHEMA as unknown as Record<string, unknown> },
      },
      messages: [
        {
          role: "user",
          content:
            ctx.join("\n") +
            "\n\nDraft BOTH a one-page resume AND a matching one-page cover letter for this candidate targeting the job above. Return a single JSON object with `resume` and `coverLetter` keys per the schema. JSON only.",
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
