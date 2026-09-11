// Minimal metric conversion for shopping-list consolidation (§6, §8).
// US/UK display conversion is layered on top of this in a later stage —
// this module only decides which quantities can be safely summed together.

const MASS_TO_GRAMS: Record<string, number> = {
  g: 1,
  gram: 1,
  grams: 1,
  kg: 1000,
  kilogram: 1000,
  kilograms: 1000,
};

const VOLUME_TO_ML: Record<string, number> = {
  ml: 1,
  milliliter: 1,
  milliliters: 1,
  millilitre: 1,
  millilitres: 1,
  l: 1000,
  liter: 1000,
  liters: 1000,
  litre: 1000,
  litres: 1000,
};

function normalizeUnit(unit: string): string {
  return unit.trim().toLowerCase();
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Converts a quantity to a base unit within its convertible group (grams for
 * mass, ml for volume). Units outside those two tables (tsp, cloves, cup,
 * "unit", ...) aren't known to convert to anything, so they become their own
 * group keyed by the literal unit string — that only merges with an identical
 * unit, which is exactly the "don't guess" behavior §6 asks for.
 */
export function toBaseQuantity(quantity: number, unit: string): { group: string; base: number } {
  const normalized = normalizeUnit(unit);
  if (normalized in MASS_TO_GRAMS) {
    return { group: 'mass', base: quantity * MASS_TO_GRAMS[normalized] };
  }
  if (normalized in VOLUME_TO_ML) {
    return { group: 'volume', base: quantity * VOLUME_TO_ML[normalized] };
  }
  return { group: `unit:${normalized}`, base: quantity };
}

/** Inverse of `toBaseQuantity`, picking a sensible display unit for the total. */
export function fromBaseQuantity(base: number, group: string): { quantity: number; unit: string } {
  if (group === 'mass') {
    return base >= 1000 ? { quantity: round(base / 1000), unit: 'kg' } : { quantity: round(base), unit: 'g' };
  }
  if (group === 'volume') {
    return base >= 1000 ? { quantity: round(base / 1000), unit: 'l' } : { quantity: round(base), unit: 'ml' };
  }
  return { quantity: round(base), unit: group.replace(/^unit:/, '') };
}
