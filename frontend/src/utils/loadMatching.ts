const PASS_THROUGH_PATTERN = /\s*\(pass through\)/gi;
const MULTISPACE_PATTERN = /\s+/g;

/**
 * Produces a normalized, lowercase representation of a load label so we can
 * safely compare entries that only differ by whitespace or "(PASS THROUGH)".
 */
export function normalizeLoadLabel(label: string): string {
  if (!label) return "";
  return label
    .toLowerCase()
    .replace(PASS_THROUGH_PATTERN, "")
    .replace(/[–—]/g, "-")
    .replace(/\s*-\s*/g, "-")
    .replace(/\s*·\s*/g, " ")
    .replace(MULTISPACE_PATTERN, " ")
    .trim();
}

/**
 * Returns true when two normalized load labels clearly refer to the same
 * transport technology (DWDM coherent spans, Galactus EP/DP, etc).
 * Both parameters should already be normalized via `normalizeLoadLabel`.
 */
export function hasSharedLoadTechnology(
  normalizedA: string,
  normalizedB: string
): boolean {
  if (!normalizedA || !normalizedB) return false;
  return normalizedA === normalizedB;
}
