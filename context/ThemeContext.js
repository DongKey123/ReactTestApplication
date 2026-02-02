import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ThemeContext = createContext();

const THEME_STORAGE_KEY = "@jot_theme";

export const lightTheme = {
  background: "#F5F5F0",
  card: "#FFFFFF",
  text: "#333333",
  textSecondary: "#666666",
  textMuted: "#999999",
  primary: "#1B5E3C",
  border: "#E0E0E0",
  danger: "#F44336",
};

export const darkTheme = {
  background: "#1A1A1A",
  card: "#2D2D2D",
  text: "#FFFFFF",
  textSecondary: "#CCCCCC",
  textMuted: "#888888",
  primary: "#4CAF50",
  border: "#404040",
  danger: "#FF5252",
};

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === "dark");
      }
    } catch (error) {
      console.error("테마 불러오기 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode ? "dark" : "light");
    } catch (error) {
      console.error("테마 저장 실패:", error);
    }
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
