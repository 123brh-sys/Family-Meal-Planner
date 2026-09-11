import { collection, doc, onSnapshot, setDoc, type Unsubscribe } from 'firebase/firestore';

import { db } from '@/lib/firebase';
import type { Ingredient } from '@/types/models';
import { isDefaultPantryIngredient } from '@/utils/pantryDefaults';

const ingredientsCollection = () => collection(db, 'ingredients');

export function subscribeIngredients(onChange: (ingredients: Ingredient[]) => void): Unsubscribe {
  return onSnapshot(ingredientsCollection(), (snap) => {
    onChange(snap.docs.map((d) => d.data() as Ingredient));
  });
}

export async function createIngredient(
  name: string,
  defaultUnit: string,
  isPantryItem?: boolean
): Promise<Ingredient> {
  const ref = doc(ingredientsCollection());
  const trimmedName = name.trim();
  const ingredient: Ingredient = {
    id: ref.id,
    name: trimmedName,
    synonyms: [],
    defaultUnit,
    isPantryItem: isPantryItem ?? isDefaultPantryIngredient(trimmedName),
    category: null,
  };
  await setDoc(ref, ingredient);
  return ingredient;
}
