import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { createIngredient } from '@/lib/ingredients';
import type { Ingredient } from '@/types/models';
import { findFuzzyMatches, similarity } from '@/utils/fuzzyMatch';

interface Props {
  ingredients: Ingredient[];
  initialName: string;
  onResolve: (ingredient: Ingredient) => void;
}

/**
 * Free-text ingredient entry with fuzzy-matched suggestions against the shared
 * canonical ingredient list, so "chicken breasts" gets offered the existing
 * "chicken breast" record instead of silently creating a duplicate (§6).
 */
export function IngredientAutocomplete({ ingredients, initialName, onResolve }: Props) {
  const [text, setText] = useState(initialName);
  const [dirty, setDirty] = useState(false);

  const suggestions = useMemo(
    () => (dirty && text.trim().length >= 2 ? findFuzzyMatches(text, ingredients).slice(0, 5) : []),
    [dirty, text, ingredients]
  );

  const exactMatch = useMemo(
    () => suggestions.find((m) => similarity(m.item.name, text) > 0.98),
    [suggestions, text]
  );

  // A near-exact retype of an existing ingredient's name is unambiguous —
  // resolve it immediately instead of making the user tap a suggestion.
  useEffect(() => {
    if (exactMatch) {
      setDirty(false);
      onResolve(exactMatch.item);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exactMatch]);

  function selectExisting(ingredient: Ingredient) {
    setText(ingredient.name);
    setDirty(false);
    onResolve(ingredient);
  }

  async function createNew() {
    const trimmed = text.trim();
    if (!trimmed) return;
    const ingredient = await createIngredient(trimmed, 'unit');
    setDirty(false);
    onResolve(ingredient);
  }

  return (
    <View>
      <TextInput
        style={styles.input}
        value={text}
        placeholder="Ingredient"
        onChangeText={(value) => {
          setText(value);
          setDirty(true);
        }}
      />
      {suggestions.length > 0 && !exactMatch && (
        <View style={styles.suggestions}>
          {suggestions.map((match) => (
            <Pressable
              key={match.item.id}
              style={styles.suggestion}
              onPress={() => selectExisting(match.item)}
            >
              <Text style={styles.suggestionText}>Did you mean “{match.item.name}”?</Text>
            </Pressable>
          ))}
          <Pressable style={styles.suggestion} onPress={createNew}>
            <Text style={styles.suggestionTextMuted}>Use “{text.trim()}” as a new ingredient</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 15,
  },
  suggestions: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  suggestion: { paddingVertical: 8, paddingHorizontal: 10 },
  suggestionText: { color: '#2e7d32', fontSize: 13 },
  suggestionTextMuted: { color: '#666', fontSize: 13, fontStyle: 'italic' },
});
