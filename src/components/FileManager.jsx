import { useState, useEffect } from 'react';
import { 
  Upload, 
  File, 
  Image as ImageIcon, 
  Music, 
  Video, 
  Trash2, 
  Download, 
  Eye,
  Search,
  Filter,
  MoreVertical
} from 'lucide-react';
import { getFileUrl, getOptimizedImageUrl } from '../api/profile';

export default function FileManager({ 
  files = [], 
  onFileDelete,
  onFileSelect,
  allowDelete = true,
  allowPreview = true,
  className = '' 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);

  // 파일 타입별 아이콘 매핑
  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return ImageIcon;
    if (type.startsWith('audio/')) return Music;
    if (type.startsWith('video/')) return Video;
    return File;
  };

  // 파일 크기 포맷팅
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 파일 타입 필터링 및 검색
  useEffect(() => {
    let filtered = [...files];

    // 타입 필터
    if (selectedType !== 'all') {
      filtered = filtered.filter(file => {
        const type = file.type || '';
        switch (selectedType) {
          case 'image':
            return type.startsWith('image/');
          case 'audio':
            return type.startsWith('audio/');
          case 'video':
            return type.startsWith('video/');
          case 'document':
            return type.startsWith('application/');
          default:
            return true;
        }
      });
    }

    // 검색 필터
    if (searchTerm) {
      filtered = filtered.filter(file =>
        (file.name || file.key || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredFiles(filtered);
  }, [files, selectedType, searchTerm]);

  // 파일 삭제
  const handleDelete = async (file) => {
    if (!allowDelete) {
      return;
    }

    if (!window.confirm('정말로 이 파일을 삭제하시겠습니까?')) {
      return;
    }

    if (!onFileDelete) {
      console.warn('onFileDelete 핸들러가 정의되지 않아 파일 삭제를 진행할 수 없습니다.');
      return;
    }

    try {
      await onFileDelete(file);
      console.log('✅ 파일 삭제 완료:', file.id || file.key || file.name);
    } catch (error) {
      console.error('File delete error:', error);
      alert('파일 삭제 중 오류가 발생했습니다.');
    }
  };

  // 파일 다운로드
  const handleDownload = (file) => {
    const url = file.url || getFileUrl(file.key);
    const link = document.createElement('a');
    link.href = `${url}?download=true`;
    link.download = file.name || file.key.split('/').pop() || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 파일 미리보기
  const handlePreview = (file) => {
    if (allowPreview && file.type?.startsWith('image/')) {
      setPreviewFile(file);
    }
  };

  return (
    <div className={`bg-white rounded-[16px] border border-[#E7E7E7] ${className}`}>
      {/* 헤더 */}
      <div className="p-4 border-b border-[#E7E7E7]">
        <h3 className="text-[18px] font-bold text-[#111111] mb-4">파일 관리</h3>
        
        {/* 검색 및 필터 */}
        <div className="flex gap-3">
          {/* 검색 */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-[#929292] absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="파일명 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[#E7E7E7] rounded-[8px] text-[14px] focus:outline-none focus:border-[#00C471]"
            />
          </div>

          {/* 타입 필터 */}
          <div className="relative">
            <Filter className="w-4 h-4 text-[#929292] absolute left-3 top-1/2 transform -translate-y-1/2" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="pl-10 pr-8 py-2 border border-[#E7E7E7] rounded-[8px] text-[14px] bg-white focus:outline-none focus:border-[#00C471] appearance-none cursor-pointer"
            >
              <option value="all">전체</option>
              <option value="image">이미지</option>
              <option value="audio">오디오</option>
              <option value="video">비디오</option>
              <option value="document">문서</option>
            </select>
          </div>
        </div>
      </div>

      {/* 파일 목록 */}
      <div className="p-4">
        {filteredFiles.length > 0 ? (
          <div className="space-y-2">
            {filteredFiles.map((file, index) => {
              const FileIcon = getFileIcon(file.type || '');
              
              return (
                <div
                  key={file.key || index}
                  className="flex items-center gap-3 p-3 border border-[#E7E7E7] rounded-[8px] hover:border-[#00C471] transition-colors group"
                >
                  {/* 파일 아이콘/썸네일 */}
                  <div className="flex-shrink-0">
                    {file.type?.startsWith('image/') ? (
                      <img
                        src={getOptimizedImageUrl(file.key, { width: 40, height: 40 })}
                        alt=""
                        className="w-10 h-10 rounded-[4px] object-cover border border-[#E7E7E7]"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-[#F3F4F6] rounded-[4px] flex items-center justify-center">
                        <FileIcon className="w-5 h-5 text-[#606060]" />
                      </div>
                    )}
                  </div>

                  {/* 파일 정보 */}
                  <div 
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => onFileSelect?.(file)}
                  >
                    <p className="text-[14px] font-medium text-[#111111] truncate">
                      {file.name || file.key?.split('/').pop() || '알 수 없는 파일'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[12px] text-[#929292]">
                        {formatFileSize(file.size || 0)}
                      </span>
                      <span className="text-[12px] text-[#929292]">
                        {file.type?.split('/')[1]?.toUpperCase() || 'FILE'}
                      </span>
                      {file.uploadedAt && (
                        <span className="text-[12px] text-[#929292]">
                          {new Date(file.uploadedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {allowPreview && file.type?.startsWith('image/') && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePreview(file);
                        }}
                        className="p-2 hover:bg-[#F3F4F6] rounded-[6px] transition-colors"
                        title="미리보기"
                      >
                        <Eye className="w-4 h-4 text-[#606060]" />
                      </button>
                    )}
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(file);
                      }}
                      className="p-2 hover:bg-[#F3F4F6] rounded-[6px] transition-colors"
                      title="다운로드"
                    >
                      <Download className="w-4 h-4 text-[#606060]" />
                    </button>

                    {allowDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(file);
                        }}
                        className="p-2 hover:bg-[#FEE2E2] rounded-[6px] transition-colors group/delete"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4 text-[#929292] group-hover/delete:text-[#DC2626]" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Upload className="w-12 h-12 text-[#929292] mx-auto mb-3" />
            <p className="text-[16px] text-[#929292] mb-1">
              {searchTerm || selectedType !== 'all' 
                ? '검색 결과가 없습니다' 
                : '업로드된 파일이 없습니다'
              }
            </p>
            <p className="text-[14px] text-[#929292]">
              {searchTerm || selectedType !== 'all' 
                ? '다른 검색어나 필터를 시도해보세요'
                : '파일을 업로드해보세요'
              }
            </p>
          </div>
        )}
      </div>

      {/* 이미지 미리보기 모달 */}
      {previewFile && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewFile(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={getFileUrl(previewFile.key)}
              alt={previewFile.name}
              className="max-w-full max-h-full object-contain rounded-[8px]"
            />
            <button
              onClick={() => setPreviewFile(null)}
              className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
            >
              ✕
            </button>
            <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-2 rounded-[6px]">
              <p className="text-[14px] font-medium">{previewFile.name}</p>
              <p className="text-[12px] text-gray-300">
                {formatFileSize(previewFile.size)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
