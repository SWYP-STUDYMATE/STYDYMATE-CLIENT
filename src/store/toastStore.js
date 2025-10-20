import { create } from 'zustand';

/**
 * Toast 전역 상태 관리
 */
const useToastStore = create((set) => ({
  toasts: [],

  addToast: (message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();

    set((state) => ({
      toasts: [...state.toasts, { id, message, type, duration }]
    }));

    // 자동 제거
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter(toast => toast.id !== id)
        }));
      }, duration);
    }

    return id;
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter(toast => toast.id !== id)
    }));
  },

  clearAll: () => {
    set({ toasts: [] });
  },

  // 편의 메서드
  error: (message, duration = 5000) => {
    return useToastStore.getState().addToast(message, 'error', duration);
  },

  success: (message, duration = 3000) => {
    return useToastStore.getState().addToast(message, 'success', duration);
  },

  warning: (message, duration = 4000) => {
    return useToastStore.getState().addToast(message, 'warning', duration);
  },

  info: (message, duration = 3000) => {
    return useToastStore.getState().addToast(message, 'info', duration);
  }
}));

export default useToastStore;
