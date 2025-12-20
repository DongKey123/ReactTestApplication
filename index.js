// Import registerRootComponent function from expo
// This function registers the root (top-level) component of the app
import { registerRootComponent } from 'expo';

// Import the App component created in App.js
import App from './App';

// registerRootComponent: Sets up the app's entry point
// - Internally calls AppRegistry.registerComponent('main', () => App)
// - Ensures the app runs properly in both Expo Go and native builds
// - This file is executed first when the app starts
registerRootComponent(App);
