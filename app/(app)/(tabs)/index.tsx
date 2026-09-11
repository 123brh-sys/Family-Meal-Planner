import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { useFamily } from '@/context/FamilyContext';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';
import { useMeals } from '@/hooks/useMeals';
import { usePlanning } from '@/hooks/usePlanning';
import { setMealSelected } from '@/lib/planning';
import type { Meal } from '@/types/models';

export default function Tonight() {
  const { family } = useFamily();
  const members = useFamilyMembers(family?.id);
  const meals = useMeals(family?.id);
  const planning = usePlanning(family?.id);
  const router = useRouter();

  const [presentIds, setPresentIds] = useState<Set<string> | null>(null);

  // Present toggle defaults to everyone, once the member list first loads.
  useEffect(() => {
    if (members && presentIds === null) {
      setPresentIds(new Set(members.filter((m) => !m.isArchived).map((m) => m.id)));
    }
  }, [members, presentIds]);

  const activeMembers = useMemo(() => members?.filter((m) => !m.isArchived) ?? [], [members]);

  const matches = useMemo(() => {
    if (!meals || !presentIds) return [];
    const present = [...presentIds];
    return meals
      .filter((meal) => present.every((id) => meal.likedBy.includes(id)))
      .sort((a, b) => b.likedBy.length - a.likedBy.length || a.name.localeCompare(b.name));
  }, [meals, presentIds]);

  function togglePresent(memberId: string) {
    setPresentIds((prev) => {
      const next = new Set(prev);
      if (next.has(memberId)) next.delete(memberId);
      else next.add(memberId);
      return next;
    });
  }

  function toggleSelected(meal: Meal) {
    if (!family) return;
    const isSelected = planning?.selectedMealIds.includes(meal.id) ?? false;
    setMealSelected(family.id, meal.id, !isSelected);
  }

  function surpriseMe() {
    if (!family || matches.length === 0) return;
    const unselected = matches.filter((m) => !planning?.selectedMealIds.includes(m.id));
    const pool = unselected.length > 0 ? unselected : matches;
    const choice = pool[Math.floor(Math.random() * pool.length)];
    setMealSelected(family.id, choice.id, true);
  }

  if (!family || members === null || meals === null || presentIds === null) {
    return <ActivityIndicator style={styles.loading} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Who&apos;s eating tonight?</Text>
      <View style={styles.chips}>
        {activeMembers.map((member) => {
          const present = presentIds.has(member.id);
          return (
            <Pressable
              key={member.id}
              style={[styles.chip, present && styles.chipSelected]}
              onPress={() => togglePresent(member.id)}
            >
              <Text style={[styles.chipText, present && styles.chipTextSelected]}>
                {member.name}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.matchesHeader}>
        <Text style={styles.sectionTitle}>Meals everyone here likes</Text>
        <Pressable onPress={surpriseMe} disabled={matches.length === 0}>
          <Text style={[styles.surprise, matches.length === 0 && styles.surpriseDisabled]}>
            🎲 Surprise me
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={matches}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No saved meals match everyone selected — add one from the Meals tab.
          </Text>
        }
        renderItem={({ item }) => {
          const selected = planning?.selectedMealIds.includes(item.id) ?? false;
          return (
            <Pressable
              style={[styles.mealRow, selected && styles.mealRowSelected]}
              onPress={() => toggleSelected(item)}
            >
              <View style={styles.mealInfo}>
                <Text style={styles.mealName}>{item.name}</Text>
                <Text style={styles.mealMeta}>
                  {item.likedBy.length} of {activeMembers.length} like this
                </Text>
              </View>
              <Pressable onPress={() => router.push(`/meal/${item.id}`)} hitSlop={8}>
                <Text style={styles.details}>Details</Text>
              </Pressable>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 8 },
  loading: { marginTop: 40 },
  sectionTitle: { fontSize: 13, opacity: 0.6, textTransform: 'uppercase' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
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
  matchesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  surprise: { color: '#2e7d32', fontWeight: '600' },
  surpriseDisabled: { opacity: 0.3 },
  list: { gap: 8, paddingBottom: 24 },
  empty: { textAlign: 'center', opacity: 0.5, marginTop: 24 },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
  },
  mealRowSelected: { borderColor: '#2e7d32', backgroundColor: '#eaf4ea' },
  mealInfo: { flex: 1 },
  mealName: { fontSize: 16, fontWeight: '600' },
  mealMeta: { fontSize: 12, opacity: 0.6, marginTop: 2 },
  details: { color: '#2e7d32', fontSize: 13 },
});
