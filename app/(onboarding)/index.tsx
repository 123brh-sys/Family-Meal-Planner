import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAuth } from '@/context/AuthContext';
import { createFamily, joinFamilyByCode } from '@/lib/family';

type Mode = 'choose' | 'create' | 'join';

export default function JoinOrCreateFamily() {
  const { user } = useAuth();
  const [mode, setMode] = useState<Mode>('choose');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  async function handleCreate() {
    if (!name.trim()) {
      setError('Give your family a name.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await createFamily(user!.uid, name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create family.');
    } finally {
      setBusy(false);
    }
  }

  async function handleJoin() {
    setBusy(true);
    setError(null);
    const result = await joinFamilyByCode(user!.uid, code);
    setBusy(false);
    if (!result.ok) setError(result.error);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Set up your family</Text>

      {mode === 'choose' && (
        <View style={styles.gap}>
          <Pressable style={styles.button} onPress={() => setMode('create')}>
            <Text style={styles.buttonText}>Create a new family</Text>
          </Pressable>
          <Pressable style={[styles.button, styles.secondary]} onPress={() => setMode('join')}>
            <Text style={[styles.buttonText, styles.secondaryText]}>
              Join with an invite code
            </Text>
          </Pressable>
        </View>
      )}

      {mode === 'create' && (
        <View style={styles.gap}>
          <Text style={styles.label}>Family name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="The Smiths"
            autoFocus
          />
          <Pressable style={styles.button} disabled={busy} onPress={handleCreate}>
            {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create family</Text>}
          </Pressable>
          <Pressable onPress={() => setMode('choose')}>
            <Text style={styles.link}>Back</Text>
          </Pressable>
        </View>
      )}

      {mode === 'join' && (
        <View style={styles.gap}>
          <Text style={styles.label}>Invite code</Text>
          <TextInput
            style={styles.input}
            value={code}
            onChangeText={setCode}
            placeholder="ABC123"
            autoCapitalize="characters"
            autoFocus
          />
          <Pressable style={styles.button} disabled={busy} onPress={handleJoin}>
            {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Join family</Text>}
          </Pressable>
          <Pressable onPress={() => setMode('choose')}>
            <Text style={styles.link}>Back</Text>
          </Pressable>
        </View>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24, padding: 24 },
  title: { fontSize: 22, fontWeight: '700' },
  gap: { gap: 12, width: '100%', maxWidth: 320 },
  label: { fontSize: 14, opacity: 0.7 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2e7d32',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#2e7d32' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  secondaryText: { color: '#2e7d32' },
  link: { textAlign: 'center', opacity: 0.6, marginTop: 4 },
  error: { color: '#c0392b', textAlign: 'center' },
});
