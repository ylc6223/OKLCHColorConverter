import React, { useState, useRef, useEffect } from 'react';
import { Settings, Languages, Sun, Moon, Monitor } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { Theme, Language } from '../types';
import { t } from '../utils/translations';

const SettingsPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme, language, setLanguage } = useSettings();
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close settings when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getNextLanguage = (): Language => {
    return language === 'en' ? 'zh' : 'en';
  };

  const getNextTheme = (): Theme => {
    switch (theme) {
      case 'light':
        return 'dark';
      case 'dark':
        return 'system';
      case 'system':
        return 'light';
    }
  };

  const getThemeIcon = (themeValue: Theme) => {
    switch (themeValue) {
      case 'light':
        return <Sun className="w-4 h-4" />;
      case 'dark':
        return <Moon className="w-4 h-4" />;
      case 'system':
        return <Monitor className="w-4 h-4" />;
    }
  };

  const getThemeLabel = (themeValue: Theme): string => {
    switch (themeValue) {
      case 'light':
        return t('light', language);
      case 'dark':
        return t('dark', language);
      case 'system':
        return t('system', language);
    }
  };

  const handleLanguageChange = () => {
    setLanguage(getNextLanguage());
    setIsOpen(false);
  };

  const handleThemeChange = () => {
    setTheme(getNextTheme());
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-20 right-6 z-50">
      <div className="relative w-12 h-12">
        {/* Main circle button */}
        <button
          ref={buttonRef}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className={`
            block relative p-0 z-[98] m-auto rounded-full h-12 w-12
            bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all duration-200 text-center cursor-pointer
            shadow-sm hover:shadow-lg
            active:scale-90 active:shadow-sm
            ${isOpen ? 'scale-75 bg-amber-500 dark:bg-amber-600 border-amber-400 dark:border-amber-500 shadow-lg' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}
          `}
          aria-label={t('settings', language)}
        >
          <Settings
            className={`
              absolute top-1/2 left-1/2 -ml-3 -mt-3 w-6 h-6 transition-transform duration-500
              ${isOpen ? 'text-white -rotate-[135deg]' : 'text-gray-600 dark:text-gray-400 rotate-180'}
            `}
          />
        </button>

        {/* Sub-circle container */}
        <div className="absolute left-2 top-2 w-8 h-8 text-center z-0 m-auto">
          {/* Language Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleLanguageChange();
            }}
            className={`
              z-0 absolute h-8 w-8 overflow-hidden rounded-full p-0 m-0
              shadow-sm hover:shadow-lg backdrop-blur-sm
              bg-white/80 dark:bg-gray-800/80 hover:bg-white/90 dark:hover:bg-gray-700/90
              border border-gray-200/50 dark:border-gray-700/50
              flex items-center justify-center text-gray-600 dark:text-gray-400 cursor-pointer select-none
              ${isOpen
                ? 'transform -translate-x-2 -translate-y-16 scale-100 opacity-100 transition-all duration-100 ease-out'
                : 'transform scale-50 opacity-0 transition-all duration-300'
              }
            `}
            title={language === 'en' ? '中文' : 'English'}
          >
            <Languages className="w-4 h-4" />
          </button>

          {/* Theme Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleThemeChange();
            }}
            className={`
              z-0 absolute h-8 w-8 overflow-hidden rounded-full p-0 m-0
              shadow-sm hover:shadow-lg backdrop-blur-sm
              bg-white/80 dark:bg-gray-800/80 hover:bg-white/90 dark:hover:bg-gray-700/90
              border border-gray-200/50 dark:border-gray-700/50
              flex items-center justify-center text-gray-600 dark:text-gray-400 cursor-pointer select-none
              ${isOpen
                ? 'transform -translate-x-2 translate-y-16 scale-100 opacity-100 transition-all duration-200 ease-out'
                : 'transform scale-50 opacity-0 transition-all duration-300'
              }
            `}
            title={getThemeLabel(getNextTheme())}
          >
            {getThemeIcon(getNextTheme())}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
