import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ProfileSchema = z.object({
  intake: z
    .object({
      age: z.string().optional(),
      location: z.string().optional(),
      educationLevel: z.string().optional(),
      workHistory: z.string().optional(),
      constraints: z.string().optional(),
      goals: z.string().optional(),
      openToApprenticeship: z.boolean().optional(),
    })
    .partial()
    .optional(),
  bigFive: z
    .object({ E: z.number(), A: z.number(), C: z.number(), N: z.number(), O: z.number() })
    .optional(),
  riasec: z
    .object({ R: z.number(), I: z.number(), A: z.number(), S: z.number(), E: z.number(), C: z.number() })
    .optional(),
  hollandCode: z.string().optional(),
});

const RequestSchema = z.object({
  profile: ProfileSchema,
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    }),
  ),
  topMatches: z.array(z.string()).optional(),
});

const SYSTEM_PROMPT = `You are a thoughtful career coach inside an app called Career Compass.
You help users — including people without college degrees, people with disabilities,
people changing careers, and people returning to work — plan their next steps.

Your knowledge spans:
- The O*NET occupation database (interests, work activities, education levels, wages)
- US apprenticeship and on-the-job training pathways (apprenticeship.gov)
- The Job Accommodation Network (askjan.org) for disability accommodations
- US state Vocational Rehabilitation (VR) agency programs
- General application tactics: resume framing, cover letters, follow-up, interviewing
- General professional norms: dress, communication, networking, online presence

When you give advice:
1. Ground it in the user's actual profile (their Holland code, Big Five, constraints, location, education).
2. Be concrete. Numbers, deadlines, specific phrasing for emails, specific programs to look up.
3. Acknowledge tradeoffs honestly — apprenticeships pay less initially but avoid debt; a degree opens more doors but takes years.
4. Push back gently if a goal seems mismatched with what you know about the user.

Hard rules — you MUST follow these:
- You are NOT a licensed counselor, therapist, physician, attorney, or VR specialist.
  When the user's question crosses into licensed territory (mental health treatment,
  legal advice on ADA cases, medical fitness for a job, benefits eligibility decisions),
  give general educational information and then say clearly: "For your specific
  situation, please consult [a CRC-certified rehabilitation counselor / askjan.org /
  your state VR agency / an employment attorney / etc.]."
- You do not diagnose disabilities or determine accommodation eligibility.
- You do not promise specific salaries, hiring outcomes, or program acceptance.
- State-specific programs vary — point users to authoritative sources (apprenticeship.gov,
  careeronestop.org, askjan.org, dol.gov/vets, the user's state VR office) rather than
  making up program details.
- If asked about something outside career/work (relationship advice, medical symptoms,
  legal disputes unrelated to work), politely redirect to the right kind of professional.

Tone: warm, plain-spoken, no jargon. Treat the user like a capable adult.
Format: short paragraphs and the occasional bulleted list. Don't dump 20 items at once —
ask what they want to dig into next.`;

function profileToContext(profile: z.infer<typeof ProfileSchema>, topMatches?: string[]): string {
  const lines: string[] = ["The user has shared the following profile (they consented to share it with you):"];

  if (profile.intake) {
    const i = profile.intake;
    if (i.age) lines.push(`- Age: ${i.age}`);
    if (i.location) lines.push(`- Location: ${i.location}`);
    if (i.educationLevel) lines.push(`- Education: ${i.educationLevel}`);
    if (i.workHistory) lines.push(`- Work history: ${i.workHistory}`);
    if (i.constraints) lines.push(`- Constraints / considerations: ${i.constraints}`);
    if (i.goals) lines.push(`- Goals: ${i.goals}`);
    if (i.openToApprenticeship) lines.push(`- Open to apprenticeships / OJT: yes`);
  }

  if (profile.hollandCode) lines.push(`- Holland code: ${profile.hollandCode}`);

  if (profile.riasec) {
    const ri = profile.riasec;
    lines.push(`- RIASEC scores (0-100): R=${ri.R}, I=${ri.I}, A=${ri.A}, S=${ri.S}, E=${ri.E}, C=${ri.C}`);
  }
  if (profile.bigFive) {
    const bf = profile.bigFive;
    lines.push(`- Big Five (0-100): Openness=${bf.O}, Conscientiousness=${bf.C}, Extraversion=${bf.E}, Agreeableness=${bf.A}, Neuroticism=${bf.N}`);
  }

  if (topMatches && topMatches.length > 0) {
    lines.push(`- Top occupation matches from the in-app ranking: ${topMatches.join(", ")}`);
  }

  return lines.join("\n");
}

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({
        error:
          "ANTHROPIC_API_KEY not set. Copy .env.local.example to .env.local and add your Anthropic API key to enable the coach.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  let body: z.infer<typeof RequestSchema>;
  try {
    body = RequestSchema.parse(await req.json());
  } catch (e) {
    return new Response(JSON.stringify({ error: "Invalid request body." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const client = new Anthropic();
  const profileContext = profileToContext(body.profile, body.topMatches);

  // Build messages array — Anthropic expects alternating user/assistant.
  // We prepend a "system reminder"-style user turn carrying the profile.
  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: `Here is my profile for this conversation. Please tailor your advice to it.\n\n${profileContext}\n\nReady when you are.`,
    },
    {
      role: "assistant",
      content:
        "Got it — I've reviewed your profile. What would you like to dig into first? A few common starting points: planning a path into one of your top matches, figuring out training options that fit your situation, drafting a resume or cover letter, or preparing for interviews. Or ask me something else entirely.",
    },
    ...body.messages,
  ];

  let stream;
  try {
    stream = await client.messages.create({
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
      messages,
      stream: true,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const status =
      err && typeof err === "object" && "status" in err
        ? (err as { status?: number }).status ?? 500
        : 500;
    return new Response(
      JSON.stringify({
        error: `Anthropic API error (${status}): ${message}`,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        controller.enqueue(encoder.encode(`\n\n[Coach error: ${message}]`));
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
