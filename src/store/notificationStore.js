import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  getNotifications, 
  getUnreadNotificationCount, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  deleteNotification,
  deleteNotifications
} from '../api/notifications';

const useNotificationStore = create(
  persist(
    (set, get) => ({
      // 알림 상태
      notifications: [],
      unreadCount: 0,
      loading: false,
      error: null,
      
      // 필터 상태
      filter: {
        type: null, // null, 'matching', 'session', 'chat', 'system'
        isRead: null, // null, true, false
      },
      
      // 페이지네이션
      pagination: {
        page: 1,
        size: 20,
        totalPages: 0,
        totalElements: 0,
        hasNext: false
      },
      
      // 실시간 알림 설정
      realtimeSettings: {
        sound: true,
        browserNotifications: true,
        desktopToast: true,
        autoMarkAsRead: false
      },
      
      // 알림 목록 로드
      loadNotifications: async (page = 1, size = 20, resetList = false) => {
        try {
          set({ loading: true, error: null });
          
          const { filter } = get();
          const response = await getNotifications(page, size, filter.type, filter.isRead);
          
          const newNotifications = response.notifications || [];
          
          set((state) => ({
            notifications: resetList ? newNotifications : [...state.notifications, ...newNotifications],
            pagination: {
              page: response.page || page,
              size: response.size || size,
              totalPages: response.totalPages || 0,
              totalElements: response.totalElements || 0,
              hasNext: response.hasNext || false
            },
            loading: false
          }));
          
        } catch (error) {
          console.error('Failed to load notifications:', error);
          set({ error: error.message, loading: false });
        }
      },
      
      // 읽지 않은 알림 수 로드
      loadUnreadCount: async () => {
        try {
          const response = await getUnreadNotificationCount();
          set({ unreadCount: response.count || 0 });
        } catch (error) {
          console.error('Failed to load unread count:', error);
        }
      },
      
      // 알림 읽음 처리
      markAsRead: async (notificationId) => {
        try {
          await markNotificationAsRead(notificationId);
          
          set((state) => ({
            notifications: state.notifications.map((notification) =>
              notification.id === notificationId
                ? { ...notification, isRead: true }
                : notification
            ),
            unreadCount: Math.max(0, state.unreadCount - 1)
          }));
          
        } catch (error) {
          console.error('Failed to mark notification as read:', error);
          set({ error: error.message });
        }
      },
      
      // 모든 알림 읽음 처리
      markAllAsRead: async () => {
        try {
          await markAllNotificationsAsRead();
          
          set((state) => ({
            notifications: state.notifications.map((notification) => ({
              ...notification,
              isRead: true
            })),
            unreadCount: 0
          }));
          
        } catch (error) {
          console.error('Failed to mark all notifications as read:', error);
          set({ error: error.message });
        }
      },
      
      // 알림 삭제
      deleteNotification: async (notificationId) => {
        try {
          await deleteNotification(notificationId);
          
          set((state) => {
            const deletedNotification = state.notifications.find(n => n.id === notificationId);
            return {
              notifications: state.notifications.filter(n => n.id !== notificationId),
              unreadCount: deletedNotification && !deletedNotification.isRead 
                ? Math.max(0, state.unreadCount - 1) 
                : state.unreadCount
            };
          });
          
        } catch (error) {
          console.error('Failed to delete notification:', error);
          set({ error: error.message });
        }
      },
      
      // 선택된 알림들 삭제
      deleteSelectedNotifications: async (notificationIds) => {
        try {
          await deleteNotifications(notificationIds);
          
          set((state) => {
            const deletedNotifications = state.notifications.filter(n => notificationIds.includes(n.id));
            const unreadDeleted = deletedNotifications.filter(n => !n.isRead).length;
            
            return {
              notifications: state.notifications.filter(n => !notificationIds.includes(n.id)),
              unreadCount: Math.max(0, state.unreadCount - unreadDeleted)
            };
          });
          
        } catch (error) {
          console.error('Failed to delete notifications:', error);
          set({ error: error.message });
        }
      },
      
      // 새 알림 추가 (WebSocket에서 받은 실시간 알림)
      addNotification: (notification) => {
        set((state) => {
          // 중복 확인
          const exists = state.notifications.some(n => n.id === notification.id);
          if (exists) return state;
          
          return {
            notifications: [notification, ...state.notifications],
            unreadCount: !notification.isRead ? state.unreadCount + 1 : state.unreadCount
          };
        });
      },
      
      // 실시간 알림 업데이트 (읽음 상태 변경 등)
      updateNotification: (notificationId, updates) => {
        set((state) => {
          const notification = state.notifications.find(n => n.id === notificationId);
          if (!notification) return state;
          
          const wasUnread = !notification.isRead;
          const willBeRead = updates.isRead !== undefined ? updates.isRead : notification.isRead;
          
          return {
            notifications: state.notifications.map(n =>
              n.id === notificationId ? { ...n, ...updates } : n
            ),
            unreadCount: wasUnread && willBeRead 
              ? Math.max(0, state.unreadCount - 1)
              : !wasUnread && !willBeRead
              ? state.unreadCount + 1
              : state.unreadCount
          };
        });
      },
      
      // 필터 설정
      setFilter: (newFilter) => {
        set((state) => ({
          filter: { ...state.filter, ...newFilter },
          notifications: [], // 필터 변경 시 기존 목록 초기화
          pagination: { ...state.pagination, page: 1 }
        }));
      },
      
      // 필터 초기화
      clearFilter: () => {
        set((state) => ({
          filter: { type: null, isRead: null },
          notifications: [],
          pagination: { ...state.pagination, page: 1 }
        }));
      },
      
      // 실시간 설정 업데이트
      updateRealtimeSettings: (settings) => {
        set((state) => ({
          realtimeSettings: { ...state.realtimeSettings, ...settings }
        }));
      },
      
      // 에러 초기화
      clearError: () => {
        set({ error: null });
      },
      
      // 스토어 초기화
      resetStore: () => {
        set({
          notifications: [],
          unreadCount: 0,
          loading: false,
          error: null,
          filter: { type: null, isRead: null },
          pagination: {
            page: 1,
            size: 20,
            totalPages: 0,
            totalElements: 0,
            hasNext: false
          }
        });
      },
      
      // 알림 타입별 개수 가져오기
      getNotificationCountByType: () => {
        const { notifications } = get();
        return notifications.reduce((acc, notification) => {
          const type = notification.type || 'system';
          acc[type] = (acc[type] || 0) + 1;
          if (!notification.isRead) {
            acc[`${type}_unread`] = (acc[`${type}_unread`] || 0) + 1;
          }
          return acc;
        }, {});
      },
      
      // 알림 검색
      searchNotifications: (query) => {
        const { notifications } = get();
        if (!query.trim()) return notifications;
        
        const searchQuery = query.toLowerCase();
        return notifications.filter(notification => 
          notification.title?.toLowerCase().includes(searchQuery) ||
          notification.message?.toLowerCase().includes(searchQuery) ||
          notification.content?.toLowerCase().includes(searchQuery)
        );
      },
      
      // 알림 그룹화 (날짜별)
      getGroupedNotifications: () => {
        const { notifications } = get();
        const groups = {};
        
        notifications.forEach(notification => {
          const date = new Date(notification.createdAt);
          const today = new Date();
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          
          let groupKey;
          if (date.toDateString() === today.toDateString()) {
            groupKey = '오늘';
          } else if (date.toDateString() === yesterday.toDateString()) {
            groupKey = '어제';
          } else {
            groupKey = date.toLocaleDateString('ko-KR', { 
              month: 'long', 
              day: 'numeric' 
            });
          }
          
          if (!groups[groupKey]) {
            groups[groupKey] = [];
          }
          groups[groupKey].push(notification);
        });
        
        return groups;
      }
    }),
    {
      name: 'notification-storage',
      partialize: (state) => ({
        realtimeSettings: state.realtimeSettings,
        filter: state.filter
      })
    }
  )
);

export default useNotificationStore;