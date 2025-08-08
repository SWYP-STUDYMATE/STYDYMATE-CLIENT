import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  User,
  Globe,
  Award,
  Bell,
  Settings,
  ChevronRight,
  Camera,
  Edit,
  Calendar,
  Clock,
  Target,
  TrendingUp
} from 'lucide-react';
import CommonButton from '../../components/CommonButton';
import useProfileStore from '../../store/profileStore';
import useSessionStore from '../../store/sessionStore';
import LanguageProfile from '../../components/LanguageProfile';
import AchievementBadges from '../../components/AchievementBadges';
import WeeklyActivityChart from '../../components/profile/WeeklyActivityChart';
import LanguageLevelProgress from '../../components/profile/LanguageLevelProgress';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile'); // profile, stats, settings
  
  const { englishName, profileImage, residence, intro } = useProfileStore();
  const { sessionStats } = useSessionStore();

  // 학습 통계 데이터 (실제로는 API에서 가져와야 함)
  const learningStats = {
    totalSessions: sessionStats?.totalSessions || 42,
    totalHours: Math.floor((sessionStats?.totalDuration || 1260) / 60),
    weeklyStreak: 5,
    monthlyGoal: 80,
    monthlyProgress: 65,
    averageSessionLength: 30,
    preferredTime: '저녁 7-9시',
    languageProgress: {
      english: 75,
      spanish: 45
    }
  };

  // 알림 설정 상태
  const [notificationSettings, setNotificationSettings] = useState({
    sessionReminder: true,
    newMessage: true,
    weeklyReport: false,
    matchingAlert: true,
    marketingEmail: false
  });

  const handleProfileImageChange = () => {
    // TODO: 프로필 이미지 변경 로직
    console.log('Change profile image');
  };

  const handleEditProfile = () => {
    navigate('/onboarding-info/1'); // 프로필 편집 페이지로 이동
  };

  const handleNotificationToggle = (setting) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
    // TODO: API 호출하여 서버에 저장
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
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

      {/* Profile Header */}
      <div className="bg-white border-b border-[#E7E7E7] p-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img
              src={profileImage || '/assets/basicProfilePic.png'}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover"
            />
            <button
              onClick={handleProfileImageChange}
              className="absolute bottom-0 right-0 p-1.5 bg-[#00C471] rounded-full text-white"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1">
            <h2 className="text-[24px] font-bold text-[#111111]">{englishName || 'User'}</h2>
            <p className="text-[14px] text-[#606060]">{residence || '위치 미설정'}</p>
            {intro && (
              <p className="text-[14px] text-[#929292] mt-1">{intro}</p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-[#E7E7E7]">
        <div className="flex">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 text-[14px] font-medium border-b-2 transition-colors ${
              activeTab === 'profile' 
                ? 'text-[#00C471] border-[#00C471]' 
                : 'text-[#929292] border-transparent'
            }`}
          >
            프로필
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-3 text-[14px] font-medium border-b-2 transition-colors ${
              activeTab === 'stats' 
                ? 'text-[#00C471] border-[#00C471]' 
                : 'text-[#929292] border-transparent'
            }`}
          >
            학습 통계
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-3 text-[14px] font-medium border-b-2 transition-colors ${
              activeTab === 'settings' 
                ? 'text-[#00C471] border-[#00C471]' 
                : 'text-[#929292] border-transparent'
            }`}
          >
            설정
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Language Profile */}
            <LanguageProfile showEditButton={false} />

            {/* Achievement Badges */}
            <div className="bg-white rounded-[20px] p-6 border border-[#E7E7E7]">
              <h3 className="text-[18px] font-bold text-[#111111] mb-4">획득한 배지</h3>
              <AchievementBadges />
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-[20px] p-6 border border-[#E7E7E7]">
              <h3 className="text-[18px] font-bold text-[#111111] mb-4">활동 요약</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-[24px] font-bold text-[#00C471]">{learningStats.totalSessions}</p>
                  <p className="text-[12px] text-[#929292]">완료한 세션</p>
                </div>
                <div className="text-center">
                  <p className="text-[24px] font-bold text-[#00C471]">{learningStats.totalHours}h</p>
                  <p className="text-[12px] text-[#929292]">총 학습시간</p>
                </div>
                <div className="text-center">
                  <p className="text-[24px] font-bold text-[#00C471]">{learningStats.weeklyStreak}</p>
                  <p className="text-[12px] text-[#929292]">주간 연속</p>
                </div>
                <div className="text-center">
                  <p className="text-[24px] font-bold text-[#00C471]">{learningStats.monthlyProgress}%</p>
                  <p className="text-[12px] text-[#929292]">월간 목표</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-6">
            {/* Weekly Activity Chart */}
            <WeeklyActivityChart />
            
            {/* Language Level Progress */}
            <LanguageLevelProgress />
            
            {/* Monthly Goal Progress */}
            <div className="bg-white rounded-[20px] p-6 border border-[#E7E7E7]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[18px] font-bold text-[#111111]">월간 목표</h3>
                <span className="text-[14px] text-[#606060]">
                  {learningStats.monthlyProgress}/{learningStats.monthlyGoal} 세션
                </span>
              </div>
              <div className="w-full bg-[#F1F3F5] rounded-full h-3">
                <div 
                  className="bg-[#00C471] h-3 rounded-full transition-all duration-300"
                  style={{ width: `${(learningStats.monthlyProgress / learningStats.monthlyGoal) * 100}%` }}
                />
              </div>
              <p className="text-[12px] text-[#929292] mt-2">
                이번 달 {learningStats.monthlyGoal - learningStats.monthlyProgress}개 세션이 남았어요!
              </p>
            </div>

            {/* Learning Patterns */}
            <div className="bg-white rounded-[20px] p-6 border border-[#E7E7E7]">
              <h3 className="text-[18px] font-bold text-[#111111] mb-4">학습 패턴</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-[#606060]" />
                    <span className="text-[14px] text-[#606060]">평균 세션 시간</span>
                  </div>
                  <span className="text-[14px] font-medium text-[#111111]">
                    {learningStats.averageSessionLength}분
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-[#606060]" />
                    <span className="text-[14px] text-[#606060]">선호 시간대</span>
                  </div>
                  <span className="text-[14px] font-medium text-[#111111]">
                    {learningStats.preferredTime}
                  </span>
                </div>
              </div>
            </div>

            {/* Language Progress */}
            <div className="bg-white rounded-[20px] p-6 border border-[#E7E7E7]">
              <h3 className="text-[18px] font-bold text-[#111111] mb-4">언어별 진도</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[14px] text-[#606060]">영어</span>
                    <span className="text-[14px] font-medium text-[#111111]">
                      {learningStats.languageProgress.english}%
                    </span>
                  </div>
                  <div className="w-full bg-[#F1F3F5] rounded-full h-2">
                    <div 
                      className="bg-[#00C471] h-2 rounded-full"
                      style={{ width: `${learningStats.languageProgress.english}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[14px] text-[#606060]">스페인어</span>
                    <span className="text-[14px] font-medium text-[#111111]">
                      {learningStats.languageProgress.spanish}%
                    </span>
                  </div>
                  <div className="w-full bg-[#F1F3F5] rounded-full h-2">
                    <div 
                      className="bg-[#FFA500] h-2 rounded-full"
                      style={{ width: `${learningStats.languageProgress.spanish}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Notification Settings */}
            <div className="bg-white rounded-[20px] p-6 border border-[#E7E7E7]">
              <h3 className="text-[18px] font-bold text-[#111111] mb-4">알림 설정</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[14px] font-medium text-[#111111]">세션 리마인더</p>
                    <p className="text-[12px] text-[#929292]">예정된 세션 30분 전 알림</p>
                  </div>
                  <button
                    onClick={() => handleNotificationToggle('sessionReminder')}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      notificationSettings.sessionReminder ? 'bg-[#00C471]' : 'bg-[#E7E7E7]'
                    } relative`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      notificationSettings.sessionReminder ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[14px] font-medium text-[#111111]">새 메시지</p>
                    <p className="text-[12px] text-[#929292]">채팅 메시지 수신 시 알림</p>
                  </div>
                  <button
                    onClick={() => handleNotificationToggle('newMessage')}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      notificationSettings.newMessage ? 'bg-[#00C471]' : 'bg-[#E7E7E7]'
                    } relative`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      notificationSettings.newMessage ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[14px] font-medium text-[#111111]">주간 리포트</p>
                    <p className="text-[12px] text-[#929292]">매주 학습 통계 요약</p>
                  </div>
                  <button
                    onClick={() => handleNotificationToggle('weeklyReport')}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      notificationSettings.weeklyReport ? 'bg-[#00C471]' : 'bg-[#E7E7E7]'
                    } relative`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      notificationSettings.weeklyReport ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[14px] font-medium text-[#111111]">매칭 알림</p>
                    <p className="text-[12px] text-[#929292]">새로운 매칭 추천 시 알림</p>
                  </div>
                  <button
                    onClick={() => handleNotificationToggle('matchingAlert')}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      notificationSettings.matchingAlert ? 'bg-[#00C471]' : 'bg-[#E7E7E7]'
                    } relative`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      notificationSettings.matchingAlert ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Account Settings */}
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

            {/* Logout Button */}
            <CommonButton
              onClick={() => {
                if (window.confirm('로그아웃 하시겠습니까?')) {
                  localStorage.clear();
                  navigate('/');
                }
              }}
              variant="secondary"
              className="w-full"
            >
              로그아웃
            </CommonButton>
          </div>
        )}
      </div>
    </div>
  );
}