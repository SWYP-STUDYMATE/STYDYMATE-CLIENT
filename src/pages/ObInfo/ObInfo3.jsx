import React, { useRef, useState } from "react";
import Header from "../../components/Header";
import ProgressBar from "../../components/PrograssBar";
import CommonButton from "../../components/CommonButton";
import useProfileStore from "../../store/profileStore";
import { useNavigate } from "react-router-dom";
import api from "../../api";

export default function OnboardingInfo3() {
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null); // 실제 파일 저장용
  const fileInputRef = useRef();
  const { setProfileImage, saveProfileToServer } = useProfileStore();
  const navigate = useNavigate();

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

  // 카메라 촬영
  const handleCameraClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
    }
  };

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
      alert("이미지 파일을 선택해주세요.");
      return;
    }

    try {
      // FormData를 사용하여 파일 업로드
      const formData = new FormData();
      formData.append('file', imageFile);

      const response = await api.post("/user/profile-image", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // 로컬 스토어 업데이트
      setProfileImage(image); // zustand 저장 (미리보기용 Base64)
      
      try {
        // 서버에 프로필 전체 정보 저장
        const profileImageUrl = response.data?.imageUrl || image;
        await saveProfileToServer({ profileImage: profileImageUrl });
        console.log('✅ 온보딩 프로필 이미지 서버 저장 성공');
      } catch (serverError) {
        console.warn('⚠️ 서버 프로필 저장 실패, 로컬만 업데이트:', serverError);
      }
      
      alert("사진이 저장되었습니다. 다음 단계로 이동합니다.");
      navigate("/onboarding-info/4");
    } catch (e) {
      alert("프로필 이미지 저장에 실패했습니다.");
      console.error(e);
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
    </div>
  );
}
