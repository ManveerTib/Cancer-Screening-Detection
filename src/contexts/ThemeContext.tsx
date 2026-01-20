import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'ocean' | 'sunset' | 'forest' | 'midnight';

export interface ThemeConfig {
  name: string;
  displayName: string;
  icon: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
}

export const THEME_CONFIGS: Record<Theme, ThemeConfig> = {
  light: {
    name: 'light',
    displayName: 'Light',
    icon: '☀️',
    colors: {
      primary: '#0078D4',
      secondary: '#106EBE',
      accent: '#50E3C2',
      background: '#FFFFFF',
      surface: '#F5F5F5',
      text: '#1A1A1A',
    },
  },
  dark: {
    name: 'dark',
    displayName: 'Dark',
    icon: '🌙',
    colors: {
      primary: '#479EF5',
      secondary: '#70B7FF',
      accent: '#50E3C2',
      background: '#1A1A1A',
      surface: '#2D2D2D',
      text: '#FFFFFF',
    },
  },
  ocean: {
    name: 'ocean',
    displayName: 'Ocean',
    icon: '🌊',
    colors: {
      primary: '#0A7EA4',
      secondary: '#0CA4D0',
      accent: '#4DD0E1',
      background: '#E0F7FA',
      surface: '#B2EBF2',
      text: '#004D61',
    },
  },
  sunset: {
    name: 'sunset',
    displayName: 'Sunset',
    icon: '🌅',
    colors: {
      primary: '#FF6B6B',
      secondary: '#FFA07A',
      accent: '#FFD93D',
      background: '#FFF5E1',
      surface: '#FFE4CC',
      text: '#8B0000',
    },
  },
  forest: {
    name: 'forest',
    displayName: 'Forest',
    icon: '🌲',
    colors: {
      primary: '#2D5016',
      secondary: '#4A7C2C',
      accent: '#8BC34A',
      background: '#F1F8E9',
      surface: '#DCEDC8',
      text: '#1B5E20',
    },
  },
  midnight: {
    name: 'midnight',
    displayName: 'Midnight',
    icon: '✨',
    colors: {
      primary: '#6366F1',
      secondary: '#818CF8',
      accent: '#A78BFA',
      background: '#0F0F23',
      surface: '#1E1E3F',
      text: '#E0E7FF',
    },
  },
};

interface ThemeContextType {
  theme: Theme;
  themeConfig: ThemeConfig;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as Theme) || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);

    document.documentElement.classList.remove('light', 'dark', 'ocean', 'sunset', 'forest', 'midnight');

    if (theme === 'dark' || theme === 'midnight') {
      document.documentElement.classList.add('dark');
    }

    document.documentElement.classList.add(theme);

    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'ocean', 'sunset', 'forest', 'midnight'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const themeConfig = THEME_CONFIGS[theme];

  return (
    <ThemeContext.Provider value={{ theme, themeConfig, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};