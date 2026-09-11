import { httpsCallable } from 'firebase/functions';

import { functions } from '@/lib/firebase';
import { createIngredient } from '@/lib/ingredients';
import type { Ingredient, MealIngredient, MealSourceType } from '@/types/models';
import { findFuzzyMatches } from '@/utils/fuzzyMatch';
import { localId } from '@/utils/id';

export interface ImportedIngredient {
  name: string;
  quantity: number;
  unit: string;
  displayNote: string | null;
}

export interface ImportedRecipe {
  ingredients: ImportedIngredient[];
  steps: string[];
  sourceType: MealSourceType;
  sourceName?: string | null;
}

export async function importRecipeByName(name: string, servings: number): Promise<ImportedRecipe> {
  const call = httpsCallable<{ name: string; servings: number }, ImportedRecipe>(
    functions,
    'importRecipeByName'
  );
  const result = await call({ name, servings });
  return result.data;
}

export async function importRecipeByUrl(url: string): Promise<ImportedRecipe> {
  const call = httpsCallable<{ url: string }, ImportedRecipe>(functions, 'importRecipeByUrl');
  const result = await call({ url });
  return result.data;
}

/**
 * Maps the AI's free-text ingredient names onto the canonical ingredient
 * list (auto-picking a strong fuzzy match, creating a new canonical
 * ingredient otherwise) so the imported draft can populate the same
 * ingredient rows a manually-entered meal uses — the user still reviews and
 * can re-pick any row before saving (§7).
 */
export async function resolveImportedIngredients(
  imported: ImportedIngredient[],
  existingIngredients: Ingredient[]
): Promise<MealIngredient[]> {
  const resolved: MealIngredient[] = [];
  for (const item of imported) {
    const [bestMatch] = findFuzzyMatches(item.name, existingIngredients, 0.85);
    const ingredient = bestMatch?.item ?? (await createIngredient(item.name, item.unit));
    resolved.push({
      id: localId(),
      ingredientRefId: ingredient.id,
      quantity: item.quantity,
      unit: item.unit,
      displayNote: item.displayNote,
    });
  }
  return resolved;
}
