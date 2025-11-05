import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkSessionAccess, setupAutoEndTimer, setupRemainingTimePoller } from '../utils/sessionTime';

/**
 * 세션 시간 제어를 위한 커스텀 훅
 * @param {Object} sessionMetadata - 세션 메타데이터 (scheduledStartTime, scheduledEndTime 포함)
 * @param {string} roomId - 룸 ID
 * @returns {Object} 시간 제어 관련 상태 및 함수들
 */
export function useSessionTimeControl(sessionMetadata, roomId) {
  const navigate = useNavigate();
  const [remainingMinutes, setRemainingMinutes] = useState(null);
  const [showEndWarning, setShowEndWarning] = useState(false);
  const [sessionAccessInfo, setSessionAccessInfo] = useState(null);

  const autoEndCleanupRef = useRef(null);
  const pollerCleanupRef = useRef(null);
  const hasShown5MinWarning = useRef(false);
  const hasShown1MinWarning = useRef(false);

  // 세션 접속 가능 여부 초기 체크
  useEffect(() => {
    if (!sessionMetadata) return;

    const { scheduledStartTime, scheduledEndTime } = sessionMetadata;

    // 시간 제한이 없는 경우 (항상 접속 가능)
    if (!scheduledStartTime || !scheduledEndTime) {
      setSessionAccessInfo({
        canJoin: true,
        status: 'always_available',
        message: '언제든지 접속 가능합니다'
      });
      return;
    }

    // 접속 가능 여부 확인
    const accessInfo = checkSessionAccess(scheduledStartTime, scheduledEndTime);
    setSessionAccessInfo(accessInfo);

    // 접속 불가능한 경우 즉시 리다이렉트
    if (!accessInfo.canJoin) {
      setTimeout(() => {
        navigate('/sessions', {
          state: {
            message: accessInfo.message,
            type: accessInfo.status === 'not_started' ? 'info' : 'warning'
          }
        });
      }, 2000);
    }
  }, [sessionMetadata, navigate]);

  // 자동 종료 타이머 설정
  useEffect(() => {
    if (!sessionMetadata?.scheduledEndTime) return;

    // 세션 종료 타이머
    const cleanup = setupAutoEndTimer(sessionMetadata.scheduledEndTime, () => {
      setShowEndWarning(false);

      // 세션 종료 처리
      setTimeout(() => {
        navigate('/sessions', {
          state: {
            message: '세션 시간이 종료되었습니다',
            type: 'info'
          }
        });
      }, 1000);
    });

    autoEndCleanupRef.current = cleanup;

    return () => {
      if (autoEndCleanupRef.current) {
        autoEndCleanupRef.current();
      }
    };
  }, [sessionMetadata?.scheduledEndTime, navigate]);

  // 남은 시간 폴링 및 경고 표시
  useEffect(() => {
    if (!sessionMetadata?.scheduledEndTime) return;

    const cleanup = setupRemainingTimePoller(
      sessionMetadata.scheduledEndTime,
      (minutes) => {
        setRemainingMinutes(minutes);

        // 5분 전 경고 (한 번만 표시)
        if (minutes <= 5 && minutes > 1 && !hasShown5MinWarning.current) {
          setShowEndWarning(true);
          hasShown5MinWarning.current = true;
        }

        // 1분 전 최종 경고 (한 번만 표시)
        if (minutes <= 1 && !hasShown1MinWarning.current) {
          setShowEndWarning(true);
          hasShown1MinWarning.current = true;
        }

        // 종료 시 경고 숨김
        if (minutes === 0) {
          setShowEndWarning(false);
        }
      },
      30000 // 30초마다 체크
    );

    pollerCleanupRef.current = cleanup;

    return () => {
      if (pollerCleanupRef.current) {
        pollerCleanupRef.current();
      }
    };
  }, [sessionMetadata?.scheduledEndTime]);

  // 경고 닫기
  const dismissWarning = () => {
    setShowEndWarning(false);
  };

  return {
    remainingMinutes,
    showEndWarning,
    sessionAccessInfo,
    dismissWarning
  };
}
