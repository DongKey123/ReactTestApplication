import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useState } from "react";
import { useMemos } from "../context/MemoContext";

// 검색어 하이라이트 컴포넌트
function HighlightedText({ text, highlight, style, highlightStyle, numberOfLines }) {
  if (!highlight.trim()) {
    return <Text style={style} numberOfLines={numberOfLines}>{text}</Text>;
  }

  const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <Text style={style} numberOfLines={numberOfLines}>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <Text key={index} style={[style, highlightStyle]}>
            {part}
          </Text>
        ) : (
          part
        )
      )}
    </Text>
  );
}

export default function SearchScreen({ navigation }) {
  const [searchText, setSearchText] = useState("");
  const {
    memos,
    recentSearches,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
  } = useMemos();

  const filteredMemos = memos.filter((memo) =>
    memo.title.toLowerCase().includes(searchText.toLowerCase()) ||
    memo.content.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSearch = (text) => {
    setSearchText(text);
  };

  const handleSubmitSearch = () => {
    if (searchText.trim()) {
      addRecentSearch(searchText.trim());
    }
  };

  const handleRecentSearchPress = (search) => {
    setSearchText(search);
    addRecentSearch(search);
  };

  const handleMemoPress = (memo) => {
    if (searchText.trim()) {
      addRecentSearch(searchText.trim());
    }
    navigation.navigate("MemoDetail", { memo });
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="검색어 입력..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={handleSearch}
          onSubmitEditing={handleSubmitSearch}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          keyboardType="default"
        />
        {searchText.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSearchText("")}
          >
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 검색어가 없을 때 최근 검색어 표시 */}
      {!searchText && (
        <ScrollView style={styles.recentContainer}>
          {recentSearches.length > 0 ? (
            <>
              <View style={styles.recentHeader}>
                <Text style={styles.recentTitle}>최근 검색어</Text>
                <TouchableOpacity onPress={clearRecentSearches}>
                  <Text style={styles.clearAllText}>전체 삭제</Text>
                </TouchableOpacity>
              </View>
              {recentSearches.map((search, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.recentItem}
                  onPress={() => handleRecentSearchPress(search)}
                >
                  <Text style={styles.recentIcon}>🕐</Text>
                  <Text style={styles.recentText}>{search}</Text>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeRecentSearch(search)}
                  >
                    <Text style={styles.removeButtonText}>✕</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>검색어를 입력하세요</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* 검색 결과 없음 */}
      {searchText && filteredMemos.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>검색 결과가 없습니다</Text>
        </View>
      )}

      {/* 검색 결과 목록 */}
      {searchText && filteredMemos.length > 0 && (
        <>
          <Text style={styles.resultCount}>
            검색 결과 ({filteredMemos.length})
          </Text>
          <FlatList
            data={filteredMemos}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.resultItem}
                onPress={() => handleMemoPress(item)}
              >
                <HighlightedText
                  text={item.title}
                  highlight={searchText}
                  style={styles.resultTitle}
                  highlightStyle={styles.highlight}
                />
                {item.content && (
                  <HighlightedText
                    text={item.content}
                    highlight={searchText}
                    style={styles.resultContent}
                    highlightStyle={styles.highlight}
                    numberOfLines={2}
                  />
                )}
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.resultList}
          />
        </>
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
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    fontSize: 16,
    color: "#999",
  },
  recentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  recentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  clearAllText: {
    fontSize: 14,
    color: "#999",
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  recentIcon: {
    fontSize: 14,
    marginRight: 12,
  },
  recentText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  removeButton: {
    padding: 4,
  },
  removeButtonText: {
    fontSize: 14,
    color: "#999",
  },
  resultCount: {
    fontSize: 14,
    color: "#666",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  resultList: {
    padding: 16,
    paddingTop: 0,
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
  highlight: {
    backgroundColor: "#FFEB3B",
    color: "#333",
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
