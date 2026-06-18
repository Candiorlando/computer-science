import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { verifyPriceRange } from "@/lib/price-search";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RequestSchema = z.object({
  clientName: z.string(),
  jobTitle: z.string().optional(),
  employerName: z.string().optional(),
  hrContactName: z.string().optional(),
  hrContactTitle: z.string().optional(),
  workLocation: z.string().optional(),
  natureOfCondition: z.string().optional(),
  workplaceProblem: z.string().min(5),
});

const SYSTEM_PROMPT = `You are an ADA-Title-I subject matter expert and a
legal-tech writer drafting a formal Reasonable Accommodation Request
letter on behalf of a working person with a disability.

Your output has three layers:
  1) An analysis of the specific workplace barrier the person described.
  2) Two clearly separated solution lists — zero-cost / administrative
     vs. paid (hardware, software, furniture, environmental). Every
     paid item gets a realistic estimated retail price range based on
     your training knowledge (label as 'estimated retail range').
  3) A formal business letter the person can send to HR that opens the
     ADA Title I interactive process.

NON-NEGOTIABLE RULES:

- Cross-reference solutions against Job Accommodation Network (JAN)
  standard practices. If JAN has a specific topic page that fits,
  reference it in exampleSources (e.g., "askjan.org/limitations/...").
- Every solution must directly address the specific workplace problem
  the user described — do not generate generic disability supports.
- Zero-cost solutions go in zeroCostSolutions ONLY. Paid solutions go
  in paidSolutions ONLY. Do not put the same idea in both.
- Paid solutions include estimatedPriceLow and estimatedPriceHigh in
  US dollars (whole numbers). Be honest — prefer realistic ranges over
  cherry-picking the cheapest one-off. If the typical retail spread
  is wide (e.g., $200–$2,000 for ergonomic chairs), include the wide
  range and call it out in the rationale.
- Do not promise that any specific employer will agree to a given
  accommodation. Frame solutions as proposals for the interactive
  process, not demands.
- Do NOT name the person's diagnosis in the letter body unless they
  supplied it themselves and explicitly want it included. Limit
  disability disclosure to the minimum needed to substantiate the
  request — "a medical condition that affects [function]" is usually
  enough.
- The letter must invoke the ADA Title I interactive process explicitly
  (cite "Americans with Disabilities Act, Title I" or "ADA Title I").
- The letter must include the JAN data point that 56% of accommodations
  cost nothing and the median paid accommodation is ~$300, presented
  respectfully to pre-empt undue-hardship concerns.
- The letter must list every zero-cost option AND every paid option
  with prices, so HR sees the full range. End by requesting a meeting
  within 10 business days.
- Tone: professional, collaborative, never adversarial. Avoid legal
  threats. Avoid hedge words like "if possible" — the request is
  reasonable, not contingent.
- Return ONLY valid JSON matching the schema. No prose around it.`;

const RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    barrierAnalysis: {
      type: "string",
      description:
        "2-3 sentences in plain language framing the workplace barrier and why it impedes essential function performance",
    },
    janCitation: {
      type: "string",
      description:
        "One short sentence citing JAN guidance most relevant to this barrier",
    },
    zeroCostSolutions: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          label: { type: "string" },
          rationale: { type: "string" },
          category: {
            type: "string",
            enum: [
              "scheduling",
              "policy",
              "task-restructuring",
              "environmental",
              "other",
            ],
          },
        },
        required: ["label", "rationale", "category"],
      },
    },
    paidSolutions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          label: { type: "string" },
          rationale: { type: "string" },
          category: {
            type: "string",
            enum: [
              "hardware",
              "software",
              "furniture",
              "environmental",
              "assistive-tech",
              "other",
            ],
          },
          estimatedPriceLow: { type: "number" },
          estimatedPriceHigh: { type: "number" },
          exampleSources: {
            type: "array",
            items: { type: "string" },
            description:
              "Where the person could acquire this — e.g. Amazon, Humanscale, askjan.org topic URL, state AT loan program",
          },
        },
        required: [
          "label",
          "rationale",
          "category",
          "estimatedPriceLow",
          "estimatedPriceHigh",
          "exampleSources",
        ],
      },
    },
    totalPaidLow: { type: "number" },
    totalPaidHigh: { type: "number" },
    letter: {
      type: "object",
      additionalProperties: false,
      properties: {
        date: {
          type: "string",
          description: "Today's date as 'Month Day, Year'",
        },
        recipientBlock: {
          type: "array",
          items: { type: "string" },
          description:
            "2-4 lines of the recipient address block, top to bottom",
        },
        subject: {
          type: "string",
          description:
            "Re: line — formal subject identifying this as an ADA Title I accommodation request",
        },
        salutation: {
          type: "string",
          description: "e.g. 'Dear Ms. Hassan,' or 'Dear Human Resources Team,'",
        },
        paragraphs: {
          type: "array",
          minItems: 4,
          items: { type: "string" },
          description:
            "4-6 paragraphs of the letter body in order: (1) identify self + invoke ADA Title I + state purpose; (2) describe the workplace barrier without over-disclosing medical detail; (3) propose zero-cost options as a bulleted-style paragraph; (4) propose paid options with estimated price ranges as a bulleted-style paragraph; (5) cite JAN data on accommodation costs to pre-empt undue hardship concerns; (6) request interactive-process meeting within 10 business days and offer to provide any documentation HR needs.",
        },
        closing: {
          type: "string",
          description: "Sign-off line, e.g. 'Sincerely,'",
        },
      },
      required: [
        "date",
        "recipientBlock",
        "subject",
        "salutation",
        "paragraphs",
        "closing",
      ],
    },
  },
  required: [
    "barrierAnalysis",
    "janCitation",
    "zeroCostSolutions",
    "paidSolutions",
    "totalPaidLow",
    "totalPaidHigh",
    "letter",
  ],
};

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return jsonError("ANTHROPIC_API_KEY not set in Vercel.", 500);
  }

  let body: z.infer<typeof RequestSchema>;
  try {
    body = RequestSchema.parse(await req.json());
  } catch {
    return jsonError("Invalid request body.", 400);
  }

  const ctx: string[] = [];
  ctx.push(`EMPLOYEE: ${body.clientName}`);
  if (body.jobTitle) ctx.push(`POSITION: ${body.jobTitle}`);
  if (body.employerName) ctx.push(`EMPLOYER: ${body.employerName}`);
  if (body.workLocation) ctx.push(`WORK LOCATION: ${body.workLocation}`);
  if (body.hrContactName)
    ctx.push(
      `HR CONTACT: ${body.hrContactName}${body.hrContactTitle ? ` (${body.hrContactTitle})` : ""}`,
    );
  if (body.natureOfCondition)
    ctx.push(`NATURE OF CONDITION (disclosed by employee): ${body.natureOfCondition}`);
  else
    ctx.push(
      "NATURE OF CONDITION: The employee did not disclose a specific diagnosis. Use general framing like 'a medical condition that affects [function]'.",
    );
  ctx.push(`SPECIFIC WORKPLACE PROBLEM: ${body.workplaceProblem}`);
  ctx.push(
    `\nToday's date: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
  );
  ctx.push(
    "\nDraft the analysis, the two solution lists with price ranges on paid items, and the formal ADA Title I accommodation letter. JSON only.",
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
      output_config: {
        format: {
          type: "json_schema",
          schema: RESPONSE_SCHEMA as unknown as Record<string, unknown>,
        },
      },
      messages: [{ role: "user", content: ctx.join("\n") }],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const status =
      err && typeof err === "object" && "status" in err
        ? (err as { status?: number }).status ?? 500
        : 500;
    return jsonError(`Anthropic API error (${status}): ${message}`, 500);
  }

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    return jsonError("No text response.", 500);
  }

  let data: {
    paidSolutions: {
      label: string;
      estimatedPriceLow: number;
      estimatedPriceHigh: number;
      priceSource?: string;
      verifiedAt?: string;
      verifiedSources?: string[];
    }[];
    totalPaidLow: number;
    totalPaidHigh: number;
    [k: string]: unknown;
  };
  try {
    data = JSON.parse(textBlock.text);
  } catch {
    return jsonError("Model response was not valid JSON.", 500);
  }

  // Optional retail-price verification. If BRAVE_SEARCH_API_KEY is set
  // in env, we look up each paid solution and replace the AI estimate
  // with a 25th–75th percentile range pulled from real retail snippets.
  // Falls through silently if the key isn't set or the search returns
  // unusable results — every paid item still has an ai-estimated price.
  const enriched = await Promise.all(
    data.paidSolutions.map(async (s) => {
      const verified = await verifyPriceRange({
        label: s.label,
        estimatedPriceLow: s.estimatedPriceLow,
        estimatedPriceHigh: s.estimatedPriceHigh,
      });
      if (verified) {
        return {
          ...s,
          estimatedPriceLow: verified.low,
          estimatedPriceHigh: verified.high,
          priceSource: "live-verified" as const,
          verifiedAt: new Date().toISOString(),
          verifiedSources: verified.sourcesConsulted,
        };
      }
      return { ...s, priceSource: "ai-estimated" as const };
    }),
  );

  // Recompute the totals from the (possibly re-priced) solutions so the
  // headline range matches the per-item ranges.
  const totalPaidLow = enriched.reduce(
    (sum, s) => sum + s.estimatedPriceLow,
    0,
  );
  const totalPaidHigh = enriched.reduce(
    (sum, s) => sum + s.estimatedPriceHigh,
    0,
  );

  return new Response(
    JSON.stringify({
      ...data,
      paidSolutions: enriched,
      totalPaidLow,
      totalPaidHigh,
    }),
    { headers: { "Content-Type": "application/json" } },
  );
}

function jsonError(error: string, status: number) {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
