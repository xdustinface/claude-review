import { extractJSON } from './json';

describe('extractJSON', () => {
  it('returns clean JSON as-is', () => {
    const json = '{"key": "value"}';
    expect(extractJSON(json)).toBe(json);
  });

  it('strips markdown json fences', () => {
    const input = '```json\n{"key": "value"}\n```';
    expect(JSON.parse(extractJSON(input))).toEqual({ key: 'value' });
  });

  it('strips markdown fences without language tag', () => {
    const input = '```\n[1, 2, 3]\n```';
    expect(JSON.parse(extractJSON(input))).toEqual([1, 2, 3]);
  });

  it('extracts JSON object from surrounding text', () => {
    const input = 'Here is the result:\n\n{"verdict": "APPROVE", "findings": []}\n\nDone.';
    expect(JSON.parse(extractJSON(input))).toEqual({ verdict: 'APPROVE', findings: [] });
  });

  it('extracts JSON array from surrounding text', () => {
    const input = 'Found these issues:\n[{"title": "bug"}]\nEnd of review.';
    expect(JSON.parse(extractJSON(input))).toEqual([{ title: 'bug' }]);
  });

  it('prefers whichever JSON structure appears first in freeform text', () => {
    const input = 'Result: {"data": [1,2,3]}';
    const result = JSON.parse(extractJSON(input));
    expect(result).toEqual({ data: [1, 2, 3] });
  });

  it('prefers array when it appears before object', () => {
    const input = 'Found: [{"id": 1}] and also {"extra": true}';
    const result = JSON.parse(extractJSON(input));
    expect(result).toEqual([{ id: 1 }]);
  });

  it('returns original text when no JSON found', () => {
    const input = 'no json here';
    expect(extractJSON(input)).toBe('no json here');
  });

  it('handles whitespace around fences', () => {
    const input = '  ```json\n{"a": 1}\n```  ';
    expect(JSON.parse(extractJSON(input))).toEqual({ a: 1 });
  });
});
