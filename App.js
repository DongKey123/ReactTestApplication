// Import StatusBar component from expo-status-bar (controls status bar styling)
import { StatusBar } from 'expo-status-bar';

// Import React Navigation components
// - NavigationContainer: Wrapper component that manages navigation state
// - createBottomTabNavigator: Function to create bottom tab navigation
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Import screen components
import HomeScreen from './screens/HomeScreen';
import SearchScreen from './screens/SearchScreen';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';

// Create bottom tab navigator
// Tab: Object containing Screen component and Navigator component
const Tab = createBottomTabNavigator();

// Main App component - entry point of the app
// export default: Exports this component so it can be imported in other files
export default function App() {
  return (
    // NavigationContainer: Root component for navigation
    // Must wrap all navigators
    <NavigationContainer>
      {/* Tab.Navigator: Creates bottom tab navigation bar */}
      <Tab.Navigator
        screenOptions={{
          // Tab bar styling options
          tabBarActiveTintColor: 'blue',      // Color of active tab icon/label
          tabBarInactiveTintColor: 'gray',    // Color of inactive tab icon/label
          headerStyle: {
            backgroundColor: '#f4511e',       // Header background color
          },
          headerTintColor: '#fff',            // Header text color
          headerTitleStyle: {
            fontWeight: 'bold',               // Header text style
          },
        }}
      >
        {/* Tab.Screen: Individual tab screen */}
        {/* name: Tab identifier, component: Screen component to display */}
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            // Tab configuration options
            tabBarLabel: 'Home',              // Label shown in tab bar
            headerTitle: 'Home',              // Title shown in header
          }}
        />
        <Tab.Screen
          name="Search"
          component={SearchScreen}
          options={{
            tabBarLabel: 'Search',
            headerTitle: 'Search',
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarLabel: 'Profile',
            headerTitle: 'Profile',
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarLabel: 'Settings',
            headerTitle: 'Settings',
          }}
        />
      </Tab.Navigator>

      {/* StatusBar: Controls status bar style (area showing time, battery, etc.) */}
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}
