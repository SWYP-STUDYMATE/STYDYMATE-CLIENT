import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Download, HardDrive, Clock, FileText, AlertCircle } from 'lucide-react';
import { exportUserData, getLoginHistory } from '../../api/settings';
import CommonButton from '../../components/CommonButton';

const DataSettings = () => {
  const navigate = useNavigate();
  const [loginHistory, setLoginHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState(null);

  useEffect(() => {
    loadLoginHistory();
  }, []);

  const loadLoginHistory = async () => {
    try {
      setLoading(true);
      const data = await getLoginHistory();
      setLoginHistory(data.slice(0, 10)); // 최근 10개만 표시
    } catch (error) {
      console.error('Failed to load login history:', error);
      setLoginHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    if (!window.confirm('개인 데이터를 내보내시겠습니까? 이 작업은 몇 분이 소요될 수 있습니다.')) {
      return;
    }

    try {
      setExporting(true);
      setExportStatus('데이터를 준비 중입니다...');
      
      const response = await exportUserData();
      
      if (response.downloadUrl) {
        // 다운로드 링크가 있는 경우 바로 다운로드
        const link = document.createElement('a');
        link.href = response.downloadUrl;
        link.download = response.filename || 'studymate-data.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setExportStatus('데이터 내보내기가 완료되었습니다.');
      } else if (response.requestId) {
        // 비동기 처리인 경우
        setExportStatus('데이터 준비가 완료되면 이메일로 다운로드 링크를 보내드립니다.');
      }
    } catch (error) {
      console.error('Failed to export data:', error);
      setExportStatus('데이터 내보내기에 실패했습니다.');
    } finally {
      setExporting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDeviceIcon = (device) => {
    if (device.toLowerCase().includes('mobile') || device.toLowerCase().includes('android') || device.toLowerCase().includes('iphone')) {
      return '📱';
    } else if (device.toLowerCase().includes('tablet') || device.toLowerCase().includes('ipad')) {
      return '📟';
    }
    return '💻';
  };

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
          <h1 className="text-xl font-bold text-[#111111]">데이터 관리</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="space-y-6">
        {/* 데이터 내보내기 */}
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#111111]">데이터 내보내기</h2>
            <Download className="w-5 h-5 text-[#929292]" />
          </div>
          
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-[#111111] mb-2">내보낼 데이터 항목</h3>
              <ul className="text-sm text-[#929292] space-y-1">
                <li>• 프로필 정보 및 설정</li>
                <li>• 채팅 메시지 기록</li>
                <li>• 학습 진도 및 통계</li>
                <li>• 세션 참여 기록</li>
                <li>• 매칭 기록</li>
                <li>• 성취 및 배지 정보</li>
                <li>• 업로드한 파일 목록</li>
              </ul>
            </div>

            {exportStatus && (
              <div className={`rounded-lg p-4 ${
                exportStatus.includes('완료') 
                  ? 'bg-green-50 border border-green-200'
                  : exportStatus.includes('실패')
                  ? 'bg-red-50 border border-red-200'
                  : 'bg-blue-50 border border-blue-200'
              }`}>
                <div className="flex items-center space-x-2">
                  <AlertCircle className={`w-5 h-5 ${
                    exportStatus.includes('완료') 
                      ? 'text-green-600'
                      : exportStatus.includes('실패')
                      ? 'text-red-600'
                      : 'text-blue-600'
                  }`} />
                  <span className={`text-sm font-medium ${
                    exportStatus.includes('완료') 
                      ? 'text-green-800'
                      : exportStatus.includes('실패')
                      ? 'text-red-800'
                      : 'text-blue-800'
                  }`}>
                    {exportStatus}
                  </span>
                </div>
              </div>
            )}

            <CommonButton
              onClick={handleExportData}
              disabled={exporting}
              variant="success"
              className="w-full"
            >
              {exporting ? '내보내는 중...' : '내 데이터 다운로드'}
            </CommonButton>
            
            <p className="text-xs text-[#929292]">
              * 데이터는 JSON 형식으로 제공되며, 개인정보보호법에 따라 요청일로부터 30일 후 삭제됩니다.
            </p>
          </div>
        </div>

        {/* 저장 공간 사용량 */}
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#111111]">저장 공간</h2>
            <HardDrive className="w-5 h-5 text-[#929292]" />
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2">
              <span className="text-[#111111]">프로필 이미지</span>
              <span className="text-[#929292] text-sm">2.3 MB</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-[#111111]">채팅 첨부파일</span>
              <span className="text-[#929292] text-sm">15.7 MB</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-[#111111]">세션 녹화파일</span>
              <span className="text-[#929292] text-sm">248.1 MB</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-[#111111]">레벨테스트 음성</span>
              <span className="text-[#929292] text-sm">12.5 MB</span>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-[#111111] font-semibold">총 사용량</span>
                <span className="text-[#111111] font-semibold">278.6 MB</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-[#00C471] h-2 rounded-full" style={{ width: '27.86%' }}></div>
              </div>
              <p className="text-xs text-[#929292] mt-1">1GB 중 278.6MB 사용</p>
            </div>
          </div>
        </div>

        {/* 로그인 기록 */}
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#111111]">최근 로그인 기록</h2>
            <Clock className="w-5 h-5 text-[#929292]" />
          </div>
          
          <div className="space-y-3">
            {loginHistory.length > 0 ? (
              <>
                {loginHistory.map((record, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{getDeviceIcon(record.device)}</span>
                      <div>
                        <p className="text-[#111111] font-medium">{record.location || '알 수 없는 위치'}</p>
                        <p className="text-sm text-[#929292]">{record.device}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-[#111111]">{formatDate(record.loginTime)}</p>
                      <p className="text-xs text-[#929292]">{record.ipAddress}</p>
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={() => navigate('/settings/login-history')}
                  className="w-full py-3 text-[#00C471] hover:text-[#00B267] transition-colors text-center"
                >
                  전체 로그인 기록 보기
                </button>
              </>
            ) : (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-[#929292] mx-auto mb-3" />
                <p className="text-[#929292]">로그인 기록이 없습니다.</p>
              </div>
            )}
          </div>
        </div>

        {/* 데이터 보존 정책 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-blue-900 mb-2">데이터 보존 정책</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• 계정 활성화 중: 모든 데이터가 보존됩니다</p>
                <p>• 계정 비활성화: 6개월 후 개인정보가 익명화됩니다</p>
                <p>• 계정 삭제: 즉시 개인정보가 삭제되며, 30일 후 완전 삭제됩니다</p>
                <p>• 법적 요구사항에 따라 일부 데이터는 더 오래 보존될 수 있습니다</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pb-8" />
    </div>
  );
};

export default DataSettings;