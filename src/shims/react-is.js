// // src/shims/react-is.js
import * as Real from 'react-is';

// react-is가 원래 내보내는 것들 재노출
export const {
  isElement,
  isValidElementType,
  typeOf,
  // 타입 토큰들
  Fragment,
  Portal,
  StrictMode,
  Profiler,
  Provider,
  Context,
  ForwardRef,
  Suspense,
  Memo,
  Lazy,
} = Real;

// 호환용: 일부 라이브러리가 잘못 기대하는 API
export const isFragment = (value) => {
  try {
    return Real.typeOf(value) === Real.Fragment;
  } catch {
    return false;
  }
};

// default export까지 기대하는 코드 대비
export default {
  ...Real,
  isFragment,
};
