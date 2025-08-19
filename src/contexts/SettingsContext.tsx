import React, { createContext, useContext, ReactNode } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../hooks/useLanguage';
import { Theme, Language } from '../types';

interface SettingsContextType {
  // Theme related
  theme: Theme;
  setTheme: (theme: Theme) => void;
  
  // Language related
  language: Language;
  setLanguage: (language: Language) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  const value: SettingsContextType = {
    theme,
    setTheme,
    language,
    setLanguage,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
