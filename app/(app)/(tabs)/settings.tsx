import { signOut } from '@firebase/auth';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/context/AuthContext';
import { useFamily } from '@/context/FamilyContext';
import { auth } from '@/lib/firebase';
import { setUnitSystem } from '@/lib/settings';
import type { UnitSystem } from '@/types/models';

export default function Settings() {
  const { user } = useAuth();
  const { family, settings } = useFamily();

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.label}>Signed in as</Text>
        <Text style={styles.value}>{user?.email ?? user?.displayName ?? user?.uid}</Text>
      </View>

      {family && (
        <View style={styles.section}>
          <Text style={styles.label}>{family.name} — invite code</Text>
          <Text style={styles.code}>{family.inviteCode}</Text>
          <Text style={styles.hint}>
            Share this code with your partner so they can join the same family from the sign-in
            screen.
          </Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.label}>Units</Text>
        <View style={styles.chips}>
          {(['metric', 'us'] as UnitSystem[]).map((system) => {
            const selected = settings?.unitSystem === system;
            return (
              <Pressable
                key={system}
                style={[styles.chip, selected && styles.chipSelected]}
                onPress={() => user && setUnitSystem(user.uid, system)}
              >
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                  {system === 'metric' ? 'Metric (g, ml)' : 'US (oz, cups)'}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Text style={styles.hint}>Theme lands in a later stage.</Text>

      <Pressable style={styles.signOutButton} onPress={() => signOut(auth)}>
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 24 },
  section: { gap: 8 },
  label: { fontSize: 13, opacity: 0.6, textTransform: 'uppercase' },
  value: { fontSize: 16 },
  code: { fontSize: 28, fontWeight: '700', letterSpacing: 4 },
  hint: { fontSize: 13, opacity: 0.5 },
  chips: { flexDirection: 'row', gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: '#2e7d32',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipSelected: { backgroundColor: '#2e7d32' },
  chipText: { color: '#2e7d32' },
  chipTextSelected: { color: '#fff' },
  signOutButton: {
    marginTop: 'auto',
    borderWidth: 1,
    borderColor: '#c0392b',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  signOutText: { color: '#c0392b', fontWeight: '600', fontSize: 16 },
});
