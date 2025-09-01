import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// 개발한 컴포넌트들 import
import ProfileImageUpload from '../../components/ProfileImageUpload';
import ProfileEditor from '../../components/ProfileEditor';
import ProfileCard from '../../components/ProfileCard';
import ChatImageUpload from '../../components/ChatImageUpload';
import AudioUpload from '../../components/AudioUpload';
import FileManager from '../../components/FileManager';
import ProfileSearch from '../../components/ProfileSearch';
import { useImageUpload, useAudioUpload } from '../../hooks/useFileUpload';

// 프로필 스토어 사용
import useProfileStore from '../../store/profileStore';

export default function ProfileTestPage() {
  const navigate = useNavigate();
  const [activeDemo, setActiveDemo] = useState('profile-card');
  const [isProfileImageUploadOpen, setIsProfileImageUploadOpen] = useState(false);
  const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // 프로필 스토어에서 데이터 가져오기
  const profile = useProfileStore();
  const { 
    englishName, 
    name, 
    residence, 
    profileImage, 
    intro, 
    loadProfileFromServer 
  } = profile;

  // 파일 업로드 훅 테스트
  const imageUpload = useImageUpload({
    onSuccess: (data) => {
      console.log('이미지 업로드 성공:', data);
      setUploadedFiles(prev => [...prev, { 
        ...data, 
        name: 'uploaded-image.jpg',
        uploadedAt: new Date().toISOString()
      }]);
    }
  });

  const audioUpload = useAudioUpload({
    onSuccess: (data) => {
      console.log('오디오 업로드 성공:', data);
      setUploadedFiles(prev => [...prev, { 
        ...data, 
        name: 'uploaded-audio.mp3',
        uploadedAt: new Date().toISOString()
      }]);
    }
  });

  // 데모 컴포넌트 목록
  const demos = [
    {
      id: 'profile-card',
      title: '프로필 카드',
      description: '사용자 프로필을 표시하는 카드 컴포넌트'
    },
    {
      id: 'profile-editor',
      title: '프로필 편집기',
      description: '프로필 정보를 편집할 수 있는 모달'
    },
    {
      id: 'image-upload',
      title: '프로필 이미지 업로드',
      description: 'Workers API를 사용한 이미지 업로드'
    },
    {
      id: 'chat-image-upload',
      title: '채팅 이미지 업로드',
      description: '채팅용 이미지 업로드 컴포넌트'
    },
    {
      id: 'audio-upload',
      title: '오디오 업로드',
      description: '레벨테스트용 오디오 파일 업로드'
    },
    {
      id: 'file-manager',
      title: '파일 관리자',
      description: '업로드된 파일을 관리하는 컴포넌트'
    },
    {
      id: 'profile-search',
      title: '프로필 검색',
      description: '다른 사용자를 검색하는 기능'
    },
    {
      id: 'upload-hooks',
      title: '업로드 훅 테스트',
      description: '파일 업로드 커스텀 훅 테스트'
    }
  ];

  const handleImageUploaded = (imageData) => {
    console.log('채팅 이미지 업로드 완료:', imageData);
    setUploadedFiles(prev => [...prev, { 
      ...imageData, 
      name: 'chat-image.jpg',
      uploadedAt: new Date().toISOString()
    }]);
  };

  const handleAudioUploaded = (audioData) => {
    console.log('오디오 업로드 완료:', audioData);
    setUploadedFiles(prev => [...prev, { 
      ...audioData, 
      name: 'level-test-audio.mp3',
      uploadedAt: new Date().toISOString()
    }]);
  };

  const handleFileDelete = (deletedFile) => {
    setUploadedFiles(prev => prev.filter(file => file.key !== deletedFile.key));
  };

  const handleProfileSelect = (selectedProfile) => {
    console.log('선택된 프로필:', selectedProfile);
    alert(`${selectedProfile.englishName} 프로필이 선택되었습니다.`);
  };

  const renderDemo = () => {
    switch (activeDemo) {
      case 'profile-card':
        return (
          <div className="space-y-6">
            <ProfileCard
              profile={{
                name,
                englishName,
                residence,
                profileImage,
                intro
              }}
              isOwner={true}
              showEditButton={true}
              onProfileUpdate={(data) => console.log('프로필 업데이트:', data)}
            />
          </div>
        );

      case 'profile-editor':
        return (
          <div>
            <button
              onClick={() => setIsProfileEditorOpen(true)}
              className="px-4 py-2 bg-[#00C471] text-white rounded-[8px] hover:bg-[#00B267]"
            >
              프로필 편집기 열기
            </button>
          </div>
        );

      case 'image-upload':
        return (
          <div>
            <button
              onClick={() => setIsProfileImageUploadOpen(true)}
              className="px-4 py-2 bg-[#00C471] text-white rounded-[8px] hover:bg-[#00B267]"
            >
              이미지 업로드 모달 열기
            </button>
          </div>
        );

      case 'chat-image-upload':
        return (
          <ChatImageUpload
            onImageUploaded={handleImageUploaded}
            className="max-w-md"
          />
        );

      case 'audio-upload':
        return (
          <AudioUpload
            onAudioUploaded={handleAudioUploaded}
            folder="level-test"
            title="레벨 테스트 음성 업로드"
            className="max-w-md"
          />
        );

      case 'file-manager':
        return (
          <FileManager
            files={uploadedFiles}
            onFileDelete={handleFileDelete}
            onFileSelect={(file) => console.log('파일 선택:', file)}
            allowDelete={true}
            allowPreview={true}
          />
        );

      case 'profile-search':
        return (
          <ProfileSearch
            onProfileSelect={handleProfileSelect}
            className="max-w-2xl"
          />
        );

      case 'upload-hooks':
        return (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-[12px] border border-[#E7E7E7]">
              <h3 className="text-[16px] font-bold mb-3">이미지 업로드 훅</h3>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    imageUpload.uploadImage(file, 'profile');
                  }
                }}
                className="mb-3"
              />
              {imageUpload.isUploading && (
                <div className="mb-3">
                  <p>업로드 중... {imageUpload.uploadProgress}%</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#00C471] h-2 rounded-full"
                      style={{ width: `${imageUpload.uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
              {imageUpload.error && (
                <p className="text-red-500 text-[14px]">{imageUpload.error}</p>
              )}
            </div>

            <div className="bg-white p-4 rounded-[12px] border border-[#E7E7E7]">
              <h3 className="text-[16px] font-bold mb-3">오디오 업로드 훅</h3>
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    audioUpload.uploadAudio(file, 'test-folder');
                  }
                }}
                className="mb-3"
              />
              {audioUpload.isUploading && (
                <div className="mb-3">
                  <p>업로드 중... {audioUpload.uploadProgress}%</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#00C471] h-2 rounded-full"
                      style={{ width: `${audioUpload.uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
              {audioUpload.error && (
                <p className="text-red-500 text-[14px]">{audioUpload.error}</p>
              )}
            </div>
          </div>
        );

      default:
        return <div>데모를 선택해주세요.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* 헤더 */}
      <div className="bg-white border-b border-[#E7E7E7] px-6 py-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-[20px] font-bold text-[#111111]">
            프로필 관리 시스템 테스트
          </h1>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* 사이드바 */}
        <div className="w-80 bg-white border-r border-[#E7E7E7] p-4 overflow-y-auto">
          <h2 className="text-[16px] font-bold text-[#111111] mb-4">데모 컴포넌트</h2>
          <div className="space-y-2">
            {demos.map((demo) => (
              <button
                key={demo.id}
                onClick={() => setActiveDemo(demo.id)}
                className={`
                  w-full p-3 text-left rounded-[8px] transition-colors
                  ${activeDemo === demo.id
                    ? 'bg-[#00C471] text-white'
                    : 'hover:bg-[#F3F4F6] text-[#606060]'
                  }
                `}
              >
                <div className="text-[14px] font-medium">{demo.title}</div>
                <div className={`text-[12px] mt-1 ${
                  activeDemo === demo.id ? 'text-white/80' : 'text-[#929292]'
                }`}>
                  {demo.description}
                </div>
              </button>
            ))}
          </div>

          {/* 현재 프로필 정보 */}
          <div className="mt-6 p-3 bg-[#F8F9FA] rounded-[8px]">
            <h3 className="text-[14px] font-bold text-[#111111] mb-2">현재 프로필</h3>
            <div className="text-[12px] text-[#606060] space-y-1">
              <div>영어명: {englishName || '미설정'}</div>
              <div>한국명: {name || '미설정'}</div>
              <div>거주지: {residence || '미설정'}</div>
              <div>프로필 이미지: {profileImage ? '설정됨' : '미설정'}</div>
            </div>
          </div>

          {/* 업로드된 파일 수 */}
          <div className="mt-4 p-3 bg-[#E6F9F1] rounded-[8px]">
            <h3 className="text-[14px] font-bold text-[#111111] mb-1">업로드된 파일</h3>
            <div className="text-[12px] text-[#606060]">
              총 {uploadedFiles.length}개의 파일
            </div>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h2 className="text-[24px] font-bold text-[#111111] mb-2">
                {demos.find(d => d.id === activeDemo)?.title}
              </h2>
              <p className="text-[16px] text-[#606060]">
                {demos.find(d => d.id === activeDemo)?.description}
              </p>
            </div>

            {/* 데모 컴포넌트 렌더링 */}
            <div>{renderDemo()}</div>
          </div>
        </div>
      </div>

      {/* 모달들 */}
      <ProfileImageUpload
        isOpen={isProfileImageUploadOpen}
        onClose={() => setIsProfileImageUploadOpen(false)}
      />

      <ProfileEditor
        isOpen={isProfileEditorOpen}
        onClose={() => setIsProfileEditorOpen(false)}
        onSave={(data) => {
          console.log('프로필 편집 완료:', data);
          setIsProfileEditorOpen(false);
        }}
      />
    </div>
  );
}