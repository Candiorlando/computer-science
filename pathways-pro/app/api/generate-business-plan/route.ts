import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RequestSchema = z.object({
  clientName: z.string(),
  businessName: z.string(),
  conceptSummary: z.string().min(20),
  targetCustomer: z.string(),
  geographicMarket: z.string(),
  startingBudget: z.number(),
  natureOfCondition: z.string().optional(),
  accommodationContext: z.string().optional(),
  transferableSkills: z.array(z.string()).optional(),
});

const SYSTEM_PROMPT = `You are an expert AI business coach drafting a complete
VR-fundable small-business plan for a person with a disability. The state
VR self-employment review committee will read this; write to that
audience without being dry.

NON-NEGOTIABLE RULES:

1. Honor the client's actual budget. If startingBudget is $8,000, the
   startup costs total must fit inside it (with reasonable buffer). Do
   NOT pitch a $40,000 buildout for an $8,000 budget.

2. Operations workflow must explicitly account for the client's
   disability-related accommodation needs. Don't pretend they aren't a
   factor — bake them into the workflow design (energy budgets,
   schedule blocks, batched task design, AT-dependent steps).

3. Assistive Technology Budget is a SEPARATE line-item budget,
   not folded into "office supplies." VR can fund AT as a discrete
   service authorization — keep it itemized so the counselor can
   authorize each line.

4. Financial projections — be honest, not aspirational:
   - Month 1-3: usually below break-even
   - Realistic monthly revenue ranges (low/high)
   - Break-even month grounded in actual unit economics
   - Don't promise hockey-stick growth without specific go-to-market
     evidence

5. Target Market Analysis names 3-5 actual competitor types and what
   makes this business different. "No competitors" is never the answer
   — say "fragmented market" or "indirect competitors" instead.

6. Go-to-market channels: pick 3-5 specific, low-cost channels (local
   Facebook groups, Nextdoor, partner referrals, Google Business
   Profile, vendor relationships). NOT "social media marketing."

7. Risks & Mitigations: 4-6 real risks with specific mitigations.
   Include disability-flare risk and what continuity plan covers it.

8. Funding Pathways: list specific routes the client should explore.
   Cite actual programs by name (PASS plan via SSA, state VR
   self-employment authorization, SBA Microloan Program, Lendistry,
   etc.). Don't say "look for grants" — name them.

9. Tone: empowering, confident, specific. Not hype. The client is
   building a real business, not entering a pitch contest.

Return ONLY valid JSON matching the schema. No prose around it.`;

const RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    executiveSummary: { type: "string" },
    productService: { type: "string" },
    problemSolved: { type: "string" },
    uniqueValueProposition: { type: "string" },
    targetMarketAnalysis: {
      type: "object",
      additionalProperties: false,
      properties: {
        persona: { type: "string" },
        marketSize: { type: "string" },
        competitors: {
          type: "array",
          description: "2-5 competitor types.",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              name: { type: "string" },
              differentiator: { type: "string" },
            },
            required: ["name", "differentiator"],
          },
        },
        gotoMarketChannels: {
          type: "array",
          description: "3-5 specific low-cost channels.",
          items: { type: "string" },
        },
      },
      required: ["persona", "marketSize", "competitors", "gotoMarketChannels"],
    },
    operations: {
      type: "object",
      additionalProperties: false,
      properties: {
        workflowSteps: {
          type: "array",
          description: "4-8 sequential workflow steps.",
          items: { type: "string" },
        },
        keyMilestones30_60_90: {
          type: "array",
          description: "Exactly 3 entries, one each for day 30, 60, and 90.",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              day: { type: "number", enum: [30, 60, 90] },
              goal: { type: "string" },
            },
            required: ["day", "goal"],
          },
        },
        accommodationsBuiltIn: {
          type: "array",
          items: { type: "string" },
        },
      },
      required: [
        "workflowSteps",
        "keyMilestones30_60_90",
        "accommodationsBuiltIn",
      ],
    },
    financialProjections: {
      type: "object",
      additionalProperties: false,
      properties: {
        startupCosts: {
          type: "array",
          description: "3-8 line items.",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              item: { type: "string" },
              cost: { type: "number" },
            },
            required: ["item", "cost"],
          },
        },
        monthlyExpenses: {
          type: "array",
          description: "3-8 line items.",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              item: { type: "string" },
              cost: { type: "number" },
            },
            required: ["item", "cost"],
          },
        },
        revenueProjections: {
          type: "array",
          description: "6-12 monthly projections (one row per month).",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              month: { type: "number" },
              low: { type: "number" },
              high: { type: "number" },
            },
            required: ["month", "low", "high"],
          },
        },
        breakEvenMonth: { type: "number" },
      },
      required: [
        "startupCosts",
        "monthlyExpenses",
        "revenueProjections",
        "breakEvenMonth",
      ],
    },
    assistiveTechBudget: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          item: { type: "string" },
          estimatedCost: { type: "number" },
          rationale: { type: "string" },
        },
        required: ["item", "estimatedCost", "rationale"],
      },
    },
    risksAndMitigations: {
      type: "array",
      description: "4-6 risk/mitigation pairs.",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          risk: { type: "string" },
          mitigation: { type: "string" },
        },
        required: ["risk", "mitigation"],
      },
    },
    fundingPathways: {
      type: "array",
      description: "3-6 specific named programs.",
      items: { type: "string" },
    },
  },
  required: [
    "executiveSummary",
    "productService",
    "problemSolved",
    "uniqueValueProposition",
    "targetMarketAnalysis",
    "operations",
    "financialProjections",
    "assistiveTechBudget",
    "risksAndMitigations",
    "fundingPathways",
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
  ctx.push(`OWNER: ${body.clientName}`);
  ctx.push(`BUSINESS NAME: ${body.businessName}`);
  ctx.push(`CONCEPT: ${body.conceptSummary}`);
  ctx.push(`TARGET CUSTOMER: ${body.targetCustomer}`);
  ctx.push(`GEOGRAPHIC MARKET: ${body.geographicMarket}`);
  ctx.push(`STARTING BUDGET: $${body.startingBudget.toLocaleString()}`);
  if (body.natureOfCondition)
    ctx.push(`Disability context: ${body.natureOfCondition}`);
  if (body.accommodationContext)
    ctx.push(`Accommodation context:\n${body.accommodationContext}`);
  if (body.transferableSkills && body.transferableSkills.length)
    ctx.push(`Transferable skills:\n- ${body.transferableSkills.join("\n- ")}`);
  ctx.push("\nDraft the complete VR-fundable business plan. JSON only.");

  const client = new Anthropic();
  let response;
  try {
    response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 8192,
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
  try {
    return new Response(JSON.stringify(JSON.parse(textBlock.text)), {
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return jsonError("Model response was not valid JSON.", 500);
  }
}

function jsonError(error: string, status: number) {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
