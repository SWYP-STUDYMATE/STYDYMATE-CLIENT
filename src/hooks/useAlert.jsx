import { useContext, createContext, useState, useCallback } from 'react';
import AlertModal from '../components/ui/AlertModal';
import ConfirmModal from '../components/ui/ConfirmModal';

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  // Alert 모달 상태 (단순 알림용)
  const [alert, setAlert] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    confirmText: '확인'
  });

  // Confirm 모달 상태 (확인/취소 필요한 경우)
  const [confirm, setConfirm] = useState({
    isOpen: false,
    title: '확인',
    message: '',
    type: 'confirm',
    onConfirm: null,
    confirmText: '확인',
    cancelText: '취소',
    confirmVariant: 'primary'
  });

  // Alert 모달 표시 (단순 알림용)
  const showAlert = useCallback((config) => {
    if (typeof config === 'string') {
      // 단순 문자열인 경우 기본 알림으로 처리
      setAlert({
        isOpen: true,
        title: '알림',
        message: config,
        type: 'info',
        confirmText: '확인'
      });
    } else {
      // 객체인 경우 설정값 적용
      setAlert({
        isOpen: true,
        title: config.title || '알림',
        message: config.message,
        type: config.type || 'info',
        confirmText: config.confirmText || '확인'
      });
    }
  }, []);

  // Confirm 모달 표시 (확인/취소 필요한 경우)
  const showConfirm = useCallback((config) => {
    if (typeof config === 'string') {
      setConfirm({
        isOpen: true,
        title: '확인',
        message: config,
        type: 'confirm',
        onConfirm: null,
        confirmText: '확인',
        cancelText: '취소',
        confirmVariant: 'primary'
      });
    } else {
      setConfirm({
        isOpen: true,
        title: config.title || '확인',
        message: config.message,
        type: config.type || 'confirm',
        onConfirm: config.onConfirm || null,
        confirmText: config.confirmText || '확인',
        cancelText: config.cancelText || '취소',
        confirmVariant: config.confirmVariant || 'primary'
      });
    }
  }, []);

  const hideAlert = useCallback(() => {
    setAlert(prev => ({ ...prev, isOpen: false }));
  }, []);

  const hideConfirm = useCallback(() => {
    setConfirm(prev => ({ ...prev, isOpen: false }));
  }, []);

  // 편의 메서드들 - Alert용 (단순 알림)
  const showSuccess = useCallback((message, title = '성공') => {
    showAlert({ message, title, type: 'success' });
  }, [showAlert]);

  const showError = useCallback((message, title = '오류') => {
    showAlert({ message, title, type: 'error' });
  }, [showAlert]);

  const showWarning = useCallback((message, title = '경고') => {
    showAlert({ message, title, type: 'warning' });
  }, [showAlert]);

  const showInfo = useCallback((message, title = '알림') => {
    showAlert({ message, title, type: 'info' });
  }, [showAlert]);

  // 편의 메서드들 - Confirm용 (확인/취소 필요)
  const confirmDelete = useCallback((message, onConfirm, title = '삭제 확인') => {
    showConfirm({ 
      message, 
      title, 
      type: 'danger',
      onConfirm,
      confirmText: '삭제',
      cancelText: '취소',
      confirmVariant: 'danger'
    });
  }, [showConfirm]);

  const confirmAction = useCallback((message, onConfirm, title = '확인') => {
    showConfirm({ 
      message, 
      title, 
      type: 'confirm',
      onConfirm,
      confirmText: '확인',
      cancelText: '취소',
      confirmVariant: 'primary'
    });
  }, [showConfirm]);

  const value = {
    // Alert 관련
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideAlert,
    // Confirm 관련
    showConfirm,
    confirmDelete,
    confirmAction,
    hideConfirm
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
      {/* Alert 모달 */}
      <AlertModal
        isOpen={alert.isOpen}
        onClose={hideAlert}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        confirmText={alert.confirmText}
      />
      {/* Confirm 모달 */}
      <ConfirmModal
        isOpen={confirm.isOpen}
        onClose={hideConfirm}
        onConfirm={confirm.onConfirm}
        title={confirm.title}
        message={confirm.message}
        type={confirm.type}
        confirmText={confirm.confirmText}
        cancelText={confirm.cancelText}
        confirmVariant={confirm.confirmVariant}
      />
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

// 기존 alert() 함수를 대체하는 전역 함수
export const setupGlobalAlert = (alertHook) => {
  if (typeof window !== 'undefined') {
    window.customAlert = alertHook.showAlert;
    window.alert = alertHook.showAlert; // 기존 alert 완전 대체
  }
};