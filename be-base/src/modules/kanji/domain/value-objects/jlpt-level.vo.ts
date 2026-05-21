export type JlptLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

export const JLPT_LEVELS: readonly JlptLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1'] as const;

export function isJlptLevel(value: unknown): value is JlptLevel {
  return (
    typeof value === 'string' && (JLPT_LEVELS as readonly string[]).includes(value)
  );
}
