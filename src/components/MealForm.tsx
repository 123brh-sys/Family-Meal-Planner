import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { MealIngredientRow } from '@/components/MealIngredientRow';
import { useIngredients } from '@/hooks/useIngredients';
import type { FamilyMember, Ingredient, Meal, MealIngredient } from '@/types/models';
import { localId } from '@/utils/id';
import type { MealInput } from '@/lib/meals';

interface Props {
  familyMembers: FamilyMember[];
  initialMeal?: Meal;
  submitLabel: string;
  onSubmit: (input: MealInput) => Promise<void>;
}

function emptyIngredient(): MealIngredient {
  return { id: localId(), ingredientRefId: '', quantity: 0, unit: '', displayNote: null };
}

export function MealForm({ familyMembers, initialMeal, submitLabel, onSubmit }: Props) {
  const ingredients = useIngredients();
  const [name, setName] = useState(initialMeal?.name ?? '');
  const [servings, setServings] = useState(String(initialMeal?.servings ?? 4));
  const [instructionsUrl, setInstructionsUrl] = useState(initialMeal?.instructionsUrl ?? '');
  const [likedBy, setLikedBy] = useState<string[]>(initialMeal?.likedBy ?? []);
  const [rows, setRows] = useState<MealIngredient[]>(
    initialMeal?.ingredients.length ? initialMeal.ingredients : [emptyIngredient()]
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ingredientById = new Map((ingredients ?? []).map((i) => [i.id, i]));

  function initialNameFor(row: MealIngredient): string {
    return ingredientById.get(row.ingredientRefId)?.name ?? '';
  }

  function toggleLikedBy(memberId: string) {
    setLikedBy((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  }

  function updateRow(index: number, next: MealIngredient) {
    setRows((prev) => prev.map((r, i) => (i === index ? next : r)));
  }

  function removeRow(index: number) {
    setRows((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  }

  async function handleSubmit() {
    if (!name.trim()) {
      setError('Give the meal a name.');
      return;
    }
    const validRows = rows.filter((r) => r.ingredientRefId && r.quantity > 0 && r.unit.trim());
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        name,
        ingredients: validRows,
        likedBy,
        instructionsUrl: instructionsUrl.trim() || null,
        servings: Number(servings) || 1,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save meal.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Meal name" />

      <Text style={styles.label}>Servings</Text>
      <TextInput
        style={styles.input}
        value={servings}
        onChangeText={setServings}
        keyboardType="number-pad"
      />

      <Text style={styles.label}>Recipe link (optional)</Text>
      <TextInput
        style={styles.input}
        value={instructionsUrl}
        onChangeText={setInstructionsUrl}
        placeholder="https://…"
        autoCapitalize="none"
        keyboardType="url"
      />

      <Text style={styles.label}>Who likes it?</Text>
      <View style={styles.chips}>
        {familyMembers.map((member) => {
          const selected = likedBy.includes(member.id);
          return (
            <Pressable
              key={member.id}
              style={[styles.chip, selected && styles.chipSelected]}
              onPress={() => toggleLikedBy(member.id)}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                {member.name}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.label}>Ingredients</Text>
      {ingredients === null ? (
        <ActivityIndicator />
      ) : (
        <>
          {rows.map((row, index) => (
            <MealIngredientRow
              key={row.id}
              ingredients={ingredients}
              value={row}
              initialName={initialNameFor(row)}
              onChange={(next) => updateRow(index, next)}
              onRemove={() => removeRow(index)}
            />
          ))}
          <Pressable style={styles.addRow} onPress={() => setRows((prev) => [...prev, emptyIngredient()])}>
            <Text style={styles.addRowText}>+ Add ingredient</Text>
          </Pressable>
        </>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable style={styles.submit} disabled={saving} onPress={handleSubmit}>
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>{submitLabel}</Text>}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 6, paddingBottom: 48 },
  label: { fontSize: 13, opacity: 0.6, marginTop: 14, textTransform: 'uppercase' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: '#2e7d32',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipSelected: { backgroundColor: '#2e7d32' },
  chipText: { color: '#2e7d32' },
  chipTextSelected: { color: '#fff' },
  addRow: { paddingVertical: 12, alignItems: 'center' },
  addRowText: { color: '#2e7d32', fontWeight: '600' },
  error: { color: '#c0392b', textAlign: 'center', marginTop: 12 },
  submit: {
    marginTop: 20,
    backgroundColor: '#2e7d32',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
