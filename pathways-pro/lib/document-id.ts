// Helpers for printable / shareable document headers.
// Printable VR documents shouldn't carry the client's full last name on
// every page — counselors share these with employers, vendors, and
// training providers. We use "First L." initials and the case ID as the
// stable identifier instead.

export function nameWithInitial(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0];
  const first = parts[0];
  const lastInitial = parts[parts.length - 1][0]?.toUpperCase() ?? "";
  return lastInitial ? `${first} ${lastInitial}.` : first;
}

export function documentHeading(caseId: string, fullName: string): string {
  const display = nameWithInitial(fullName);
  return display ? `${caseId} · ${display}` : caseId;
}
