import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SessionScheduleList from '../../../components/SessionScheduleList.jsx';

describe('SessionScheduleList', () => {
  const defaultDate = new Date('2025-09-01T00:00:00Z');

  it('renders empty state and triggers create callback', () => {
    const props = {
      sessions: [],
      currentMonthDate: defaultDate,
      isLoading: false,
      error: null,
      onRetry: vi.fn(),
      onCreateSession: vi.fn(),
    };

    render(<SessionScheduleList {...props} />);

    expect(screen.getByText('이번 달 예정된 세션이 없습니다.')).toBeInTheDocument();

    fireEvent.click(screen.getByText('세션 만들기'));
    expect(props.onCreateSession).toHaveBeenCalledTimes(1);
  });

  it('renders session details with participant and language labels', () => {
    const sessionStart = new Date('2025-09-18T10:00:00Z');
    const sessionEnd = new Date('2025-09-18T10:30:00Z');

    render(
      <SessionScheduleList
        sessions={[{
          id: 42,
          title: 'Mock Speaking Session',
          start: sessionStart,
          end: sessionEnd,
          status: 'SCHEDULED',
          isHost: true,
          participantNames: ['Alice', 'Bob'],
          currentParticipants: 2,
          languageCode: 'en',
          durationMinutes: 30,
        }]}
        currentMonthDate={defaultDate}
        isLoading={false}
        error={null}
        onRetry={vi.fn()}
        onCreateSession={vi.fn()}
      />
    );

    expect(screen.getByText('Mock Speaking Session')).toBeInTheDocument();
    expect(screen.getByText('[2명] Alice, Bob')).toBeInTheDocument();
    expect(screen.getByText('영어')).toBeInTheDocument();
    expect(screen.getByText('30분 세션')).toBeInTheDocument();
  });

  it('shows retry UI on error', () => {
    const props = {
      sessions: [],
      currentMonthDate: defaultDate,
      isLoading: false,
      error: new Error('Network error'),
      onRetry: vi.fn(),
      onCreateSession: vi.fn(),
    };

    render(
      <SessionScheduleList {...props} />
    );

    expect(screen.getByText('세션 정보를 불러오지 못했습니다.')).toBeInTheDocument();

    fireEvent.click(screen.getByText('다시 시도'));
    expect(props.onRetry).toHaveBeenCalledTimes(1);
  });
});
