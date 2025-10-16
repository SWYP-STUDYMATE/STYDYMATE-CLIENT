// @ts-check
import api from "./index";
import { toDataArray, toDataObject } from "../utils/apiResponse";

// 온보딩 데이터 조회 (Workers API 연동)
export const getOnboardingData = async () => {
  try {
    const response = await api.get("/onboarding/data");
    return toDataObject(response, response.data ?? {});
  } catch (error) {
    console.error("Get onboarding data error:", error);
    throw error;
  }
};

// 온보딩 진행 상태 조회 (Workers API 연동)
export const getOnboardingProgress = async () => {
  try {
    const response = await api.get("/onboarding/progress");
    return toDataObject(response, response.data ?? {});
  } catch (error) {
    console.error("Get onboarding progress error:", error);
    throw error;
  }
};

// 전체 온보딩 완료 처리 (Workers API 연동)
export const completeAllOnboarding = async (onboardingData) => {
  try {
    const response = await api.post("/onboarding/complete", onboardingData);
    return toDataObject(response, response.data ?? {});
  } catch (error) {
    console.error("Complete all onboarding error:", error);
    throw error;
  }
};

// 현재 온보딩 단계 조회
export const getCurrentOnboardingStep = async () => {
  try {
    const response = await api.get("/onboarding/steps/current");
    return toDataObject(response, response.data ?? {});
  } catch (error) {
    console.error("Get current onboarding step error:", error);
    throw error;
  }
};

// 온보딩 단계 건너뛰기
export const skipOnboardingStep = async (step) => {
  try {
    const response = await api.post(`/onboarding/steps/${step}/skip`);
    return toDataObject(response, response.data ?? {});
  } catch (error) {
    console.error("Skip onboarding step error:", error);
    throw error;
  }
};

// 1단계: 기본 정보 저장 (이름 변경: saveOnboardingStep1 -> saveStep1)
export const saveOnboardingStep1 = async (userData) => {
  try {
    console.log("🔍 saveOnboardingStep1 호출, 입력 데이터:", userData);

    // 서버가 기대하는 형식으로 변환
    const requestBody = {
      stepNumber: 1,
      stepData: {
        englishName: userData.englishName,
        residence: userData.residence || "",
        profileImage: userData.profileImage || null,
        intro: userData.intro || "",
      },
    };

    console.log("🔍 서버로 전송할 데이터:", requestBody);

    const response = await api.post("/onboarding/steps/1/save", requestBody);
    return response.data;
  } catch (error) {
    console.error("🔍 Save onboarding step1 error:", error);
    throw error;
  }
};

// saveStep1 별칭
export const saveStep1 = saveOnboardingStep1;

// 2단계: 언어 정보 저장 (이름 변경: saveOnboardingStep2 -> saveStep2)
export const saveOnboardingStep2 = async (languageData) => {
  try {
    console.log("🔍 saveOnboardingStep2 호출, 입력 데이터:", languageData);

    // 서버가 기대하는 형식으로 변환
    const requestBody = {
      stepNumber: 2,
      stepData: languageData,
    };

    console.log("🔍 서버로 전송할 데이터:", requestBody);

    const response = await api.post("/onboarding/steps/2/save", requestBody);
    return response.data;
  } catch (error) {
    console.error("🔍 Save onboarding step2 error:", error);
    throw error;
  }
};

// saveStep2 별칭
export const saveStep2 = saveOnboardingStep2;

// 3단계: 학습 정보 저장 (이름 변경: saveOnboardingStep3 -> saveStep3)
export const saveOnboardingStep3 = async (learningData) => {
  try {
    console.log("🔍 saveOnboardingStep3 호출, 입력 데이터:", learningData);

    // 서버가 기대하는 형식으로 변환
    const requestBody = {
      stepNumber: 3,
      stepData: learningData,
    };

    console.log("🔍 서버로 전송할 데이터:", requestBody);

    const response = await api.post("/onboarding/steps/3/save", requestBody);
    return response.data;
  } catch (error) {
    console.error("🔍 Save onboarding step3 error:", error);
    throw error;
  }
};

// saveStep3 별칭
export const saveStep3 = saveOnboardingStep3;

// 4단계: 선호도 저장 (이름 변경: saveOnboardingStep4 -> saveStep4)
export const saveOnboardingStep4 = async (preferenceData) => {
  try {
    console.log("🔍 saveOnboardingStep4 호출, 입력 데이터:", preferenceData);

    // 서버가 기대하는 형식으로 변환
    const requestBody = {
      stepNumber: 4,
      stepData: preferenceData,
    };

    console.log("🔍 서버로 전송할 데이터:", requestBody);

    const response = await api.post("/onboarding/steps/4/save", requestBody);
    return response.data;
  } catch (error) {
    console.error("🔍 Save onboarding step4 error:", error);
    throw error;
  }
};

// saveStep4 별칭
export const saveStep4 = saveOnboardingStep4;

// 언어 정보 저장
export const saveLanguageInfo = async (languageData) => {
  try {
    console.log("🔍 saveLanguageInfo 호출됨, 입력 데이터:", languageData);
    console.log("🔍 nativeLanguageId:", languageData.nativeLanguageId);
    console.log(
      "🔍 nativeLanguageId 타입:",
      typeof languageData.nativeLanguageId
    );

    const requestBody = {
      languageId: languageData.nativeLanguageId,
    };
    console.log("🔍 API 요청 본문:", requestBody);

    const response = await api.post(
      "/onboarding/language/native-language",
      requestBody
    );

    // 목표 언어들 저장 (배치로 처리)
    if (
      languageData.targetLanguages &&
      languageData.targetLanguages.length > 0
    ) {
      console.log("🔍 [saveLanguageInfo] 목표 언어 저장 시작");
      console.log(
        "🔍 [saveLanguageInfo] targetLanguages:",
        languageData.targetLanguages
      );

      const languageLevelRequest = {
        languages: languageData.targetLanguages.map((targetLang) => ({
          languageId: targetLang.languageId,
          currentLevelId: targetLang.currentLevelId,
          targetLevelId: targetLang.targetLevelId,
        })),
      };

      console.log(
        "🔍 [saveLanguageInfo] language-level API 요청:",
        languageLevelRequest
      );

      try {
        const levelResponse = await api.post(
          "/onboarding/language/language-level",
          languageLevelRequest
        );
        console.log(
          "🔍 [saveLanguageInfo] language-level API 응답:",
          levelResponse.data
        );
      } catch (levelError) {
        console.error(
          "🔍 [saveLanguageInfo] ❌ language-level API 실패:",
          levelError
        );
        console.error(
          "🔍 [saveLanguageInfo] Error status:",
          levelError.response?.status
        );
        console.error(
          "🔍 [saveLanguageInfo] Error data:",
          levelError.response?.data
        );
        throw levelError;
      }
    }

    return response.data;
  } catch (error) {
    console.error("🔍 Save language info error:", error);
    console.error("🔍 Error response:", error.response);
    console.error("🔍 Error data:", error.response?.data);
    throw error;
  }
};

// 관심사 정보 저장
export const saveInterestInfo = async (interestData) => {
  try {
    const unique = (values = []) =>
      Array.isArray(values)
        ? [...new Set(values.map((value) => Number(value)))]
            .filter((value) => !Number.isNaN(value))
        : [];

    const motivationIds = unique(interestData.motivationIds);
    const topicIds = unique(interestData.topicIds);
    const learningStyleIds = unique(interestData.learningStyleIds);
    const learningExpectationIds = unique(interestData.learningExpectationIds);

    const requests = [];

    // 동기 저장 (배치로 처리)
    if (motivationIds.length > 0) {
      requests.push(
        api.post("/onboarding/interest/motivation", {
          motivationIds,
        })
      );
    }

    // 주제 저장 (배치로 처리)
    if (topicIds.length > 0) {
      requests.push(
        api.post("/onboarding/interest/topic", {
          topicIds,
        })
      );
    }

    // 학습 스타일 저장 (배치로 처리)
    if (learningStyleIds.length > 0) {
      requests.push(
        api.post("/onboarding/interest/learning-style", {
          learningStyleIds,
        })
      );
    }

    // 학습 기대 저장 (배치로 처리)
    if (learningExpectationIds.length > 0) {
      requests.push(
        api.post("/onboarding/interest/learning-expectation", {
          learningExpectationIds,
        })
      );
    }

    await Promise.all(requests);
    return { success: true };
  } catch (error) {
    console.error("Save interest info error:", error);
    throw error;
  }
};

// 파트너 선호도 저장
export const savePartnerInfo = async (partnerData) => {
  try {
    const requests = [];

    // 파트너 성격 저장 (배치로 처리)
    if (
      partnerData.partnerPersonalityIds &&
      partnerData.partnerPersonalityIds.length > 0
    ) {
      requests.push(
        api.post("/onboarding/partner/personality", {
          personalPartnerIds: partnerData.partnerPersonalityIds,
        })
      );
    }

    // 그룹 크기는 스케줄 API에서 처리됩니다

    await Promise.all(requests);
    return { success: true };
  } catch (error) {
    console.error("Save partner info error:", error);
    throw error;
  }
};

// 스케줄 정보 저장
export const saveScheduleInfo = async (scheduleData) => {
  try {
    // 스케줄 데이터가 있는 경우 서버로 전송
    if (scheduleData.schedules && scheduleData.schedules.length > 0) {
      const response = await api.post("/onboarding/schedule", {
        schedules: scheduleData.schedules,
      });
      return response.data;
    }

    // 스케줄이 없는 경우에도 성공으로 처리 (사용자가 스케줄을 선택하지 않을 수 있음)
    return { success: true };
  } catch (error) {
    console.error("Save schedule info error:", error);
    throw error;
  }
};

// 온보딩 옵션 조회 함수들 (기존 API 활용)

// 언어 목록 조회
export const getLanguages = async () => {
  try {
    const response = await api.get("/onboarding/language/languages");
    return toDataArray(response);
  } catch (error) {
    console.error("Get languages error:", error);
    throw error;
  }
};

// 언어 레벨 타입 조회
export const getLanguageLevelTypes = async () => {
  try {
    const response = await api.get("/onboarding/language/level-types-language");
    return toDataArray(response);
  } catch (error) {
    console.error("Get language level types error:", error);
    throw error;
  }
};

// 파트너 레벨 타입 조회
export const getPartnerLevelTypes = async () => {
  try {
    const response = await api.get("/onboarding/language/level-types-partner");
    return toDataArray(response);
  } catch (error) {
    console.error("Get partner level types error:", error);
    throw error;
  }
};

// 동기 목록 조회
export const getMotivations = async () => {
  try {
    const response = await api.get("/onboarding/interest/motivations");
    return toDataArray(response);
  } catch (error) {
    console.error("Get motivations error:", error);
    throw error;
  }
};

// 주제 목록 조회
export const getTopics = async () => {
  try {
    const response = await api.get("/onboarding/interest/topics");
    return toDataArray(response);
  } catch (error) {
    console.error("Get topics error:", error);
    throw error;
  }
};

// 학습 스타일 목록 조회
export const getLearningStyles = async () => {
  try {
    const response = await api.get("/onboarding/interest/learning-styles");
    return toDataArray(response);
  } catch (error) {
    console.error("Get learning styles error:", error);
    throw error;
  }
};

// 학습 기대 목록 조회
export const getLearningExpectations = async () => {
  try {
    const response = await api.get(
      "/onboarding/interest/learning-expectations"
    );
    return toDataArray(response);
  } catch (error) {
    console.error("Get learning expectations error:", error);
    throw error;
  }
};

//영어 이름 저장
export const saveEnglishName = async ({ englishName }) => {
  try {
    const response = await api.post("/users/english-name", { englishName });
    return response.data;
  } catch (error) {
    console.error("Save English name error:", error);
    throw error;
  }
};
