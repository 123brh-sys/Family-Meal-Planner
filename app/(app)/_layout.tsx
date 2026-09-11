import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="meal/new"
        options={{ presentation: 'modal', title: 'New Meal' }}
      />
      <Stack.Screen name="meal/[id]" options={{ title: '' }} />
      <Stack.Screen
        name="meal/[id]/edit"
        options={{ presentation: 'modal', title: 'Edit Meal' }}
      />
    </Stack>
  );
}
