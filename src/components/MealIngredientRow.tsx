import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { IngredientAutocomplete } from '@/components/IngredientAutocomplete';
import type { Ingredient, MealIngredient } from '@/types/models';

interface Props {
  ingredients: Ingredient[];
  value: MealIngredient;
  initialName: string;
  onChange: (next: MealIngredient) => void;
  onRemove: () => void;
}

export function MealIngredientRow({ ingredients, value, initialName, onChange, onRemove }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.quantity}>
          <TextInput
            style={styles.smallInput}
            keyboardType="decimal-pad"
            value={value.quantity ? String(value.quantity) : ''}
            placeholder="Qty"
            onChangeText={(text) => onChange({ ...value, quantity: Number(text) || 0 })}
          />
        </View>
        <View style={styles.unit}>
          <TextInput
            style={styles.smallInput}
            value={value.unit}
            placeholder="unit"
            onChangeText={(text) => onChange({ ...value, unit: text })}
          />
        </View>
        <Pressable onPress={onRemove} hitSlop={8}>
          <Text style={styles.remove}>✕</Text>
        </Pressable>
      </View>
      <IngredientAutocomplete
        ingredients={ingredients}
        initialName={initialName}
        onResolve={(ingredient) =>
          onChange({ ...value, ingredientRefId: ingredient.id, unit: value.unit || ingredient.defaultUnit })
        }
      />
      <TextInput
        style={styles.noteInput}
        value={value.displayNote ?? ''}
        placeholder="Note (e.g. large, ripe) — optional"
        onChangeText={(text) => onChange({ ...value, displayNote: text || null })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  topRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  quantity: { width: 64 },
  unit: { width: 72 },
  smallInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 15,
  },
  remove: { color: '#c0392b', fontSize: 16, paddingHorizontal: 6 },
  noteInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
  },
});
