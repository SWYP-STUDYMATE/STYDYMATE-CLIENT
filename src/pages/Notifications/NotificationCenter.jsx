import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  Bell, 
  MessageSquare, 
  Users, 
  Video, 
  Award, 
  Settings, 
  Trash2,
  Check,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react';
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadNotificationCount
} from '../../api/notifications';

const NotificationCenter = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [filter, setFilter] = useState('all'); // all, unread, chat, matching, session, system
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasMore: false
  });

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
  }, [filter]);

  const loadNotifications = async (page = 1, refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else setLoading(true);

      const params = {
        page,
        limit: 20,
        type: filter !== 'all' ? filter : undefined,
        unreadOnly: filter === 'unread'
      };

      const response = await getNotifications(params);
      
      if (page === 1) {
        setNotifications(response.data || []);
      } else {
        setNotifications(prev => [...prev, ...(response.data || [])]);
      }

      setPagination({
        currentPage: response.currentPage || 1,
        totalPages: response.totalPages || 1,
        hasMore: response.hasMore || false
      });
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await getUnreadNotificationCount();
      setUnreadCount(response.count || 0);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (isSelectionMode) {
      toggleSelection(notification.id);
      return;
    }

    // 읽지 않은 알림인 경우 읽음 처리
    if (!notification.isRead) {
      try {
        await markNotificationAsRead(notification.id);
        setNotifications(prev =>
          prev.map(n => 
            n.id === notification.id 
              ? { ...n, isRead: true }
              : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Failed to mark as read:', error);
      }
    }

    // 알림 타입에 따른 네비게이션
    handleNavigationFromNotification(notification);
  };

  const handleNavigationFromNotification = (notification) => {
    const { type, data } = notification;
    
    switch (type) {
      case 'chat':
        if (data?.roomId) {
          navigate(`/chat/${data.roomId}`);
        } else {
          navigate('/chat');
        }
        break;
      case 'match_request':
      case 'match_accepted':
        if (data?.userId) {
          navigate(`/matching/profile/${data.userId}`);
        } else {
          navigate('/matching');
        }
        break;
      case 'session_invitation':
      case 'session_reminder':
        if (data?.sessionId) {
          navigate(`/sessions/${data.sessionId}`);
        } else {
          navigate('/sessions');
        }
        break;
      case 'level_test_result':
        navigate('/level-test/result');
        break;
      case 'achievement':
        navigate('/profile');
        break;
      default:
        // 기본적으로 상세 페이지로 이동하지 않고 그냥 읽음 처리만
        break;
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const toggleSelection = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;

    if (!window.confirm(`선택한 ${selectedIds.size}개의 알림을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await Promise.all([...selectedIds].map(id => deleteNotification(id)));
      setNotifications(prev => 
        prev.filter(n => !selectedIds.has(n.id))
      );
      setSelectedIds(new Set());
      setIsSelectionMode(false);
    } catch (error) {
      console.error('Failed to delete notifications:', error);
    }
  };

  const handleRefresh = () => {
    loadNotifications(1, true);
    loadUnreadCount();
  };

  const handleLoadMore = () => {
    if (pagination.hasMore && !loading) {
      loadNotifications(pagination.currentPage + 1);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'chat':
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'match_request':
      case 'match_accepted':
        return <Users className="w-5 h-5 text-green-500" />;
      case 'session_invitation':
      case 'session_reminder':
        return <Video className="w-5 h-5 text-purple-500" />;
      case 'achievement':
      case 'level_test_result':
        return <Award className="w-5 h-5 text-yellow-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationTime = (createdAt) => {
    const date = new Date(createdAt);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return '방금 전';
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    if (diffInDays < 7) return `${diffInDays}일 전`;
    
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredNotifications = notifications.filter(notification => {
    if (searchTerm) {
      return notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
             notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  const filterTabs = [
    { id: 'all', label: '전체', count: notifications.length },
    { id: 'unread', label: '읽지 않음', count: unreadCount },
    { id: 'chat', label: '채팅', count: notifications.filter(n => n.type === 'chat').length },
    { id: 'matching', label: '매칭', count: notifications.filter(n => n.type.includes('match')).length },
    { id: 'session', label: '세션', count: notifications.filter(n => n.type.includes('session')).length },
    { id: 'system', label: '시스템', count: notifications.filter(n => n.type === 'system').length }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-6 h-6 text-[#111111] rotate-180" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-[#111111]">알림</h1>
                {unreadCount > 0 && (
                  <p className="text-sm text-[#929292]">
                    {unreadCount}개의 읽지 않은 알림
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-5 h-5 text-[#929292] ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              
              <button
                onClick={() => setIsSelectionMode(!isSelectionMode)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Check className="w-5 h-5 text-[#929292]" />
              </button>
              
              <button
                onClick={() => navigate('/settings/notifications')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5 text-[#929292]" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-3.5 w-4 h-4 text-[#929292]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="알림 검색..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00C471] focus:border-[#00C471] transition-colors"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-6 pb-4">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 overflow-x-auto">
            {filterTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  filter === tab.id
                    ? 'bg-white text-[#111111] shadow-sm'
                    : 'text-[#929292] hover:text-[#111111] hover:bg-gray-50'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    filter === tab.id ? 'bg-[#00C471] text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Selection Mode Actions */}
        {isSelectionMode && (
          <div className="px-6 pb-4">
            <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
              <span className="text-sm text-blue-800">
                {selectedIds.size}개 선택됨
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={handleDeleteSelected}
                  disabled={selectedIds.size === 0}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-700 disabled:text-gray-400 transition-colors"
                >
                  삭제
                </button>
                <button
                  onClick={() => {
                    setSelectedIds(new Set());
                    setIsSelectionMode(false);
                  }}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-700 transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {!isSelectionMode && unreadCount > 0 && (
          <div className="px-6 pb-4">
            <button
              onClick={handleMarkAllRead}
              className="text-sm text-[#00C471] hover:text-[#00B267] font-medium transition-colors"
            >
              모든 알림 읽음 처리
            </button>
          </div>
        )}
      </div>

      {/* Notifications List */}
      <div className="px-6 py-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-[#00C471] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-[#929292] mt-2">알림을 불러오는 중...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-[#929292] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#111111] mb-2">알림이 없습니다</h3>
            <p className="text-[#929292]">
              {filter === 'unread' 
                ? '모든 알림을 확인했습니다.' 
                : '새로운 알림이 도착하면 여기에 표시됩니다.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`bg-white rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  !notification.isRead ? 'border-l-4 border-[#00C471]' : 'border border-gray-200'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {isSelectionMode && (
                    <div className="mt-1">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(notification.id)}
                        onChange={() => toggleSelection(notification.id)}
                        className="w-4 h-4 text-[#00C471] border-gray-300 rounded focus:ring-[#00C471]"
                      />
                    </div>
                  )}
                  
                  <div className="mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-sm font-medium ${
                          notification.isRead ? 'text-[#111111]' : 'text-[#111111] font-semibold'
                        }`}>
                          {notification.title}
                        </h4>
                        <p className="text-sm text-[#929292] mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                      </div>
                      <div className="flex-shrink-0 ml-4">
                        <span className="text-xs text-[#929292]">
                          {getNotificationTime(notification.createdAt)}
                        </span>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-[#00C471] rounded-full mt-1 ml-auto"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Load More Button */}
            {pagination.hasMore && (
              <div className="text-center py-4">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="px-6 py-2 text-sm text-[#00C471] hover:text-[#00B267] font-medium transition-colors"
                >
                  {loading ? '로딩 중...' : '더 보기'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;