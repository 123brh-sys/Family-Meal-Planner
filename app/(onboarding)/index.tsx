import { StyleSheet, Text, View } from 'react-native';

export default function JoinOrCreateFamily() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set up your family</Text>
      <Text style={styles.subtitle}>Create or join a family — coming in the next stage.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 24 },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { fontSize: 15, opacity: 0.6, textAlign: 'center' },
});
