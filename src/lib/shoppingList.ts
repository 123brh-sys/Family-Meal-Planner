import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';
import { mergeMealIngredients } from '@/lib/shoppingListMerge';
import type { Meal, ShoppingListItem } from '@/types/models';

const shoppingListCollection = (familyId: string) =>
  collection(db, 'families', familyId, 'shoppingListItems');

export function subscribeShoppingList(
  familyId: string,
  onChange: (items: ShoppingListItem[]) => void
): Unsubscribe {
  return onSnapshot(shoppingListCollection(familyId), (snap) => {
    onChange(snap.docs.map((d) => d.data() as ShoppingListItem));
  });
}

/**
 * Recomputes the merged lines from the given (already-selected) meals and
 * reconciles them against the existing shopping list: matching lines keep
 * their doc id, `checked` state and manual overrides; lines no longer needed
 * are removed; new lines are added. Manually-added items are left untouched.
 */
export async function syncShoppingListWithMeals(familyId: string, meals: Meal[]): Promise<void> {
  const merged = mergeMealIngredients(meals);

  const generatedQuery = query(
    shoppingListCollection(familyId),
    where('addedManually', '==', false)
  );
  const existingSnap = await getDocs(generatedQuery);
  const existingByKey = new Map(
    existingSnap.docs.map((d) => {
      const data = d.data() as ShoppingListItem;
      return [`${data.ingredientRefId}::${data.unit}`, { id: d.id, data }];
    })
  );

  const batch = writeBatch(db);
  const seenKeys = new Set<string>();

  for (const line of merged) {
    const key = `${line.ingredientRefId}::${line.unit}`;
    seenKeys.add(key);
    const existing = existingByKey.get(key);
    if (existing) {
      const unchanged =
        existing.data.quantity === line.quantity &&
        existing.data.fromMealIds.length === line.fromMealIds.length &&
        existing.data.fromMealIds.every((id) => line.fromMealIds.includes(id));
      if (!unchanged) {
        batch.update(doc(shoppingListCollection(familyId), existing.id), {
          quantity: line.quantity,
          fromMealIds: line.fromMealIds,
        });
      }
    } else {
      const ref = doc(shoppingListCollection(familyId));
      const item: ShoppingListItem = {
        id: ref.id,
        familyId,
        ingredientRefId: line.ingredientRefId,
        quantity: line.quantity,
        unit: line.unit,
        checked: false,
        addedManually: false,
        fromMealIds: line.fromMealIds,
      };
      batch.set(ref, item);
    }
  }

  for (const [key, existing] of existingByKey) {
    if (!seenKeys.has(key)) {
      batch.delete(doc(shoppingListCollection(familyId), existing.id));
    }
  }

  await batch.commit();
}

export async function setItemChecked(
  familyId: string,
  itemId: string,
  checked: boolean
): Promise<void> {
  await updateDoc(doc(shoppingListCollection(familyId), itemId), { checked });
}

export async function addManualItem(
  familyId: string,
  ingredientRefId: string,
  quantity: number,
  unit: string
): Promise<void> {
  const ref = doc(shoppingListCollection(familyId));
  const item: ShoppingListItem = {
    id: ref.id,
    familyId,
    ingredientRefId,
    quantity,
    unit,
    checked: false,
    addedManually: true,
    fromMealIds: [],
  };
  await setDoc(ref, item);
}

export async function removeItem(familyId: string, itemId: string): Promise<void> {
  await deleteDoc(doc(shoppingListCollection(familyId), itemId));
}
