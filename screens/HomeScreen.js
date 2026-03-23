import { useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Animated,
  Alert,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { useMemos } from "../context/MemoContext";
import {
  isHoliday,
  getHolidayName,
  getCurrentYearHolidayMarkers,
} from "../data/holidays";

// 스와이프 가능한 MemoCard
function MemoCard({ item, onPress, onToggleCheck, onToggleBookmark, onDelete }) {
  const swipeableRef = useRef(null);

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

  // 왼쪽 스와이프 액션 (북마크)
  const renderLeftActions = (progress, dragX) => {
    const scale = dragX.interpolate({
      inputRange: [0, 80],
      outputRange: [0.5, 1],
      extrapolate: "clamp",
    });

    return (
      <TouchableOpacity
        style={styles.swipeActionLeft}
        onPress={() => {
          onToggleBookmark(item.id);
          swipeableRef.current?.close();
        }}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <Text style={styles.swipeActionIcon}>
            {item.bookmarked ? "📑" : "🔖"}
          </Text>
          <Text style={styles.swipeActionText}>
            {item.bookmarked ? "해제" : "북마크"}
          </Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  // 오른쪽 스와이프 액션 (삭제)
  const renderRightActions = (progress, dragX) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0.5],
      extrapolate: "clamp",
    });

    return (
      <TouchableOpacity
        style={styles.swipeActionRight}
        onPress={() => {
          Alert.alert("메모 삭제", "이 메모를 삭제하시겠습니까?", [
            { text: "취소", style: "cancel", onPress: () => swipeableRef.current?.close() },
            {
              text: "삭제",
              style: "destructive",
              onPress: () => onDelete(item.id),
            },
          ]);
        }}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <Text style={styles.swipeActionIcon}>🗑️</Text>
          <Text style={styles.swipeActionTextDelete}>삭제</Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      overshootLeft={false}
      overshootRight={false}
      friction={2}
    >
      <TouchableOpacity style={styles.card} onPress={onPress}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          <TouchableOpacity
            style={styles.bookmarkButton}
            onPress={(e) => {
              e.stopPropagation();
              onToggleBookmark(item.id);
            }}
          >
            <Text style={styles.bookmarkIcon}>
              {item.bookmarked ? "🔖" : "📑"}
            </Text>
          </TouchableOpacity>
        </View>
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
    </Swipeable>
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
  const { memos, updateMemo, toggleBookmark, getBookmarkedMemos, deleteMemo } = useMemos();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);

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
      updatedChecklist,
      memo.links,
      memo.images
    );
  };

  // 선택된 날짜의 메모 필터링 (북마크 필터 적용)
  const filteredMemos = memos.filter((memo) => {
    if (showBookmarkedOnly) {
      return memo.bookmarked;
    }
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
        <View style={styles.dateHeaderLeft}>
          <Text style={styles.selectedDateText}>
            {showBookmarkedOnly ? "북마크된 메모" : new Date(selectedDate).toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "long",
            })}
          </Text>
          {holidayName && !showBookmarkedOnly && (
            <Text style={styles.holidayBadge}>{holidayName}</Text>
          )}
        </View>
        <TouchableOpacity
          style={[
            styles.bookmarkFilterButton,
            showBookmarkedOnly && styles.bookmarkFilterActive,
          ]}
          onPress={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
        >
          <Text style={styles.bookmarkFilterIcon}>
            {showBookmarkedOnly ? "🔖" : "📑"}
          </Text>
        </TouchableOpacity>
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
            onToggleBookmark={toggleBookmark}
            onDelete={deleteMemo}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {showBookmarkedOnly
                ? "북마크된 메모가 없습니다"
                : holidayName
                ? `${holidayName}입니다`
                : "이 날짜에 메모가 없습니다"}
            </Text>
            <Text style={styles.emptySubText}>
              {showBookmarkedOnly
                ? "메모를 북마크해보세요"
                : "새 메모를 작성해보세요"}
            </Text>
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
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
  },
  dateHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  bookmarkFilterButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F5F5F0",
  },
  bookmarkFilterActive: {
    backgroundColor: "#1B5E3C",
  },
  bookmarkFilterIcon: {
    fontSize: 20,
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
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  bookmarkButton: {
    padding: 4,
    marginLeft: 8,
  },
  bookmarkIcon: {
    fontSize: 18,
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
  swipeActionLeft: {
    backgroundColor: "#1B5E3C",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    marginTop: 8,
    marginLeft: 16,
    borderRadius: 12,
    marginBottom: 0,
  },
  swipeActionRight: {
    backgroundColor: "#F44336",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    marginTop: 8,
    marginRight: 16,
    borderRadius: 12,
    marginBottom: 0,
  },
  swipeActionIcon: {
    fontSize: 24,
    textAlign: "center",
  },
  swipeActionText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  swipeActionTextDelete: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
});
