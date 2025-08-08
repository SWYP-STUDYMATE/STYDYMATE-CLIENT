import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { reportWebVitals, measurePerformance } from './utils/webVitals'
import * as serviceWorker from './utils/serviceWorker'

import './styles/index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)

// Service Worker 등록
serviceWorker.register({
  onUpdate: (registration) => {
    // 새 버전이 있을 때 사용자에게 알림
    if (window.confirm('새로운 버전이 있습니다. 업데이트하시겠습니까?')) {
      window.location.reload();
    }
  },
  onSuccess: (registration) => {
    console.log('Service Worker registered successfully');
  },
});

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
