import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from './screens/HomeScreen';
import SearchScreen from './screens/SearchScreen';
import CreateScreen from './screens/CreateScreen';
import MemoScreen from './screens/MemoScreen';
import ProfileScreen from './screens/ProfileScreen';

const Tab = createBottomTabNavigator();

// 커스텀 탭바 버튼 (중앙 + 버튼)
function CreateTabButton({ onPress }) {
  return (
    <TouchableOpacity style={styles.createButton} onPress={onPress}>
      <View style={styles.createButtonInner}>
        <Text style={styles.createButtonText}>+</Text>
      </View>
    </TouchableOpacity>
  );
}

// 탭 아이콘 컴포넌트
function TabIcon({ icon, focused }) {
  return (
    <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>
      {icon}
    </Text>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#1B5E3C',
          tabBarInactiveTintColor: '#999999',
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabBarLabel,
          headerStyle: {
            backgroundColor: '#FFFFFF',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: '#E0E0E0',
          },
          headerTintColor: '#333',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarLabel: '목록',
            headerTitle: 'Jot',
            tabBarIcon: ({ focused }) => <TabIcon icon="≡" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="Search"
          component={SearchScreen}
          options={{
            tabBarLabel: '검색',
            headerTitle: '검색',
            tabBarIcon: ({ focused }) => <TabIcon icon="🔍" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="Create"
          component={CreateScreen}
          options={{
            tabBarLabel: '',
            headerTitle: '새 메모',
            tabBarButton: (props) => <CreateTabButton {...props} />,
            headerLeft: () => (
              <Text style={styles.headerButton}>취소</Text>
            ),
            headerRight: () => (
              <Text style={styles.headerButtonPrimary}>저장</Text>
            ),
          }}
        />
        <Tab.Screen
          name="Memo"
          component={MemoScreen}
          options={{
            tabBarLabel: '메모',
            headerTitle: '메모',
            tabBarIcon: ({ focused }) => <TabIcon icon="▢" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarLabel: '프로필',
            headerTitle: '프로필',
            tabBarIcon: ({ focused }) => <TabIcon icon="👤" focused={focused} />,
          }}
        />
      </Tab.Navigator>

      <StatusBar style="dark" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 60,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  tabIcon: {
    fontSize: 20,
    color: '#999999',
  },
  tabIconActive: {
    color: '#1B5E3C',
  },
  createButton: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1B5E3C',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1B5E3C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  createButtonText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
    marginTop: -2,
  },
  headerButton: {
    fontSize: 16,
    color: '#666',
    paddingHorizontal: 16,
  },
  headerButtonPrimary: {
    fontSize: 16,
    color: '#1B5E3C',
    fontWeight: '600',
    paddingHorizontal: 16,
  },
});
