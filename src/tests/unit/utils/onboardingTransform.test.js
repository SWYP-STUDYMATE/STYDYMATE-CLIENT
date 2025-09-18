import { describe, expect, it } from 'vitest';
import { transformOnboardingDataToLanguageProfile } from '../../../utils/onboardingTransform';

const buildPayload = (overrides = {}) => ({
  userOnboardingData: {
    nativeLanguageId: 1,
    targetLanguages: [
      {
        languageId: 2,
        languageName: '영어',
        targetLevelName: 'B2',
        currentLevelName: 'B1'
      }
    ],
    motivationIds: [10],
    topicIds: [],
    learningStyleIds: [],
    learningExpectationIds: [],
    ...overrides.userOnboardingData
  },
  availableOptions: {
    languages: [
      { id: 1, name: '한국어' },
      { id: 2, name: '영어' }
    ],
    motivations: [{ id: 10, name: '취업 준비' }],
    topics: [],
    learningStyles: [],
    learningExpectations: [],
    ...overrides.availableOptions
  }
});

describe('transformOnboardingDataToLanguageProfile', () => {
  it('returns empty arrays when onboarding data is missing', () => {
    const result = transformOnboardingDataToLanguageProfile(null);
    expect(result).toEqual({ teachableLanguages: [], learningLanguages: [], interests: [] });
  });

  it('maps native language and target languages correctly', () => {
    const payload = buildPayload();
    const result = transformOnboardingDataToLanguageProfile(payload);

    expect(result.teachableLanguages).toEqual([
      { language: '한국어', level: 'Native' }
    ]);
    expect(result.learningLanguages).toEqual([
      { language: '영어', level: 'B2' }
    ]);
    expect(result.interests).toEqual(['취업 준비']);
  });

  it('filters out empty language entries', () => {
    const payload = buildPayload({
      userOnboardingData: {
        targetLanguages: [
          { languageId: 3, targetLevelName: 'A2', currentLevelName: 'A1' }
        ]
      },
      availableOptions: {
        languages: [{ id: 1, name: '한국어' }]
      }
    });

    const result = transformOnboardingDataToLanguageProfile(payload);

    expect(result.learningLanguages).toHaveLength(0);
  });
});
