import {
  StyleSheet,
  View,
  TextInput,
  Alert,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useState, useLayoutEffect } from "react";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { useMemos } from "../context/MemoContext";
import { isHoliday, getHolidayName } from "../data/holidays";

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

export default function CreateScreen({ navigation }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("default");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [showFolderPicker, setShowFolderPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedColor, setSelectedColor] = useState("#1B5E3C");
  const { addMemo, folders, addFolder } = useMemos();

  const colors = [
    "#1B5E3C", "#2563EB", "#DC2626", "#F59E0B",
    "#8B5CF6", "#EC4899", "#10B981", "#F97316"
  ];

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert("알림", "제목을 입력해주세요.");
      return;
    }

    // 선택한 날짜로 메모 저장 (시간은 현재 시간 사용)
    const now = new Date();
    const memoDateTime = new Date(selectedDate);
    memoDateTime.setHours(now.getHours(), now.getMinutes(), now.getSeconds());

    addMemo(title.trim(), content.trim(), selectedFolder, memoDateTime.toISOString());
    setTitle("");
    setContent("");
    setSelectedFolder("default");
    setSelectedDate(new Date().toISOString().split("T")[0]);
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
});
