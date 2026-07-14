// Clinical assessment library for VR counselors. Curated to instruments
// CRCs actually order/administer/refer to. Mix of free public-domain tools
// (administer in-office), free government tools (refer client), and
// proprietary tools (require licensed psychologist or VR psychometrist).

export type AssessmentCost = "free" | "proprietary" | "varies";
export type AdministrationLevel =
  | "self-administered"
  | "counselor-administered"
  | "licensed-professional";

export interface Assessment {
  name: string;
  acronym?: string;
  publisher: string;
  url: string;
  population: string;
  domain: string;
  time: string;
  cost: AssessmentCost;
  /** Price/range to show on paid assessments (e.g. "Kit ~$1,200 + scoring fees") */
  priceTag?: string;
  administration: AdministrationLevel;
  description: string;
  bestFor: string[];
  notes?: string;
  /** Internal route — if set, the library shows "Take on Pathways Pro" and
   * the assessment is administered in-app. Otherwise the user is sent to `url`. */
  inAppPath?: string;
}

export interface AssessmentCategory {
  category: string;
  icon: string;
  description: string;
  assessments: Assessment[];
}

export const ASSESSMENT_CATEGORIES: AssessmentCategory[] = [
  {
    category: "Vocational Interests & Values",
    icon: "🧭",
    description:
      "Helps the client articulate what they actually like doing. Foundation for IPE goal selection.",
    assessments: [
      {
        name: "O*NET Interest Profiler",
        acronym: "O*NET IP",
        publisher: "U.S. Department of Labor",
        url: "https://www.mynextmove.org/explore/ip",
        inAppPath: "/assessment",
        population: "Ages 14+, all literacy levels",
        domain: "RIASEC interest measurement",
        time: "10–15 min",
        cost: "free",
        administration: "self-administered",
        description:
          "60-item Holland Code measurement. Built into Pathways Pro at the Interest Profiler.",
        bestFor: ["Initial career exploration", "Pre-ETS", "Job goal clarification"],
      },
      {
        name: "O*NET Work Importance Profiler",
        acronym: "O*NET WIP",
        publisher: "U.S. Department of Labor",
        url: "https://www.onetcenter.org/WIP.html",
        population: "Ages 14+",
        domain: "Work values",
        time: "10–15 min",
        cost: "free",
        administration: "self-administered",
        description:
          "21-item measure of work values across 6 domains (Achievement, Independence, Recognition, Relationships, Support, Working Conditions).",
        bestFor: [
          "Reconciling client goals with realistic job environments",
          "Discussion starter on workplace fit",
        ],
      },
      {
        name: "Self-Directed Search",
        acronym: "SDS",
        publisher: "PAR Inc.",
        url: "https://www.parinc.com/products/self-directed-search-sds",
        population: "Ages 12+",
        domain: "Holland Code",
        time: "30–40 min",
        cost: "proprietary",
        priceTag: "~$110 starter kit; ~$3–4 per online use",
        administration: "self-administered",
        description:
          "John Holland's original RIASEC instrument. Generates a 3-letter Holland Code with extensive interpretive materials.",
        bestFor: ["Detailed career counseling", "Adult career changers"],
      },
      {
        name: "Strong Interest Inventory",
        acronym: "Strong",
        publisher: "CPP / The Myers-Briggs Company",
        url: "https://www.themyersbriggs.com/en-US/Products-and-Services/Strong",
        population: "Ages 14+ (varies)",
        domain: "Interest measurement with occupational themes",
        time: "35–40 min",
        cost: "proprietary",
        priceTag: "~$15–25 per online profile",
        administration: "licensed-professional",
        description:
          "291-item assessment with extensive occupational profile matching. Widely used in college career services and rehabilitation.",
        bestFor: ["Adult career counseling", "Deep interest exploration"],
        notes: "Requires certified administrator.",
      },
      {
        name: "Career Decision-Making Self-Efficacy Scale",
        acronym: "CDMSE",
        publisher: "Public domain (Betz & Taylor)",
        url: "https://psychology.town/rehabilitation-assessment-counseling/",
        population: "Adolescents and adults",
        domain: "Self-efficacy for career tasks",
        time: "10 min",
        cost: "free",
        administration: "self-administered",
        description:
          "25-item measure of confidence across 5 career decision-making competencies. Highly used in VR research.",
        bestFor: [
          "Identifying clients who need decisional support",
          "Pre/post measure of career counseling impact",
        ],
      },
    ],
  },
  {
    category: "Aptitudes, Abilities & Intelligence",
    icon: "🧠",
    description:
      "Capacity to learn or perform job tasks. Often required by VR for funding tuition or training.",
    assessments: [
      {
        name: "Wechsler Adult Intelligence Scale, 5th Edition",
        acronym: "WAIS-V",
        publisher: "Pearson",
        url: "https://www.pearsonassessments.com/store/usassessments/en/Store/Professional-Assessments/Cognition-%26-Neuro/Wechsler-Adult-Intelligence-Scale-%7C-Fifth-Edition/p/100000392.html",
        population: "Ages 16–90",
        domain: "Cognitive ability / IQ",
        time: "65–90 min",
        cost: "proprietary",
        priceTag: "~$1,500 starter kit; ~$10–20 per online scoring",
        administration: "licensed-professional",
        description:
          "Gold-standard adult IQ measure. Required by many state agencies to document cognitive disability or learning needs.",
        bestFor: [
          "Determining eligibility for cognitive disability designation",
          "Documenting need for training accommodations",
        ],
        notes: "Requires licensed psychologist.",
      },
      {
        name: "Woodcock-Johnson IV Tests of Cognitive Abilities",
        acronym: "WJ-IV COG",
        publisher: "Riverside Insights",
        url: "https://riversideinsights.com/woodcock_johnson_iv",
        population: "Ages 2–90+",
        domain: "Cognitive ability",
        time: "60–90 min",
        cost: "proprietary",
        priceTag: "~$1,400 starter kit + ~$5–8 per online report",
        administration: "licensed-professional",
        description:
          "Comprehensive cognitive battery with broad CHC theory coverage. Common alternative to WAIS in rehabilitation contexts.",
        bestFor: [
          "Cognitive profile in TBI, learning disability",
          "Identifying strengths to build training around",
        ],
      },
      {
        name: "O*NET Ability Profiler",
        acronym: "O*NET AP",
        publisher: "U.S. Department of Labor",
        url: "https://www.onetcenter.org/AP.html",
        population: "Adults",
        domain: "9 job-relevant abilities",
        time: "2–3 hours",
        cost: "free",
        administration: "counselor-administered",
        description:
          "Group-administerable battery of 9 ability measures derived from the General Aptitude Test Battery (GATB).",
        bestFor: [
          "Group settings (American Job Centers, transition programs)",
          "When proprietary IQ tests aren't accessible",
        ],
      },
      {
        name: "Armed Services Vocational Aptitude Battery",
        acronym: "ASVAB",
        publisher: "U.S. Department of Defense",
        url: "https://www.officialasvab.com/",
        population: "Ages 16+",
        domain: "Aptitude across 10 areas",
        time: "3 hours",
        cost: "free",
        administration: "counselor-administered",
        description:
          "Free standardized aptitude test. Available to high school students through schools; reusable for civilian career planning.",
        bestFor: [
          "Pre-ETS transition-age youth",
          "Clients considering trades or technical careers",
        ],
        notes: "No military commitment required. Includes career-exploration follow-on.",
      },
      {
        name: "Bennett Mechanical Comprehension Test",
        acronym: "BMCT-II",
        publisher: "Pearson",
        url: "https://www.pearsonassessments.com/store/usassessments/en/Store/Professional-Assessments/Personality-%26-Biopsychosocial/Bennett-Mechanical-Comprehension-Test-%7C-Second-Edition/p/100000582.html",
        population: "Ages 14+",
        domain: "Mechanical reasoning",
        time: "30 min",
        cost: "proprietary",
        priceTag: "~$200 manual + ~$45 per 25-form pack",
        administration: "counselor-administered",
        description:
          "Industry-standard for mechanical aptitude. Often required for skilled trades hiring and apprenticeship screening.",
        bestFor: [
          "Clients pursuing trades (electrician, HVAC, mechanic, machinist)",
          "Pre-apprenticeship readiness",
        ],
      },
    ],
  },
  {
    category: "Academic Achievement",
    icon: "📖",
    description:
      "Current reading, math, and written-language levels. Drives whether the client needs basic skills before training.",
    assessments: [
      {
        name: "Test of Adult Basic Education",
        acronym: "TABE 11&12",
        publisher: "Data Recognition Corp / CTB",
        url: "https://tabetest.com/",
        population: "Adults",
        domain: "Reading, math, language",
        time: "1.5–4 hours",
        cost: "varies",
        priceTag: "Free at WIOA sites; ~$2–6/test if licensed independently",
        administration: "counselor-administered",
        description:
          "Most commonly used adult basic skills assessment in WIOA-funded settings. NRS-compliant for reporting.",
        bestFor: [
          "WIOA Title II Adult Education eligibility",
          "Pre-training basic skills measurement",
          "Placement in adult ed or GED prep",
        ],
      },
      {
        name: "Wide Range Achievement Test, 5th Edition",
        acronym: "WRAT-5",
        publisher: "Pearson",
        url: "https://www.pearsonassessments.com/store/usassessments/en/Store/Professional-Assessments/Academic-Learning/Brief/Wide-Range-Achievement-Test-%7C-Fifth-Edition/p/100002080.html",
        population: "Ages 5–85+",
        domain: "Reading, spelling, math computation",
        time: "30–45 min",
        cost: "proprietary",
        priceTag: "~$400 starter kit; ~$3 per online scoring",
        administration: "licensed-professional",
        description:
          "Brief, individually-administered achievement screener. Quick way to document grade-equivalent skills.",
        bestFor: [
          "Quick screen before referring for full evaluation",
          "Documenting reading level for accommodation requests",
        ],
      },
      {
        name: "Woodcock-Johnson IV Tests of Achievement",
        acronym: "WJ-IV ACH",
        publisher: "Riverside Insights",
        url: "https://riversideinsights.com/woodcock_johnson_iv",
        population: "Ages 2–90+",
        domain: "Reading, math, written language",
        time: "60–90 min",
        cost: "proprietary",
        priceTag: "~$1,400 starter kit + ~$5–8 per online report",
        administration: "licensed-professional",
        description:
          "Comprehensive achievement battery. Pairs with WJ-IV COG for ability-achievement comparison (specific learning disability documentation).",
        bestFor: [
          "Specific Learning Disability eligibility",
          "Discrepancy analysis with WJ-IV COG",
        ],
      },
    ],
  },
  {
    category: "Personality, Temperament & Coping",
    icon: "🪞",
    description: "How the client typically responds, relates, and adapts.",
    assessments: [
      {
        name: "Mini-IPIP Big Five",
        acronym: "Mini-IPIP",
        publisher: "Public domain (Donnellan et al., 2006)",
        url: "https://ipip.ori.org/MiniIPIP.htm",
        inAppPath: "/assessment",
        population: "Ages 14+",
        domain: "5 personality factors",
        time: "5 min",
        cost: "free",
        administration: "self-administered",
        description:
          "20-item public-domain Big Five. Built into Pathways Pro at the Interest Profiler.",
        bestFor: ["Quick personality screen", "Discussion of work style"],
      },
      {
        name: "16 Personality Factor Questionnaire",
        acronym: "16PF",
        publisher: "PSI (Pearson Talent Lens)",
        url: "https://www.pearsonclinical.com.au/store/auassessments/en/Store/Professional-Assessments/Personality-%26-Biopsychosocial/Sixteen-Personality-Factor-Questionnaire-%7C-Fifth-Edition/p/P100009073.html",
        population: "Ages 16+",
        domain: "16 primary personality factors",
        time: "35–50 min",
        cost: "proprietary",
        priceTag: "~$30–60 per online administration",
        administration: "licensed-professional",
        description:
          "Well-validated personality measure with deep career-counseling interpretive support.",
        bestFor: ["In-depth personality profile", "Career counseling cases"],
      },
      {
        name: "Minnesota Multiphasic Personality Inventory, 3rd Edition",
        acronym: "MMPI-3",
        publisher: "University of Minnesota Press",
        url: "https://www.upress.umn.edu/test-division/mmpi-3",
        population: "Ages 18+",
        domain: "Clinical personality",
        time: "35–50 min",
        cost: "proprietary",
        priceTag: "~$15–40 per online administration; manual ~$120",
        administration: "licensed-professional",
        description:
          "Clinical personality assessment. Used in cases where psychopathology may affect employability.",
        bestFor: [
          "Complex psychiatric cases",
          "When differential diagnosis affects accommodation planning",
        ],
        notes: "Requires licensed clinical psychologist.",
      },
    ],
  },
  {
    category: "Adjustment to Disability",
    icon: "🌅",
    description:
      "How the client is integrating disability into their identity. Critical when working with newly-acquired disability.",
    assessments: [
      {
        name: "Acceptance of Disability Scale — Revised",
        acronym: "ADS-R",
        publisher: "Public domain (Linkowski; revised Groomes & Linkowski, 2007)",
        url: "https://psychology.town/rehabilitation-assessment-counseling/",
        population: "Adults with disabilities",
        domain: "Disability acceptance",
        time: "10–15 min",
        cost: "free",
        administration: "self-administered",
        description:
          "32-item measure of the four value changes Wright (1983) proposed are necessary for healthy disability adjustment.",
        bestFor: [
          "Newly-acquired disability clients",
          "Pre/post measure of counseling impact",
        ],
      },
      {
        name: "Reactions to Impairment and Disability Inventory",
        acronym: "RIDI",
        publisher: "Livneh & Antonak",
        url: "https://psychology.town/rehabilitation-assessment-counseling/",
        population: "Adults with disabilities",
        domain: "Psychosocial reactions to disability",
        time: "15–25 min",
        cost: "free",
        administration: "counselor-administered",
        description:
          "60-item measure across 8 psychosocial reactions (denial, anger, depression, acknowledgment, adjustment, etc.).",
        bestFor: [
          "Identifying which adjustment stage the client is working through",
          "Targeting counseling interventions",
        ],
      },
      {
        name: "WHO Disability Assessment Schedule 2.0",
        acronym: "WHODAS 2.0",
        publisher: "World Health Organization",
        url: "https://www.who.int/standards/classifications/international-classification-of-functioning-disability-and-health/who-disability-assessment-schedule",
        inAppPath: "/clinical-assessments/whodas12",
        population: "Ages 18+",
        domain: "Functional disability across 6 domains",
        time: "5 min (12-item) — built in",
        cost: "free",
        administration: "self-administered",
        description:
          "ICF-aligned functional measurement: cognition, mobility, self-care, getting along, life activities, participation. The 12-item self-administered version is built into Pathways Pro.",
        bestFor: [
          "ICF-consistent disability documentation",
          "RSA-911 functional measures",
          "Cross-disability comparison",
        ],
      },
    ],
  },
  {
    category: "Mental Health Screening",
    icon: "💭",
    description:
      "Brief screens for depression, anxiety, PTSD, and substance use — common co-occurring concerns.",
    assessments: [
      {
        name: "Patient Health Questionnaire-9",
        acronym: "PHQ-9",
        publisher: "Pfizer (public domain)",
        url: "https://www.phqscreeners.com/",
        inAppPath: "/clinical-assessments/phq9",
        population: "Ages 13+",
        domain: "Depression severity",
        time: "3 min — built in",
        cost: "free",
        administration: "self-administered",
        description:
          "9-item DSM-5-aligned depression screener with automatic severity banding and suicidal-ideation safety flag. Industry standard in primary care and behavioral health.",
        bestFor: [
          "Routine intake screening",
          "Monitoring change over time",
          "Documenting need for mental health referral",
        ],
      },
      {
        name: "Generalized Anxiety Disorder-7",
        acronym: "GAD-7",
        publisher: "Pfizer (public domain)",
        url: "https://www.phqscreeners.com/",
        inAppPath: "/clinical-assessments/gad7",
        population: "Ages 13+",
        domain: "Anxiety severity",
        time: "2 min — built in",
        cost: "free",
        administration: "self-administered",
        description:
          "7-item brief anxiety screener with automatic severity banding. Pairs with PHQ-9 as a standard combined intake.",
        bestFor: ["Routine intake screening", "Tracking anxiety symptom change"],
      },
      {
        name: "PTSD Checklist for DSM-5",
        acronym: "PCL-5",
        publisher: "U.S. Dept of Veterans Affairs (public domain)",
        url: "https://www.ptsd.va.gov/professional/assessment/adult-sr/ptsd-checklist.asp",
        population: "Adults",
        domain: "PTSD symptoms",
        time: "5–10 min",
        cost: "free",
        administration: "self-administered",
        description:
          "20-item DSM-5 PTSD symptom checklist. Free from the National Center for PTSD; download the PDF version. (In-app version planned for next release.)",
        bestFor: ["Veterans", "Trauma-impacted clients", "TBI follow-up"],
      },
      {
        name: "Beck Depression Inventory-II",
        acronym: "BDI-II",
        publisher: "Pearson",
        url: "https://www.pearsonassessments.com/store/usassessments/en/Store/Professional-Assessments/Personality-%26-Biopsychosocial/Beck-Depression-Inventory-%7C-Second-Edition/p/100000159.html",
        population: "Ages 13+",
        domain: "Depression severity",
        time: "5–10 min",
        cost: "proprietary",
        priceTag: "~$135 starter kit; ~$3 per form",
        administration: "licensed-professional",
        description:
          "Long-standard depression measure. Often used when PHQ-9 isn't sufficient or when comparing to historical scores.",
        bestFor: ["Cases with prior BDI history", "Detailed clinical assessment"],
      },
    ],
  },
  {
    category: "Substance Use Screening",
    icon: "🍵",
    description:
      "Free screens that don't require clinical credentials. Standard CRC practice in intake.",
    assessments: [
      {
        name: "Alcohol Use Disorders Identification Test",
        acronym: "AUDIT",
        publisher: "World Health Organization (public domain)",
        url: "https://www.who.int/publications/i/item/audit-the-alcohol-use-disorders-identification-test-guidelines-for-use-in-primary-health-care",
        inAppPath: "/clinical-assessments/audit",
        population: "Adults",
        domain: "Hazardous and harmful alcohol use",
        time: "2–3 min — built in",
        cost: "free",
        administration: "self-administered",
        description:
          "10-item WHO screener with automatic risk-zone interpretation (low risk → possible dependence).",
        bestFor: ["Routine intake", "Pre-referral to behavioral health"],
      },
      {
        name: "Drug Abuse Screening Test (10-item)",
        acronym: "DAST-10",
        publisher: "Public domain (Skinner)",
        url: "https://cde.nida.nih.gov/instrument/e9053390-ee9c-9140-e040-bb89ad433d69",
        inAppPath: "/clinical-assessments/dast10",
        population: "Adolescents and adults",
        domain: "Drug use other than alcohol",
        time: "5 min — built in",
        cost: "free",
        administration: "self-administered",
        description:
          "Free brief screener for non-alcohol substance use with automatic severity banding (none → severe).",
        bestFor: ["Routine intake", "Detection without specifying substance"],
      },
      {
        name: "CAGE Questionnaire",
        acronym: "CAGE",
        publisher: "Public domain (Ewing)",
        url: "https://nida.nih.gov/research-topics/screening-tools-resources",
        inAppPath: "/clinical-assessments/cage",
        population: "Adults",
        domain: "Alcohol use brief screen",
        time: "1 min — built in",
        cost: "free",
        administration: "counselor-administered",
        description: "4-item ultra-brief alcohol screener with automatic positive/negative interpretation.",
        bestFor: ["Time-limited intake", "Initial screening"],
      },
    ],
  },
  {
    category: "Developmental Disabilities & Adaptive Behavior",
    icon: "🌱",
    description:
      "Adaptive behavior and supports needs for clients with intellectual or developmental disability.",
    assessments: [
      {
        name: "Vineland Adaptive Behavior Scales, 3rd Edition",
        acronym: "Vineland-3",
        publisher: "Pearson",
        url: "https://www.pearsonassessments.com/store/usassessments/en/Store/Professional-Assessments/Behavior/Adaptive/Vineland-Adaptive-Behavior-Scales-%7C-Third-Edition/p/100001622.html",
        population: "Birth–90+",
        domain: "Adaptive behavior across 4 domains",
        time: "30–60 min",
        cost: "proprietary",
        priceTag: "~$600 starter kit + ~$5 per form",
        administration: "licensed-professional",
        description:
          "Gold-standard adaptive behavior measure. Required by most states for I/DD eligibility.",
        bestFor: [
          "I/DD eligibility documentation",
          "Identifying support needs for community-based employment",
        ],
      },
      {
        name: "Supports Intensity Scale — Adult Version",
        acronym: "SIS-A",
        publisher: "American Association on Intellectual and Developmental Disabilities (AAIDD)",
        url: "https://www.aaidd.org/sis",
        population: "Ages 16+ with I/DD",
        domain: "Support needs across life activities",
        time: "2–3 hours",
        cost: "proprietary",
        priceTag: "Training ~$1,200; ~$30 per administration",
        administration: "licensed-professional",
        description:
          "Measures intensity of supports needed (rather than what the person can/can't do). Used by many state I/DD agencies for resource allocation.",
        bestFor: [
          "Person-centered planning",
          "Determining ongoing supported-employment needs",
        ],
      },
      {
        name: "Adaptive Behavior Assessment System, 3rd Edition",
        acronym: "ABAS-3",
        publisher: "Western Psychological Services (WPS)",
        url: "https://www.wpspublish.com/abas-3-adaptive-behavior-assessment-system-third-edition",
        population: "Birth–89",
        domain: "Adaptive behavior (DSM-5 aligned)",
        time: "15–20 min",
        cost: "proprietary",
        priceTag: "~$400 starter kit; ~$3 per form",
        administration: "licensed-professional",
        description:
          "DSM-5-aligned adaptive behavior measure with strong psychometrics. Alternative to Vineland-3.",
        bestFor: ["I/DD diagnostic assessment", "Educational planning"],
      },
    ],
  },
  {
    category: "Pre-ETS & Transition-Age Youth",
    icon: "🎒",
    description:
      "Assessments designed for the 14–21 age range and Pre-ETS service categories.",
    assessments: [
      {
        name: "Transition Planning Inventory, 3rd Edition",
        acronym: "TPI-3",
        publisher: "PRO-ED",
        url: "https://www.proedinc.com/Products/14375/transition-planning-inventory-third-edition.aspx",
        population: "Ages 14–22",
        domain: "Transition needs across 9 domains",
        time: "20–30 min",
        cost: "proprietary",
        priceTag: "~$200 starter kit + ~$50 per 25-form pack",
        administration: "counselor-administered",
        description:
          "Aligns with IDEA transition planning requirements. Commonly used in joint IEP/IPE planning.",
        bestFor: ["IEP-to-IPE transition", "Pre-ETS Job Exploration counseling"],
      },
      {
        name: "Casey Life Skills Assessment",
        acronym: "ACLSA",
        publisher: "Casey Family Programs",
        url: "https://caseylifeskills.secure.force.com/clsa/CLSA_login",
        population: "Ages 14–21",
        domain: "Life skills readiness",
        time: "30 min",
        cost: "free",
        administration: "self-administered",
        description:
          "Free online assessment covering life skills in 8 domains (housing, money management, daily living, etc.).",
        bestFor: [
          "Transition-age youth",
          "Foster care youth aging out",
          "Pre-ETS Independent Living counseling",
        ],
      },
      {
        name: "Self-Determination Scale",
        acronym: "AIR-SDS",
        publisher: "Public domain (American Institutes for Research)",
        url: "https://www.imdetermined.org/resources/self-determination-assessments/",
        population: "Ages 14+",
        domain: "Self-determination skills",
        time: "20–30 min",
        cost: "free",
        administration: "counselor-administered",
        description:
          "Measures both capacity and opportunity for self-determination. Aligns with Pre-ETS Self-Advocacy training.",
        bestFor: [
          "Pre-ETS Self-Advocacy services",
          "Pre/post measure of self-advocacy training",
        ],
      },
    ],
  },
  {
    category: "Transferable Skills & Work Samples",
    icon: "🛠️",
    description:
      "Direct measurement of work-relevant skills, often used when records don't tell the whole story.",
    assessments: [
      {
        name: "Pathways Pro Transferable Skills Analysis",
        acronym: "Pathways TSA",
        publisher: "Pathways Pro",
        url: "/transferable-skills",
        inAppPath: "/transferable-skills",
        population: "Adolescents and adults",
        domain: "Skills from work, volunteering, hobbies, caregiving",
        time: "15–20 min — built in",
        cost: "free",
        administration: "self-administered",
        description:
          "AI-assisted TSA built into Pathways Pro. Pulls skills from non-traditional experience and generates resume-ready bullets.",
        bestFor: [
          "First-time job seekers",
          "Career changers",
          "Clients with non-traditional work history",
        ],
      },
      {
        name: "Occupational Aptitude Survey & Interest Schedule, 3rd Edition",
        acronym: "OASIS-3",
        publisher: "PRO-ED",
        url: "https://www.proedinc.com/Products/14535/oasis3-occupational-aptitude-survey-and-interest-schedule-third-edition.aspx",
        population: "Grades 8–12 / adults",
        domain: "Aptitudes + interests",
        time: "60 min",
        cost: "proprietary",
        priceTag: "~$200 examiner's kit + ~$60 per 25-form pack",
        administration: "counselor-administered",
        description:
          "Pairs aptitude testing with interest survey. Common in transition-age VR.",
        bestFor: ["Pre-ETS Job Exploration", "VR-funded vocational evaluation"],
      },
      {
        name: "McCarron-Dial System",
        acronym: "MDS",
        publisher: "Common Market Press / McCarron-Dial",
        url: "https://www.mccarrondialsystems.com/",
        population: "Ages 16+",
        domain: "Neuropsychological + vocational",
        time: "Variable (multi-day)",
        cost: "proprietary",
        priceTag: "Full system $2,000+; training required",
        administration: "licensed-professional",
        description:
          "Comprehensive neuropsychological battery built for VR. Strong for clients with TBI or significant cognitive disability.",
        bestFor: ["TBI vocational evaluation", "Complex cognitive cases"],
      },
      {
        name: "VALPAR Component Work Sample Series",
        acronym: "VALPAR",
        publisher: "VALPAR International",
        url: "https://valparint.com/",
        population: "Ages 14+",
        domain: "Performance-based work samples",
        time: "Variable (per sample)",
        cost: "proprietary",
        priceTag: "Individual work samples ~$1,500–$4,000 each",
        administration: "counselor-administered",
        description:
          "Standardized work samples replicating job tasks (small parts assembly, clerical, sorting, etc.). Direct performance measurement.",
        bestFor: [
          "VR work evaluation / situational assessment",
          "Functional capacity for specific job tasks",
        ],
      },
    ],
  },
  {
    category: "Functional Capacity & Dexterity",
    icon: "✋",
    description:
      "Physical and motor abilities. Often paired with VALPAR or work-sample assessment.",
    assessments: [
      {
        name: "Purdue Pegboard",
        acronym: "Purdue",
        publisher: "Lafayette Instrument",
        url: "https://lafayetteinstrument.com/purdue-pegboard",
        population: "All ages",
        domain: "Finger and hand dexterity",
        time: "10–15 min",
        cost: "proprietary",
        priceTag: "~$350 apparatus (one-time purchase)",
        administration: "counselor-administered",
        description:
          "Quick fine motor + bilateral coordination measure. Standard in industrial selection.",
        bestFor: [
          "Assembly, packaging, electronics work readiness",
          "Pre/post upper-extremity rehabilitation",
        ],
      },
      {
        name: "Crawford Small Parts Dexterity Test",
        acronym: "CSPDT",
        publisher: "Pearson",
        url: "https://www.pearsonassessments.com/store/usassessments/en/Store/Professional-Assessments/Behavior/Crawford-Small-Parts-Dexterity-Test/p/100000172.html",
        population: "Ages 14+",
        domain: "Fine motor + tool use",
        time: "10–15 min",
        cost: "proprietary",
        priceTag: "~$300 apparatus (one-time purchase)",
        administration: "counselor-administered",
        description:
          "Tweezers and screwdriver work sample. Strong predictor of fine assembly job performance.",
        bestFor: ["Manufacturing, watch/jewelry, electronics work"],
      },
      {
        name: "Minnesota Manual Dexterity Test",
        acronym: "MMDT",
        publisher: "Lafayette Instrument",
        url: "https://lafayetteinstrument.com/minnesota-manual-dexterity-test",
        population: "Ages 11+",
        domain: "Gross hand and arm dexterity",
        time: "10 min",
        cost: "proprietary",
        priceTag: "~$400 apparatus (one-time purchase)",
        administration: "counselor-administered",
        description:
          "Block-placing and turning tasks for arm/hand dexterity.",
        bestFor: ["Material handling job placement"],
      },
    ],
  },
  {
    category: "Independent Living",
    icon: "🏠",
    description:
      "Life skills for clients pursuing supported or independent living alongside employment.",
    assessments: [
      {
        name: "Independent Living Skills Survey",
        acronym: "ILSS",
        publisher: "Public domain (Wallace, Liberman et al.)",
        url: "https://psycnet.apa.org/record/1996-93870-001",
        population: "Adults with psychiatric or developmental disability",
        domain: "Life skills across 10 areas",
        time: "30–40 min",
        cost: "free",
        administration: "counselor-administered",
        description:
          "Validated for severe mental illness and I/DD populations. Useful for supported-employment planning.",
        bestFor: ["Supported employment planning", "Community-based goal-setting"],
      },
      {
        name: "Independent Living Scales",
        acronym: "ILS",
        publisher: "Pearson",
        url: "https://www.pearsonassessments.com/store/usassessments/en/Store/Professional-Assessments/Behavior/Adaptive/Independent-Living-Scales/p/100000392.html",
        population: "Ages 17+",
        domain: "Independent living competencies",
        time: "45 min",
        cost: "proprietary",
        priceTag: "~$300 starter kit + ~$3 per form",
        administration: "licensed-professional",
        description:
          "Measures memory, money management, transportation, health and safety, social adjustment.",
        bestFor: ["Older adults", "Post-TBI / dementia cases"],
      },
    ],
  },
];
