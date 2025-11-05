/**
 * 세션 시간 검증 및 관리 유틸리티
 */

/**
 * 세션 접속 가능 여부 확인
 * @param {string} scheduledStartTime - ISO 8601 형식의 시작 시간
 * @param {string} scheduledEndTime - ISO 8601 형식의 종료 시간
 * @returns {{canJoin: boolean, status: string, message: string, remainingTime: number|null}}
 */
export function checkSessionAccess(scheduledStartTime, scheduledEndTime) {
  // 시간이 설정되지 않은 경우 항상 접속 가능
  if (!scheduledStartTime || !scheduledEndTime) {
    return {
      canJoin: true,
      status: 'always_available',
      message: '언제든지 접속 가능합니다',
      remainingTime: null
    };
  }

  const now = Date.now();
  const startTime = new Date(scheduledStartTime).getTime();
  const endTime = new Date(scheduledEndTime).getTime();

  // 세션 시작 전
  if (now < startTime) {
    const waitTime = Math.ceil((startTime - now) / 1000 / 60); // 분 단위
    return {
      canJoin: false,
      status: 'not_started',
      message: `세션이 아직 시작되지 않았습니다. (${waitTime}분 후 시작)`,
      remainingTime: waitTime
    };
  }

  // 세션 종료 후
  if (now > endTime) {
    return {
      canJoin: false,
      status: 'ended',
      message: '세션이 종료되었습니다',
      remainingTime: 0
    };
  }

  // 세션 진행 중
  const remainingTime = Math.ceil((endTime - now) / 1000 / 60); // 분 단위
  return {
    canJoin: true,
    status: 'in_progress',
    message: `세션 진행 중 (${remainingTime}분 남음)`,
    remainingTime
  };
}

/**
 * 세션 자동 종료 타이머 설정
 * @param {string} scheduledEndTime - ISO 8601 형식의 종료 시간
 * @param {Function} onExpire - 세션 종료 시 실행할 콜백
 * @returns {Function} 타이머 정리 함수
 */
export function setupAutoEndTimer(scheduledEndTime, onExpire) {
  if (!scheduledEndTime) {
    return () => {}; // no-op cleanup function
  }

  const endTime = new Date(scheduledEndTime).getTime();
  const now = Date.now();
  const timeUntilEnd = endTime - now;

  // 이미 종료된 경우 즉시 실행
  if (timeUntilEnd <= 0) {
    setTimeout(onExpire, 0);
    return () => {};
  }

  // 타이머 설정
  const timerId = setTimeout(() => {
    onExpire();
  }, timeUntilEnd);

  // 정리 함수 반환
  return () => {
    clearTimeout(timerId);
  };
}

/**
 * 세션 남은 시간 폴링 설정
 * @param {string} scheduledEndTime - ISO 8601 형식의 종료 시간
 * @param {Function} onUpdate - 시간 업데이트 시 실행할 콜백 (remainingMinutes를 인자로 받음)
 * @param {number} intervalMs - 폴링 간격 (밀리초, 기본 60000 = 1분)
 * @returns {Function} 폴링 정리 함수
 */
export function setupRemainingTimePoller(scheduledEndTime, onUpdate, intervalMs = 60000) {
  if (!scheduledEndTime) {
    return () => {}; // no-op cleanup function
  }

  const updateRemainingTime = () => {
    const endTime = new Date(scheduledEndTime).getTime();
    const now = Date.now();
    const remainingMs = endTime - now;

    if (remainingMs <= 0) {
      onUpdate(0);
      return false; // 중지 신호
    }

    const remainingMinutes = Math.ceil(remainingMs / 1000 / 60);
    onUpdate(remainingMinutes);
    return true; // 계속 진행 신호
  };

  // 초기 업데이트
  if (!updateRemainingTime()) {
    return () => {};
  }

  // 주기적 업데이트
  const intervalId = setInterval(() => {
    if (!updateRemainingTime()) {
      clearInterval(intervalId);
    }
  }, intervalMs);

  // 정리 함수 반환
  return () => {
    clearInterval(intervalId);
  };
}

/**
 * 사람이 읽기 쉬운 시간 형식으로 변환
 * @param {string} isoString - ISO 8601 형식의 시간
 * @returns {string} 형식화된 시간 문자열
 */
export function formatSessionTime(isoString) {
  if (!isoString) return '';

  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * 세션 상태 뱃지 스타일 가져오기
 * @param {string} status - 세션 상태 ('not_started', 'in_progress', 'ended')
 * @returns {{bgColor: string, textColor: string, label: string}}
 */
export function getSessionStatusStyle(status) {
  const styles = {
    not_started: {
      bgColor: 'bg-[var(--black-100)]',
      textColor: 'text-[var(--black-400)]',
      label: '시작 전'
    },
    in_progress: {
      bgColor: 'bg-[var(--green-50)]',
      textColor: 'text-[var(--green-600)]',
      label: '진행 중'
    },
    ended: {
      bgColor: 'bg-[rgba(234,67,53,0.1)]',
      textColor: 'text-[var(--red)]',
      label: '종료됨'
    },
    always_available: {
      bgColor: 'bg-[var(--green-50)]',
      textColor: 'text-[var(--green-600)]',
      label: '접속 가능'
    }
  };

  return styles[status] || styles.always_available;
}
