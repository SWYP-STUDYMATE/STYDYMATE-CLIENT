import { render, screen } from '@testing-library/react';
import AchievementBadges from '../../../components/AchievementBadges';

describe('AchievementBadges', () => {
  const baseAchievement = {
    id: 1,
    isCompleted: true,
    completedAt: '2025-09-10T09:00:00Z',
    progressPercentage: 100,
    currentProgress: 10,
    targetValue: 10,
    achievement: {
      id: 10,
      title: '첫 세션 완료',
      description: '첫 번째 세션을 마쳤습니다',
      category: 'SESSION',
      xpReward: 50,
      badgeIconUrl: '',
      badgeColor: '#00C471'
    }
  };

  it('renders loading skeleton when loading', () => {
    const { container } = render(<AchievementBadges loading achievements={[]} />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('renders achievements when provided', () => {
    render(<AchievementBadges achievements={[baseAchievement]} stats={{ completedAchievements: 1, totalAchievements: 5 }} />);
    expect(screen.getByText('첫 세션 완료')).toBeInTheDocument();
    expect(screen.getByText('완료 1개 · 총 5개')).toBeInTheDocument();
  });

  it('shows empty message when no achievements', () => {
    render(<AchievementBadges achievements={[]} />);
    expect(screen.getByText('아직 획득한 배지가 없습니다. 첫 성취를 달성해보세요!')).toBeInTheDocument();
  });
});
