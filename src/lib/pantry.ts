import { collection, doc, updateDoc } from 'firebase/firestore';

import { db } from '@/lib/firebase';

export async function setIngredientPantryFlag(
  ingredientId: string,
  isPantryItem: boolean
): Promise<void> {
  await updateDoc(doc(collection(db, 'ingredients'), ingredientId), { isPantryItem });
}
