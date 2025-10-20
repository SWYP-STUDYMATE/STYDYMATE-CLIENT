/**
 * SEO 관련 유틸리티 함수
 */

/**
 * 페이지별 SEO 메타데이터 설정
 */
export const SEO_CONFIG = {
  home: {
    title: '홈',
    description: '전 세계 사람들과 실시간으로 언어를 교환하며 학습하세요.',
    keywords: ['언어 교환', '홈', '메인'],
  },
  login: {
    title: '로그인',
    description: 'STUDYMATE에 로그인하여 언어 학습을 시작하세요.',
    keywords: ['로그인', '회원가입', 'OAuth'],
  },
  signup: {
    title: '회원가입',
    description: 'STUDYMATE 회원가입으로 언어 학습 여정을 시작하세요.',
    keywords: ['회원가입', '가입', '신규'],
  },
  main: {
    title: '메인',
    description: '맞춤형 학습 추천과 파트너 매칭을 확인하세요.',
    keywords: ['메인', '대시보드', '학습 현황'],
  },
  chat: {
    title: '채팅',
    description: '실시간 번역 자막과 함께 파트너와 대화하세요.',
    keywords: ['채팅', '메시지', '실시간 번역'],
  },
  matching: {
    title: '매칭',
    description: 'AI 기반 매칭으로 최적의 언어 교환 파트너를 찾으세요.',
    keywords: ['매칭', '파트너', 'AI 추천'],
  },
  profile: {
    title: '프로필',
    description: '내 학습 현황과 프로필 정보를 관리하세요.',
    keywords: ['프로필', '설정', '내 정보'],
  },
  session: {
    title: '화상 세션',
    description: '1:1 화상 세션으로 실시간 언어 교환 학습을 진행하세요.',
    keywords: ['화상 세션', 'WebRTC', '1:1 학습'],
  },
  levelTest: {
    title: '레벨 테스트',
    description: 'AI 기반 레벨 테스트로 내 언어 실력을 정확하게 측정하세요.',
    keywords: ['레벨 테스트', 'AI 평가', '실력 측정'],
  },
  analytics: {
    title: '학습 분석',
    description: '내 학습 패턴과 성과를 상세하게 분석하세요.',
    keywords: ['학습 분석', '통계', '성과'],
  },
  achievements: {
    title: '업적',
    description: '학습 목표를 달성하고 배지를 획득하세요.',
    keywords: ['업적', '배지', '목표'],
  },
  settings: {
    title: '설정',
    description: '계정 설정과 알림 설정을 관리하세요.',
    keywords: ['설정', '계정', '알림'],
  },
  mates: {
    title: '친구',
    description: '내 언어 교환 파트너와 친구 목록을 확인하세요.',
    keywords: ['친구', '파트너', '목록'],
  },
  onboarding: {
    title: '온보딩',
    description: 'STUDYMATE 사용을 위한 초기 설정을 완료하세요.',
    keywords: ['온보딩', '초기 설정', '시작하기'],
  },
};

/**
 * 페이지 경로를 기반으로 SEO 메타데이터 반환
 * @param {string} pathname - 현재 페이지 경로
 * @returns {Object} SEO 메타데이터
 */
export function getSEOForRoute(pathname) {
  // 경로에서 페이지 키 추출
  const path = pathname.split('/')[1] || 'home';

  // 설정에서 해당 페이지 찾기
  const seoData = SEO_CONFIG[path];

  if (!seoData) {
    // 기본 SEO 데이터 반환
    return {
      title: null,
      description: null,
      keywords: null,
    };
  }

  return seoData;
}

/**
 * JSON-LD 구조화 데이터 생성
 * @param {Object} data - 구조화 데이터
 * @returns {string} JSON-LD 문자열
 */
export function generateJSONLD(data) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    ...data,
  });
}

/**
 * Organization 구조화 데이터
 */
export const ORGANIZATION_JSONLD = {
  '@type': 'Organization',
  name: 'STUDYMATE',
  url: 'https://languagemate.kr',
  logo: 'https://languagemate.kr/logo.png',
  description: '언어 교환 학습 플랫폼',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Service',
    availableLanguage: ['Korean', 'English'],
  },
  sameAs: [
    // SNS 링크 추가 가능
  ],
};

/**
 * WebSite 구조화 데이터
 */
export const WEBSITE_JSONLD = {
  '@type': 'WebSite',
  name: 'STUDYMATE',
  url: 'https://languagemate.kr',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://languagemate.kr/search?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};

/**
 * WebApplication 구조화 데이터
 */
export const WEBAPP_JSONLD = {
  '@type': 'WebApplication',
  name: 'STUDYMATE',
  url: 'https://languagemate.kr',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'KRW',
  },
  description: 'AI 기반 언어 교환 학습 플랫폼',
  featureList: [
    '실시간 화상 세션',
    'AI 레벨 테스트',
    '자동 번역 자막',
    '학습 분석',
    '파트너 매칭',
  ],
};

/**
 * BreadcrumbList 구조화 데이터 생성
 * @param {Array} items - Breadcrumb 항목 배열
 * @returns {Object} BreadcrumbList 구조화 데이터
 */
export function createBreadcrumbList(items) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * FAQ 구조화 데이터 생성
 * @param {Array} faqs - FAQ 항목 배열
 * @returns {Object} FAQPage 구조화 데이터
 */
export function createFAQPage(faqs) {
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Person 프로필 구조화 데이터 생성
 * @param {Object} profile - 프로필 정보
 * @returns {Object} Person 구조화 데이터
 */
export function createPersonProfile(profile) {
  return {
    '@type': 'Person',
    name: profile.name,
    image: profile.image,
    description: profile.intro,
    knowsLanguage: [profile.nativeLanguage, profile.targetLanguage],
  };
}
