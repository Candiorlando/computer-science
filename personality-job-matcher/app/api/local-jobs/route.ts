// CareerOneStop Job Search API — free, US Dept of Labor.
// Register at https://www.careeronestop.org/Developers/WebAPI/registration.aspx
// to get a userId and token, then set them in .env.local.
//
// This route is optional. If credentials aren't set, we return a graceful
// fallback that points the user at the public CareerOneStop search UI.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const keyword = url.searchParams.get("keyword") ?? "";
  const location = url.searchParams.get("location") ?? "";
  const radius = url.searchParams.get("radius") ?? "25";

  const userId = process.env.CAREERONESTOP_USER_ID;
  const token = process.env.CAREERONESTOP_TOKEN;

  // Always include the public-search fallback link so the frontend has somewhere to send users.
  const fallbackUrl = `https://www.careeronestop.org/Toolkit/Jobs/find-jobs-results.aspx?keyword=${encodeURIComponent(
    keyword,
  )}&location=${encodeURIComponent(location)}&radius=${radius}`;

  if (!userId || !token) {
    return Response.json({
      configured: false,
      fallbackUrl,
      message:
        "CareerOneStop API credentials not configured. Add CAREERONESTOP_USER_ID and CAREERONESTOP_TOKEN to .env.local to enable live in-app results. In the meantime, the search will open on the CareerOneStop website.",
    });
  }

  try {
    // CareerOneStop JobSearch endpoint — see https://api.careeronestop.org/JobSearchAPI
    const apiUrl = `https://api.careeronestop.org/v1/jobsearch/${encodeURIComponent(
      userId,
    )}/${encodeURIComponent(keyword)}/${encodeURIComponent(
      location,
    )}/${radius}/0/0/10/0/10`;

    const resp = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      // Cache for 5 minutes per (keyword,location)
      next: { revalidate: 300 },
    });

    if (!resp.ok) {
      return Response.json(
        { configured: true, error: `CareerOneStop returned ${resp.status}`, fallbackUrl },
        { status: 502 },
      );
    }

    const data = await resp.json();
    return Response.json({ configured: true, data, fallbackUrl });
  } catch (err) {
    return Response.json(
      {
        configured: true,
        error: err instanceof Error ? err.message : String(err),
        fallbackUrl,
      },
      { status: 502 },
    );
  }
}
