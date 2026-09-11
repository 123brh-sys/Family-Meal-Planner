import { StyleSheet, Text, View } from 'react-native';

export default function SignIn() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Family Dinner Picker</Text>
      <Text style={styles.subtitle}>Sign-in coming in the next stage.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 24 },
  title: { fontSize: 24, fontWeight: '700' },
  subtitle: { fontSize: 15, opacity: 0.6, textAlign: 'center' },
});
