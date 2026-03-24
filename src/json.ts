/**
 * Extract a JSON object or array from LLM response text that may contain
 * markdown fences, preamble, or other non-JSON content.
 */
export function extractJSON(text: string): string {
  let cleaned = text.trim();

  // Strip markdown fences
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?\s*```\s*$/, '');
  }

  // If the cleaned text already parses, return it directly
  try {
    JSON.parse(cleaned);
    return cleaned;
  } catch {
    // Continue to pattern matching
  }

  // Try to find a JSON object or array in the text, preferring whichever appears first
  const objectMatch = cleaned.match(/\{[\s\S]*\}/);
  const arrayMatch = cleaned.match(/\[[\s\S]*\]/);

  if (objectMatch && arrayMatch) {
    const objectIdx = cleaned.indexOf(objectMatch[0]);
    const arrayIdx = cleaned.indexOf(arrayMatch[0]);
    return arrayIdx <= objectIdx ? arrayMatch[0] : objectMatch[0];
  }
  if (objectMatch) return objectMatch[0];
  if (arrayMatch) return arrayMatch[0];

  return cleaned;
}
