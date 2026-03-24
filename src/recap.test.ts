import { Finding } from './types';
import { deduplicateFindings, buildRecapSummary, PreviousFinding } from './recap';

const makeFinding = (overrides: Partial<Finding> = {}): Finding => ({
  severity: 'suggestion',
  title: 'Test finding',
  file: 'src/index.ts',
  line: 10,
  description: 'A test finding',
  reviewers: ['TestReviewer'],
  ...overrides,
});

const makePrevious = (overrides: Partial<PreviousFinding> = {}): PreviousFinding => ({
  title: 'Test finding',
  file: 'src/index.ts',
  line: 10,
  severity: 'suggestion',
  status: 'open',
  ...overrides,
});

describe('deduplicateFindings', () => {
  it('detects exact match by title, file, and line', () => {
    const findings = [makeFinding({ title: 'Missing null check', file: 'src/foo.ts', line: 42 })];
    const previous = [makePrevious({ title: 'Missing null check', file: 'src/foo.ts', line: 42 })];

    const result = deduplicateFindings(findings, previous);
    expect(result.unique).toHaveLength(0);
    expect(result.duplicates).toHaveLength(1);
  });

  it('detects fuzzy line match within +/-5 lines', () => {
    const findings = [makeFinding({ title: 'Missing null check', file: 'src/foo.ts', line: 45 })];
    const previous = [makePrevious({ title: 'Missing null check', file: 'src/foo.ts', line: 42 })];

    const result = deduplicateFindings(findings, previous);
    expect(result.unique).toHaveLength(0);
    expect(result.duplicates).toHaveLength(1);
  });

  it('does not match different file with same title', () => {
    const findings = [makeFinding({ title: 'Missing null check', file: 'src/bar.ts', line: 42 })];
    const previous = [makePrevious({ title: 'Missing null check', file: 'src/foo.ts', line: 42 })];

    const result = deduplicateFindings(findings, previous);
    expect(result.unique).toHaveLength(1);
    expect(result.duplicates).toHaveLength(0);
  });

  it('does not match different title with same file and line', () => {
    const findings = [makeFinding({ title: 'Unused variable', file: 'src/foo.ts', line: 42 })];
    const previous = [makePrevious({ title: 'Missing null check', file: 'src/foo.ts', line: 42 })];

    const result = deduplicateFindings(findings, previous);
    expect(result.unique).toHaveLength(1);
    expect(result.duplicates).toHaveLength(0);
  });

  it('returns all findings as unique when previous is empty', () => {
    const findings = [
      makeFinding({ title: 'A' }),
      makeFinding({ title: 'B' }),
    ];

    const result = deduplicateFindings(findings, []);
    expect(result.unique).toHaveLength(2);
    expect(result.duplicates).toHaveLength(0);
  });

  it('matches by title substring', () => {
    const findings = [makeFinding({ title: 'Missing null check in processBlock', file: 'src/foo.ts', line: 42 })];
    const previous = [makePrevious({ title: 'Missing null check', file: 'src/foo.ts', line: 42 })];

    const result = deduplicateFindings(findings, previous);
    expect(result.unique).toHaveLength(0);
    expect(result.duplicates).toHaveLength(1);
  });
});

describe('buildRecapSummary', () => {
  it('includes all stats when present', () => {
    const summary = buildRecapSummary(3, 2, 1, 4);
    expect(summary).toBe('Findings: 3 new, 4 previously flagged, 1 resolved, 2 skipped (already flagged)');
  });

  it('shows only new findings when others are zero', () => {
    const summary = buildRecapSummary(5, 0, 0, 0);
    expect(summary).toBe('Findings: 5 new');
  });

  it('returns "No findings" when all counts are zero', () => {
    const summary = buildRecapSummary(0, 0, 0, 0);
    expect(summary).toBe('No findings');
  });
});
