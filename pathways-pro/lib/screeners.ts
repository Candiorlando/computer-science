// In-app clinical screeners. All items, scoring, and interpretation bands
// taken from the public-domain validated instruments. Hosting them here so
// counselors can administer them at intake without leaving Pathways Pro.

export interface ScreenerOption {
  value: number;
  label: string;
}

export interface ScreenerItem {
  id: string;
  text: string;
  // Optional override for an item that uses a different scale (AUDIT items
  // 9 & 10 score 0/2/4 instead of 0/1/2/3/4)
  options?: ScreenerOption[];
  // Some items are reverse-scored (e.g. DAST-10 Q3)
  reverse?: boolean;
}

export interface SeverityBand {
  min: number;
  max: number;
  label: string;
  color: "green" | "yellow" | "orange" | "red" | "blue" | "purple";
  guidance: string;
}

export interface ScreenerConfig {
  id: string;
  name: string;
  acronym: string;
  domain: string;
  source: string;
  citation: string;
  instructions: string;
  prompt: string;
  defaultOptions: ScreenerOption[];
  items: ScreenerItem[];
  bands: SeverityBand[];
  // For instruments with safety flags (PHQ-9 item 9: suicidal ideation)
  safetyItemId?: string;
  safetyMessage?: string;
}

// ─── PHQ-9 ────────────────────────────────────────────────────────────
// Depression screening. Kroenke, Spitzer & Williams (2001). Public domain
// via the PHQ Screeners site (Pfizer permission).

export const PHQ9: ScreenerConfig = {
  id: "phq9",
  name: "Patient Health Questionnaire-9",
  acronym: "PHQ-9",
  domain: "Depression severity",
  source: "Kroenke K, Spitzer RL, Williams JBW. The PHQ-9: validity of a brief depression severity measure. J Gen Intern Med. 2001;16(9):606-613.",
  citation: "PHQ-9 © Pfizer Inc. — used under public-domain permission.",
  instructions:
    "Over the last 2 weeks, how often have you been bothered by any of the following problems?",
  prompt: "Over the last 2 weeks…",
  defaultOptions: [
    { value: 0, label: "Not at all" },
    { value: 1, label: "Several days" },
    { value: 2, label: "More than half the days" },
    { value: 3, label: "Nearly every day" },
  ],
  items: [
    { id: "phq1", text: "Little interest or pleasure in doing things" },
    { id: "phq2", text: "Feeling down, depressed, or hopeless" },
    { id: "phq3", text: "Trouble falling or staying asleep, or sleeping too much" },
    { id: "phq4", text: "Feeling tired or having little energy" },
    { id: "phq5", text: "Poor appetite or overeating" },
    {
      id: "phq6",
      text:
        "Feeling bad about yourself — or that you are a failure or have let yourself or your family down",
    },
    {
      id: "phq7",
      text:
        "Trouble concentrating on things, such as reading the newspaper or watching television",
    },
    {
      id: "phq8",
      text:
        "Moving or speaking so slowly that other people could have noticed — or the opposite, being so fidgety or restless that you have been moving around a lot more than usual",
    },
    {
      id: "phq9",
      text:
        "Thoughts that you would be better off dead, or thoughts of hurting yourself in some way",
    },
  ],
  bands: [
    {
      min: 0,
      max: 4,
      label: "Minimal or no depression",
      color: "green",
      guidance:
        "No clinically significant depression indicated. Continue with intake; recheck if circumstances change.",
    },
    {
      min: 5,
      max: 9,
      label: "Mild depression",
      color: "yellow",
      guidance:
        "Watchful waiting and re-screen in 2–4 weeks. Discuss coping strategies and brief support resources.",
    },
    {
      min: 10,
      max: 14,
      label: "Moderate depression",
      color: "orange",
      guidance:
        "Treatment planning warranted. Recommend referral for counseling, possible medication evaluation.",
    },
    {
      min: 15,
      max: 19,
      label: "Moderately severe depression",
      color: "red",
      guidance:
        "Active treatment likely needed. Refer to mental health provider for clinical evaluation.",
    },
    {
      min: 20,
      max: 27,
      label: "Severe depression",
      color: "purple",
      guidance:
        "Immediate active treatment with pharmacotherapy and/or psychotherapy strongly indicated. Same-day MH referral.",
    },
  ],
  safetyItemId: "phq9",
  safetyMessage:
    "Item 9 endorsement (any score 1+) requires same-session safety assessment and follow-up planning, regardless of total score.",
};

// ─── GAD-7 ────────────────────────────────────────────────────────────
// Spitzer RL, Kroenke K, Williams JBW, Löwe B. Arch Intern Med. 2006.

export const GAD7: ScreenerConfig = {
  id: "gad7",
  name: "Generalized Anxiety Disorder-7",
  acronym: "GAD-7",
  domain: "Anxiety severity",
  source:
    "Spitzer RL, Kroenke K, Williams JBW, Löwe B. A brief measure for assessing generalized anxiety disorder. Arch Intern Med. 2006;166:1092-1097.",
  citation: "GAD-7 © Pfizer Inc. — used under public-domain permission.",
  instructions:
    "Over the last 2 weeks, how often have you been bothered by the following problems?",
  prompt: "Over the last 2 weeks…",
  defaultOptions: [
    { value: 0, label: "Not at all" },
    { value: 1, label: "Several days" },
    { value: 2, label: "More than half the days" },
    { value: 3, label: "Nearly every day" },
  ],
  items: [
    { id: "gad1", text: "Feeling nervous, anxious, or on edge" },
    { id: "gad2", text: "Not being able to stop or control worrying" },
    { id: "gad3", text: "Worrying too much about different things" },
    { id: "gad4", text: "Trouble relaxing" },
    { id: "gad5", text: "Being so restless that it is hard to sit still" },
    { id: "gad6", text: "Becoming easily annoyed or irritable" },
    { id: "gad7", text: "Feeling afraid as if something awful might happen" },
  ],
  bands: [
    {
      min: 0,
      max: 4,
      label: "Minimal anxiety",
      color: "green",
      guidance: "No clinically significant anxiety indicated.",
    },
    {
      min: 5,
      max: 9,
      label: "Mild anxiety",
      color: "yellow",
      guidance: "Monitor; psychoeducation and brief coping strategies.",
    },
    {
      min: 10,
      max: 14,
      label: "Moderate anxiety",
      color: "orange",
      guidance:
        "Further evaluation warranted. Consider referral for CBT or pharmacotherapy consultation.",
    },
    {
      min: 15,
      max: 21,
      label: "Severe anxiety",
      color: "red",
      guidance:
        "Active treatment needed. Refer to mental health provider for clinical evaluation.",
    },
  ],
};

// ─── AUDIT ────────────────────────────────────────────────────────────
// Saunders, Aasland, Babor, et al. WHO 1993. Public domain.

export const AUDIT: ScreenerConfig = {
  id: "audit",
  name: "Alcohol Use Disorders Identification Test",
  acronym: "AUDIT",
  domain: "Hazardous and harmful alcohol use",
  source:
    "Saunders JB, Aasland OG, Babor TF, de la Fuente JR, Grant M. Development of the Alcohol Use Disorders Identification Test (AUDIT). WHO. Addiction. 1993;88:791-804.",
  citation: "WHO public-domain instrument.",
  instructions:
    "These questions are about your use of alcoholic beverages during the past year. A 'drink' = 12 oz beer, 5 oz wine, or 1.5 oz spirits.",
  prompt: "In the past year…",
  defaultOptions: [
    { value: 0, label: "Never" },
    { value: 1, label: "Less than monthly" },
    { value: 2, label: "Monthly" },
    { value: 3, label: "Weekly" },
    { value: 4, label: "Daily or almost daily" },
  ],
  items: [
    {
      id: "audit1",
      text: "How often do you have a drink containing alcohol?",
      options: [
        { value: 0, label: "Never" },
        { value: 1, label: "Monthly or less" },
        { value: 2, label: "2–4 times a month" },
        { value: 3, label: "2–3 times a week" },
        { value: 4, label: "4 or more times a week" },
      ],
    },
    {
      id: "audit2",
      text: "How many standard drinks do you have on a typical day when drinking?",
      options: [
        { value: 0, label: "1 or 2" },
        { value: 1, label: "3 or 4" },
        { value: 2, label: "5 or 6" },
        { value: 3, label: "7 to 9" },
        { value: 4, label: "10 or more" },
      ],
    },
    {
      id: "audit3",
      text: "How often do you have six or more drinks on one occasion?",
    },
    {
      id: "audit4",
      text:
        "How often during the last year have you found you were not able to stop drinking once you had started?",
    },
    {
      id: "audit5",
      text:
        "How often during the last year have you failed to do what was normally expected of you because of drinking?",
    },
    {
      id: "audit6",
      text:
        "How often during the last year have you needed a drink in the morning to get yourself going after a heavy drinking session?",
    },
    {
      id: "audit7",
      text:
        "How often during the last year have you had a feeling of guilt or remorse after drinking?",
    },
    {
      id: "audit8",
      text:
        "How often during the last year have you been unable to remember what happened the night before because of your drinking?",
    },
    {
      id: "audit9",
      text:
        "Have you or someone else been injured as a result of your drinking?",
      options: [
        { value: 0, label: "No" },
        { value: 2, label: "Yes, but not in the last year" },
        { value: 4, label: "Yes, during the last year" },
      ],
    },
    {
      id: "audit10",
      text:
        "Has a relative, friend, doctor, or other health worker been concerned about your drinking or suggested you cut down?",
      options: [
        { value: 0, label: "No" },
        { value: 2, label: "Yes, but not in the last year" },
        { value: 4, label: "Yes, during the last year" },
      ],
    },
  ],
  bands: [
    {
      min: 0,
      max: 7,
      label: "Low-risk drinking",
      color: "green",
      guidance: "Educate on low-risk drinking limits.",
    },
    {
      min: 8,
      max: 15,
      label: "Hazardous or harmful drinking",
      color: "yellow",
      guidance:
        "Brief advice and routine monitoring. Provide harm-reduction information.",
    },
    {
      min: 16,
      max: 19,
      label: "Harmful or high-risk drinking",
      color: "orange",
      guidance:
        "Brief counseling and continued monitoring. Refer for assessment.",
    },
    {
      min: 20,
      max: 40,
      label: "Possible alcohol dependence",
      color: "red",
      guidance:
        "Diagnostic evaluation and treatment referral indicated.",
    },
  ],
};

// ─── DAST-10 ──────────────────────────────────────────────────────────
// Skinner HA. Addict Behav. 1982. Public domain.
// Drug Abuse Screening Test — non-alcohol substance use.

export const DAST10: ScreenerConfig = {
  id: "dast10",
  name: "Drug Abuse Screening Test (10-item)",
  acronym: "DAST-10",
  domain: "Drug use other than alcohol",
  source:
    "Skinner HA. The drug abuse screening test. Addict Behav. 1982;7(4):363-371.",
  citation: "Public-domain instrument; NIH-distributed.",
  instructions:
    "The following questions concern information about your possible involvement with drugs not including alcohol or tobacco. 'Drug abuse' refers to the use of prescribed or over-the-counter drugs in excess of the directions, and any non-medical use of drugs.",
  prompt: "In the past 12 months…",
  defaultOptions: [
    { value: 0, label: "No" },
    { value: 1, label: "Yes" },
  ],
  items: [
    {
      id: "dast1",
      text: "Have you used drugs other than those required for medical reasons?",
    },
    { id: "dast2", text: "Do you abuse more than one drug at a time?" },
    {
      id: "dast3",
      text: "Are you always able to stop using drugs when you want to?",
      reverse: true,
    },
    {
      id: "dast4",
      text: "Have you had blackouts or flashbacks as a result of drug use?",
    },
    { id: "dast5", text: "Do you ever feel bad or guilty about your drug use?" },
    {
      id: "dast6",
      text:
        "Does your spouse (or parents) ever complain about your involvement with drugs?",
    },
    {
      id: "dast7",
      text: "Have you neglected your family because of your use of drugs?",
    },
    {
      id: "dast8",
      text: "Have you engaged in illegal activities in order to obtain drugs?",
    },
    {
      id: "dast9",
      text:
        "Have you ever experienced withdrawal symptoms (felt sick) when you stopped taking drugs?",
    },
    {
      id: "dast10",
      text:
        "Have you had medical problems as a result of your drug use (e.g., memory loss, hepatitis, convulsions, bleeding)?",
    },
  ],
  bands: [
    {
      min: 0,
      max: 0,
      label: "No problems reported",
      color: "green",
      guidance: "No further action indicated based on screening.",
    },
    {
      min: 1,
      max: 2,
      label: "Low level",
      color: "yellow",
      guidance:
        "Provide harm-reduction information and follow-up monitoring.",
    },
    {
      min: 3,
      max: 5,
      label: "Moderate level",
      color: "orange",
      guidance: "Further investigation warranted. Recommend assessment.",
    },
    {
      min: 6,
      max: 8,
      label: "Substantial level",
      color: "red",
      guidance: "Intensive assessment and treatment referral indicated.",
    },
    {
      min: 9,
      max: 10,
      label: "Severe level",
      color: "purple",
      guidance:
        "Intensive treatment likely required; immediate substance-use treatment referral.",
    },
  ],
};

// ─── CAGE ─────────────────────────────────────────────────────────────
// Ewing JA. JAMA. 1984. Public domain. Brief alcohol screen.

export const CAGE: ScreenerConfig = {
  id: "cage",
  name: "CAGE Questionnaire",
  acronym: "CAGE",
  domain: "Brief alcohol use screening",
  source:
    "Ewing JA. Detecting alcoholism: the CAGE questionnaire. JAMA. 1984;252(14):1905-1907.",
  citation: "Public-domain instrument.",
  instructions:
    "Answer each question yes or no based on your lifetime experience with alcohol.",
  prompt: "Have you ever…",
  defaultOptions: [
    { value: 0, label: "No" },
    { value: 1, label: "Yes" },
  ],
  items: [
    {
      id: "cage1",
      text: "Felt you needed to Cut down on your drinking?",
    },
    {
      id: "cage2",
      text: "Had people Annoy you by criticizing your drinking?",
    },
    { id: "cage3", text: "Felt bad or Guilty about your drinking?" },
    {
      id: "cage4",
      text:
        "Had a drink first thing in the morning (Eye-opener) to steady nerves or get rid of a hangover?",
    },
  ],
  bands: [
    {
      min: 0,
      max: 1,
      label: "Negative screen",
      color: "green",
      guidance: "Below clinical significance threshold for alcohol-use disorder.",
    },
    {
      min: 2,
      max: 4,
      label: "Positive screen — clinically significant",
      color: "red",
      guidance:
        "Two or more affirmative answers indicates clinically significant alcohol concerns. Follow up with AUDIT or AUDIT-C and consider full assessment.",
    },
  ],
};

// ─── WHODAS 2.0 12-item ───────────────────────────────────────────────
// WHO Disability Assessment Schedule 2.0, 12-item self-administered version.

export const WHODAS12: ScreenerConfig = {
  id: "whodas12",
  name: "WHO Disability Assessment Schedule 2.0 (12-item)",
  acronym: "WHODAS 2.0",
  domain: "Functional disability across six life domains",
  source:
    "WHO. Measuring Health and Disability: Manual for WHO Disability Assessment Schedule. WHODAS 2.0. WHO Press; 2010.",
  citation: "World Health Organization — public-domain instrument.",
  instructions:
    "This questionnaire asks about difficulties due to health or mental health conditions. Think about the last 30 days and answer how much difficulty you have had doing each activity.",
  prompt: "In the last 30 days, how much difficulty did you have in…",
  defaultOptions: [
    { value: 1, label: "None" },
    { value: 2, label: "Mild" },
    { value: 3, label: "Moderate" },
    { value: 4, label: "Severe" },
    { value: 5, label: "Extreme / cannot do" },
  ],
  items: [
    { id: "w1", text: "Standing for long periods, such as 30 minutes?" },
    { id: "w2", text: "Taking care of your household responsibilities?" },
    {
      id: "w3",
      text:
        "Learning a new task, for example, learning how to get to a new place?",
    },
    {
      id: "w4",
      text:
        "How much of a problem did you have joining in community activities (parties, religious activities, other) in the same way anyone else can?",
    },
    {
      id: "w5",
      text:
        "How much have you been emotionally affected by your health problems?",
    },
    { id: "w6", text: "Concentrating on doing something for ten minutes?" },
    { id: "w7", text: "Walking a long distance, such as a kilometer?" },
    { id: "w8", text: "Washing your whole body?" },
    { id: "w9", text: "Getting dressed?" },
    { id: "w10", text: "Dealing with people you do not know?" },
    { id: "w11", text: "Maintaining a friendship?" },
    { id: "w12", text: "Your day-to-day work or school?" },
  ],
  bands: [
    {
      min: 12,
      max: 17,
      label: "No to mild disability",
      color: "green",
      guidance:
        "Minimal functional limitation across daily life domains.",
    },
    {
      min: 18,
      max: 28,
      label: "Mild disability",
      color: "yellow",
      guidance:
        "Some limitations — typically requires minor accommodation. Document functional impact for IPE.",
    },
    {
      min: 29,
      max: 40,
      label: "Moderate disability",
      color: "orange",
      guidance:
        "Substantial limitations across multiple domains. Plan for ongoing support and reasonable accommodations.",
    },
    {
      min: 41,
      max: 52,
      label: "Severe disability",
      color: "red",
      guidance:
        "Major functional impact. Significant accommodations, supported employment, or assistive technology likely indicated.",
    },
    {
      min: 53,
      max: 60,
      label: "Extreme disability",
      color: "purple",
      guidance:
        "Very significant functional impact. Customized supports, intensive case management, and possibly supported employment indicated.",
    },
  ],
};

// ─── Registry ─────────────────────────────────────────────────────────

export const SCREENERS: Record<string, ScreenerConfig> = {
  phq9: PHQ9,
  gad7: GAD7,
  audit: AUDIT,
  dast10: DAST10,
  cage: CAGE,
  whodas12: WHODAS12,
};

export const SCREENER_IDS = Object.keys(SCREENERS);

// ─── Scoring ──────────────────────────────────────────────────────────

export interface ScreenerResult {
  screenerId: string;
  acronym: string;
  totalScore: number;
  maxScore: number;
  band: SeverityBand;
  itemScores: Record<string, number>;
  safetyFlag?: { itemId: string; value: number; message: string };
  completedAt: string;
}

export function scoreScreener(
  config: ScreenerConfig,
  answers: Record<string, number>,
): ScreenerResult {
  let total = 0;
  let max = 0;
  for (const item of config.items) {
    const opts = item.options ?? config.defaultOptions;
    const v = answers[item.id] ?? 0;
    const maxOptVal = Math.max(...opts.map((o) => o.value));
    const minOptVal = Math.min(...opts.map((o) => o.value));
    if (item.reverse) {
      total += maxOptVal - v + minOptVal;
    } else {
      total += v;
    }
    max += maxOptVal;
  }

  const band =
    config.bands.find((b) => total >= b.min && total <= b.max) ??
    config.bands[config.bands.length - 1];

  let safetyFlag: ScreenerResult["safetyFlag"];
  if (config.safetyItemId) {
    const safetyVal = answers[config.safetyItemId] ?? 0;
    if (safetyVal > 0 && config.safetyMessage) {
      safetyFlag = {
        itemId: config.safetyItemId,
        value: safetyVal,
        message: config.safetyMessage,
      };
    }
  }

  return {
    screenerId: config.id,
    acronym: config.acronym,
    totalScore: total,
    maxScore: max,
    band,
    itemScores: { ...answers },
    safetyFlag,
    completedAt: new Date().toISOString(),
  };
}

// ─── Storage ──────────────────────────────────────────────────────────

const RESULTS_KEY = "pathways-pro:screener-results-v1";

export function loadScreenerResults(): ScreenerResult[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RESULTS_KEY);
    return raw ? (JSON.parse(raw) as ScreenerResult[]) : [];
  } catch {
    return [];
  }
}

export function saveScreenerResult(result: ScreenerResult) {
  if (typeof window === "undefined") return;
  const cur = loadScreenerResults();
  // Replace any existing result for the same screener
  const filtered = cur.filter((r) => r.screenerId !== result.screenerId);
  filtered.unshift(result);
  window.localStorage.setItem(RESULTS_KEY, JSON.stringify(filtered));
}

export function loadLatestResult(screenerId: string): ScreenerResult | null {
  return loadScreenerResults().find((r) => r.screenerId === screenerId) ?? null;
}
