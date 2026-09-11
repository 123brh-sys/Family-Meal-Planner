import { useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { useFamily } from '@/context/FamilyContext';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';
import { useMeals } from '@/hooks/useMeals';

export default function Meals() {
  const { family } = useFamily();
  const meals = useMeals(family?.id);
  const members = useFamilyMembers(family?.id);
  const router = useRouter();

  const memberName = (id: string) => members?.find((m) => m.id === id)?.name ?? '';

  return (
    <View style={styles.container}>
      {meals === null ? (
        <ActivityIndicator style={styles.loading} />
      ) : (
        <FlatList
          data={meals}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No meals yet — add your first one.</Text>}
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
