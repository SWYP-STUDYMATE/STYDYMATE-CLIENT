import React from 'react';
import { Moon, Sun } from 'lucide-react';
import useThemeStore from '../store/themeStore';

const ThemeToggle = ({ className = '', size = 'md' }) => {
  const { isDarkMode, toggleTheme } = useThemeStore();
  
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-10 h-6';
      case 'lg':
        return 'w-16 h-8';
      case 'md':
      default:
        return 'w-12 h-7';
    }
  };
  
  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-3 h-3';
      case 'lg':
        return 'w-5 h-5';
      case 'md':
      default:
        return 'w-4 h-4';
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative inline-flex items-center ${getSizeClasses()} 
        rounded-full border-2 border-gray-200 dark:border-gray-700
        bg-gray-200 dark:bg-gray-700
        transition-colors duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-[#00C471] focus:ring-offset-2
        ${className}
      `}
      role="switch"
      aria-checked={isDarkMode}
      aria-label={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
    >
      <span className="sr-only">테마 변경</span>
      
      {/* 슬라이더 */}
      <span
        className={`
          inline-block ${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'}
          rounded-full bg-white dark:bg-gray-900 shadow-lg transform transition-transform duration-200 ease-in-out
          ${isDarkMode 
            ? size === 'sm' ? 'translate-x-4' : size === 'lg' ? 'translate-x-8' : 'translate-x-5'
            : 'translate-x-0'
          }
          flex items-center justify-center
        `}
      >
        {isDarkMode ? (
          <Moon className={`${getIconSize()} text-gray-600`} />
        ) : (
          <Sun className={`${getIconSize()} text-yellow-500`} />
        )}
      </span>
    </button>
  );
};

export default ThemeToggle;