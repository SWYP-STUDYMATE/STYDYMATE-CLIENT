import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Filter, 
  MoreVertical, 
  Check, 
  CheckCheck, 
  Trash2, 
  Search,
  Bell,
  MessageSquare,
  Users,
  Calendar,
  Award,
  AlertCircle,
  Info,
  RefreshCw
} from 'lucide-react';
import useNotificationStore from '../../store/notificationStore';
import CommonButton from '../../components/CommonButton';

const NotificationList = () => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    error,
    filter,
    pagination,
    loadNotifications,
    loadUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteSelectedNotifications,
    setFilter,
    clearFilter,
    clearError,
    getGroupedNotifications,
    searchNotifications
  } = useNotificationStore();

  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  useEffect(() => {
    loadNotifications(1, 20, true);
    loadUnreadCount();
  }, [filter]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleLoadMore = useCallback(() => {
    if (pagination.hasNext && !loading) {
      loadNotifications(pagination.page + 1, 20, false);
    }
  }, [pagination.hasNext, pagination.page, loading, loadNotifications]);

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    if (notification.clickUrl) {
      navigate(notification.clickUrl);
    } else {
      // 기본 액션 처리
      const baseType = notification.category || notification.type;
      switch (baseType) {
        case 'chat':
          navigate('/chat');
          break;
        case 'matching':
        case 'match_request':
        case 'match_accepted':
          navigate('/matching');
          break;
        case 'session':
        case 'session_reminder':
        case 'session_invitation':
          navigate('/main');
          break;
        case 'achievement':
        case 'level_test_result':
          navigate('/profile');
          break;
        default:
          break;
      }
    }
  };

  const handleMarkAsRead = async (notificationId, event) => {
    event.stopPropagation();
    await markAsRead(notificationId);
  };

  const handleDeleteNotification = async (notificationId, event) => {
    event.stopPropagation();
    if (window.confirm('이 알림을 삭제하시겠습니까?')) {
      await deleteNotification(notificationId);
    }
  };

  const handleSelectNotification = (notificationId) => {
    setSelectedNotifications(prev => {
      if (prev.includes(notificationId)) {
        return prev.filter(id => id !== notificationId);
      } else {
        return [...prev, notificationId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === notifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notifications.map(n => n.id));
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedNotifications.length === 0) return;

    switch (action) {
      case 'markAsRead':
        for (const id of selectedNotifications) {
          await markAsRead(id);
        }
        break;
      case 'delete':
        if (window.confirm(`선택된 ${selectedNotifications.length}개의 알림을 삭제하시겠습니까?`)) {
          await deleteSelectedNotifications(selectedNotifications);
        }
        break;
    }
    
    setSelectedNotifications([]);
    setIsSelectionMode(false);
  };

  const getTypeIcon = (type) => {
    if (!type) return <Bell className="w-5 h-5" />;
    const normalized = type.toLowerCase();

    if (normalized.includes('chat')) {
      return <MessageSquare className="w-5 h-5" />;
    }
    if (normalized.includes('match')) {
      return <Users className="w-5 h-5" />;
    }
    if (normalized.includes('session')) {
      return <Calendar className="w-5 h-5" />;
    }
    if (normalized.includes('achieve') || normalized.includes('level_test')) {
      return <Award className="w-5 h-5" />;
    }
    if (normalized.includes('system')) {
      return <Info className="w-5 h-5" />;
    }
    if (normalized.includes('urgent')) {
      return <AlertCircle className="w-5 h-5" />;
    }
    return <Bell className="w-5 h-5" />;
  };

  const getTypeColor = (type) => {
    if (!type) return 'text-indigo-600';
    const normalized = type.toLowerCase();

    if (normalized.includes('chat')) return 'text-blue-600';
    if (normalized.includes('match')) return 'text-green-600';
    if (normalized.includes('session')) return 'text-purple-600';
    if (normalized.includes('achieve') || normalized.includes('level_test')) return 'text-yellow-600';
    if (normalized.includes('system')) return 'text-gray-600';
    if (normalized.includes('urgent')) return 'text-red-600';
    return 'text-indigo-600';
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('ko-KR', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const filteredNotifications = searchQuery 
    ? searchNotifications(searchQuery)
    : notifications;

  const groupedNotifications = getGroupedNotifications();

  const FilterButton = ({ type, label, count }) => (
    <button
      onClick={() => {
        if (filter.type === type) {
          clearFilter();
        } else {
          setFilter({ type });
        }
      }}
      className={`
        px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2
        ${filter.type === type 
          ? 'bg-[#00C471] text-white' 
          : 'bg-gray-100 text-[#111111] hover:bg-gray-200'
        }
      `}
    >
      <span>{label}</span>
      {count > 0 && (
        <span className={`
          px-2 py-0.5 rounded-full text-xs font-bold
          ${filter.type === type 
            ? 'bg-white text-[#00C471]' 
            : 'bg-[#00C471] text-white'
          }
        `}>
          {count}
        </span>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-[#111111]" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-[#111111]">알림</h1>
                {unreadCount > 0 && (
                  <p className="text-sm text-[#929292]">
                    읽지 않은 알림 {unreadCount}개
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`
                  p-2 rounded-lg transition-colors
                  ${showFilters ? 'bg-[#00C471] text-white' : 'hover:bg-gray-100 text-[#111111]'}
                `}
              >
                <Filter className="w-5 h-5" />
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setShowActions(!showActions)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <MoreVertical className="w-5 h-5 text-[#111111]" />
                </button>
                
                {showActions && (
                  <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[160px] z-20">
                    <button
                      onClick={async () => {
                        await markAllAsRead();
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <CheckCheck className="w-4 h-4" />
                      <span>모두 읽음</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsSelectionMode(!isSelectionMode);
                        setSelectedNotifications([]);
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>선택 모드</span>
                    </button>
                    <button
                      onClick={() => {
                        loadNotifications(1, 20, true);
                        loadUnreadCount();
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>새로고침</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#929292]" />
            <input
              type="text"
              placeholder="알림 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00C471] focus:border-[#00C471]"
            />
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 flex flex-wrap gap-2">
              <FilterButton type={null} label="전체" count={notifications.length} />
              <FilterButton type="chat" label="채팅" count={notifications.filter(n => (n.category || n.type) === 'chat').length} />
              <FilterButton type="matching" label="매칭" count={notifications.filter(n => (n.category || '').includes('matching') || n.type?.includes('match')).length} />
              <FilterButton type="session" label="세션" count={notifications.filter(n => (n.category || '').includes('session') || n.type?.includes('session')).length} />
              <FilterButton type="achievement" label="성취" count={notifications.filter(n => (n.category || n.type) === 'achievement').length} />
              <FilterButton type="system" label="시스템" count={notifications.filter(n => (n.category || n.type) === 'system').length} />
            </div>
          )}

          {/* Selection Mode Actions */}
          {isSelectionMode && (
            <div className="mt-4 flex items-center justify-between bg-blue-50 px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 font-medium"
                >
                  {selectedNotifications.length === notifications.length ? '전체 해제' : '전체 선택'}
                </button>
                <span className="text-sm text-[#929292]">
                  {selectedNotifications.length}개 선택됨
                </span>
              </div>
              
              {selectedNotifications.length > 0 && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleBulkAction('markAsRead')}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                  >
                    읽음 처리
                  </button>
                  <button
                    onClick={() => handleBulkAction('delete')}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                  >
                    삭제
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Notifications List */}
      <div className="px-6 py-4">
        {loading && notifications.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-[#00C471] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-[#929292] mt-2">알림을 불러오는 중...</p>
            </div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-[#929292] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#111111] mb-2">알림이 없습니다</h3>
            <p className="text-[#929292]">새로운 알림이 오면 여기에 표시됩니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedNotifications).map(([dateGroup, groupNotifications]) => (
              <div key={dateGroup}>
                <h3 className="text-sm font-medium text-[#929292] mb-2 sticky top-16 bg-[#FAFAFA] py-1">
                  {dateGroup}
                </h3>
                
                <div className="space-y-2">
                  {groupNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => !isSelectionMode && handleNotificationClick(notification)}
                      className={`
                        bg-white rounded-lg p-4 transition-all duration-200 border-l-4
                        ${!notification.isRead 
                          ? 'border-l-[#00C471] shadow-md' 
                          : 'border-l-gray-200 shadow-sm'
                        }
                        ${!isSelectionMode ? 'cursor-pointer hover:shadow-lg' : ''}
                        ${selectedNotifications.includes(notification.id) 
                          ? 'bg-blue-50 border-l-blue-500' 
                          : ''
                        }
                      `}
                    >
                      <div className="flex items-start space-x-3">
                        {isSelectionMode && (
                          <input
                            type="checkbox"
                            checked={selectedNotifications.includes(notification.id)}
                            onChange={() => handleSelectNotification(notification.id)}
                            className="mt-1"
                          />
                        )}
                        
                        <div className={`${getTypeColor(notification.category || notification.type)} mt-1`}>
                          {getTypeIcon(notification.category || notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-[#929292] font-medium">
                              {notification.category || '알림'}
                            </span>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-[#929292]">
                                {formatTime(notification.createdAt)}
                              </span>
                              {!isSelectionMode && (
                                <div className="flex space-x-1">
                                  {!notification.isRead && (
                                    <button
                                      onClick={(e) => handleMarkAsRead(notification.id, e)}
                                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                                      title="읽음 처리"
                                    >
                                      <Check className="w-3 h-3 text-[#929292]" />
                                    </button>
                                  )}
                                  <button
                                    onClick={(e) => handleDeleteNotification(notification.id, e)}
                                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                                    title="삭제"
                                  >
                                    <Trash2 className="w-3 h-3 text-[#929292]" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {notification.title && (
                            <h4 className={`font-medium text-sm mb-1 ${
                              !notification.isRead ? 'text-[#111111]' : 'text-[#606060]'
                            }`}>
                              {notification.title}
                            </h4>
                          )}
                          
                          <p className={`text-sm leading-relaxed ${
                            !notification.isRead ? 'text-[#414141]' : 'text-[#929292]'
                          }`}>
                            {notification.message || notification.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            {/* Load More Button */}
            {pagination.hasNext && (
              <div className="text-center mt-6">
                <CommonButton
                  onClick={handleLoadMore}
                  disabled={loading}
                  variant="secondary"
                  className="px-8"
                >
                  {loading ? '로딩 중...' : '더 보기'}
                </CommonButton>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Safe Area for Mobile */}
      <div className="h-20" />
    </div>
  );
};

export default NotificationList;
