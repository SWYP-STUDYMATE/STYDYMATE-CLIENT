import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CommonButton from '../../components/CommonButton';
import { Mic, Wifi, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function LevelTestCheck() {
  const navigate = useNavigate();
  const [micPermission, setMicPermission] = useState('checking');
  const [internetConnection, setInternetConnection] = useState('checking');
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    // Check microphone permission
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setMicPermission('granted');
    } catch (error) {
      setMicPermission('denied');
    }

    // Check internet connection
    if (navigator.onLine) {
      setInternetConnection('connected');
    } else {
      setInternetConnection('disconnected');
    }

    setTimeout(() => {
      setIsChecking(false);
    }, 1500);
  };

  const handleContinue = () => {
    if (micPermission === 'granted' && internetConnection === 'connected') {
      navigate('/level-test/recording');
    }
  };

  const handleRetry = () => {
    setIsChecking(true);
    setMicPermission('checking');
    setInternetConnection('checking');
    checkPermissions();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'checking':
        return <Loader2 className="w-5 h-5 text-[#929292] animate-spin" />;
      case 'granted':
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-[#00C471]" />;
      case 'denied':
      case 'disconnected':
        return <XCircle className="w-5 h-5 text-[#EA4335]" />;
      default:
        return null;
    }
  };

  const getStatusText = (type, status) => {
    if (type === 'mic') {
      switch (status) {
        case 'checking':
          return '확인 중...';
        case 'granted':
          return '마이크 사용 가능';
        case 'denied':
          return '마이크 권한이 필요합니다';
        default:
          return '';
      }
    } else {
      switch (status) {
        case 'checking':
          return '확인 중...';
        case 'connected':
          return '인터넷 연결됨';
        case 'disconnected':
          return '인터넷 연결을 확인해주세요';
        default:
          return '';
      }
    }
  };

  const canContinue = micPermission === 'granted' && internetConnection === 'connected';

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#E7E7E7] px-6 py-4">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className="text-[18px] font-bold text-[#111111] flex-1 text-center mr-6">
            연결 확인
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-[400px]">
          {/* Title */}
          <h2 className="text-[24px] font-bold text-[#111111] mb-3 text-center">
            테스트 환경을 확인하고 있어요
          </h2>

          {/* Description */}
          <p className="text-[16px] text-[#929292] mb-8 text-center">
            원활한 테스트를 위해 필요한 권한을 확인합니다
          </p>

          {/* Check Items */}
          <div className="space-y-4 mb-8">
            {/* Microphone Check */}
            <div className="bg-white rounded-[10px] p-4 border border-[#E7E7E7]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#E6F9F1] rounded-full flex items-center justify-center">
                    <Mic className="w-5 h-5 text-[#00C471]" />
                  </div>
                  <div>
                    <p className="text-[14px] font-medium text-[#111111]">마이크</p>
                    <p className="text-[12px] text-[#929292]">
                      {getStatusText('mic', micPermission)}
                    </p>
                  </div>
                </div>
                {getStatusIcon(micPermission)}
              </div>
            </div>

            {/* Internet Check */}
            <div className="bg-white rounded-[10px] p-4 border border-[#E7E7E7]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#E6F9F1] rounded-full flex items-center justify-center">
                    <Wifi className="w-5 h-5 text-[#00C471]" />
                  </div>
                  <div>
                    <p className="text-[14px] font-medium text-[#111111]">인터넷</p>
                    <p className="text-[12px] text-[#929292]">
                      {getStatusText('internet', internetConnection)}
                    </p>
                  </div>
                </div>
                {getStatusIcon(internetConnection)}
              </div>
            </div>
          </div>

          {/* Notice */}
          {micPermission === 'denied' && (
            <div className="bg-[#FFF9E6] rounded-[10px] p-4 mb-6">
              <p className="text-[12px] text-[#8B7A00]">
                💡 브라우저 설정에서 마이크 권한을 허용해주세요
              </p>
            </div>
          )}

          {!isChecking && !canContinue && (
            <CommonButton
              onClick={handleRetry}
              variant="secondary"
              className="w-full mb-3"
            >
              다시 확인
            </CommonButton>
          )}
        </div>
      </div>

      {/* Bottom Button */}
      <div className="px-6 pb-6 bg-white pt-4 border-t border-[#E7E7E7]">
        <CommonButton
          onClick={handleContinue}
          variant="primary"
          className="w-full"
          disabled={!canContinue || isChecking}
        >
          {isChecking ? '확인 중...' : '계속하기'}
        </CommonButton>
      </div>
    </div>
  );
}