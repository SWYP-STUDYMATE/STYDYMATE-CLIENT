import React from "react";
import AchievementBadges from "./AchievementBadges";

export default function MainAchievementsSection({
  achievements,
  stats,
  loading,
  error,
  onRefresh,
}) {
  return (
    <AchievementBadges
      achievements={achievements}
      loading={loading}
      error={error}
      stats={stats}
      onRefresh={onRefresh}
    />
  );
}
