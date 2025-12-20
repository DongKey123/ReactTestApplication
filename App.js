// Import StatusBar component from expo-status-bar (controls status bar styling)
import { StatusBar } from 'expo-status-bar';

// Import core React Native components
// - StyleSheet: Object for defining styles
// - Text: Component for displaying text (similar to HTML's <p>, <span>)
// - View: Container component (similar to HTML's <div>)
import { StyleSheet, Text, View } from 'react-native';

// Main App component - entry point of the app
// export default: Exports this component so it can be imported in other files
export default function App() {
  // Return JSX (JavaScript + XML)
  return (
    // View: Top-level container - applies styles.container styling
    <View style={styles.container}>
      {/* Text: Displays text on screen - In React Native, text must always be wrapped in Text component */}
      <Text>Open up App.js to start working on your app!</Text>

      {/* StatusBar: Controls status bar style (area showing time, battery, etc.) */}
      <StatusBar style="auto" />
    </View>
  );
}

// StyleSheet.create(): Creates a style object
// Similar to CSS but written as JavaScript object
const styles = StyleSheet.create({
  // container: Styles applied to View component
  container: {
    flex: 1,              // flex: 1 - Takes up all available space
    backgroundColor: '#fff', // Background color: white
    alignItems: 'center',    // Horizontal center alignment (same as CSS align-items)
    justifyContent: 'center', // Vertical center alignment (same as CSS justify-content)
  },
});
