// Import React Native components
import { StyleSheet, Text, View } from 'react-native';

// HomeScreen component - displayed when Home tab is active
export default function HomeScreen() {
  return (
    // Container view with centered content
    <View style={styles.container}>
      {/* Display screen title */}
      <Text style={styles.title}>Home Screen</Text>
      <Text style={styles.subtitle}>Welcome to the Home tab!</Text>
    </View>
  );
}

// Styles for HomeScreen component
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
