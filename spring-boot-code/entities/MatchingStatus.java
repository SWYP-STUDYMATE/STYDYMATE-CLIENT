package com.studymate.server.entity;

public enum MatchingStatus {
    PENDING("매칭 요청 대기중"),
    ACCEPTED("매칭 수락됨"),
    REJECTED("매칭 거절됨"), 
    CANCELLED("매칭 취소됨"),
    EXPIRED("매칭 요청 만료됨");

    private final String description;

    MatchingStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}