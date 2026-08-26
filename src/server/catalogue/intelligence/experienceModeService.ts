export type ExperienceMode =
  "BEST_VALUE" | "LOWEST_COST" | "PREMIUM" | "FASTEST" | "LOCAL_FIRST";

export interface ExperienceSignals {
  priceScore: number;
  qualityScore: number;
  confidenceScore: number;
  availabilityScore: number;
  localityScore: number;
  speedScore: number;
}

export interface ExperienceModeWeights {
  price: number;
  quality: number;
  confidence: number;
  availability: number;
  locality: number;
  speed: number;
}

const MODES: Record<ExperienceMode, ExperienceModeWeights> = {
  BEST_VALUE: {
    price: 0.3,
    quality: 0.2,
    confidence: 0.2,
    availability: 0.15,
    locality: 0.05,
    speed: 0.1,
  },
  LOWEST_COST: {
    price: 0.7,
    quality: 0.05,
    confidence: 0.1,
    availability: 0.1,
    locality: 0.02,
    speed: 0.03,
  },
  PREMIUM: {
    price: 0.05,
    quality: 0.55,
    confidence: 0.2,
    availability: 0.08,
    locality: 0.02,
    speed: 0.1,
  },
  FASTEST: {
    price: 0.05,
    quality: 0.1,
    confidence: 0.15,
    availability: 0.25,
    locality: 0.05,
    speed: 0.4,
  },
  LOCAL_FIRST: {
    price: 0.15,
    quality: 0.15,
    confidence: 0.2,
    availability: 0.15,
    locality: 0.3,
    speed: 0.05,
  },
};

function assertUnitInterval(value: number, name: string): void {
  if (!Number.isFinite(value) || value < 0 || value > 1)
    throw new Error(`${name} must be between 0 and 1`);
}

export function getExperienceModeWeights(
  mode: ExperienceMode,
): ExperienceModeWeights {
  return MODES[mode];
}

export function scoreExperienceMode(
  mode: ExperienceMode,
  signals: ExperienceSignals,
): number {
  for (const [name, value] of Object.entries(signals))
    assertUnitInterval(value, name);
  const weights = getExperienceModeWeights(mode);
  return (
    signals.priceScore * weights.price +
    signals.qualityScore * weights.quality +
    signals.confidenceScore * weights.confidence +
    signals.availabilityScore * weights.availability +
    signals.localityScore * weights.locality +
    signals.speedScore * weights.speed
  );
}

export function rankExperienceOptions<T>(
  mode: ExperienceMode,
  options: readonly { option: T; signals: ExperienceSignals }[],
): { option: T; score: number }[] {
  return options
    .map(({ option, signals }) => ({
      option,
      score: scoreExperienceMode(mode, signals),
    }))
    .sort((a, b) => b.score - a.score);
}
