import { Plus, X } from 'lucide-react';

export default function HashtagList({
    items = [],
    maxDisplay = 5,
    variant = 'default',
    size = 'medium',
    onItemClick,
    onRemove,
    onAdd,
    className = '',
    itemClassName = '',
    showAddButton = false,
    editable = false
}) {
    // 크기별 스타일
    const sizeStyles = {
        small: {
            padding: 'px-2 py-0.5',
            text: 'text-[11px]',
            icon: 'w-3 h-3',
            gap: 'gap-1'
        },
        medium: {
            padding: 'px-3 py-1',
            text: 'text-[12px]',
            icon: 'w-3.5 h-3.5',
            gap: 'gap-1.5'
        },
        large: {
            padding: 'px-4 py-1.5',
            text: 'text-[14px]',
            icon: 'w-4 h-4',
            gap: 'gap-2'
        }
    };

    // 변형별 스타일
    const variantStyles = {
        default: {
            base: 'bg-[#F3F4F6] text-[#606060]',
            hover: 'hover:bg-[#E5E7EB]',
            clickable: 'cursor-pointer'
        },
        primary: {
            base: 'bg-[#4338CA]/10 text-[#4338CA]',
            hover: 'hover:bg-[#4338CA]/20',
            clickable: 'cursor-pointer'
        },
        secondary: {
            base: 'bg-[#10B981]/10 text-[#10B981]',
            hover: 'hover:bg-[#10B981]/20',
            clickable: 'cursor-pointer'
        },
        outline: {
            base: 'border border-[#E5E7EB] text-[#606060]',
            hover: 'hover:border-[#D1D5DB] hover:bg-[#F9FAFB]',
            clickable: 'cursor-pointer'
        }
    };

    const currentSize = sizeStyles[size] || sizeStyles.medium;
    const currentVariant = variantStyles[variant] || variantStyles.default;

    const displayItems = items.slice(0, maxDisplay);
    const remainingCount = items.length - maxDisplay;

    const handleItemClick = (item, index) => {
        if (onItemClick && !editable) {
            onItemClick(item, index);
        }
    };

    const handleRemove = (e, item, index) => {
        e.stopPropagation();
        if (onRemove) {
            onRemove(item, index);
        }
    };

    return (
        <div className={`flex flex-wrap ${currentSize.gap} ${className}`}>
            {/* 해시태그 아이템 */}
            {displayItems.map((item, index) => {
                const isClickable = (onItemClick && !editable) || editable;

                return (
                    <span
                        key={index}
                        onClick={() => handleItemClick(item, index)}
                        className={`
              inline-flex items-center ${currentSize.gap} ${currentSize.padding} 
              rounded-full ${currentSize.text} transition-all duration-200
              ${currentVariant.base} 
              ${isClickable ? `${currentVariant.hover} ${currentVariant.clickable}` : ''}
              ${itemClassName}
            `}
                    >
                        <span>#{typeof item === 'string' ? item : item.name || item.label}</span>

                        {/* 제거 버튼 (편집 모드) */}
                        {editable && onRemove && (
                            <button
                                onClick={(e) => handleRemove(e, item, index)}
                                className="ml-1 hover:text-red-600 transition-colors"
                            >
                                <X className={currentSize.icon} />
                            </button>
                        )}
                    </span>
                );
            })}

            {/* 남은 개수 표시 */}
            {remainingCount > 0 && (
                <span
                    className={`
            inline-flex items-center ${currentSize.padding} 
            ${currentSize.text} text-[#9CA3AF]
          `}
                >
                    +{remainingCount}
                </span>
            )}

            {/* 추가 버튼 */}
            {showAddButton && onAdd && (
                <button
                    onClick={onAdd}
                    className={`
            inline-flex items-center ${currentSize.gap} ${currentSize.padding} 
            rounded-full ${currentSize.text} transition-all duration-200
            border border-dashed border-[#D1D5DB] text-[#9CA3AF]
            hover:border-[#4338CA] hover:text-[#4338CA] hover:bg-[#4338CA]/5
          `}
                >
                    <Plus className={currentSize.icon} />
                    <span>추가</span>
                </button>
            )}
        </div>
    );
}