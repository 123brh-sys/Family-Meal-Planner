import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useFamily } from '@/context/FamilyContext';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';
import { useMeals } from '@/hooks/useMeals';

export default function Meals() {
  const { family } = useFamily();
  const meals = useMeals(family?.id);
  const members = useFamilyMembers(family?.id);
  const router = useRouter();
  const [search, setSearch] = useState('');

  const memberName = (id: string) => members?.find((m) => m.id === id)?.name ?? '';

  const filtered = useMemo(() => {
    if (!meals) return [];
    const query = search.trim().toLowerCase();
    return query ? meals.filter((m) => m.name.toLowerCase().includes(query)) : meals;
  }, [meals, search]);

  return (
    <View style={styles.container}>
      {meals !== null && meals.length > 8 && (
        <TextInput
          style={styles.search}
          value={search}
          onChangeText={setSearch}
          placeholder="Search meals"
          autoCapitalize="none"
        />
      )}
      {meals === null ? (
        <ActivityIndicator style={styles.loading} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {search ? 'No meals match your search.' : 'No meals yet — add your first one.'}
            </Text>
          }
          renderItem={({ item }) => (
            <Pressable style={styles.row} onPress={() => router.push(`/meal/${item.id}`)}>
              <Text style={styles.name}>{item.name}</Text>
              {item.likedBy.length > 0 && (
                <Text style={styles.likedBy}>{item.likedBy.map(memberName).join(', ')}</Text>
              )}
            </Pressable>
          )}
        />
      )}
      <Pressable style={styles.fab} onPress={() => router.push('/meal/new')}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  search: {
    margin: 16,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  loading: { marginTop: 24 },
  list: { padding: 16, gap: 4 },
  empty: { textAlign: 'center', opacity: 0.5, marginTop: 24 },
  row: {
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  name: { fontSize: 16, fontWeight: '600' },
  likedBy: { fontSize: 13, opacity: 0.6, marginTop: 2 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2e7d32',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 30 },
});
