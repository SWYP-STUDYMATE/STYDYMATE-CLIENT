import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, AlertTriangle, Trash2, Eye, EyeOff } from 'lucide-react';
import { deleteAccount } from '../../api/settings';
import CommonButton from '../../components/CommonButton';
import { useAlert } from '../../hooks/useAlert';

const DeleteAccount = () => {
  const navigate = useNavigate();
  const { showError, showSuccess, confirmAction } = useAlert();
  const [step, setStep] = useState(1); // 1: 확인, 2: 사유 선택, 3: 비밀번호
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [feedback, setFeedback] = useState('');
  const [agreements, setAgreements] = useState({
    dataLoss: false,
    noRecovery: false,
    immediate: false
  });
  const [deleting, setDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const deleteReasons = [
    { id: 'not_useful', label: '더 이상 사용하지 않음' },
    { id: 'privacy_concerns', label: '개인정보 보호 우려' },
    { id: 'found_alternative', label: '다른 서비스를 찾음' },
    { id: 'technical_issues', label: '기술적 문제' },
    { id: 'cost_concerns', label: '비용 문제' },
    { id: 'poor_experience', label: '사용자 경험 불만' },
    { id: 'other', label: '기타' }
  ];

  const handleDeleteAccount = async () => {
    if (!password.trim()) {
      showError('비밀번호를 입력해주세요.');
      return;
    }

    if (!Object.values(agreements).every(Boolean)) {
      showError('모든 항목에 동의해주세요.');
      return;
    }

    // 확인 텍스트 검증
    const requiredText = 'STUDYMATE 계정을 영구적으로 삭제하시겠습니까?';
    if (confirmText !== requiredText) {
      showError('확인 텍스트를 정확히 입력해주세요.');
      return;
    }

    try {
      setDeleting(true);
      await deleteAccount(password);
      
      // 로컬 스토리지 클리어
      localStorage.clear();
      sessionStorage.clear();
      
      showSuccess(
        '계정이 성공적으로 삭제되었습니다. 그동안 STUDYMATE를 이용해주셔서 감사했습니다.',
        () => {
          // 메인 페이지로 이동
          window.location.href = '/';
        }
      );
    } catch (error) {
      console.error('Failed to delete account:', error);
      if (error.response?.status === 401) {
        showError('비밀번호가 올바르지 않습니다.');
      } else {
        showError('계정 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleAgreementChange = (field) => {
    setAgreements(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

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
          <h1 className="text-xl font-bold text-[#111111]">계정 삭제</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="space-y-6">
        {/* Warning Notice */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="font-semibold text-red-900 mb-2">⚠️ 중요한 안내</h2>
              <p className="text-red-800 text-sm leading-relaxed">
                계정을 삭제하면 <strong>모든 데이터가 영구적으로 삭제</strong>되며, 
                이후 복구할 수 없습니다. 신중히 결정해주세요.
              </p>
            </div>
          </div>
        </div>

        {step === 1 && (
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-lg font-semibold text-[#111111] mb-4">삭제될 데이터</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Trash2 className="w-5 h-5 text-red-500" />
                <span className="text-[#111111]">프로필 정보 및 설정</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Trash2 className="w-5 h-5 text-red-500" />
                <span className="text-[#111111]">모든 채팅 메시지 기록</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Trash2 className="w-5 h-5 text-red-500" />
                <span className="text-[#111111]">학습 진도 및 통계</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Trash2 className="w-5 h-5 text-red-500" />
                <span className="text-[#111111]">세션 참여 기록</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Trash2 className="w-5 h-5 text-red-500" />
                <span className="text-[#111111]">매칭 기록 및 연결</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Trash2 className="w-5 h-5 text-red-500" />
                <span className="text-[#111111]">업로드한 파일 및 이미지</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Trash2 className="w-5 h-5 text-red-500" />
                <span className="text-[#111111]">성취 및 배지 정보</span>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <CommonButton
                onClick={() => setStep(2)}
                variant="danger"
                className="flex-1"
              >
                계정 삭제 진행
              </CommonButton>
              <CommonButton
                onClick={() => navigate(-1)}
                variant="secondary"
                className="flex-1"
              >
                취소
              </CommonButton>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-lg font-semibold text-[#111111] mb-4">삭제 사유 (선택사항)</h2>
            <p className="text-sm text-[#929292] mb-4">
              서비스 개선을 위해 계정 삭제 사유를 알려주세요. 이 정보는 익명으로 처리됩니다.
            </p>
            
            <div className="space-y-2 mb-4">
              {deleteReasons.map(reason => (
                <label key={reason.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="deleteReason"
                    value={reason.id}
                    checked={deleteReason === reason.id}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                  />
                  <span className="ml-3 text-[#111111]">{reason.label}</span>
                </label>
              ))}
            </div>

            {deleteReason === 'other' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#111111] mb-2">기타 사유</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors resize-none"
                  rows="3"
                  placeholder="삭제 사유를 알려주세요"
                  maxLength="500"
                />
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-[#111111] mb-2">추가 의견 (선택사항)</label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors resize-none"
                rows="3"
                placeholder="서비스 개선을 위한 의견을 남겨주세요"
                maxLength="500"
              />
            </div>
            
            <div className="flex space-x-3">
              <CommonButton
                onClick={() => setStep(3)}
                variant="danger"
                className="flex-1"
              >
                다음 단계
              </CommonButton>
              <CommonButton
                onClick={() => setStep(1)}
                variant="secondary"
                className="flex-1"
              >
                이전
              </CommonButton>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-lg font-semibold text-[#111111] mb-4">계정 삭제 확인</h2>
            
            {/* 동의 사항 */}
            <div className="space-y-4 mb-6">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="dataLoss"
                  checked={agreements.dataLoss}
                  onChange={() => handleAgreementChange('dataLoss')}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 mt-1"
                />
                <label htmlFor="dataLoss" className="text-sm text-[#111111]">
                  모든 데이터가 영구적으로 삭제되며 복구할 수 없다는 것을 이해합니다.
                </label>
              </div>
              
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="noRecovery"
                  checked={agreements.noRecovery}
                  onChange={() => handleAgreementChange('noRecovery')}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 mt-1"
                />
                <label htmlFor="noRecovery" className="text-sm text-[#111111]">
                  삭제 후에는 어떤 방법으로도 계정을 복구할 수 없다는 것을 이해합니다.
                </label>
              </div>
              
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="immediate"
                  checked={agreements.immediate}
                  onChange={() => handleAgreementChange('immediate')}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 mt-1"
                />
                <label htmlFor="immediate" className="text-sm text-[#111111]">
                  계정 삭제가 즉시 처리되며, 진행 중인 세션이나 결제가 중단될 수 있다는 것을 이해합니다.
                </label>
              </div>
            </div>

            {/* 비밀번호 입력 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#111111] mb-2">
                비밀번호 확인
              </label>
              <p className="text-sm text-[#929292] mb-3">
                계정 삭제를 위해 현재 비밀번호를 입력해주세요.
              </p>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="현재 비밀번호"
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-[#929292] hover:text-[#111111] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* 최종 확인 텍스트 입력 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#111111] mb-2">
                최종 확인
              </label>
              <p className="text-sm text-[#929292] mb-3">
                계정 삭제를 확인하기 위해 아래 텍스트를 정확히 입력해주세요:
              </p>
              <p className="text-sm font-medium text-red-600 mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                STUDYMATE 계정을 영구적으로 삭제하시겠습니까?
              </p>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="위의 텍스트를 정확히 입력하세요"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              />
            </div>

            <div className="flex space-x-3">
              <CommonButton
                onClick={handleDeleteAccount}
                disabled={
                  deleting || 
                  !Object.values(agreements).every(Boolean) || 
                  !password.trim() ||
                  confirmText !== 'STUDYMATE 계정을 영구적으로 삭제하시겠습니까?'
                }
                variant="danger"
                className="flex-1"
              >
                {deleting ? '삭제 중...' : '계정 영구 삭제'}
              </CommonButton>
              <CommonButton
                onClick={() => setStep(2)}
                variant="secondary"
                className="flex-1"
              >
                이전
              </CommonButton>
            </div>
          </div>
        )}

        {/* 대안 제시 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-medium text-blue-900 mb-3">잠시만요! 다른 옵션을 고려해보세요</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>• <strong>계정 비활성화</strong>: 데이터를 보존하면서 일시적으로 계정을 비활성화할 수 있습니다.</p>
            <p>• <strong>개인정보 수정</strong>: 개인정보 설정에서 공개 범위를 조정할 수 있습니다.</p>
            <p>• <strong>알림 끄기</strong>: 알림 설정에서 모든 알림을 비활성화할 수 있습니다.</p>
            <p>• <strong>고객 지원</strong>: 문제가 있다면 고객 지원팀에 문의해주세요.</p>
          </div>
          <div className="flex space-x-2 mt-4">
            <button
              onClick={() => navigate('/settings/account')}
              className="text-sm text-blue-900 font-medium hover:text-blue-700 underline"
            >
              계정 설정으로 이동
            </button>
            <span className="text-blue-600">|</span>
            <button
              onClick={() => window.open('mailto:support@studymate.com')}
              className="text-sm text-blue-900 font-medium hover:text-blue-700 underline"
            >
              고객 지원 문의
            </button>
          </div>
        </div>
      </div>

      <div className="pb-8" />
    </div>
  );
};

export default DeleteAccount;