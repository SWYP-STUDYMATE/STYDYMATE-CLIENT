import { useEffect } from 'react';
import ErrorBoundary from './ErrorBoundary';
import CommonButton from './CommonButton';
import { getUserFriendlyMessage } from '../utils/errorHandler';

export const withErrorBoundary = (Component, fallback) => {
  return function WithErrorBoundaryComponent(props) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
};

function ApiFallback({ error, retry, onError }) {
  useEffect(() => {
    if (onError && error) {
      onError(error);
    }
  }, [error, onError]);

  return (
    <div className="p-6 text-center">
      <p className="text-[#EA4335] mb-4">
        {getUserFriendlyMessage(error)}
      </p>
      <CommonButton onClick={retry} variant="primary">
        다시 시도
      </CommonButton>
    </div>
  );
}

export function ApiErrorBoundary({ children, onError }) {
  return (
    <ErrorBoundary
      fallback={({ error, retry }) => (
        <ApiFallback error={error} retry={retry} onError={onError} />
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

