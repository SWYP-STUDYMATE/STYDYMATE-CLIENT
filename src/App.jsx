import Login from './pages/Login'
import Navercallback from './pages/Navercallback'
import Agreement from './pages/Agreement'
import SignupComplete from './pages/SignupComplete'
import Main from './pages/Main'
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
    </Routes> 
    </div>
  )
}
