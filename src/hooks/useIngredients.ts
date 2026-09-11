import { useEffect, useState } from 'react';

import { subscribeIngredients } from '@/lib/ingredients';
import type { Ingredient } from '@/types/models';

export function useIngredients() {
  const [ingredients, setIngredients] = useState<Ingredient[] | null>(null);

  useEffect(() => subscribeIngredients(setIngredients), []);

  return ingredients;
}
