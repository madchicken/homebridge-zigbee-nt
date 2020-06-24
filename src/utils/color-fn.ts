export function normalizeBrightness(value: number): number {
  return Math.round((value / 255) * 100);
}
