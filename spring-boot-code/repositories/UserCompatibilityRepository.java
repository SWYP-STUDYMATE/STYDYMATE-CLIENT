package com.studymate.server.repository;

import com.studymate.server.entity.UserCompatibility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserCompatibilityRepository extends JpaRepository<UserCompatibility, Long> {

    // 사용자별 호환성 정보 조회
    Optional<UserCompatibility> findByUserId(Long userId);

    // 활성 상태인 사용자들의 호환성 정보 조회
    List<UserCompatibility> findByIsActiveTrue();

    // 언어 레벨별 호환성 사용자 조회
    List<UserCompatibility> findByTargetLanguageAndLanguageLevel(String targetLanguage, String languageLevel);

    // 시간대별 호환성 사용자 조회
    List<UserCompatibility> findByTimeZone(String timeZone);

    // 매칭 가능한 파트너 조회 (상호 언어 교환 가능한 사용자)
    @Query("SELECT uc FROM UserCompatibility uc WHERE " +
           "uc.isActive = true AND " +
           "uc.userId != :excludeUserId AND " +
           "uc.targetLanguage = :nativeLanguage AND " +
           "uc.nativeLanguage = :targetLanguage")
    List<UserCompatibility> findCompatiblePartners(@Param("excludeUserId") Long excludeUserId,
                                                   @Param("nativeLanguage") String nativeLanguage,
                                                   @Param("targetLanguage") String targetLanguage);

    // 연령대별 호환성 사용자 조회
    List<UserCompatibility> findByAgeRangeAndIsActiveTrue(String ageRange);

    // 선호 세션 시간대별 사용자 조회
    List<UserCompatibility> findByPreferredSessionTimeAndIsActiveTrue(String preferredSessionTime);

    // 특정 언어 조합의 활성 사용자 수 조회
    @Query("SELECT COUNT(uc) FROM UserCompatibility uc WHERE " +
           "uc.isActive = true AND " +
           "((uc.nativeLanguage = :language1 AND uc.targetLanguage = :language2) OR " +
           "(uc.nativeLanguage = :language2 AND uc.targetLanguage = :language1))")
    long countActiveUsersByLanguagePair(@Param("language1") String language1, 
                                       @Param("language2") String language2);

    // 매칭 비활성화된 사용자들 조회
    List<UserCompatibility> findByIsActiveFalse();

    // 복합 조건으로 호환 파트너 검색
    @Query("SELECT uc FROM UserCompatibility uc WHERE " +
           "uc.isActive = true AND " +
           "uc.userId != :excludeUserId AND " +
           "uc.targetLanguage = :nativeLanguage AND " +
           "uc.nativeLanguage = :targetLanguage AND " +
           "(:ageRange IS NULL OR uc.ageRange = :ageRange) AND " +
           "(:timeZone IS NULL OR uc.timeZone = :timeZone)")
    List<UserCompatibility> findCompatiblePartnersWithFilters(
            @Param("excludeUserId") Long excludeUserId,
            @Param("nativeLanguage") String nativeLanguage,
            @Param("targetLanguage") String targetLanguage,
            @Param("ageRange") String ageRange,
            @Param("timeZone") String timeZone);
}