import { useEffect, useState } from 'react';
import { themes, applyTheme, type Theme } from '../themes/themeConfig';
import { useSessionState } from './useSessionState';

export function useTheme() {
  const [currentThemeId, setCurrentThemeId] = useSessionState<string>('ui:theme', 'default');
  const [isDarkMode, setIsDarkMode] = useSessionState<boolean>('ui:dark', false);
  
  const currentTheme = themes.find(theme => theme.id === currentThemeId) || themes[0];
  
  // Apply theme when theme or dark mode changes
  useEffect(() => {
    applyTheme(currentTheme, isDarkMode);
    // Set theme data attribute for CSS selectors
    document.documentElement.setAttribute('data-theme', currentThemeId);
  }, [currentTheme, isDarkMode, currentThemeId]);
  
  // Apply dark mode to body
  useEffect(() => {
    document.body.setAttribute('data-bs-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);
  
  const changeTheme = (themeId: string) => {
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
    themes
  };
}
