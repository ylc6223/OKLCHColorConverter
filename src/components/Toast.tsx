import React, { useEffect, useState } from 'react';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose?: () => void;
  show: boolean;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
  duration = 3000,
  onClose,
  show
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      // 延迟一帧开始动画，确保元素已渲染
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });

      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  const handleClose = () => {
    setIsAnimating(false);
    // 等待动画完成后隐藏元素
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 500);
  };

  if (!isVisible) return null;

  const getIconGradient = () => {
    switch (type) {
      case 'success':
        return isHovered
          ? 'linear-gradient(135deg, #10b981, #059669)'
          : 'linear-gradient(135deg, #e5e7eb, #10b981)';
      case 'error':
        return isHovered
          ? 'linear-gradient(135deg, #ef4444, #dc2626)'
          : 'linear-gradient(135deg, #e5e7eb, #ef4444)';
      case 'info':
        return isHovered
          ? 'linear-gradient(135deg, #3b82f6, #2563eb)'
          : 'linear-gradient(135deg, #e5e7eb, #3b82f6)';
      default:
        return isHovered
          ? 'linear-gradient(135deg, #6b7280, #374151)'
          : 'linear-gradient(135deg, #e5e7eb, #6b7280)';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
    }
  };

  const getTypeTitle = () => {
    switch (type) {
      case 'success':
        return '成功';
      case 'error':
        return '错误';
      case 'info':
        return '信息';
      default:
        return '通知';
    }
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div className="flex items-start justify-center pt-16 px-4">
        <div
          className={`
            pointer-events-auto
            w-full max-w-[290px] h-[70px]
            cursor-pointer
            bg-white/95 dark:bg-gray-800/95
            border border-gray-200/50 dark:border-gray-700/50
            shadow-lg dark:shadow-gray-900/20
            transition-all duration-500 ease-in-out
            ${isAnimating
              ? 'opacity-100 transform translate-y-0 scale-100'
              : 'opacity-0 transform -translate-y-2 scale-95'
            }
            ${isHovered ? 'transform scale-105' : ''}
          `}
          style={{
            borderRadius: '20px',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleClose}
        >
          <div className="flex items-center justify-start h-full">
            {/* Icon */}
            <div
              className="w-[50px] h-[50px] ml-[10px] rounded-[10px] flex items-center justify-center transition-all duration-500 ease-in-out"
              style={{
                background: getIconGradient()
              }}
            >
              {getIcon()}
            </div>

            {/* Text Content */}
            <div className="flex-1 ml-[10px] mr-[10px] text-gray-900 dark:text-gray-100 font-['Poppins',sans-serif]">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h1 className="text-[16px] font-bold leading-tight">
                    {getTypeTitle()}
                  </h1>
                  <p className="text-[12px] font-light leading-tight mt-1 text-gray-600 dark:text-gray-300">
                    {message}
                  </p>
                </div>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 ml-2">
                  刚刚
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toast;
