import { mergeMealIngredients } from '@/lib/shoppingListMerge';
import type { Meal, MealIngredient } from '@/types/models';

function ingredient(overrides: Partial<MealIngredient>): MealIngredient {
  return {
    id: overrides.id ?? Math.random().toString(36),
    ingredientRefId: 'chicken-breast',
    quantity: 1,
    unit: 'g',
    displayNote: null,
    ...overrides,
  };
}

function meal(id: string, ingredients: MealIngredient[]): Meal {
  return {
    id,
    familyId: 'family-1',
    name: `Meal ${id}`,
    likedBy: [],
    ingredients,
    instructionsUrl: null,
    sourceType: 'manual',
    photoUrl: null,
    servings: 4,
    lastCookedAt: null,
    createdAt: 0,
    updatedAt: 0,
  };
}

describe('mergeMealIngredients', () => {
  it('sums the same ingredient and unit across meals', () => {
    const meals = [
      meal('m1', [ingredient({ quantity: 500, unit: 'g' })]),
      meal('m2', [ingredient({ quantity: 500, unit: 'g' })]),
    ];

    const result = mergeMealIngredients(meals);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ ingredientRefId: 'chicken-breast', quantity: 1, unit: 'kg' });
    expect(result[0].fromMealIds.sort()).toEqual(['m1', 'm2']);
  });

  it('converts compatible-but-different units before summing (500g + 0.5kg -> 1kg)', () => {
    const meals = [
      meal('m1', [ingredient({ quantity: 500, unit: 'g' })]),
      meal('m2', [ingredient({ quantity: 0.5, unit: 'kg' })]),
    ];

    const result = mergeMealIngredients(meals);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ quantity: 1, unit: 'kg' });
  });

  it('keeps incompatible units as separate lines instead of guessing', () => {
    const meals = [
      meal('m1', [ingredient({ ingredientRefId: 'garlic', quantity: 2, unit: 'cloves' })]),
      meal('m2', [ingredient({ ingredientRefId: 'garlic', quantity: 1, unit: 'tsp' })]),
    ];

    const result = mergeMealIngredients(meals);

    expect(result).toHaveLength(2);
    const units = result.map((r) => r.unit).sort();
    expect(units).toEqual(['cloves', 'tsp']);
  });

  it('sums same-unit-but-not-metric quantities together (e.g. cloves)', () => {
    const meals = [
      meal('m1', [ingredient({ ingredientRefId: 'garlic', quantity: 2, unit: 'cloves' })]),
      meal('m2', [ingredient({ ingredientRefId: 'garlic', quantity: 3, unit: 'cloves' })]),
    ];

    const result = mergeMealIngredients(meals);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ quantity: 5, unit: 'cloves' });
  });

  it('keeps different ingredients as separate lines', () => {
    const meals = [
      meal('m1', [ingredient({ ingredientRefId: 'chicken-breast', quantity: 500, unit: 'g' })]),
      meal('m2', [ingredient({ ingredientRefId: 'broccoli', quantity: 500, unit: 'g' })]),
    ];

    const result = mergeMealIngredients(meals);

    expect(result).toHaveLength(2);
  });

  it('sums volume units through a common base (ml/l)', () => {
    const meals = [
      meal('m1', [ingredient({ ingredientRefId: 'milk', quantity: 250, unit: 'ml' })]),
      meal('m2', [ingredient({ ingredientRefId: 'milk', quantity: 0.25, unit: 'l' })]),
    ];

    const result = mergeMealIngredients(meals);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ quantity: 500, unit: 'ml' });
  });
});
