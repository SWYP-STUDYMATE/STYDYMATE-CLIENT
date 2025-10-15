import React, { useState, useEffect } from 'react';
import api from '../api';

const ServerStatusIndicator = () => {
  const [serverStatus, setServerStatus] = useState('checking'); // 'online', 'offline', 'checking'
  const [lastChecked, setLastChecked] = useState(null);

  const checkServerStatus = async () => {
    try {
      await api.get('/health');
      setServerStatus('online');
      setLastChecked(new Date());
    } catch {
      setServerStatus('offline');
      setLastChecked(new Date());
    }
  };

  useEffect(() => {
    checkServerStatus();

    // 서버가 오프라인일 때만 30초마다 재시도
    let interval;
    if (serverStatus === 'offline') {
      interval = setInterval(checkServerStatus, 30000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [serverStatus]);

  if (serverStatus === 'checking') {
    return null; // 첫 로딩 시에는 표시하지 않음
  }

  if (serverStatus === 'online') {
    return null; // 서버가 정상일 때는 표시하지 않음
  }

  return (
    <div 
      className="fixed top-0 left-0 right-0 bg-red text-white text-center py-3 px-4 z-50"
      style={{ zIndex: 10000 }}
    >
      <div className="flex items-center justify-center gap-3">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        <div>
          <div className="font-medium">서버 연결 중단</div>
          <div className="text-sm opacity-90">
            현재 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.
          </div>
        </div>
        <button
          onClick={checkServerStatus}
          className="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded text-sm transition-colors"
        >
          다시 확인
        </button>
      </div>
      {lastChecked && (
        <div className="text-xs opacity-75 mt-1">
          마지막 확인: {lastChecked.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default ServerStatusIndicator;
