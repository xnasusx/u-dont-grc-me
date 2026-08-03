import type { Control, ControlStatus } from "./types";

export function formatCurrency(value: number) {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  return `$${Math.round(value / 1000)}K`;
}

export function statusClass(status: ControlStatus | "Pending" | "Active" | "Connected" | "Approved" | "Rejected" | "Healthy" | "Watching" | "Paused") {
  return status.toLowerCase().replace(/\s+/g, "-");
}

export function healthScore(control: Control) {
  const statusPenalty = control.status === "Implemented" ? 0 : control.status === "In Progress" ? 10 : control.status === "Degraded" ? 24 : 40;
  return Math.max(0, Math.round((control.frameworkCoverage + control.evidenceFreshness + control.fair.strength) / 3 - statusPenalty));
}

export function aggregateAle(controls: Control[]) {
  return controls.reduce(
    (acc, control) => {
      acc.p10 += control.fair.aleP10;
      acc.p50 += control.fair.aleP50;
      acc.p90 += control.fair.aleP90;
      return acc;
    },
    { p10: 0, p50: 0, p90: 0 },
  );
}

export function seededMonteCarlo(base: number, strength: number, volatility: number, annualFrequency = 0.45, lossMagnitudeReduction = 0) {
  const samples: number[] = [];
  let seed = Math.round(base / 1000 + strength * 17 + volatility * 31);
  const random = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  const trialCount = 10000;
  for (let i = 0; i < trialCount; i += 1) {
    const frequency = annualFrequency * (0.55 + random() * volatility);
    const magnitude = base * (0.55 + random() * 1.9) * (1 - lossMagnitudeReduction / 100);
    const controlEffect = Math.max(0.12, 1 - strength / 120);
    samples.push(frequency * magnitude * controlEffect);
  }

  samples.sort((a, b) => a - b);
  const max = samples.at(-1) ?? 1;
  const binCount = 12;
  const binCounts = Array.from({ length: binCount }, () => 0);
  for (const sample of samples) {
    const binIndex = Math.min(binCount - 1, Math.floor((sample / max) * binCount));
    binCounts[binIndex] += 1;
  }
  const histogram = binCounts.map((count, index) => {
    const lower = (max / binCount) * index;
    const upper = (max / binCount) * (index + 1);
    return { lower, upper, count, percentage: Math.round((count / samples.length) * 100) };
  });
  const exceedance = [0.1, 0.25, 0.5, 0.75, 0.9].map((probability) => ({
    probability,
    loss: samples[Math.floor(samples.length * (1 - probability))],
  }));
  const mean = samples.reduce((sum, sample) => sum + sample, 0) / samples.length;

  return {
    trials: trialCount,
    min: samples[0],
    q1: samples[Math.floor(samples.length * 0.25)],
    p10: samples[Math.floor(samples.length * 0.1)],
    p50: samples[Math.floor(samples.length * 0.5)],
    q3: samples[Math.floor(samples.length * 0.75)],
    p90: samples[Math.floor(samples.length * 0.9)],
    max,
    mean,
    histogram,
    exceedance,
  };
}
