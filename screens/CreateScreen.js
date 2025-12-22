import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { useState } from 'react';

export default function CreateScreen() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  return (
    <View style={styles.container}>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F0',
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
