import { StyleSheet, Text, View } from 'react-native';

export function Placeholder({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 24 },
  title: { fontSize: 20, fontWeight: '700' },
  subtitle: { fontSize: 15, opacity: 0.6, textAlign: 'center' },
});
