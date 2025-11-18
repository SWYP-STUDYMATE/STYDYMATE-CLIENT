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
        note?: string;
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
    user?: AuthUser;
}

// Context Variable Map for Hono
export interface ContextVariableMap {
    user: AuthUser;
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
export interface WebRTCParticipantInfo {
    userId: string;
    userName?: string;
    joinedAt?: string;
    audioEnabled?: boolean;
    videoEnabled?: boolean;
    isScreenSharing?: boolean;
}

export interface WebRTCRoom {
    id: string;
    participants: WebRTCParticipantInfo[];
    createdAt: string;
    type: 'video' | 'audio';
    maxParticipants: number;
    metadata?: Record<string, any>;
}

export interface ActiveRoomInfo {
    roomId: string;
    roomType: 'video' | 'audio';
    currentParticipants: number;
    maxParticipants: number;
    status: 'waiting' | 'active';
    createdAt: string;
    updatedAt: string;
    metadata?: Record<string, any>;
}

export interface WebRTCSignal {
    type: 'offer' | 'answer' | 'ice-candidate';
    data: any;
    from: string;
    to: string;
}

// User domain types (Workers migration)
export interface UserProfile {
    id: string;
    email?: string;
    name?: string;
    englishName?: string;
    birthday?: string;
    birthyear?: string;
    gender?: string;
    profileImage?: string;
    selfBio?: string;
    location?: {
        id: number;
        country: string;
        city?: string;
        timeZone?: string;
    };
    nativeLanguage?: {
        id: number;
        name: string;
        code: string;
    };
    onboardingCompleted: boolean;
    communicationMethod?: string;
    dailyMinute?: string;
    partnerGender?: string;
    learningExpectation?: string;
    createdAt: string;
    updatedAt: string;
}

export interface UserSettings {
    language?: string;
    marketingOptIn?: boolean;
    notificationPreferences?: Record<string, boolean>;
    timeZone?: string;
}

export interface OnboardingSummary {
    languages: Array<{
        languageId: number;
        currentLevelId?: number;
        targetLevelId?: number;
    }>;
    topics: number[];
    motivations: Array<{ motivationId: number; priority?: number }>;
    learningStyles: number[];
    groupSizes: number[];
    partnerPreferences: Array<{ partnerPersonalityId: number; partnerGender?: string }>;
    schedules: Array<{
        scheduleId: number;
        dayOfWeek: string;
        classTime?: string;
    }>;
    communicationMethod?: string;
}

// Matching domain types
export interface MatchingPartner {
    userId: string;
    englishName?: string;
    profileImageUrl?: string;
    selfBio?: string;
    age?: number;
    gender?: string;
    location?: string;
    nativeLanguage?: string;
    targetLanguages?: Array<{
        languageName: string;
        currentLevel?: string;
        targetLevel?: string;
    }>;
    interests?: string[];
    partnerPersonalities?: string[];
    compatibilityScore: number;
    compatibilityLevel?: 'HIGH' | 'MEDIUM' | 'LOW';
    onlineStatus?: string;
    lastActiveTime?: string;
}

export interface CompatibilityCategoryDetail {
    category: 'language' | 'personality' | 'goals' | 'interests';
    score: number;
    description: string;
}

export interface CompatibilitySharedInsights {
    mutualExchangeLanguages: string[];
    sharedTargetLanguages: string[];
    sharedInterests: string[];
    sharedGoals: string[];
    personalityOverlap: string[];
}

export interface CompatibilityScoreResponseType {
    overallScore: number;
    compatibilityLevel: 'HIGH' | 'MEDIUM' | 'LOW';
    recommendation: string;
    categoryScores: Record<string, number>;
    categoryDetails: CompatibilityCategoryDetail[];
    sharedInsights: CompatibilitySharedInsights;
}

// Achievement domain types
export interface AchievementResponseType {
    id: number;
    achievementKey: string;
    title: string;
    description?: string;
    category: string;
    originalCategory?: string;
    type: string;
    tier: string;
    targetValue?: number;
    targetUnit?: string;
    xpReward?: number;
    badgeIconUrl?: string;
    badgeColor?: string;
    isActive: boolean;
    isHidden: boolean;
    sortOrder?: number;
    prerequisiteAchievementId?: number;
}

export interface UserAchievementResponseType {
    id: number;
    achievement: AchievementResponseType;
    currentProgress: number;
    isCompleted: boolean;
    completedAt?: string;
    isRewardClaimed: boolean;
    rewardClaimedAt?: string;
    progressPercentage: number;
}

export interface AchievementStatsResponseType {
    totalAchievements: number;
    completedAchievements: number;
    inProgressAchievements: number;
    totalXpEarned: number;
    unclaimedRewards: number;
    completionRate: number;
    achievementsByCategory: Record<string, number>;
    achievementsByTier: Record<string, number>;
    recentCompletions: UserAchievementResponseType[];
    nearCompletion: UserAchievementResponseType[];
}

// Chat domain types
export interface ChatParticipant {
    userId: string;
    name?: string;
    profileImage?: string;
}

export type ChatMessageType = 'TEXT' | 'IMAGE' | 'AUDIO' | 'FILE' | 'MIXED';

export interface ChatFileResponseType {
    fileId: number;
    originalFilename: string;
    fileUrl: string;
    fileType: string;
    contentType?: string;
    fileSize?: number;
    thumbnailUrl?: string;
    duration?: number;
    createdAt?: string;
}

export interface ChatMessageResponseType {
    messageId: number;
    roomId: number;
    sender: ChatParticipant;
    message?: string;
    imageUrls: string[];
    audioUrl?: string;
    audioDuration?: number;
    files: ChatFileResponseType[];
    messageType: ChatMessageType;
    sentAt: string;
}

export interface ChatRoomSummary {
    roomId: number;
    roomName: string;
    roomType: string;
    isPublic: boolean;
    maxParticipants?: number;
    participants: ChatParticipant[];
    createdBy: string;      // 채팅방 생성자 user_id
    isOwner?: boolean;      // 현재 사용자가 방장인지 여부
    lastMessage?: string;
    lastMessageAt?: string;
}

export interface SessionParticipantInfo {
    userId: string;
    name?: string;
    role: 'HOST' | 'GUEST' | 'BOOKED';
    joinedAt?: string;
    profileImage?: string;
}

export interface SessionNotificationSettings {
    reminderBefore: number;
    enableEmailReminder: boolean;
    enablePushReminder: boolean;
    enableSmsReminder: boolean;
    updatedAt: string;
}

export type SessionStatsPeriod = 'week' | 'month' | 'year';

export interface SessionStatsResponseType {
    period: SessionStatsPeriod;
    totalSessions: number;
    completedSessions: number;
    cancelledSessions: number;
    upcomingSessions: number;
    totalMinutes: number;
    monthlyMinutes: number;
    averageDuration: number;
    partnersCount: number;
    streakDays: number;
    lastSessionAt?: string;
}

export interface SessionSummaryResponse {
    sessionId: number;
    notes?: string;
    durationMinutes?: number;
    rating?: number;
    highlights: string[];
    actionItems: string[];
    feedback?: {
        rating?: number;
        comment?: string;
        partnerRating?: number;
        partnerComment?: string;
        tags?: string[];
        improvementAreas?: string[];
        wouldRecommend?: boolean;
    };
    updatedAt: string;
}

export interface SessionTranscriptSegment {
    speaker: string;
    content: string;
    startTime?: string;
    endTime?: string;
}

export interface SessionTranscriptResponse {
    sessionId: number;
    language?: string;
    segments: SessionTranscriptSegment[];
    generatedAt: string;
}

export interface SessionRecordingStatus {
    sessionId: number;
    status: 'idle' | 'scheduled' | 'recording' | 'completed' | 'failed';
    recordAudio: boolean;
    recordVideo: boolean;
    recordTranscript: boolean;
    downloadUrl?: string;
    message?: string;
    updatedAt: string;
}

export interface SessionInviteResponse {
    sessionId: number;
    inviteToken: string;
    expiresAt: string;
    joinUrl: string;
}

export interface SessionHistoryResponse {
    sessions: SessionResponseType[];
    page: number;
    size: number;
    total: number;
}

export interface MatchingRequestItem {
    requestId: string;
    senderId: string;
    receiverId: string;
    message?: string;
    status: string;
    responseMessage?: string;
    respondedAt?: string;
    expiresAt?: string;
    createdAt: string;
    partner: {
        userId: string;
        name?: string;
        profileImageUrl?: string;
    };
}

export interface MatchSummary {
    matchId: string;
    partnerId: string;
    partnerName?: string;
    partnerProfileImageUrl?: string;
    matchedAt: string;
}

// Session domain types
export interface SessionCreatePayload {
    title: string;
    description?: string;
    sessionType: string;
    languageCode?: string;
    skillFocus?: string;
    levelRequirement?: string;
    scheduledAt: string; // ISO string
    durationMinutes: number;
    scheduledStartTime?: string; // ISO string - 세션 접속 가능 시작 시간
    scheduledEndTime?: string; // ISO string - 세션 접속 가능 종료 시간
    maxParticipants?: number;
    isRecurring?: boolean;
    recurrencePattern?: string;
    recurrenceEndDate?: string;
    isPublic?: boolean;
    tags?: string;
    preparationNotes?: string;
    meetingUrl?: string;
    partnerId?: string;
    topic?: string;
    language?: string;
    targetLanguage?: string;
    webRtcRoomId?: string;
    webRtcRoomType?: string;
    duration?: number;
    metadata?: Record<string, any>;
}

export interface SessionResponseType {
    sessionId: number;
    hostUserId: string;
    hostUserName?: string;
    hostUserProfileImage?: string;
    guestUserId?: string;
    guestUserName?: string;
    guestUserProfileImage?: string;
    title: string;
    description?: string;
    sessionType: string;
    languageCode?: string;
    skillFocus?: string;
    levelRequirement?: string;
    scheduledAt: string;
    durationMinutes: number;
    scheduledStartTime?: string;
    scheduledEndTime?: string;
    maxParticipants?: number;
    currentParticipants: number;
    status: string;
    meetingUrl?: string;
    isRecurring: boolean;
    recurrencePattern?: string;
    recurrenceEndDate?: string;
    isPublic: boolean;
    tags?: string;
    preparationNotes?: string;
    startedAt?: string;
    endedAt?: string;
    canJoin?: boolean;
    isHost?: boolean;
    isParticipant?: boolean;
}

export interface SessionBookingResponseType {
    bookingId: number;
    sessionId: number;
    sessionTitle: string;
    sessionScheduledAt: string;
    sessionDurationMinutes: number;
    sessionLanguageCode?: string;
    hostUserId: string;
    hostUserName?: string;
    hostUserProfileImage?: string;
    status: string;
    bookingMessage?: string;
    bookedAt: string;
    cancelledAt?: string;
    cancellationReason?: string;
    attended: boolean;
    feedbackRating?: number;
    feedbackComment?: string;
    reminderSent: boolean;
    canCancel: boolean;
}

export interface SessionCalendarResponse {
    events: Array<{
        sessionId: number;
        title: string;
        description?: string;
        startTime: string;
        endTime: string;
        eventType: string;
        status: string;
        isHost: boolean;
        color?: string;
    }>;
    availableSlots: Array<{
        startTime: string;
        endTime: string;
        isAvailable: boolean;
    }>;
}

// Notification domain types
export interface NotificationRecord {
    userId: string;
    notificationId: number;
    type: string;
    title: string;
    content: string;
    actionUrl?: string;
    actionData?: Record<string, any> | null;
    imageUrl?: string;
    iconUrl?: string;
    status: string;
    priority: number;
    category?: string;
    scheduledAt?: string;
    sentAt?: string;
    readAt?: string;
    expiresAt?: string;
    createdAt: string;
    isPersistent: boolean;
    senderUserId?: string;
    templateId?: string;
    deliveryChannels?: string;
    pushSent: boolean;
    emailSent: boolean;
    smsSent: boolean;
    expired?: boolean;
    highPriority?: boolean;
    scheduleMetadata?: Record<string, any> | null;
}

export interface NotificationListItem {
    id: number;
    type: string;
    category?: string;
    title: string;
    message: string;
    content: string;
    isRead: boolean;
    status: string;
    priority: number;
    createdAt: string;
    readAt?: string;
    scheduledAt?: string;
    expiresAt?: string;
    clickUrl?: string;
    data?: Record<string, any>;
    imageUrl?: string;
    iconUrl?: string;
    highPriority?: boolean;
    expired?: boolean;
    scheduleMetadata?: Record<string, any> | null;
}

export interface NotificationPreferenceSettings {
    notificationsEnabled: boolean;
    pushEnabled: boolean;
    emailEnabled: boolean;
    smsEnabled: boolean;
    sessionNotifications: boolean;
    sessionReminders: boolean;
    matchingNotifications: boolean;
    chatNotifications: boolean;
    levelTestNotifications: boolean;
    systemNotifications: boolean;
    marketingNotifications: boolean;
    quietHoursEnabled: boolean;
    quietHoursStart?: string;
    quietHoursEnd?: string;
    timezone?: string;
    notificationLanguage?: string;
    digestEnabled: boolean;
    digestFrequency?: string;
    digestTime?: string;
    subscriptionTopics?: string[];
}

export interface NotificationStats {
    total: number;
    unread: number;
    read: number;
    today: number;
    categories: Record<string, number>;
}

// Group session domain types
export interface GroupSessionRecord {
    id: string;
    title: string;
    description?: string;
    hostUserId: string;
    hostUserName?: string;
    hostProfileImage?: string;
    topicCategory?: string;
    targetLanguage?: string;
    languageLevel?: string;
    maxParticipants?: number;
    currentParticipants: number;
    scheduledAt?: string;
    sessionDuration?: number;
    status?: string;
    roomId?: string;
    sessionTags?: string[];
    isPublic?: boolean;
    joinCode?: string;
    startedAt?: string;
    endedAt?: string;
    ratingAverage?: number;
    ratingCount?: number;
    participants?: GroupSessionParticipant[];
    canJoin?: boolean;
    joinMessage?: string;
}

export interface GroupSessionParticipant {
    userId: string;
    userName?: string;
    profileImage?: string;
    status?: string;
    joinedAt?: string;
    isMuted?: boolean;
    isVideoEnabled?: boolean;
}

export interface GroupSessionListItem {
    id: string;
    title: string;
    description?: string;
    hostUserName?: string;
    hostProfileImage?: string;
    topicCategory?: string;
    targetLanguage?: string;
    languageLevel?: string;
    maxParticipants?: number;
    currentParticipants: number;
    scheduledAt?: string;
    sessionDuration?: number;
    status?: string;
    sessionTags?: string[];
    ratingAverage?: number;
    ratingCount?: number;
    canJoin?: boolean;
    timeUntilStart?: string;
}
