import { describe, expect, it, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../../components/MainHeader', () => ({
  __esModule: true,
  default: () => <div data-testid="main-header" />,
}));

vi.mock('../../../components/chat/Sidebar', () => ({
  __esModule: true,
  default: () => <aside data-testid="sidebar" />,
}));

const mockGetUserCalendar = vi.hoisted(() =>
  vi.fn(() => Promise.resolve({ success: true, data: { events: [], availableSlots: [] } }))
);

const mockApiGet = vi.hoisted(() =>
  vi.fn(() => Promise.resolve({ data: { data: { content: [] } } }))
);

vi.mock('../../../api/session', () => ({
  __esModule: true,
  getUserCalendar: mockGetUserCalendar,
}));

vi.mock('../../../api/index.js', () => ({
  __esModule: true,
  default: {
    get: mockApiGet,
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

import Schedule from '../../../pages/Schedule/Schedule.jsx';
import useSessionStore from '../../../store/sessionStore.js';

describe('Schedule page render', () => {
  beforeEach(() => {
    useSessionStore.setState({
      sessionStats: { totalSessions: 0, totalDuration: 0, weeklyStreak: 0, lastSessionDate: null },
      sessionHistory: [],
      currentSession: null,
      upcomingSessions: [],
      sessions: [],
      calendarEvents: [],
      calendarSlots: [],
      calendarRange: null,
      calendarLoading: false,
      calendarError: null,
    });
  });

  it('triggers calendar load once on mount', async () => {
    render(
      <MemoryRouter>
        <Schedule />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockGetUserCalendar).toHaveBeenCalledTimes(1);
      expect(mockApiGet).toHaveBeenCalledTimes(1);
    });
  });
});
