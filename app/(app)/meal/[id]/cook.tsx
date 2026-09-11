import { useKeepAwake } from 'expo-keep-awake';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { useFamily } from '@/context/FamilyContext';
import { getMeal } from '@/lib/meals';
import type { Meal } from '@/types/models';

/**
 * The "stays unlocked" cooking view (§9): opens a meal's recipe link without
 * leaving the app, and keeps the screen from auto-locking for as long as
 * it's open — expo-keep-awake activates on mount and deactivates on unmount,
 * so the phone goes back to normal behavior the moment you back out.
 */
export default function CookingView() {
  useKeepAwake();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { family } = useFamily();
  const [meal, setMeal] = useState<Meal | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!family) return;
    getMeal(family.id, id).then(setMeal);
  }, [family, id]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: meal?.name ?? 'Recipe' }} />
      {meal?.instructionsUrl ? (
        <WebView
          source={{ uri: meal.instructionsUrl }}
          onLoadEnd={() => setLoading(false)}
          style={styles.webview}
        />
      ) : null}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  webview: { flex: 1 },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
});
