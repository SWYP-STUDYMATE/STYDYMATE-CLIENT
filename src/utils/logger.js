// 통합 로깅 시스템
export class Logger {
  static LOG_LEVELS = {
    ERROR: 0,
    WARN: 1, 
    INFO: 2,
    DEBUG: 3
  };

  static currentLevel = import.meta.env.DEV 
    ? Logger.LOG_LEVELS.DEBUG 
    : Logger.LOG_LEVELS.ERROR;

  static setLevel(level) {
    Logger.currentLevel = level;
  }

  static shouldLog(level) {
    return level <= Logger.currentLevel;
  }

  static formatMessage(level, message, context = '') {
    const timestamp = new Date().toISOString();
    const levelStr = Object.keys(Logger.LOG_LEVELS)[level];
    return `[${timestamp}] ${levelStr}${context ? ` [${context}]` : ''}: ${message}`;
  }

  static error(message, error = null, context = '') {
    if (!Logger.shouldLog(Logger.LOG_LEVELS.ERROR)) return;
    
    const formattedMessage = Logger.formatMessage(Logger.LOG_LEVELS.ERROR, message, context);
    console.error(formattedMessage);
    
    if (error) {
      console.error('Error details:', error);
      if (error.stack) {
        console.error('Stack trace:', error.stack);
      }
    }

    // 프로덕션에서는 외부 로그 서비스로 전송
    if (!import.meta.env.DEV) {
      Logger.sendToExternalService('error', formattedMessage, error);
    }
  }

  static warn(message, data = null, context = '') {
    if (!Logger.shouldLog(Logger.LOG_LEVELS.WARN)) return;
    
    const formattedMessage = Logger.formatMessage(Logger.LOG_LEVELS.WARN, message, context);
    console.warn(formattedMessage);
    
    if (data) {
      console.warn('Additional data:', data);
    }
  }

  static info(message, data = null, context = '') {
    if (!Logger.shouldLog(Logger.LOG_LEVELS.INFO)) return;
    
    const formattedMessage = Logger.formatMessage(Logger.LOG_LEVELS.INFO, message, context);
    console.log(formattedMessage);
    
    if (data) {
      console.log('Data:', data);
    }
  }

  static debug(message, data = null, context = '') {
    if (!Logger.shouldLog(Logger.LOG_LEVELS.DEBUG)) return;
    
    const formattedMessage = Logger.formatMessage(Logger.LOG_LEVELS.DEBUG, message, context);
    console.log(formattedMessage);
    
    if (data) {
      console.log('Debug data:', data);
    }
  }

  static api(method, url, status, duration, context = 'API') {
    const message = `${method.toUpperCase()} ${url} - ${status} (${duration}ms)`;
    
    if (status >= 400) {
      Logger.error(message, null, context);
    } else {
      Logger.info(message, null, context);
    }
  }

  static userAction(action, data = null) {
    Logger.info(`User action: ${action}`, data, 'USER');
  }

  static performance(metric, value, context = 'PERF') {
    Logger.debug(`${metric}: ${value}ms`, null, context);
  }

  static sendToExternalService(level, message, error) {
    // 향후 Sentry, LogRocket 등과 연동
    // 현재는 로컬 스토리지에 임시 저장
    try {
      const logs = JSON.parse(localStorage.getItem('app_logs') || '[]');
      logs.push({
        level,
        message,
        error: error ? error.message : null,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      });
      
      // 최대 100개의 로그만 유지
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      localStorage.setItem('app_logs', JSON.stringify(logs));
    } catch (e) {
      // 로그 저장 실패 시에도 앱 동작에 영향 없도록
      console.error('Failed to store log:', e);
    }
  }

  static exportLogs() {
    try {
      const logs = localStorage.getItem('app_logs');
      if (logs) {
        const blob = new Blob([logs], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `studymate-logs-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      Logger.error('Failed to export logs', e);
    }
  }

  static clearLogs() {
    localStorage.removeItem('app_logs');
    Logger.info('Logs cleared');
  }
}

// 편의 함수들
export const log = {
  error: (msg, err, ctx) => Logger.error(msg, err, ctx),
  warn: (msg, data, ctx) => Logger.warn(msg, data, ctx),
  info: (msg, data, ctx) => Logger.info(msg, data, ctx),
  debug: (msg, data, ctx) => Logger.debug(msg, data, ctx),
  api: (method, url, status, duration) => Logger.api(method, url, status, duration),
  user: (action, data) => Logger.userAction(action, data),
  perf: (metric, value) => Logger.performance(metric, value)
};

export default Logger;