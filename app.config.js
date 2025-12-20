// Expo app configuration file
// Using app.config.js instead of app.json allows adding comments and dynamic configuration
// Expo reads app.config.js with priority

export default {
  expo: {
    // App name - displayed in app stores and on devices
    name: "ReactTestApplication",

    // slug - URL-friendly name that identifies the app in Expo services
    // Example: exp://exp.host/@username/ReactTestApplication
    slug: "ReactTestApplication",

    // App version - version number displayed in app stores
    version: "1.0.0",

    // Screen orientation setting
    // "portrait": portrait mode only, "landscape": landscape mode only, "default": allows both
    orientation: "portrait",

    // App icon path - icon displayed on home screen (1024x1024 recommended)
    icon: "./assets/icon.png",

    // User interface style
    // "light": light mode, "dark": dark mode, "automatic": follows system settings
    userInterfaceStyle: "light",

    // Enable React Native's new architecture
    // true: uses the new architecture with improved performance
    newArchEnabled: true,

    // Splash screen configuration - screen shown while app is loading
    splash: {
      // Splash image path
      image: "./assets/splash-icon.png",

      // Image resize mode
      // "contain": maintains aspect ratio and fits to screen, "cover": fills the screen
      resizeMode: "contain",

      // Splash screen background color
      backgroundColor: "#ffffff"
    },

    // iOS platform-specific settings
    ios: {
      // iPad support
      supportsTablet: true
    },

    // Android platform-specific settings
    android: {
      // Android adaptive icon configuration (Android 8.0+)
      // Icon shape changes to match different device themes
      adaptiveIcon: {
        // Foreground image (actual icon image)
        foregroundImage: "./assets/adaptive-icon.png",

        // Background color
        backgroundColor: "#ffffff"
      },

      // Enable Edge-to-Edge mode - extends content into status bar/navigation bar areas
      edgeToEdgeEnabled: true
    },

    // Web platform-specific settings (when running with Expo web)
    web: {
      // Favicon displayed in browser tab
      favicon: "./assets/favicon.png"
    }
  }
};
