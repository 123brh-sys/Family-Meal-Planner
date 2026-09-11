import convert from 'convert-units';

import type { UnitSystem } from '@/types/models';

// Quantities are always stored in metric (§8) — this only converts for
// *display* when the viewer prefers US units. `convert-units` (recommended
// by the spec) handles the metric<->imperial math; we just pick a sensible
// display unit (oz vs lb, fl-oz vs cup) once we know the target is imperial.

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

export function toDisplayQuantity(
  quantity: number,
  unit: string,
  system: UnitSystem
): { quantity: number; unit: string } {
  if (system === 'metric') return { quantity, unit };

  const normalized = unit.trim().toLowerCase();

  if (normalized === 'g' || normalized === 'kg') {
    const ounces = convert(quantity).from(normalized).to('oz');
    if (ounces >= 16) {
      return { quantity: round(convert(quantity).from(normalized).to('lb')), unit: 'lb' };
    }
    return { quantity: round(ounces), unit: 'oz' };
  }

  if (normalized === 'ml' || normalized === 'l') {
    const flOz = convert(quantity).from(normalized).to('fl-oz');
    if (flOz >= 8) {
      return { quantity: round(convert(quantity).from(normalized).to('cup')), unit: 'cup' };
    }
    return { quantity: round(flOz), unit: 'fl-oz' };
  }

  // Anything else (cloves, "unit", tsp, ...) isn't a metric/US pair — show as-is.
  return { quantity, unit };
}
