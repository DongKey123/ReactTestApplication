import { StyleSheet, View, Text, ScrollView } from "react-native";

export default function MemoDetailScreen({ route }) {
  const { memo } = route.params;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{memo.title}</Text>
        {memo.content && <Text style={styles.contentText}>{memo.content}</Text>}
        <Text style={styles.timestamp}>
          {new Date(memo.createdAt).toLocaleString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F0",
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
});
