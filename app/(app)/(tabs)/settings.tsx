import { signOut } from '@firebase/auth';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/context/AuthContext';
import { useFamily } from '@/context/FamilyContext';
import { auth } from '@/lib/firebase';

export default function Settings() {
  const { user } = useAuth();
  const { family } = useFamily();

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

      <Text style={styles.hint}>Units and theme settings land in a later stage.</Text>

      <Pressable style={styles.signOutButton} onPress={() => signOut(auth)}>
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 24 },
  section: { gap: 4 },
  label: { fontSize: 13, opacity: 0.6, textTransform: 'uppercase' },
  value: { fontSize: 16 },
  code: { fontSize: 28, fontWeight: '700', letterSpacing: 4 },
  hint: { fontSize: 13, opacity: 0.5 },
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
