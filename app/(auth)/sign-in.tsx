import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useGoogleSignIn } from '@/hooks/useGoogleSignIn';
import { isFirebaseConfigured } from '@/lib/firebase';

const googleConfigured = Boolean(process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID);

export default function SignIn() {
  const { ready, signingIn, error, signIn } = useGoogleSignIn();

  if (!isFirebaseConfigured || !googleConfigured) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Family Dinner Picker</Text>
        <Text style={styles.subtitle}>
          Firebase / Google Sign-In isn&apos;t configured yet. Copy .env.example to .env and
          fill in your Firebase + Google OAuth values — see the README for setup steps.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Family Dinner Picker</Text>
      <Text style={styles.subtitle}>Sign in to see your family&apos;s meals and shopping list.</Text>
      <Pressable
        style={[styles.button, (!ready || signingIn) && styles.buttonDisabled]}
        disabled={!ready || signingIn}
        onPress={() => signIn()}
      >
        {signingIn ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Continue with Google</Text>
        )}
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  title: { fontSize: 24, fontWeight: '700' },
  subtitle: { fontSize: 15, opacity: 0.6, textAlign: 'center' },
  button: {
    backgroundColor: '#4285F4',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
    minWidth: 220,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  error: { color: '#c0392b', textAlign: 'center' },
});
