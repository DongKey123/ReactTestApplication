import {
  StyleSheet,
  View,
  TextInput,
  Alert,
  Text,
  TouchableOpacity,
} from "react-native";
import { useState, useLayoutEffect } from "react";
import { useMemos } from "../context/MemoContext";

export default function CreateScreen({ navigation }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const { addMemo } = useMemos();

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert("알림", "제목을 입력해주세요.");
      return;
    }

    addMemo(title.trim(), content.trim());
    setTitle("");
    setContent("");
    Alert.alert("저장 완료", "메모가 저장되었습니다.", [
      {
        text: "확인",
        onPress: () => navigation.navigate("Memo"),
      },
    ]);
  };

  const handleCancel = () => {
    const hasChanges = title.trim() !== "" || content.trim() !== "";

    if (hasChanges) {
      Alert.alert(
        "변경사항 취소",
        "작성 중인 내용이 있습니다. 취소하시겠습니까?",
        [
          {
            text: "계속 작성",
            style: "cancel",
          },
          {
            text: "취소",
            style: "destructive",
            onPress: () => {
              setTitle("");
              setContent("");
              navigation.navigate("Home");
            },
          },
        ]
      );
    } else {
      navigation.navigate("Home");
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <Text style={styles.cancelText}>취소</Text>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
          <Text style={styles.saveText}>저장</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, title, content]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <TextInput
          style={styles.titleInput}
          placeholder="제목 입력..."
          placeholderTextColor="#999"
          value={title}
          onChangeText={setTitle}
          autoCorrect={false}
          autoCapitalize="none"
          keyboardType="default"
          returnKeyType="next"
        />
        <View style={styles.divider} />
        <TextInput
          style={styles.contentInput}
          placeholder="내용을 입력하세요..."
          placeholderTextColor="#999"
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
          autoCorrect={false}
          autoCapitalize="none"
          keyboardType="default"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F0",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  titleInput: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    paddingVertical: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 8,
  },
  contentInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
  },
  headerButton: {
    padding: 8,
  },
  cancelText: {
    fontSize: 16,
    color: "#666",
    paddingHorizontal: 8,
  },
  saveText: {
    fontSize: 16,
    color: "#1B5E3C",
    fontWeight: "600",
    paddingHorizontal: 8,
  },
});
