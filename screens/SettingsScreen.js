// Import React Native components
import { StyleSheet, Text, View } from 'react-native';

// SettingsScreen component - displayed when Settings tab is active
export default function SettingsScreen() {
  return (
    // Container view with centered content
    <View style={styles.container}>
      {/* Display screen title */}
      <Text style={styles.title}>Settings Screen</Text>
      <Text style={styles.subtitle}>Configure your preferences</Text>
    </View>
  );
}

// Styles for SettingsScreen component
const styles = StyleSheet.create({
  // Main container - takes full screen with centered content
  container: {
    flex: 1,                    // Takes all available space
    backgroundColor: '#fff',     // White background
    alignItems: 'center',        // Center horizontally
    justifyContent: 'center',    // Center vertically
  },
  // Title text style
  title: {
    fontSize: 24,               // Large font size
    fontWeight: 'bold',         // Bold text
    marginBottom: 10,           // Space below title
  },
  // Subtitle text style
  subtitle: {
    fontSize: 16,               // Medium font size
    color: '#666',              // Gray color
  },
});
