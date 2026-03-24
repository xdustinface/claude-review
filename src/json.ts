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

  // Try parsing directly first
  try {
    JSON.parse(cleaned);
    return cleaned;
  } catch {
    // Not valid JSON as-is, try to extract
  }

  // Find the first { or [ and its matching closing bracket
  const objStart = cleaned.indexOf('{');
  const arrStart = cleaned.indexOf('[');

  let start: number;
  let openChar: string;
  let closeChar: string;

  if (objStart === -1 && arrStart === -1) return cleaned;
  if (objStart === -1) { start = arrStart; openChar = '['; closeChar = ']'; }
  else if (arrStart === -1) { start = objStart; openChar = '{'; closeChar = '}'; }
  else if (objStart < arrStart) { start = objStart; openChar = '{'; closeChar = '}'; }
  else { start = arrStart; openChar = '['; closeChar = ']'; }

  // Find matching close bracket by counting nesting
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < cleaned.length; i++) {
    const ch = cleaned[i];

    if (escaped) { escaped = false; continue; }
    if (ch === '\\' && inString) { escaped = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;

    if (ch === openChar) depth++;
    if (ch === closeChar) depth--;

    if (depth === 0) {
      return cleaned.slice(start, i + 1);
    }
  }

  return cleaned;
}
