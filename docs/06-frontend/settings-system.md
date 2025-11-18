# Settings System

**언어 교환 학습 플랫폼의 설정 시스템 완전 가이드**

## 📋 목차

1. [시스템 개요](#시스템-개요)
2. [아키텍처](#아키텍처)
3. [설정 카테고리](#설정-카테고리)
4. [보안 및 인증](#보안-및-인증)
5. [데이터 관리](#데이터-관리)
6. [UI/UX 패턴](#uiux-패턴)
7. [개발 가이드](#개발-가이드)

---

## 시스템 개요

Settings System은 사용자가 계정, 알림, 프라이버시, 언어, 보안, 데이터를 관리할 수 있는 통합 설정 플랫폼입니다.

### 주요 특징

- **7개 설정 카테고리**: Account, Notifications, Privacy, Language, Security, Data, Login History
- **실시간 저장**: 변경사항 즉시 반영
- **유효성 검사**: 입력 데이터 실시간 검증
- **보안 강화**: 2FA, 비밀번호 강도 체크
- **GDPR/PIPA 준수**: 데이터 내보내기, 계정 삭제
- **반응형 디자인**: 모바일/태블릿/데스크톱 대응

### 기술 스택

```javascript
// 핵심 기술
- React 19.1.0
- React Router DOM 7.6.3
- Axios (API 통신)
- Lucide React (아이콘)
- Tailwind CSS (스타일링)

// 주요 패턴
- Controlled Components (폼 상태 관리)
- Custom Hooks (useAlert)
- Promise.allSettled (병렬 API 호출)
```

---

## 아키텍처

### 라우팅 구조

```javascript
// src/config/routes.js

// 설정 메인
/settings                  → SettingsMain

// 개별 설정 페이지
/settings/account          → AccountSettings
/settings/notifications    → NotificationSettings
/settings/privacy          → PrivacySettings
/settings/language         → LanguageSettings
/settings/security         → SecuritySettings
/settings/data             → DataSettings
/settings/login-history    → LoginHistory
/settings/delete-account   → DeleteAccount
```

### API 통신 구조

```javascript
// src/api/settings.js

// API Endpoints
GET    /settings/account           // 계정 설정 조회
PATCH  /settings/account           // 계정 설정 업데이트
GET    /settings/notifications     // 알림 설정 조회
PATCH  /settings/notifications     // 알림 설정 업데이트
GET    /settings/privacy           // 프라이버시 설정 조회
PATCH  /settings/privacy           // 프라이버시 설정 업데이트
GET    /settings/language          // 언어 설정 조회
PATCH  /settings/language          // 언어 설정 업데이트
PATCH  /settings/password          // 비밀번호 변경
GET    /settings/two-factor        // 2FA 설정 조회
POST   /settings/two-factor/enable // 2FA 활성화
POST   /settings/two-factor/disable// 2FA 비활성화
POST   /settings/export            // 데이터 내보내기
GET    /settings/login-history     // 로그인 기록 조회
DELETE /settings/account           // 계정 삭제
```

### 데이터 흐름

```
사용자 입력
   ↓
State 업데이트 (useState)
   ↓
실시간 유효성 검사
   ↓
저장 버튼 클릭
   ↓
API 호출 (PATCH/POST)
   ↓
성공/실패 처리
   ↓
UI 피드백 (useAlert)
```

---

## 설정 카테고리

### 1. Account Settings (계정 설정)

**파일**: `src/pages/Settings/AccountSettings.jsx`

#### 기능

```javascript
// 관리 항목
- 프로필 이미지 (ProfileImageUpload)
- 영어 이름 (영문, 2-50자)
- 거주지
- 자기소개 (최대 500자)
- 이메일 (유효성 검증)
- 전화번호 (선택사항)
- 생년월일
- 성별 (male, female, other)
```

#### 유효성 검사

```javascript
const validateField = (field, value) => {
  const errors = { ...validationErrors };

  switch (field) {
    case 'englishName':
      if (value && !/^[a-zA-Z\s]*$/.test(value)) {
        errors[field] = '영어 알파벳과 공백만 입력 가능합니다';
      } else if (value && value.trim().length < 2) {
        errors[field] = '최소 2글자 이상 입력해주세요';
      } else if (value && value.length > 50) {
        errors[field] = '50글자를 초과할 수 없습니다';
      } else {
        delete errors[field];
      }
      break;
    case 'email':
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors[field] = '올바른 이메일 형식을 입력해주세요';
      } else {
        delete errors[field];
      }
      break;
    case 'phoneNumber':
      if (value && !/^[\d-+\s()]*$/.test(value)) {
        errors[field] = '유효한 전화번호 형식을 입력해주세요';
      } else {
        delete errors[field];
      }
      break;
    case 'bio':
      if (value && value.length > 500) {
        errors[field] = '500글자를 초과할 수 없습니다';
      } else {
        delete errors[field];
      }
      break;
  }

  setValidationErrors(errors);
  return Object.keys(errors).length === 0;
};
```

#### 데이터 로딩

```javascript
const loadAccountSettings = async () => {
  try {
    setLoading(true);

    // 병렬 API 호출 (성능 최적화)
    const [profileData, accountData] = await Promise.allSettled([
      getUserProfile(),
      getAccountSettings()
    ]);

    let combinedSettings = { ...settings };

    if (profileData.status === 'fulfilled') {
      combinedSettings = {
        ...combinedSettings,
        englishName: profileData.value.englishName || '',
        residence: profileData.value.residence || '',
        profileImage: profileData.value.profileImage || null,
        bio: profileData.value.bio || ''
      };
    }

    if (accountData.status === 'fulfilled') {
      combinedSettings = {
        ...combinedSettings,
        ...accountData.value
      };
    }

    setSettings(combinedSettings);
  } catch (error) {
    console.error('Failed to load account settings:', error);
  } finally {
    setLoading(false);
  }
};
```

---

### 2. Notification Settings (알림 설정)

**파일**: `src/pages/Settings/NotificationSettings.jsx`

#### 설정 항목

```javascript
const [settings, setSettings] = useState({
  // 푸시 알림
  pushEnabled: true,
  pushChat: true,
  pushMatching: true,
  pushSession: true,
  pushLevelTest: true,
  pushAchievements: true,

  // 이메일 알림
  emailEnabled: true,
  emailWeeklySummary: true,
  emailSessionReminder: true,
  emailNewMatch: true,
  emailPromotions: false,

  // 소리 및 진동
  soundEnabled: true,
  vibrationEnabled: true,

  // 방해 금지 시간
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00'
});
```

#### ToggleSwitch 컴포넌트

```javascript
const ToggleSwitch = ({ checked, onChange, disabled = false }) => (
  <button
    onClick={() => !disabled && onChange()}
    disabled={disabled}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
      checked ? 'bg-[#00C471]' : 'bg-gray-200'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);
```

#### 방해 금지 시간

```javascript
{settings.quietHoursEnabled && (
  <div className="bg-gray-50 rounded-lg p-4 space-y-4">
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-[#111111]">시작 시간</span>
      <input
        type="time"
        value={settings.quietHoursStart}
        onChange={(e) => handleTimeChange('quietHoursStart', e.target.value)}
        className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00C471] focus:border-[#00C471]"
      />
    </div>
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-[#111111]">종료 시간</span>
      <input
        type="time"
        value={settings.quietHoursEnd}
        onChange={(e) => handleTimeChange('quietHoursEnd', e.target.value)}
        className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00C471] focus:border-[#00C471]"
      />
    </div>
  </div>
)}
```

---

### 3. Privacy Settings (프라이버시 설정)

**파일**: `src/pages/Settings/PrivacySettings.jsx`

#### 설정 구조

```javascript
const [settings, setSettings] = useState({
  // 프로필 공개 설정
  profileVisibility: 'public', // public, friends, private
  showAge: true,
  showLocation: true,
  showOnlineStatus: true,
  showLastSeen: false,

  // 매칭 설정
  allowMatching: true,
  matchingRadius: '50', // km: 10, 25, 50, 100, unlimited
  showInSearch: true,

  // 연락처 설정
  allowDirectMessage: 'friends', // everyone, friends, none
  allowGroupInvite: 'friends',
  showEmail: false,
  showPhoneNumber: false,

  // 활동 설정
  showLearningStats: true,
  showAchievements: true,
  showSessionHistory: false,

  // 데이터 수집 동의
  allowAnalytics: true,
  allowPersonalization: true,
  allowMarketing: false,
  allowThirdPartySharing: false
});
```

#### SelectSetting 컴포넌트

```javascript
const SelectSetting = ({ icon: Icon, title, description, value, options, onChange }) => (
  <div className="py-4">
    <div className="flex items-center space-x-3 mb-3">
      <Icon className="w-5 h-5 text-[#929292]" />
      <div>
        <h3 className="text-[#111111] font-medium">{title}</h3>
        {description && (
          <p className="text-sm text-[#929292]">{description}</p>
        )}
      </div>
    </div>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00C471] focus:border-[#00C471] transition-colors"
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

// 사용 예시
const privacyOptions = [
  { value: 'public', label: '모두에게 공개' },
  { value: 'friends', label: '친구에게만 공개' },
  { value: 'private', label: '비공개' }
];

<SelectSetting
  icon={Shield}
  title="프로필 공개 범위"
  description="다른 사용자가 프로필을 볼 수 있는 범위"
  value={settings.profileVisibility}
  options={privacyOptions}
  onChange={(value) => handleSelectChange('profileVisibility', value)}
/>
```

---

### 4. Language Settings (언어 설정)

**파일**: `src/pages/Settings/LanguageSettings.jsx`

#### 언어 옵션

```javascript
const languages = [
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' }
];

const translationServices = [
  { value: 'google', label: 'Google Translate' },
  { value: 'deepl', label: 'DeepL' },
  { value: 'papago', label: 'Papago' }
];

const speechOptions = [
  { value: 'en-US', label: 'English (US)', flag: '🇺🇸' },
  { value: 'en-GB', label: 'English (UK)', flag: '🇬🇧' },
  { value: 'ko-KR', label: '한국어', flag: '🇰🇷' },
  { value: 'ja-JP', label: '日本語', flag: '🇯🇵' },
  { value: 'zh-CN', label: '中文 (简体)', flag: '🇨🇳' }
];
```

#### 설정 항목

```javascript
const [settings, setSettings] = useState({
  // 앱 언어
  appLanguage: 'ko',

  // 학습 언어 설정
  nativeLanguage: 'ko',
  targetLanguages: ['en'], // 복수 선택 가능

  // 번역 설정
  autoTranslate: true,
  showRomanization: false,
  translationService: 'google',

  // 음성 설정
  speechLanguage: 'en-US',
  speechSpeed: 'normal', // slow, normal, fast
  voiceGender: 'female' // male, female
});
```

#### 학습 언어 다중 선택

```javascript
const handleTargetLanguageToggle = (langCode) => {
  setSettings(prev => ({
    ...prev,
    targetLanguages: prev.targetLanguages.includes(langCode)
      ? prev.targetLanguages.filter(l => l !== langCode)
      : [...prev.targetLanguages, langCode]
  }));
};

// UI
<div className="grid grid-cols-1 gap-2">
  {languages.filter(lang => lang.code !== settings.nativeLanguage).map((lang) => (
    <label key={lang.code} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
      <input
        type="checkbox"
        checked={settings.targetLanguages.includes(lang.code)}
        onChange={() => handleTargetLanguageToggle(lang.code)}
        className="w-4 h-4 text-[#00C471] border-gray-300 rounded focus:ring-[#00C471]"
      />
      <span className="ml-3 text-2xl">{lang.flag}</span>
      <span className="ml-3 text-[#111111] font-medium">{lang.name}</span>
    </label>
  ))}
</div>
```

---

### 5. Security Settings (보안 설정)

**파일**: `src/pages/Settings/SecuritySettings.jsx`

#### 비밀번호 변경

```javascript
const [passwordForm, setPasswordForm] = useState({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const handlePasswordChange = async () => {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    showError('새 비밀번호가 일치하지 않습니다.');
    return;
  }

  if (passwordForm.newPassword.length < 8) {
    showError('비밀번호는 8자 이상이어야 합니다.');
    return;
  }

  try {
    setSaving(true);
    await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
    showSuccess('비밀번호가 성공적으로 변경되었습니다.');
    setShowPasswordForm(false);
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  } catch (error) {
    console.error('Failed to change password:', error);
    showError('비밀번호 변경에 실패했습니다. 현재 비밀번호를 확인해주세요.');
  } finally {
    setSaving(false);
  }
};
```

#### 2FA (Two-Factor Authentication)

```javascript
// 2FA 활성화 플로우
const handleEnable2FA = async () => {
  try {
    setSaving(true);
    const response = await enableTwoFactor();
    setQrCode(response.qrCode); // QR 코드 이미지 URL
    setShow2FAForm(true);
  } catch (error) {
    console.error('Failed to enable 2FA:', error);
    showError('2단계 인증 활성화에 실패했습니다.');
  } finally {
    setSaving(false);
  }
};

// 인증 코드 검증
const handleVerify2FA = async () => {
  if (!verificationCode) {
    showError('인증 코드를 입력해주세요.');
    return;
  }

  try {
    setSaving(true);
    await disableTwoFactor(verificationCode); // 인증 확인용
    setTwoFactorEnabled(true);
    setShow2FAForm(false);
    setVerificationCode('');
    showSuccess('2단계 인증이 활성화되었습니다.');
  } catch (error) {
    console.error('Failed to verify 2FA:', error);
    showError('인증 코드가 올바르지 않습니다.');
  } finally {
    setSaving(false);
  }
};
```

#### QR 코드 표시

```javascript
{show2FAForm && !twoFactorEnabled && (
  <div className="space-y-4 border-t border-gray-100 pt-4">
    <div className="text-center">
      <h4 className="font-medium text-[#111111] mb-2">QR 코드 스캔</h4>
      <p className="text-sm text-[#929292] mb-4">
        인증 앱으로 아래 QR 코드를 스캔하고, 생성된 6자리 코드를 입력하세요.
      </p>
      {qrCode && (
        <div className="bg-gray-100 p-4 rounded-lg mb-4">
          <img src={qrCode} alt="2FA QR Code" className="mx-auto max-w-[280px]" />
        </div>
      )}
    </div>

    <div>
      <label className="block text-sm font-medium text-[#111111] mb-2">인증 코드</label>
      <input
        type="text"
        value={verificationCode}
        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
        placeholder="000000"
        maxLength={6}
        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00C471] focus:border-[#00C471] text-center tracking-widest text-[20px]"
      />
    </div>
  </div>
)}
```

#### PasswordInput 컴포넌트

```javascript
const PasswordInput = ({
  value,
  onChange,
  placeholder,
  show,
  onToggleShow,
  autoComplete = "current-password"
}) => (
  <div className="relative">
    <input
      type={show ? "text" : "password"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoComplete={autoComplete}
      className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00C471] focus:border-[#00C471] transition-colors"
    />
    <button
      type="button"
      onClick={onToggleShow}
      className="absolute right-3 top-3.5 text-[#929292] hover:text-[#111111] transition-colors"
    >
      {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
    </button>
  </div>
);
```

---

### 6. Data Settings (데이터 관리)

**파일**: `src/pages/Settings/DataSettings.jsx`

#### 데이터 내보내기

```javascript
const handleExportData = async () => {
  if (!window.confirm('개인 데이터를 내보내시겠습니까? 이 작업은 몇 분이 소요될 수 있습니다.')) {
    return;
  }

  try {
    setExporting(true);
    setExportStatus('데이터를 준비 중입니다...');

    const response = await exportUserData();

    if (response.downloadUrl) {
      // 다운로드 링크가 있는 경우 바로 다운로드
      const link = document.createElement('a');
      link.href = response.downloadUrl;
      link.download = response.filename || 'studymate-data.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setExportStatus('데이터 내보내기가 완료되었습니다.');
    } else if (response.requestId) {
      // 비동기 처리인 경우
      setExportStatus('데이터 준비가 완료되면 이메일로 다운로드 링크를 보내드립니다.');
    }
  } catch (error) {
    console.error('Failed to export data:', error);
    setExportStatus('데이터 내보내기에 실패했습니다.');
  } finally {
    setExporting(false);
  }
};
```

#### 내보낼 데이터 항목

```javascript
// 데이터 내보내기 항목
- 프로필 정보 및 설정
- 채팅 메시지 기록
- 학습 진도 및 통계
- 세션 참여 기록
- 매칭 기록
- 성취 및 배지 정보
- 업로드한 파일 목록
```

#### 저장 공간 표시

```javascript
<div className="space-y-4">
  <div className="flex justify-between items-center py-2">
    <span className="text-[#111111]">프로필 이미지</span>
    <span className="text-[#929292] text-sm">2.3 MB</span>
  </div>
  <div className="flex justify-between items-center py-2">
    <span className="text-[#111111]">채팅 첨부파일</span>
    <span className="text-[#929292] text-sm">15.7 MB</span>
  </div>
  <div className="flex justify-between items-center py-2">
    <span className="text-[#111111]">세션 녹화파일</span>
    <span className="text-[#929292] text-sm">248.1 MB</span>
  </div>
  <div className="flex justify-between items-center py-2">
    <span className="text-[#111111]">레벨테스트 음성</span>
    <span className="text-[#929292] text-sm">12.5 MB</span>
  </div>

  <div className="border-t border-gray-200 pt-4">
    <div className="flex justify-between items-center">
      <span className="text-[#111111] font-semibold">총 사용량</span>
      <span className="text-[#111111] font-semibold">278.6 MB</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
      <div className="bg-[#00C471] h-2 rounded-full" style={{ width: '27.86%' }}></div>
    </div>
    <p className="text-xs text-[#929292] mt-1">1GB 중 278.6MB 사용</p>
  </div>
</div>
```

#### 로그인 기록 요약

```javascript
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getDeviceIcon = (device) => {
  if (device.toLowerCase().includes('mobile') || device.toLowerCase().includes('android') || device.toLowerCase().includes('iphone')) {
    return '📱';
  } else if (device.toLowerCase().includes('tablet') || device.toLowerCase().includes('ipad')) {
    return '📟';
  }
  return '💻';
};
```

---

### 7. Login History (로그인 기록)

**파일**: `src/pages/Settings/LoginHistory.jsx`

#### 필터링

```javascript
const [filter, setFilter] = useState('all'); // all, suspicious, recent

const filteredHistory = Array.isArray(loginHistory)
  ? loginHistory.filter(record => {
      if (filter === 'suspicious') return record.suspicious;
      if (filter === 'recent') {
        const now = new Date();
        const loginTime = new Date(record.loginTime);
        const diffInHours = (now - loginTime) / (1000 * 60 * 60);
        return diffInHours <= 24;
      }
      return true;
    })
  : [];
```

#### 상태 배지

```javascript
const getStatusBadge = (record) => {
  const now = new Date();
  const loginTime = new Date(record.loginTime);
  const diffInHours = (now - loginTime) / (1000 * 60 * 60);

  if (record.suspicious) {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <AlertTriangle className="w-3 h-3 mr-1" />
        의심스러움
      </span>
    );
  } else if (diffInHours <= 1) {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        현재 세션
      </span>
    );
  } else if (diffInHours <= 24) {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        최근
      </span>
    );
  }
  return null;
};
```

#### 의심스러운 활동 알림

```javascript
{filteredHistory.some(record => record.suspicious) && (
  <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
    <div className="flex items-start space-x-3">
      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <h3 className="font-medium text-yellow-900 mb-2">보안 알림</h3>
        <p className="text-sm text-yellow-800 mb-3">
          의심스러운 로그인 활동이 감지되었습니다. 본인이 아닌 경우 즉시 비밀번호를 변경하세요.
        </p>
        <button
          onClick={() => navigate('/settings/security')}
          className="text-sm text-yellow-900 font-medium hover:text-yellow-700 underline"
        >
          보안 설정으로 이동 →
        </button>
      </div>
    </div>
  </div>
)}
```

#### 시간 표시 포맷

```javascript
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 60) {
    return `${diffInMinutes}분 전`;
  } else if (diffInHours < 24) {
    return `${diffInHours}시간 전`;
  } else if (diffInDays < 7) {
    return `${diffInDays}일 전`;
  } else {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};
```

---

### 8. Delete Account (계정 삭제)

**파일**: `src/pages/Settings/DeleteAccount.jsx`

#### 3단계 프로세스

```javascript
const [step, setStep] = useState(1); // 1: 확인, 2: 사유 선택, 3: 비밀번호

// Step 1: 삭제될 데이터 확인
// Step 2: 삭제 사유 선택 (선택사항)
// Step 3: 비밀번호 입력 + 동의 + 최종 확인
```

#### 삭제 사유 옵션

```javascript
const deleteReasons = [
  { id: 'not_useful', label: '더 이상 사용하지 않음' },
  { id: 'privacy_concerns', label: '개인정보 보호 우려' },
  { id: 'found_alternative', label: '다른 서비스를 찾음' },
  { id: 'technical_issues', label: '기술적 문제' },
  { id: 'cost_concerns', label: '비용 문제' },
  { id: 'poor_experience', label: '사용자 경험 불만' },
  { id: 'other', label: '기타' }
];
```

#### 동의 항목

```javascript
const [agreements, setAgreements] = useState({
  dataLoss: false,      // 모든 데이터가 영구적으로 삭제됨
  noRecovery: false,    // 어떤 방법으로도 복구 불가능
  immediate: false      // 즉시 처리됨
});
```

#### 최종 확인 텍스트

```javascript
const [confirmText, setConfirmText] = useState('');
const requiredText = 'STUDYMATE 계정을 영구적으로 삭제하시겠습니까?';

if (confirmText !== requiredText) {
  showError('확인 텍스트를 정확히 입력해주세요.');
  return;
}
```

#### 계정 삭제 프로세스

```javascript
const handleDeleteAccount = async () => {
  if (!password.trim()) {
    showError('비밀번호를 입력해주세요.');
    return;
  }

  if (!Object.values(agreements).every(Boolean)) {
    showError('모든 항목에 동의해주세요.');
    return;
  }

  if (confirmText !== requiredText) {
    showError('확인 텍스트를 정확히 입력해주세요.');
    return;
  }

  try {
    setDeleting(true);
    await deleteAccount(password);

    // 로컬 스토리지 클리어
    localStorage.clear();
    sessionStorage.clear();

    showSuccess(
      '계정이 성공적으로 삭제되었습니다. 그동안 STUDYMATE를 이용해주셔서 감사했습니다.',
      () => {
        // 메인 페이지로 이동
        window.location.href = '/';
      }
    );
  } catch (error) {
    console.error('Failed to delete account:', error);
    if (error.response?.status === 401) {
      showError('비밀번호가 올바르지 않습니다.');
    } else {
      showError('계정 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  } finally {
    setDeleting(false);
  }
};
```

#### 대안 제시

```javascript
<div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
  <h3 className="font-medium text-blue-900 mb-3">잠시만요! 다른 옵션을 고려해보세요</h3>
  <div className="space-y-2 text-sm text-blue-800">
    <p>• <strong>계정 비활성화</strong>: 데이터를 보존하면서 일시적으로 계정을 비활성화할 수 있습니다.</p>
    <p>• <strong>개인정보 수정</strong>: 개인정보 설정에서 공개 범위를 조정할 수 있습니다.</p>
    <p>• <strong>알림 끄기</strong>: 알림 설정에서 모든 알림을 비활성화할 수 있습니다.</p>
    <p>• <strong>고객 지원</strong>: 문제가 있다면 고객 지원팀에 문의해주세요.</p>
  </div>
  <div className="flex gap-3 mt-4">
    <button
      onClick={() => navigate('/settings/account')}
      className="text-sm text-blue-900 font-medium hover:text-blue-700 underline"
    >
      계정 설정으로 이동
    </button>
    <span className="text-blue-600">|</span>
    <button
      onClick={() => window.open('mailto:support@studymate.com')}
      className="text-sm text-blue-900 font-medium hover:text-blue-700 underline"
    >
      고객 지원 문의
    </button>
  </div>
</div>
```

---

## 보안 및 인증

### 비밀번호 정책

```javascript
// 비밀번호 요구사항
- 최소 8자 이상
- 영문, 숫자, 특수문자 포함 권장
- 다른 서비스와 동일한 비밀번호 사용 금지

// 검증 로직
if (passwordForm.newPassword.length < 8) {
  showError('비밀번호는 8자 이상이어야 합니다.');
  return;
}
```

### 2FA (Two-Factor Authentication)

#### 활성화 프로세스

```
1. 사용자가 2FA 활성화 요청
   ↓
2. 백엔드에서 QR 코드 생성 (TOTP secret)
   ↓
3. 사용자가 인증 앱 (Google Authenticator, Authy 등)으로 QR 코드 스캔
   ↓
4. 인증 앱에서 6자리 코드 생성
   ↓
5. 사용자가 코드 입력하여 검증
   ↓
6. 검증 성공 시 2FA 활성화 완료
```

#### 백업 코드

```javascript
// 2FA 활성화 시 백업 코드 10개 제공
// 인증 앱 접근 불가 시 사용
// 각 코드는 1회만 사용 가능
```

### 세션 관리

```javascript
// 로그인 기록 보관 기간
- 90일간 보관
- 의심스러운 활동 자동 감지
- IP 주소, 기기 정보, 위치 정보 저장

// 세션 보안
- JWT 토큰 기반 인증
- 토큰 만료 시간: 1시간
- Refresh Token: 7일
```

---

## 데이터 관리

### GDPR/PIPA 준수

```javascript
// 데이터 내보내기
- 모든 개인 데이터를 JSON 형식으로 제공
- 30일 후 자동 삭제
- 비동기 처리 (대용량 데이터)
- 이메일로 다운로드 링크 전송

// 계정 삭제
- 즉시 개인정보 삭제
- 30일 후 완전 삭제
- 법적 요구사항에 따라 일부 데이터 보존
```

### 데이터 보존 정책

```javascript
// 계정 활성화 중
- 모든 데이터 보존

// 계정 비활성화
- 6개월 후 개인정보 익명화

// 계정 삭제
- 즉시 개인정보 삭제
- 30일 후 완전 삭제
- 법적 요구사항에 따라 일부 데이터 더 오래 보존
```

---

## UI/UX 패턴

### 공통 UI 컴포넌트

#### CommonButton

```javascript
// src/components/CommonButton.jsx
import CommonButton from '../../components/CommonButton';

// 사용 예시
<CommonButton
  onClick={handleSave}
  disabled={saving}
  variant="success"
  className="w-full"
>
  {saving ? '저장 중...' : '변경사항 저장'}
</CommonButton>

// Variants
- primary: 검정 배경
- success: 초록 배경 (#00C471)
- secondary: 회색 배경
- danger: 빨강 배경 (#EA4335)
```

#### ToggleSwitch

```javascript
const ToggleSwitch = ({ checked, onChange, disabled = false }) => (
  <button
    onClick={() => !disabled && onChange()}
    disabled={disabled}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
      checked ? 'bg-[#00C471]' : 'bg-gray-200'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);
```

### 로딩 상태

```javascript
if (loading) {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-[#00C471] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-[#929292] mt-2">로딩 중...</p>
      </div>
    </div>
  );
}
```

### 알림 (useAlert)

```javascript
import { useAlert } from '../../hooks/useAlert';

const { showSuccess, showError } = useAlert();

// 사용 예시
try {
  await updateSettings(settings);
  showSuccess('설정이 저장되었습니다.');
} catch (error) {
  showError('설정 저장에 실패했습니다.');
}
```

### 유효성 검사 UI

```javascript
// 에러 표시
{validationErrors.email && (
  <div className="flex items-center mt-1 text-[#EA4335] text-xs">
    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
    {validationErrors.email}
  </div>
)}

// 도움말 텍스트
<div className="mt-1 text-xs text-[#606060]">
  영어 알파벳과 공백만 사용 가능 (2-50글자)
</div>
```

### 반응형 디자인

```javascript
// Tailwind CSS 브레이크포인트
- sm: 640px
- md: 768px
- lg: 1024px

// 사용 예시
<div className="px-4 sm:px-6">             // 모바일: 16px, 태블릿: 24px
<h1 className="text-[18px] sm:text-[19px] md:text-xl">  // 모바일: 18px, 태블릿: 19px, 데스크톱: 20px
<div className="space-y-4 sm:space-y-5 md:space-y-6">   // 간격 조절
```

---

## 개발 가이드

### 새 설정 페이지 추가

#### 1. 페이지 컴포넌트 생성

```javascript
// src/pages/Settings/NewSettings.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { getNewSettings, updateNewSettings } from '../../api/settings';
import CommonButton from '../../components/CommonButton';
import { useAlert } from '../../hooks/useAlert';

const NewSettings = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();
  const [settings, setSettings] = useState({
    // 설정 항목들
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await getNewSettings();
      setSettings(prev => ({ ...prev, ...data }));
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateNewSettings(settings);
      showSuccess('설정이 저장되었습니다.');
    } catch (error) {
      console.error('Failed to save settings:', error);
      showError('설정 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#00C471] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-[#929292] mt-2">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] px-4 sm:px-6 overflow-y-auto">
      {/* Header */}
      <div className="pt-8 sm:pt-10 md:pt-12 pb-4 sm:pb-5 md:pb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white rounded-lg transition-colors touch-manipulation"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-[#111111] rotate-180" />
          </button>
          <h1 className="text-[18px] sm:text-[19px] md:text-xl font-bold text-[#111111] break-words">새 설정</h1>
          <div className="w-8 sm:w-10" />
        </div>
      </div>

      <div className="space-y-4 sm:space-y-5 md:space-y-6">
        {/* 설정 UI */}

        {/* 저장 버튼 */}
        <div className="pb-6 sm:pb-8">
          <CommonButton
            onClick={handleSave}
            disabled={saving}
            variant="success"
            className="w-full text-[14px] sm:text-[15px] md:text-base py-[14px] touch-manipulation"
          >
            {saving ? '저장 중...' : '변경사항 저장'}
          </CommonButton>
        </div>
      </div>
    </div>
  );
};

export default NewSettings;
```

#### 2. API 함수 추가

```javascript
// src/api/settings.js
export const getNewSettings = async () => {
  try {
    const response = await api.get('/settings/new');
    return response.data;
  } catch (error) {
    console.error('Get new settings error:', error);
    throw error;
  }
};

export const updateNewSettings = async (settings) => {
  try {
    const response = await api.patch('/settings/new', settings);
    return response.data;
  } catch (error) {
    console.error('Update new settings error:', error);
    throw error;
  }
};
```

#### 3. 라우트 추가

```javascript
// src/config/routes.js
const NewSettings = lazyLoad(() => import('../pages/Settings/NewSettings'));

// routes 배열에 추가
{
  path: '/settings/new',
  component: NewSettings,
  type: ROUTE_TYPES.PROTECTED,
  layout: true,
}
```

#### 4. SettingsMain에 메뉴 추가

```javascript
// src/pages/Settings/SettingsMain.jsx
const settingsItems = [
  // ... 기존 항목들
  {
    id: 'new',
    title: '새 설정',
    description: '새로운 설정 설명',
    icon: NewIcon,
    color: 'text-teal-500',
    path: '/settings/new'
  }
];
```

### 성능 최적화 팁

```javascript
// 1. Promise.allSettled로 병렬 API 호출
const [profileData, accountData] = await Promise.allSettled([
  getUserProfile(),
  getAccountSettings()
]);

// 2. Debounce로 실시간 검증 최적화
const debouncedValidate = useCallback(
  debounce((field, value) => {
    validateField(field, value);
  }, 300),
  []
);

// 3. useMemo로 계산 최적화
const filteredHistory = useMemo(() => {
  return loginHistory.filter(record => {
    // 필터 로직
  });
}, [loginHistory, filter]);

// 4. useCallback로 함수 메모이제이션
const handleToggle = useCallback((field) => {
  setSettings(prev => ({
    ...prev,
    [field]: !prev[field]
  }));
}, []);
```

### 접근성 (a11y)

```javascript
// 1. ARIA 속성
<button
  aria-label="뒤로 가기"
  onClick={() => navigate(-1)}
>
  <ChevronRight />
</button>

// 2. Keyboard Navigation
<button className="touch-manipulation">
  // touch-manipulation으로 모바일 탭 지원
</button>

// 3. Focus Management
<input
  className="focus:ring-2 focus:ring-[#00C471] focus:border-[#00C471]"
/>

// 4. Screen Reader
<label htmlFor="email">이메일</label>
<input id="email" type="email" />
```

### 에러 처리 패턴

```javascript
try {
  setLoading(true);
  const data = await apiCall();
  setData(data);
} catch (error) {
  console.error('Operation failed:', error);

  // HTTP 상태 코드별 처리
  if (error.response) {
    switch (error.response.status) {
      case 401:
        showError('인증이 필요합니다.');
        navigate('/');
        break;
      case 403:
        showError('권한이 없습니다.');
        break;
      case 404:
        showError('리소스를 찾을 수 없습니다.');
        break;
      case 500:
        showError('서버 오류가 발생했습니다.');
        break;
      default:
        showError('오류가 발생했습니다.');
    }
  } else if (error.request) {
    showError('네트워크 연결을 확인해주세요.');
  } else {
    showError('요청 처리 중 오류가 발생했습니다.');
  }
} finally {
  setLoading(false);
}
```

---

## 참고 자료

### 관련 문서

- [API 문서](/docs/04-api/api.md) - Settings API 엔드포인트
- [Frontend 가이드](/docs/06-frontend/frontend.md) - 전체 프론트엔드 아키텍처
- [디자인 시스템](/CLAUDE.md#디자인-시스템-원칙) - 색상, 간격, 타이포그래피

### 외부 라이브러리

- [React Router](https://reactrouter.com/) - 라우팅
- [Lucide React](https://lucide.dev/) - 아이콘
- [Tailwind CSS](https://tailwindcss.com/) - 스타일링

### 보안 표준

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [GDPR Compliance](https://gdpr-info.eu/)
- [PIPA (개인정보보호법)](https://www.privacy.go.kr/)

---

**마지막 업데이트**: 2025-01-18
**작성자**: Frontend Team
**버전**: 1.0.0
