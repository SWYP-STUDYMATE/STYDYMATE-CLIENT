import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// 로딩 컴포넌트
export const LoadingFallback = () => (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="text-center">
            <Loader2 className="w-12 h-12 text-[#00C471] animate-spin mx-auto mb-4" />
            <p className="text-[#606060]">로딩 중...</p>
        </div>
    </div>
);

// 레이지 로드 래퍼
export const lazyLoad = (importFunc) => {
    const LazyComponent = lazy(importFunc);

    return (props) => (
        <Suspense fallback={<LoadingFallback />}>
            <LazyComponent {...props} />
        </Suspense>
    );
};