import React, { useState, useEffect } from 'react';
import { 
  getMyNotifications,
  getUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadNotificationCount
} from '../../api/notifications';
import Header from '../../components/Header';
import { useAlert } from '../../hooks/useAlert';
import { Bell, Check, Trash2, MessageCircle, Users, Calendar, Award, AlertCircle } from 'lucide-react';

export default function NotificationPage() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, UNREAD
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const { showError, showSuccess } = useAlert();

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
  }, [filter]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      let data;
      
      if (filter === 'UNREAD') {
        const response = await getUnreadNotifications();
        data = response.data || [];
        setNotifications(data);
        setHasMore(false); // 읽지 않은 알림은 페이징 없이 전체 로드
      } else {
        const response = await getMyNotifications(page, 20);
        data = response.data || response;
        
        if (data.content) {
          setNotifications(prev => page === 0 ? data.content : [...prev, ...data.content]);
          setHasMore(!data.last);
        } else if (Array.isArray(data)) {
          setNotifications(data);
          setHasMore(false);
        }
      }
    } catch (error) {
      showError('알림을 불러오는데 실패했습니다.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await getUnreadNotificationCount();
      setUnreadCount(response.data || 0);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      showError('읽음 처리에 실패했습니다.');
      console.error(error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      showSuccess('모든 알림을 읽음 처리했습니다.');
    } catch (error) {
      showError('읽음 처리에 실패했습니다.');
      console.error(error);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      showSuccess('알림을 삭제했습니다.');
    } catch (error) {
      showError('삭제에 실패했습니다.');
      console.error(error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'CHAT': return <MessageCircle className="w-5 h-5" />;
      case 'MATCH': return <Users className="w-5 h-5" />;
      case 'SESSION': return <Calendar className="w-5 h-5" />;
      case 'ACHIEVEMENT': return <Award className="w-5 h-5" />;
      case 'SYSTEM': return <AlertCircle className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'CHAT': return 'text-[#4285F4]';
      case 'MATCH': return 'text-[#00C471]';
      case 'SESSION': return 'text-[#FFA500]';
      case 'ACHIEVEMENT': return 'text-[#FFD700]';
      case 'SYSTEM': return 'text-[#EA4335]';
      default: return 'text-[#606060]';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    
    return date.toLocaleDateString();
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="bg-[#FAFAFA] min-h-screen max-w-[768px] w-full mx-auto">
        <Header />
        <div className="flex justify-center items-center h-[400px]">
          <div className="text-[#929292]">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAFA] min-h-screen max-w-[768px] w-full mx-auto">
      <Header />
      
      {/* 헤더 섹션 */}
      <div className="bg-white p-6 border-b border-[#E7E7E7]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-[24px] font-bold text-[#111111]">알림</h1>
            {unreadCount > 0 && (
              <span className="px-2 py-1 bg-[#EA4335] text-white text-[12px] rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-[14px] text-[#00C471] font-medium hover:text-[#00B267]"
            >
              모두 읽음
            </button>
          )}
        </div>

        {/* 필터 */}
        <div className="flex gap-2">
          <button
            onClick={() => { setFilter('ALL'); setPage(0); }}
            className={`px-4 py-2 rounded-full text-[14px] font-medium transition-colors
              ${filter === 'ALL' 
                ? 'bg-[#111111] text-white' 
                : 'bg-[#F1F3F5] text-[#606060] hover:bg-[#E7E7E7]'
              }`}
          >
            전체
          </button>
          <button
            onClick={() => { setFilter('UNREAD'); setPage(0); }}
            className={`px-4 py-2 rounded-full text-[14px] font-medium transition-colors
              ${filter === 'UNREAD' 
                ? 'bg-[#111111] text-white' 
                : 'bg-[#F1F3F5] text-[#606060] hover:bg-[#E7E7E7]'
              }`}
          >
            읽지 않음
          </button>
        </div>
      </div>

      {/* 알림 리스트 */}
      <div className="p-6">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-[#B5B5B5] mx-auto mb-4" />
            <p className="text-[#929292]">알림이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-[10px] p-4 border transition-all cursor-pointer
                  ${notification.isRead 
                    ? 'border-[#E7E7E7]' 
                    : 'border-[#00C471] shadow-sm'
                  }`}
                onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
              >
                <div className="flex items-start gap-3">
                  {/* 아이콘 */}
                  <div className={`mt-1 ${getNotificationColor(notification.type)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* 내용 */}
                  <div className="flex-1">
                    <h3 className={`font-medium text-[14px] mb-1
                      ${notification.isRead ? 'text-[#606060]' : 'text-[#111111]'}`}
                    >
                      {notification.title}
                    </h3>
                    <p className={`text-[14px] mb-2
                      ${notification.isRead ? 'text-[#929292]' : 'text-[#606060]'}`}
                    >
                      {notification.content || notification.message}
                    </p>
                    <div className="text-[12px] text-[#B5B5B5]">
                      {formatTime(notification.createdAt)}
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex items-center gap-2">
                    {!notification.isRead && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification.id);
                        }}
                        className="p-1.5 text-[#00C471] hover:bg-[#E6F9F1] rounded-full transition-colors"
                        title="읽음 처리"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(notification.id);
                      }}
                      className="p-1.5 text-[#929292] hover:text-[#EA4335] hover:bg-[#FFF5F5] rounded-full transition-colors"
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 액션 링크 */}
                {notification.actionUrl && (
                  <div className="mt-3 pt-3 border-t border-[#F1F3F5]">
                    <a
                      href={notification.actionUrl}
                      className="text-[14px] text-[#00C471] font-medium hover:text-[#00B267]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      자세히 보기 →
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 더보기 버튼 */}
        {hasMore && filter === 'ALL' && notifications.length > 0 && (
          <div className="mt-6 text-center">
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="px-6 py-2 bg-[#F1F3F5] text-[#606060] rounded-full text-[14px] 
                font-medium hover:bg-[#E7E7E7] transition-colors disabled:opacity-50"
            >
              {loading ? '로딩 중...' : '더보기'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}