import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { useMemos } from "../context/MemoContext";
import {
  isHoliday,
  getHolidayName,
  getCurrentYearHolidayMarkers,
} from "../data/holidays";

// 체크리스트 토글 함수를 받는 MemoCard
function MemoCard({ item, onPress, onToggleCheck }) {
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffDays === 1) {
      return "어제";
    } else {
      return date.toLocaleDateString("ko-KR", {
        month: "long",
        day: "numeric",
      });
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardContent} numberOfLines={2}>
        {item.content}
      </Text>
      {item.checklist && item.checklist.length > 0 && (
        <View style={styles.checklistContainer}>
          {item.checklist.slice(0, 3).map((check) => (
            <TouchableOpacity
              key={check.id}
              style={styles.checkItem}
              onPress={(e) => {
                e.stopPropagation();
                onToggleCheck(item.id, check.id);
              }}
            >
              <Text style={styles.checkbox}>{check.checked ? "☑" : "☐"}</Text>
              <Text
                style={[styles.checkText, check.checked && styles.checkedText]}
                numberOfLines={1}
              >
                {check.text}
              </Text>
            </TouchableOpacity>
          ))}
          {item.checklist.length > 3 && (
            <Text style={styles.moreChecklist}>
              +{item.checklist.length - 3}개 더보기
            </Text>
          )}
        </View>
      )}
      <Text style={styles.timestamp}>{formatTime(item.createdAt)}</Text>
    </TouchableOpacity>
  );
}

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

export default function HomeScreen({ navigation }) {
  const { memos, updateMemo } = useMemos();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const handleMemoPress = (memo) => {
    navigation.navigate("MemoDetail", { memo });
  };

  const handleToggleCheck = (memoId, checkId) => {
    const memo = memos.find((m) => m.id === memoId);
    if (!memo || !memo.checklist) return;

    const updatedChecklist = memo.checklist.map((item) =>
      item.id === checkId ? { ...item, checked: !item.checked } : item
    );

    updateMemo(
      memo.id,
      memo.title,
      memo.content,
      memo.folderId,
      memo.createdAt,
      updatedChecklist
    );
  };

  // 선택된 날짜의 메모 필터링
  const filteredMemos = memos.filter((memo) => {
    const memoDate = new Date(memo.createdAt).toISOString().split("T")[0];
    return memoDate === selectedDate;
  });

  // 달력에 표시할 마커 생성 (공휴일 + 선택된 날짜)
  const getMarkedDates = () => {
    const marked = { ...getCurrentYearHolidayMarkers() };

    // 메모가 있는 날짜 표시
    memos.forEach((memo) => {
      const memoDate = new Date(memo.createdAt).toISOString().split("T")[0];
      if (marked[memoDate]) {
        marked[memoDate] = {
          ...marked[memoDate],
          dots: [
            { color: "#F44336" }, // 공휴일
            { color: "#1B5E3C" }, // 메모
          ],
        };
      } else {
        marked[memoDate] = {
          marked: true,
          dotColor: "#1B5E3C",
        };
      }
    });

    // 선택된 날짜 표시
    if (marked[selectedDate]) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: "#1B5E3C",
      };
    } else {
      marked[selectedDate] = {
        selected: true,
        selectedColor: "#1B5E3C",
      };
    }

    return marked;
  };

  const holidayName = getHolidayName(selectedDate);

  const renderHeader = () => (
    <View>
      <Calendar
        style={styles.calendar}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={getMarkedDates()}
        theme={{
          backgroundColor: "#FFFFFF",
          calendarBackground: "#FFFFFF",
          textSectionTitleColor: "#666",
          selectedDayBackgroundColor: "#1B5E3C",
          selectedDayTextColor: "#FFFFFF",
          todayTextColor: "#1B5E3C",
          dayTextColor: "#333",
          textDisabledColor: "#d9e1e8",
          arrowColor: "#1B5E3C",
          monthTextColor: "#333",
          textMonthFontWeight: "600",
          textDayFontSize: 14,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 12,
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
              onPress={() => setSelectedDate(date.dateString)}
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
              {marking?.marked && (
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: marking.dotColor || "#1B5E3C" },
                  ]}
                />
              )}
            </TouchableOpacity>
          );
        }}
      />
      <View style={styles.dateHeader}>
        <Text style={styles.selectedDateText}>
          {new Date(selectedDate).toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "long",
          })}
        </Text>
        {holidayName && (
          <Text style={styles.holidayBadge}>{holidayName}</Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredMemos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MemoCard
            item={item}
            onPress={() => handleMemoPress(item)}
            onToggleCheck={handleToggleCheck}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {holidayName
                ? `${holidayName}입니다`
                : "이 날짜에 메모가 없습니다"}
            </Text>
            <Text style={styles.emptySubText}>새 메모를 작성해보세요</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F0",
  },
  calendar: {
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
  dateHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  holidayBadge: {
    marginLeft: 8,
    backgroundColor: "#F44336",
    color: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: "500",
    overflow: "hidden",
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: "#999",
  },
  listContent: {
    paddingBottom: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  cardContent: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 8,
  },
  checklistContainer: {
    marginBottom: 8,
  },
  checkItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  checkbox: {
    fontSize: 16,
    color: "#1B5E3C",
    marginRight: 8,
  },
  checkText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  checkedText: {
    textDecorationLine: "line-through",
    color: "#999",
  },
  moreChecklist: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
  },
});
