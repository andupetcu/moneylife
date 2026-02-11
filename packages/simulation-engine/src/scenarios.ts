// packages/simulation-engine/src/scenarios.ts
// Scenario generator — uses deterministic RNG seed

/**
 * Deterministic pseudo-random number generator (Mulberry32).
 * Given a seed, produces the same sequence every time.
 */
export function createRng(seed: string): () => number {
  let h = hashString(seed);
  return (): number => {
    h |= 0;
    h = (h + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Hash a string to a 32-bit integer.
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash + chr) | 0;
  }
  return hash;
}

/**
 * Generate a random integer in [min, max] using the RNG.
 */
export function randomInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

/**
 * Generate a random float in [min, max) using the RNG.
 */
export function randomFloat(rng: () => number, min: number, max: number): number {
  return rng() * (max - min) + min;
}

/**
 * Pick a random element from an array.
 */
export function randomPick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

/**
 * Weighted random selection from an array of items with weights.
 */
export function weightedRandomPick<T>(
  rng: () => number,
  items: T[],
  weights: number[],
): T {
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let r = rng() * totalWeight;

  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) {
      return items[i];
    }
  }

  return items[items.length - 1];
}

/**
 * Weighted random sample (without replacement).
 */
export function weightedRandomSample<T>(
  rng: () => number,
  items: T[],
  weights: number[],
  count: number,
): T[] {
  if (count >= items.length) return [...items];

  const remaining = [...items];
  const remainingWeights = [...weights];
  const result: T[] = [];

  for (let i = 0; i < count; i++) {
    const totalWeight = remainingWeights.reduce((a, b) => a + b, 0);
    let r = rng() * totalWeight;

    for (let j = 0; j < remaining.length; j++) {
      r -= remainingWeights[j];
      if (r <= 0) {
        result.push(remaining[j]);
        remaining.splice(j, 1);
        remainingWeights.splice(j, 1);
        break;
      }
    }
  }

  return result;
}

/**
 * Generate a value from an approximate normal distribution using Box-Muller.
 * Clamped to [min, max].
 */
export function normalDistribution(
  rng: () => number,
  mean: number,
  stddev: number,
  min: number,
  max: number,
): number {
  let u1 = rng();
  let u2 = rng();
  // Avoid log(0)
  if (u1 === 0) u1 = 0.0001;
  if (u2 === 0) u2 = 0.0001;

  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  const value = mean + z * stddev;
  return Math.max(min, Math.min(max, value));
}

export interface ScenarioFilter {
  persona: string;
  level: number;
  recentCardIds: string[];
  recentCategories: Map<string, number>; // category -> days since last seen
}

export interface ScenarioEntry {
  id: string;
  category: string;
  personaTags: string[];
  levelRange: [number, number];
  frequencyWeight: number;
}

/**
 * Filter and select daily scenarios from the catalog.
 */
export function selectDailyScenarios(
  rng: () => number,
  allScenarios: ScenarioEntry[],
  filter: ScenarioFilter,
  numCards: number,
): ScenarioEntry[] {
  // Filter eligible
  const eligible = allScenarios.filter((s) => {
    if (!s.personaTags.includes(filter.persona)) return false;
    if (filter.level < s.levelRange[0] || filter.level > s.levelRange[1]) return false;
    if (filter.recentCardIds.includes(s.id)) return false;
    return true;
  });

  if (eligible.length === 0) return [];

  // Compute weights
  const weights = eligible.map((s) => {
    let weight = s.frequencyWeight;

    const daysSince = filter.recentCategories.get(s.category) ?? 999;
    if (daysSince > 14) weight *= 2.0;
    else if (daysSince > 7) weight *= 1.5;

    return weight;
  });

  return weightedRandomSample(rng, eligible, weights, Math.min(numCards, eligible.length));
}
