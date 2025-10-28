import { useEffect, useState } from 'react';
import { themes, applyTheme, type Theme } from '../themes/themeConfig';
import { getThemeSettings, saveThemeSettings, subscribeToThemeSettings } from '../storage';

export function useTheme() {
  const [currentThemeId, setCurrentThemeId] = useState<string>('default');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const currentTheme = themes.find(theme => theme.id === currentThemeId) || themes[0];
  
  // Load theme settings from Firebase on mount
  useEffect(() => {
    async function loadTheme() {
      try {
        const settings = await getThemeSettings();
        setCurrentThemeId(settings.themeId);
        setIsDarkMode(settings.isDarkMode);
      } catch (error) {
        console.error('Error loading theme settings:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadTheme();
    
    // Subscribe to real-time theme updates
    const unsubscribe = subscribeToThemeSettings((themeId, darkMode) => {
      setCurrentThemeId(themeId);
      setIsDarkMode(darkMode);
    });
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);
  
  // Apply theme when theme or dark mode changes
  useEffect(() => {
    if (!isLoading) {
      applyTheme(currentTheme, isDarkMode);
      // Set theme data attribute for CSS selectors
      document.documentElement.setAttribute('data-theme', currentThemeId);
    }
  }, [currentTheme, isDarkMode, currentThemeId, isLoading]);
  
  // Apply dark mode to body
  useEffect(() => {
    if (!isLoading) {
      document.body.setAttribute('data-bs-theme', isDarkMode ? 'dark' : 'light');
    }
  }, [isDarkMode, isLoading]);
  
  // Save theme settings to Firebase when they change
  useEffect(() => {
    if (!isLoading) {
      saveThemeSettings(currentThemeId, isDarkMode);
    }
  }, [currentThemeId, isDarkMode, isLoading]);
  
  const changeTheme = async (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (theme) {
      setCurrentThemeId(themeId);
    }
  };
  
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };
  
  const getAvailableThemes = (currentLevel: number) => {
    return themes.filter(theme => currentLevel >= theme.levelRequired);
  };
  
  const getLockedThemes = (currentLevel: number) => {
    return themes.filter(theme => currentLevel < theme.levelRequired);
  };
  
  return {
    currentTheme,
    currentThemeId,
    isDarkMode,
    changeTheme,
    toggleDarkMode,
    getAvailableThemes,
    getLockedThemes,
    themes,
    isLoading
  };
}
