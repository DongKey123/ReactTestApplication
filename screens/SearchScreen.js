import { StyleSheet, Text, View, TextInput } from 'react-native';
import { useState } from 'react';

export default function SearchScreen() {
  const [searchText, setSearchText] = useState('');

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="검색어 입력..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {!searchText && (
        <View style={styles.recentContainer}>
          <Text style={styles.sectionTitle}>최근 검색어</Text>
          <View style={styles.recentItem}>
            <Text style={styles.recentText}>프로젝트</Text>
            <Text style={styles.removeBtn}>✕</Text>
          </View>
          <View style={styles.recentItem}>
            <Text style={styles.recentText}>회의록</Text>
            <Text style={styles.removeBtn}>✕</Text>
          </View>
          <View style={styles.recentItem}>
            <Text style={styles.recentText}>마케팅</Text>
            <Text style={styles.removeBtn}>✕</Text>
          </View>
        </View>
      )}

      {searchText && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>검색 결과가 없습니다</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 12,
  },
  recentContainer: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  recentText: {
    fontSize: 16,
    color: '#333',
  },
  removeBtn: {
    fontSize: 14,
    color: '#999',
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
