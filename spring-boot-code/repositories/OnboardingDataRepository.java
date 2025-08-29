package com.studymate.server.repository;

import com.studymate.server.entity.OnboardingData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OnboardingDataRepository extends JpaRepository<OnboardingData, Long> {

    // 사용자별 온보딩 데이터 조회
    Optional<OnboardingData> findByUserId(Long userId);

    // 온보딩 완료 여부로 조회
    List<OnboardingData> findByIsCompleted(Boolean isCompleted);

    // 특정 단계에 있는 사용자들 조회
    List<OnboardingData> findByCurrentStep(Integer currentStep);

    // 완료되지 않은 온보딩 데이터 조회
    List<OnboardingData> findByIsCompletedFalse();

    // 완성도 기준으로 조회
    List<OnboardingData> findByCompletionRateGreaterThanEqual(Integer completionRate);

    // 특정 기간 내에 완료된 온보딩 조회
    @Query("SELECT od FROM OnboardingData od WHERE " +
           "od.isCompleted = true AND " +
           "od.completedAt BETWEEN :startDate AND :endDate")
    List<OnboardingData> findCompletedBetweenDates(@Param("startDate") LocalDateTime startDate,
                                                   @Param("endDate") LocalDateTime endDate);

    // 특정 기간보다 오래된 미완료 온보딩 조회 (리마인더용)
    @Query("SELECT od FROM OnboardingData od WHERE " +
           "od.isCompleted = false AND " +
           "od.updatedAt < :cutoffDate")
    List<OnboardingData> findIncompleteOlderThan(@Param("cutoffDate") LocalDateTime cutoffDate);

    // 온보딩 완료율 통계
    @Query("SELECT AVG(od.completionRate) FROM OnboardingData od")
    Double getAverageCompletionRate();

    // 각 단계별 사용자 수 조회
    @Query("SELECT od.currentStep, COUNT(od) FROM OnboardingData od WHERE " +
           "od.isCompleted = false GROUP BY od.currentStep")
    List<Object[]> countUsersByStep();

    // 온보딩 완료 여부 확인
    boolean existsByUserIdAndIsCompletedTrue(Long userId);

    // 특정 완성도 이하인 사용자들 조회
    @Query("SELECT od FROM OnboardingData od WHERE " +
           "od.isCompleted = false AND od.completionRate < :minCompletionRate")
    List<OnboardingData> findIncompleteWithLowProgress(@Param("minCompletionRate") Integer minCompletionRate);

    // 최근 업데이트된 온보딩 데이터 조회
    @Query("SELECT od FROM OnboardingData od WHERE " +
           "od.updatedAt >= :recentDate ORDER BY od.updatedAt DESC")
    List<OnboardingData> findRecentlyUpdated(@Param("recentDate") LocalDateTime recentDate);
}