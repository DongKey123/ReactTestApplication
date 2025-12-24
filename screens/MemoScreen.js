import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { useMemos } from '../context/MemoContext';

export default function MemoScreen({ navigation }) {
  const { memos } = useMemos();

  const renderMemoItem = ({ item }) => (
    <TouchableOpacity
      style={styles.memoItem}
      onPress={() => navigation.navigate('MemoDetail', { memo: item })}
    >
      <Text style={styles.memoTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {memos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>저장된 메모가 없습니다</Text>
        </View>
      ) : (
        <FlatList
          data={memos}
          keyExtractor={(item) => item.id}
          renderItem={renderMemoItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F0',
  },
  listContent: {
    padding: 16,
  },
  memoItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  memoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});
