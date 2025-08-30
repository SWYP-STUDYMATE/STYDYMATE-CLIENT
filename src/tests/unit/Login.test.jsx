import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../../pages/Login/Login';
import * as mockApi from '../../api/mockApi';
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';

// Mock modules
vi.mock('../../api/mockApi', () => ({
  isMockMode: vi.fn(),
  showMockModeBanner: vi.fn()
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock window.location
const mockLocation = {
  href: '',
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

// Test wrapper component
const TestWrapper = ({ children }) => {
  return <BrowserRouter>{children}</BrowserRouter>;
};

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.href = '';
    mockLocalStorage.getItem.mockReturnValue(null);
    mockApi.isMockMode.mockReturnValue(false);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('로그인 페이지가 올바르게 렌더링된다', () => {
    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    expect(screen.getByText('Language Mate에 오신 것을 환영해요!')).toBeInTheDocument();
    expect(screen.getByText('간편하게 바로 시작해 보세요')).toBeInTheDocument();
    expect(screen.getByTestId('naver-login-button')).toBeInTheDocument();
    expect(screen.getByTestId('google-login-button')).toBeInTheDocument();
    expect(screen.getByTestId('auto-login-checkbox')).toBeInTheDocument();
  });

  test('자동 로그인 체크박스가 정상적으로 동작한다', () => {
    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    const checkbox = screen.getByTestId('auto-login-checkbox');
    
    // 초기 상태는 체크되지 않음
    expect(checkbox.getAttribute('aria-pressed')).toBe('false');

    // 체크박스 클릭
    fireEvent.click(checkbox);
    expect(checkbox.getAttribute('aria-pressed')).toBe('true');

    // 다시 클릭하면 체크 해제
    fireEvent.click(checkbox);
    expect(checkbox.getAttribute('aria-pressed')).toBe('false');
  });

  test('라벨 클릭으로도 체크박스가 토글된다', () => {
    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    const checkbox = screen.getByTestId('auto-login-checkbox');
    const label = screen.getByText('자동 로그인');
    
    // 초기 상태
    expect(checkbox.getAttribute('aria-pressed')).toBe('false');

    // 라벨 클릭
    fireEvent.click(label);
    expect(checkbox.getAttribute('aria-pressed')).toBe('true');
  });

  test('네이버 로그인 버튼 클릭 시 정확한 URL로 리다이렉트한다', () => {
    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    const naverButton = screen.getByTestId('naver-login-button');
    fireEvent.click(naverButton);

    expect(mockLocation.href).toBe('https://api.languagemate.kr/api/v1/login/naver');
  });

  test('구글 로그인 버튼 클릭 시 정확한 URL로 리다이렉트한다', () => {
    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    const googleButton = screen.getByTestId('google-login-button');
    fireEvent.click(googleButton);

    expect(mockLocation.href).toBe('https://api.languagemate.kr/api/v1/login/google');
  });

  test('로그인 버튼 클릭 시 로딩 상태가 표시된다', async () => {
    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    const naverButton = screen.getByTestId('naver-login-button');
    
    // 클릭 전에는 로딩이 표시되지 않음
    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    
    fireEvent.click(naverButton);

    // 로딩 상태 확인
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    expect(screen.getByText('로그인 중...')).toBeInTheDocument();
  });

  test('로딩 중일 때 버튼이 비활성화된다', async () => {
    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    const naverButton = screen.getByTestId('naver-login-button');
    const googleButton = screen.getByTestId('google-login-button');

    fireEvent.click(naverButton);

    await waitFor(() => {
      expect(naverButton).toBeDisabled();
      expect(googleButton).toBeDisabled();
    });

    // 버튼 스타일이 로딩 상태로 변경되었는지 확인
    expect(naverButton).toHaveClass('bg-[#929292]', 'cursor-not-allowed');
    expect(googleButton).toHaveClass('bg-[#F1F3F5]', 'text-[#929292]', 'cursor-not-allowed');
  });

  test('Mock 모드일 때 자동으로 메인 페이지로 이동한다', async () => {
    mockApi.isMockMode.mockReturnValue(true);

    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(mockApi.showMockModeBanner).toHaveBeenCalled();
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('accessToken', expect.stringContaining('mock-access-token-'));
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('refreshToken', expect.stringContaining('mock-refresh-token-'));
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('mockCurrentUser', '0');
      expect(mockNavigate).toHaveBeenCalledWith('/main', { replace: true });
    });
  });

  test('기존 토큰이 있을 때 메인 페이지로 자동 이동한다', async () => {
    mockLocalStorage.getItem.mockReturnValue('existing-token');

    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/main', { replace: true });
    });
  });

  test('키보드 접근성이 올바르게 작동한다', () => {
    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    const naverButton = screen.getByTestId('naver-login-button');
    const googleButton = screen.getByTestId('google-login-button');
    const checkbox = screen.getByTestId('auto-login-checkbox');

    // tabIndex 확인
    expect(naverButton).toHaveAttribute('tabIndex', '0');
    expect(googleButton).toHaveAttribute('tabIndex', '0');

    // focus 확인
    naverButton.focus();
    expect(naverButton).toHaveFocus();

    googleButton.focus();
    expect(googleButton).toHaveFocus();

    checkbox.focus();
    expect(checkbox).toHaveFocus();
  });

  test('Enter 키로 버튼 클릭이 가능하다', () => {
    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    const naverButton = screen.getByTestId('naver-login-button');
    naverButton.focus();
    
    fireEvent.keyDown(naverButton, { key: 'Enter', code: 'Enter' });
    
    expect(mockLocation.href).toBe('https://api.languagemate.kr/api/v1/login/naver');
  });

  test('스페이스 키로 체크박스 토글이 가능하다', () => {
    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    const checkbox = screen.getByTestId('auto-login-checkbox');
    checkbox.focus();
    
    expect(checkbox.getAttribute('aria-pressed')).toBe('false');
    
    fireEvent.keyDown(checkbox, { key: ' ', code: 'Space' });
    expect(checkbox.getAttribute('aria-pressed')).toBe('true');
  });
});