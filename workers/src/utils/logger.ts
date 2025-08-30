/**
 * Cloudflare Workers용 통합 로깅 시스템
 * Edge 환경의 특성을 고려한 최적화된 로깅
 */

export interface LogLevel {
    DEBUG: 0;
    INFO: 1;
    WARN: 2;
    ERROR: 3;
}

export const LOG_LEVELS: LogLevel = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
};

export interface LogContext {
    requestId?: string;
    userId?: string;
    method?: string;
    path?: string;
    ip?: string;
    userAgent?: string;
    duration?: number;
    status?: number;
    component?: string;
    operation?: string;
}

export interface LogEntry {
    level: keyof LogLevel;
    message: string;
    timestamp: string;
    context?: LogContext;
    error?: {
        name: string;
        message: string;
        stack?: string;
    };
    metadata?: Record<string, any>;
}

export class WorkersLogger {
    private static instance: WorkersLogger;
    private currentLevel: number = LOG_LEVELS.INFO;
    private environment: string = 'production';

    private constructor() {}

    static getInstance(): WorkersLogger {
        if (!WorkersLogger.instance) {
            WorkersLogger.instance = new WorkersLogger();
        }
        return WorkersLogger.instance;
    }

    setLevel(level: keyof LogLevel) {
        this.currentLevel = LOG_LEVELS[level];
    }

    setEnvironment(env: string) {
        this.environment = env;
        // 개발 환경에서는 DEBUG 레벨까지 로깅
        if (env === 'development' || env === 'staging') {
            this.setLevel('DEBUG');
        }
    }

    private shouldLog(level: number): boolean {
        return level >= this.currentLevel;
    }

    private createLogEntry(
        level: keyof LogLevel,
        message: string,
        context?: LogContext,
        error?: Error,
        metadata?: Record<string, any>
    ): LogEntry {
        const entry: LogEntry = {
            level,
            message,
            timestamp: new Date().toISOString(),
            context,
            metadata
        };

        if (error) {
            entry.error = {
                name: error.name,
                message: error.message,
                stack: this.environment === 'development' ? error.stack : undefined
            };
        }

        return entry;
    }

    private output(entry: LogEntry) {
        const logString = JSON.stringify(entry);
        
        switch (entry.level) {
            case 'ERROR':
                console.error(logString);
                break;
            case 'WARN':
                console.warn(logString);
                break;
            case 'INFO':
            case 'DEBUG':
            default:
                console.log(logString);
                break;
        }
    }

    debug(message: string, context?: LogContext, metadata?: Record<string, any>) {
        if (!this.shouldLog(LOG_LEVELS.DEBUG)) return;
        const entry = this.createLogEntry('DEBUG', message, context, undefined, metadata);
        this.output(entry);
    }

    info(message: string, context?: LogContext, metadata?: Record<string, any>) {
        if (!this.shouldLog(LOG_LEVELS.INFO)) return;
        const entry = this.createLogEntry('INFO', message, context, undefined, metadata);
        this.output(entry);
    }

    warn(message: string, context?: LogContext, metadata?: Record<string, any>) {
        if (!this.shouldLog(LOG_LEVELS.WARN)) return;
        const entry = this.createLogEntry('WARN', message, context, undefined, metadata);
        this.output(entry);
    }

    error(message: string, error?: Error, context?: LogContext, metadata?: Record<string, any>) {
        if (!this.shouldLog(LOG_LEVELS.ERROR)) return;
        const entry = this.createLogEntry('ERROR', message, context, error, metadata);
        this.output(entry);
    }

    // API 호출 전용 로깅
    apiCall(method: string, path: string, status: number, duration: number, context?: LogContext) {
        const message = `${method.toUpperCase()} ${path} - ${status} (${duration}ms)`;
        const apiContext: LogContext = {
            ...context,
            method: method.toUpperCase(),
            path,
            status,
            duration,
            component: 'API'
        };

        if (status >= 500) {
            this.error(message, undefined, apiContext);
        } else if (status >= 400) {
            this.warn(message, apiContext);
        } else {
            this.info(message, apiContext);
        }
    }

    // 성능 로깅
    performance(operation: string, duration: number, context?: LogContext) {
        const perfContext: LogContext = {
            ...context,
            operation,
            duration,
            component: 'PERFORMANCE'
        };

        if (duration > 5000) {
            this.warn(`Slow operation: ${operation} (${duration}ms)`, perfContext);
        } else if (duration > 1000) {
            this.info(`Operation: ${operation} (${duration}ms)`, perfContext);
        } else {
            this.debug(`Operation: ${operation} (${duration}ms)`, perfContext);
        }
    }

    // AI 서비스 로깅
    aiOperation(service: string, operation: string, duration: number, tokens?: number, context?: LogContext) {
        const aiContext: LogContext = {
            ...context,
            component: 'AI',
            operation: `${service}.${operation}`,
            duration
        };

        const metadata = tokens ? { tokens } : undefined;
        this.info(`AI ${service}: ${operation} (${duration}ms)`, aiContext, metadata);
    }

    // WebRTC 로깅
    webrtc(event: string, roomId?: string, userId?: string, context?: LogContext) {
        const webrtcContext: LogContext = {
            ...context,
            component: 'WEBRTC',
            operation: event,
            userId
        };

        const metadata = roomId ? { roomId } : undefined;
        this.info(`WebRTC: ${event}`, webrtcContext, metadata);
    }

    // 스토리지 작업 로깅
    storage(operation: string, key: string, size?: number, context?: LogContext) {
        const storageContext: LogContext = {
            ...context,
            component: 'STORAGE',
            operation
        };

        const metadata = { key, size };
        this.debug(`Storage ${operation}: ${key}`, storageContext, metadata);
    }

    // 캐시 작업 로깅
    cache(operation: 'HIT' | 'MISS' | 'SET' | 'DELETE', key: string, context?: LogContext) {
        const cacheContext: LogContext = {
            ...context,
            component: 'CACHE',
            operation
        };

        const metadata = { key };
        this.debug(`Cache ${operation}: ${key}`, cacheContext, metadata);
    }

    // 보안 이벤트 로깅
    security(event: string, ip?: string, context?: LogContext) {
        const securityContext: LogContext = {
            ...context,
            component: 'SECURITY',
            operation: event,
            ip
        };

        this.warn(`Security event: ${event}`, securityContext);
    }
}

// 싱글톤 인스턴스 내보내기
export const logger = WorkersLogger.getInstance();

// 편의 함수들
export const log = {
    debug: (msg: string, ctx?: LogContext, meta?: Record<string, any>) => logger.debug(msg, ctx, meta),
    info: (msg: string, ctx?: LogContext, meta?: Record<string, any>) => logger.info(msg, ctx, meta),
    warn: (msg: string, ctx?: LogContext, meta?: Record<string, any>) => logger.warn(msg, ctx, meta),
    error: (msg: string, err?: Error, ctx?: LogContext, meta?: Record<string, any>) => logger.error(msg, err, ctx, meta),
    api: (method: string, path: string, status: number, duration: number, ctx?: LogContext) => 
        logger.apiCall(method, path, status, duration, ctx),
    perf: (operation: string, duration: number, ctx?: LogContext) => 
        logger.performance(operation, duration, ctx),
    ai: (service: string, operation: string, duration: number, tokens?: number, ctx?: LogContext) =>
        logger.aiOperation(service, operation, duration, tokens, ctx),
    webrtc: (event: string, roomId?: string, userId?: string, ctx?: LogContext) =>
        logger.webrtc(event, roomId, userId, ctx),
    storage: (operation: string, key: string, size?: number, ctx?: LogContext) =>
        logger.storage(operation, key, size, ctx),
    cache: (operation: 'HIT' | 'MISS' | 'SET' | 'DELETE', key: string, ctx?: LogContext) =>
        logger.cache(operation, key, ctx),
    security: (event: string, ip?: string, ctx?: LogContext) =>
        logger.security(event, ip, ctx)
};

export default logger;