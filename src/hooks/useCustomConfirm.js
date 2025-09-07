import { useState, useCallback } from 'react';

/**
 * 커스텀 확인 다이얼로그를 위한 훅
 */
export const useCustomConfirm = () => {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '확인',
    message: '',
    confirmText: '확인',
    cancelText: '취소',
    type: 'default',
    onConfirm: () => {},
    onCancel: () => {}
  });

  const showConfirm = useCallback(({
    title = '확인',
    message,
    confirmText = '확인',
    cancelText = '취소',
    type = 'default'
  }) => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        title,
        message,
        confirmText,
        cancelText,
        type,
        onConfirm: () => {
          setConfirmState(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setConfirmState(prev => ({ ...prev, isOpen: false }));
          resolve(false);
        }
      });
    });
  }, []);

  const hideConfirm = useCallback(() => {
    setConfirmState(prev => ({ ...prev, isOpen: false }));
  }, []);

  return {
    confirmState,
    showConfirm,
    hideConfirm
  };
};