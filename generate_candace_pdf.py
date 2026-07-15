import pickle
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, KeepTogether, PageBreak
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

OUTPUT = "/home/user/computer-science/Candace_Metcalf_Pay_Disparity_Report.pdf"

with open('/tmp/pay_data.pkl', 'rb') as f:
    d = pickle.load(f)

candace  = d['candace']
senior   = d['senior']
midlevel = d['midlevel']
trainee  = d['trainee']

c_pay = candace['pay_mo']
c_yr  = candace['pay_yr']

# ── Style helpers ──────────────────────────────────────────────────────────

def S(name, **kw):
    base = getSampleStyleSheet()['Normal']
    return ParagraphStyle(name, parent=base, **kw)

DARK   = colors.HexColor("#1a1a2e")
BLUE   = colors.HexColor("#2e4a7a")
ALT    = colors.HexColor("#eef3fb")
WARN   = colors.HexColor("#fff0cc")
GREEN  = colors.HexColor("#e6f9ed")
RED    = colors.HexColor("#fde8e8")
BORDER = colors.HexColor("#a8b8d0")
WRED   = colors.HexColor("#c0392b")
WGREEN = colors.HexColor("#1e8449")

TITLE   = S("TT", fontSize=20, fontName="Helvetica-Bold", textColor=DARK,    spaceAfter=4,  alignment=TA_CENTER)
SUB     = S("ST", fontSize=11, fontName="Helvetica",      textColor=BLUE,    spaceAfter=2,  alignment=TA_CENTER)
META    = S("ME", fontSize=8.5,fontName="Helvetica",      textColor=colors.grey, spaceAfter=10, alignment=TA_CENTER)
H1      = S("H1", fontSize=13, fontName="Helvetica-Bold", textColor=DARK,    spaceBefore=14, spaceAfter=5)
H2      = S("H2", fontSize=10.5,fontName="Helvetica-Bold",textColor=BLUE,    spaceBefore=8,  spaceAfter=4)
BODY    = S("BO", fontSize=9,  fontName="Helvetica",      leading=14,        spaceAfter=4)
BBOLD   = S("BB", fontSize=9,  fontName="Helvetica-Bold", leading=14,        spaceAfter=4)
NOTE    = S("NO", fontSize=8.5,fontName="Helvetica-Oblique", textColor=colors.HexColor("#555"), leading=13, spaceAfter=3)
WARN_S  = S("WS", fontSize=9,  fontName="Helvetica-Bold", textColor=WRED,    leading=14,    spaceAfter=4)
GOOD_S  = S("GS", fontSize=9,  fontName="Helvetica-Bold", textColor=WGREEN,  leading=14,    spaceAfter=4)

def cell(text, bold=False, align=TA_CENTER, size=8.5, color=colors.black):
    fn = "Helvetica-Bold" if bold else "Helvetica"
    return Paragraph(str(text), S("c", fontSize=size, fontName=fn,
                                   textColor=color, alignment=align, leading=12))

def make_table(headers, rows, widths, row_colors=None):
    data = [[cell(h, bold=True, color=colors.white) for h in headers]]
    for r in rows:
        data.append([cell(v) for v in r])
    ts = TableStyle([
        ("BACKGROUND", (0,0), (-1,0), DARK),
        ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, ALT]),
        ("GRID", (0,0), (-1,-1), 0.4, BORDER),
        ("TOPPADDING",    (0,0), (-1,-1), 4),
        ("BOTTOMPADDING", (0,0), (-1,-1), 4),
        ("LEFTPADDING",   (0,0), (-1,-1), 5),
        ("RIGHTPADDING",  (0,0), (-1,-1), 5),
        ("VALIGN",        (0,0), (-1,-1), "MIDDLE"),
    ])
    if row_colors:
        for ri, clr in row_colors.items():
            ts.add("BACKGROUND", (0, ri+1), (-1, ri+1), clr)
    t = Table(data, colWidths=widths)
    t.setStyle(ts)
    return t

def candace_row_style(males):
    """Return row-color dict highlighting rows vs Candace."""
    colors_map = {}
    for i, m in enumerate(males):
        diff = m['pay_mo'] - c_pay
        if diff > 0:
            colors_map[i] = RED
        else:
            colors_map[i] = GREEN
    return colors_map

def fmt_diff(diff):
    sign = "+" if diff >= 0 else ""
    return f"{sign}${diff:,.0f}/mo  ({sign}${diff*12:,.0f}/yr)"

# ── Build story ────────────────────────────────────────────────────────────

doc = SimpleDocTemplate(
    OUTPUT, pagesize=letter,
    leftMargin=0.8*inch, rightMargin=0.8*inch,
    topMargin=0.85*inch, bottomMargin=0.85*inch,
    title="Pay Disparity Report — Candace Metcalf",
    author="Illinois DHS Pay Equity Analysis",
)
story = []

# Cover
story.append(Spacer(1, 0.2*inch))
story.append(Paragraph("PAY DISPARITY REPORT", TITLE))
story.append(Paragraph("CANDACE METCALF vs. ALL MALE EMPLOYEES", SUB))
story.append(Paragraph("Rehabilitation Counselor Senior · Rehabilitation Counselor · Trainee", SUB))
story.append(Spacer(1, 0.05*inch))
story.append(HRFlowable(width="100%", thickness=2, color=DARK))
story.append(Spacer(1, 0.04*inch))
story.append(Paragraph("Illinois Department of Human Services  |  Report Date: May 17, 2026  |  Data: Illinois Comptroller Salary Database", META))
story.append(Spacer(1, 0.1*inch))

# Candace summary box
candace_box_data = [[
    cell("CANDACE METCALF", bold=True, size=11),
    cell("Title", bold=True, size=8.5),
    cell("Monthly Pay", bold=True, size=8.5),
    cell("Annual Pay", bold=True, size=8.5),
    cell("Data Year", bold=True, size=8.5),
],[
    cell("Subject of Analysis", size=8.5),
    cell("Rehabilitation Counselor Senior", size=8.5),
    cell(f"${c_pay:,.0f}", bold=True, size=10, color=BLUE),
    cell(f"${c_yr:,.0f}", bold=True, size=10, color=BLUE),
    cell("2026", size=8.5),
]]
t = Table(candace_box_data, colWidths=[1.5*inch,2.0*inch,1.1*inch,1.1*inch,0.7*inch])
t.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,0), BLUE),
    ("BACKGROUND", (0,1), (-1,1), ALT),
    ("GRID", (0,0), (-1,-1), 0.5, BORDER),
    ("TOPPADDING",    (0,0), (-1,-1), 5),
    ("BOTTOMPADDING", (0,0), (-1,-1), 5),
    ("LEFTPADDING",   (0,0), (-1,-1), 6),
    ("RIGHTPADDING",  (0,0), (-1,-1), 6),
    ("VALIGN",        (0,0), (-1,-1), "MIDDLE"),
    ("TEXTCOLOR",     (0,0), (-1,0),  colors.white),
]))
story.append(t)
story.append(Spacer(1, 0.1*inch))

# ── Summary table ──────────────────────────────────────────────────────────
story.append(Paragraph("Executive Summary — Candace vs. Male Averages by Group", H1))
story.append(HRFlowable(width="100%", thickness=0.5, color=BORDER))
story.append(Spacer(1, 4))

def group_stats(group):
    males = [r for r in group if r['gender']=='M']
    male_pay = [r['pay_mo'] for r in males]
    return males, sum(male_pay)/len(male_pay) if male_pay else 0

sr_males, sr_mavg = group_stats(senior)
ml_males, ml_mavg = group_stats(midlevel)
tr_males, tr_mavg = group_stats(trainee)

def diff_str(d):
    s = "+" if d >= 0 else ""
    clr = WGREEN if d >= 0 else WRED
    return f"{s}${d:,.0f}/mo", clr

sum_headers = ["Classification", "# Male\nEmployees", "Male Avg\nPay/Month", "Male Avg\nPay/Year", "Candace\nPay/Month", "Candace vs\nMale Avg/Mo", "Candace\nPay/Year"]
sr_diff = c_pay - sr_mavg
ml_diff = c_pay - ml_mavg
tr_diff = c_pay - tr_mavg

sum_rows = [
    ["RC Senior\n(Candace's Level)", str(len(sr_males)), f"${sr_mavg:,.0f}", f"${sr_mavg*12:,.0f}",
     f"${c_pay:,.0f}", f"{'+' if sr_diff>=0 else ''}{sr_diff:,.0f}", f"${c_yr:,.0f}"],
    ["RC Mid-Level\n(Lower Class)", str(len(ml_males)), f"${ml_mavg:,.0f}", f"${ml_mavg*12:,.0f}",
     f"${c_pay:,.0f}", f"{'+' if ml_diff>=0 else ''}{ml_diff:,.0f}", f"${c_yr:,.0f}"],
    ["RC Trainee\n(Lowest Class)", str(len(tr_males)), f"${tr_mavg:,.0f}", f"${tr_mavg*12:,.0f}",
     f"${c_pay:,.0f}", f"{'+' if tr_diff>=0 else ''}{tr_diff:,.0f}", f"${c_yr:,.0f}"],
]
rcolors = {0: RED, 1: WARN, 2: GREEN}
story.append(make_table(sum_headers, sum_rows,
    [1.4*inch, 0.65*inch, 1.0*inch, 1.0*inch, 1.0*inch, 1.0*inch, 1.0*inch],
    row_colors=rcolors))
story.append(Spacer(1, 4))
story.append(Paragraph(
    f"<b>Key finding:</b> Candace earns <b>${c_pay:,.0f}/month (${c_yr:,.0f}/year)</b>. "
    f"Male RC Seniors — her own classification peers — earn an average of <b>${sr_mavg:,.0f}/month</b>, "
    f"meaning Candace earns <b>${abs(sr_diff):,.0f}/month (${abs(sr_diff)*12:,.0f}/year) LESS</b> than the male average in her own title. "
    f"<b>{sum(1 for m in sr_males if m['pay_mo'] > c_pay)} out of {len(sr_males)} male RC Seniors</b> earn more than Candace.", BODY))
story.append(Paragraph(
    f"Candace earns more than the male average at the Trainee level (+${tr_diff:,.0f}/mo) "
    f"and is nearly equal to the male average at the mid-level RC (+${ml_diff:,.0f}/mo). "
    f"The disparity is concentrated within her own job classification.", BODY))

# ── Legend ─────────────────────────────────────────────────────────────────
legend_data = [[
    cell("  RED rows = male earns MORE than Candace", color=WRED),
    cell("  GREEN rows = Candace earns MORE than male", color=WGREEN),
]]
lt = Table(legend_data, colWidths=[3.25*inch, 3.25*inch])
lt.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (0,0), RED),
    ("BACKGROUND", (1,0), (1,0), GREEN),
    ("BOX", (0,0), (-1,-1), 0.5, BORDER),
    ("TOPPADDING", (0,0),(-1,-1),3), ("BOTTOMPADDING",(0,0),(-1,-1),3),
    ("LEFTPADDING",(0,0),(-1,-1),5),
]))
story.append(Spacer(1, 6))
story.append(lt)
story.append(Spacer(1, 6))

# ── SECTION 1: RC SENIOR MALES ─────────────────────────────────────────────
story.append(PageBreak())
story.append(Paragraph("Section 1: RC Senior Males vs. Candace Metcalf", H1))
story.append(HRFlowable(width="100%", thickness=0.5, color=BORDER))
story.append(Spacer(1, 4))
story.append(Paragraph(
    f"Candace's title: <b>Rehabilitation Counselor Senior</b> · Pay: <b>${c_pay:,.0f}/mo (${c_yr:,.0f}/yr)</b> · "
    f"Total male RC Seniors: <b>{len(sr_males)}</b> · Male avg: <b>${sr_mavg:,.0f}/mo</b> · "
    f"Candace vs male avg: <b>${sr_diff:+,.0f}/mo</b>", BODY))

above = sum(1 for m in sr_males if m['pay_mo'] > c_pay)
equal = sum(1 for m in sr_males if m['pay_mo'] == c_pay)
below = sum(1 for m in sr_males if m['pay_mo'] < c_pay)
story.append(Paragraph(
    f"<b>{above} males earn MORE</b> than Candace · <b>{equal} earn equal</b> · <b>{below} earn less</b>", BBOLD))
story.append(Spacer(1, 6))

sr_headers = ["#", "Name", "Pay/Month", "Pay/Year", "vs. Candace/Mo", "vs. Candace/Yr", "Year"]
sr_rows = []
rcolors_sr = {}
for i, m in enumerate(sr_males):
    diff = m['pay_mo'] - c_pay
    d_mo = f"{'+' if diff>=0 else ''}${diff:,.0f}"
    d_yr = f"{'+' if diff>=0 else ''}${diff*12:,.0f}"
    sr_rows.append([str(i+1), m['name'], f"${m['pay_mo']:,.0f}", f"${m['pay_yr']:,.0f}",
                    d_mo, d_yr, m['year'].split('.')[0]])
    rcolors_sr[i] = RED if diff > 0 else (WARN if diff == 0 else GREEN)

story.append(make_table(sr_headers, sr_rows,
    [0.3*inch, 2.0*inch, 0.85*inch, 0.9*inch, 1.0*inch, 1.0*inch, 0.45*inch],
    row_colors=rcolors_sr))
story.append(Spacer(1, 8))

# Stats box
worst = sr_males[0]
story.append(Paragraph(
    f"<b>Highest-paid male RC Senior:</b> {worst['name']} at ${worst['pay_mo']:,.0f}/mo — "
    f"${worst['pay_mo']-c_pay:,.0f}/mo (${(worst['pay_mo']-c_pay)*12:,.0f}/yr) more than Candace.", WARN_S))
story.append(Paragraph(
    f"<b>Male average of ${sr_mavg:,.0f}/mo vs. Candace's ${c_pay:,.0f}/mo = "
    f"${abs(sr_diff):,.0f}/month (${abs(sr_diff)*12:,.0f}/year) disparity within the same title.</b>", WARN_S))

# ── SECTION 2: RC MID-LEVEL MALES ─────────────────────────────────────────
story.append(PageBreak())
story.append(Paragraph("Section 2: RC Mid-Level (Rehabilitation Counselor) Males vs. Candace", H1))
story.append(HRFlowable(width="100%", thickness=0.5, color=BORDER))
story.append(Spacer(1, 4))
story.append(Paragraph(
    f"These employees hold a <b>lower classification</b> than Candace. "
    f"Total male RC mid-level: <b>{len(ml_males)}</b> · Male avg: <b>${ml_mavg:,.0f}/mo</b> · "
    f"Candace vs male avg: <b>${ml_diff:+,.0f}/mo</b>", BODY))

ml_above = sum(1 for m in ml_males if m['pay_mo'] > c_pay)
ml_equal = sum(1 for m in ml_males if m['pay_mo'] == c_pay)
ml_below = sum(1 for m in ml_males if m['pay_mo'] < c_pay)
story.append(Paragraph(
    f"<b>{ml_above} lower-classified males earn MORE than Candace</b> · "
    f"<b>{ml_equal} earn equal</b> · <b>{ml_below} earn less</b>", BBOLD))
story.append(Spacer(1, 6))

ml_headers = ["#", "Name", "Pay/Month", "Pay/Year", "vs. Candace/Mo", "vs. Candace/Yr", "Year"]
ml_rows = []
rcolors_ml = {}
for i, m in enumerate(ml_males):
    diff = m['pay_mo'] - c_pay
    d_mo = f"{'+' if diff>=0 else ''}${diff:,.0f}"
    d_yr = f"{'+' if diff>=0 else ''}${diff*12:,.0f}"
    ml_rows.append([str(i+1), m['name'], f"${m['pay_mo']:,.0f}", f"${m['pay_yr']:,.0f}",
                    d_mo, d_yr, m['year'].split('.')[0]])
    rcolors_ml[i] = RED if diff > 0 else (WARN if diff == 0 else GREEN)

story.append(make_table(ml_headers, ml_rows,
    [0.3*inch, 2.0*inch, 0.85*inch, 0.9*inch, 1.0*inch, 1.0*inch, 0.45*inch],
    row_colors=rcolors_ml))
story.append(Spacer(1, 8))

if ml_above > 0:
    top_ml = [m for m in ml_males if m['pay_mo'] > c_pay]
    names_above = ", ".join(m['name'] for m in top_ml)
    story.append(Paragraph(
        f"<b>Pay compression alert:</b> {ml_above} male(s) in the LOWER-classified RC position earn MORE than "
        f"Candace who holds the SENIOR title: {names_above}.", WARN_S))
else:
    story.append(Paragraph(
        f"No mid-level male RC earns more than Candace. Candace earns above or equal to "
        f"all males in this lower classification.", GOOD_S))

# ── SECTION 3: RC TRAINEE MALES ────────────────────────────────────────────
story.append(PageBreak())
story.append(Paragraph("Section 3: RC Trainee Males vs. Candace", H1))
story.append(HRFlowable(width="100%", thickness=0.5, color=BORDER))
story.append(Spacer(1, 4))
story.append(Paragraph(
    f"These employees hold the <b>lowest classification</b> in the RC series. "
    f"Total male RC Trainees: <b>{len(tr_males)}</b> · Male avg: <b>${tr_mavg:,.0f}/mo</b> · "
    f"Candace vs male avg: <b>+${tr_diff:,.0f}/mo</b>", BODY))

tr_above = sum(1 for m in tr_males if m['pay_mo'] > c_pay)
tr_equal = sum(1 for m in tr_males if m['pay_mo'] == c_pay)
tr_below = sum(1 for m in tr_males if m['pay_mo'] < c_pay)
story.append(Paragraph(
    f"<b>{tr_above} trainee males earn MORE than Candace</b> · "
    f"<b>{tr_equal} earn equal</b> · <b>{tr_below} earn less</b>", BBOLD))
story.append(Spacer(1, 6))

tr_headers = ["#", "Name", "Pay/Month", "Pay/Year", "vs. Candace/Mo", "vs. Candace/Yr", "Year"]
tr_rows = []
rcolors_tr = {}
for i, m in enumerate(tr_males):
    diff = m['pay_mo'] - c_pay
    d_mo = f"{'+' if diff>=0 else ''}${diff:,.0f}"
    d_yr = f"{'+' if diff>=0 else ''}${diff*12:,.0f}"
    tr_rows.append([str(i+1), m['name'], f"${m['pay_mo']:,.0f}", f"${m['pay_yr']:,.0f}",
                    d_mo, d_yr, m['year'].split('.')[0]])
    rcolors_tr[i] = RED if diff > 0 else (WARN if diff == 0 else GREEN)

story.append(make_table(tr_headers, tr_rows,
    [0.3*inch, 2.0*inch, 0.85*inch, 0.9*inch, 1.0*inch, 1.0*inch, 0.45*inch],
    row_colors=rcolors_tr))
story.append(Spacer(1, 8))

if tr_above > 0:
    top_tr = [m for m in tr_males if m['pay_mo'] > c_pay]
    names_above = ", ".join(m['name'] for m in top_tr)
    story.append(Paragraph(
        f"<b>Severe pay compression:</b> {tr_above} male Trainee(s) — the LOWEST classification — "
        f"earn more than Candace who holds the SENIOR title: {names_above}.", WARN_S))
else:
    story.append(Paragraph(
        f"Candace earns more than all male Trainees, as expected for the senior classification.", GOOD_S))

# ── SECTION 4: Key Findings ────────────────────────────────────────────────
story.append(PageBreak())
story.append(Paragraph("Section 4: Key Findings & Conclusions", H1))
story.append(HRFlowable(width="100%", thickness=0.5, color=BORDER))
story.append(Spacer(1, 6))

findings = [
    (f"1. Candace earns ${abs(sr_diff):,.0f}/month (${abs(sr_diff)*12:,.0f}/year) less than the male average in her own title.",
     f"There are {len(sr_males)} male Rehabilitation Counselor Seniors. Their average pay is ${sr_mavg:,.0f}/month vs. "
     f"Candace's ${c_pay:,.0f}/month. {above} of {len(sr_males)} male RC Seniors earn more than Candace — only {below} earn less.",
     True),
    (f"2. {above} out of {len(sr_males)} male peers ({above/len(sr_males)*100:.0f}%) out-earn Candace within the same title.",
     f"The highest-paid male RC Senior, {sr_males[0]['name']}, earns ${sr_males[0]['pay_mo']:,.0f}/month — "
     f"${sr_males[0]['pay_mo']-c_pay:,.0f}/month more than Candace. The pay band for RC Senior ranges from "
     f"${min(r['pay_mo'] for r in senior):,.0f} to ${max(r['pay_mo'] for r in senior):,.0f}/month.",
     True),
    (f"3. Candace is paid near the bottom of the RC Senior pay band.",
     f"Candace's pay of ${c_pay:,.0f}/month ranks her #{sum(1 for r in senior if r['pay_mo'] > c_pay)+1} out of {len(senior)} total "
     f"RC Seniors (all genders). Among male RC Seniors only, she would rank below all {above} who earn more.",
     True),
    ("4. Mid-level pay compression: some lower-classified males earn near Candace's level.",
     f"The male RC mid-level average is ${ml_mavg:,.0f}/month. {ml_above} male mid-level RC employee(s) earn at or above Candace's "
     f"pay despite holding a lower-classified position. This suggests either promotion delays for Candace or "
     f"inadequate step placement upon promotion to Senior.",
     ml_above > 0),
    ("5. Candace earns appropriately more than Trainee males.",
     f"The male Trainee average is ${tr_mavg:,.0f}/month. Candace earns ${tr_diff:,.0f}/month more than the male Trainee "
     f"average — a reasonable differential for the Senior title. However, {tr_above} Trainee male(s) earn above her.",
     tr_above > 0),
]

for header, body, is_warn in findings:
    story.append(KeepTogether([
        Paragraph(f"<b>{header}</b>", WARN_S if is_warn else GOOD_S),
        Paragraph(body, BODY),
        Spacer(1, 4),
    ]))

# ── Methodology ────────────────────────────────────────────────────────────
story.append(Spacer(1, 8))
story.append(HRFlowable(width="100%", thickness=0.5, color=BORDER))
story.append(Paragraph("Methodology", H2))
for note in [
    "Source: Illinois Comptroller Salary Database (accessed May 14, 2026).",
    f"Total records analyzed: {len(senior)+len(midlevel)+len(trainee)} unique employees across 3 classification levels (most recent year per employee).",
    "Gender determination: inferred from first names; no gender field exists in the source data.",
    "Pay field: Rate_of_Pay interpreted as monthly salary (annualized ×12).",
    "Red shading = male earns more than Candace. Green shading = Candace earns more. Yellow = equal pay.",
]:
    story.append(Paragraph(f"• {note}", NOTE))

story.append(Spacer(1, 0.2*inch))
story.append(HRFlowable(width="100%", thickness=0.5, color=BORDER))
story.append(Paragraph("End of Report — Pay Disparity Analysis: Candace Metcalf, Illinois DHS", META))

doc.build(story)
print(f"PDF saved: {OUTPUT}")
