import { Clock } from 'lucide-react';

export default function UserStatusIndicator({
    isOnline = false,
    lastActive = null,
    size = 'medium',
    showText = true,
    className = ''
}) {
    // 크기별 스타일
    const sizeStyles = {
        small: {
            indicator: 'w-2 h-2',
            text: 'text-[11px]',
            icon: 'w-3 h-3',
            gap: 'gap-1'
        },
        medium: {
            indicator: 'w-3 h-3',
            text: 'text-[12px]',
            icon: 'w-3.5 h-3.5',
            gap: 'gap-1.5'
        },
        large: {
            indicator: 'w-4 h-4',
            text: 'text-[14px]',
            icon: 'w-4 h-4',
            gap: 'gap-2'
        }
    };

    const currentSize = sizeStyles[size] || sizeStyles.medium;

    // 온라인 상태에 따른 색상
    const statusColor = isOnline ? 'bg-green-500' : 'bg-gray-300';
    const textColor = isOnline ? 'text-green-600' : 'text-[#9CA3AF]';

    // 마지막 활동 시간 표시 포맷
    const formatLastActive = (time) => {
        if (!time) return '';

        // 실제로는 시간 차이를 계산해야 함
        // 여기서는 간단히 문자열을 그대로 반환
        return time;
    };

    // 텍스트 없이 인디케이터만 표시
    if (!showText) {
        return (
            <div
                className={`${currentSize.indicator} ${statusColor} rounded-full ${className}`}
                title={isOnline ? 'Active Now' : `Last active: ${lastActive || 'Unknown'}`}
            />
        );
    }

    // 온라인 상태
    if (isOnline) {
        return (
            <div className={`flex items-center ${currentSize.gap} ${className}`}>
                <div className={`${currentSize.indicator} ${statusColor} rounded-full animate-pulse`} />
                <span className={`${currentSize.text} ${textColor} font-medium`}>
                    Active Now
                </span>
            </div>
        );
    }

    // 오프라인 상태
    return (
        <div className={`flex items-center ${currentSize.gap} ${className}`}>
            {lastActive ? (
                <>
                    <Clock className={`${currentSize.icon} ${textColor}`} />
                    <span className={`${currentSize.text} ${textColor}`}>
                        {formatLastActive(lastActive)}
                    </span>
                </>
            ) : (
                <>
                    <div className={`${currentSize.indicator} ${statusColor} rounded-full`} />
                    <span className={`${currentSize.text} ${textColor}`}>
                        Offline
                    </span>
                </>
            )}
        </div>
    );
}