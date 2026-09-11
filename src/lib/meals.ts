import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
  type Unsubscribe,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';
import type { Meal, MealIngredient, MealSourceType } from '@/types/models';

const mealsCollection = (familyId: string) => collection(db, 'families', familyId, 'meals');

export function subscribeMeals(familyId: string, onChange: (meals: Meal[]) => void): Unsubscribe {
  return onSnapshot(mealsCollection(familyId), (snap) => {
    const meals = snap.docs.map((d) => d.data() as Meal);
    meals.sort((a, b) => a.name.localeCompare(b.name));
    onChange(meals);
  });
}

export async function getMeal(familyId: string, mealId: string): Promise<Meal | null> {
  const snap = await getDoc(doc(mealsCollection(familyId), mealId));
  return snap.exists() ? (snap.data() as Meal) : null;
}

export interface MealInput {
  name: string;
  ingredients: MealIngredient[];
  likedBy: string[];
  instructionsUrl: string | null;
  instructions: string[] | null;
  sourceType: MealSourceType;
  servings: number;
}

export async function createMeal(familyId: string, input: MealInput): Promise<string> {
  const ref = doc(mealsCollection(familyId));
  const now = Date.now();
  const meal: Meal = {
    id: ref.id,
    familyId,
    name: input.name.trim(),
    likedBy: input.likedBy,
    ingredients: input.ingredients,
    instructionsUrl: input.instructionsUrl,
    instructions: input.instructions,
    sourceType: input.sourceType,
    photoUrl: null,
    servings: input.servings,
    lastCookedAt: null,
    createdAt: now,
    updatedAt: now,
  };
  await setDoc(ref, meal);
  return ref.id;
}

export async function updateMeal(
  familyId: string,
  mealId: string,
  input: MealInput
): Promise<void> {
  await updateDoc(doc(mealsCollection(familyId), mealId), {
    name: input.name.trim(),
    ingredients: input.ingredients,
    likedBy: input.likedBy,
    instructionsUrl: input.instructionsUrl,
    instructions: input.instructions,
    sourceType: input.sourceType,
    servings: input.servings,
    updatedAt: Date.now(),
  });
}

export async function deleteMeal(familyId: string, mealId: string): Promise<void> {
  await deleteDoc(doc(mealsCollection(familyId), mealId));
}

export async function markMealCooked(familyId: string, mealId: string): Promise<void> {
  await updateDoc(doc(mealsCollection(familyId), mealId), { lastCookedAt: Date.now() });
}
