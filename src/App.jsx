import Login from './pages/Login/Login'
import Navercallback from './pages/Login/Navercallback'
import Agreement from './pages/Login/Agreement'
import SignupComplete from './pages/Login/SignupComplete'
import Main from './pages/Main'
import OnboardingInfoRouter from "./pages/ObInfo/ObInfoRouter";
import ObLangRouter from "./pages/ObLang/ObLangRouter";
import ObIntRouter from "./pages/ObInt/ObIntRouter";
import ObPartnerRouter from "./pages/ObPartner/ObPartnerRouter";
import ObScheduleRouter from "./pages/ObSchadule/ObSchaduleRouter";
import { Routes, Route } from 'react-router-dom'
import ChatPage from './pages/Chat/ChatPage';
import LevelTestStart from './pages/LevelTest/LevelTestStart';
import LevelTestCheck from './pages/LevelTest/LevelTestCheck';
import LevelTestRecording from './pages/LevelTest/LevelTestRecording';
import LevelTestComplete from './pages/LevelTest/LevelTestComplete';
import LevelTestResult from './pages/LevelTest/LevelTestResult';
import Schedule from './pages/Schedule/Schedule';
import AudioConnectionCheck from './pages/Session/AudioConnectionCheck';

export default function App() {
  return (
    <div className="bg-[#FAFAFA] min-h-screen">
    <Routes>
      <Route path='/' element={<Login />}/>
      <Route path='/login/oauth2/code/naver' element={<Navercallback />}/>
      <Route path='/agreement' element={<Agreement />}/>
      <Route path='/signup-complete' element={<SignupComplete />}/>
      <Route path='/main' element={<Main />}/>
      <Route path='/onboarding-info/:step' element={<OnboardingInfoRouter />}/>
      <Route path="/chat" element={<ChatPage />} />
      <Route path='/onboarding-lang/:step' element={<ObLangRouter />}/>
      <Route path='/onboarding-int/:step' element={<ObIntRouter />}/>
      <Route path='/onboarding-partner/:step' element={<ObPartnerRouter />}/>
      <Route path='/onboarding-schedule/:step' element={<ObScheduleRouter />}/>
      <Route path='/level-test' element={<LevelTestStart />}/>
      <Route path='/level-test/check' element={<LevelTestCheck />}/>
      <Route path='/level-test/recording' element={<LevelTestRecording />}/>
      <Route path='/level-test/complete' element={<LevelTestComplete />}/>
      <Route path='/level-test/result' element={<LevelTestResult />}/>
      <Route path='/schedule' element={<Schedule />}/>
      <Route path='/session/audio-check' element={<AudioConnectionCheck />}/>
    </Routes> 
    </div>
  )
}
