import { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { uploadChatImage, validateFile, getFileUrl } from '../api/profile';

export default function ChatImageUpload({ onImageUploaded, onClose, className = '' }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  
  const fileInputRef = useRef(null);

  // 파일 선택 처리
  const handleFileSelect = (file) => {
    if (!file) return;

    try {
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
      }, 150);

      // 채팅 이미지 업로드
      const result = await uploadChatImage(selectedFile, {
        uploadedAt: new Date().toISOString(),
        source: 'chat-upload'
      });
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      // 완전한 이미지 URL 생성
      const imageUrl = getFileUrl(result.key);
      console.log('✅ 채팅 이미지 업로드 완료:', imageUrl);

      // 부모 컴포넌트에 결과 전달
      if (onImageUploaded) {
        onImageUploaded({
          url: imageUrl,
          key: result.key,
          size: result.size,
          type: result.type,
          variants: result.variants
        });
      }

      // 업로드 완료 후 리셋
      setTimeout(() => {
        handleReset();
      }, 500);
    } catch (err) {
      console.error('Chat image upload failed:', err);
      setError(err.message || '이미지 업로드에 실패했습니다. 다시 시도해주세요.');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  // 상태 리셋
  const handleReset = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    setUploadProgress(0);
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`bg-white rounded-[12px] p-4 border border-[#E7E7E7] ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[16px] font-bold text-[#111111]">이미지 업로드</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#F3F4F6] rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-[#606060]" />
          </button>
        )}
      </div>

      {/* 업로드 영역 */}
      <div 
        className="border-2 border-dashed border-[#E7E7E7] rounded-[12px] p-6 text-center cursor-pointer hover:border-[#00C471] transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        {preview ? (
          <div className="relative w-32 h-32 mx-auto mb-3">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full rounded-[8px] object-cover"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleReset();
              }}
              className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
            >
              <X className="w-3 h-3 text-[#606060]" />
            </button>
          </div>
        ) : (
          <div>
            <div className="w-12 h-12 bg-[#F3F4F6] rounded-full flex items-center justify-center mx-auto mb-3">
              <ImageIcon className="w-6 h-6 text-[#606060]" />
            </div>
            <p className="text-[14px] font-medium text-[#111111] mb-1">
              이미지를 선택하세요
            </p>
            <p className="text-[12px] text-[#929292]">
              JPG, PNG, WebP, GIF · 최대 10MB
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
        <div className="mt-3 p-2 bg-[#F3F4F6] rounded-[8px]">
          <p className="text-[12px] text-[#606060] truncate">
            {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)}MB)
          </p>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="mt-3 p-2 bg-[#FEE2E2] border border-[#FCA5A5] rounded-[8px]">
          <p className="text-[12px] text-[#DC2626]">{error}</p>
        </div>
      )}

      {/* 업로드 진행률 */}
      {isUploading && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] text-[#606060]">업로드 중...</span>
            <span className="text-[12px] font-medium text-[#00C471]">{uploadProgress}%</span>
          </div>
          <div className="w-full h-1 bg-[#E7E7E7] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#00C471] rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* 버튼 */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={handleReset}
          disabled={isUploading}
          className="flex-1 py-2 px-3 border border-[#E7E7E7] rounded-[8px] text-[14px] font-medium text-[#606060] hover:bg-[#F3F4F6] transition-colors disabled:opacity-50"
        >
          초기화
        </button>
        <button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className={`
            flex-1 py-2 px-3 rounded-[8px] text-[14px] font-medium
            flex items-center justify-center gap-1
            transition-all duration-200
            ${!selectedFile || isUploading
              ? 'bg-[#E7E7E7] text-[#929292] cursor-not-allowed'
              : 'bg-[#00C471] text-white hover:bg-[#00B267] active:bg-[#008B50]'
            }
          `}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              업로드 중
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              업로드
            </>
          )}
        </button>
      </div>
    </div>
  );
}