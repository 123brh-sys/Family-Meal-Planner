import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useFamily } from '@/context/FamilyContext';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';
import { useIngredients } from '@/hooks/useIngredients';
import { usePlanning } from '@/hooks/usePlanning';
import { deleteMeal, getMeal } from '@/lib/meals';
import { setMealSelected } from '@/lib/planning';
import type { Meal } from '@/types/models';
import { toDisplayQuantity } from '@/utils/displayUnits';

export default function MealDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { family, settings } = useFamily();
  const members = useFamilyMembers(family?.id);
  const ingredients = useIngredients();
  const planning = usePlanning(family?.id);
  const router = useRouter();
  const [meal, setMeal] = useState<Meal | null | undefined>(undefined);

  useEffect(() => {
    if (!family) return;
    getMeal(family.id, id).then(setMeal);
  }, [family, id]);

  if (!family || meal === undefined || members === null || ingredients === null) {
    return <ActivityIndicator style={styles.loading} />;
  }
  if (meal === null) {
    return (
      <View style={styles.center}>
        <Text>This meal no longer exists.</Text>
      </View>
    );
  }

  const memberName = (memberId: string) => members.find((m) => m.id === memberId)?.name ?? '?';
  const ingredientName = (refId: string) => ingredients.find((i) => i.id === refId)?.name ?? '?';
  const isSelected = planning?.selectedMealIds.includes(meal.id) ?? false;

  function handleDelete() {
    Alert.alert('Delete this meal?', meal!.name, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteMeal(family!.id, meal!.id);
          router.back();
        },
      },
    ]);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{meal.name}</Text>
      <Text style={styles.meta}>Serves {meal.servings}</Text>

      {meal.likedBy.length > 0 && (
        <Text style={styles.meta}>Liked by {meal.likedBy.map(memberName).join(', ')}</Text>
      )}

      <Text style={styles.sectionTitle}>Ingredients</Text>
      {meal.ingredients.map((ing) => {
        const { quantity, unit } = toDisplayQuantity(ing.quantity, ing.unit, settings?.unitSystem ?? 'metric');
        return (
          <Text key={ing.id} style={styles.ingredient}>
            {quantity} {unit} {ingredientName(ing.ingredientRefId)}
            {ing.displayNote ? ` (${ing.displayNote})` : ''}
          </Text>
        );
      })}

      {meal.instructionsUrl && (
        <Pressable style={styles.linkButton} onPress={() => Linking.openURL(meal.instructionsUrl!)}>
          <Text style={styles.linkButtonText}>Open recipe instructions</Text>
        </Pressable>
      )}

      <Pressable
        style={[styles.shoppingToggle, isSelected && styles.shoppingToggleSelected]}
        onPress={() => setMealSelected(family.id, meal.id, !isSelected)}
      >
        <Text style={[styles.shoppingToggleText, isSelected && styles.shoppingToggleTextSelected]}>
          {isSelected ? '✓ On this week’s shopping list' : 'Add to shopping list'}
        </Text>
      </Pressable>

      <View style={styles.actions}>
        <Pressable style={styles.editButton} onPress={() => router.push(`/meal/${meal.id}/edit`)}>
          <Text style={styles.editButtonText}>Edit</Text>
        </Pressable>
        <Pressable style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 6 },
  loading: { marginTop: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700' },
  meta: { fontSize: 14, opacity: 0.6 },
  sectionTitle: { fontSize: 14, opacity: 0.6, textTransform: 'uppercase', marginTop: 16 },
  ingredient: { fontSize: 15 },
  linkButton: { marginTop: 16 },
  linkButtonText: { color: '#2e7d32', fontWeight: '600' },
  shoppingToggle: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#2e7d32',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  shoppingToggleSelected: { backgroundColor: '#2e7d32' },
  shoppingToggleText: { color: '#2e7d32', fontWeight: '600' },
  shoppingToggleTextSelected: { color: '#fff' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 28 },
  editButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#2e7d32',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  editButtonText: { color: '#2e7d32', fontWeight: '600' },
  deleteButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#c0392b',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  deleteButtonText: { color: '#c0392b', fontWeight: '600' },
});
