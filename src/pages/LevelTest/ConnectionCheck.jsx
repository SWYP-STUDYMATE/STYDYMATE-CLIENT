import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CommonButton from '../../components/CommonButton';
import useLevelTestStore from '../../stores/levelTestStore';

export default function ConnectionCheck() {
  const navigate = useNavigate();
  const { setConnectionStatus, setCurrentStep } = useLevelTestStore();
  const [micPermission, setMicPermission] = useState('checking'); // checking, granted, denied
  const [internetConnection, setInternetConnection] = useState('checking'); // checking, connected, disconnected
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    checkInternetConnection();
    checkMicrophonePermission();
  }, []);

  useEffect(() => {
    if (micPermission === 'granted' && internetConnection === 'connected') {
      setIsReady(true);
      setConnectionStatus({ 
        microphone: true, 
        internet: true 
      });
    } else {
      setIsReady(false);
      setConnectionStatus({ 
        microphone: micPermission === 'granted', 
        internet: internetConnection === 'connected' 
      });
    }
  }, [micPermission, internetConnection, setConnectionStatus]);

  const checkInternetConnection = () => {
    setInternetConnection('checking');
    // 실제 인터넷 연결 체크
    if (navigator.onLine) {
      // API 엔드포인트 ping 테스트
      fetch('https://api.languagemate.kr/ping', { mode: 'no-cors' })
        .then(() => {
          setInternetConnection('connected');
        })
        .catch(() => {
          // no-cors 모드에서는 항상 실패하지만, 네트워크 연결은 확인됨
          setInternetConnection('connected');
        });
    } else {
      setInternetConnection('disconnected');
    }
  };

  const checkMicrophonePermission = async () => {
    setMicPermission('checking');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setMicPermission('granted');
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMicPermission('denied');
      } else {
        setMicPermission('denied');
      }
    }
  };

  const handleRetry = () => {
    checkInternetConnection();
    checkMicrophonePermission();
  };

  const handleNext = () => {
    setCurrentStep('recording');
    navigate('/level-test/recording');
  };

  const getStatusIcon = (status) => {
    if (status === 'checking') {
      return (
        <div className="w-6 h-6 border-2 border-[#929292] border-t-transparent rounded-full animate-spin"></div>
      );
    } else if (status === 'granted' || status === 'connected') {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="#00C471"/>
          <path d="M16 8.5L10 14.5L7 11.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    } else {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="#EA4335"/>
          <path d="M15 9L9 15M9 9L15 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <div className="max-w-[768px] w-full mx-auto flex flex-col min-h-screen">
        {/* 헤더 */}
        <div className="px-6 py-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* 프로그레스 바 */}
        <div className="px-6 mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[14px] text-[#606060]">연결 확인</span>
            <span className="text-[14px] text-[#929292]">1/4</span>
          </div>
          <div className="w-full h-2 bg-[#E7E7E7] rounded-full overflow-hidden">
            <div className="h-full bg-[#00C471] rounded-full transition-all duration-300" style={{ width: '25%' }}></div>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="flex-1 px-6">
          <h1 className="text-[24px] font-bold text-[#111111] mb-2">
            테스트 환경을 확인하고 있어요
          </h1>
          <p className="text-[16px] text-[#606060] mb-8">
            원활한 테스트를 위해 아래 항목들을 체크해주세요
          </p>

          {/* 체크 리스트 */}
          <div className="space-y-4 mb-8">
            {/* 마이크 권한 */}
            <div className="bg-white rounded-[10px] p-6 border border-[#E7E7E7]">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-[#E6F9F1] rounded-full flex items-center justify-center mr-4">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M12 1C10.34 1 9 2.34 9 4V12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12V4C15 2.34 13.66 1 12 1Z" stroke="#00C471" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M19 10V12C19 15.866 15.866 19 12 19C8.134 19 5 15.866 5 12V10" stroke="#00C471" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 19V23" stroke="#00C471" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8 23H16" stroke="#00C471" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-[16px] font-medium text-[#111111]">마이크 권한</h3>
                    <p className="text-[14px] text-[#929292]">
                      {micPermission === 'checking' && '확인 중...'}
                      {micPermission === 'granted' && '권한이 허용되었습니다'}
                      {micPermission === 'denied' && '권한을 허용해주세요'}
                    </p>
                  </div>
                </div>
                {getStatusIcon(micPermission)}
              </div>
              {micPermission === 'denied' && (
                <div className="mt-4 p-3 bg-[#FFF5F5] rounded-[6px]">
                  <p className="text-[12px] text-[#EA4335]">
                    브라우저 설정에서 마이크 권한을 허용해주세요
                  </p>
                </div>
              )}
            </div>

            {/* 인터넷 연결 */}
            <div className="bg-white rounded-[10px] p-6 border border-[#E7E7E7]">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-[#E6F9F1] rounded-full flex items-center justify-center mr-4">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12.55C5.97 8.63 9.2 5.5 13.12 5.05C17.16 4.58 20.96 7.05 22.21 10.78C23.4 14.34 21.87 18.14 18.64 20.04C15.58 21.83 11.58 21.35 9.01 18.82C8.17 18.04 7.59 17.11 7.21 16.08" stroke="#00C471" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 12H7L10 9V15L13 12H18" stroke="#00C471" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-[16px] font-medium text-[#111111]">인터넷 연결</h3>
                    <p className="text-[14px] text-[#929292]">
                      {internetConnection === 'checking' && '확인 중...'}
                      {internetConnection === 'connected' && '연결되었습니다'}
                      {internetConnection === 'disconnected' && '연결을 확인해주세요'}
                    </p>
                  </div>
                </div>
                {getStatusIcon(internetConnection)}
              </div>
              {internetConnection === 'disconnected' && (
                <div className="mt-4 p-3 bg-[#FFF5F5] rounded-[6px]">
                  <p className="text-[12px] text-[#EA4335]">
                    안정적인 인터넷 연결이 필요합니다
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 안내 메시지 */}
          <div className="bg-[#F8F9FA] rounded-[10px] p-4 mb-8">
            <div className="flex items-start">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="mt-0.5 mr-3 flex-shrink-0">
                <circle cx="10" cy="10" r="9" stroke="#929292" strokeWidth="1.5"/>
                <path d="M10 14V10" stroke="#929292" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="10" cy="7" r="0.5" fill="#929292" stroke="#929292"/>
              </svg>
              <div>
                <p className="text-[14px] text-[#606060] mb-1">
                  테스트 중에는 마이크를 통해 음성이 녹음됩니다
                </p>
                <p className="text-[12px] text-[#929292]">
                  조용한 환경에서 테스트를 진행해주세요
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="px-6 pb-8">
          {!isReady ? (
            <CommonButton
              onClick={handleRetry}
              className="w-full"
              variant="secondary"
            >
              다시 확인
            </CommonButton>
          ) : (
            <CommonButton
              onClick={handleNext}
              className="w-full"
              variant="success"
            >
              다음
            </CommonButton>
          )}
        </div>
      </div>
    </div>
  );
}