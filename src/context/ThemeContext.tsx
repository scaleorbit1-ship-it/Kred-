import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeType = 'dark' | 'white';

export interface ThemeConfig {
  id: ThemeType;
  name: string;
  desc: string;
  bgCanvas: string;
  bgSurface: string;
  bgCard: string;
  textPrimary: string;
  textMuted: string;
  borderSubtle: string;
  accent: string;
  accentBg: string;
  isDark: boolean;
  previewColor: string;
  previewBorder: string;
}

export const THEMES: Record<ThemeType, ThemeConfig> = {
  dark: {
    id: 'dark',
    name: 'Dark Mode',
    desc: 'Deep enclave obsidian canvas with dark surface panels and emerald security indicators',
    bgCanvas: '#0C0C0E',
    bgSurface: '#141417',
    bgCard: '#1C1C21',
    textPrimary: '#FAFAFA',
    textMuted: 'rgba(250, 250, 250, 0.65)',
    borderSubtle: 'rgba(255, 255, 255, 0.1)',
    accent: '#10C77A',
    accentBg: 'rgba(16, 199, 122, 0.18)',
    isDark: true,
    previewColor: '#0C0C0E',
    previewBorder: '#10C77A',
  },
  white: {
    id: 'white',
    name: 'White Mode',
    desc: 'Ultra-crisp studio white surface with sharp contrast typography and minimal lines',
    bgCanvas: '#FFFFFF',
    bgSurface: '#F7F7F8',
    bgCard: '#FFFFFF',
    textPrimary: '#09090B',
    textMuted: 'rgba(9, 9, 11, 0.65)',
    borderSubtle: '#E4E4E7',
    accent: '#10C77A',
    accentBg: 'rgba(16, 199, 122, 0.12)',
    isDark: false,
    previewColor: '#FFFFFF',
    previewBorder: '#09090B',
  },
};

interface ThemeContextType {
  theme: ThemeType;
  themeConfig: ThemeConfig;
  setTheme: (t: ThemeType) => void;
  toggleTheme: () => void;
  isSettingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'white',
  themeConfig: THEMES.white,
  setTheme: () => {},
  toggleTheme: () => {},
  isSettingsOpen: false,
  openSettings: () => {},
  closeSettings: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeType>(() => {
    const saved = localStorage.getItem('kred_inner_theme');
    if (saved === 'dark' || saved === 'white') return saved;
    // Map any legacy values (warm -> white, slate -> white, cyber -> dark)
    if (saved === 'cyber') return 'dark';
    return 'white';
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const themeConfig = THEMES[theme] || THEMES.white;

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    localStorage.setItem('kred_inner_theme', newTheme);
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'white' : 'dark';
    setTheme(next);
  };

  // We set CSS variables on the document element for inner section usage,
  // but DO NOT override document.body styles so the public website landing page stays untouched!
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-inner-theme', theme);
    root.style.setProperty('--inner-bg-canvas', themeConfig.bgCanvas);
    root.style.setProperty('--inner-bg-surface', themeConfig.bgSurface);
    root.style.setProperty('--inner-bg-card', themeConfig.bgCard);
    root.style.setProperty('--inner-text-primary', themeConfig.textPrimary);
    root.style.setProperty('--inner-text-muted', themeConfig.textMuted);
    root.style.setProperty('--inner-border-subtle', themeConfig.borderSubtle);
    root.style.setProperty('--inner-accent', themeConfig.accent);
  }, [theme, themeConfig]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeConfig,
        setTheme,
        toggleTheme,
        isSettingsOpen,
        openSettings: () => setIsSettingsOpen(true),
        closeSettings: () => setIsSettingsOpen(false),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
