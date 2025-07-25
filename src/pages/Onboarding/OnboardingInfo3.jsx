import React, { useRef, useState } from "react";
import Header from "../../components/Header";
import ProgressBar from "../../components/PrograssBar";
import CommonButton from "../../components/CommonButton";
import useProfileStore from "../../store/profileStore";
import { useNavigate } from "react-router-dom";

export default function OnboardingInfo3() {
  const [image, setImage] = useState(null);
  const [capture, setCapture] = useState(null); // capture 상태 추가
  const fileInputRef = useRef();
  const setProfileImage = useProfileStore((state) => state.setProfileImage);
  const navigate = useNavigate();
  // 파일 선택
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result); // 미리보기만
      };
      reader.readAsDataURL(file);
    }
  };

  // 카메라 촬영
  const handleCameraClick = () => {
    setCapture("environment"); // 카메라 실행
    setTimeout(() => {
      fileInputRef.current.click();
    }, 0);
  };

  // 사진 선택
  const handleSelectPhoto = () => {
    setCapture(null); // 갤러리에서 선택
    setTimeout(() => {
      fileInputRef.current.click();
    }, 0);
  };

  // 건너뛰기
  const handleSkip = () => {
    // TODO: 다음 단계로 이동
    alert("건너뛰기");
    navigate("/onboarding-info/4");
  };

  // 사진 저장 후 다음 단계로 이동
  const handleNext = () => {
    setProfileImage(image); // zustand 저장
    alert("사진이 저장되었습니다. 다음 단계로 이동합니다.");
    navigate("/onboarding-info/4");
    // 예: 서버로 업로드 등
  };

  return (
    <div className="bg-[#FFFFFF] h-screen w-[768px] mx-auto">
      <Header />
      <ProgressBar total={5} value={3} className="mt-[19px]" />
      <div className="mx-auto mt-[19px] w-[720px]">
        <h1 className="text-[32px] font-bold leading-[42px] text-[#111111]">
          프로필 사진을 업로드 해주세요.
        </h1>
        <p className="text-[16px] font-medium text-[#343a40] mt-[24px]">
          (선택) 얼굴이 보이는 사진을 올리면 첫 만남이 더 편해집니다.
        </p>
      </div>
      <div className="mx-auto mt-[70px] w-[720px] flex flex-col items-center">
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
            capture={capture ? capture : undefined} // capture 속성 동적 바인딩
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
