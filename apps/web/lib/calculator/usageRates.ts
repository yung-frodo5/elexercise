import type { UsageRate } from "./types";

// Yearly workout count = weekly count * 52 (sporadic=1x, regular=3x,
// committed=5x, shared=15x, public=75x per week).
export const YEARLY_WORKOUTS: Record<UsageRate, number> = {
  sporadic: 52,
  regular: 156,
  committed: 260,
  shared: 780,
  public: 3900,
};

export const USAGE_RATE_OPTIONS: { value: UsageRate; label: string }[] = [
  { value: "sporadic", label: "Sporadic (1x per week)" },
  { value: "regular", label: "Regular (3x per week)" },
  { value: "committed", label: "Committed (5x per week)" },
  { value: "shared", label: "Shared (15x per week)" },
  { value: "public", label: "Public (75x per week)" },
];
