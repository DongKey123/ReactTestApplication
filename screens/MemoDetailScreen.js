import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useMemos } from "../context/MemoContext";

export default function MemoDetailScreen({ route, navigation }) {
  const { memo } = route.params;
  const { deleteMemo, memos } = useMemos();

  // 최신 메모 데이터 가져오기 (수정 후 반영을 위해)
  const currentMemo = memos.find((m) => m.id === memo.id) || memo;

  const handleEdit = () => {
    navigation.navigate("Create", { editMemo: currentMemo });
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

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>{currentMemo.title}</Text>
          {currentMemo.content && (
            <Text style={styles.contentText}>{currentMemo.content}</Text>
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
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  contentText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
    marginBottom: 16,
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
});
