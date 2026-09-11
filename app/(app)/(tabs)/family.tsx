import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useFamily } from '@/context/FamilyContext';
import {
  addFamilyMember,
  archiveFamilyMember,
  deleteFamilyMember,
  renameFamilyMember,
  subscribeFamilyMembers,
} from '@/lib/familyMembers';
import type { FamilyMember } from '@/types/models';

export default function FamilyMembers() {
  const { family } = useFamily();
  const [members, setMembers] = useState<FamilyMember[] | null>(null);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    if (!family) return;
    return subscribeFamilyMembers(family.id, setMembers);
  }, [family]);

  if (!family) return null;

  async function handleAdd() {
    if (!newName.trim()) return;
    setNewName('');
    await addFamilyMember(family!.id, newName);
  }

  function confirmDelete(member: FamilyMember) {
    Alert.alert(
      `Remove ${member.name}?`,
      'Archive keeps their name on any meals they already liked. Delete removes them from ' +
        'every meal too.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Archive', onPress: () => archiveFamilyMember(family!.id, member.id) },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteFamilyMember(family!.id, member.id),
        },
      ]
    );
  }

  const active = members?.filter((m) => !m.isArchived) ?? [];

  return (
    <View style={styles.container}>
      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          placeholder="Add a family member"
          value={newName}
          onChangeText={setNewName}
          onSubmitEditing={handleAdd}
          returnKeyType="done"
        />
        <Pressable style={styles.addButton} onPress={handleAdd}>
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </View>

      {members === null ? (
        <ActivityIndicator style={styles.loading} />
      ) : (
        <FlatList
          data={active}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No family members yet.</Text>}
          renderItem={({ item }) => (
            <View style={styles.row}>
              {editingId === item.id ? (
                <TextInput
                  style={[styles.input, styles.rowInput]}
                  value={editingName}
                  onChangeText={setEditingName}
                  autoFocus
                  onSubmitEditing={async () => {
                    await renameFamilyMember(family.id, item.id, editingName);
                    setEditingId(null);
                  }}
                  onBlur={() => setEditingId(null)}
                  returnKeyType="done"
                />
              ) : (
                <Pressable
                  style={styles.rowNamePressable}
                  onPress={() => {
                    setEditingId(item.id);
                    setEditingName(item.name);
                  }}
                >
                  <Text style={styles.rowName}>{item.name}</Text>
                </Pressable>
              )}
              <Pressable onPress={() => confirmDelete(item)} hitSlop={8}>
                <Text style={styles.remove}>Remove</Text>
              </Pressable>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  addRow: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 18,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: { color: '#fff', fontWeight: '600' },
  loading: { marginTop: 24 },
  list: { gap: 8 },
  empty: { textAlign: 'center', opacity: 0.5, marginTop: 24 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
    gap: 12,
  },
  rowNamePressable: { flex: 1 },
  rowName: { fontSize: 16 },
  rowInput: { paddingVertical: 6 },
  remove: { color: '#c0392b' },
});
