import { StyleSheet, Text, View, FlatList, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { useMemos } from '../context/MemoContext';
import { useState } from 'react';

export default function MemoScreen({ navigation }) {
  const { memos, folders, getMemosByFolder, addFolder, updateFolder, deleteFolder, reorderFolders } = useMemos();
  const [selectedFolder, setSelectedFolder] = useState('default');
  const [showManageFolders, setShowManageFolders] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [showAddFolder, setShowAddFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#1B5E3C');

  const colors = [
    "#1B5E3C", "#2563EB", "#DC2626", "#F59E0B",
    "#8B5CF6", "#EC4899", "#10B981", "#F97316"
  ];

  const filteredMemos = getMemosByFolder(selectedFolder);

  const handleLongPressFolder = (folder) => {
    if (folder.id === 'default' || folder.id === 'work' || folder.id === 'personal') {
      Alert.alert(
        folder.name,
        '기본 폴더는 색상만 변경할 수 있습니다.',
        [
          { text: '취소', style: 'cancel' },
          {
            text: '색상 변경',
            onPress: () => {
              setEditingFolder(folder);
              setEditName(folder.name);
              setEditColor(folder.color);
            }
          },
        ]
      );
    } else {
      Alert.alert(
        folder.name,
        '폴더를 관리하시겠습니까?',
        [
          { text: '취소', style: 'cancel' },
          {
            text: '수정',
            onPress: () => {
              setEditingFolder(folder);
              setEditName(folder.name);
              setEditColor(folder.color);
            }
          },
          {
            text: '삭제',
            style: 'destructive',
            onPress: () => handleDeleteFolder(folder.id)
          },
        ]
      );
    }
  };

  const handleDeleteFolder = (folderId) => {
    const memoCount = getMemosByFolder(folderId).length;
    const message = memoCount > 0
      ? `이 폴더에 ${memoCount}개의 메모가 있습니다. 폴더를 삭제하면 메모는 '전체' 폴더로 이동됩니다.`
      : '폴더를 삭제하시겠습니까?';

    Alert.alert(
      '폴더 삭제',
      message,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            deleteFolder(folderId);
            if (selectedFolder === folderId) {
              setSelectedFolder('default');
            }
            Alert.alert('완료', '폴더가 삭제되었습니다.');
          }
        },
      ]
    );
  };

  const handleUpdateFolder = () => {
    if (!editName.trim() && editingFolder.id !== 'default' && editingFolder.id !== 'work' && editingFolder.id !== 'personal') {
      Alert.alert('알림', '폴더 이름을 입력해주세요.');
      return;
    }

    updateFolder(editingFolder.id, editName.trim(), editColor);
    setEditingFolder(null);
    setEditName('');
    setEditColor('');
    Alert.alert('완료', '폴더가 수정되었습니다.');
  };

  const handleAddFolder = () => {
    if (!newFolderName.trim()) {
      Alert.alert('알림', '폴더 이름을 입력해주세요.');
      return;
    }

    addFolder(newFolderName.trim(), newFolderColor);
    setNewFolderName('');
    setNewFolderColor('#1B5E3C');
    setShowAddFolder(false);
    Alert.alert('완료', '폴더가 추가되었습니다.');
  };

  const moveFolder = (fromIndex, toIndex) => {
    const newFolders = [...folders];
    const [movedFolder] = newFolders.splice(fromIndex, 1);
    newFolders.splice(toIndex, 0, movedFolder);
    reorderFolders(newFolders);
  };

  const renderMemoItem = ({ item }) => (
    <TouchableOpacity
      style={styles.memoItem}
      onPress={() => navigation.navigate('MemoDetail', { memo: item })}
    >
      <Text style={styles.memoTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.folderListContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.folderList}
          contentContainerStyle={styles.folderListContent}
        >
          {folders.map((folder) => (
            <TouchableOpacity
              key={folder.id}
              style={[
                styles.folderTab,
                selectedFolder === folder.id && styles.folderTabActive,
              ]}
              onPress={() => setSelectedFolder(folder.id)}
              onLongPress={() => handleLongPressFolder(folder)}
            >
              <View
                style={[
                  styles.folderTabColor,
                  { backgroundColor: folder.color },
                ]}
              />
              <Text
                style={[
                  styles.folderTabText,
                  selectedFolder === folder.id && styles.folderTabTextActive,
                ]}
              >
                {folder.name}
              </Text>
              <View style={styles.folderTabBadge}>
                <Text style={[
                  styles.folderTabBadgeText,
                  selectedFolder === folder.id && styles.folderTabBadgeTextActive,
                ]}>
                  {getMemosByFolder(folder.id).length}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.addFolderButton}
            onPress={() => setShowAddFolder(true)}
          >
            <Text style={styles.addFolderButtonText}>+ 폴더</Text>
          </TouchableOpacity>
        </ScrollView>
        <TouchableOpacity
          style={styles.manageFoldersButton}
          onPress={() => setShowManageFolders(true)}
        >
          <Text style={styles.manageFoldersButtonText}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {filteredMemos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>저장된 메모가 없습니다</Text>
        </View>
      ) : (
        <FlatList
          data={filteredMemos}
          keyExtractor={(item) => item.id}
          renderItem={renderMemoItem}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* 폴더 편집 모달 */}
      {editingFolder && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            onPress={() => {
              setEditingFolder(null);
              setEditName('');
              setEditColor('');
            }}
          />
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>폴더 수정</Text>

            {editingFolder.id !== 'default' && editingFolder.id !== 'work' && editingFolder.id !== 'personal' && (
              <TextInput
                style={styles.folderNameInput}
                placeholder="폴더 이름 입력..."
                placeholderTextColor="#999"
                value={editName}
                onChangeText={setEditName}
                autoFocus
                autoCorrect={false}
                autoCapitalize="none"
              />
            )}

            <Text style={styles.colorPickerLabel}>색상 선택</Text>
            <View style={styles.colorPicker}>
              {colors.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    editColor === color && styles.colorOptionSelected,
                  ]}
                  onPress={() => setEditColor(color)}
                >
                  {editColor === color && (
                    <Text style={styles.colorOptionCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleUpdateFolder}
            >
              <Text style={styles.saveButtonText}>저장</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setEditingFolder(null);
                setEditName('');
                setEditColor('');
              }}
            >
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 폴더 추가 모달 */}
      {showAddFolder && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            onPress={() => {
              setShowAddFolder(false);
              setNewFolderName('');
              setNewFolderColor('#1B5E3C');
            }}
          />
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>새 폴더 추가</Text>

            <TextInput
              style={styles.folderNameInput}
              placeholder="폴더 이름 입력..."
              placeholderTextColor="#999"
              value={newFolderName}
              onChangeText={setNewFolderName}
              autoFocus
              autoCorrect={false}
              autoCapitalize="none"
            />

            <Text style={styles.colorPickerLabel}>색상 선택</Text>
            <View style={styles.colorPicker}>
              {colors.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    newFolderColor === color && styles.colorOptionSelected,
                  ]}
                  onPress={() => setNewFolderColor(color)}
                >
                  {newFolderColor === color && (
                    <Text style={styles.colorOptionCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleAddFolder}
            >
              <Text style={styles.saveButtonText}>추가</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowAddFolder(false);
                setNewFolderName('');
                setNewFolderColor('#1B5E3C');
              }}
            >
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 폴더 관리 모달 */}
      {showManageFolders && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            onPress={() => setShowManageFolders(false)}
          />
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>폴더 관리</Text>
            <Text style={styles.modalSubtitle}>↑↓ 버튼으로 순서 변경, 길게 눌러서 수정/삭제</Text>

            <ScrollView style={styles.manageFolderList}>
              {folders.map((folder, index) => (
                <TouchableOpacity
                  key={folder.id}
                  style={styles.manageFolderItem}
                  onLongPress={() => {
                    setShowManageFolders(false);
                    handleLongPressFolder(folder);
                  }}
                >
                  <View style={styles.manageFolderLeft}>
                    <Text style={styles.manageFolderHandle}>☰</Text>
                    <View
                      style={[
                        styles.manageFolderColor,
                        { backgroundColor: folder.color },
                      ]}
                    />
                    <Text style={styles.manageFolderName}>{folder.name}</Text>
                  </View>
                  <View style={styles.manageFolderRight}>
                    <Text style={styles.manageFolderCount}>
                      {getMemosByFolder(folder.id).length}개
                    </Text>
                    {index > 0 && (
                      <TouchableOpacity
                        onPress={() => moveFolder(index, index - 1)}
                        style={styles.moveButton}
                      >
                        <Text style={styles.moveButtonText}>↑</Text>
                      </TouchableOpacity>
                    )}
                    {index < folders.length - 1 && (
                      <TouchableOpacity
                        onPress={() => moveFolder(index, index + 1)}
                        style={styles.moveButton}
                      >
                        <Text style={styles.moveButtonText}>↓</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowManageFolders(false)}
            >
              <Text style={styles.cancelButtonText}>닫기</Text>
            </TouchableOpacity>
          </View>
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
  listContent: {
    padding: 16,
  },
  memoItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  memoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
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
  folderListContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  folderList: {
    flex: 1,
    maxHeight: 60,
  },
  folderListContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  folderTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F0',
  },
  folderTabActive: {
    backgroundColor: '#1B5E3C',
  },
  folderTabColor: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  folderTabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  folderTabTextActive: {
    color: '#FFFFFF',
  },
  folderTabBadge: {
    marginLeft: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  folderTabBadgeText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
  },
  folderTabBadgeTextActive: {
    color: '#FFFFFF',
  },
  addFolderButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addFolderButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  manageFoldersButton: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F0',
  },
  manageFoldersButtonText: {
    fontSize: 20,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '85%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#999',
    marginBottom: 16,
    textAlign: 'center',
  },
  folderNameInput: {
    backgroundColor: '#F5F5F0',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  colorPickerLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginBottom: 12,
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: '#000',
    borderWidth: 3,
  },
  colorOptionCheck: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#1B5E3C',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  saveButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  manageFolderList: {
    maxHeight: 400,
    marginBottom: 16,
  },
  manageFolderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F5F5F0',
  },
  manageFolderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  manageFolderHandle: {
    fontSize: 18,
    color: '#999',
    marginRight: 12,
  },
  manageFolderColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  manageFolderName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  manageFolderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  manageFolderCount: {
    fontSize: 12,
    color: '#999',
    marginRight: 8,
  },
  moveButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E0E0E0',
    borderRadius: 14,
    marginLeft: 4,
  },
  moveButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
});
