import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Clock, MapPin, Monitor, AlertTriangle } from 'lucide-react';
import { getLoginHistory } from '../../api/settings';

const LoginHistory = () => {
  const navigate = useNavigate();
  const [loginHistory, setLoginHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, suspicious, recent

  useEffect(() => {
    loadLoginHistory();
  }, []);

  const loadLoginHistory = async () => {
    try {
      setLoading(true);
      const data = await getLoginHistory();
      // 배열인지 확인 후 설정
      setLoginHistory(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load login history:', error);
      setLoginHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 60) {
      return `${diffInMinutes}분 전`;
    } else if (diffInHours < 24) {
      return `${diffInHours}시간 전`;
    } else if (diffInDays < 7) {
      return `${diffInDays}일 전`;
    } else {
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getDeviceIcon = (device) => {
    if (device.toLowerCase().includes('mobile') || device.toLowerCase().includes('android') || device.toLowerCase().includes('iphone')) {
      return '📱';
    } else if (device.toLowerCase().includes('tablet') || device.toLowerCase().includes('ipad')) {
      return '📟';
    }
    return '💻';
  };

  const getStatusBadge = (record) => {
    const now = new Date();
    const loginTime = new Date(record.loginTime);
    const diffInHours = (now - loginTime) / (1000 * 60 * 60);

    if (record.suspicious) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <AlertTriangle className="w-3 h-3 mr-1" />
          의심스러움
        </span>
      );
    } else if (diffInHours <= 1) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          현재 세션
        </span>
      );
    } else if (diffInHours <= 24) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          최근
        </span>
      );
    }
    return null;
  };

  const filteredHistory = Array.isArray(loginHistory)
    ? loginHistory.filter(record => {
        if (filter === 'suspicious') return record.suspicious;
        if (filter === 'recent') {
          const now = new Date();
          const loginTime = new Date(record.loginTime);
          const diffInHours = (now - loginTime) / (1000 * 60 * 60);
          return diffInHours <= 24;
        }
        return true;
      })
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#00C471] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-[#929292] mt-2">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] px-6">
      {/* Header */}
      <div className="pt-12 pb-6">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-[#111111] rotate-180" />
          </button>
          <h1 className="text-xl font-bold text-[#111111]">로그인 기록</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-white rounded-lg p-1">
          {[
            { id: 'all', label: '전체' },
            { id: 'recent', label: '최근 24시간' },
            { id: 'suspicious', label: '의심스러운 활동' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                filter === tab.id
                  ? 'bg-[#00C471] text-white'
                  : 'text-[#929292] hover:text-[#111111] hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Login History List */}
      <div className="space-y-3">
        {filteredHistory.length > 0 ? (
          filteredHistory.map((record, index) => (
            <div key={index} className="bg-white rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl mt-1">{getDeviceIcon(record.device)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-[#111111] font-medium truncate">
                        {record.location || '알 수 없는 위치'}
                      </h3>
                      {getStatusBadge(record)}
                    </div>
                    
                    <div className="space-y-1 text-sm text-[#929292]">
                      <div className="flex items-center space-x-1">
                        <Monitor className="w-4 h-4" />
                        <span>{record.device}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{record.ipAddress}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatDate(record.loginTime)}</span>
                      </div>
                    </div>

                    {record.browser && (
                      <div className="mt-2 text-xs text-[#929292]">
                        브라우저: {record.browser}
                      </div>
                    )}

                    {record.suspicious && (
                      <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-2">
                        <div className="flex items-center space-x-1">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                          <span className="text-xs font-medium text-red-800">의심스러운 활동</span>
                        </div>
                        <p className="text-xs text-red-700 mt-1">
                          {record.suspiciousReason || '일반적이지 않은 위치나 기기에서 로그인했습니다.'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg p-8 text-center">
            <Clock className="w-12 h-12 text-[#929292] mx-auto mb-3" />
            <h3 className="text-[#111111] font-medium mb-1">
              {filter === 'suspicious' 
                ? '의심스러운 활동이 없습니다' 
                : filter === 'recent'
                ? '최근 24시간 내 로그인 기록이 없습니다'
                : '로그인 기록이 없습니다'
              }
            </h3>
            <p className="text-[#929292] text-sm">
              {filter === 'suspicious' 
                ? '계정이 안전하게 보호되고 있습니다.'
                : '로그인 기록은 보안상 최대 90일간 보관됩니다.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Security Notice */}
      {filteredHistory.some(record => record.suspicious) && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-yellow-900 mb-2">보안 알림</h3>
              <p className="text-sm text-yellow-800 mb-3">
                의심스러운 로그인 활동이 감지되었습니다. 본인이 아닌 경우 즉시 비밀번호를 변경하세요.
              </p>
              <button
                onClick={() => navigate('/settings/security')}
                className="text-sm text-yellow-900 font-medium hover:text-yellow-700 underline"
              >
                보안 설정으로 이동 →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mt-6 text-center">
        <p className="text-xs text-[#929292]">
          로그인 기록은 계정 보안을 위해 90일간 보관됩니다.
        </p>
        <p className="text-xs text-[#929292]">
          의심스러운 활동이 발견되면 즉시 비밀번호를 변경하시기 바랍니다.
        </p>
      </div>

      <div className="pb-8" />
    </div>
  );
};

export default LoginHistory;