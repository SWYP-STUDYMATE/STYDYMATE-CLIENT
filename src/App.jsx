import Login from './pages/Login/Login'
import Navercallback from './pages/Login/Navercallback'
import Agreement from './pages/Login/Agreement'
import SignupComplete from './pages/Login/SignupComplete'
import Main from './pages/Main'
import OnboardingInfoRouter from "./pages/Onboarding/OnboardingInfoRouter";
import { Routes, Route } from 'react-router-dom'

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
    </Routes> 
    </div>
  )
}
