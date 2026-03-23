import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Image,
} from "react-native";
import { useMemos } from "../context/MemoContext";
import FormattedText from "../components/FormattedText";

export default function MemoDetailScreen({ route, navigation }) {
  const { memo } = route.params;
  const { deleteMemo, memos, toggleBookmark } = useMemos();

  // 최신 메모 데이터 가져오기 (수정 후 반영을 위해)
  const currentMemo = memos.find((m) => m.id === memo.id) || memo;

  const handleEdit = () => {
    navigation.navigate("EditMemo", { editMemo: currentMemo });
  };

  const handleDelete = () => {
    Alert.alert("메모 삭제", "이 메모를 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => {
          deleteMemo(memo.id);
          navigation.goBack();
        },
      },
    ]);
  };

  const handleOpenLink = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("오류", "이 링크를 열 수 없습니다.");
      }
    } catch (error) {
      Alert.alert("오류", "링크를 여는 중 오류가 발생했습니다.");
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{currentMemo.title}</Text>
            <TouchableOpacity
              style={styles.bookmarkButton}
              onPress={() => toggleBookmark(currentMemo.id)}
            >
              <Text style={styles.bookmarkIcon}>
                {currentMemo.bookmarked ? "🔖" : "📑"}
              </Text>
            </TouchableOpacity>
          </View>
          {currentMemo.content && (
            <FormattedText
              text={currentMemo.content}
              style={styles.contentText}
              baseStyle={styles.contentBaseStyle}
            />
          )}
          {currentMemo.checklist && currentMemo.checklist.length > 0 && (
            <View style={styles.checklistContainer}>
              {currentMemo.checklist.map((check) => (
                <View key={check.id} style={styles.checkItem}>
                  <Text style={styles.checkbox}>
                    {check.checked ? "☑" : "☐"}
                  </Text>
                  <Text
                    style={[
                      styles.checkText,
                      check.checked && styles.checkedText,
                    ]}
                  >
                    {check.text}
                  </Text>
                </View>
              ))}
            </View>
          )}
          {currentMemo.links && currentMemo.links.length > 0 && (
            <View style={styles.linksContainer}>
              <Text style={styles.linksSectionTitle}>첨부 링크</Text>
              {currentMemo.links.map((link) => (
                <TouchableOpacity
                  key={link.id}
                  style={styles.linkItem}
                  onPress={() => handleOpenLink(link.url)}
                >
                  <Text style={styles.linkIcon}>🔗</Text>
                  <View style={styles.linkTextContainer}>
                    <Text style={styles.linkTitle} numberOfLines={1}>{link.title}</Text>
                    <Text style={styles.linkUrl} numberOfLines={1}>{link.url}</Text>
                  </View>
                  <Text style={styles.linkArrow}>→</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {currentMemo.images && currentMemo.images.length > 0 && (
            <View style={styles.imagesContainer}>
              <Text style={styles.imagesSectionTitle}>첨부 이미지</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {currentMemo.images.map((image) => (
                  <Image
                    key={image.id}
                    source={{ uri: image.uri }}
                    style={styles.detailImage}
                  />
                ))}
              </ScrollView>
            </View>
          )}
          <Text style={styles.timestamp}>
            작성: {new Date(currentMemo.createdAt).toLocaleString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
          {currentMemo.updatedAt && (
            <Text style={styles.timestampUpdated}>
              수정: {new Date(currentMemo.updatedAt).toLocaleString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          )}
        </View>
      </ScrollView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
          <Text style={styles.editButtonText}>수정</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>삭제</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F0",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  bookmarkButton: {
    padding: 8,
    marginLeft: 8,
  },
  bookmarkIcon: {
    fontSize: 24,
  },
  contentText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
    marginBottom: 16,
  },
  contentBaseStyle: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
    marginTop: 8,
  },
  timestampUpdated: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  checklistContainer: {
    marginTop: 16,
    marginBottom: 8,
    padding: 12,
    backgroundColor: "#F5F5F0",
    borderRadius: 8,
  },
  checkItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  checkbox: {
    fontSize: 18,
    color: "#1B5E3C",
    marginRight: 10,
  },
  checkText: {
    fontSize: 15,
    color: "#333",
    flex: 1,
  },
  checkedText: {
    textDecorationLine: "line-through",
    color: "#999",
  },
  buttonContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  editButton: {
    flex: 1,
    backgroundColor: "#1B5E3C",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  deleteButton: {
    flex: 1,
    backgroundColor: "#F44336",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  linksContainer: {
    marginTop: 16,
    marginBottom: 8,
    padding: 12,
    backgroundColor: "#F5F5F0",
    borderRadius: 8,
  },
  linksSectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 10,
  },
  linkItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  linkIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  linkTextContainer: {
    flex: 1,
  },
  linkTitle: {
    fontSize: 15,
    color: "#1B5E3C",
    fontWeight: "500",
    marginBottom: 2,
  },
  linkUrl: {
    fontSize: 12,
    color: "#666",
  },
  linkArrow: {
    fontSize: 16,
    color: "#1B5E3C",
    marginLeft: 8,
  },
  imagesContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  imagesSectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 10,
  },
  detailImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginRight: 12,
  },
});
