export interface ThemeColors {
  // Light mode colors
  light: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    danger: string;
    info: string;
  };
  // Dark mode colors
  dark: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    danger: string;
    info: string;
  };
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  levelRequired: number;
  colors: ThemeColors;
  preview: string;
}

export const themes: Theme[] = [
  {
    id: 'default',
    name: 'Classic',
    description: 'The original warm design',
    levelRequired: 1,
    colors: {
      light: {
        primary: '#8B7D6B',
        secondary: '#A8967A',
        accent: '#D4C4A8',
        background: '#FEF7E8',
        surface: '#F9EED7',
        text: '#6A6258',
        textSecondary: '#7A7268',
        border: '#D4C4A8',
        success: '#28a745',
        warning: '#ffc107',
        danger: '#dc3545',
        info: '#17a2b8'
      },
      dark: {
        primary: '#D4C4A8',
        secondary: '#A8967A',
        accent: '#8B7D6B',
        background: '#2A2520',
        surface: '#3A342E',
        text: '#FEF7E8',
        textSecondary: '#E8E5E0',
        border: '#4A433C',
        success: '#28a745',
        warning: '#ffc107',
        danger: '#dc3545',
        info: '#17a2b8'
      }
    },
    preview: '🎨'
  },
  {
    id: 'ocean',
    name: 'Ocean Depths',
    description: 'Deep blue waters and coral accents',
    levelRequired: 5,
    colors: {
      light: {
        primary: '#0066cc',
        secondary: '#4a90e2',
        accent: '#ff6b6b',
        background: '#e8f4fd',
        surface: '#d1e7f5',
        text: '#1a365d',
        textSecondary: '#2d3748',
        border: '#4a90e2',
        success: '#38a169',
        warning: '#ed8936',
        danger: '#e53e3e',
        info: '#3182ce'
      },
      dark: {
        primary: '#4a90e2',
        secondary: '#0066cc',
        accent: '#ff6b6b',
        background: '#0a1929',
        surface: '#1a2332',
        text: '#e2e8f0',
        textSecondary: '#cbd5e0',
        border: '#2d3748',
        success: '#48bb78',
        warning: '#f6ad55',
        danger: '#fc8181',
        info: '#63b3ed'
      }
    },
    preview: '🌊'
  },
  {
    id: 'forest',
    name: 'Forest Guardian',
    description: 'Rich greens and earth tones',
    levelRequired: 10,
    colors: {
      light: {
        primary: '#2d5016',
        secondary: '#4a7c59',
        accent: '#8b4513',
        background: '#f0f8e8',
        surface: '#e6f3d6',
        text: '#1a202c',
        textSecondary: '#2d3748',
        border: '#4a7c59',
        success: '#38a169',
        warning: '#d69e2e',
        danger: '#e53e3e',
        info: '#3182ce'
      },
      dark: {
        primary: '#68d391',
        secondary: '#4a7c59',
        accent: '#8b4513',
        background: '#0f1419',
        surface: '#1a202c',
        text: '#e2e8f0',
        textSecondary: '#cbd5e0',
        border: '#2d3748',
        success: '#48bb78',
        warning: '#f6ad55',
        danger: '#fc8181',
        info: '#63b3ed'
      }
    },
    preview: '🌲'
  },
  {
    id: 'sunset',
    name: 'Sunset Dreams',
    description: 'Warm oranges and purples',
    levelRequired: 15,
    colors: {
      light: {
        primary: '#ff6b35',
        secondary: '#f7931e',
        accent: '#8e44ad',
        background: '#fff5e6',
        surface: '#ffe8cc',
        text: '#2d1b69',
        textSecondary: '#4a5568',
        border: '#f7931e',
        success: '#38a169',
        warning: '#ed8936',
        danger: '#e53e3e',
        info: '#3182ce'
      },
      dark: {
        primary: '#ff8c42',
        secondary: '#f7931e',
        accent: '#8e44ad',
        background: '#1a0d2e',
        surface: '#2d1b69',
        text: '#f7fafc',
        textSecondary: '#e2e8f0',
        border: '#4a5568',
        success: '#48bb78',
        warning: '#f6ad55',
        danger: '#fc8181',
        info: '#63b3ed'
      }
    },
    preview: '🌅'
  },
  {
    id: 'cosmic',
    name: 'Cosmic Explorer',
    description: 'Deep space and nebula colors',
    levelRequired: 20,
    colors: {
      light: {
        primary: '#6a0572',
        secondary: '#a8e6cf',
        accent: '#ffd93d',
        background: '#f8f0ff',
        surface: '#e6d7ff',
        text: '#2d1b69',
        textSecondary: '#4a5568',
        border: '#a8e6cf',
        success: '#38a169',
        warning: '#ed8936',
        danger: '#e53e3e',
        info: '#3182ce'
      },
      dark: {
        primary: '#a8e6cf',
        secondary: '#6a0572',
        accent: '#ffd93d',
        background: '#0a0a1a',
        surface: '#1a1a2e',
        text: '#e2e8f0',
        textSecondary: '#cbd5e0',
        border: '#2d3748',
        success: '#48bb78',
        warning: '#f6ad55',
        danger: '#fc8181',
        info: '#63b3ed'
      }
    },
    preview: '🌌'
  },
  {
    id: 'royal',
    name: 'Royal Purple',
    description: 'Luxurious purples and golds',
    levelRequired: 25,
    colors: {
      light: {
        primary: '#4b0082',
        secondary: '#9370db',
        accent: '#ffd700',
        background: '#f8f0ff',
        surface: '#e6d7ff',
        text: '#2d1b69',
        textSecondary: '#4a5568',
        border: '#9370db',
        success: '#38a169',
        warning: '#ed8936',
        danger: '#e53e3e',
        info: '#3182ce'
      },
      dark: {
        primary: '#ffd700',
        secondary: '#9370db',
        accent: '#4b0082',
        background: '#1a0d2e',
        surface: '#2d1b69',
        text: '#f7fafc',
        textSecondary: '#e2e8f0',
        border: '#4a5568',
        success: '#48bb78',
        warning: '#f6ad55',
        danger: '#fc8181',
        info: '#63b3ed'
      }
    },
    preview: '👑'
  }
];

export function applyTheme(theme: Theme, isDarkMode: boolean) {
  const root = document.documentElement;
  const colors = isDarkMode ? theme.colors.dark : theme.colors.light;
  
  // Apply CSS custom properties
  root.style.setProperty('--color-primary', colors.primary);
  root.style.setProperty('--color-secondary', colors.secondary);
  root.style.setProperty('--color-accent', colors.accent);
  root.style.setProperty('--color-bg-primary', colors.background);
  root.style.setProperty('--color-bg-secondary', colors.surface);
  root.style.setProperty('--color-text-primary', colors.text);
  root.style.setProperty('--color-text-secondary', colors.textSecondary);
  root.style.setProperty('--color-border', colors.border);
  root.style.setProperty('--color-success', colors.success);
  root.style.setProperty('--color-warning', colors.warning);
  root.style.setProperty('--color-danger', colors.danger);
  root.style.setProperty('--color-info', colors.info);
  
  // Apply Bootstrap variables
  root.style.setProperty('--bs-primary', colors.primary);
  root.style.setProperty('--bs-secondary', colors.secondary);
  root.style.setProperty('--bs-success', colors.success);
  root.style.setProperty('--bs-warning', colors.warning);
  root.style.setProperty('--bs-danger', colors.danger);
  root.style.setProperty('--bs-info', colors.info);
}
