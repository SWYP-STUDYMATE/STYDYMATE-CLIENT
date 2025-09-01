import { useState, useRef } from 'react';
import { Upload, Mic, X, Loader2, Play, Pause } from 'lucide-react';
import { uploadAudioFile, validateFile, getFileUrl } from '../api/profile';

export default function AudioUpload({ 
  onAudioUploaded, 
  onClose, 
  folder = 'level-test',
  title = '음성 파일 업로드',
  className = '' 
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const fileInputRef = useRef(null);
  const audioRef = useRef(null);

  // 파일 선택 처리
  const handleFileSelect = (file) => {
    if (!file) return;

    try {
      validateFile(file, 'audio');
      
      setSelectedFile(file);
      setError(null);
      setIsPlaying(false);
    } catch (validationError) {
      setError(validationError.message);
      setSelectedFile(null);
    }
  };

  // 파일 선택 이벤트
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // 드래그 앤 드롭 처리
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // 오디오 재생/일시정지
  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // 오디오 재생 완료 처리
  const handleAudioEnded = () => {
    setIsPlaying(false);
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
      }, 250);

      // 오디오 파일 업로드
      const result = await uploadAudioFile(selectedFile, folder, {
        uploadedAt: new Date().toISOString(),
        source: 'audio-upload',
        duration: audioRef.current?.duration || null,
        folder
      });
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      // 완전한 오디오 URL 생성
      const audioUrl = getFileUrl(result.key);
      console.log('✅ 오디오 파일 업로드 완료:', audioUrl);

      // 부모 컴포넌트에 결과 전달
      if (onAudioUploaded) {
        onAudioUploaded({
          url: audioUrl,
          key: result.key,
          size: result.size,
          type: result.type,
          metadata: result.metadata,
          duration: audioRef.current?.duration || null
        });
      }

      // 업로드 완료 후 리셋
      setTimeout(() => {
        handleReset();
      }, 500);
    } catch (err) {
      console.error('Audio upload failed:', err);
      setError(err.message || '오디오 업로드에 실패했습니다. 다시 시도해주세요.');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  // 상태 리셋
  const handleReset = () => {
    setSelectedFile(null);
    setError(null);
    setUploadProgress(0);
    setIsUploading(false);
    setIsPlaying(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  // 파일 크기를 보기 좋게 포맷팅
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 오디오 지속시간 포맷팅
  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`bg-white rounded-[12px] p-4 border border-[#E7E7E7] ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[16px] font-bold text-[#111111]">{title}</h3>
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
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {selectedFile ? (
          <div className="space-y-3">
            <div className="w-12 h-12 bg-[#00C471] rounded-full flex items-center justify-center mx-auto">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-[14px] font-medium text-[#111111] mb-1 truncate">
                {selectedFile.name}
              </p>
              <p className="text-[12px] text-[#929292]">
                {formatFileSize(selectedFile.size)}
                {audioRef.current?.duration && (
                  <> · {formatDuration(audioRef.current.duration)}</>
                )}
              </p>
            </div>
            
            {/* 오디오 재생 컨트롤 */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlayback();
              }}
              className="inline-flex items-center gap-2 px-3 py-2 bg-[#F3F4F6] hover:bg-[#E7E7E7] rounded-[8px] transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              <span className="text-[12px] font-medium">
                {isPlaying ? '일시정지' : '재생'}
              </span>
            </button>

            {/* 숨겨진 오디오 엘리먼트 */}
            <audio
              ref={audioRef}
              src={selectedFile ? URL.createObjectURL(selectedFile) : ''}
              onEnded={handleAudioEnded}
              onLoadedMetadata={() => {
                // 오디오 메타데이터 로드 완료 시 컴포넌트 업데이트
                setSelectedFile(prev => ({ ...prev }));
              }}
            />

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleReset();
              }}
              className="mt-2 text-[12px] text-[#929292] hover:text-[#606060] underline"
            >
              다른 파일 선택
            </button>
          </div>
        ) : (
          <div>
            <div className="w-12 h-12 bg-[#F3F4F6] rounded-full flex items-center justify-center mx-auto mb-3">
              <Mic className="w-6 h-6 text-[#606060]" />
            </div>
            <p className="text-[14px] font-medium text-[#111111] mb-1">
              음성 파일을 선택하거나 드래그하세요
            </p>
            <p className="text-[12px] text-[#929292]">
              MP3, WAV, WebM, OGG, M4A · 최대 50MB
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="audio/mp3,audio/wav,audio/webm,audio/ogg,audio/m4a"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

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