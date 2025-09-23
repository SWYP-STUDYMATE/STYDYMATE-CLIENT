import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import WeeklyActivityChart from '../../../components/profile/WeeklyActivityChart';

describe('WeeklyActivityChart', () => {
  const weeklyData = [
    { day: '월', minutes: 60, sessions: 2 },
    { day: '화', minutes: 0, sessions: 0 }
  ];

  it('renders loading skeleton when loading is true', () => {
    const { container } = render(<WeeklyActivityChart loading data={[]} />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('renders empty message when data is empty', () => {
    render(<WeeklyActivityChart data={[]} loading={false} />);
    expect(screen.getByText('최근 학습 데이터가 없습니다.')).toBeInTheDocument();
  });

  it('renders bars for provided data', () => {
    render(<WeeklyActivityChart data={weeklyData} loading={false} />);
    expect(screen.getByText((content) => content.includes('총 학습시간'))).toBeInTheDocument();
    expect(screen.getByText('월')).toBeInTheDocument();
  });
});
