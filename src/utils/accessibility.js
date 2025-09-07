/**
 * 접근성 유틸리티 함수들
 */

/**
 * 스크린 리더용 텍스트 생성
 * @param {string} text - 기본 텍스트
 * @param {string} context - 추가 컨텍스트
 * @returns {string} 접근성 향상된 텍스트
 */
export const createAriaLabel = (text, context = '') => {
  return context ? `${text}, ${context}` : text;
};

/**
 * 현재 상태를 스크린 리더에 알리는 텍스트 생성
 * @param {string} element - 요소명
 * @param {string} state - 현재 상태
 * @param {number} current - 현재 위치
 * @param {number} total - 전체 개수
 * @returns {string} 상태 설명 텍스트
 */
export const createStateAnnouncement = (element, state, current = null, total = null) => {
  let announcement = `${element} ${state}`;
  
  if (current !== null && total !== null) {
    announcement += `, ${total}개 중 ${current}번째`;
  }
  
  return announcement;
};

/**
 * 로딩 상태 ARIA 속성 생성
 * @param {boolean} isLoading - 로딩 상태
 * @param {string} loadingText - 로딩 중 텍스트
 * @param {string} completeText - 완료 텍스트
 * @returns {Object} ARIA 속성 객체
 */
export const createLoadingAriaProps = (isLoading, loadingText = '로딩 중', completeText = '완료') => {
  return {
    'aria-busy': isLoading,
    'aria-live': 'polite',
    'aria-label': isLoading ? loadingText : completeText
  };
};

/**
 * 버튼 상태에 따른 ARIA 속성 생성
 * @param {boolean} disabled - 비활성화 상태
 * @param {boolean} pressed - 눌린 상태 (토글 버튼용)
 * @param {boolean} expanded - 확장 상태 (드롭다운 버튼용)
 * @returns {Object} ARIA 속성 객체
 */
export const createButtonAriaProps = (disabled = false, pressed = null, expanded = null) => {
  const props = {};
  
  if (disabled) {
    props['aria-disabled'] = true;
  }
  
  if (pressed !== null) {
    props['aria-pressed'] = pressed;
  }
  
  if (expanded !== null) {
    props['aria-expanded'] = expanded;
  }
  
  return props;
};

/**
 * 폼 입력 필드 ARIA 속성 생성
 * @param {string} describedBy - 설명 요소 ID
 * @param {boolean} required - 필수 입력 여부
 * @param {boolean} invalid - 유효하지 않은 상태
 * @param {string} errorMessage - 에러 메시지
 * @returns {Object} ARIA 속성 객체
 */
export const createInputAriaProps = (describedBy = '', required = false, invalid = false, errorMessage = '') => {
  const props = {};
  
  if (describedBy) {
    props['aria-describedby'] = describedBy;
  }
  
  if (required) {
    props['aria-required'] = true;
  }
  
  if (invalid) {
    props['aria-invalid'] = true;
    if (errorMessage) {
      props['aria-errormessage'] = errorMessage;
    }
  }
  
  return props;
};

/**
 * 탭 인터페이스 ARIA 속성 생성
 * @param {string} tabId - 탭 ID
 * @param {string} panelId - 패널 ID
 * @param {boolean} selected - 선택 상태
 * @param {number} tabIndex - 탭 인덱스
 * @returns {Object} ARIA 속성 객체
 */
export const createTabAriaProps = (tabId, panelId, selected = false, tabIndex = -1) => {
  return {
    id: tabId,
    role: 'tab',
    'aria-selected': selected,
    'aria-controls': panelId,
    tabIndex: selected ? 0 : tabIndex
  };
};

/**
 * 탭 패널 ARIA 속성 생성
 * @param {string} panelId - 패널 ID
 * @param {string} tabId - 관련 탭 ID
 * @param {boolean} hidden - 숨김 상태
 * @returns {Object} ARIA 속성 객체
 */
export const createTabPanelAriaProps = (panelId, tabId, hidden = false) => {
  return {
    id: panelId,
    role: 'tabpanel',
    'aria-labelledby': tabId,
    hidden: hidden
  };
};

/**
 * 리스트 아이템 ARIA 속성 생성
 * @param {number} position - 현재 위치
 * @param {number} size - 전체 크기
 * @param {string} label - 아이템 레이블
 * @returns {Object} ARIA 속성 객체
 */
export const createListItemAriaProps = (position, size, label = '') => {
  return {
    role: 'listitem',
    'aria-setsize': size,
    'aria-posinset': position,
    'aria-label': label || `${size}개 중 ${position}번째 항목`
  };
};

/**
 * 모달/다이얼로그 ARIA 속성 생성
 * @param {string} labelledBy - 제목 요소 ID
 * @param {string} describedBy - 설명 요소 ID
 * @param {boolean} modal - 모달 여부
 * @returns {Object} ARIA 속성 객체
 */
export const createDialogAriaProps = (labelledBy = '', describedBy = '', modal = true) => {
  const props = {
    role: modal ? 'dialog' : 'alertdialog',
    'aria-modal': modal
  };
  
  if (labelledBy) {
    props['aria-labelledby'] = labelledBy;
  }
  
  if (describedBy) {
    props['aria-describedby'] = describedBy;
  }
  
  return props;
};

/**
 * 진행률 표시 ARIA 속성 생성
 * @param {number} value - 현재 값
 * @param {number} max - 최대값
 * @param {number} min - 최소값
 * @param {string} label - 진행률 레이블
 * @returns {Object} ARIA 속성 객체
 */
export const createProgressAriaProps = (value, max = 100, min = 0, label = '') => {
  const percentage = Math.round((value / max) * 100);
  
  return {
    role: 'progressbar',
    'aria-valuenow': value,
    'aria-valuemin': min,
    'aria-valuemax': max,
    'aria-valuetext': `${percentage}% 완료`,
    'aria-label': label || `진행률 ${percentage}%`
  };
};

/**
 * 키보드 단축키 힌트 텍스트 생성
 * @param {string} key - 단축키
 * @param {string} action - 동작 설명
 * @returns {string} 단축키 힌트 텍스트
 */
export const createKeyboardHint = (key, action) => {
  return `${key} 키를 눌러 ${action}`;
};

/**
 * 터치 제스처 힌트 텍스트 생성
 * @param {string} gesture - 제스처명
 * @param {string} action - 동작 설명
 * @returns {string} 제스처 힌트 텍스트
 */
export const createGestureHint = (gesture, action) => {
  const gestureMap = {
    swipeLeft: '왼쪽으로 스와이프',
    swipeRight: '오른쪽으로 스와이프',
    swipeUp: '위로 스와이프',
    swipeDown: '아래로 스와이프',
    pullDown: '아래로 당겨서'
  };
  
  return `${gestureMap[gesture] || gesture}하여 ${action}`;
};