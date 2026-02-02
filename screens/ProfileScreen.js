import { StyleSheet, Text, View, TouchableOpacity, Switch, ScrollView } from "react-native";
import { useMemos } from "../context/MemoContext";
import { useTheme } from "../context/ThemeContext";

function StatCard({ value, label, theme }) {
  return (
    <View style={[styles.statCard, { backgroundColor: theme.card }]}>
      <Text style={[styles.statValue, { color: theme.primary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );
}

function MenuItem({ icon, label, onPress, rightComponent, theme }) {
  return (
    <TouchableOpacity
      style={[styles.menuItem, { backgroundColor: theme.card }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={[styles.menuLabel, { color: theme.text }]}>{label}</Text>
      {rightComponent || <Text style={[styles.menuArrow, { color: theme.textMuted }]}>{">"}</Text>}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { memos, folders } = useMemos();
  const { isDarkMode, toggleTheme, theme } = useTheme();

  // 통계 계산
  const totalMemos = memos.length;
  const bookmarkedMemos = memos.filter(m => m.bookmarked).length;

  const now = new Date();
  const thisMonth = memos.filter(m => {
    const memoDate = new Date(m.createdAt);
    return memoDate.getMonth() === now.getMonth() &&
           memoDate.getFullYear() === now.getFullYear();
  }).length;

  const totalChecklists = memos.reduce((sum, m) => sum + (m.checklist?.length || 0), 0);
  const completedChecklists = memos.reduce((sum, m) => {
    return sum + (m.checklist?.filter(c => c.checked).length || 0);
  }, 0);

  const totalLinks = memos.reduce((sum, m) => sum + (m.links?.length || 0), 0);
  const totalImages = memos.reduce((sum, m) => sum + (m.images?.length || 0), 0);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.profileSection}>
        <View style={[styles.avatar, { backgroundColor: theme.border }]}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
        <Text style={[styles.userName, { color: theme.text }]}>Jot 사용자</Text>
        <Text style={[styles.userEmail, { color: theme.textSecondary }]}>메모를 시작하세요</Text>
      </View>

      {/* 통계 섹션 */}
      <View style={styles.statsSection}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>내 통계</Text>
        <View style={styles.statsGrid}>
          <StatCard value={totalMemos} label="전체 메모" theme={theme} />
          <StatCard value={thisMonth} label="이번 달" theme={theme} />
          <StatCard value={bookmarkedMemos} label="북마크" theme={theme} />
          <StatCard value={folders.length} label="폴더" theme={theme} />
        </View>
      </View>

      {/* 세부 통계 */}
      <View style={styles.detailStatsSection}>
        <View style={[styles.detailStatRow, { backgroundColor: theme.card }]}>
          <Text style={[styles.detailStatLabel, { color: theme.text }]}>체크리스트 완료</Text>
          <Text style={[styles.detailStatValue, { color: theme.primary }]}>
            {completedChecklists} / {totalChecklists}
          </Text>
        </View>
        <View style={[styles.detailStatRow, { backgroundColor: theme.card }]}>
          <Text style={[styles.detailStatLabel, { color: theme.text }]}>첨부 링크</Text>
          <Text style={[styles.detailStatValue, { color: theme.primary }]}>{totalLinks}개</Text>
        </View>
        <View style={[styles.detailStatRow, { backgroundColor: theme.card }]}>
          <Text style={[styles.detailStatLabel, { color: theme.text }]}>첨부 이미지</Text>
          <Text style={[styles.detailStatValue, { color: theme.primary }]}>{totalImages}개</Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      {/* 설정 섹션 */}
      <View style={styles.menuSection}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>설정</Text>

        <MenuItem
          icon="🌙"
          label="다크 모드"
          theme={theme}
          rightComponent={
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: "#E0E0E0", true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          }
        />
        <MenuItem icon="🔔" label="알림 설정" theme={theme} />
        <MenuItem icon="☁️" label="동기화 설정" theme={theme} />
      </View>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <View style={styles.menuSection}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>정보</Text>
        <MenuItem icon="❓" label="도움말" theme={theme} />
        <MenuItem icon="ℹ️" label="앱 정보" theme={theme} />
      </View>

      <View style={styles.versionSection}>
        <Text style={[styles.versionText, { color: theme.textMuted }]}>Jot v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
  },
  userName: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  statsSection: {
    paddingVertical: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    gap: 8,
  },
  statCard: {
    width: "47%",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  detailStatsSection: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  detailStatRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
  },
  detailStatLabel: {
    fontSize: 15,
  },
  detailStatValue: {
    fontSize: 15,
    fontWeight: "600",
  },
  divider: {
    height: 8,
    marginVertical: 8,
  },
  menuSection: {
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
  },
  menuArrow: {
    fontSize: 16,
  },
  versionSection: {
    alignItems: "center",
    paddingVertical: 24,
  },
  versionText: {
    fontSize: 12,
  },
});
