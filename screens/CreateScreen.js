import {
  StyleSheet,
  View,
  TextInput,
  Alert,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { useState, useLayoutEffect, useEffect, useRef, useCallback } from "react";
import FormattedText from "../components/FormattedText";
import { Calendar, LocaleConfig } from "react-native-calendars";
import * as ImagePicker from "expo-image-picker";
import { useMemos } from "../context/MemoContext";
import { isHoliday, getHolidayName } from "../data/holidays";
import {
  generateTitle,
  summarizeContent,
  expandContent,
} from "../services/AIService";

// 한국어 설정
LocaleConfig.locales["ko"] = {
  monthNames: [
    "1월", "2월", "3월", "4월", "5월", "6월",
    "7월", "8월", "9월", "10월", "11월", "12월",
  ],
  monthNamesShort: [
    "1월", "2월", "3월", "4월", "5월", "6월",
    "7월", "8월", "9월", "10월", "11월", "12월",
  ],
  dayNames: ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"],
  dayNamesShort: ["일", "월", "화", "수", "목", "금", "토"],
  today: "오늘",
};
LocaleConfig.defaultLocale = "ko";

export default function CreateScreen({ navigation, route }) {
  const editMemo = route.params?.editMemo;
  const isEditMode = !!editMemo;

  const [title, setTitle] = useState(editMemo?.title || "");
  const [content, setContent] = useState(editMemo?.content || "");
  const [selectedFolder, setSelectedFolder] = useState(editMemo?.folderId || "default");
  const [selectedDate, setSelectedDate] = useState(
    editMemo ? new Date(editMemo.createdAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]
  );
  const [showFolderPicker, setShowFolderPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedColor, setSelectedColor] = useState("#1B5E3C");
  const [checklist, setChecklist] = useState(editMemo?.checklist || []);
  const [newCheckItem, setNewCheckItem] = useState("");
  const [links, setLinks] = useState(editMemo?.links || []);
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [images, setImages] = useState(editMemo?.images || []);
  const [saveStatus, setSaveStatus] = useState(""); // "", "saving", "saved"
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [showAIMenu, setShowAIMenu] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const contentInputRef = useRef(null);
  const { addMemo, updateMemo, folders, addFolder } = useMemos();

  const autoSaveTimerRef = useRef(null);
  const lastSavedRef = useRef({ title: editMemo?.title || "", content: editMemo?.content || "" });

  const colors = [
    "#1B5E3C", "#2563EB", "#DC2626", "#F59E0B",
    "#8B5CF6", "#EC4899", "#10B981", "#F97316"
  ];

  // 자동 저장 함수
  const performAutoSave = useCallback(() => {
    if (!isEditMode) return;
    if (!title.trim()) return;
    if (title === lastSavedRef.current.title && content === lastSavedRef.current.content) return;

    setSaveStatus("saving");
    const memoDateTime = new Date(selectedDate);
    const now = new Date();
    memoDateTime.setHours(now.getHours(), now.getMinutes(), now.getSeconds());

    updateMemo(editMemo.id, title.trim(), content.trim(), selectedFolder, memoDateTime.toISOString(), checklist, links, images);
    lastSavedRef.current = { title, content };

    setTimeout(() => setSaveStatus("saved"), 300);
    setTimeout(() => setSaveStatus(""), 2000);
  }, [isEditMode, title, content, selectedFolder, selectedDate, checklist, links, images, editMemo?.id, updateMemo]);

  // 자동 저장 (수정 모드에서만, 2초 debounce)
  useEffect(() => {
    if (!isEditMode) return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      performAutoSave();
    }, 2000);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [title, content, performAutoSave, isEditMode]);

  // 체크리스트 함수들
  const addCheckItem = () => {
    if (!newCheckItem.trim()) return;
    const newItem = {
      id: Date.now().toString(),
      text: newCheckItem.trim(),
      checked: false,
    };
    setChecklist([...checklist, newItem]);
    setNewCheckItem("");
  };

  const toggleCheckItem = (id) => {
    setChecklist(
      checklist.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const deleteCheckItem = (id) => {
    setChecklist(checklist.filter((item) => item.id !== id));
  };

  // 링크 관련 함수들
  const addLink = () => {
    if (!newLinkUrl.trim()) return;

    // URL 형식 검증 및 자동 http:// 추가
    let url = newLinkUrl.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    const newLink = {
      id: Date.now().toString(),
      url,
      title: newLinkTitle.trim() || url,
    };
    setLinks([...links, newLink]);
    setNewLinkUrl("");
    setNewLinkTitle("");
    setShowLinkInput(false);
  };

  const deleteLink = (id) => {
    setLinks(links.filter((link) => link.id !== id));
  };

  // 이미지 관련 함수들
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("권한 필요", "이미지를 선택하려면 갤러리 접근 권한이 필요합니다.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map((asset) => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        uri: asset.uri,
      }));
      setImages([...images, ...newImages]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("권한 필요", "사진을 촬영하려면 카메라 접근 권한이 필요합니다.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const newImage = {
        id: Date.now().toString(),
        uri: result.assets[0].uri,
      };
      setImages([...images, newImage]);
    }
  };

  const deleteImage = (id) => {
    setImages(images.filter((image) => image.id !== id));
  };

  // 서식 적용 함수
  const applyFormat = (formatType) => {
    const { start, end } = selection;
    const selectedText = content.substring(start, end);

    let wrapper = "";
    switch (formatType) {
      case "bold":
        wrapper = "**";
        break;
      case "italic":
        wrapper = "*";
        break;
      case "strikethrough":
        wrapper = "~~";
        break;
      case "code":
        wrapper = "`";
        break;
      default:
        return;
    }

    let newContent;
    let newCursorPos;

    if (start === end) {
      // 선택된 텍스트가 없으면 커서 위치에 래퍼 삽입
      newContent = content.substring(0, start) + wrapper + wrapper + content.substring(end);
      newCursorPos = start + wrapper.length;
    } else {
      // 선택된 텍스트를 래퍼로 감싸기
      newContent = content.substring(0, start) + wrapper + selectedText + wrapper + content.substring(end);
      newCursorPos = end + wrapper.length * 2;
    }

    setContent(newContent);
    // 커서 위치 업데이트
    setTimeout(() => {
      setSelection({ start: newCursorPos, end: newCursorPos });
    }, 10);
  };

  // AI 제목 자동 생성
  const handleAIGenerateTitle = async () => {
    if (!content.trim()) {
      Alert.alert("알림", "내용을 먼저 입력해주세요.");
      return;
    }

    setAiLoading(true);
    setShowAIMenu(false);

    try {
      const generatedTitle = await generateTitle(content);
      if (generatedTitle) {
        Alert.alert(
          "AI 제목 추천",
          `추천 제목: "${generatedTitle}"`,
          [
            { text: "취소", style: "cancel" },
            {
              text: "적용",
              onPress: () => setTitle(generatedTitle),
            },
          ]
        );
      } else {
        Alert.alert("알림", "제목을 생성할 수 없습니다. 내용을 더 입력해주세요.");
      }
    } catch (error) {
      Alert.alert("오류", "AI 제목 생성 중 오류가 발생했습니다.");
    } finally {
      setAiLoading(false);
    }
  };

  // AI 내용 요약
  const handleAISummarize = async () => {
    if (!content.trim() || content.trim().length < 50) {
      Alert.alert("알림", "요약하려면 내용이 더 필요합니다 (최소 50자).");
      return;
    }

    setAiLoading(true);
    setShowAIMenu(false);

    try {
      const summary = await summarizeContent(content);
      if (summary) {
        Alert.alert(
          "AI 요약",
          summary,
          [
            { text: "닫기", style: "cancel" },
            {
              text: "내용 대체",
              onPress: () => setContent(summary),
            },
            {
              text: "내용 추가",
              onPress: () => setContent(content + "\n\n---\n요약:\n" + summary),
            },
          ]
        );
      } else {
        Alert.alert("알림", "요약을 생성할 수 없습니다.");
      }
    } catch (error) {
      Alert.alert("오류", "AI 요약 중 오류가 발생했습니다.");
    } finally {
      setAiLoading(false);
    }
  };

  // AI 내용 확장
  const handleAIExpand = async () => {
    if (!content.trim()) {
      Alert.alert("알림", "내용을 먼저 입력해주세요.");
      return;
    }

    setAiLoading(true);
    setShowAIMenu(false);

    try {
      const expanded = await expandContent(content, "detailed");
      if (expanded) {
        Alert.alert(
          "AI 확장",
          "내용이 확장되었습니다.",
          [
            { text: "취소", style: "cancel" },
            {
              text: "적용",
              onPress: () => setContent(expanded),
            },
          ]
        );
      } else {
        Alert.alert("알림", "내용을 확장할 수 없습니다.");
      }
    } catch (error) {
      Alert.alert("오류", "AI 확장 중 오류가 발생했습니다.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert("알림", "제목을 입력해주세요.");
      return;
    }

    // 선택한 날짜로 메모 저장 (시간은 현재 시간 사용)
    const now = new Date();
    const memoDateTime = new Date(selectedDate);
    memoDateTime.setHours(now.getHours(), now.getMinutes(), now.getSeconds());

    if (isEditMode) {
      updateMemo(editMemo.id, title.trim(), content.trim(), selectedFolder, memoDateTime.toISOString(), checklist, links, images);
      Alert.alert("수정 완료", "메모가 수정되었습니다.", [
        {
          text: "확인",
          onPress: () => navigation.goBack(),
        },
      ]);
    } else {
      addMemo(title.trim(), content.trim(), selectedFolder, memoDateTime.toISOString(), checklist, links, images);
      setTitle("");
      setContent("");
      setSelectedFolder("default");
      setSelectedDate(new Date().toISOString().split("T")[0]);
      setChecklist([]);
      setLinks([]);
      setImages([]);
      Alert.alert("저장 완료", "메모가 저장되었습니다.", [
        {
          text: "확인",
          onPress: () => navigation.navigate("Memo"),
        },
      ]);
    }
  };

  const handleCancel = () => {
    const originalTitle = editMemo?.title || "";
    const originalContent = editMemo?.content || "";
    const hasChanges = title.trim() !== originalTitle || content.trim() !== originalContent;

    if (hasChanges) {
      Alert.alert(
        "변경사항 취소",
        isEditMode ? "수정한 내용을 취소하시겠습니까?" : "작성 중인 내용이 있습니다. 취소하시겠습니까?",
        [
          {
            text: "계속 작성",
            style: "cancel",
          },
          {
            text: "취소",
            style: "destructive",
            onPress: () => {
              if (isEditMode) {
                navigation.goBack();
              } else {
                setTitle("");
                setContent("");
                setChecklist([]);
                setLinks([]);
                setImages([]);
                navigation.navigate("Home");
              }
            },
          },
        ]
      );
    } else {
      if (isEditMode) {
        navigation.goBack();
      } else {
        navigation.navigate("Home");
      }
    }
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      Alert.alert("알림", "폴더 이름을 입력해주세요.");
      return;
    }

    addFolder(newFolderName.trim(), selectedColor);
    setNewFolderName("");
    setSelectedColor("#1B5E3C");
    setShowCreateFolder(false);
    Alert.alert("완료", "폴더가 생성되었습니다.");
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: isEditMode ? "메모 수정" : "새 메모",
      headerLeft: () => (
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <Text style={styles.cancelText}>{isEditMode ? "닫기" : "취소"}</Text>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <View style={styles.headerRightContainer}>
          {saveStatus !== "" && (
            <Text style={styles.saveStatusText}>
              {saveStatus === "saving" ? "저장 중..." : "저장됨"}
            </Text>
          )}
          <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
            <Text style={styles.saveText}>{isEditMode ? "완료" : "저장"}</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, title, content, isEditMode, saveStatus]);

  const selectedFolderData = folders.find((f) => f.id === selectedFolder);

  const formatSelectedDate = () => {
    const date = new Date(selectedDate);
    const holidayName = getHolidayName(selectedDate);
    const dateStr = date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    });
    return holidayName ? `${dateStr} (${holidayName})` : dateStr;
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <TouchableOpacity
          style={styles.folderSelector}
          onPress={() => setShowFolderPicker(true)}
        >
          <View
            style={[
              styles.folderColor,
              { backgroundColor: selectedFolderData?.color || "#1B5E3C" },
            ]}
          />
          <Text style={styles.folderText}>
            {selectedFolderData?.name || "전체"}
          </Text>
          <Text style={styles.folderArrow}>▼</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dateSelector}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateLabelText}>날짜</Text>
          <Text style={styles.dateText}>{formatSelectedDate()}</Text>
          <Text style={styles.folderArrow}>▼</Text>
        </TouchableOpacity>

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
          ref={contentInputRef}
          style={styles.contentInput}
          placeholder="내용을 입력하세요..."
          placeholderTextColor="#999"
          value={content}
          onChangeText={setContent}
          onSelectionChange={(e) => setSelection(e.nativeEvent.selection)}
          selection={selection}
          multiline
          textAlignVertical="top"
          autoCorrect={false}
          autoCapitalize="none"
          keyboardType="default"
        />

        {/* 서식 툴바 */}
        <View style={styles.formatToolbar}>
          <TouchableOpacity
            style={styles.formatButton}
            onPress={() => applyFormat("bold")}
          >
            <Text style={styles.formatButtonTextBold}>B</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.formatButton}
            onPress={() => applyFormat("italic")}
          >
            <Text style={styles.formatButtonTextItalic}>I</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.formatButton}
            onPress={() => applyFormat("strikethrough")}
          >
            <Text style={styles.formatButtonTextStrike}>S</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.formatButton}
            onPress={() => applyFormat("code")}
          >
            <Text style={styles.formatButtonTextCode}>&lt;/&gt;</Text>
          </TouchableOpacity>
          <View style={styles.formatDivider} />
          <TouchableOpacity
            style={[styles.formatButton, styles.aiButton]}
            onPress={() => setShowAIMenu(true)}
            disabled={aiLoading}
          >
            {aiLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.aiButtonText}>AI</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* 체크리스트 섹션 */}
        <View style={styles.checklistSection}>
          <Text style={styles.checklistTitle}>체크리스트</Text>

          {checklist.map((item) => (
            <View key={item.id} style={styles.checklistItem}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => toggleCheckItem(item.id)}
              >
                <Text style={styles.checkboxIcon}>
                  {item.checked ? "☑" : "☐"}
                </Text>
              </TouchableOpacity>
              <Text
                style={[
                  styles.checklistItemText,
                  item.checked && styles.checklistItemChecked,
                ]}
              >
                {item.text}
              </Text>
              <TouchableOpacity
                style={styles.deleteCheckButton}
                onPress={() => deleteCheckItem(item.id)}
              >
                <Text style={styles.deleteCheckIcon}>×</Text>
              </TouchableOpacity>
            </View>
          ))}

          <View style={styles.addChecklistContainer}>
            <TextInput
              style={styles.addChecklistInput}
              placeholder="할 일 추가..."
              placeholderTextColor="#999"
              value={newCheckItem}
              onChangeText={setNewCheckItem}
              onSubmitEditing={addCheckItem}
              returnKeyType="done"
              autoCorrect={false}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.addChecklistButton}
              onPress={addCheckItem}
            >
              <Text style={styles.addChecklistButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 링크 섹션 */}
        <View style={styles.linkSection}>
          <Text style={styles.linkSectionTitle}>링크</Text>

          {links.map((link) => (
            <View key={link.id} style={styles.linkItem}>
              <Text style={styles.linkIcon}>🔗</Text>
              <View style={styles.linkTextContainer}>
                <Text style={styles.linkTitle} numberOfLines={1}>{link.title}</Text>
                <Text style={styles.linkUrl} numberOfLines={1}>{link.url}</Text>
              </View>
              <TouchableOpacity
                style={styles.deleteLinkButton}
                onPress={() => deleteLink(link.id)}
              >
                <Text style={styles.deleteLinkIcon}>×</Text>
              </TouchableOpacity>
            </View>
          ))}

          {!showLinkInput ? (
            <TouchableOpacity
              style={styles.addLinkButton}
              onPress={() => setShowLinkInput(true)}
            >
              <Text style={styles.addLinkButtonText}>+ 링크 추가</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.linkInputContainer}>
              <TextInput
                style={styles.linkUrlInput}
                placeholder="URL 입력 (예: google.com)"
                placeholderTextColor="#999"
                value={newLinkUrl}
                onChangeText={setNewLinkUrl}
                autoCorrect={false}
                autoCapitalize="none"
                keyboardType="url"
              />
              <TextInput
                style={styles.linkTitleInput}
                placeholder="제목 (선택사항)"
                placeholderTextColor="#999"
                value={newLinkTitle}
                onChangeText={setNewLinkTitle}
                autoCorrect={false}
                autoCapitalize="none"
              />
              <View style={styles.linkInputButtons}>
                <TouchableOpacity
                  style={styles.linkCancelButton}
                  onPress={() => {
                    setShowLinkInput(false);
                    setNewLinkUrl("");
                    setNewLinkTitle("");
                  }}
                >
                  <Text style={styles.linkCancelButtonText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.linkAddConfirmButton}
                  onPress={addLink}
                >
                  <Text style={styles.linkAddConfirmButtonText}>추가</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* 이미지 섹션 */}
        <View style={styles.imageSection}>
          <Text style={styles.imageSectionTitle}>이미지</Text>

          {images.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScrollView}>
              {images.map((image) => (
                <View key={image.id} style={styles.imageContainer}>
                  <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                  <TouchableOpacity
                    style={styles.deleteImageButton}
                    onPress={() => deleteImage(image.id)}
                  >
                    <Text style={styles.deleteImageIcon}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}

          <View style={styles.imageButtonsContainer}>
            <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
              <Text style={styles.imageButtonIcon}>🖼️</Text>
              <Text style={styles.imageButtonText}>갤러리</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
              <Text style={styles.imageButtonIcon}>📷</Text>
              <Text style={styles.imageButtonText}>카메라</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {showDatePicker && (
        <View style={styles.folderPickerOverlay}>
          <TouchableOpacity
            style={styles.folderPickerBackdrop}
            onPress={() => setShowDatePicker(false)}
          />
          <View style={styles.datePickerContainer}>
            <Text style={styles.folderPickerTitle}>날짜 선택</Text>
            <Calendar
              style={styles.calendarStyle}
              onDayPress={(day) => {
                setSelectedDate(day.dateString);
                setShowDatePicker(false);
              }}
              markedDates={{
                [selectedDate]: {
                  selected: true,
                  selectedColor: "#1B5E3C",
                },
              }}
              theme={{
                backgroundColor: "#FFFFFF",
                calendarBackground: "#FFFFFF",
                selectedDayBackgroundColor: "#1B5E3C",
                selectedDayTextColor: "#FFFFFF",
                todayTextColor: "#1B5E3C",
                dayTextColor: "#333",
                arrowColor: "#1B5E3C",
                monthTextColor: "#333",
                textMonthFontWeight: "600",
              }}
              dayComponent={({ date, state, marking }) => {
                const holiday = isHoliday(date.dateString);
                const isSelected = marking?.selected;
                const isSunday = new Date(date.dateString).getDay() === 0;
                const isSaturday = new Date(date.dateString).getDay() === 6;

                return (
                  <TouchableOpacity
                    style={[
                      styles.dayContainer,
                      isSelected && styles.selectedDay,
                    ]}
                    onPress={() => {
                      setSelectedDate(date.dateString);
                      setShowDatePicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        state === "disabled" && styles.disabledDayText,
                        (holiday || isSunday) && styles.holidayText,
                        isSaturday && styles.saturdayText,
                        isSelected && styles.selectedDayText,
                      ]}
                    >
                      {date.day}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
            <TouchableOpacity
              style={styles.todayButton}
              onPress={() => {
                setSelectedDate(new Date().toISOString().split("T")[0]);
                setShowDatePicker(false);
              }}
            >
              <Text style={styles.todayButtonText}>오늘</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.folderPickerCancel}
              onPress={() => setShowDatePicker(false)}
            >
              <Text style={styles.folderPickerCancelText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {showFolderPicker && (
        <View style={styles.folderPickerOverlay}>
          <TouchableOpacity
            style={styles.folderPickerBackdrop}
            onPress={() => setShowFolderPicker(false)}
          />
          <View style={styles.folderPickerContainer}>
            <Text style={styles.folderPickerTitle}>폴더 선택</Text>
            {folders.map((folder) => (
              <TouchableOpacity
                key={folder.id}
                style={styles.folderPickerItem}
                onPress={() => {
                  setSelectedFolder(folder.id);
                  setShowFolderPicker(false);
                }}
              >
                <View
                  style={[
                    styles.folderPickerColor,
                    { backgroundColor: folder.color },
                  ]}
                />
                <Text style={styles.folderPickerText}>{folder.name}</Text>
                {selectedFolder === folder.id && (
                  <Text style={styles.folderPickerCheck}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.folderPickerAddButton}
              onPress={() => {
                setShowFolderPicker(false);
                setShowCreateFolder(true);
              }}
            >
              <Text style={styles.folderPickerAddText}>+ 새 폴더 추가</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.folderPickerCancel}
              onPress={() => setShowFolderPicker(false)}
            >
              <Text style={styles.folderPickerCancelText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {showCreateFolder && (
        <View style={styles.folderPickerOverlay}>
          <TouchableOpacity
            style={styles.folderPickerBackdrop}
            onPress={() => setShowCreateFolder(false)}
          />
          <View style={styles.folderPickerContainer}>
            <Text style={styles.folderPickerTitle}>새 폴더 만들기</Text>

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
                    selectedColor === color && styles.colorOptionSelected,
                  ]}
                  onPress={() => setSelectedColor(color)}
                >
                  {selectedColor === color && (
                    <Text style={styles.colorOptionCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.createFolderButton}
              onPress={handleCreateFolder}
            >
              <Text style={styles.createFolderButtonText}>폴더 생성</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.folderPickerCancel}
              onPress={() => {
                setShowCreateFolder(false);
                setNewFolderName("");
                setSelectedColor("#1B5E3C");
              }}
            >
              <Text style={styles.folderPickerCancelText}>취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {showAIMenu && (
        <View style={styles.folderPickerOverlay}>
          <TouchableOpacity
            style={styles.folderPickerBackdrop}
            onPress={() => setShowAIMenu(false)}
          />
          <View style={styles.aiMenuContainer}>
            <Text style={styles.aiMenuTitle}>AI 도우미</Text>
            <Text style={styles.aiMenuSubtitle}>AI가 메모 작성을 도와드립니다</Text>

            <TouchableOpacity
              style={styles.aiMenuItem}
              onPress={handleAIGenerateTitle}
            >
              <Text style={styles.aiMenuIcon}>✨</Text>
              <View style={styles.aiMenuTextContainer}>
                <Text style={styles.aiMenuItemTitle}>제목 자동 생성</Text>
                <Text style={styles.aiMenuItemDesc}>내용을 바탕으로 적절한 제목을 추천합니다</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.aiMenuItem}
              onPress={handleAISummarize}
            >
              <Text style={styles.aiMenuIcon}>📝</Text>
              <View style={styles.aiMenuTextContainer}>
                <Text style={styles.aiMenuItemTitle}>내용 요약</Text>
                <Text style={styles.aiMenuItemDesc}>긴 내용을 핵심만 간추려 요약합니다</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.aiMenuItem}
              onPress={handleAIExpand}
            >
              <Text style={styles.aiMenuIcon}>📖</Text>
              <View style={styles.aiMenuTextContainer}>
                <Text style={styles.aiMenuItemTitle}>내용 확장</Text>
                <Text style={styles.aiMenuItemDesc}>간단한 메모를 더 자세하게 확장합니다</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.folderPickerCancel}
              onPress={() => setShowAIMenu(false)}
            >
              <Text style={styles.folderPickerCancelText}>닫기</Text>
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
    minHeight: 200,
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
  folderSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  folderColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  folderText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  folderArrow: {
    fontSize: 10,
    color: "#999",
  },
  dateSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  dateLabelText: {
    fontSize: 14,
    color: "#666",
    marginRight: 12,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  datePickerContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  calendarStyle: {
    borderRadius: 8,
    marginBottom: 12,
  },
  dayContainer: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  selectedDay: {
    backgroundColor: "#1B5E3C",
  },
  dayText: {
    fontSize: 14,
    color: "#333",
  },
  disabledDayText: {
    color: "#d9e1e8",
  },
  holidayText: {
    color: "#F44336",
  },
  saturdayText: {
    color: "#2563EB",
  },
  selectedDayText: {
    color: "#FFFFFF",
  },
  todayButton: {
    backgroundColor: "#1B5E3C",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  todayButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  folderPickerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  folderPickerBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  folderPickerContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    width: "80%",
    maxHeight: "70%",
  },
  folderPickerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  folderPickerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#F5F5F0",
  },
  folderPickerColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  folderPickerText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  folderPickerCheck: {
    fontSize: 18,
    color: "#1B5E3C",
    fontWeight: "600",
  },
  folderPickerCancel: {
    marginTop: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  folderPickerCancelText: {
    fontSize: 16,
    color: "#666",
  },
  folderPickerAddButton: {
    backgroundColor: "#1B5E3C",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
    alignItems: "center",
  },
  folderPickerAddText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  folderNameInput: {
    backgroundColor: "#F5F5F0",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#333",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  colorPickerLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
    marginBottom: 12,
  },
  colorPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  colorOptionSelected: {
    borderColor: "#000",
    borderWidth: 3,
  },
  colorOptionCheck: {
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  createFolderButton: {
    backgroundColor: "#1B5E3C",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  createFolderButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  headerRightContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  saveStatusText: {
    fontSize: 12,
    color: "#999",
    marginRight: 8,
  },
  checklistSection: {
    marginTop: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  checklistTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  checklistItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  checkboxContainer: {
    padding: 4,
  },
  checkboxIcon: {
    fontSize: 20,
    color: "#1B5E3C",
  },
  checklistItemText: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    marginLeft: 8,
  },
  checklistItemChecked: {
    textDecorationLine: "line-through",
    color: "#999",
  },
  deleteCheckButton: {
    padding: 8,
  },
  deleteCheckIcon: {
    fontSize: 20,
    color: "#999",
    fontWeight: "600",
  },
  addChecklistContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  addChecklistInput: {
    flex: 1,
    backgroundColor: "#F5F5F0",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#333",
  },
  addChecklistButton: {
    backgroundColor: "#1B5E3C",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  addChecklistButtonText: {
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  linkSection: {
    marginTop: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  linkSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  linkItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
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
    color: "#333",
    marginBottom: 2,
  },
  linkUrl: {
    fontSize: 12,
    color: "#666",
  },
  deleteLinkButton: {
    padding: 8,
  },
  deleteLinkIcon: {
    fontSize: 20,
    color: "#999",
    fontWeight: "600",
  },
  addLinkButton: {
    backgroundColor: "#F5F5F0",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  addLinkButtonText: {
    fontSize: 14,
    color: "#1B5E3C",
    fontWeight: "500",
  },
  linkInputContainer: {
    marginTop: 8,
  },
  linkUrlInput: {
    backgroundColor: "#F5F5F0",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
  },
  linkTitleInput: {
    backgroundColor: "#F5F5F0",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#333",
    marginBottom: 12,
  },
  linkInputButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  linkCancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: "#E0E0E0",
  },
  linkCancelButtonText: {
    fontSize: 14,
    color: "#666",
  },
  linkAddConfirmButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: "#1B5E3C",
  },
  linkAddConfirmButtonText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  imageSection: {
    marginTop: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginBottom: 20,
  },
  imageSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  imageScrollView: {
    marginBottom: 12,
  },
  imageContainer: {
    position: "relative",
    marginRight: 12,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  deleteImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#F44336",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteImageIcon: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  imageButtonsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  imageButton: {
    flex: 1,
    backgroundColor: "#F5F5F0",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  imageButtonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  imageButtonText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  formatToolbar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    gap: 8,
  },
  formatButton: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: "#F5F5F0",
    justifyContent: "center",
    alignItems: "center",
  },
  formatButtonTextBold: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  formatButtonTextItalic: {
    fontSize: 18,
    fontStyle: "italic",
    color: "#333",
  },
  formatButtonTextStrike: {
    fontSize: 18,
    textDecorationLine: "line-through",
    color: "#333",
  },
  formatButtonTextCode: {
    fontSize: 14,
    fontFamily: "monospace",
    color: "#333",
  },
  formatDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 4,
  },
  aiButton: {
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 12,
    width: "auto",
  },
  aiButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  aiMenuContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    width: "85%",
    maxHeight: "70%",
  },
  aiMenuTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
    marginBottom: 4,
  },
  aiMenuSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  aiMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F0",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  aiMenuIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  aiMenuTextContainer: {
    flex: 1,
  },
  aiMenuItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  aiMenuItemDesc: {
    fontSize: 13,
    color: "#666",
  },
});
