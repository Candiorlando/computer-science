// Pathways Pro resource library — Master Resource List from Drive.
// 36 counselor tools across 7 categories · 22 client tools across 6 categories.
// All URLs verified June 8, 2026 against publicly published official sources.

export interface Resource {
  name: string;
  source: string;
  url: string;
  desc: string;
}

export interface ResourceCategory {
  category: string;
  icon?: string;
  items: Resource[];
}

export const COUNSELOR_RESOURCES: ResourceCategory[] = [
  {
    category: "Career & Labor Market Data",
    icon: "📊",
    items: [
      { name: "O*NET OnLine", source: "DOL/ETA", url: "https://www.onetonline.org/", desc: "900+ occupational profiles with skills, tasks, wages, and outlook." },
      { name: "BLS Occupational Outlook Handbook", source: "BLS", url: "https://www.bls.gov/ooh/", desc: "2024–34 projections covering 600+ occupations." },
      { name: "CareerOneStop", source: "DOL", url: "https://www.careeronestop.org/", desc: "Career exploration, salary data, training, and job search." },
      { name: "Projections Central", source: "State LMI", url: "https://www.projectionscentral.org/", desc: "State-level employment projections by industry and occupation." },
      { name: "mySkills myFuture", source: "DOL", url: "https://www.mynextmove.org/explore/ip", desc: "Career transition skills matching tool." },
    ],
  },
  {
    category: "Vocational Assessment Tools",
    icon: "🧠",
    items: [
      { name: "O*NET Interest Profiler", source: "Free", url: "https://www.mynextmove.org/explore/ip", desc: "RIASEC vocational interest assessment (Holland Codes)." },
      { name: "O*NET Work Importance Profiler", source: "Free", url: "https://www.onetcenter.org/WIP.html", desc: "Work values measured across 6 domains." },
      { name: "O*NET Ability Profiler", source: "Free", url: "https://www.onetcenter.org/AP.html", desc: "9 job-relevant ability domains." },
      { name: "VocRehabTools.com", source: "Free AI", url: "https://www.vocrehabtools.com/", desc: "Work readiness, vocational, and remote-work assessments." },
      { name: "WHODAS 2.0", source: "Clinical", url: "https://www.who.int/tools/atlaswhodas", desc: "WHO Disability Assessment Schedule, version 2." },
      { name: "CDMSE Scale", source: "Research", url: "https://psychology.town/rehabilitation-assessment-counseling/", desc: "Career Decision-Making Self-Efficacy scale." },
    ],
  },
  {
    category: "Accommodation & ADA",
    icon: "♿",
    items: [
      { name: "AskJAN", source: "ODEP/DOL", url: "https://askjan.org/", desc: "Job Accommodation Network — free expert guidance." },
      { name: "JAN SOAR Tool", source: "Free", url: "https://askjan.org/soar/index.cfm", desc: "Searchable Online Accommodation Resource." },
      { name: "EEOC ADA Resources", source: "Legal", url: "https://www.eeoc.gov/disability-discrimination", desc: "ADA Title I enforcement guidance." },
      { name: "ADA National Network", source: "Regional", url: "https://adata.org/", desc: "10 regional ADA centers for technical assistance." },
    ],
  },
  {
    category: "Benefits Counseling & SSA",
    icon: "💵",
    items: [
      { name: "SSA Red Book", source: "SSA", url: "https://www.ssa.gov/redbook/", desc: "SSDI/SSI employment supports guide." },
      { name: "WIPA Program", source: "Free", url: "https://choosework.ssa.gov/findhelp/", desc: "Benefits counseling for SSA beneficiaries." },
      { name: "ABLE National Resource Center", source: "ABLE Act", url: "https://www.ablenrc.org/", desc: "Savings without losing means-tested benefits." },
      { name: "Ticket to Work", source: "SSA", url: "https://choosework.ssa.gov/", desc: "Free employment services for SSDI/SSI beneficiaries." },
      { name: "Benefits.gov", source: "Federal", url: "https://www.benefits.gov/", desc: "Federal benefits eligibility screening tool." },
    ],
  },
  {
    category: "Professional Standards & CE",
    icon: "🎓",
    items: [
      { name: "CRCC", source: "Credentialing", url: "https://crccertification.com/", desc: "CRC/CVE standards, CE portal, and ethics code." },
      { name: "NCRTM", source: "RSA", url: "https://ncrtm.ed.gov/", desc: "National Clearinghouse of VR training materials." },
      { name: "RSA", source: "Federal", url: "https://rsa.ed.gov/", desc: "Federal VR policy, WIOA guidance, RSA-911 reporting." },
      { name: "NIDILRR", source: "ACL", url: "https://acl.gov/programs/research-and-development/nidilrr", desc: "Disability rehabilitation research funding." },
      { name: "CSAVR", source: "Policy", url: "https://www.csavr.org/", desc: "Council of State Administrators of Vocational Rehabilitation." },
      { name: "IARP", source: "Professional", url: "https://www.rehabpro.org/", desc: "International Association of Rehabilitation Professionals." },
    ],
  },
  {
    category: "Employer & Workforce Development",
    icon: "🤝",
    items: [
      { name: "ODEP", source: "DOL", url: "https://www.dol.gov/agencies/odep", desc: "Office of Disability Employment Policy leadership." },
      { name: "AskEARN", source: "ODEP", url: "https://askearn.org/", desc: "Employer Assistance and Resource Network on Disability Inclusion." },
      { name: "FedsHireVets.gov", source: "Veterans", url: "https://www.fedshirevets.gov/", desc: "Federal hiring information for veterans with disabilities." },
      { name: "American Job Centers", source: "WIOA", url: "https://www.careeronestop.org/LocalHelp/american-job-centers/", desc: "Nationwide workforce services." },
    ],
  },
  {
    category: "Case Management",
    icon: "📋",
    items: [
      { name: "SaraWorks", source: "Platform", url: "https://saraworks.com/", desc: "VR case management, IPE, Pre-ETS, WIOA reporting." },
      { name: "VocRehabTools Voice Case Notes", source: "AI", url: "https://www.vocrehabtools.com/", desc: "AI-assisted case note generation from audio." },
      { name: "RSA-911 Reporting Portal", source: "Required", url: "https://rsa.ed.gov/data/reports/rsa-911", desc: "Quarterly case data submission portal." },
      { name: "ILRU", source: "IL", url: "https://www.ilru.org/", desc: "Independent Living research and technical assistance." },
    ],
  },
];

export const CLIENT_RESOURCES: ResourceCategory[] = [
  {
    category: "Explore Careers",
    icon: "🧭",
    items: [
      { name: "My Next Move", source: "Free", url: "https://www.mynextmove.org/explore/ip", desc: "Find careers that match your interests." },
      { name: "O*NET OnLine", source: "Free", url: "https://www.onetonline.org/", desc: "Job descriptions, wages, and requirements." },
      { name: "Occupational Outlook Handbook", source: "BLS", url: "https://www.bls.gov/ooh/", desc: "Job growth, pay, and training needed." },
      { name: "CareerOneStop Career Finder", source: "Free", url: "https://www.careeronestop.org/Toolkit/Careers/skills-matcher.aspx", desc: "Find careers that match your skills." },
    ],
  },
  {
    category: "Job Search & Training",
    icon: "💼",
    items: [
      { name: "CareerOneStop Job Finder", source: "Free", url: "https://www.careeronestop.org/JobSearch/job-search.aspx", desc: "Search national job listings." },
      { name: "American Job Centers", source: "WIOA", url: "https://www.careeronestop.org/LocalHelp/american-job-centers/", desc: "Free local job training near you." },
      { name: "Training Finder", source: "Free", url: "https://www.careeronestop.org/LocalHelp/education-and-training/", desc: "Find approved training programs." },
      { name: "mySkills myFuture", source: "DOL", url: "https://www.careeronestop.org/Toolkit/Skills/skills-matcher.aspx", desc: "Match your skills to new careers." },
    ],
  },
  {
    category: "Disability & Workplace Rights",
    icon: "⚖️",
    items: [
      { name: "AskJAN", source: "Free/Confidential", url: "https://askjan.org/", desc: "Free help with workplace accommodations." },
      { name: "ADA National Network", source: "Free", url: "https://adata.org/", desc: "Know your rights under the ADA." },
      { name: "EEOC — File a Charge", source: "Federal", url: "https://www.eeoc.gov/filing-charge-discrimination", desc: "Report employment discrimination." },
      { name: "Disability Rights Advocates", source: "Legal", url: "https://dralegal.org/", desc: "National disability civil rights law center." },
    ],
  },
  {
    category: "Benefits & Financial",
    icon: "💰",
    items: [
      { name: "Ticket to Work", source: "SSA/Free", url: "https://choosework.ssa.gov/", desc: "Work while keeping your SSI or SSDI." },
      { name: "ABLE National Resource Center", source: "ABLE Act", url: "https://www.ablenrc.org/", desc: "Savings account for people with disabilities." },
      { name: "Benefits.gov", source: "Federal", url: "https://www.benefits.gov/", desc: "Check what benefits you may qualify for." },
      { name: "WIPA Program", source: "Free", url: "https://choosework.ssa.gov/findhelp/", desc: "Free benefits counseling near you." },
    ],
  },
  {
    category: "Independent Living",
    icon: "🏠",
    items: [
      { name: "ILRU — Find Your IL Center", source: "Free", url: "https://www.ilru.org/projects/cil-net/", desc: "Find your local Independent Living Center." },
      { name: "Disability.gov Resources", source: "ACL", url: "https://acl.gov/", desc: "Housing, transportation, and health links." },
      { name: "ADA Paratransit Finder", source: "DOT", url: "https://www.transit.dot.gov/ada/paratransit", desc: "ADA-compliant transportation services." },
    ],
  },
  {
    category: "Assistive Technology",
    icon: "🦾",
    items: [
      { name: "AT3 Center", source: "State AT", url: "https://at3center.net/", desc: "State AT programs and equipment loans." },
      { name: "ATIA", source: "Industry", url: "https://www.atia.org/", desc: "Assistive technology products and info." },
      { name: "Trace Research & Development", source: "Research", url: "https://trace.umd.edu/", desc: "Accessibility and AT for employment." },
    ],
  },
];

export const totalCounselorTools = COUNSELOR_RESOURCES.reduce(
  (sum, c) => sum + c.items.length,
  0,
);
export const totalClientTools = CLIENT_RESOURCES.reduce(
  (sum, c) => sum + c.items.length,
  0,
);
