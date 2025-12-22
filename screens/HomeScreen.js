import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';

const SAMPLE_MEMOS = [
  {
    id: '1',
    title: '신규 프로젝트 기획',
    content: '신규 프로젝트 기획을 확정 넘어 사는에 작성한 기록을 저장합니다.',
    checklist: [
      { id: 'c1', text: '초기 컨셉 구상', checked: true },
      { id: 'c2', text: '팀원 구성 및 역할 배분', checked: false },
    ],
    updatedAt: '12:30',
  },
  {
    id: '2',
    title: '회의록 정리',
    content: 'Q3 마케팅 캠페인 논의 내용 정리',
    checklist: [],
    updatedAt: '어제',
  },
  {
    id: '3',
    title: '아이디어 메모',
    content: '새로운 기능 아이디어 브레인스토밍',
    checklist: [],
    updatedAt: '12월 20일',
  },
];

function MemoCard({ item }) {
  return (
    <TouchableOpacity style={styles.card}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardContent} numberOfLines={2}>
        {item.content}
      </Text>
      {item.checklist.length > 0 && (
        <View style={styles.checklistContainer}>
          {item.checklist.slice(0, 2).map((check) => (
            <View key={check.id} style={styles.checkItem}>
              <Text style={styles.checkbox}>{check.checked ? '☑' : '☐'}</Text>
              <Text style={[styles.checkText, check.checked && styles.checkedText]}>
                {check.text}
              </Text>
            </View>
          ))}
        </View>
      )}
      <Text style={styles.timestamp}>{item.updatedAt}</Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <FlatList
        data={SAMPLE_MEMOS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MemoCard item={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  cardContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  checklistContainer: {
    marginBottom: 8,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  checkbox: {
    fontSize: 16,
    color: '#1B5E3C',
    marginRight: 8,
  },
  checkText: {
    fontSize: 14,
    color: '#333',
  },
  checkedText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
});
