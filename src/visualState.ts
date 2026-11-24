export const portfolioFlag = "FLAG{follow_the_evidence}";
export const heroFlag = "flag{you_found_me_lets_talk}";

export function constrainNode(x: number, y: number) {
  return { x: Math.max(20, Math.min(80, x)), y: Math.max(16, Math.min(88, y)) };
}

export function acceptsFlag(value: string) {
  return value.trim() === portfolioFlag || value.trim() === heroFlag;
}
