export function Disclaimer({ kind = "general" }: { kind?: "general" | "coach" | "medical" | "legal" }) {
  const map = {
    general:
      "This tool offers informational guidance only. For decisions that materially affect your livelihood, education, or health, consult a qualified professional.",
    coach:
      "The AI coach offers general career information, not personalized counseling. It is not a licensed vocational rehabilitation counselor. Verify anything consequential with a human professional.",
    medical:
      "Disability, accommodation, and benefits questions involve medical and legal nuance. Use this information as a starting point only — confirm with your physician, a Job Accommodation Network (askjan.org) consultant, or your state's VR agency.",
    legal:
      "Hiring, accommodation, and benefits law varies by state and changes often. This is general educational information, not legal advice.",
  } as const;
  return (
    <div className="border-l-4 border-accent/60 bg-cream pl-4 py-3 text-sm text-ink/80 my-6 prose-narrow">
      <strong className="block text-ink mb-1">A note before you continue</strong>
      {map[kind]}
    </div>
  );
}
