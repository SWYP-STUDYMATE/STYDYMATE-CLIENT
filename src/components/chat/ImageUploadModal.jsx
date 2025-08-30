import React, { useState, useRef } from "react";
import { X, UploadCloud } from "lucide-react";
import { uploadChatImages } from "../../api/chat";

export default function ImageUploadModal({
  isOpen,
  onClose,
  roomId,
  onImageUploadSuccess,
}) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);

    try {
      const imageUrls = await uploadChatImages(roomId, selectedFiles);
      onImageUploadSuccess(imageUrls);
      handleClose();
    } catch (error) {
      console.error("이미지 업로드 실패:", error);
      alert("이미지 업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFiles([]);
    setPreviews([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 
            id="modal-title"
            className="text-xl font-semibold"
          >
            이미지 업로드
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded focus:outline-none focus:ring-2 focus:ring-[#00C471] focus:ring-offset-2 transition-colors"
            aria-label="모달 닫기"
            type="button"
          >
            <X size={24} />
          </button>
        </div>

        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="sr-only"
          id="file-input"
          aria-describedby="file-input-desc"
        />
        <button
          onClick={() => fileInputRef.current.click()}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 flex flex-col items-center justify-center hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#00C471] focus:ring-offset-2 transition-colors mb-4"
          aria-describedby="file-input-desc"
          type="button"
        >
          <UploadCloud size={32} className="mb-2" />
          <span id="file-input-desc">파일 선택 또는 드래그</span>
        </button>

        {previews.length > 0 && (
          <div 
            className="grid grid-cols-3 gap-2 mb-4 max-h-48 overflow-y-auto"
            role="group"
            aria-label="선택된 이미지 미리보기"
          >
            {previews.map((src, index) => (
              <img
                key={index}
                src={src}
                alt={`업로드 예정 이미지 ${index + 1}`}
                className="w-full h-24 object-cover rounded-md"
              />
            ))}
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={selectedFiles.length === 0 || isUploading}
          className={`w-full py-3 rounded-lg text-white font-semibold focus:outline-none focus:ring-2 focus:ring-[#00C471] focus:ring-offset-2 transition-colors ${
            selectedFiles.length === 0 || isUploading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600"
          }`}
          aria-describedby={selectedFiles.length === 0 ? "upload-disabled-desc" : undefined}
          type="button"
        >
          {isUploading ? "업로드 중..." : "업로드"}
          {selectedFiles.length === 0 && (
            <span id="upload-disabled-desc" className="sr-only">
              이미지를 선택해주세요
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
