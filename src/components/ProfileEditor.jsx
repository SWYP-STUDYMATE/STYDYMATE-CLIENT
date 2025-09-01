import { useState, useEffect } from 'react';
import { Edit3, Camera, Save, X, User, MapPin, MessageSquare } from 'lucide-react';
import useProfileStore from '../store/profileStore';
import ProfileImageUpload from './ProfileImageUpload';
import { getOptimizedImageUrl } from '../api/profile';
import CommonButton from './CommonButton';

export default function ProfileEditor({ isOpen, onClose, onSave }) {
  // 프로필 스토어
  const {
    englishName,
    name,
    residence,
    profileImage,
    intro,
    setEnglishNameSync,
    setResidenceSync,
    setIntroSync,
    loadProfileFromServer,
    saveProfileToServer
  } = useProfileStore();

  // 로컬 편집 상태
  const [editData, setEditData] = useState({
    englishName: '',
    name: '',
    residence: '',
    intro: ''
  });

  // UI 상태
  const [isImageUploadOpen, setIsImageUploadOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState({});

  // 초기 데이터 로드
  useEffect(() => {
    if (isOpen) {
      setEditData({
        englishName: englishName || '',
        name: name || '',
        residence: residence || '',
        intro: intro || ''
      });
      setHasChanges(false);
      setErrors({});
    }
  }, [isOpen, englishName, name, residence, intro]);

  // 변경사항 감지
  useEffect(() => {
    const currentData = { englishName, name, residence, intro };
    const isChanged = Object.keys(editData).some(
      key => editData[key] !== (currentData[key] || '')
    );
    setHasChanges(isChanged);
  }, [editData, englishName, name, residence, intro]);

  // 입력 변경 처리
  const handleInputChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
    
    // 에러 클리어
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // 유효성 검사
  const validateForm = () => {
    const newErrors = {};

    if (!editData.englishName?.trim()) {
      newErrors.englishName = '영어 이름을 입력해주세요.';
    } else if (editData.englishName.length < 2) {
      newErrors.englishName = '영어 이름은 2글자 이상이어야 합니다.';
    }

    if (!editData.residence?.trim()) {
      newErrors.residence = '거주지를 입력해주세요.';
    }

    if (editData.intro && editData.intro.length > 500) {
      newErrors.intro = '소개는 500글자 이하로 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 저장 처리
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      // 변경된 필드만 업데이트
      const changedData = {};
      Object.keys(editData).forEach(key => {
        const currentValue = { englishName, name, residence, intro }[key] || '';
        if (editData[key] !== currentValue) {
          changedData[key] = editData[key];
        }
      });

      if (Object.keys(changedData).length === 0) {
        onClose();
        return;
      }

      // 서버에 저장
      await saveProfileToServer(changedData);
      
      console.log('✅ 프로필 저장 완료:', changedData);

      // 성공 콜백
      if (onSave) {
        onSave(changedData);
      }

      // 모달 닫기
      setTimeout(() => {
        onClose();
      }, 300);
    } catch (error) {
      console.error('Profile save error:', error);
      setErrors({ submit: '프로필 저장 중 오류가 발생했습니다. 다시 시도해주세요.' });
    } finally {
      setIsSaving(false);
    }
  };

  // 취소 처리
  const handleCancel = () => {
    if (hasChanges) {
      if (window.confirm('변경사항이 있습니다. 정말 취소하시겠습니까?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 메인 편집 모달 */}
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
        <div className="bg-white rounded-[20px] w-full max-w-lg max-h-[90vh] overflow-y-auto">
          {/* 헤더 */}
          <div className="flex items-center justify-between p-6 border-b border-[#E7E7E7]">
            <h2 className="text-[20px] font-bold text-[#111111]">프로필 편집</h2>
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-[#F3F4F6] rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-[#606060]" />
            </button>
          </div>

          {/* 컨텐츠 */}
          <div className="p-6">
            {/* 프로필 이미지 */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-[#F3F4F6] border-2 border-[#E7E7E7]">
                  {profileImage ? (
                    <img
                      src={getOptimizedImageUrl(profileImage, { width: 96, height: 96 })}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-8 h-8 text-[#929292]" />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setIsImageUploadOpen(true)}
                  className="absolute bottom-0 right-0 p-2 bg-[#00C471] hover:bg-[#00B267] rounded-full text-white shadow-lg transition-colors"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[14px] text-[#929292] mt-2">프로필 사진 변경</p>
            </div>

            {/* 입력 필드들 */}
            <div className="space-y-6">
              {/* 영어 이름 */}
              <div>
                <label className="block text-[16px] font-medium text-[#111111] mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  영어 이름 *
                </label>
                <input
                  type="text"
                  value={editData.englishName}
                  onChange={(e) => handleInputChange('englishName', e.target.value)}
                  placeholder="영어 이름을 입력하세요"
                  className={`
                    w-full h-[50px] px-4 border rounded-[8px] text-[16px]
                    focus:outline-none focus:ring-2 focus:ring-[#00C471]/20 focus:border-[#00C471]
                    transition-colors
                    ${errors.englishName ? 'border-[#DC2626]' : 'border-[#E7E7E7]'}
                  `}
                />
                {errors.englishName && (
                  <p className="text-[14px] text-[#DC2626] mt-1">{errors.englishName}</p>
                )}
              </div>

              {/* 한국어 이름 (읽기 전용) */}
              <div>
                <label className="block text-[16px] font-medium text-[#111111] mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  한국어 이름
                </label>
                <input
                  type="text"
                  value={editData.name}
                  disabled
                  className="w-full h-[50px] px-4 border border-[#E7E7E7] rounded-[8px] text-[16px] bg-[#F9F9F9] text-[#929292] cursor-not-allowed"
                />
                <p className="text-[12px] text-[#929292] mt-1">한국어 이름은 변경할 수 없습니다.</p>
              </div>

              {/* 거주지 */}
              <div>
                <label className="block text-[16px] font-medium text-[#111111] mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  거주지 *
                </label>
                <input
                  type="text"
                  value={editData.residence}
                  onChange={(e) => handleInputChange('residence', e.target.value)}
                  placeholder="거주지를 입력하세요 (예: 서울, 대한민국)"
                  className={`
                    w-full h-[50px] px-4 border rounded-[8px] text-[16px]
                    focus:outline-none focus:ring-2 focus:ring-[#00C471]/20 focus:border-[#00C471]
                    transition-colors
                    ${errors.residence ? 'border-[#DC2626]' : 'border-[#E7E7E7]'}
                  `}
                />
                {errors.residence && (
                  <p className="text-[14px] text-[#DC2626] mt-1">{errors.residence}</p>
                )}
              </div>

              {/* 자기소개 */}
              <div>
                <label className="block text-[16px] font-medium text-[#111111] mb-2">
                  <MessageSquare className="w-4 h-4 inline mr-2" />
                  자기소개
                </label>
                <textarea
                  value={editData.intro}
                  onChange={(e) => handleInputChange('intro', e.target.value)}
                  placeholder="자신을 소개해보세요..."
                  rows={4}
                  className={`
                    w-full px-4 py-3 border rounded-[8px] text-[16px] resize-none
                    focus:outline-none focus:ring-2 focus:ring-[#00C471]/20 focus:border-[#00C471]
                    transition-colors
                    ${errors.intro ? 'border-[#DC2626]' : 'border-[#E7E7E7]'}
                  `}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.intro && (
                    <p className="text-[14px] text-[#DC2626]">{errors.intro}</p>
                  )}
                  <p className={`text-[12px] ml-auto ${
                    editData.intro.length > 500 ? 'text-[#DC2626]' : 'text-[#929292]'
                  }`}>
                    {editData.intro.length}/500
                  </p>
                </div>
              </div>
            </div>

            {/* 제출 에러 */}
            {errors.submit && (
              <div className="mt-4 p-3 bg-[#FEE2E2] border border-[#FCA5A5] rounded-[8px]">
                <p className="text-[14px] text-[#DC2626]">{errors.submit}</p>
              </div>
            )}

            {/* 버튼 */}
            <div className="flex gap-3 mt-8">
              <CommonButton
                variant="secondary"
                onClick={handleCancel}
                disabled={isSaving}
                className="flex-1"
              >
                취소
              </CommonButton>
              <CommonButton
                variant="success"
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                isLoading={isSaving}
                className="flex-1"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? '저장 중...' : '저장'}
              </CommonButton>
            </div>
          </div>
        </div>
      </div>

      {/* 프로필 이미지 업로드 모달 */}
      <ProfileImageUpload
        isOpen={isImageUploadOpen}
        onClose={() => setIsImageUploadOpen(false)}
      />
    </>
  );
}