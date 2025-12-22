import { StyleSheet, Text, View } from 'react-native';

export default function MemoScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>메모</Text>
      <Text style={styles.subtitle}>준비 중인 기능입니다</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
  },
});
