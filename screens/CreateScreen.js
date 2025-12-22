import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';

export default function CreateScreen() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const hasChanges = () => {
    return title.trim() !== '' || content.trim() !== '';
  };

  const handleCancel = () => {
    if (hasChanges()) {
      Alert.alert(
        '변경사항 취소',
        '작성 중인 내용이 있습니다. 취소하시겠습니까?',
        [
          {
            text: '계속 작성',
            style: 'cancel'
          },
          {
            text: '취소',
            style: 'destructive',
            onPress: () => {
              setTitle('');
              setContent('');
            }
          }
        ]
      );
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('알림', '제목을 입력해주세요.');
      return;
    }

    Alert.alert('저장 완료', '메모가 저장되었습니다.', [
      {
        text: '확인',
        onPress: () => {
          setTitle('');
          setContent('');
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <Text style={styles.cancelText}>취소</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
          <Text style={styles.saveText}>저장</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <TextInput
          style={styles.titleInput}
          placeholder="제목 입력..."
          placeholderTextColor="#999"
          value={title}
          onChangeText={setTitle}
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
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerButton: {
    padding: 8,
  },
  cancelText: {
    fontSize: 16,
    color: '#666666',
  },
  saveText: {
    fontSize: 16,
    color: '#1B5E3C',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  titleInput: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    paddingVertical: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
  },
  contentInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
});
