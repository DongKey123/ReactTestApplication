import { StyleSheet, Text, View, TouchableOpacity, Switch, ScrollView, Alert, Modal } from "react-native";
import { useState } from "react";
import { useMemos } from "../context/MemoContext";
import { useTheme } from "../context/ThemeContext";

const PRIVACY_POLICY = `개인정보처리방침

1. 수집하는 정보
MemoAI은 외부 서버에 어떠한 개인정보도 전송하지 않습니다. 모든 메모 데이터는 사용자 기기 내 로컬 저장소에만 저장됩니다.

2. 권한 사용
• 카메라: 메모에 사진 첨부 시에만 사용
• 사진 라이브러리: 메모에 이미지 첨부 시에만 사용

모든 권한은 해당 기능 사용 시에만 요청되며, 외부로 전송되지 않습니다.

3. 제3자 제공
수집된 정보를 제3자에게 제공하지 않습니다.

4. 데이터 삭제
앱을 삭제하면 모든 데이터가 기기에서 완전히 삭제됩니다.

최종 업데이트: 2026년 3월`;

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

function InfoModal({ visible, title, onClose, theme, children }) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.card }]}>
          <Text style={[styles.modalTitle, { color: theme.text }]}>{title}</Text>
          <ScrollView style={styles.modalScroll}>
            {children}
          </ScrollView>
          <TouchableOpacity
            style={[styles.modalCloseButton, { backgroundColor: theme.primary }]}
            onPress={onClose}
          >
            <Text style={styles.modalCloseText}>닫기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function ProfileScreen() {
  const { memos, folders } = useMemos();
  const { isDarkMode, toggleTheme, theme } = useTheme();
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showAppInfo, setShowAppInfo] = useState(false);

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

  const handleComingSoon = (featureName) => {
    Alert.alert("준비 중", `${featureName} 기능은 추후 업데이트에서 제공될 예정입니다.`);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.profileSection}>
        <View style={[styles.avatar, { backgroundColor: theme.border }]}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
        <Text style={[styles.userName, { color: theme.text }]}>MemoAI 사용자</Text>
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
        <MenuItem
          icon="🔔"
          label="알림 설정"
          theme={theme}
          onPress={() => handleComingSoon("알림 설정")}
        />
        <MenuItem
          icon="☁️"
          label="동기화 설정"
          theme={theme}
          onPress={() => handleComingSoon("동기화 설정")}
        />
      </View>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <View style={styles.menuSection}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>정보</Text>
        <MenuItem
          icon="❓"
          label="도움말"
          theme={theme}
          onPress={() => handleComingSoon("도움말")}
        />
        <MenuItem
          icon="🔒"
          label="개인정보처리방침"
          theme={theme}
          onPress={() => setShowPrivacy(true)}
        />
        <MenuItem
          icon="ℹ️"
          label="앱 정보"
          theme={theme}
          onPress={() => setShowAppInfo(true)}
        />
      </View>

      <View style={styles.versionSection}>
        <Text style={[styles.versionText, { color: theme.textMuted }]}>MemoAI v1.0.0</Text>
      </View>

      {/* 개인정보처리방침 Modal */}
      <InfoModal
        visible={showPrivacy}
        title="개인정보처리방침"
        onClose={() => setShowPrivacy(false)}
        theme={theme}
      >
        <Text style={[styles.modalBody, { color: theme.text }]}>{PRIVACY_POLICY}</Text>
      </InfoModal>

      {/* 앱 정보 Modal */}
      <InfoModal
        visible={showAppInfo}
        title="앱 정보"
        onClose={() => setShowAppInfo(false)}
        theme={theme}
      >
        <View style={styles.appInfoContent}>
          <Text style={[styles.appInfoName, { color: theme.text }]}>MemoAI</Text>
          <Text style={[styles.appInfoVersion, { color: theme.textSecondary }]}>버전 1.0.0</Text>
          <Text style={[styles.appInfoDesc, { color: theme.text }]}>
            간편하고 빠른 메모 앱{"\n\n"}
            모든 데이터는 기기 내에만 저장되며{"\n"}
            외부로 전송되지 않습니다.
          </Text>
        </View>
      </InfoModal>
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
  // Modal 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  modalScroll: {
    maxHeight: 400,
  },
  modalBody: {
    fontSize: 14,
    lineHeight: 22,
  },
  modalCloseButton: {
    marginTop: 20,
    alignItems: "center",
    padding: 14,
    borderRadius: 10,
  },
  modalCloseText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  appInfoContent: {
    alignItems: "center",
    paddingVertical: 16,
  },
  appInfoName: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  appInfoVersion: {
    fontSize: 14,
    marginBottom: 24,
  },
  appInfoDesc: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
  },
});
