// Big Five — Mini-IPIP (Donnellan et al., 2006, public domain — Goldberg's IPIP).
// 20 items, 5-point Likert. Reverse-scored items marked with reverse: true.
// Cite: Donnellan, M. B., et al. (2006). Psychological Assessment, 18(2), 192-203.
// Source: https://ipip.ori.org/MiniIPIP.htm
export type BigFiveTrait = "E" | "A" | "C" | "N" | "O";

export interface BigFiveItem {
  id: string;
  text: string;
  trait: BigFiveTrait;
  reverse: boolean;
}

export const bigFiveItems: BigFiveItem[] = [
  { id: "b1", text: "Am the life of the party.", trait: "E", reverse: false },
  { id: "b2", text: "Sympathize with others' feelings.", trait: "A", reverse: false },
  { id: "b3", text: "Get chores done right away.", trait: "C", reverse: false },
  { id: "b4", text: "Have frequent mood swings.", trait: "N", reverse: false },
  { id: "b5", text: "Have a vivid imagination.", trait: "O", reverse: false },
  { id: "b6", text: "Don't talk a lot.", trait: "E", reverse: true },
  { id: "b7", text: "Am not interested in other people's problems.", trait: "A", reverse: true },
  { id: "b8", text: "Often forget to put things back in their proper place.", trait: "C", reverse: true },
  { id: "b9", text: "Am relaxed most of the time.", trait: "N", reverse: true },
  { id: "b10", text: "Am not interested in abstract ideas.", trait: "O", reverse: true },
  { id: "b11", text: "Talk to a lot of different people at parties.", trait: "E", reverse: false },
  { id: "b12", text: "Feel others' emotions.", trait: "A", reverse: false },
  { id: "b13", text: "Like order.", trait: "C", reverse: false },
  { id: "b14", text: "Get upset easily.", trait: "N", reverse: false },
  { id: "b15", text: "Have difficulty understanding abstract ideas.", trait: "O", reverse: true },
  { id: "b16", text: "Keep in the background.", trait: "E", reverse: true },
  { id: "b17", text: "Am not really interested in others.", trait: "A", reverse: true },
  { id: "b18", text: "Make a mess of things.", trait: "C", reverse: true },
  { id: "b19", text: "Seldom feel blue.", trait: "N", reverse: true },
  { id: "b20", text: "Do not have a good imagination.", trait: "O", reverse: true },
];

// Holland RIASEC — short interest inventory.
// Items adapted from the public-domain O*NET Interest Profiler (US Dept of Labor).
// Each item is a work activity; respondent rates Like / Unsure / Dislike (1–5 scale used here).
// Source: https://www.onetonline.org/explore/interests/
export type RiasecType = "R" | "I" | "A" | "S" | "E" | "C";

export interface RiasecItem {
  id: string;
  text: string;
  type: RiasecType;
}

export const riasecItems: RiasecItem[] = [
  // Realistic — hands-on, physical, mechanical
  { id: "r1", text: "Build kitchen cabinets", type: "R" },
  { id: "r2", text: "Repair household appliances", type: "R" },
  { id: "r3", text: "Drive a truck to deliver packages", type: "R" },
  { id: "r4", text: "Assemble electronic parts", type: "R" },
  // Investigative — analytical, scientific
  { id: "i1", text: "Study the movement of planets", type: "I" },
  { id: "i2", text: "Examine blood samples using a microscope", type: "I" },
  { id: "i3", text: "Investigate the cause of a fire", type: "I" },
  { id: "i4", text: "Develop a new medicine", type: "I" },
  // Artistic — creative, expressive
  { id: "a1", text: "Write books or plays", type: "A" },
  { id: "a2", text: "Compose or arrange music", type: "A" },
  { id: "a3", text: "Direct a play or film", type: "A" },
  { id: "a4", text: "Design artwork for magazines", type: "A" },
  // Social — helping, teaching
  { id: "s1", text: "Teach a high-school class", type: "S" },
  { id: "s2", text: "Help people with personal or emotional problems", type: "S" },
  { id: "s3", text: "Take care of children at a daycare", type: "S" },
  { id: "s4", text: "Give career guidance to people", type: "S" },
  // Enterprising — leading, persuading, selling
  { id: "e1", text: "Start your own business", type: "E" },
  { id: "e2", text: "Negotiate business contracts", type: "E" },
  { id: "e3", text: "Manage a retail store", type: "E" },
  { id: "e4", text: "Sell merchandise at a department store", type: "E" },
  // Conventional — organized, detail-oriented
  { id: "c1", text: "Keep shipping and receiving records", type: "C" },
  { id: "c2", text: "Calculate the wages of employees", type: "C" },
  { id: "c3", text: "Inventory supplies using a hand-held computer", type: "C" },
  { id: "c4", text: "Operate a calculator", type: "C" },
];

export interface BigFiveScores {
  E: number; A: number; C: number; N: number; O: number;
}
export interface RiasecScores {
  R: number; I: number; A: number; S: number; E: number; C: number;
}

export function scoreBigFive(answers: Record<string, number>): BigFiveScores {
  const sums: BigFiveScores = { E: 0, A: 0, C: 0, N: 0, O: 0 };
  const counts: BigFiveScores = { E: 0, A: 0, C: 0, N: 0, O: 0 };
  for (const item of bigFiveItems) {
    const raw = answers[item.id];
    if (typeof raw !== "number") continue;
    const score = item.reverse ? 6 - raw : raw;
    sums[item.trait] += score;
    counts[item.trait] += 1;
  }
  // Normalize each trait to 0–100
  const out: BigFiveScores = { E: 0, A: 0, C: 0, N: 0, O: 0 };
  (Object.keys(sums) as BigFiveTrait[]).forEach((t) => {
    if (counts[t] === 0) return;
    const avg = sums[t] / counts[t]; // 1..5
    out[t] = Math.round(((avg - 1) / 4) * 100);
  });
  return out;
}

export function scoreRiasec(answers: Record<string, number>): RiasecScores {
  const sums: RiasecScores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  const counts: RiasecScores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  for (const item of riasecItems) {
    const raw = answers[item.id];
    if (typeof raw !== "number") continue;
    sums[item.type] += raw;
    counts[item.type] += 1;
  }
  const out: RiasecScores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  (Object.keys(sums) as RiasecType[]).forEach((t) => {
    if (counts[t] === 0) return;
    const avg = sums[t] / counts[t];
    out[t] = Math.round(((avg - 1) / 4) * 100);
  });
  return out;
}

export function hollandCode(scores: RiasecScores): string {
  return (Object.entries(scores) as [RiasecType, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([t]) => t)
    .join("");
}

export const traitNames: Record<BigFiveTrait, string> = {
  E: "Extraversion",
  A: "Agreeableness",
  C: "Conscientiousness",
  N: "Neuroticism",
  O: "Openness",
};

export const riasecNames: Record<RiasecType, string> = {
  R: "Realistic",
  I: "Investigative",
  A: "Artistic",
  S: "Social",
  E: "Enterprising",
  C: "Conventional",
};
