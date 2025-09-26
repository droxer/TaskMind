import { StyleSheet, Text, View } from 'react-native';

interface Props {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    borderRadius: 18,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#CBD5F5',
    alignItems: 'center',
    backgroundColor: '#F8FAFF',
    gap: 8
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#312E81'
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    color: '#475569'
  }
});
