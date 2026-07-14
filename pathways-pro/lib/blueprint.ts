// The Rehabilitation Systems Blueprint, converted from the source PDF into
// page images (1600px JPGs in /public/blueprint). Shown as a visual gallery
// on the Course page and, selectively, wherever a page is most relevant.

export interface BlueprintPage {
  n: number;
  src: string;
  caption: string;
  alt: string;
}

export const BLUEPRINT_PAGES: BlueprintPage[] = [
  {
    n: 1,
    src: "/blueprint/page-01.jpg",
    caption: "The Blueprint of Recovery — the VR & life care planning ecosystem.",
    alt: "Cover: a comprehensive schematic of the vocational rehabilitation and life care planning ecosystem, drawn as an engineering blueprint of the human body.",
  },
  {
    n: 2,
    src: "/blueprint/page-02.jpg",
    caption: "Federal legislation forms the structural foundation (1917–2014).",
    alt: "Timeline of federal legislation as growing pillars: Smith-Hughes Act 1917, Smith-Sears Act 1918, Civilian Rehabilitation Act 1920, Rehabilitation Act 1973, and WIOA 2014.",
  },
  {
    n: 3,
    src: "/blueprint/page-03.jpg",
    caption: "The VR lifecycle — from application and intake to placement.",
    alt: "Four-stage vocational rehabilitation lifecycle: application and intake, eligibility determination within 60 days, plan development with an IPE, and service delivery and placement.",
  },
  {
    n: 4,
    src: "/blueprint/page-04.jpg",
    caption: "The Individualized Plan for Employment engineers a pathway to work.",
    alt: "The IPE's four engineered components around WIOA section 102(b) compliance: target objective, resource allocation, sequential pathway, and quality control.",
  },
  {
    n: 5,
    src: "/blueprint/page-05.jpg",
    caption: "IPS models integrate mental health and vocational outcomes.",
    alt: "Individual Placement and Support model as interlocking gears: competitive employment focus, client choice, integrated services, client preferences, benefits counseling, rapid job search, systematic job development, and time-unlimited support.",
  },
  {
    n: 6,
    src: "/blueprint/page-06.jpg",
    caption: "Life care plans project lifetime medical needs and economic damages.",
    alt: "Life care planning: medical records, psychological assessments, and economic data flow through clinical judgment into a lifetime needs-and-costs plan.",
  },
  {
    n: 7,
    src: "/blueprint/page-07.jpg",
    caption: "Vocational experts translate functional capacity into legal frameworks.",
    alt: "Five practice areas for vocational experts: disability management, workers' compensation, forensic evaluation, wrongful death, and divorce proceedings.",
  },
  {
    n: 8,
    src: "/blueprint/page-08.jpg",
    caption: "The professional landscape spans service, compliance, and administration.",
    alt: "Role comparison table: senior vocational rehab counselor, VR supervisor, ADA accessibility coordinator, and DSPS coordinator — settings, scope, and focus.",
  },
  {
    n: 9,
    src: "/blueprint/page-09.jpg",
    caption: "Academic pathways: 60 credits, 700 clinical hours, the CRC exam.",
    alt: "Greek-temple blueprint of the academic pathway: a 60-credit CACREP master's foundation, 700 clinical hours structure, and the CRC exam as the pediment.",
  },
  {
    n: 10,
    src: "/blueprint/page-10.jpg",
    caption: "Independent certifications enforce standards and accountability.",
    alt: "Certification comparison table: CRC (1975), CCM (1993), CDMSC (1984), CNLCP (1999), and ABVE (1980) — exams, CEUs, ethics, and primary focus.",
  },
  {
    n: 11,
    src: "/blueprint/page-12.jpg",
    caption: "Expanding rehabilitation from functional impairment to purpose in life.",
    alt: "Life-satisfaction curve over time post-injury: the standard impairment-focused plateau versus the rising curve of purpose-oriented rehabilitation.",
  },
];
