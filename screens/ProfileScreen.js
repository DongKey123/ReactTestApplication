import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

function MenuItem({ icon, label }) {
  return (
    <TouchableOpacity style={styles.menuItem}>
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={styles.menuLabel}>{label}</Text>
      <Text style={styles.menuArrow}>{'>'}</Text>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
        <Text style={styles.userName}>사용자 이름</Text>
        <Text style={styles.userEmail}>user@email.com</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.menuSection}>
        <MenuItem icon="📊" label="내 통계" />
        <MenuItem icon="🔔" label="알림 설정" />
        <MenuItem icon="🎨" label="테마 설정" />
        <MenuItem icon="☁️" label="동기화 설정" />
        <MenuItem icon="❓" label="도움말" />
        <MenuItem icon="ℹ️" label="앱 정보" />
      </View>

      <View style={styles.divider} />

      <TouchableOpacity style={styles.logoutBtn}>
        <Text style={styles.logoutIcon}>🚪</Text>
        <Text style={styles.logoutText}>로그아웃</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F0',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 16,
  },
  menuSection: {
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  menuArrow: {
    fontSize: 16,
    color: '#999',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  logoutText: {
    fontSize: 16,
    color: '#F44336',
  },
});
