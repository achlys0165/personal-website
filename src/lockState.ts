export const heroLockFlag = "flag{you_found_me_lets_talk}";

export function unlockProgress(
  current: number,
  unlocked: boolean,
  delta: number,
  instant = false,
) {
  const target = unlocked ? 1 : 0;
  if (instant) return target;
  return (
    current +
    (target - current) * (1 - Math.exp(-8 * Math.max(0, Math.min(0.06, delta))))
  );
}

export function clampLockTilt(value: number) {
  return Math.max(-0.35, Math.min(0.35, value));
}
