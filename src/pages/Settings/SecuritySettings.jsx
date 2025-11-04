import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Key, Shield, Smartphone, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { getTwoFactorSettings, enableTwoFactor, disableTwoFactor, changePassword } from '../../api/settings';
import CommonButton from '../../components/CommonButton';
import { useAlert } from '../../hooks/useAlert';

const SecuritySettings = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(true);
  
  // 비밀번호 변경 상태
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // 2FA 상태
  const [show2FAForm, setShow2FAForm] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSecuritySettings();
  }, []);

  const loadSecuritySettings = async () => {
    try {
      setLoading(true);
      const data = await getTwoFactorSettings();
      setTwoFactorEnabled(data.enabled);
      if (data.qrCode) {
        setQrCode(data.qrCode);
      }
    } catch (error) {
      console.error('Failed to load security settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showError('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    
    if (passwordForm.newPassword.length < 8) {
      showError('비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    try {
      setSaving(true);
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      showSuccess('비밀번호가 성공적으로 변경되었습니다.');
      setShowPasswordForm(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Failed to change password:', error);
      showError('비밀번호 변경에 실패했습니다. 현재 비밀번호를 확인해주세요.');
    } finally {
      setSaving(false);
    }
  };

  const handleEnable2FA = async () => {
    try {
      setSaving(true);
      const response = await enableTwoFactor();
      setQrCode(response.qrCode);
      setShow2FAForm(true);
    } catch (error) {
      console.error('Failed to enable 2FA:', error);
      showError('2단계 인증 활성화에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!verificationCode) {
      showError('인증 코드를 입력해주세요.');
      return;
    }

    try {
      setSaving(true);
      await disableTwoFactor(verificationCode);
      setTwoFactorEnabled(false);
      setShow2FAForm(false);
      setVerificationCode('');
      showSuccess('2단계 인증이 비활성화되었습니다.');
    } catch (error) {
      console.error('Failed to disable 2FA:', error);
      showError('인증 코드가 올바르지 않습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!verificationCode) {
      showError('인증 코드를 입력해주세요.');
      return;
    }

    try {
      setSaving(true);
      await disableTwoFactor(verificationCode); // 인증 확인용
      setTwoFactorEnabled(true);
      setShow2FAForm(false);
      setVerificationCode('');
      showSuccess('2단계 인증이 활성화되었습니다.');
    } catch (error) {
      console.error('Failed to verify 2FA:', error);
      showError('인증 코드가 올바르지 않습니다.');
    } finally {
      setSaving(false);
    }
  };

  const PasswordInput = ({ 
    value, 
    onChange, 
    placeholder, 
    show, 
    onToggleShow, 
    autoComplete = "current-password" 
  }) => (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00C471] focus:border-[#00C471] transition-colors"
      />
      <button
        type="button"
        onClick={onToggleShow}
        className="absolute right-3 top-3.5 text-[#929292] hover:text-[#111111] transition-colors"
      >
        {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  );

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
    <div className="min-h-screen bg-[#FAFAFA] px-4 sm:px-6 overflow-y-auto">
      {/* Header */}
      <div className="pt-8 sm:pt-10 md:pt-12 pb-4 sm:pb-5 md:pb-6">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white rounded-lg transition-colors touch-manipulation"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-[#111111] rotate-180" />
          </button>
          <h1 className="text-[18px] sm:text-[19px] md:text-xl font-bold text-[#111111] break-words">보안 설정</h1>
          <div className="w-8 sm:w-10" />
        </div>
      </div>

      <div className="space-y-4 sm:space-y-5 md:space-y-6">
        {/* 비밀번호 변경 */}
        <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-[16px] sm:text-[17px] md:text-lg font-semibold text-[#111111] break-words">비밀번호</h2>
            <Key className="w-4 h-4 sm:w-5 sm:h-5 text-[#929292]" />
          </div>
          
          {!showPasswordForm ? (
            <div>
              <p className="text-[12px] sm:text-[13px] md:text-sm text-[#929292] mb-3 sm:mb-4 break-words leading-[1.4] sm:leading-[1.5]">
                계정 보안을 위해 정기적으로 비밀번호를 변경하는 것을 권장합니다.
              </p>
              <CommonButton
                onClick={() => setShowPasswordForm(true)}
                variant="secondary"
                className="w-full text-[14px] sm:text-[15px] md:text-base py-[14px] touch-manipulation"
              >
                비밀번호 변경
              </CommonButton>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-[13px] sm:text-[14px] md:text-sm font-medium text-[#111111] mb-2 break-words">현재 비밀번호</label>
                <PasswordInput
                  value={passwordForm.currentPassword}
                  onChange={(value) => setPasswordForm(prev => ({...prev, currentPassword: value}))}
                  placeholder="현재 비밀번호를 입력하세요"
                  show={showCurrentPassword}
                  onToggleShow={() => setShowCurrentPassword(!showCurrentPassword)}
                  autoComplete="current-password"
                />
              </div>
              
              <div>
                <label className="block text-[13px] sm:text-[14px] md:text-sm font-medium text-[#111111] mb-2 break-words">새 비밀번호</label>
                <PasswordInput
                  value={passwordForm.newPassword}
                  onChange={(value) => setPasswordForm(prev => ({...prev, newPassword: value}))}
                  placeholder="새 비밀번호를 입력하세요 (8자 이상)"
                  show={showNewPassword}
                  onToggleShow={() => setShowNewPassword(!showNewPassword)}
                  autoComplete="new-password"
                />
              </div>
              
              <div>
                <label className="block text-[13px] sm:text-[14px] md:text-sm font-medium text-[#111111] mb-2 break-words">비밀번호 확인</label>
                <PasswordInput
                  value={passwordForm.confirmPassword}
                  onChange={(value) => setPasswordForm(prev => ({...prev, confirmPassword: value}))}
                  placeholder="새 비밀번호를 다시 입력하세요"
                  show={showConfirmPassword}
                  onToggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
                  autoComplete="new-password"
                />
              </div>
              
              <div className="flex space-x-2 sm:space-x-3 pt-2">
                <CommonButton
                  onClick={handlePasswordChange}
                  disabled={saving}
                  variant="success"
                  className="flex-1 text-[14px] sm:text-[15px] md:text-base py-[14px] touch-manipulation"
                >
                  {saving ? '변경 중...' : '변경하기'}
                </CommonButton>
                <CommonButton
                  onClick={() => setShowPasswordForm(false)}
                  variant="secondary"
                  className="flex-1 text-[14px] sm:text-[15px] md:text-base py-[14px] touch-manipulation"
                >
                  취소
                </CommonButton>
              </div>
            </div>
          )}
        </div>

        {/* 2단계 인증 */}
        <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-[16px] sm:text-[17px] md:text-lg font-semibold text-[#111111] break-words">2단계 인증</h2>
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-[#929292]" />
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-start space-x-2 sm:space-x-3">
              <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-[#00C471] mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-[#111111] text-[14px] sm:text-[15px] md:text-base break-words">모바일 앱 인증</h3>
                <p className="text-[12px] sm:text-[13px] md:text-sm text-[#929292] break-words leading-[1.4] sm:leading-[1.5]">
                  Google Authenticator, Authy 등의 앱으로 추가 보안 계층을 제공합니다.
                </p>
                <p className="text-[11px] sm:text-[12px] text-[#929292] mt-1 break-words">
                  현재 상태: {twoFactorEnabled ? 
                    <span className="text-[#00C471] font-medium">활성화됨</span> : 
                    <span className="text-[#929292]">비활성화됨</span>
                  }
                </p>
              </div>
            </div>
            
            {!twoFactorEnabled && !show2FAForm && (
              <CommonButton
                onClick={handleEnable2FA}
                disabled={saving}
                variant="success"
                className="w-full text-[14px] sm:text-[15px] md:text-base py-[14px] touch-manipulation"
              >
                {saving ? '설정 중...' : '2단계 인증 활성화'}
              </CommonButton>
            )}
            
            {show2FAForm && !twoFactorEnabled && (
              <div className="space-y-3 sm:space-y-4 border-t border-gray-100 pt-3 sm:pt-4">
                <div className="text-center">
                  <h4 className="font-medium text-[#111111] mb-2 text-[14px] sm:text-[15px] md:text-base break-words">QR 코드 스캔</h4>
                  <p className="text-[12px] sm:text-[13px] md:text-sm text-[#929292] mb-3 sm:mb-4 break-words leading-[1.4] sm:leading-[1.5]">
                    인증 앱으로 아래 QR 코드를 스캔하고, 생성된 6자리 코드를 입력하세요.
                  </p>
                  {qrCode && (
                    <div className="bg-gray-100 p-3 sm:p-4 rounded-lg mb-3 sm:mb-4">
                      <img src={qrCode} alt="2FA QR Code" className="mx-auto max-w-[200px] sm:max-w-[240px] md:max-w-[280px]" />
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-[13px] sm:text-[14px] md:text-sm font-medium text-[#111111] mb-2 break-words">인증 코드</label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00C471] focus:border-[#00C471] transition-colors text-center tracking-widest text-[16px] sm:text-[18px] md:text-[20px] touch-manipulation"
                  />
                </div>
                
                <div className="flex space-x-2 sm:space-x-3">
                  <CommonButton
                    onClick={handleVerify2FA}
                    disabled={saving}
                    variant="success"
                    className="flex-1 text-[14px] sm:text-[15px] md:text-base py-[14px] touch-manipulation"
                  >
                    {saving ? '인증 중...' : '인증하기'}
                  </CommonButton>
                  <CommonButton
                    onClick={() => setShow2FAForm(false)}
                    variant="secondary"
                    className="flex-1 text-[14px] sm:text-[15px] md:text-base py-[14px] touch-manipulation"
                  >
                    취소
                  </CommonButton>
                </div>
              </div>
            )}
            
            {twoFactorEnabled && (
              <div className="space-y-3 sm:space-y-4 border-t border-gray-100 pt-3 sm:pt-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    <span className="text-green-800 font-medium text-[13px] sm:text-[14px] md:text-sm break-words">2단계 인증이 활성화되어 있습니다</span>
                  </div>
                  <p className="text-[12px] sm:text-[13px] md:text-sm text-green-700 mt-2 break-words leading-[1.4] sm:leading-[1.5]">
                    계정 보안이 강화되었습니다. 로그인 시 추가 인증이 필요합니다.
                  </p>
                </div>
                
                {!show2FAForm && (
                  <CommonButton
                    onClick={() => setShow2FAForm(true)}
                    variant="secondary"
                    className="w-full text-[14px] sm:text-[15px] md:text-base py-[14px] touch-manipulation"
                  >
                    2단계 인증 비활성화
                  </CommonButton>
                )}
                
                {show2FAForm && (
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-[13px] sm:text-[14px] md:text-sm font-medium text-[#111111] mb-2 break-words">인증 코드</label>
                      <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="000000"
                        maxLength={6}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00C471] focus:border-[#00C471] transition-colors text-center tracking-widest text-[16px] sm:text-[18px] md:text-[20px] touch-manipulation"
                      />
                    </div>
                    
                    <div className="flex space-x-2 sm:space-x-3">
                      <CommonButton
                        onClick={handleDisable2FA}
                        disabled={saving}
                        variant="danger"
                        className="flex-1 text-[14px] sm:text-[15px] md:text-base py-[14px] touch-manipulation"
                      >
                        {saving ? '비활성화 중...' : '비활성화하기'}
                      </CommonButton>
                      <CommonButton
                        onClick={() => setShow2FAForm(false)}
                        variant="secondary"
                        className="flex-1 text-[14px] sm:text-[15px] md:text-base py-[14px] touch-manipulation"
                      >
                        취소
                      </CommonButton>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 보안 팁 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-5 md:p-6">
          <div className="flex items-start space-x-2 sm:space-x-3">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-blue-900 mb-2 text-[14px] sm:text-[15px] md:text-base break-words">보안 권장사항</h3>
              <ul className="text-[12px] sm:text-[13px] md:text-sm text-blue-800 space-y-1 break-words leading-[1.4] sm:leading-[1.5]">
                <li>• 강력한 비밀번호를 사용하세요 (8자 이상, 특수문자 포함)</li>
                <li>• 다른 서비스와 동일한 비밀번호를 사용하지 마세요</li>
                <li>• 2단계 인증을 활성화하여 보안을 강화하세요</li>
                <li>• 정기적으로 비밀번호를 변경하세요</li>
                <li>• 의심스러운 로그인 활동이 있으면 즉시 비밀번호를 변경하세요</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="pb-6 sm:pb-8" />
    </div>
  );
};

export default SecuritySettings;