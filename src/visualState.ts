export const portfolioFlag = "FLAG{follow_the_evidence}";

export function constrainNode(x: number, y: number) {
  return { x: Math.max(20, Math.min(80, x)), y: Math.max(16, Math.min(88, y)) };
}

export function acceptsFlag(value: string) {
  return value.trim() === portfolioFlag;
}
