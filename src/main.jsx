import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { reportWebVitals, measurePerformance } from './utils/webVitals'

import './styles/index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)

// Web Vitals 측정
if (process.env.NODE_ENV === 'production') {
  reportWebVitals((metric) => {
    // 성능 메트릭을 분석 도구로 전송 (예: Google Analytics)
    console.log(metric);
  });
  
  // 페이지 로드 완료 후 성능 측정
  window.addEventListener('load', () => {
    const metrics = measurePerformance();
    console.log('Performance Metrics:', metrics);
  });
}
