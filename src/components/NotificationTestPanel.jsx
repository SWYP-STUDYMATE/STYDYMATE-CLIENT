import React from 'react';
import { 
  showToast, 
  showSuccessToast, 
  showErrorToast, 
  showInfoToast,
  showMatchingToast,
  showChatToast,
  showSessionToast,
  showAchievementToast
} from './NotificationToastManager';
import CommonButton from './CommonButton';

const NotificationTestPanel = ({ onClose }) => {
  const testNotifications = [
    {
      name: '기본 알림',
      action: () => showToast({
        type: 'personal',
        title: '테스트 알림',
        message: '이것은 기본 알림 테스트입니다.',
        category: '테스트'
      })
    },
    {
      name: '성공 알림',
      action: () => showSuccessToast('작업이 성공적으로 완료되었습니다!')
    },
    {
      name: '오류 알림',
      action: () => showErrorToast('오류가 발생했습니다. 다시 시도해주세요.')
    },
    {
      name: '정보 알림',
      action: () => showInfoToast('새로운 업데이트가 있습니다.')
    },
    {
      name: '긴급 알림',
      action: () => showToast({
        type: 'urgent',
        title: '긴급 알림',
        message: '즉시 확인이 필요한 중요한 알림입니다.',
        category: '긴급',
        priority: 'high'
      })
    },
    {
      name: '매칭 알림',
      action: () => showMatchingToast(
        '새로운 매칭 파트너를 찾았습니다!', 
        '매칭 성공',
        [
          {
            label: '확인',
            primary: true,
            handler: () => console.log('매칭 확인됨')
          },
          {
            label: '거절',
            handler: () => console.log('매칭 거절됨')
          }
        ]
      )
    },
    {
      name: '채팅 알림',
      action: () => showChatToast(
        '김영희님이 메시지를 보냈습니다: "안녕하세요! 오늘 세션 준비되셨나요?"',
        '새 메시지',
        'room-123'
      )
    },
    {
      name: '세션 알림',
      action: () => showSessionToast(
        '15분 후 박민수님과의 영어 회화 세션이 시작됩니다.',
        '세션 리마인더',
        'session-456'
      )
    },
    {
      name: '성취 알림',
      action: () => showAchievementToast(
        '축하합니다! "7일 연속 학습" 배지를 획득하셨습니다!',
        '새 배지 획득'
      )
    },
    {
      name: '복합 액션 알림',
      action: () => showToast({
        type: 'session',
        title: '세션 초대',
        message: '이정민님이 오늘 오후 3시 영어 회화 세션에 초대했습니다.',
        category: '세션 초대',
        actions: [
          {
            label: '수락',
            primary: true,
            handler: (notification) => {
              console.log('세션 수락:', notification);
              showSuccessToast('세션을 수락했습니다!');
            }
          },
          {
            label: '거절',
            handler: (notification) => {
              console.log('세션 거절:', notification);
              showInfoToast('세션을 거절했습니다.');
            }
          },
          {
            label: '나중에',
            closeAfter: false,
            handler: () => {
              showInfoToast('알림을 나중에 확인합니다.');
            }
          }
        ]
      })
    }
  ];

  const testWebSocketNotification = () => {
    // WebSocket에서 받은 것처럼 시뮬레이션
    const event = new CustomEvent('notification-received', {
      detail: {
        type: 'matching',
        data: {
          id: `notification-${Date.now()}`,
          type: 'matching',
          title: 'WebSocket 테스트',
          message: '실시간 WebSocket 알림 테스트입니다.',
          category: '실시간 테스트',
          createdAt: new Date().toISOString(),
          clickUrl: '/matching'
        }
      }
    });
    window.dispatchEvent(event);
  };

  const testMultipleNotifications = () => {
    const notifications = [
      { type: 'chat', title: '채팅 #1', message: '첫 번째 채팅 메시지' },
      { type: 'matching', title: '매칭 #1', message: '새로운 매칭 요청' },
      { type: 'session', title: '세션 #1', message: '세션 시작 알림' },
      { type: 'achievement', title: '성취 #1', message: '새로운 배지 획득' },
      { type: 'system', title: '시스템 #1', message: '시스템 업데이트' }
    ];

    notifications.forEach((notification, index) => {
      setTimeout(() => {
        showToast({
          ...notification,
          id: `multi-${Date.now()}-${index}`,
          category: '다중 테스트'
        });
      }, index * 1000);
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overlay-strong">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#111111]">알림 시스템 테스트</h2>
          <button
            onClick={onClose}
            className="text-[#929292] hover:text-[#111111] text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {testNotifications.map((test, index) => (
            <CommonButton
              key={index}
              onClick={test.action}
              variant="secondary"
              className="text-sm py-2"
            >
              {test.name}
            </CommonButton>
          ))}
        </div>

        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold text-[#111111] mb-3">고급 테스트</h3>
          <div className="space-y-2">
            <CommonButton
              onClick={testWebSocketNotification}
              variant="primary"
              className="w-full"
            >
              WebSocket 알림 시뮬레이션
            </CommonButton>
            <CommonButton
              onClick={testMultipleNotifications}
              variant="secondary"
              className="w-full"
            >
              연속 알림 테스트 (5초간 5개)
            </CommonButton>
          </div>
        </div>

        <div className="border-t pt-4 mt-4">
          <h3 className="text-lg font-semibold text-[#111111] mb-3">알림 권한 테스트</h3>
          <CommonButton
            onClick={async () => {
              if ('Notification' in window) {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                  new Notification('브라우저 알림 테스트', {
                    body: '브라우저 알림이 정상적으로 작동합니다!',
                    icon: '/icon-192x192.png'
                  });
                  showSuccessToast('브라우저 알림 권한이 허용되었습니다!');
                } else {
                  showErrorToast('브라우저 알림 권한이 거부되었습니다.');
                }
              } else {
                showErrorToast('이 브라우저는 알림을 지원하지 않습니다.');
              }
            }}
            variant="secondary"
            className="w-full"
          >
            브라우저 알림 권한 요청 및 테스트
          </CommonButton>
        </div>

        <div className="mt-6 text-xs text-[#929292] bg-gray-50 p-3 rounded">
          <p><strong>테스트 안내:</strong></p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>각 버튼을 클릭하여 다양한 타입의 알림을 테스트할 수 있습니다</li>
            <li>긴급 알림은 자동으로 닫히지 않습니다</li>
            <li>액션이 있는 알림은 버튼을 통해 상호작용할 수 있습니다</li>
            <li>키보드 단축키: ESC (최근 토스트 닫기), Ctrl+Shift+C (모든 토스트 닫기)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NotificationTestPanel;
