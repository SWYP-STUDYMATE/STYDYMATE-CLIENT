// Service Worker for Push Notifications
const CACHE_NAME = 'studymate-sw-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/icon-192x192.png',
  '/badge-72x72.png'
];

// Service Worker 설치
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Failed to cache resources:', error);
      })
  );
});

// Service Worker 활성화
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 푸시 메시지 수신
self.addEventListener('push', (event) => {
  console.log('Push message received:', event);

  let notificationData = {
    title: 'STUDYMATE',
    body: '새로운 알림이 있습니다.',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: 'studymate-notification',
    data: {
      url: '/notifications'
    }
  };

  // 푸시 데이터가 있는 경우 파싱
  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = {
        ...notificationData,
        ...pushData
      };
    } catch (error) {
      console.error('Failed to parse push data:', error);
      notificationData.body = event.data.text() || notificationData.body;
    }
  }

  // 알림 타입에 따른 커스터마이징
  if (notificationData.type) {
    switch (notificationData.type) {
      case 'chat':
        notificationData.icon = '/icons/chat-icon.png';
        notificationData.badge = '/icons/chat-badge.png';
        notificationData.tag = 'chat-notification';
        break;
      case 'match_request':
        notificationData.icon = '/icons/match-icon.png';
        notificationData.badge = '/icons/match-badge.png';
        notificationData.tag = 'match-notification';
        break;
      case 'session_reminder':
        notificationData.icon = '/icons/session-icon.png';
        notificationData.badge = '/icons/session-badge.png';
        notificationData.tag = 'session-notification';
        notificationData.requireInteraction = true; // 중요한 알림
        break;
      case 'achievement':
        notificationData.icon = '/icons/achievement-icon.png';
        notificationData.badge = '/icons/achievement-badge.png';
        notificationData.tag = 'achievement-notification';
        break;
    }
  }

  // 액션 버튼 추가
  if (notificationData.type === 'chat') {
    notificationData.actions = [
      {
        action: 'reply',
        title: '답장하기',
        icon: '/icons/reply-icon.png'
      },
      {
        action: 'view',
        title: '보기',
        icon: '/icons/view-icon.png'
      }
    ];
  } else if (notificationData.type === 'match_request') {
    notificationData.actions = [
      {
        action: 'accept',
        title: '수락',
        icon: '/icons/accept-icon.png'
      },
      {
        action: 'view',
        title: '보기',
        icon: '/icons/view-icon.png'
      }
    ];
  }

  const promiseChain = self.registration.showNotification(
    notificationData.title,
    {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      actions: notificationData.actions,
      requireInteraction: notificationData.requireInteraction || false,
      silent: notificationData.silent || false,
      vibrate: notificationData.vibrate || [200, 100, 200],
      timestamp: Date.now()
    }
  );

  event.waitUntil(promiseChain);
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received:', event);

  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};

  notification.close();

  let url = data.url || '/notifications';

  // 액션에 따른 URL 결정
  if (action) {
    switch (action) {
      case 'reply':
        url = data.chatUrl || `/chat/${data.roomId}` || '/chat';
        break;
      case 'accept':
        url = data.matchUrl || `/matching/profile/${data.userId}` || '/matching';
        break;
      case 'view':
        url = data.url || '/notifications';
        break;
      default:
        url = data.url || '/notifications';
    }
  } else {
    // 알림 타입에 따른 기본 URL
    switch (data.type) {
      case 'chat':
        url = data.chatUrl || `/chat/${data.roomId}` || '/chat';
        break;
      case 'match_request':
      case 'match_accepted':
        url = data.matchUrl || `/matching/profile/${data.userId}` || '/matching';
        break;
      case 'session_reminder':
      case 'session_invitation':
        url = data.sessionUrl || `/sessions/${data.sessionId}` || '/sessions';
        break;
      case 'achievement':
      case 'level_test_result':
        url = '/profile';
        break;
      default:
        url = data.url || '/notifications';
    }
  }

  const promiseChain = clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  })
  .then((windowClients) => {
    // 이미 열린 창이 있는지 확인
    for (let i = 0; i < windowClients.length; i++) {
      const client = windowClients[i];
      if (client.url.includes(self.location.origin)) {
        // 기존 창으로 이동
        client.navigate(url);
        return client.focus();
      }
    }
    
    // 새 창 열기
    return clients.openWindow(url);
  })
  .catch((error) => {
    console.error('Failed to handle notification click:', error);
    return clients.openWindow('/');
  });

  event.waitUntil(promiseChain);
});

// 알림 닫기 처리
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
  
  const notification = event.notification;
  const data = notification.data || {};

  // 닫힌 알림에 대한 분석 데이터 전송 (선택사항)
  if (data.trackClose) {
    fetch('/api/notifications/analytics/close', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        notificationId: data.id,
        type: data.type,
        closedAt: Date.now()
      })
    }).catch((error) => {
      console.error('Failed to track notification close:', error);
    });
  }
});

// 백그라운드 동기화
self.addEventListener('sync', (event) => {
  console.log('Background sync:', event);
  
  if (event.tag === 'notification-sync') {
    event.waitUntil(
      // 읽지 않은 알림 수 동기화 등의 작업
      fetch('/api/notifications/sync')
        .then(response => response.json())
        .then(data => {
          console.log('Notification sync completed:', data);
        })
        .catch(error => {
          console.error('Notification sync failed:', error);
        })
    );
  }
});

// 메시지 수신 (클라이언트로부터)
self.addEventListener('message', (event) => {
  console.log('Message received in SW:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // 클라이언트에 응답
  event.ports[0].postMessage({
    type: 'SW_RESPONSE',
    data: 'Message received'
  });
});

// 페치 이벤트 (캐싱)
self.addEventListener('fetch', (event) => {
  // 알림 관련 API는 항상 네트워크에서 가져오기
  if (event.request.url.includes('/api/notifications/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 캐시에 있으면 캐시에서 반환
        if (response) {
          return response;
        }
        
        // 없으면 네트워크에서 가져오기
        return fetch(event.request);
      }
    )
  );
});