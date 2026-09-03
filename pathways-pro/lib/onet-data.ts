// Curated subset of O*NET occupations with their primary RIASEC interest profiles,
// typical Job Zone (1=little prep, 5=extensive prep), median wage band, and notes
// on common entry paths including apprenticeship / on-the-job training.
//
// Data sourced and condensed from:
//   - O*NET 28.0 Interests & Job Zone files (public domain, US Dept of Labor)
//     https://www.onetcenter.org/database.html
//   - BLS Occupational Outlook Handbook https://www.bls.gov/ooh/
//   - apprenticeship.gov occupation finder https://www.apprenticeship.gov/apprenticeship-occupations
//
// This is a representative slice — about 60 occupations covering a wide range of
// interests and education levels. The full O*NET has ~900+ occupations; if/when
// you wire up the live O*NET Web Services API (free, requires registration at
// https://services.onetcenter.org), swap this file out for a live fetch.

import type { RiasecScores, RiasecType } from "./assessments";

export interface Occupation {
  socCode: string;        // O*NET-SOC code
  title: string;
  riasec: [RiasecType, RiasecType, RiasecType]; // primary, secondary, tertiary
  jobZone: 1 | 2 | 3 | 4 | 5;
  // 1: little or no preparation; 2: some prep (HS diploma + brief OJT)
  // 3: medium prep (vocational, associates, or apprenticeship)
  // 4: considerable prep (bachelor's + experience)
  // 5: extensive prep (graduate degree)
  medianWageBand: "<35k" | "35-50k" | "50-75k" | "75-100k" | "100k+";
  apprenticeshipPath: boolean; // formally listed on apprenticeship.gov
  onTheJobTraining: boolean;
  blurb: string;
}

export const occupations: Occupation[] = [
  // Realistic-dominant (R)
  { socCode: "47-2031.00", title: "Carpenter", riasec: ["R", "C", "I"], jobZone: 3, medianWageBand: "50-75k", apprenticeshipPath: true, onTheJobTraining: true, blurb: "Build and repair structures from wood and other materials. Strong apprenticeship pipeline through union and contractor programs." },
  { socCode: "47-2111.00", title: "Electrician", riasec: ["R", "I", "C"], jobZone: 3, medianWageBand: "50-75k", apprenticeshipPath: true, onTheJobTraining: true, blurb: "Install and maintain electrical systems. 4–5 year registered apprenticeship is the standard entry path; licensure required in most states." },
  { socCode: "47-2152.02", title: "Plumber", riasec: ["R", "C", "I"], jobZone: 3, medianWageBand: "50-75k", apprenticeshipPath: true, onTheJobTraining: true, blurb: "Install and repair pipes and plumbing systems. Apprenticeship + licensing exam." },
  { socCode: "49-3023.00", title: "Automotive Service Technician", riasec: ["R", "I", "C"], jobZone: 3, medianWageBand: "35-50k", apprenticeshipPath: true, onTheJobTraining: true, blurb: "Diagnose and repair cars. Postsecondary vocational program or dealership apprenticeship; ASE certifications strongly preferred." },
  { socCode: "53-3032.00", title: "Heavy and Tractor-Trailer Truck Driver", riasec: ["R", "C", "E"], jobZone: 2, medianWageBand: "50-75k", apprenticeshipPath: true, onTheJobTraining: true, blurb: "CDL required; many carriers offer paid CDL training in exchange for a 1-year commitment." },
  { socCode: "49-9071.00", title: "Maintenance and Repair Worker, General", riasec: ["R", "C", "I"], jobZone: 2, medianWageBand: "35-50k", apprenticeshipPath: false, onTheJobTraining: true, blurb: "Fix buildings, machines, and equipment. Strong OJT path; HVAC or electrical certifications boost pay." },
  { socCode: "45-2092.00", title: "Farmworker / Agricultural Laborer", riasec: ["R", "C", "S"], jobZone: 1, medianWageBand: "<35k", apprenticeshipPath: false, onTheJobTraining: true, blurb: "Seasonal field and harvest work. Entry-level; potential to advance to crew lead or farm operator." },
  { socCode: "49-9021.01", title: "Heating, Air Conditioning, and Refrigeration Mechanic", riasec: ["R", "I", "C"], jobZone: 3, medianWageBand: "50-75k", apprenticeshipPath: true, onTheJobTraining: true, blurb: "HVAC techs install and service climate systems. Apprenticeship or 6–24 month vocational program; EPA Section 608 cert required to handle refrigerants." },
  { socCode: "51-4121.06", title: "Welder", riasec: ["R", "C", "I"], jobZone: 2, medianWageBand: "35-50k", apprenticeshipPath: true, onTheJobTraining: true, blurb: "Join metal parts using heat. 6-18 month vocational program or apprenticeship; AWS certifications open higher-pay specialty work." },
  { socCode: "33-2011.00", title: "Firefighter", riasec: ["R", "S", "E"], jobZone: 3, medianWageBand: "50-75k", apprenticeshipPath: false, onTheJobTraining: true, blurb: "Respond to fires and medical emergencies. Academy training + EMT certification; physically demanding and team-based." },

  // Investigative-dominant (I)
  { socCode: "15-1252.00", title: "Software Developer", riasec: ["I", "C", "R"], jobZone: 4, medianWageBand: "100k+", apprenticeshipPath: true, onTheJobTraining: false, blurb: "Design and build software. Bachelor's typical but bootcamps, apprenticeships, and self-taught paths are increasingly common." },
  { socCode: "15-1232.00", title: "Computer User Support Specialist", riasec: ["I", "C", "S"], jobZone: 3, medianWageBand: "50-75k", apprenticeshipPath: true, onTheJobTraining: true, blurb: "Front-line IT help-desk. Associates degree or industry certs (CompTIA A+, Network+) are sufficient." },
  { socCode: "15-1244.00", title: "Network and Computer Systems Administrator", riasec: ["I", "C", "R"], jobZone: 4, medianWageBand: "75-100k", apprenticeshipPath: false, onTheJobTraining: false, blurb: "Maintain organization's computer networks. Bachelor's preferred; experience and certs (CCNA, MCSA) substitute in many roles." },
  { socCode: "29-1141.00", title: "Registered Nurse", riasec: ["I", "S", "C"], jobZone: 4, medianWageBand: "75-100k", apprenticeshipPath: true, onTheJobTraining: false, blurb: "Provide and coordinate patient care. ADN (2 yr) or BSN (4 yr) + NCLEX licensure. Apprenticeship-style residencies common." },
  { socCode: "19-4031.00", title: "Chemical Technician", riasec: ["I", "R", "C"], jobZone: 3, medianWageBand: "50-75k", apprenticeshipPath: false, onTheJobTraining: true, blurb: "Assist chemists in labs. Associates degree in chemical technology or 2-year industry training program." },
  { socCode: "29-2052.00", title: "Pharmacy Technician", riasec: ["I", "C", "S"], jobZone: 3, medianWageBand: "35-50k", apprenticeshipPath: true, onTheJobTraining: true, blurb: "Help pharmacists dispense medication. Short postsecondary cert + state license; entry path from retail." },
  { socCode: "13-2011.00", title: "Accountant or Auditor", riasec: ["I", "C", "E"], jobZone: 4, medianWageBand: "75-100k", apprenticeshipPath: false, onTheJobTraining: false, blurb: "Prepare and examine financial records. Bachelor's + CPA for higher-level roles." },
  { socCode: "19-3033.00", title: "Clinical and Counseling Psychologist", riasec: ["I", "S", "A"], jobZone: 5, medianWageBand: "75-100k", apprenticeshipPath: false, onTheJobTraining: false, blurb: "Diagnose and treat mental, emotional, and behavioral disorders. Doctoral degree + supervised practice + licensure." },
  { socCode: "29-1228.00", title: "Physician (General)", riasec: ["I", "S", "R"], jobZone: 5, medianWageBand: "100k+", apprenticeshipPath: false, onTheJobTraining: false, blurb: "Diagnose and treat illness. MD/DO + residency (3-7 yrs) + state licensure." },

  // Artistic-dominant (A)
  { socCode: "27-1024.00", title: "Graphic Designer", riasec: ["A", "E", "C"], jobZone: 3, medianWageBand: "50-75k", apprenticeshipPath: false, onTheJobTraining: false, blurb: "Create visual concepts. Associate or bachelor's + strong portfolio." },
  { socCode: "27-3043.05", title: "Writer or Author", riasec: ["A", "I", "E"], jobZone: 4, medianWageBand: "50-75k", apprenticeshipPath: false, onTheJobTraining: false, blurb: "Write content for media. Bachelor's typical; portfolio matters more than degree in many sub-fields." },
  { socCode: "27-2042.00", title: "Musician or Singer", riasec: ["A", "S", "E"], jobZone: 4, medianWageBand: "35-50k", apprenticeshipPath: false, onTheJobTraining: false, blurb: "Perform music. Talent + extensive practice; degree optional but common in classical/jazz." },
  { socCode: "27-1014.00", title: "Multimedia Artist or Animator", riasec: ["A", "I", "C"], jobZone: 4, medianWageBand: "75-100k", apprenticeshipPath: false, onTheJobTraining: false, blurb: "Create animation and visual effects. Bachelor's + portfolio." },
  { socCode: "39-5012.00", title: "Hairdresser or Cosmetologist", riasec: ["A", "S", "E"], jobZone: 2, medianWageBand: "<35k", apprenticeshipPath: true, onTheJobTraining: true, blurb: "Cut and style hair. 9–12 month cosmetology school + state license; apprenticeship licensing path available in some states." },
  { socCode: "35-1011.00", title: "Chef or Head Cook", riasec: ["A", "E", "R"], jobZone: 3, medianWageBand: "50-75k", apprenticeshipPath: true, onTheJobTraining: true, blurb: "Direct food preparation. Culinary school OR American Culinary Federation apprenticeship; long hours, high turnover." },

  // Social-dominant (S)
  { socCode: "25-2021.00", title: "Elementary School Teacher", riasec: ["S", "A", "C"], jobZone: 4, medianWageBand: "50-75k", apprenticeshipPath: true, onTheJobTraining: false, blurb: "Teach K–5. Bachelor's + state teaching license; residency / apprenticeship pathways exist in many states." },
  { socCode: "21-1093.00", title: "Social and Human Service Assistant", riasec: ["S", "C", "E"], jobZone: 2, medianWageBand: "35-50k", apprenticeshipPath: false, onTheJobTraining: true, blurb: "Help clients access services. HS diploma + OJT; bachelor's preferred for higher roles." },
  { socCode: "31-1131.00", title: "Nursing Assistant (CNA)", riasec: ["S", "R", "C"], jobZone: 2, medianWageBand: "<35k", apprenticeshipPath: true, onTheJobTraining: true, blurb: "Assist nurses with patient care. 4–12 week state-approved program + competency exam. Common stepping-stone to LPN/RN." },
  { socCode: "29-2061.00", title: "Licensed Practical Nurse (LPN)", riasec: ["S", "I", "R"], jobZone: 3, medianWageBand: "50-75k", apprenticeshipPath: true, onTheJobTraining: false, blurb: "Provide basic nursing care. 12–18 month state-approved program + NCLEX-PN." },
  { socCode: "21-1014.00", title: "Mental Health Counselor", riasec: ["S", "I", "A"], jobZone: 5, medianWageBand: "50-75k", apprenticeshipPath: false, onTheJobTraining: false, blurb: "Counsel clients on mental and emotional health. Master's + state license + supervised hours." },
  { socCode: "21-1015.00", title: "Rehabilitation Counselor", riasec: ["S", "I", "C"], jobZone: 5, medianWageBand: "35-50k", apprenticeshipPath: false, onTheJobTraining: false, blurb: "Help people with disabilities live independently and find work. Master's typical; CRC certification preferred." },
  { socCode: "39-9011.00", title: "Childcare Worker", riasec: ["S", "A", "C"], jobZone: 2, medianWageBand: "<35k", apprenticeshipPath: true, onTheJobTraining: true, blurb: "Care for young children. CDA credential or state cert; apprenticeship paths increasing." },
  { socCode: "31-9092.00", title: "Medical Assistant", riasec: ["S", "C", "R"], jobZone: 3, medianWageBand: "35-50k", apprenticeshipPath: true, onTheJobTraining: true, blurb: "Support physicians in clinics. 9–12 month cert program or apprenticeship; CMA/RMA cert preferred." },
  { socCode: "21-2011.00", title: "Clergy", riasec: ["S", "A", "E"], jobZone: 5, medianWageBand: "50-75k", apprenticeshipPath: false, onTheJobTraining: false, blurb: "Lead religious congregations. Varies by denomination; often graduate-level theological training." },

  // Enterprising-dominant (E)
  { socCode: "41-2031.00", title: "Retail Salesperson", riasec: ["E", "S", "C"], jobZone: 2, medianWageBand: "<35k", apprenticeshipPath: false, onTheJobTraining: true, blurb: "Sell merchandise. Entry-level; commission roles can pay well; common stepping-stone to retail management." },
  { socCode: "11-9051.00", title: "Food Service Manager", riasec: ["E", "C", "S"], jobZone: 3, medianWageBand: "50-75k", apprenticeshipPath: false, onTheJobTraining: true, blurb: "Plan and oversee restaurant operations. HS + 5 yrs experience OR associates + 2 yrs typical." },
  { socCode: "41-9022.00", title: "Real Estate Sales Agent", riasec: ["E", "C", "S"], jobZone: 3, medianWageBand: "50-75k", apprenticeshipPath: false, onTheJobTraining: true, blurb: "Sell and rent real estate. State license (60–180 hrs of coursework + exam); commission-based." },
  { socCode: "11-3031.00", title: "Financial Manager", riasec: ["E", "C", "I"], jobZone: 5, medianWageBand: "100k+", apprenticeshipPath: false, onTheJobTraining: false, blurb: "Direct financial operations. Bachelor's + 5+ yrs experience; CFA/CPA often help." },
  { socCode: "13-1161.00", title: "Marketing Specialist", riasec: ["E", "A", "I"], jobZone: 4, medianWageBand: "50-75k", apprenticeshipPath: false, onTheJobTraining: false, blurb: "Research market conditions and create campaigns. Bachelor's typical." },
  { socCode: "33-3051.00", title: "Police Officer", riasec: ["E", "S", "R"], jobZone: 3, medianWageBand: "50-75k", apprenticeshipPath: false, onTheJobTraining: true, blurb: "Maintain order and enforce law. HS + police academy (12–24 weeks); some agencies require college credits." },
  { socCode: "13-1071.00", title: "Human Resources Specialist", riasec: ["E", "S", "C"], jobZone: 4, medianWageBand: "50-75k", apprenticeshipPath: false, onTheJobTraining: false, blurb: "Recruit and place workers. Bachelor's typical; PHR/SHRM-CP certs help." },
  { socCode: "11-1011.00", title: "Chief Executive (Small Business)", riasec: ["E", "C", "S"], jobZone: 5, medianWageBand: "100k+", apprenticeshipPath: false, onTheJobTraining: false, blurb: "Run a company. Varied paths; experience and track record matter more than degree." },

  // Conventional-dominant (C)
  { socCode: "43-3031.00", title: "Bookkeeping or Accounting Clerk", riasec: ["C", "I", "E"], jobZone: 3, medianWageBand: "35-50k", apprenticeshipPath: true, onTheJobTraining: true, blurb: "Record financial transactions. HS diploma + OJT or short cert program." },
  { socCode: "43-4051.00", title: "Customer Service Representative", riasec: ["C", "S", "E"], jobZone: 2, medianWageBand: "35-50k", apprenticeshipPath: false, onTheJobTraining: true, blurb: "Resolve customer complaints. HS + paid OJT; remote options widely available." },
  { socCode: "43-6014.00", title: "Secretary or Administrative Assistant", riasec: ["C", "E", "S"], jobZone: 3, medianWageBand: "35-50k", apprenticeshipPath: false, onTheJobTraining: true, blurb: "Perform routine clerical and administrative tasks. HS + OJT." },
  { socCode: "43-9021.00", title: "Data Entry Keyer", riasec: ["C", "R", "I"], jobZone: 2, medianWageBand: "<35k", apprenticeshipPath: false, onTheJobTraining: true, blurb: "Enter data into computer systems. HS + brief OJT; remote-friendly." },
  { socCode: "13-2082.00", title: "Tax Preparer", riasec: ["C", "I", "E"], jobZone: 3, medianWageBand: "35-50k", apprenticeshipPath: false, onTheJobTraining: true, blurb: "Prepare tax returns. HS + short course (often paid by employer); IRS PTIN required; seasonal work common." },
  { socCode: "53-3033.00", title: "Light Truck or Delivery Driver", riasec: ["C", "R", "S"], jobZone: 2, medianWageBand: "35-50k", apprenticeshipPath: false, onTheJobTraining: true, blurb: "Drive trucks for local deliveries. HS + clean driving record; OJT." },
  { socCode: "43-5071.00", title: "Shipping, Receiving, and Inventory Clerk", riasec: ["C", "R", "E"], jobZone: 2, medianWageBand: "35-50k", apprenticeshipPath: false, onTheJobTraining: true, blurb: "Track inbound/outbound goods. HS + OJT." },

  // Cross-type useful entries
  { socCode: "29-2041.00", title: "Emergency Medical Technician (EMT)", riasec: ["S", "R", "I"], jobZone: 3, medianWageBand: "35-50k", apprenticeshipPath: false, onTheJobTraining: true, blurb: "Provide emergency medical care. 120-150 hr state-approved course + NREMT cert." },
  { socCode: "21-1018.00", title: "Substance Abuse and Behavioral Disorder Counselor", riasec: ["S", "I", "C"], jobZone: 4, medianWageBand: "50-75k", apprenticeshipPath: false, onTheJobTraining: false, blurb: "Counsel and advise individuals with substance use disorders. Education requirements vary by state — sometimes only a HS diploma + state cert + supervised practice." },
  { socCode: "31-2021.00", title: "Physical Therapist Assistant", riasec: ["S", "R", "I"], jobZone: 3, medianWageBand: "50-75k", apprenticeshipPath: false, onTheJobTraining: false, blurb: "Help patients regain mobility. Associates degree from accredited program + state license." },
  { socCode: "49-3031.00", title: "Bus and Truck Mechanic / Diesel Engine Specialist", riasec: ["R", "I", "C"], jobZone: 3, medianWageBand: "50-75k", apprenticeshipPath: true, onTheJobTraining: true, blurb: "Diagnose and repair heavy vehicles. Vocational program or apprenticeship; ASE certs valuable." },
  { socCode: "11-9111.00", title: "Medical and Health Services Manager", riasec: ["E", "S", "C"], jobZone: 4, medianWageBand: "100k+", apprenticeshipPath: false, onTheJobTraining: false, blurb: "Plan and direct health services. Bachelor's typical, master's preferred." },
  { socCode: "15-1212.00", title: "Information Security Analyst", riasec: ["I", "C", "R"], jobZone: 4, medianWageBand: "100k+", apprenticeshipPath: true, onTheJobTraining: false, blurb: "Protect computer networks. Bachelor's typical; certs (Security+, CISSP, CEH); strong apprenticeship growth." },
];

/**
 * Score an occupation's fit using RIASEC vector cosine similarity-style match.
 * Higher = better fit.
 */
export function scoreOccupation(userScores: RiasecScores, occ: Occupation): number {
  // Weight the three Holland letters of the occupation: 3, 2, 1
  const occVec: RiasecScores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  occVec[occ.riasec[0]] = 3;
  occVec[occ.riasec[1]] = 2;
  occVec[occ.riasec[2]] = 1;

  // Dot product of user (0-100) and weighted occupation vector
  const types: RiasecType[] = ["R", "I", "A", "S", "E", "C"];
  let dot = 0;
  let userMag = 0;
  let occMag = 0;
  for (const t of types) {
    dot += userScores[t] * occVec[t];
    userMag += userScores[t] ** 2;
    occMag += occVec[t] ** 2;
  }
  if (userMag === 0 || occMag === 0) return 0;
  return dot / (Math.sqrt(userMag) * Math.sqrt(occMag));
}

export function rankOccupations(
  userScores: RiasecScores,
  opts: { maxJobZone?: number; requireApprenticeship?: boolean } = {},
): { occ: Occupation; fit: number }[] {
  return occupations
    .filter((o) => {
      if (opts.maxJobZone != null && o.jobZone > opts.maxJobZone) return false;
      if (opts.requireApprenticeship && !o.apprenticeshipPath) return false;
      return true;
    })
    .map((occ) => ({ occ, fit: scoreOccupation(userScores, occ) }))
    .sort((a, b) => b.fit - a.fit);
}

export const jobZoneDescription: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "Little or no preparation needed — short OJT.",
  2: "Some preparation — HS diploma plus brief OJT.",
  3: "Medium preparation — vocational training, associate degree, or registered apprenticeship.",
  4: "Considerable preparation — typically a bachelor's degree plus work experience.",
  5: "Extensive preparation — typically a graduate or professional degree plus experience.",
};

export const wageBandDescription: Record<Occupation["medianWageBand"], string> = {
  "<35k": "Under $35,000 / yr",
  "35-50k": "$35,000 – $50,000 / yr",
  "50-75k": "$50,000 – $75,000 / yr",
  "75-100k": "$75,000 – $100,000 / yr",
  "100k+": "Over $100,000 / yr",
};

// BLS Occupational Outlook Handbook profile URLs by O*NET-SOC code.
// Curated 2026-06; URLs may shift as BLS updates the OOH — getOohUrl() falls
// back to an OOH search query if a code isn't mapped or the page moves.
export const oohProfileUrls: Record<string, string> = {
  // Realistic
  "47-2031.00": "https://www.bls.gov/ooh/construction-and-extraction/carpenters.htm",
  "47-2111.00": "https://www.bls.gov/ooh/construction-and-extraction/electricians.htm",
  "47-2152.02": "https://www.bls.gov/ooh/construction-and-extraction/plumbers-pipefitters-and-steamfitters.htm",
  "49-3023.00": "https://www.bls.gov/ooh/installation-maintenance-and-repair/automotive-service-technicians-and-mechanics.htm",
  "53-3032.00": "https://www.bls.gov/ooh/transportation-and-material-moving/heavy-and-tractor-trailer-truck-drivers.htm",
  "49-9071.00": "https://www.bls.gov/ooh/installation-maintenance-and-repair/general-maintenance-and-repair-workers.htm",
  "45-2092.00": "https://www.bls.gov/ooh/farming-fishing-and-forestry/agricultural-workers.htm",
  "49-9021.01": "https://www.bls.gov/ooh/installation-maintenance-and-repair/heating-air-conditioning-and-refrigeration-mechanics-and-installers.htm",
  "51-4121.06": "https://www.bls.gov/ooh/production/welders-cutters-solderers-and-brazers.htm",
  "33-2011.00": "https://www.bls.gov/ooh/protective-service/firefighters.htm",

  // Investigative
  "15-1252.00": "https://www.bls.gov/ooh/computer-and-information-technology/software-developers.htm",
  "15-1232.00": "https://www.bls.gov/ooh/computer-and-information-technology/computer-support-specialists.htm",
  "15-1244.00": "https://www.bls.gov/ooh/computer-and-information-technology/network-and-computer-systems-administrators.htm",
  "29-1141.00": "https://www.bls.gov/ooh/healthcare/registered-nurses.htm",
  "19-4031.00": "https://www.bls.gov/ooh/life-physical-and-social-science/chemical-technicians.htm",
  "29-2052.00": "https://www.bls.gov/ooh/healthcare/pharmacy-technicians.htm",
  "13-2011.00": "https://www.bls.gov/ooh/business-and-financial/accountants-and-auditors.htm",
  "19-3033.00": "https://www.bls.gov/ooh/life-physical-and-social-science/psychologists.htm",
  "29-1228.00": "https://www.bls.gov/ooh/healthcare/physicians-and-surgeons.htm",

  // Artistic
  "27-1024.00": "https://www.bls.gov/ooh/arts-and-design/graphic-designers.htm",
  "27-3043.05": "https://www.bls.gov/ooh/media-and-communication/writers-and-authors.htm",
  "27-2042.00": "https://www.bls.gov/ooh/entertainment-and-sports/musicians-and-singers.htm",
  "27-1014.00": "https://www.bls.gov/ooh/arts-and-design/special-effects-artists-and-animators.htm",
  "39-5012.00": "https://www.bls.gov/ooh/personal-care-and-service/barbers-hairstylists-and-cosmetologists.htm",
  "35-1011.00": "https://www.bls.gov/ooh/food-preparation-and-serving/chefs-and-head-cooks.htm",

  // Social
  "25-2021.00": "https://www.bls.gov/ooh/education-training-and-library/kindergarten-and-elementary-school-teachers.htm",
  "21-1093.00": "https://www.bls.gov/ooh/community-and-social-service/social-and-human-service-assistants.htm",
  "31-1131.00": "https://www.bls.gov/ooh/healthcare/nursing-assistants.htm",
  "29-2061.00": "https://www.bls.gov/ooh/healthcare/licensed-practical-and-licensed-vocational-nurses.htm",
  "21-1014.00": "https://www.bls.gov/ooh/community-and-social-service/substance-abuse-behavioral-disorder-and-mental-health-counselors.htm",
  "21-1015.00": "https://www.bls.gov/ooh/community-and-social-service/rehabilitation-counselors.htm",
  "39-9011.00": "https://www.bls.gov/ooh/personal-care-and-service/childcare-workers.htm",
  "31-9092.00": "https://www.bls.gov/ooh/healthcare/medical-assistants.htm",
  "21-2011.00": "https://www.bls.gov/ooh/community-and-social-service/clergy.htm",

  // Enterprising
  "41-2031.00": "https://www.bls.gov/ooh/sales/retail-sales-workers.htm",
  "11-9051.00": "https://www.bls.gov/ooh/management/food-service-managers.htm",
  "41-9022.00": "https://www.bls.gov/ooh/sales/real-estate-brokers-and-sales-agents.htm",
  "11-3031.00": "https://www.bls.gov/ooh/management/financial-managers.htm",
  "13-1161.00": "https://www.bls.gov/ooh/business-and-financial/market-research-analysts.htm",
  "33-3051.00": "https://www.bls.gov/ooh/protective-service/police-and-detectives.htm",
  "13-1071.00": "https://www.bls.gov/ooh/business-and-financial/human-resources-specialists.htm",
  "11-1011.00": "https://www.bls.gov/ooh/management/top-executives.htm",

  // Conventional
  "43-3031.00": "https://www.bls.gov/ooh/office-and-administrative-support/bookkeeping-accounting-and-auditing-clerks.htm",
  "43-4051.00": "https://www.bls.gov/ooh/office-and-administrative-support/customer-service-representatives.htm",
  "43-6014.00": "https://www.bls.gov/ooh/office-and-administrative-support/secretaries-and-administrative-assistants.htm",
  "43-9021.00": "https://www.bls.gov/ooh/office-and-administrative-support/data-entry-and-information-processing-workers.htm",
  "13-2082.00": "https://www.bls.gov/ooh/business-and-financial/tax-examiners-and-collectors-and-revenue-agents.htm",
  "53-3033.00": "https://www.bls.gov/ooh/transportation-and-material-moving/delivery-truck-drivers-and-driver-sales-workers.htm",
  "43-5071.00": "https://www.bls.gov/ooh/office-and-administrative-support/material-recording-clerks.htm",

  // Cross-type
  "29-2041.00": "https://www.bls.gov/ooh/healthcare/emts-and-paramedics.htm",
  "21-1018.00": "https://www.bls.gov/ooh/community-and-social-service/substance-abuse-behavioral-disorder-and-mental-health-counselors.htm",
  "31-2021.00": "https://www.bls.gov/ooh/healthcare/physical-therapist-assistants-and-aides.htm",
  "49-3031.00": "https://www.bls.gov/ooh/installation-maintenance-and-repair/diesel-service-technicians-and-mechanics.htm",
  "11-9111.00": "https://www.bls.gov/ooh/management/medical-and-health-services-managers.htm",
  "15-1212.00": "https://www.bls.gov/ooh/computer-and-information-technology/information-security-analysts.htm",
};

export function getOohUrl(occ: Occupation): string {
  return (
    oohProfileUrls[occ.socCode] ||
    `https://www.bls.gov/ooh/search/all.htm?q=${encodeURIComponent(occ.title)}`
  );
}
