const referenceShape = [0.72, 0.89, 1.03, 0.81, 1.16, 0.94, 0.76, 1.08, 0.87, 1.12, 0.96, 1.05];

export type MlPatternInput = { averageAmount: number; transactionCount: number; currentAmount: number };

export function buildMlPattern({ averageAmount, transactionCount, currentAmount }: MlPatternInput) {
  const pointCount = Math.min(12, Math.max(5, transactionCount));
  const history = referenceShape.slice(0, pointCount).map(ratio => Math.round(averageAmount * ratio));
  const lower = Math.round(averageAmount * 0.38);
  const upper = Math.round(averageAmount * 1.85);
  const max = Math.max(upper * 1.18, currentAmount * 1.12);
  const min = Math.max(0, Math.min(lower * 0.55, currentAmount * 0.82));
  const isOutside = currentAmount < lower || currentAmount > upper;
  return { history, lower, upper, max, min, isOutside, deviationRatio: currentAmount / averageAmount, currentAmount };
}

export function valueToY(value: number, min: number, max: number, height = 126, top = 18) {
  return top + (1 - (value - min) / Math.max(1, max - min)) * height;
}
