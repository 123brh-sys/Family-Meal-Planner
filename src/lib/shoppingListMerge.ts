import type { Meal } from '@/types/models';
import { fromBaseQuantity, toBaseQuantity } from '@/utils/units';

export interface MergedLine {
  ingredientRefId: string;
  quantity: number;
  unit: string;
  fromMealIds: string[];
}

/**
 * Consolidates the ingredients of a set of selected meals into shopping-list
 * lines: same ingredient + compatible unit gets summed (converting through a
 * common base unit first, e.g. 500g + 0.5kg -> 1kg), while ingredients in
 * incompatible units (2 cloves vs 1 tsp) are kept as separate lines rather
 * than guessed at (§6). Pure and side-effect free so it's testable with
 * sample data on its own, per the build order in the spec.
 */
export function mergeMealIngredients(meals: Meal[]): MergedLine[] {
  interface Group {
    ingredientRefId: string;
    group: string;
    base: number;
    fromMealIds: Set<string>;
  }
  const groups = new Map<string, Group>();

  for (const meal of meals) {
    for (const ingredient of meal.ingredients) {
      const { group, base } = toBaseQuantity(ingredient.quantity, ingredient.unit);
      const key = `${ingredient.ingredientRefId}::${group}`;
      const existing = groups.get(key);
      if (existing) {
        existing.base += base;
        existing.fromMealIds.add(meal.id);
      } else {
        groups.set(key, {
          ingredientRefId: ingredient.ingredientRefId,
          group,
          base,
          fromMealIds: new Set([meal.id]),
        });
      }
    }
  }

  return Array.from(groups.values()).map((g) => {
    const { quantity, unit } = fromBaseQuantity(g.base, g.group);
    return {
      ingredientRefId: g.ingredientRefId,
      quantity,
      unit,
      fromMealIds: Array.from(g.fromMealIds),
    };
  });
}
