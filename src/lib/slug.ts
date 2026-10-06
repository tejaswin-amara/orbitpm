export function uniqueSlug(value: string, suffix: string): string {
  const base = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50) || "project";
  return `${base}-${suffix.slice(0, 8)}`;
}
