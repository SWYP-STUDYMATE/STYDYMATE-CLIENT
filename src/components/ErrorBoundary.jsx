import React from 'react';
import { getUserFriendlyMessage, reportError } from '../utils/errorHandler';
import CommonButton from './CommonButton';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] captured error', error, errorInfo);

    try {
      const matches = Array.from(
        errorInfo?.componentStack?.matchAll(/index\.js:(\d+):(\d+)/g) || []
      ).map(([, line, column]) => ({ line: Number(line), column: Number(column) }));
      if (matches.length > 0) {
        console.warn('[ErrorBoundary] mapped stack positions', JSON.stringify(matches));
      }
    } catch (parseError) {
      console.warn('[ErrorBoundary] failed to parse component stack', parseError);
    }

    this.setState({
      error,
      errorInfo
    });

    // 에러 리포팅
    reportError(error, {
      componentStack: errorInfo.componentStack,
      props: this.props,
      timestamp: new Date().toISOString()
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback } = this.props;

      if (Fallback === null) {
        return null;
      }

      if (Fallback) {
        return <Fallback error={this.state.error} retry={this.handleRetry} />;
      }

      const userMessage = getUserFriendlyMessage(this.state.error);

      return (
        <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-6">
          <div className="max-w-md w-full bg-white rounded-[20px] p-8 text-center border border-[#E7E7E7]">
            <div className="mb-6">
              <div className="w-20 h-20 bg-[#FFF4F4] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-[#EA4335]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>

              <h2 className="text-[20px] font-bold text-[#111111] mb-2">
                문제가 발생했습니다
              </h2>

              <p className="text-[16px] text-[#606060] leading-[24px]">
                {userMessage}
              </p>
            </div>

            <div className="space-y-3">
              <CommonButton
                onClick={this.handleRetry}
                variant="primary"
                className="w-full"
              >
                다시 시도
              </CommonButton>

              <CommonButton
                onClick={this.handleGoHome}
                variant="secondary"
                className="w-full"
              >
                홈으로 이동
              </CommonButton>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-sm text-[#929292] cursor-pointer mb-2">
                  개발자 정보 (개발 환경에서만 표시)
                </summary>
                <pre className="text-xs bg-[#F8F9FA] p-3 rounded border overflow-auto max-h-32">
                  {this.state.error && this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
