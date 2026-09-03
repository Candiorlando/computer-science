from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, KeepTogether
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from datetime import date

OUTPUT = "/home/user/computer-science/Pay_Disparity_Report.pdf"

doc = SimpleDocTemplate(
    OUTPUT,
    pagesize=letter,
    leftMargin=0.85*inch,
    rightMargin=0.85*inch,
    topMargin=0.85*inch,
    bottomMargin=0.85*inch,
    title="Pay Disparity Analysis Report",
    author="Rehabilitation Counselor Senior",
)

BASE = getSampleStyleSheet()

def style(name, **kw):
    s = ParagraphStyle(name, parent=BASE["Normal"], **kw)
    return s

TITLE      = style("T", fontSize=18, fontName="Helvetica-Bold", textColor=colors.HexColor("#1a1a2e"), spaceAfter=4, alignment=TA_CENTER)
SUBTITLE   = style("ST", fontSize=11, fontName="Helvetica", textColor=colors.HexColor("#444466"), spaceAfter=2, alignment=TA_CENTER)
META       = style("M", fontSize=9, fontName="Helvetica", textColor=colors.grey, spaceAfter=12, alignment=TA_CENTER)
H1         = style("H1", fontSize=13, fontName="Helvetica-Bold", textColor=colors.HexColor("#1a1a2e"), spaceBefore=16, spaceAfter=6)
H2         = style("H2", fontSize=11, fontName="Helvetica-Bold", textColor=colors.HexColor("#2e4057"), spaceBefore=10, spaceAfter=4)
BODY       = style("B", fontSize=9, fontName="Helvetica", leading=14, spaceAfter=4)
BOLD_BODY  = style("BB", fontSize=9, fontName="Helvetica-Bold", leading=14, spaceAfter=4)
WARN       = style("W", fontSize=9, fontName="Helvetica-Bold", textColor=colors.HexColor("#b5451b"), leading=14, spaceAfter=4)
NOTE       = style("N", fontSize=8.5, fontName="Helvetica-Oblique", textColor=colors.HexColor("#555555"), leading=13, spaceAfter=4)

HEADER_CLR  = colors.HexColor("#1a1a2e")
ALT_CLR     = colors.HexColor("#f0f4f8")
BORDER_CLR  = colors.HexColor("#b0b8c8")
WARN_CLR    = colors.HexColor("#fff3cd")
WARN_BRD    = colors.HexColor("#e6a817")

def make_table(headers, rows, col_widths, alt=True, warn_rows=None):
    warn_rows = warn_rows or []
    data = [[Paragraph(h, style("TH", fontSize=8.5, fontName="Helvetica-Bold",
                                textColor=colors.white, alignment=TA_CENTER)) for h in headers]]
    for r in rows:
        data.append([Paragraph(str(c), style("TC", fontSize=8.5, fontName="Helvetica",
                                              alignment=TA_CENTER, leading=12)) for c in r])

    ts = TableStyle([
        ("BACKGROUND", (0,0), (-1,0), HEADER_CLR),
        ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, ALT_CLR] if alt else [colors.white]),
        ("GRID", (0,0), (-1,-1), 0.4, BORDER_CLR),
        ("TOPPADDING", (0,0), (-1,-1), 4),
        ("BOTTOMPADDING", (0,0), (-1,-1), 4),
        ("LEFTPADDING", (0,0), (-1,-1), 6),
        ("RIGHTPADDING", (0,0), (-1,-1), 6),
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
    ])
    for ri in warn_rows:
        ts.add("BACKGROUND", (0, ri+1), (-1, ri+1), WARN_CLR)

    t = Table(data, colWidths=col_widths)
    t.setStyle(ts)
    return t

story = []

# ── Cover ──────────────────────────────────────────────────────────────────
story.append(Spacer(1, 0.3*inch))
story.append(Paragraph("PAY DISPARITY ANALYSIS REPORT", TITLE))
story.append(Paragraph("Illinois Department of Human Services", SUBTITLE))
story.append(Paragraph("Rehabilitation Counselor Classification Series", SUBTITLE))
story.append(Spacer(1, 0.08*inch))
story.append(HRFlowable(width="100%", thickness=1.5, color=HEADER_CLR))
story.append(Spacer(1, 0.06*inch))
story.append(Paragraph(f"Report Date: May 17, 2026  |  Requestor Title: Rehabilitation Counselor Senior  |  Records Analyzed: 200 Unique Employees", META))
story.append(Paragraph("Data Source: Illinois Comptroller Salary Database", META))
story.append(Spacer(1, 0.1*inch))

# ── Executive Summary ──────────────────────────────────────────────────────
story.append(Paragraph("Executive Summary", H1))
story.append(HRFlowable(width="100%", thickness=0.5, color=BORDER_CLR))
story.append(Spacer(1, 4))
story.append(Paragraph(
    "Males earn more on average than females in <b>all three job title groups</b> within the Rehabilitation Counselor "
    "classification series. The pay gap is largest at the <b>Senior level (6.1%, or $6,090/year)</b>. Despite the workforce "
    "being 83% female, males consistently cluster at the top of each pay band. Additionally, pay compression anomalies exist "
    "where employees in lower-classified positions earn salaries equal to or exceeding those of RC Seniors.", BODY))

# ── Section 1: Group Statistics ────────────────────────────────────────────
story.append(Paragraph("Section 1: Pay Statistics by Job Title Group", H1))
story.append(HRFlowable(width="100%", thickness=0.5, color=BORDER_CLR))
story.append(Spacer(1, 4))

s1_headers = ["Metric", "RC Senior\n(Your Level)", "RC Mid-Level\n(Lower)", "RC Trainee\n(Lowest)"]
s1_rows = [
    ["Total employees", "60", "84", "56"],
    ["Male / Female count", "13 M / 47 F", "10 M / 74 F", "11 M / 45 F"],
    ["Male % of group", "21.7%", "11.9%", "19.6%"],
    ["Overall avg pay/month", "$8,372", "$6,412", "$5,720"],
    ["Overall avg pay/year", "$100,460", "$76,943", "$68,636"],
    ["Pay range/month", "$6,200–$9,600", "$5,600–$9,200", "$5,000–$7,800"],
]
story.append(make_table(s1_headers, s1_rows, [2.2*inch, 1.4*inch, 1.4*inch, 1.4*inch]))
story.append(Spacer(1, 8))

# ── Section 2: Gender Pay Gap ──────────────────────────────────────────────
story.append(Paragraph("Section 2: Male vs. Female Pay Gap by Group", H1))
story.append(HRFlowable(width="100%", thickness=0.5, color=BORDER_CLR))
story.append(Spacer(1, 4))

s2_headers = ["Group", "Male Avg/Year", "Female Avg/Year", "Gap/Year\n(Male Higher)", "Gap %"]
s2_rows = [
    ["RC Senior (your level)", "$105,231", "$99,140", "+$6,090", "+6.1%"],
    ["RC Mid-Level (lower)",   "$78,240",  "$76,768", "+$1,476", "+1.9%"],
    ["RC Trainee (lowest)",    "$69,382",  "$68,453", "+$929",   "+1.4%"],
    ["All 3 groups combined",  "$85,694",  "$80,848", "+$4,848", "+6.0%"],
]
story.append(make_table(s2_headers, s2_rows, [1.9*inch, 1.2*inch, 1.2*inch, 1.3*inch, 0.8*inch]))
story.append(Spacer(1, 6))
story.append(Paragraph(
    "Males earn more in every classification tier. The gap widens at the Senior level — the highest classification in the "
    "series — where males earn an average of <b>$508/month more</b> than female RC Seniors despite holding the same title.", BODY))

# ── Section 3a: Male RC Seniors ────────────────────────────────────────────
story.append(Paragraph("Section 3: Male Employees — Salary Rankings by Group", H1))
story.append(HRFlowable(width="100%", thickness=0.5, color=BORDER_CLR))
story.append(Spacer(1, 4))

story.append(Paragraph("3A — Rehabilitation Counselor SENIOR (Your Peer Group) — 13 Males", H2))
s3a_headers = ["Rank", "Name", "Pay/Month", "Pay/Year", "Year"]
s3a_rows = [
    ["1",  "DELGADO, DOMINGO",   "$9,600", "$115,200", "2026"],
    ["1",  "DOMERCANT, WILKY",   "$9,600", "$115,200", "2026"],
    ["3",  "ABRAHAM, MATHEWS",   "$9,200", "$110,400", "2026"],
    ["3",  "BASKE, JAMES",       "$9,200", "$110,400", "2026"],
    ["3",  "CHUNG, DANIEL",      "$9,200", "$110,400", "2026"],
    ["3",  "DIONNE, RANDY",      "$9,200", "$110,400", "2026"],
    ["7",  "CROWLEY, WILLIAM",   "$9,100", "$109,200", "2026"],
    ["8",  "DEJONG, NATHAN",     "$8,800", "$105,600", "2024"],
    ["9",  "ANGULO, ROBERT",     "$8,600", "$103,200", "2026"],
    ["9",  "DONETS, PAUL",       "$8,600", "$103,200", "2026"],
    ["11", "CONKLIN, JOSHUA",    "$8,200", "$98,400",  "2026"],
    ["12", "COLEMAN, CHARLES",   "$7,500", "$90,000",  "2026"],
    ["13", "DAVIS, MICHAEL",     "$7,200", "$86,400",  "2026"],
]
story.append(make_table(s3a_headers, s3a_rows, [0.5*inch, 2.1*inch, 1.1*inch, 1.1*inch, 0.6*inch]))
story.append(Spacer(1, 4))
story.append(Paragraph("<b>Male avg: $8,769/month ($105,231/year) &nbsp;|&nbsp; Female avg: $8,262/month ($99,140/year) &nbsp;|&nbsp; Gap: +$508/month (males higher)</b>", BOLD_BODY))
story.append(Spacer(1, 8))

# ── Section 3b: Male RC Mid-Level ──────────────────────────────────────────
story.append(Paragraph("3B — Rehabilitation Counselor MID-LEVEL (Lower Classification) — 10 Males", H2))
s3b_headers = ["Rank", "Name", "Pay/Month", "Pay/Year", "Year", "Note"]
s3b_rows = [
    ["1",  "JONES, TERRANCE",    "$9,200", "$110,400", "2024", "⚠ Outlier"],
    ["2",  "MARKOS, TEDROS",     "$7,000", "$84,000",  "2026", ""],
    ["3",  "ROSALES, JUAN",      "$6,800", "$81,600",  "2026", ""],
    ["4",  "TAYLOR, GIBRALTAR",  "$6,700", "$80,400",  "2026", ""],
    ["5",  "GOUARD, TYWON",      "$6,500", "$78,000",  "2026", ""],
    ["6",  "EDWARDS, JASON",     "$5,900", "$70,800",  "2024", ""],
    ["6",  "MEDINA, JOEL",       "$5,900", "$70,800",  "2026", ""],
    ["8",  "HAVEN, GRAHAM",      "$5,800", "$69,600",  "2026", ""],
    ["8",  "SEALS, NATHAN",      "$5,800", "$69,600",  "2026", ""],
    ["10", "THARAKAN, THUSHARA", "$5,600", "$67,200",  "2024", ""],
]
story.append(make_table(s3b_headers, s3b_rows, [0.5*inch, 1.9*inch, 1.0*inch, 1.0*inch, 0.55*inch, 0.9*inch], warn_rows=[0]))
story.append(Spacer(1, 4))
story.append(Paragraph("<b>Male avg: $6,520/month ($78,240/year) &nbsp;|&nbsp; Female avg: $6,397/month ($76,768/year)</b>", BOLD_BODY))
story.append(Paragraph(
    "⚠ JONES, TERRANCE earns $9,200/month — $2,200 above the next highest male in this group, and more than the female "
    "pay ceiling of $8,400/month. He also out-earns 4 male RC Seniors despite holding a lower classification. "
    "Excluding Jones, the male average drops to ~$6,178/month — below the female average.", WARN))
story.append(Spacer(1, 8))

# ── Section 3c: Male Trainees ──────────────────────────────────────────────
story.append(Paragraph("3C — Rehabilitation Counselor TRAINEE (Lowest Classification) — 11 Males", H2))
s3c_headers = ["Rank", "Name", "Pay/Month", "Pay/Year", "Note"]
s3c_rows = [
    ["1",  "ABRAHAM, JOSE",   "$7,700", "$92,400", "⚠ Near Senior range"],
    ["2",  "DEANY, DENNIS",   "$7,200", "$86,400", "⚠ Equals RC Senior DAVIS"],
    ["3",  "LANE, CHARLES",   "$6,300", "$75,600", ""],
    ["4",  "LIMON, FERNANDO", "$6,100", "$73,200", ""],
    ["5",  "SIMPSON, BRENT",  "$5,600", "$67,200", ""],
    ["6",  "BURRESS, ROBERT", "$5,400", "$64,800", ""],
    ["7",  "MOORE, JOSIAH",   "$5,100", "$61,200", ""],
    ["7",  "NETHERLY, JOHN",  "$5,100", "$61,200", ""],
    ["7",  "STEARNS, MICAH",  "$5,100", "$61,200", ""],
    ["10", "HURN, DAVID",     "$5,000", "$60,000", ""],
    ["10", "PATEL, NISHIL",   "$5,000", "$60,000", ""],
]
story.append(make_table(s3c_headers, s3c_rows, [0.5*inch, 1.9*inch, 1.1*inch, 1.0*inch, 1.9*inch], warn_rows=[0,1]))
story.append(Spacer(1, 4))
story.append(Paragraph("<b>Male avg: $5,782/month ($69,382/year) &nbsp;|&nbsp; Female avg: $5,704/month ($68,453/year)</b>", BOLD_BODY))

# ── Section 4: Compression Anomalies ──────────────────────────────────────
story.append(Paragraph("Section 4: Cross-Classification Pay Compression Anomalies", H1))
story.append(HRFlowable(width="100%", thickness=0.5, color=BORDER_CLR))
story.append(Spacer(1, 4))
story.append(Paragraph(
    "The following male employees in <b>lower-classified positions</b> earn salaries that meet or exceed what some "
    "RC Seniors earn — a direct pay compression and equity issue:", BODY))

s4_headers = ["Employee", "Their Title\n(Lower Classification)", "Pay/Month", "Pay/Year", "Issue"]
s4_rows = [
    ["JONES, TERRANCE", "RC Mid-Level", "$9,200", "$110,400", "Earns MORE than 4 male RC Seniors"],
    ["ABRAHAM, JOSE",   "RC Trainee",   "$7,700", "$92,400",  "Exceeds RC Senior DAVIS ($86,400)"],
    ["DEANY, DENNIS",   "RC Trainee",   "$7,200", "$86,400",  "Equals RC Senior DAVIS ($86,400)"],
]
story.append(make_table(s4_headers, s4_rows, [1.4*inch, 1.3*inch, 0.9*inch, 0.9*inch, 2.0*inch], warn_rows=[0,1,2]))
story.append(Spacer(1, 8))

# ── Section 5: Key Findings ────────────────────────────────────────────────
story.append(Paragraph("Section 5: Key Findings & Conclusions", H1))
story.append(HRFlowable(width="100%", thickness=0.5, color=BORDER_CLR))
story.append(Spacer(1, 4))

findings = [
    ("<b>1. Males earn more in every job category.</b>",
     "The pay gap ranges from 1.4% (Trainee) to 6.1% (Senior). The Senior-level gap represents $6,090/year in absolute terms."),
    ("<b>2. The gap is widest at the top.</b>",
     "The RC Senior group — the highest classification — shows the largest male pay advantage. Males cluster at $9,200–$9,600/month while many female Seniors occupy lower positions within the same pay band."),
    ("<b>3. Workforce is 83% female, yet males earn more.</b>",
     "Despite being a clear minority (17% of the workforce), males consistently earn above-average salaries across all three classification levels."),
    ("<b>4. Pay compression exists across classification levels.</b>",
     "Two male Trainees and one male mid-level Counselor earn at or above what some RC Seniors earn — suggesting the pay band structure is not functioning as intended, or individual step placements have not been regularly reviewed."),
    ("<b>5. JONES, TERRANCE (RC mid-level, $9,200/month) is the most notable anomaly.</b>",
     "His salary exceeds the female pay ceiling for his entire classification and surpasses several employees in the higher-classified Senior role. This warrants direct HR review."),
    ("<b>6. The highest-paid Trainee overall is female</b>",
     "(REESE, DEBRA, $7,800/month), demonstrating that the disparity is not universal at the individual level — but the averages consistently favor males at every tier."),
]

for header, body in findings:
    story.append(KeepTogether([
        Paragraph(header, BOLD_BODY),
        Paragraph(body, BODY),
        Spacer(1, 4),
    ]))

# ── Methodology ────────────────────────────────────────────────────────────
story.append(Paragraph("Methodology Notes", H1))
story.append(HRFlowable(width="100%", thickness=0.5, color=BORDER_CLR))
story.append(Spacer(1, 4))
for note in [
    "Records analyzed: 200 unique employees (deduplicated by Employee ID, most recent year retained).",
    "Gender determination: No gender field exists in the dataset; gender was inferred from first names using standard name-gender classification. Ambiguous names defaulted to the statistically predominant gender.",
    "Pay field: Rate_of_Pay interpreted as monthly salary (consistent with Illinois state pay scales: ~$60K–$115K annually for these classifications).",
    "Trainee records: All carry Issue_Year '0,' indicating a different data extraction period (possibly a career-history view).",
    "Data years in dataset: 2024, 2025, 2026 (plus legacy '0' for Trainees).",
]:
    story.append(Paragraph(f"• {note}", NOTE))

story.append(Spacer(1, 0.2*inch))
story.append(HRFlowable(width="100%", thickness=0.5, color=BORDER_CLR))
story.append(Spacer(1, 4))
story.append(Paragraph("End of Report — Pay Disparity Analysis, Illinois DHS Rehabilitation Counselor Series", META))

doc.build(story)
print(f"PDF saved to: {OUTPUT}")
