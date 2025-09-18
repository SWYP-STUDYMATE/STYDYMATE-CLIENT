import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit
} from 'lucide-react';
import CommonButton from '../../components/CommonButton';
import LanguageProfile from '../../components/LanguageProfile';
import AchievementBadges from '../../components/AchievementBadges';
import WeeklyActivityChart from '../../components/profile/WeeklyActivityChart';
import LanguageLevelProgress from '../../components/profile/LanguageLevelProgress';
import ProfileImageUpload from '../../components/ProfileImageUpload';
import ProfileEditor from '../../components/ProfileEditor';
import FileManager from '../../components/FileManager';
import OptimizedImage from '../../components/OptimizedImage';
import { DEFAULT_PROFILE_IMAGE } from '../../utils/imageUtils';
import useProfileStore from '../../store/profileStore';
import { logout } from '../../api/auth';
import { getOptimizedImageUrl } from '../../api/profile';
import { getUserLanguageInfo, getUserSettings, updateUserSettings } from '../../api/user';
import { getSessionActivity, getStudyStats } from '../../api/analytics';
import { deleteChatFile, fetchMyChatFiles } from '../../api/chat';
import { getFileUrl } from '../../api/profile';
import { useAlert } from '../../hooks/useAlert';
import useAchievementOverview from '../../hooks/useAchievementOverview';

const defaultLearningStats = {
  totalSessions: 0,
  totalMinutes: 0,
  currentStreak: null,
  monthlyGoal: null,
  monthlyProgress: null,
  averageDuration: null,
  preferredTime: null
};

const normalizeLanguageValue = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value.name || value.label || value.title || value.language || value.languageName || '';
};

const normalizeLanguageProfile = (raw) => {
  if (!raw) {
    return {
      teachableLanguages: [],
      learningLanguages: [],
      interests: []
    };
  }

  const toLanguageTag = (language) => ({
    language: normalizeLanguageValue(language),
    level: language?.level || language?.levelName || language?.proficiency || language?.cefrLevel || language?.skillLevel || ''
  });

  const teachable = raw.teachableLanguages || raw.teach || raw.nativeLanguages || raw.otherLanguages || [];
  const learning = raw.learningLanguages || raw.learn || raw.targetLanguages || raw.wantedLanguages || [];
  const interests = raw.interests || raw.topics || raw.motivations || [];

  return {
    teachableLanguages: Array.isArray(teachable) ? teachable.map(toLanguageTag).filter(({ language }) => language) : [],
    learningLanguages: Array.isArray(learning) ? learning.map(toLanguageTag).filter(({ language }) => language) : [],
    interests: Array.isArray(interests)
      ? interests
          .map(normalizeLanguageValue)
          .filter(Boolean)
      : []
  };
};

const normalizeStudyStats = (raw) => {
  if (!raw) {
    return {
      learningStats: defaultLearningStats,
      languageProgress: []
    };
  }

  const payload = raw.data ?? raw;

  const totalSessions = payload.totalSessions ?? payload.summary?.totalSessions ?? payload.metrics?.totalSessions ?? 0;
  const totalMinutes = payload.totalMinutes ?? payload.summary?.totalMinutes ?? payload.metrics?.totalMinutes ?? 0;
  const currentStreak = payload.weeklyStreak ?? payload.currentStreak ?? payload.summary?.currentStreak ?? null;
  const monthlyGoal = payload.monthlyGoal ?? payload.goals?.monthlyGoal ?? null;
  const monthlyProgress = payload.monthlyProgress ?? payload.goals?.monthlyProgress ?? null;
  const averageDuration = payload.averageSessionLength ?? payload.summary?.averageDuration ?? null;
  const preferredTime = payload.preferredTime ?? payload.summary?.preferredTime ?? null;

  const languageEntries = payload.languageProgress || payload.languages || [];
  const normalizeSkillMap = (skills = {}) => ({
    speaking: skills.speaking ?? skills.speakingScore ?? 0,
    listening: skills.listening ?? skills.listeningScore ?? 0,
    reading: skills.reading ?? skills.readingScore ?? 0,
    writing: skills.writing ?? skills.writingScore ?? 0
  });

  const languageProgress = Array.isArray(languageEntries)
    ? languageEntries.map((item) => ({
        language: normalizeLanguageValue(item.language) || item.code || item.id || '언어',
        progress: item.progress ?? item.completion ?? item.percentage ?? 0,
        currentLevel: item.currentLevel ?? item.level ?? item.cefrLevel ?? null,
        nextLevel: item.nextLevel ?? item.targetLevel ?? null,
        skills: normalizeSkillMap(item.skills ?? item.skillBreakdown)
      }))
    : [];

  return {
    learningStats: {
      totalSessions,
      totalMinutes,
      currentStreak,
      monthlyGoal,
      monthlyProgress,
      averageDuration,
      preferredTime
    },
    languageProgress
  };
};

const normalizeWeeklyActivity = (raw) => {
  const list = raw?.metrics?.dailyStats || raw?.data?.metrics?.dailyStats || raw?.dailyStats || raw || [];

  if (!Array.isArray(list)) {
    return [];
  }

  return list.map((item) => {
    const dateString = item.date || item.day || item.label;
    let day = item.dayLabel ?? '';
    if (!day && dateString) {
      const date = new Date(dateString);
      if (!Number.isNaN(date.getTime())) {
        day = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
      }
    }
    return {
      day,
      minutes: Number(item.minutes ?? item.totalMinutes ?? 0),
      sessions: Number(item.sessions ?? item.totalSessions ?? item.count ?? 0)
    };
  });
};

const normalizeFiles = (rawFiles) => {
  if (!Array.isArray(rawFiles)) return [];

  return rawFiles
    .map((file) => {
      const id = file.id ?? file.fileId ?? file.chatFileId ?? file.userFileId ?? file.key;
      const key = file.storageKey ?? file.filePath ?? file.fileKey ?? file.key ?? file.url;
      const url = file.cdnUrl ?? file.downloadUrl ?? file.url ?? null;
      return {
        id,
        key,
        url,
        name: file.originalFileName ?? file.fileName ?? file.name ?? `파일-${id}`,
        type: file.contentType ?? file.fileType ?? file.mimeType ?? '',
        size: file.fileSize ?? file.size ?? 0,
        uploadedAt: file.uploadedAt ?? file.createdAt ?? file.createdDate ?? null
      };
    })
    .filter((file) => file.id || file.key);
};

const notificationCopy = {
  email: {
    title: '이메일 알림',
    description: '학습 업데이트 및 공지사항을 이메일로 받아보세요.'
  },
  push: {
    title: '푸시 알림',
    description: '세션 리마인더와 실시간 알림을 기기에서 확인합니다.'
  },
  sms: {
    title: 'SMS 알림',
    description: '중요한 안내를 문자 메시지로 전달받습니다.'
  }
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const { showError, showSuccess } = useAlert();

  const [activeTab, setActiveTab] = useState('profile');
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showProfileEditor, setShowProfileEditor] = useState(false);

  const { englishName, name, profileImage, residence, intro, clearProfile, loadProfileFromServer } = useProfileStore();

  const [languageProfile, setLanguageProfile] = useState({ teachableLanguages: [], learningLanguages: [], interests: [] });
  const [languageLoading, setLanguageLoading] = useState(true);

  const [learningStats, setLearningStats] = useState(defaultLearningStats);
  const [languageProgress, setLanguageProgress] = useState([]);
  const [weeklyActivity, setWeeklyActivity] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);

  const [userSettings, setUserSettings] = useState(null);
  const [notificationSettings, setNotificationSettings] = useState({ email: true, push: true, sms: false });
  const [settingsLoading, setSettingsLoading] = useState(true);

  const [userFiles, setUserFiles] = useState([]);
  const [filesLoading, setFilesLoading] = useState(true);

  const primaryLanguage = languageProgress[0] ?? null;
  const {
    achievements: allAchievements,
    stats: achievementStats,
    loading: achievementsLoading,
    error: achievementsError
  } = useAchievementOverview();
  const recentAchievements = useMemo(() => {
    if (!allAchievements || allAchievements.length === 0) return [];
    return [...allAchievements]
      .filter((item) => item.isCompleted)
      .sort((a, b) => {
        const aTime = a.completedAt ? new Date(a.completedAt).getTime() : 0;
        const bTime = b.completedAt ? new Date(b.completedAt).getTime() : 0;
        return bTime - aTime;
      })
      .slice(0, 4);
  }, [allAchievements]);

  useEffect(() => {
    let isActive = true;

    loadProfileFromServer().catch((error) => {
      console.error('프로필 정보를 불러오지 못했습니다.', error);
    });

    const fetchLanguageInfo = async () => {
      setLanguageLoading(true);
      try {
        const response = await getUserLanguageInfo();
        if (!isActive) return;
        setLanguageProfile(normalizeLanguageProfile(response?.data ?? response));
      } catch (error) {
        console.error('언어 정보를 불러오지 못했습니다.', error);
        if (isActive) showError('언어 정보를 불러오는 데 실패했습니다.');
        if (isActive) setLanguageProfile({ teachableLanguages: [], learningLanguages: [], interests: [] });
      } finally {
        if (isActive) setLanguageLoading(false);
      }
    };

    const fetchStats = async () => {
      setStatsLoading(true);
      setStatsError(null);
      try {
        const [statsResult, activityResult] = await Promise.allSettled([
          getStudyStats('month'),
          getSessionActivity('week')
        ]);

        if (!isActive) return;

        if (statsResult.status === 'fulfilled') {
          const { learningStats: normalizedStats, languageProgress: languages } = normalizeStudyStats(statsResult.value);
          setLearningStats(normalizedStats);
          setLanguageProgress(languages);
        } else {
          setLearningStats(defaultLearningStats);
          setLanguageProgress([]);
        }

        if (activityResult.status === 'fulfilled') {
          setWeeklyActivity(normalizeWeeklyActivity(activityResult.value));
        } else {
          setWeeklyActivity([]);
        }

        if (statsResult.status === 'rejected' && activityResult.status === 'rejected') {
          setStatsError('데이터를 불러오는 데 실패했습니다.');
        }
      } catch (error) {
        if (!isActive) return;
        console.error('학습 통계를 불러오지 못했습니다.', error);
        setStatsError('데이터를 불러오는 데 실패했습니다.');
        setLearningStats(defaultLearningStats);
        setLanguageProgress([]);
        setWeeklyActivity([]);
      } finally {
        if (isActive) setStatsLoading(false);
      }
    };

    const fetchSettings = async () => {
      setSettingsLoading(true);
      try {
        const response = await getUserSettings();
        if (!isActive) return;

        const data = response?.data ?? response;
        setUserSettings(data);
        setNotificationSettings({
          email: Boolean(data?.notifications?.email),
          push: Boolean(data?.notifications?.push),
          sms: Boolean(data?.notifications?.sms)
        });
      } catch (error) {
        console.error('사용자 설정을 불러오지 못했습니다.', error);
        if (isActive) showError('사용자 설정을 불러오는 데 실패했습니다.');
      } finally {
        if (isActive) setSettingsLoading(false);
      }
    };

    const fetchFiles = async () => {
      setFilesLoading(true);
      try {
        const response = await fetchMyChatFiles();
        if (!isActive) return;
        setUserFiles(normalizeFiles(response));
      } catch (error) {
        console.error('사용자 파일을 불러오지 못했습니다.', error);
        if (isActive) showError('파일 목록을 불러오는 데 실패했습니다.');
        if (isActive) setUserFiles([]);
      } finally {
        if (isActive) setFilesLoading(false);
      }
    };

    fetchLanguageInfo();
    fetchStats();
    fetchSettings();
    fetchFiles();

    return () => {
      isActive = false;
    };
  }, [loadProfileFromServer, showError]);

  const handleProfileImageChange = () => {
    setShowImageUpload(true);
  };

  const handleEditProfile = () => {
    setShowProfileEditor(true);
  };

  const handleNotificationToggle = async (key) => {
    if (!userSettings) return;

    const previous = notificationSettings[key];
    const updatedNotifications = {
      ...userSettings.notifications,
      [key]: !previous
    };

    setNotificationSettings((prev) => ({
      ...prev,
      [key]: !previous
    }));
    setUserSettings((prev) => ({
      ...prev,
      notifications: updatedNotifications
    }));

    try {
      await updateUserSettings({
        notifications: updatedNotifications,
        privacy: userSettings.privacy,
        preferences: userSettings.preferences
      });
      showSuccess('알림 설정이 저장되었습니다.');
    } catch (error) {
      console.error('알림 설정 저장 실패', error);
      showError('알림 설정 저장에 실패했습니다.');
      setNotificationSettings((prev) => ({
        ...prev,
        [key]: previous
      }));
      setUserSettings((prev) => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          [key]: previous
        }
      }));
    }
  };

  const handleFileDelete = async (file) => {
    try {
      await deleteChatFile(file.id);
      setUserFiles((prev) => prev.filter((item) => item.id !== file.id));
      showSuccess('파일이 삭제되었습니다.');
    } catch (error) {
      console.error('파일 삭제 실패', error);
      showError('파일 삭제에 실패했습니다.');
      throw error;
    }
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    const url = file.url || getFileUrl(file.key);
    if (url) {
      window.open(url, '_blank', 'noopener');
    }
  };

  const handleLogout = async () => {
    if (!window.confirm('로그아웃 하시겠습니까?')) return;

    try {
      await logout();
    } catch (error) {
      console.warn('서버 로그아웃 실패:', error);
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      clearProfile();
      navigate('/', { replace: true });
    }
  };

  const totalMinutes = learningStats.totalMinutes ?? 0;
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  const remainingGoal =
    learningStats.monthlyGoal != null && learningStats.monthlyProgress != null
      ? Math.max(learningStats.monthlyGoal - learningStats.monthlyProgress, 0)
      : null;
  const monthlyProgressRatio =
    learningStats.monthlyGoal && learningStats.monthlyGoal > 0 && learningStats.monthlyProgress != null
      ? Math.min(100, Math.round((learningStats.monthlyProgress / learningStats.monthlyGoal) * 100))
      : 0;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="bg-white border-b border-[#E7E7E7] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-[20px] font-bold text-[#111111]">프로필</h1>
          </div>
          <button
            onClick={handleEditProfile}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit className="w-5 h-5 text-[#606060]" />
          </button>
        </div>
      </div>

      <div className="bg-white border-b border-[#E7E7E7] p-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <OptimizedImage
              src={getOptimizedImageUrl(profileImage, { width: 80, height: 80 }) || DEFAULT_PROFILE_IMAGE}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover"
              width={80}
              height={80}
              loading="eager"
            />
            <button
              onClick={handleProfileImageChange}
              className="absolute bottom-0 right-0 p-1.5 bg-[#00C471] rounded-full text-white"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1">
            <h2 className="text-[24px] font-bold text-[#111111]">{englishName || name || 'User'}</h2>
            <p className="text-[14px] text-[#606060]">{residence || '위치 미설정'}</p>
            {intro && (
              <p className="text-[14px] text-[#929292] mt-1">{intro}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-[#E7E7E7]">
        <div className="flex">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 text-[14px] font-medium border-b-2 transition-colors ${
              activeTab === 'profile' ? 'text-[#00C471] border-[#00C471]' : 'text-[#929292] border-transparent'
            }`}
          >
            프로필
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-3 text-[14px] font-medium border-b-2 transition-colors ${
              activeTab === 'stats' ? 'text-[#00C471] border-[#00C471]' : 'text-[#929292] border-transparent'
            }`}
          >
            학습 통계
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`flex-1 py-3 text-[14px] font-medium border-b-2 transition-colors ${
              activeTab === 'files' ? 'text-[#00C471] border-[#00C471]' : 'text-[#929292] border-transparent'
            }`}
          >
            파일 관리
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-3 text-[14px] font-medium border-b-2 transition-colors ${
              activeTab === 'settings' ? 'text-[#00C471] border-[#00C471]' : 'text-[#929292] border-transparent'
            }`}
          >
            설정
          </button>
        </div>
      </div>

      <div className="px-6 py-6">
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <LanguageProfile
              showEditButton={false}
              profileData={languageProfile}
              loading={languageLoading}
              emptyMessage="등록된 언어 정보가 없습니다."
            />

            <div className="bg-white rounded-[20px] p-6 border border-[#E7E7E7]">
              <h3 className="text-[18px] font-bold text-[#111111] mb-4">활동 요약</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-[24px] font-bold text-[#00C471]">{learningStats.totalSessions}</p>
                  <p className="text-[12px] text-[#929292]">완료한 세션</p>
                </div>
                <div className="text-center">
                  <p className="text-[24px] font-bold text-[#00C471]">
                    {totalHours}h {remainingMinutes}m
                  </p>
                  <p className="text-[12px] text-[#929292]">총 학습시간</p>
                </div>
                <div className="text-center">
                  <p className="text-[24px] font-bold text-[#00C471]">{learningStats.currentStreak ?? '-'}</p>
                  <p className="text-[12px] text-[#929292]">주간 연속</p>
                </div>
                <div className="text-center">
                  <p className="text-[24px] font-bold text-[#00C471]">{learningStats.monthlyGoal ?? '-'}</p>
                  <p className="text-[12px] text-[#929292]">월간 목표</p>
                </div>
              </div>
            </div>

            <AchievementBadges
              achievements={recentAchievements}
              stats={achievementStats}
              loading={achievementsLoading}
              error={achievementsError}
            />
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-6">
            <WeeklyActivityChart data={weeklyActivity} loading={statsLoading} error={statsError} />

            {primaryLanguage ? (
              <LanguageLevelProgress
                language={primaryLanguage.language}
                currentLevel={primaryLanguage.currentLevel}
                progress={primaryLanguage.progress ?? 0}
                nextLevel={primaryLanguage.nextLevel}
                skills={primaryLanguage.skills}
                goalMessage={
                  primaryLanguage.nextLevel
                    ? `${primaryLanguage.nextLevel} 레벨을 향해 ${primaryLanguage.progress ?? 0}% 진행 중입니다.`
                    : '지속적인 학습으로 다음 목표를 설정해 보세요.'
                }
              />
            ) : (
              <div className="bg-white rounded-[20px] p-6 border border-[#E7E7E7]">
                <h3 className="text-[18px] font-bold text-[#111111] mb-2">언어별 진도</h3>
                <p className="text-[14px] text-[var(--black-300)]">언어 학습 데이터를 찾을 수 없습니다.</p>
              </div>
            )}

            <div className="bg-white rounded-[20px] p-6 border border-[#E7E7E7]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[18px] font-bold text-[#111111]">월간 목표</h3>
                {learningStats.monthlyGoal && learningStats.monthlyProgress != null ? (
                  <span className="text-[14px] text-[#606060]">
                    {learningStats.monthlyProgress}/{learningStats.monthlyGoal} 세션
                  </span>
                ) : (
                  <span className="text-[14px] text-[#606060]">데이터 없음</span>
                )}
              </div>
              {learningStats.monthlyGoal && learningStats.monthlyProgress != null ? (
                <>
                  <div className="w-full bg-[#F1F3F5] rounded-full h-3">
                    <div
                      className="bg-[#00C471] h-3 rounded-full transition-all duration-300"
                      style={{ width: `${monthlyProgressRatio}%` }}
                    />
                  </div>
                  <p className="text-[12px] text-[#929292] mt-2">
                    {remainingGoal != null ? `이번 달 ${remainingGoal}개 세션이 남았어요!` : '목표 진행 상황을 확인할 수 없습니다.'}
                  </p>
                </>
              ) : (
                <p className="text-[14px] text-[#929292]">월간 목표 데이터가 아직 없습니다.</p>
              )}
            </div>

            <div className="bg-white rounded-[20px] p-6 border border-[#E7E7E7]">
              <h3 className="text-[18px] font-bold text-[#111111] mb-4">학습 패턴</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-[#606060]" />
                    <span className="text-[14px] text-[#606060]">평균 세션 시간</span>
                  </div>
                  <span className="text-[14px] font-medium text-[#111111]">
                    {learningStats.averageDuration != null ? `${learningStats.averageDuration}분` : '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-[#606060]" />
                    <span className="text-[14px] text-[#606060]">선호 시간대</span>
                  </div>
                  <span className="text-[14px] font-medium text-[#111111]">
                    {learningStats.preferredTime || '-'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[20px] p-6 border border-[#E7E7E7]">
              <h3 className="text-[18px] font-bold text-[#111111] mb-4">언어별 진도</h3>
              {languageProgress.length > 0 ? (
                <div className="space-y-4">
                  {languageProgress.map((item) => (
                    <div key={item.language}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[14px] text-[#606060]">{item.language}</span>
                        <span className="text-[14px] font-medium text-[#111111]">{item.progress ?? 0}%</span>
                      </div>
                      <div className="w-full bg-[#F1F3F5] rounded-full h-2">
                        <div
                          className="bg-[#00C471] h-2 rounded-full"
                          style={{ width: `${Math.min(100, Math.max(0, item.progress ?? 0))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[14px] text-[#929292]">언어별 진도 데이터를 찾을 수 없습니다.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'files' && (
          <div className="space-y-6">
            {filesLoading ? (
              <div className="bg-white rounded-[20px] p-6 border border-[#E7E7E7]">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-[#E7E7E7] rounded w-1/3" />
                  <div className="h-16 bg-[#F1F3F5] rounded" />
                  <div className="h-16 bg-[#F1F3F5] rounded" />
                  <div className="h-16 bg-[#F1F3F5] rounded" />
                </div>
              </div>
            ) : (
              <FileManager
                files={userFiles}
                onFileDelete={handleFileDelete}
                onFileSelect={handleFileSelect}
                allowDelete
                allowPreview
                className="w-full"
              />
            )}

            {userFiles.length === 0 && !filesLoading && (
              <div className="bg-white rounded-[20px] p-6 border border-[#E7E7E7] text-center">
                <h3 className="text-[18px] font-bold text-[#111111] mb-2">파일 업로드 안내</h3>
                <p className="text-[14px] text-[#606060] mb-4">
                  프로필 사진, 오디오 녹음, 채팅 이미지를 업로드하고 관리할 수 있습니다.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                  <div className="p-4 bg-[#F8F9FA] rounded-[12px]">
                    <h4 className="text-[14px] font-bold text-[#111111] mb-2">이미지</h4>
                    <p className="text-[12px] text-[#606060] mb-1">JPG, PNG, WebP, GIF</p>
                    <p className="text-[12px] text-[#929292]">최대 10MB</p>
                  </div>
                  <div className="p-4 bg-[#F8F9FA] rounded-[12px]">
                    <h4 className="text-[14px] font-bold text-[#111111] mb-2">오디오</h4>
                    <p className="text-[12px] text-[#606060] mb-1">MP3, WAV, WebM, OGG</p>
                    <p className="text-[12px] text-[#929292]">최대 50MB</p>
                  </div>
                  <div className="p-4 bg-[#F8F9FA] rounded-[12px]">
                    <h4 className="text-[14px] font-bold text-[#111111] mb-2">비디오</h4>
                    <p className="text-[12px] text-[#606060] mb-1">MP4, WebM, MOV</p>
                    <p className="text-[12px] text-[#929292]">최대 100MB</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-[20px] p-6 border border-[#E7E7E7]">
              <h3 className="text-[18px] font-bold text-[#111111] mb-4">알림 설정</h3>
              {settingsLoading ? (
                <div className="space-y-3">
                  <div className="h-10 bg-[#F1F3F5] rounded animate-pulse" />
                  <div className="h-10 bg-[#F1F3F5] rounded animate-pulse" />
                  <div className="h-10 bg-[#F1F3F5] rounded animate-pulse" />
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(notificationCopy).map(([key, copy]) => (
                    <div className="flex items-center justify-between" key={key}>
                      <div>
                        <p className="text-[14px] font-medium text-[#111111]">{copy.title}</p>
                        <p className="text-[12px] text-[#929292]">{copy.description}</p>
                      </div>
                      <button
                        onClick={() => handleNotificationToggle(key)}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          notificationSettings[key] ? 'bg-[#00C471]' : 'bg-[#E7E7E7]'
                        } relative`}
                      >
                        <div
                          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                            notificationSettings[key] ? 'translate-x-6' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-[20px] p-6 border border-[#E7E7E7]">
              <h3 className="text-[18px] font-bold text-[#111111] mb-4">계정 설정</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/settings/privacy')}
                  className="w-full flex items-center justify-between p-3 hover:bg-[#F1F3F5] rounded-lg transition-colors"
                >
                  <span className="text-[14px] text-[#111111]">개인정보 설정</span>
                  <ChevronRight className="w-4 h-4 text-[#929292]" />
                </button>
                <button
                  onClick={() => navigate('/settings/language')}
                  className="w-full flex items-center justify-between p-3 hover:bg-[#F1F3F5] rounded-lg transition-colors"
                >
                  <span className="text-[14px] text-[#111111]">언어 설정</span>
                  <ChevronRight className="w-4 h-4 text-[#929292]" />
                </button>
                <button
                  onClick={() => navigate('/settings/help')}
                  className="w-full flex items-center justify-between p-3 hover:bg-[#F1F3F5] rounded-lg transition-colors"
                >
                  <span className="text-[14px] text-[#111111]">도움말</span>
                  <ChevronRight className="w-4 h-4 text-[#929292]" />
                </button>
              </div>
            </div>

            <CommonButton onClick={handleLogout} variant="secondary" className="w-full">
              로그아웃
            </CommonButton>
          </div>
        )}
      </div>

      <ProfileImageUpload isOpen={showImageUpload} onClose={() => setShowImageUpload(false)} />
      <ProfileEditor isOpen={showProfileEditor} onClose={() => setShowProfileEditor(false)} />
    </div>
  );
}
