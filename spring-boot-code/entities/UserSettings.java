package com.studymate.server.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.Builder;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_settings")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    // 언어 설정
    @Column(name = "app_language", nullable = false)
    private String appLanguage = "ko"; // 앱 언어

    @Column(name = "learning_language_level", columnDefinition = "JSON")
    private String learningLanguageLevel; // 학습 언어별 레벨 {"en": "B1", "ja": "A2"}

    // 알림 설정
    @Column(name = "email_notifications", nullable = false)
    private Boolean emailNotifications = true;

    @Column(name = "push_notifications", nullable = false)
    private Boolean pushNotifications = true;

    @Column(name = "matching_notifications", nullable = false)
    private Boolean matchingNotifications = true;

    @Column(name = "session_reminders", nullable = false)
    private Boolean sessionReminders = true;

    @Column(name = "message_notifications", nullable = false)
    private Boolean messageNotifications = true;

    // 프라이버시 설정
    @Column(name = "profile_visibility", nullable = false)
    private String profileVisibility = "PUBLIC"; // PUBLIC, FRIENDS_ONLY, PRIVATE

    @Column(name = "show_online_status", nullable = false)
    private Boolean showOnlineStatus = true;

    @Column(name = "allow_friend_requests", nullable = false)
    private Boolean allowFriendRequests = true;

    @Column(name = "allow_direct_messages", nullable = false)
    private Boolean allowDirectMessages = true;

    // 매칭 설정
    @Column(name = "auto_matching", nullable = false)
    private Boolean autoMatching = false;

    @Column(name = "preferred_session_length")
    private Integer preferredSessionLength = 30; // 분 단위

    @Column(name = "preferred_session_type")
    private String preferredSessionType = "VIDEO"; // VIDEO, AUDIO, BOTH

    @Column(name = "max_partners_per_week")
    private Integer maxPartnersPerWeek = 5;

    // 학습 설정
    @Column(name = "daily_goal_minutes")
    private Integer dailyGoalMinutes = 30; // 일일 학습 목표 (분)

    @Column(name = "weekly_goal_sessions")
    private Integer weeklyGoalSessions = 3; // 주간 세션 목표

    @Column(name = "difficulty_preference")
    private String difficultyPreference = "ADAPTIVE"; // EASY, MEDIUM, HARD, ADAPTIVE

    // 접근성 설정
    @Column(name = "font_size")
    private String fontSize = "MEDIUM"; // SMALL, MEDIUM, LARGE

    @Column(name = "dark_mode", nullable = false)
    private Boolean darkMode = false;

    @Column(name = "high_contrast", nullable = false)
    private Boolean highContrast = false;

    @Column(name = "reduced_motion", nullable = false)
    private Boolean reducedMotion = false;

    // 데이터 설정
    @Column(name = "data_retention_days")
    private Integer dataRetentionDays = 90; // 데이터 보관 기간

    @Column(name = "session_recording_enabled", nullable = false)
    private Boolean sessionRecordingEnabled = false;

    @Column(name = "analytics_enabled", nullable = false)
    private Boolean analyticsEnabled = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // 알림 설정 일괄 업데이트
    public void updateNotificationSettings(boolean email, boolean push, boolean matching, boolean session, boolean message) {
        this.emailNotifications = email;
        this.pushNotifications = push;
        this.matchingNotifications = matching;
        this.sessionReminders = session;
        this.messageNotifications = message;
    }

    // 프라이버시 설정 업데이트
    public void updatePrivacySettings(String visibility, boolean showOnline, boolean allowRequests, boolean allowMessages) {
        this.profileVisibility = visibility;
        this.showOnlineStatus = showOnline;
        this.allowFriendRequests = allowRequests;
        this.allowDirectMessages = allowMessages;
    }

    // 학습 목표 설정
    public void updateLearningGoals(int dailyMinutes, int weeklySessions, String difficulty) {
        this.dailyGoalMinutes = dailyMinutes;
        this.weeklyGoalSessions = weeklySessions;
        this.difficultyPreference = difficulty;
    }

    // 접근성 설정 업데이트
    public void updateAccessibilitySettings(String fontSize, boolean darkMode, boolean highContrast, boolean reducedMotion) {
        this.fontSize = fontSize;
        this.darkMode = darkMode;
        this.highContrast = highContrast;
        this.reducedMotion = reducedMotion;
    }
}