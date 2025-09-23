import { useCallback, useEffect, useRef, useState } from 'react';
import EventEmitter from 'eventemitter3';
import Toast from './Toast.jsx';

const TOAST_EVENT_SHOW = 'toast:show';
const TOAST_EVENT_DISMISS = 'toast:dismiss';
const TOAST_EVENT_CLEAR = 'toast:clear';

const emitter = new EventEmitter();
let toastSequence = 0;

const defaultTitles = {
  success: '성공',
  error: '오류',
  warning: '경고',
  info: '알림'
};

const defaultDurations = {
  success: 4000,
  error: 6000,
  warning: 5000,
  info: 4000
};

const normalizeArgs = (type, args) => {
  let title;
  let message;
  let options = {};

  if (args.length === 1) {
    if (typeof args[0] === 'string') {
      message = args[0];
    } else if (typeof args[0] === 'object' && args[0] !== null) {
      options = { ...args[0] };
    }
  } else if (args.length === 2) {
    if (typeof args[0] === 'string' && typeof args[1] === 'string') {
      title = args[0];
      message = args[1];
    } else if (typeof args[0] === 'string' && typeof args[1] === 'object' && args[1] !== null) {
      message = args[0];
      options = { ...args[1] };
    }
  } else if (args.length >= 3) {
    title = args[0];
    message = args[1];
    if (typeof args[2] === 'object' && args[2] !== null) {
      options = { ...args[2] };
    }
  }

  if (!title && typeof options.title === 'string') {
    title = options.title;
  }
  if (!message && typeof options.message === 'string') {
    message = options.message;
  }

  return {
    title: title ?? defaultTitles[type] ?? '',
    message: message ?? '',
    options
  };
};

const buildToastPayload = (type, { title, message, options }) => {
  const id = options.id || `toast-${Date.now()}-${++toastSequence}`;

  return {
    id,
    type,
    title,
    message,
    duration: typeof options.duration === 'number' ? options.duration : defaultDurations[type] ?? 4000,
    position: options.position,
    actions: Array.isArray(options.actions) ? options.actions : [],
    onClose: typeof options.onClose === 'function' ? options.onClose : null,
    metadata: options.metadata
  };
};

const emitToast = (type, args) => {
  const payload = buildToastPayload(type, normalizeArgs(type, args));
  emitter.emit(TOAST_EVENT_SHOW, payload);
  return payload.id;
};

export const toast = {
  success: (...args) => emitToast('success', args),
  error: (...args) => emitToast('error', args),
  warning: (...args) => emitToast('warning', args),
  info: (...args) => emitToast('info', args),
  show: (config) => {
    if (!config) return null;
    const type = config.type || 'info';
    const normalized = {
      title: config.title ?? defaultTitles[type] ?? '',
      message: config.message ?? '',
      options: config
    };
    return emitToast(type, [normalized.title, normalized.message, normalized.options]);
  },
  dismiss: (id) => {
    if (!id) return;
    emitter.emit(TOAST_EVENT_DISMISS, id);
  },
  clearAll: () => {
    emitter.emit(TOAST_EVENT_CLEAR);
  }
};

export const ToastManager = ({ position = 'top-right', maxToasts = 3 }) => {
  const [toasts, setToasts] = useState([]);
  const latestToastsRef = useRef([]);

  useEffect(() => {
    latestToastsRef.current = toasts;
  }, [toasts]);

  const removeToast = useCallback((id, reason = 'dismissed') => {
    setToasts((prev) => {
      const target = prev.find((toastItem) => toastItem.id === id);
      if (target?.onClose) {
        try {
          target.onClose({ id, reason, toast: target });
        } catch (error) {
          console.warn('Toast onClose handler threw an error:', error);
        }
      }
      return prev.filter((toastItem) => toastItem.id !== id);
    });
  }, []);

  useEffect(() => {
    const handleShow = (toastPayload) => {
      setToasts((prev) => {
        const next = [toastPayload, ...prev];
        if (next.length > maxToasts) {
          return next.slice(0, maxToasts);
        }
        return next;
      });
    };

    const handleDismiss = (id) => {
      removeToast(id, 'manual');
    };

    const handleClear = () => {
      latestToastsRef.current.forEach((toastPayload) => {
        if (toastPayload.onClose) {
          try {
            toastPayload.onClose({ id: toastPayload.id, reason: 'clear', toast: toastPayload });
          } catch (error) {
            console.warn('Toast onClose handler threw an error:', error);
          }
        }
      });
      setToasts([]);
    };

    emitter.on(TOAST_EVENT_SHOW, handleShow);
    emitter.on(TOAST_EVENT_DISMISS, handleDismiss);
    emitter.on(TOAST_EVENT_CLEAR, handleClear);

    return () => {
      emitter.off(TOAST_EVENT_SHOW, handleShow);
      emitter.off(TOAST_EVENT_DISMISS, handleDismiss);
      emitter.off(TOAST_EVENT_CLEAR, handleClear);
    };
  }, [maxToasts, removeToast]);

  return (
    <>
      {toasts.map((toastItem) => (
        <Toast
          key={toastItem.id}
          id={toastItem.id}
          type={toastItem.type}
          title={toastItem.title}
          message={toastItem.message}
          duration={toastItem.duration}
          position={toastItem.position || position}
          actions={toastItem.actions}
          onClose={() => removeToast(toastItem.id, 'auto')}
        />
      ))}
    </>
  );
};

export default ToastManager;
