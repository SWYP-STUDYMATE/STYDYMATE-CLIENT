import { useState, useRef, useCallback } from 'react';
import { Upload, Camera, X, Loader2 } from 'lucide-react';
import { uploadProfileImage, deleteProfileImage, validateFile, getFileUrl } from '../api/profile';
import useProfileStore from '../store/profileStore';

export default function ProfileImageUpload({ isOpen, onClose }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);
  
  const { profileImage, setProfileImage, saveProfileToServer } = useProfileStore();

  // 파일 선택 처리
  const handleFileSelect = (file) => {
    if (!file) return;

    try {
      // 개선된 파일 유효성 검사 사용
      validateFile(file, 'image');
      
      setSelectedFile(file);
      setError(null);

      // 미리보기 생성
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } catch (validationError) {
      setError(validationError.message);
      setSelectedFile(null);
      setPreview(null);
    }
  };

  // 파일 선택 이벤트
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // 드래그 앤 드롭 이벤트
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, []);

  // 업로드 처리
  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // 프로그레스 시뮬레이션
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Workers API를 통한 이미지 업로드
      const result = await uploadProfileImage(selectedFile, {
        uploadedAt: new Date().toISOString(),
        source: 'profile-upload'
      });
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      // 완전한 이미지 URL 생성
      const imageUrl = getFileUrl(result.key);
      console.log('✅ 업로드 완료, 이미지 URL:', imageUrl);

      // 로컬 스토어에 이미지 URL 저장
      setProfileImage(imageUrl);

      try {
        // 서버에 프로필 이미지 저장 (Spring Boot API)
        await saveProfileToServer({ profileImage: imageUrl });
        console.log('✅ 프로필 이미지 서버 저장 성공');
      } catch (serverError) {
        console.warn('⚠️ 서버 프로필 저장 실패, 로컬만 업데이트:', serverError);
        // 로컬 상태는 이미 업데이트되었으므로 사용자에게는 성공으로 보임
      }

      // 성공 후 모달 닫기
      setTimeout(() => {
        handleClose();
      }, 500);
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.message || '이미지 업로드에 실패했습니다. 다시 시도해주세요.');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  // 모달 닫기
  const handleClose = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    setUploadProgress(0);
    setIsUploading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[20px] w-full max-w-md p-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[20px] font-bold text-[#111111]">프로필 사진 변경</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-[#F3F4F6] rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-[#606060]" />
          </button>
        </div>

        {/* 업로드 영역 */}
        <div
          ref={dropZoneRef}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-[16px] p-8
            transition-all duration-200 cursor-pointer
            ${isDragging ? 'border-[#4338CA] bg-[#4338CA]/5' : 'border-[#E7E7E7] hover:border-[#4338CA]'}
            ${preview ? 'pb-4' : ''}
          `}
          onClick={() => fileInputRef.current?.click()}
        >
          {/* 미리보기 */}
          {preview ? (
            <div className="relative w-48 h-48 mx-auto mb-4">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full rounded-full object-cover"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                  setPreview(null);
                }}
                className="absolute top-0 right-0 p-1 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
              >
                <X className="w-4 h-4 text-[#606060]" />
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-[#F3F4F6] rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-[#606060]" />
              </div>
              <p className="text-[16px] font-medium text-[#111111] mb-2">
                클릭하여 사진을 선택하거나
              </p>
              <p className="text-[14px] text-[#606060]">
                여기에 드래그 앤 드롭하세요
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* 파일 정보 */}
        {selectedFile && (
          <div className="mt-4 p-3 bg-[#F3F4F6] rounded-[12px]">
            <p className="text-[14px] text-[#606060] truncate">
              {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)}MB)
            </p>
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="mt-4 p-3 bg-[#FEE2E2] border border-[#FCA5A5] rounded-[12px]">
            <p className="text-[14px] text-[#DC2626]">{error}</p>
          </div>
        )}

        {/* 업로드 진행률 */}
        {isUploading && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[14px] text-[#606060]">업로드 중...</span>
              <span className="text-[14px] font-medium text-[#4338CA]">{uploadProgress}%</span>
            </div>
            <div className="w-full h-2 bg-[#E7E7E7] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#4338CA] rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* 버튼 */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleClose}
            className="flex-1 py-3 px-4 border border-[#E7E7E7] rounded-[12px] text-[16px] font-medium text-[#606060] hover:bg-[#F3F4F6] transition-colors"
            disabled={isUploading}
          >
            취소
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className={`
              flex-1 py-3 px-4 rounded-[12px] text-[16px] font-medium
              flex items-center justify-center gap-2
              transition-all duration-200
              ${!selectedFile || isUploading
                ? 'bg-[#E7E7E7] text-[#929292] cursor-not-allowed'
                : 'bg-[#4338CA] text-white hover:bg-[#3730A3] active:bg-[#312E81]'
              }
            `}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                업로드 중
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                업로드
              </>
            )}
          </button>
        </div>

        {/* 안내 문구 */}
        <p className="mt-4 text-[12px] text-[#929292] text-center">
          JPG, PNG, WebP, GIF 형식 · 최대 10MB
        </p>
      </div>
    </div>
  );
}