import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { reportWebVitals, measurePerformance } from './utils/webVitals'
import { initializeMobileOptimizations } from './utils/mobileOptimizations'

import './styles/index.css'
import App from './App.jsx'

// 모바일 최적화 초기화
initializeMobileOptimizations();

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)

// VitePWA가 registerSW.js를 자동 주입하므로 별도 수동 등록을 제거

// Web Vitals 측정
if (import.meta.env.PROD) {
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
