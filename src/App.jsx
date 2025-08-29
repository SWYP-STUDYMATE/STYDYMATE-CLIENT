import { Routes, Route } from 'react-router-dom';
import { lazyLoad } from './utils/lazyLoad';

// 즉시 로드가 필요한 컴포넌트들 (로그인, 메인)
import Login from './pages/Login/Login';
import Main from './pages/Main';

// 레이지 로드 컴포넌트들
const Navercallback = lazyLoad(() => import('./pages/Login/Navercallback'));
const GoogleCallback = lazyLoad(() => import('./pages/Login/GoogleCallback'));
const Agreement = lazyLoad(() => import('./pages/Login/Agreement'));
const SignupComplete = lazyLoad(() => import('./pages/Login/SignupComplete'));
const OnboardingInfoRouter = lazyLoad(() => import('./pages/ObInfo/ObInfoRouter'));
const ObLangRouter = lazyLoad(() => import('./pages/ObLang/ObLangRouter'));
const ObIntRouter = lazyLoad(() => import('./pages/ObInt/ObIntRouter'));
const ObPartnerRouter = lazyLoad(() => import('./pages/ObPartner/ObPartnerRouter'));
const ObScheduleRouter = lazyLoad(() => import('./pages/ObSchadule/ObSchaduleRouter'));
const ChatPage = lazyLoad(() => import('./pages/Chat/ChatPage'));
const LevelTestStart = lazyLoad(() => import('./pages/LevelTest/LevelTestStart'));
const LevelTestCheck = lazyLoad(() => import('./pages/LevelTest/LevelTestCheck'));
const LevelTestRecording = lazyLoad(() => import('./pages/LevelTest/LevelTestRecording'));
const LevelTestComplete = lazyLoad(() => import('./pages/LevelTest/LevelTestComplete'));
const LevelTestResult = lazyLoad(() => import('./pages/LevelTest/LevelTestResult'));
const Schedule = lazyLoad(() => import('./pages/Schedule/Schedule'));
const AudioConnectionCheck = lazyLoad(() => import('./pages/Session/AudioConnectionCheck'));
const AnalyticsDashboard = lazyLoad(() => import('./components/AnalyticsDashboard'));
const VideoSessionRoom = lazyLoad(() => import('./pages/Session/VideoSessionRoom'));
const VideoConnectionCheck = lazyLoad(() => import('./pages/Session/VideoSessionCheck'));
const AudioSessionRoom = lazyLoad(() => import('./pages/Session/AudioSessionRoom'));
const ProfilePage = lazyLoad(() => import('./pages/Profile/ProfilePage'));
const VideoControlsDemo = lazyLoad(() => import('./pages/Session/VideoControlsDemo'));
const SessionList = lazyLoad(() => import('./pages/Session/SessionList'));
const SessionCalendar = lazyLoad(() => import('./pages/Session/SessionCalendar'));
const SessionScheduleNew = lazyLoad(() => import('./pages/Session/SessionScheduleNew'));
const MatchingMain = lazyLoad(() => import('./pages/Matching/MatchingMain'));
const MatchingProfile = lazyLoad(() => import('./pages/Matching/MatchingProfile'));

export default function App() {
  return (
    <div className="page-bg min-h-screen">
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/login/oauth2/code/naver' element={<Navercallback />} />
        <Route path='/login/oauth2/code/google' element={<GoogleCallback />} />
        <Route path='/agreement' element={<Agreement />} />
        <Route path='/signup-complete' element={<SignupComplete />} />
        <Route path='/main' element={<Main />} />
        <Route path='/onboarding-info/:step' element={<OnboardingInfoRouter />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path='/onboarding-lang/:step' element={<ObLangRouter />} />
        <Route path='/onboarding-int/:step' element={<ObIntRouter />} />
        <Route path='/onboarding-partner/:step' element={<ObPartnerRouter />} />
        <Route path='/onboarding-schedule/:step' element={<ObScheduleRouter />} />
        <Route path='/level-test' element={<LevelTestStart />} />
        <Route path='/level-test/check' element={<LevelTestCheck />} />
        <Route path='/level-test/recording' element={<LevelTestRecording />} />
        {/* Alias routes for documentation compatibility */}
        <Route path='/level-test/connection' element={<LevelTestCheck />} />
        <Route path='/level-test/question/:id' element={<LevelTestRecording />} />
        <Route path='/level-test/complete' element={<LevelTestComplete />} />
        <Route path='/level-test/result' element={<LevelTestResult />} />
        <Route path='/schedule' element={<Schedule />} />
        <Route path='/session/audio-check' element={<AudioConnectionCheck />} />
        <Route path='/session/video/:roomId' element={<VideoSessionRoom />} />
        <Route path='/session/video-check' element={<VideoConnectionCheck />} />
        <Route path='/session/audio/:roomId' element={<AudioSessionRoom />} />
        <Route path='/session/video-controls-demo' element={<VideoControlsDemo />} />
        <Route path='/profile' element={<ProfilePage />} />
        <Route path='/sessions' element={<SessionList />} />
        <Route path='/sessions/calendar' element={<SessionCalendar />} />
        <Route path='/session/schedule/new' element={<SessionScheduleNew />} />
        <Route path='/matching' element={<MatchingMain />} />
        <Route path='/matching/profile/:userId' element={<MatchingProfile />} />
        <Route path='/analytics' element={<AnalyticsDashboard />} />
      </Routes>
    </div>
  )
}