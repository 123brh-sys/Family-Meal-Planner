// Data model — mirrors §3 of the app spec.
// Firestore document shapes. Timestamps are stored as Firestore Timestamps
// but typed as `number` (millis since epoch) at the app boundary for convenience.

export type UnitSystem = 'metric' | 'us';
export type Theme = 'light' | 'dark' | 'system';
export type MealSourceType = 'manual' | 'ai-generated' | 'imported-url';

export interface Family {
  id: string;
  name: string;
  memberIds: string[]; // Firebase Auth uids of parents with login access
  inviteCode: string;
  createdAt: number;
}

export interface FamilyMember {
  id: string;
  familyId: string;
  name: string;
  isPantryManager: boolean;
  isArchived: boolean;
  allergies: string[]; // free-text flags, e.g. "peanuts" — "can't eat", distinct from likedBy
  createdAt: number;
}

export interface MealIngredient {
  id: string;
  ingredientRefId: string;
  quantity: number;
  unit: string; // canonical unit, e.g. "g", "ml", "unit"
  displayNote: string | null; // e.g. "large", "ripe" — shown, not parsed
}

export interface Meal {
  id: string;
  familyId: string;
  name: string;
  likedBy: string[]; // FamilyMember ids
  ingredients: MealIngredient[];
  instructionsUrl: string | null;
  instructions: string[] | null; // short generic AI-generated steps (§7) — never scraped/copied text
  sourceType: MealSourceType;
  photoUrl: string | null;
  servings: number; // base serving count ingredients are written for (§5 portion scaling)
  lastCookedAt: number | null;
  createdAt: number;
  updatedAt: number;
}

export interface Ingredient {
  id: string;
  name: string; // canonical name, e.g. "chicken breast"
  synonyms: string[];
  defaultUnit: string;
  isPantryItem: boolean;
  category: string | null; // aisle/category, e.g. "produce" — used for shopping list grouping
}

export interface ShoppingListItem {
  id: string;
  familyId: string;
  ingredientRefId: string;
  quantity: number;
  unit: string;
  checked: boolean;
  addedManually: boolean;
  fromMealIds: string[];
  outOfPantryOverride?: boolean; // "I'm out of this" promotion of a pantry item, this trip only
}

export interface UserSettings {
  userId: string;
  familyId: string | null;
  unitSystem: UnitSystem;
  theme: Theme;
}
