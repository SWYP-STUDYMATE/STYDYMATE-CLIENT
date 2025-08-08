// API 응답 타입
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        message: string;
        code?: string;
        details?: any;
    };
    meta?: {
        timestamp: string;
        requestId?: string;
        version?: string;
    };
}

// 에러 타입
export class ApiError extends Error {
    constructor(
        public statusCode: number,
        public code: string,
        message: string,
        public details?: any
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

// 컨텍스트 변수 타입
export interface Variables {
    requestId: string;
    userId?: string;
    startTime: number;
}

// 인증 정보 타입
export interface AuthUser {
    id: string;
    email?: string;
    role?: string;
    permissions?: string[];
}

// 페이지네이션 타입
export interface PaginationParams {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    meta: ApiResponse['meta'] & {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// 레벨 테스트 관련 타입
export interface LevelTestSubmission {
    userId: string;
    questionId: string;
    audio: File;
}

export interface LevelTestResult {
    userId: string;
    level: string;
    analysis: {
        grammar: number;
        vocabulary: number;
        pronunciation: number;
        fluency: number;
        coherence: number;
    };
    timestamp: string;
}

// WebRTC 관련 타입
export interface WebRTCRoom {
    id: string;
    participants: string[];
    createdAt: string;
    type: 'video' | 'audio';
}

export interface WebRTCSignal {
    type: 'offer' | 'answer' | 'ice-candidate';
    data: any;
    from: string;
    to: string;
}