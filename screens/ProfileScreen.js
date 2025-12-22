// Import React Native components
import { StyleSheet, Text, View } from 'react-native';

// ProfileScreen component - displayed when Profile tab is active
export default function ProfileScreen() {
  return (
    // Container view with centered content
    <View style={styles.container}>
      {/* Display screen title */}
      <Text style={styles.title}>Profile Screen</Text>
      <Text style={styles.subtitle}>View and edit your profile</Text>
    </View>
  );
}

// Styles for ProfileScreen component
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
