import { useEffect, useMemo, useRef, useState } from 'react';
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
import { useIngredients } from '@/hooks/useIngredients';
import { useMeals } from '@/hooks/useMeals';
import { usePlanning } from '@/hooks/usePlanning';
import { useShoppingList } from '@/hooks/useShoppingList';
import { createIngredient } from '@/lib/ingredients';
import { setIngredientPantryFlag } from '@/lib/pantry';
import {
  addManualItem,
  removeItem,
  setItemChecked,
  setOutOfPantryOverride,
  syncShoppingListWithMeals,
} from '@/lib/shoppingList';
import type { Ingredient, ShoppingListItem } from '@/types/models';
import { toDisplayQuantity } from '@/utils/displayUnits';

export default function ShoppingList() {
  const { family, settings } = useFamily();
  const meals = useMeals(family?.id);
  const planning = usePlanning(family?.id);
  const items = useShoppingList(family?.id);
  const ingredients = useIngredients();
  const [manualName, setManualName] = useState('');
  const [manualQty, setManualQty] = useState('1');
  const [manualUnit, setManualUnit] = useState('unit');
  const [pantryExpanded, setPantryExpanded] = useState(false);
  const lastSyncedKey = useRef<string>('');

  const selectedMeals = useMemo(
    () => (meals ?? []).filter((m) => planning?.selectedMealIds.includes(m.id)),
    [meals, planning]
  );

  // Regenerate the merged list whenever the selected meals (or their
  // ingredients) change — this is what makes selecting meals on Tonight
  // "auto-populate" the shared list.
  useEffect(() => {
    if (!family || !meals || !planning) return;
    const key = JSON.stringify(
      selectedMeals.map((m) => ({ id: m.id, ingredients: m.ingredients, updatedAt: m.updatedAt }))
    );
    if (key === lastSyncedKey.current) return;
    lastSyncedKey.current = key;
    syncShoppingListWithMeals(family.id, selectedMeals);
  }, [family, meals, planning, selectedMeals]);

  const ingredientById = new Map((ingredients ?? []).map((i) => [i.id, i]));
  const ingredientName = (refId: string) => ingredientById.get(refId)?.name ?? '…';
  const isPantryLine = (item: ShoppingListItem) =>
    !item.addedManually && !item.outOfPantryOverride && Boolean(ingredientById.get(item.ingredientRefId)?.isPantryItem);
  const displayLine = (item: ShoppingListItem) => {
    const { quantity, unit } = toDisplayQuantity(item.quantity, item.unit, settings?.unitSystem ?? 'metric');
    return `${quantity} ${unit} ${ingredientName(item.ingredientRefId)}`;
  };

  async function handleAddManual() {
    if (!family || !manualName.trim()) return;
    const existing = ingredients?.find(
      (i) => i.name.toLowerCase() === manualName.trim().toLowerCase()
    );
    const ingredient: Ingredient = existing ?? (await createIngredient(manualName, manualUnit || 'unit'));
    await addManualItem(family.id, ingredient.id, Number(manualQty) || 1, manualUnit || 'unit');
    setManualName('');
    setManualQty('1');
  }

  if (!family || items === null || ingredients === null) {
    return <ActivityIndicator style={styles.loading} />;
  }

  const activeItems = items.filter((item) => !isPantryLine(item));
  const pantryItems = items.filter(isPantryLine);
  const sortedActive = [...activeItems].sort((a, b) => Number(a.checked) - Number(b.checked));

  return (
    <View style={styles.container}>
      <View style={styles.addRow}>
        <TextInput
          style={[styles.input, styles.nameInput]}
          placeholder="Add item"
          value={manualName}
          onChangeText={setManualName}
          onSubmitEditing={handleAddManual}
        />
        <TextInput
          style={[styles.input, styles.qtyInput]}
          placeholder="qty"
          keyboardType="decimal-pad"
          value={manualQty}
          onChangeText={setManualQty}
        />
        <TextInput
          style={[styles.input, styles.unitInput]}
          placeholder="unit"
          value={manualUnit}
          onChangeText={setManualUnit}
        />
        <Pressable style={styles.addButton} onPress={handleAddManual}>
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </View>

      <FlatList
        data={sortedActive}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Nothing here yet — select some meals on Tonight or add an item above.
          </Text>
        }
        renderItem={({ item }: { item: ShoppingListItem }) => (
          <Pressable
            style={styles.row}
            onPress={() => setItemChecked(family.id, item.id, !item.checked)}
          >
            <Text style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
              {item.checked ? '☑' : '☐'}
            </Text>
            <Text style={[styles.itemText, item.checked && styles.itemTextChecked]}>
              {displayLine(item)}
            </Text>
            <Pressable
              onPress={() => setIngredientPantryFlag(item.ingredientRefId, true)}
              hitSlop={8}
            >
              <Text style={styles.pantryToggle}>📦</Text>
            </Pressable>
            <Pressable onPress={() => removeItem(family.id, item.id)} hitSlop={8}>
              <Text style={styles.remove}>✕</Text>
            </Pressable>
          </Pressable>
        )}
        ListFooterComponent={
          pantryItems.length > 0 ? (
            <View style={styles.pantrySection}>
              <Pressable style={styles.pantryHeader} onPress={() => setPantryExpanded((v) => !v)}>
                <Text style={styles.pantryHeaderText}>
                  {pantryExpanded ? '▾' : '▸'} Pantry — already have ({pantryItems.length})
                </Text>
              </Pressable>
              {pantryExpanded &&
                pantryItems.map((item) => (
                  <View key={item.id} style={styles.pantryRow}>
                    <Text style={styles.pantryItemText}>
                      {displayLine(item)}
                    </Text>
                    <Pressable
                      onPress={() => setIngredientPantryFlag(item.ingredientRefId, false)}
                      hitSlop={8}
                    >
                      <Text style={styles.pantryToggle}>📦</Text>
                    </Pressable>
                    <Pressable onPress={() => setOutOfPantryOverride(family.id, item.id, true)}>
                      <Text style={styles.outOfStock}>I&apos;m out of this</Text>
                    </Pressable>
                  </View>
                ))}
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 8 },
  loading: { marginTop: 40 },
  addRow: { flexDirection: 'row', gap: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  nameInput: { flex: 2 },
  qtyInput: { flex: 1 },
  unitInput: { flex: 1 },
  addButton: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: { color: '#fff', fontWeight: '600' },
  list: { gap: 2, paddingVertical: 8 },
  empty: { textAlign: 'center', opacity: 0.5, marginTop: 24 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  checkbox: { fontSize: 18, width: 24 },
  checkboxChecked: { color: '#2e7d32' },
  itemText: { fontSize: 16, flex: 1 },
  itemTextChecked: { opacity: 0.4, textDecorationLine: 'line-through' },
  remove: { color: '#c0392b', paddingHorizontal: 6 },
  pantryToggle: { fontSize: 14, paddingHorizontal: 4 },
  pantrySection: { marginTop: 16 },
  pantryHeader: { paddingVertical: 8 },
  pantryHeaderText: { fontSize: 13, opacity: 0.6, textTransform: 'uppercase' },
  pantryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  pantryItemText: { fontSize: 14, opacity: 0.7, flex: 1 },
  outOfStock: { color: '#2e7d32', fontSize: 12, fontWeight: '600' },
});
