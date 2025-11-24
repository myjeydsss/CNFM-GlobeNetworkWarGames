const LOAD_TECH_KEYWORDS = [
  "DWDM COHERENT MAIN",
  "DWDM COHERENT SPAN",
  "DWDM COHERENT",
  "DWDM LAYER 1 MAIN",
  "DWDM LAYER 1 SPAN",
  "DWDM LAYER 1",
  "DWDM LAYER 2 MAIN",
  "DWDM LAYER 2 SPAN",
  "DWDM LAYER 2",
  "DWDM MAIN",
  "DWDM SPAN",
  "COHERENT MAIN",
  "COHERENT SPAN",
  "GALACTUS EP",
  "GALACTUS DP",
  "DODRIO/NOKIA",
  "DODRIO",
  "NOKIA EP",
  "NOKIA DP",
] as const;

const KEYWORD_MATCHERS = LOAD_TECH_KEYWORDS.map((token) =>
  token.toLowerCase()
);

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
  return KEYWORD_MATCHERS.some(
    (token) =>
      normalizedA.includes(token) && normalizedB.includes(token)
  );
}
