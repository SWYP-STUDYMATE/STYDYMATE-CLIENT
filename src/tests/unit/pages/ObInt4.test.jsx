import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ObInt4 from '../../../pages/ObInt/ObInt4.jsx';
import api from '../../../api';

vi.mock('../../../api', () => ({
  __esModule: true,
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock('../../../api/onboarding', async () => {
  const actual = await vi.importActual('../../../api/onboarding');
  return {
    ...actual,
    saveInterestInfo: vi.fn().mockResolvedValue({ success: true }),
  };
});

describe('ObInt4 component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
  });

  it('renders learning expectations without causing update loops', async () => {
    api.get.mockResolvedValueOnce({
      data: [
        { learningExpectationId: 1, learningExpectationName: '테스트 목표' },
        { learningExpectationId: 2, learningExpectationName: '유저 맞춤 목표' },
      ],
    });

    render(
      <MemoryRouter>
        <ObInt4 />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('테스트 목표')).toBeInTheDocument();
      expect(screen.getByText('유저 맞춤 목표')).toBeInTheDocument();
    });
  });
});
