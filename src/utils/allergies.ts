import type { FamilyMember, Ingredient, Meal } from '@/types/models';

export interface AllergyConflict {
  member: FamilyMember;
  allergen: string;
  ingredientName: string;
}

/**
 * Allergies are a "can't eat" constraint, separate from likedBy's "doesn't
 * like" (§5) — this flags meals containing an ingredient that matches one of
 * a present member's allergies, so the picker can warn instead of staying
 * silent about it.
 */
export function findAllergyConflicts(
  meal: Meal,
  members: FamilyMember[],
  ingredientById: Map<string, Ingredient>
): AllergyConflict[] {
  const conflicts: AllergyConflict[] = [];
  for (const member of members) {
    for (const allergen of member.allergies) {
      const needle = allergen.trim().toLowerCase();
      if (!needle) continue;
      for (const line of meal.ingredients) {
        const ingredientName = ingredientById.get(line.ingredientRefId)?.name ?? '';
        if (ingredientName.toLowerCase().includes(needle)) {
          conflicts.push({ member, allergen, ingredientName });
        }
      }
    }
  }
  return conflicts;
}
