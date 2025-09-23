import React, { useRef, useState } from "react";
import Header from "../../components/Header";
import ProgressBar from "../../components/PrograssBar";
import CommonButton from "../../components/CommonButton";
import useProfileStore from "../../store/profileStore";
import { useNavigate } from "react-router-dom";
import { uploadProfileImage } from "../../api/user";
import { useAlert } from "../../hooks/useAlert.jsx";

export default function OnboardingInfo3() {
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null); // 실제 파일 저장용
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState(null);
  const fileInputRef = useRef();
  const videoRef = useRef();
  const canvasRef = useRef();
  const { setProfileImage } = useProfileStore();
  const navigate = useNavigate();
  const { showError, showSuccess } = useAlert();

  // 파일 선택
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 실제 파일 저장
      setImageFile(file);
      
      // 미리보기용 URL 생성 (압축 없이)
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 카메라 열기
  const handleCameraClick = async () => {
    try {
      console.log('카메라 접근 시도...');
      // 더 호환성 좋은 설정으로 시작
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { min: 320, ideal: 640, max: 1280 },
          height: { min: 240, ideal: 480, max: 720 },
          facingMode: 'user' // 전면 카메라 사용
        },
        audio: false
      });
      
      console.log('카메라 스트림 획득 성공:', mediaStream);
      setStream(mediaStream);
      setIsCameraOpen(true);
    } catch (error) {
      console.error('카메라 접근 실패:', error);
      if (error.name === 'NotAllowedError') {
        showError('카메라 권한을 허용해주세요. 브라우저 설정에서 카메라 접근을 허용해야 합니다.');
      } else if (error.name === 'NotFoundError') {
        showError('카메라를 찾을 수 없습니다. 카메라가 연결되어 있는지 확인해주세요.');
      } else if (error.name === 'NotReadableError') {
        showError('카메라가 다른 앱에서 사용 중입니다.');
      } else {
        showError('카메라를 열 수 없습니다: ' + error.message);
      }
    }
  };

  // 사진 캡처
  const handleCapture = () => {
    console.log('📸 캡처 버튼 클릭됨');
    
    if (!videoRef.current || !canvasRef.current) {
      console.error('❌ 비디오 또는 캔버스 요소를 찾을 수 없음');
      showError('카메라 화면을 찾을 수 없습니다.');
      return;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    console.log('🔍 비디오 상태 체크:', {
      readyState: video.readyState,
      videoWidth: video.videoWidth,
      videoHeight: video.videoHeight,
      paused: video.paused,
      ended: video.ended
    });
    
    // 더 관대한 조건으로 변경 - 최소한의 데이터만 있으면 캡처 시도
    if (video.readyState < 2) { // HAVE_CURRENT_DATA (2) 이상이면 캡처 가능
      console.warn('⚠️ 비디오가 아직 준비되지 않음, readyState:', video.readyState);
      
      // 짧은 시간 후 재시도
      setTimeout(() => {
        if (video.readyState >= 2) {
          console.log('🔄 재시도로 캡처 진행');
          handleCapture();
        } else {
          showError('카메라가 아직 준비되지 않았습니다. 잠시 후 다시 시도해주세요.');
        }
      }, 500);
      return;
    }

    const context = canvas.getContext('2d');
    
    // 캔버스 크기를 비디오와 동일하게 설정
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    console.log('캔버스 크기:', canvas.width, 'x', canvas.height);
    console.log('비디오 크기:', video.videoWidth, 'x', video.videoHeight);
    
    // 비디오 프레임을 캔버스에 그리기
    try {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      console.log('비디오 프레임 캔버스에 그리기 성공');
      
      // 캔버스를 Blob으로 변환
      canvas.toBlob((blob) => {
        if (blob) {
          console.log('Blob 생성 성공, 크기:', blob.size);
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const file = new File([blob], `camera-photo-${timestamp}.jpg`, { type: 'image/jpeg' });
          setImageFile(file);
          
          // 미리보기용 URL 생성
          const imageUrl = URL.createObjectURL(blob);
          setImage(imageUrl);
          
          // 카메라 스트림 정리
          handleCameraClose();
          showSuccess('사진이 캡처되었습니다!');
        } else {
          console.error('Blob 생성 실패');
          showError('사진 캡처에 실패했습니다.');
        }
      }, 'image/jpeg', 0.9);
    } catch (error) {
      console.error('캔버스 그리기 오류:', error);
      showError('사진 캡처 중 오류가 발생했습니다.');
    }
  };

  // 카메라 닫기
  const handleCameraClose = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  };

  // 스트림이 설정되면 비디오 요소에 연결
  React.useEffect(() => {
    if (stream && videoRef.current && isCameraOpen) {
      console.log('🔍 useEffect에서 비디오 스트림 연결 시작');
      console.log('🔍 비디오 요소 존재:', !!videoRef.current);
      console.log('🔍 비디오 요소 크기:', videoRef.current.clientWidth, 'x', videoRef.current.clientHeight);
      
      videoRef.current.srcObject = stream;
      console.log('🔍 스트림 할당 완료, srcObject:', videoRef.current.srcObject);
      
      // 즉시 재생 시도
      const attemptPlay = async () => {
        try {
          console.log('🔍 즉시 재생 시도');
          await videoRef.current.play();
          console.log('🔍 즉시 재생 성공');
        } catch (err) {
          console.log('🔍 즉시 재생 실패, 메타데이터 로드 대기:', err.message);
        }
      };
      
      attemptPlay();
      
      // 메타데이터 로드 후 재생 시작
      videoRef.current.onloadedmetadata = () => {
        console.log('🔍 비디오 메타데이터 로드 완료');
        console.log('🔍 비디오 크기:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight);
        console.log('🔍 비디오 readyState:', videoRef.current.readyState);
        
        if (videoRef.current.paused) {
          videoRef.current.play().then(() => {
            console.log('🔍 메타데이터 로드 후 비디오 재생 시작');
            console.log('🔍 비디오 paused:', videoRef.current.paused);
            console.log('🔍 비디오 muted:', videoRef.current.muted);
          }).catch(err => {
            console.error('🔍 비디오 재생 오류:', err);
            showError('비디오 재생에 실패했습니다.');
          });
        }
      };
      
      // loadstart 이벤트도 추가
      videoRef.current.onloadstart = () => {
        console.log('🔍 비디오 로드 시작 (loadstart)');
      };
      
      // 추가 이벤트 리스너들
      videoRef.current.oncanplay = () => {
        console.log('🔍 비디오 재생 준비 완료 (canplay)');
      };
      
      videoRef.current.onplaying = () => {
        console.log('🔍 비디오 재생 중 (playing)');
      };
    }
  }, [stream, isCameraOpen]);

  // 컴포넌트 언마운트 시 스트림 정리
  React.useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // 사진 선택
  const handleSelectPhoto = () => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.click();
    }
  };

  // 건너뛰기
  const handleSkip = () => {
    navigate("/onboarding-info/4");
  };

  // 사진 저장 후 다음 단계로 이동
  const handleNext = async () => {
    if (!imageFile) {
      showError("이미지 파일을 선택해주세요.");
      return;
    }

    try {
      console.log('📤 프로필 이미지 업로드 시작, 파일 정보:', {
        name: imageFile.name,
        size: imageFile.size,
        type: imageFile.type
      });

      const payload = await uploadProfileImage(imageFile);
      
      console.log('📥 서버 응답:', payload);
      
      // 서버에서 반환된 URL 사용
      const profileImageUrl = payload?.data?.url ?? payload?.url;
      
      if (profileImageUrl) {
        // 로컬 스토어 업데이트 (서버에서 받은 URL 사용)
        setProfileImage(profileImageUrl);
        console.log('✅ 프로필 이미지 업로드 및 로컬 저장 성공:', profileImageUrl);
        
        showSuccess("사진이 저장되었습니다. 다음 단계로 이동합니다.");
        navigate("/onboarding-info/4");
      } else {
        console.error('❌ 서버 응답에서 이미지 URL을 찾을 수 없음:', payload);
        showError("이미지 업로드는 성공했지만 URL을 받지 못했습니다.");
      }
    } catch (e) {
      console.error('❌ 프로필 이미지 업로드 실패:', e);
      showError("프로필 이미지 저장에 실패했습니다: " + (e.response?.data?.message || e.message));
    }
  };

  return (
    <div className="bg-[#FFFFFF] h-screen max-w-[768px] w-full mx-auto">
      <Header />
      <ProgressBar total={5} value={3} className="mt-[19px]" />
      <div className="mx-auto mt-[19px] max-w-[720px] w-full">
        <h1 className="text-[32px] font-bold leading-[42px] text-[#111111]">
          프로필 사진을 업로드 해주세요.
        </h1>
        <p className="text-[16px] font-medium text-[#343a40] mt-[24px]">
          (선택) 얼굴이 보이는 사진을 올리면 첫 만남이 더 편해집니다.
        </p>
      </div>
      <div className="mx-auto mt-[70px] max-w-[720px] w-full flex flex-col items-center">
        <div className="relative w-[300px] h-[300px] mb-[114px]">   
          <div className="w-full h-full rounded-full bg-[#e7e7e7] flex items-center justify-center overflow-hidden cursor-pointer" onClick={handleSelectPhoto}>
            {image ? (
              <img src={image} alt="프로필 미리보기" className="object-cover w-full h-full" />
            ) : (
                <div>
                    <div className="bg-[url('/assets/photo.png')] bg-contain bg-center bg-no-repeat w-[38px] h-[30px] mx-auto" ></div>
                    <div className="text-[#343A40] text-[15px] font-regular leading-[24px] mt-[12px]">사진 선택</div>
                </div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
        <div className="flex flex-col gap-[32px] w-full mt-8">

          <div className="flex items-center w-full my-2">
            <div className="flex-1 h-px bg-[#e8e8e8]" />
            <span className="mx-2 text-[#343a40] text-[16px] font-medium">or</span>
            <div className="flex-1 h-px bg-[#e8e8e8]" />
          </div>
          <CommonButton
            text="카메라로 사진 찍기"
            variant="success"
            onClick={handleCameraClick}
          />
          <CommonButton
            text={image ? "다음" : "건너뛰기"}
            variant={image ? "primary" : "secondary"}
            onClick={image ? handleNext : handleSkip}
          />
        </div>
      </div>

      {/* 카메라 모달 */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overlay-solid">
          <div className="bg-white rounded-[20px] w-full max-w-md mx-4 shadow-xl overflow-hidden">
            {/* 헤더 */}
            <div className="flex items-center justify-between p-4 border-b border-[#E7E7E7]">
              <h3 className="text-[18px] font-bold text-[#111111]">사진 촬영</h3>
              <button
                onClick={handleCameraClose}
                className="p-2 hover:bg-[#F1F3F5] rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-[#929292]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 카메라 뷰 */}
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ width: '100%', height: '256px', objectFit: 'cover', backgroundColor: 'black' }}
                className="w-full h-64 object-cover bg-black"
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* 촬영 버튼 */}
            <div className="p-4">
              <div className="flex justify-center space-x-4">
                <CommonButton
                  text="취소"
                  variant="secondary"
                  onClick={handleCameraClose}
                  className="flex-1"
                />
                <CommonButton
                  text="촬영"
                  variant="primary"
                  onClick={handleCapture}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
