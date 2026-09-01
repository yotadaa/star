export const NIGHT_FIREFLY_PROBABILITY = 1 / 6;

export function selectNightEntity(roll) {
  return roll < NIGHT_FIREFLY_PROBABILITY ? "firefly" : "bat";
}

export function selectFireflyClusterSize(roll) {
  return roll < 0.5 ? 2 : 3;
}
