import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useThemeStore = create(
  persist(
    (set, get) => ({
      // 상태
      isDarkMode: false,
      
      // 시스템 테마 감지
      systemTheme: typeof window !== 'undefined' 
        ? window.matchMedia('(prefers-color-scheme: dark)').matches 
        : false,
      
      // 액션
      toggleTheme: () => {
        const newTheme = !get().isDarkMode;
        set({ isDarkMode: newTheme });
        
        // DOM 클래스 업데이트
        if (typeof document !== 'undefined') {
          if (newTheme) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      },
      
      setTheme: (isDark) => {
        set({ isDarkMode: isDark });
        
        // DOM 클래스 업데이트
        if (typeof document !== 'undefined') {
          if (isDark) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      },
      
      // 시스템 테마 따르기
      useSystemTheme: () => {
        const systemTheme = typeof window !== 'undefined' 
          ? window.matchMedia('(prefers-color-scheme: dark)').matches 
          : false;
        
        set({ 
          isDarkMode: systemTheme,
          systemTheme 
        });
        
        // DOM 클래스 업데이트
        if (typeof document !== 'undefined') {
          if (systemTheme) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      },
      
      // 초기화 함수
      initializeTheme: () => {
        const stored = get().isDarkMode;
        if (typeof document !== 'undefined') {
          if (stored) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
        
        // 시스템 테마 변경 감지
        if (typeof window !== 'undefined') {
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
          mediaQuery.addEventListener('change', (e) => {
            set({ systemTheme: e.matches });
          });
        }
      }
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        // 스토어 복원 후 테마 초기화
        if (state) {
          state.initializeTheme();
        }
      }
    }
  )
);

export default useThemeStore;