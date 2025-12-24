import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useState } from "react";
import { useMemos } from "../context/MemoContext";

export default function SearchScreen({ navigation }) {
  const [searchText, setSearchText] = useState("");
  const { memos } = useMemos();

  const filteredMemos = memos.filter((memo) =>
    memo.title.toLowerCase().includes(searchText.toLowerCase())
  );

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
          autoCorrect={false}
          autoCapitalize="none"
          keyboardType="default"
        />
      </View>

      {!searchText && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>검색어를 입력하세요</Text>
        </View>
      )}

      {searchText && filteredMemos.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>검색 결과가 없습니다</Text>
        </View>
      )}

      {searchText && filteredMemos.length > 0 && (
        <FlatList
          data={filteredMemos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.resultItem}
              onPress={() => navigation.navigate("MemoDetail", { memo: item })}
            >
              <Text style={styles.resultTitle}>{item.title}</Text>
              {item.content && (
                <Text style={styles.resultContent} numberOfLines={2}>
                  {item.content}
                </Text>
              )}
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.resultList}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F0",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    margin: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    paddingVertical: 12,
  },
  resultList: {
    padding: 16,
  },
  resultItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  resultContent: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
});
