// Curated funding sources for VR clients. Federal and trusted-nonprofit
// only — no third-party scholarship aggregators (many are spam-prone or
// require email harvesting). URLs verified against the issuing agency
// June 2026.

export interface FundingSource {
  name: string;
  url: string;
  who: string; // who it's for
  pays: string; // what it pays for
  notes?: string;
}

export interface FundingCategory {
  category: string;
  icon: string;
  blurb: string;
  sources: FundingSource[];
}

export const FUNDING_CATEGORIES: FundingCategory[] = [
  {
    category: "Federal Student Aid",
    icon: "🎓",
    blurb:
      "Start here for any college, vocational, or trade school. The FAFSA is the gatekeeper for almost every federal aid program.",
    sources: [
      {
        name: "FAFSA — Free Application for Federal Student Aid",
        url: "https://studentaid.gov/h/apply-for-aid/fafsa",
        who: "Anyone pursuing eligible postsecondary education",
        pays: "Grants, loans, work-study — unlocks federal Pell + most state aid",
        notes: "Free application. Beware sites that charge a fee — they're scams.",
      },
      {
        name: "Federal Pell Grant",
        url: "https://studentaid.gov/understand-aid/types/grants/pell",
        who: "Undergraduates with exceptional financial need",
        pays: "Up to $7,395/year (2024–25). Does not need to be repaid.",
      },
      {
        name: "Federal Work-Study",
        url: "https://studentaid.gov/understand-aid/types/work-study",
        who: "Undergrad and grad students with financial need",
        pays: "Part-time job earnings while enrolled",
      },
      {
        name: "Federal Supplemental Educational Opportunity Grant (FSEOG)",
        url: "https://studentaid.gov/understand-aid/types/grants/fseog",
        who: "Undergraduates with exceptional financial need (Pell recipients prioritized)",
        pays: "$100–$4,000/year. Does not need to be repaid.",
      },
      {
        name: "Direct Subsidized & Unsubsidized Loans",
        url: "https://studentaid.gov/understand-aid/types/loans/subsidized-unsubsidized",
        who: "Undergrad and grad students",
        pays: "Education costs; subsidized loans don't accrue interest while enrolled at least half-time",
      },
    ],
  },
  {
    category: "Vocational Rehabilitation (Disability)",
    icon: "♿",
    blurb:
      "State VR agencies pay for training, equipment, and services tied to your employment goal — at no cost to you. This is usually the right first call for VR clients.",
    sources: [
      {
        name: "Your State VR Agency",
        url: "https://rsa.ed.gov/about/states",
        who: "People with a disability that's a barrier to employment",
        pays: "Tuition, books, AT/AAC, transportation, job coaching, supported employment",
        notes:
          "Free to apply. Income-based fee schedule for some services in some states.",
      },
      {
        name: "VA Vocational Rehabilitation & Employment (VR&E / Chapter 31)",
        url: "https://www.va.gov/careers-employment/vocational-rehabilitation/",
        who: "Veterans with a service-connected disability rated ≥10%",
        pays:
          "Tuition + housing allowance + books + tools. More generous than the GI Bill for many veterans.",
      },
      {
        name: "Ticket to Work",
        url: "https://choosework.ssa.gov/",
        who: "SSDI / SSI beneficiaries ages 18–64",
        pays:
          "Free employment services through approved Employment Networks. Protects benefits while you try work.",
      },
      {
        name: "ABLE Account",
        url: "https://www.ablenrc.org/",
        who: "People whose disability began before age 26 (rising to 46 in 2026)",
        pays:
          "Tax-advantaged savings account for disability-related expenses, including education. Up to $19,000/yr (2024) without losing SSI/Medicaid.",
      },
    ],
  },
  {
    category: "WIOA-Funded Training",
    icon: "🏛️",
    blurb:
      "Workforce Innovation and Opportunity Act funding for adults, dislocated workers, and youth — administered through American Job Centers.",
    sources: [
      {
        name: "American Job Centers",
        url: "https://www.careeronestop.org/LocalHelp/AmericanJobCenters/find-american-job-centers.aspx",
        who: "Anyone — priority for low-income, public-assistance recipients, and underemployed",
        pays:
          "ITAs (Individual Training Accounts) for approved training, supportive services, job search assistance",
      },
      {
        name: "Job Corps",
        url: "https://www.jobcorps.gov/",
        who: "Ages 16–24, income-eligible",
        pays:
          "Tuition + housing + meals + medical + monthly stipend during career training. Residential program.",
      },
      {
        name: "YouthBuild",
        url: "https://www.dol.gov/agencies/eta/youthbuild",
        who: "Ages 16–24 who left high school",
        pays: "GED/HS diploma + construction training + stipend",
      },
      {
        name: "Trade Adjustment Assistance (TAA)",
        url: "https://www.dol.gov/agencies/eta/tradeact",
        who: "Workers whose job was lost due to foreign trade",
        pays:
          "Training + income support + job search + relocation allowances. Limited time to apply after layoff.",
      },
    ],
  },
  {
    category: "Apprenticeships",
    icon: "🔧",
    blurb:
      "Earn while you learn. Registered apprenticeships pay wages from day one and end with a portable, nationally recognized credential.",
    sources: [
      {
        name: "Apprenticeship.gov",
        url: "https://www.apprenticeship.gov/",
        who: "Anyone — many programs have no upfront cost",
        pays:
          "Wages during training + tuition reimbursement (varies by program) + journey-level credential",
      },
      {
        name: "Office of Apprenticeship Sponsors",
        url: "https://www.apprenticeship.gov/employers/registered-apprenticeship-program",
        who: "Employers and individuals seeking sponsors",
        pays: "Directory of registered sponsors by state and trade",
      },
    ],
  },
  {
    category: "Veterans",
    icon: "🎖️",
    blurb:
      "Beyond VR&E (above), veterans qualify for several substantial education benefits.",
    sources: [
      {
        name: "Post-9/11 GI Bill",
        url: "https://www.va.gov/education/about-gi-bill-benefits/post-9-11/",
        who: "Veterans with 90+ days active duty after Sept 10, 2001",
        pays:
          "Full in-state tuition at public schools + housing allowance + books stipend, up to 36 months",
      },
      {
        name: "Montgomery GI Bill — Active Duty (MGIB-AD)",
        url: "https://www.va.gov/education/about-gi-bill-benefits/montgomery-active-duty/",
        who: "Active-duty veterans who paid in $1,200",
        pays: "Monthly education benefit up to 36 months",
      },
      {
        name: "Yellow Ribbon Program",
        url: "https://www.va.gov/education/about-gi-bill-benefits/post-9-11/yellow-ribbon-program/",
        who: "Post-9/11 GI Bill users at participating schools",
        pays: "Covers tuition above the Post-9/11 GI Bill cap (private and out-of-state)",
      },
    ],
  },
  {
    category: "State, Tribal & Specialized",
    icon: "🏔️",
    blurb:
      "Aid that varies by state, tribe, or population — usually stacks on top of federal aid.",
    sources: [
      {
        name: "State Grant Programs",
        url: "https://www.nasfaa.org/State_Financial_Aid_Programs",
        who: "Residents of each state (rules vary)",
        pays:
          "State-level need-based grants. FAFSA usually qualifies you automatically.",
      },
      {
        name: "Bureau of Indian Education Higher Education Grant",
        url: "https://www.bie.edu/topic-page/higher-education-grant-program",
        who: "Enrolled members of federally recognized tribes",
        pays: "Undergraduate tuition assistance",
      },
      {
        name: "Childcare Subsidies (CCDF)",
        url: "https://www.acf.hhs.gov/occ/map/ccdf-state-fact-sheets",
        who: "Working or in-training parents below state income thresholds",
        pays: "Childcare during work, school, or training",
      },
      {
        name: "Single Parent Scholarship Fund",
        url: "https://aspsf.org/",
        who: "Low-income single parents pursuing a degree or credential",
        pays: "Tuition + childcare + transportation. Statewide programs in some states.",
      },
    ],
  },
  {
    category: "Scholarship Search",
    icon: "🔍",
    blurb:
      "Free, ad-free scholarship search tools. Avoid sites that ask for a credit card or 'application fee.'",
    sources: [
      {
        name: "CareerOneStop Scholarship Finder",
        url: "https://www.careeronestop.org/Toolkit/Training/find-scholarships.aspx",
        who: "Anyone — searchable by field, level, and award type",
        pays: "Database of 8,000+ scholarships from U.S. Department of Labor",
      },
      {
        name: "U.S. Department of Labor's Scholarship Database",
        url: "https://www.benefits.gov/categories/Education%20and%20Training",
        who: "Anyone",
        pays: "Federal scholarship and aid programs by category",
      },
      {
        name: "Federal Student Aid Wizard",
        url: "https://studentaid.gov/h/apply-for-aid/fafsa",
        who: "Anyone considering federal aid",
        pays: "Estimate aid eligibility before applying",
      },
    ],
  },
];
