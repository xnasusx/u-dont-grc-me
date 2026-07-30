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

export function seededMonteCarlo(base: number, strength: number, volatility: number) {
  const samples: number[] = [];
  let seed = Math.round(base / 1000 + strength * 17 + volatility * 31);
  const random = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  for (let i = 0; i < 5000; i += 1) {
    const frequency = 0.45 + random() * volatility;
    const magnitude = base * (0.55 + random() * 1.9);
    const controlEffect = Math.max(0.12, 1 - strength / 120);
    samples.push(frequency * magnitude * controlEffect);
  }

  samples.sort((a, b) => a - b);
  return {
    p10: samples[Math.floor(samples.length * 0.1)],
    p50: samples[Math.floor(samples.length * 0.5)],
    p90: samples[Math.floor(samples.length * 0.9)],
  };
}
