const normalizeLanguageValue = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value.name || value.label || value.title || value.language || value.languageName || '';
};

const toLanguageTag = (language) => ({
  language: normalizeLanguageValue(language),
  level: language?.level || language?.levelName || language?.proficiency || language?.targetLevelName || language?.currentLevelName || ''
});

/**
 * 온보딩 데이터에서 언어/관심사 정보를 추출해 프로필 카드에서 사용 가능한 형태로 변환합니다.
 */
export const transformOnboardingDataToProfile = (payload) => {
  if (!payload?.userOnboardingData) {
    return {
      teachableLanguages: [],
      learningLanguages: [],
      interests: []
    };
  }

  const { userOnboardingData, availableOptions } = payload;

  const languageMap = new Map((availableOptions?.languages ?? []).map((lang) => [lang.id, lang]));
  const motivationMap = new Map((availableOptions?.motivations ?? []).map((item) => [item.id, item]));
  const topicMap = new Map((availableOptions?.topics ?? []).map((item) => [item.id, item]));
  const learningStyleMap = new Map((availableOptions?.learningStyles ?? []).map((item) => [item.id, item]));
  const expectationMap = new Map((availableOptions?.learningExpectations ?? []).map((item) => [item.id, item]));

  const teachableLanguages = [];
  if (userOnboardingData.nativeLanguageId) {
    const native = languageMap.get(userOnboardingData.nativeLanguageId);
    teachableLanguages.push({
      language: native?.name || native?.languageName || '모국어 미지정',
      level: 'Native'
    });
  }

  const learningLanguages = (userOnboardingData.targetLanguages ?? []).map((target) => toLanguageTag({
    language: target.languageName || languageMap.get(target.languageId)?.name,
    level: target.targetLevelName || target.currentLevelName || target?.level
  }));

  const interests = new Set([
    ...(userOnboardingData.motivationIds ?? []).map((id) => motivationMap.get(id)?.name),
    ...(userOnboardingData.topicIds ?? []).map((id) => topicMap.get(id)?.name),
    ...(userOnboardingData.learningStyleIds ?? []).map((id) => learningStyleMap.get(id)?.name),
    ...(userOnboardingData.learningExpectationIds ?? []).map((id) => expectationMap.get(id)?.name)
  ].filter(Boolean));

  return {
    teachableLanguages: teachableLanguages.filter(({ language }) => Boolean(language)),
    learningLanguages: learningLanguages.filter(({ language }) => Boolean(language)),
    interests: Array.from(interests)
  };
};

export const transformOnboardingDataToLanguageProfile = transformOnboardingDataToProfile;


export const transformUserLanguageInfoResponse = (payload) => {
  if (!payload) {
    return {
      teachableLanguages: [],
      learningLanguages: [],
      interests: []
    };
  }

  const native = payload.nativeLanguage;
  const targets = Array.isArray(payload.targetLanguages) ? payload.targetLanguages : [];

  const teachableLanguages = native && native.languageName
    ? [{ language: native.languageName, level: 'Native' }]
    : [];

  const learningLanguages = targets
    .map((item) => ({
      language: item.languageName || '',
      level: item.targetLevelName || item.currentLevelName || ''
    }))
    .filter(({ language }) => Boolean(language));

  return {
    teachableLanguages,
    learningLanguages,
    interests: []
  };
};

export default transformOnboardingDataToProfile;
