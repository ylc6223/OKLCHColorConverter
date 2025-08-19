import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ColorSpace, OKLCH, LCH } from '../types';
import { oklchToLch, lchToOklch } from '../utils/colorConversion';
import { copyToClipboard } from '../utils/clipboard';

interface ColorConverterProps {
  oklch: OKLCH;
  lch: LCH;
  hex: string;
  colorSpace: ColorSpace;
  onColorSpaceChange: (colorSpace: ColorSpace) => void;
  onOklchChange: (value: string) => void;
  onLchChange: (value: string) => void;
  onHexChange: (value: string) => void;
  onToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  t: (key: string) => string;
}

const ColorConverter: React.FC<ColorConverterProps> = ({
  oklch,
  lch,
  hex,
  colorSpace,
  onColorSpaceChange,
  onOklchChange,
  onLchChange,
  onHexChange,
  onToast,
  t,
}) => {
  const [inputValue, setInputValue] = useState(hex);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const oklchString = oklch.a >= 100
    ? `oklch(${oklch.l.toFixed(2)} ${oklch.c.toFixed(2)} ${oklch.h.toFixed(0)})`
    : `oklch(${oklch.l.toFixed(2)} ${oklch.c.toFixed(2)} ${oklch.h.toFixed(0)} / ${(oklch.a / 100).toFixed(2)})`;

  const lchString = lch.a >= 100
    ? `lch(${lch.l.toFixed(0)} ${lch.c.toFixed(0)} ${lch.h.toFixed(0)})`
    : `lch(${lch.l.toFixed(0)} ${lch.c.toFixed(0)} ${lch.h.toFixed(0)} / ${(lch.a / 100).toFixed(2)})`;

  // 同步外部 hex 值到内部输入值
  useEffect(() => {
    setInputValue(hex);
  }, [hex]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, []);

  // 输入验证和格式化
  const validateAndFormatInput = (input: string): string => {
    // 移除所有非十六进制字符，保留 #
    let cleaned = input.replace(/[^#0-9a-fA-F]/g, '');

    // 确保以 # 开头
    if (!cleaned.startsWith('#')) {
      cleaned = '#' + cleaned.replace('#', '');
    }

    // 限制长度（最多 9 个字符：# + 8位hex，支持 alpha）
    if (cleaned.length > 9) {
      cleaned = cleaned.substring(0, 9);
    }

    return cleaned;
  };

  // 防抖处理输入变化
  const handleInputChange = useCallback((value: string) => {
    console.log('🔵 [ColorConverter] handleInputChange called with:', value);

    // 验证和格式化输入
    const formattedValue = validateAndFormatInput(value);
    console.log('🔵 [ColorConverter] Formatted input:', formattedValue);

    setInputValue(formattedValue);

    // 清除之前的定时器
    if (debounceTimerRef.current) {
      console.log('🟡 [ColorConverter] Clearing previous timer:', debounceTimerRef.current);
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    // 只有当输入是完整的有效 hex 值时才设置新的防抖定时器（支持 3、6、8 位）
    const isValidComplete = /^#[0-9a-fA-F]{3}$|^#[0-9a-fA-F]{6}$|^#[0-9a-fA-F]{8}$/.test(formattedValue);

    if (!isValidComplete) {
      console.log('🟡 [ColorConverter] Incomplete hex, not setting new timer');
      return;
    }

    // 设置新的防抖定时器
    debounceTimerRef.current = setTimeout(() => {
      console.log('🟢 [ColorConverter] Debounce timer executed, calling onHexChange with:', formattedValue);
      onHexChange(formattedValue);
      debounceTimerRef.current = null; // 清除引用
    }, 500); // 500ms 防抖延迟

    console.log('🟡 [ColorConverter] New timer created:', debounceTimerRef.current);
  }, [onHexChange]);

  // 复制到剪贴板的处理函数
  const handleCopy = async (text: string, label: string) => {
    try {
      const result = await copyToClipboard(text);
      if (result.success) {
        onToast(`已复制 ${label} 到剪贴板`, 'success');
      } else {
        onToast(`复制失败: ${result.error}`, 'error');
      }
    } catch (error) {
      onToast('复制失败', 'error');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => handleCopy(colorSpace === 'OKLCH' ? oklchString : lchString, colorSpace)}
              className="w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center text-xs font-mono hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              title={`复制 ${colorSpace} 值`}
            >
              📋
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-300 font-mono">
              {colorSpace === 'OKLCH' ? oklchString : lchString}
            </span>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => handleCopy(hex, 'HEX')}
              className="w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center text-xs font-mono hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              title="复制 HEX 值"
            >
              📋
            </button>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
              placeholder="#a9a254"
            />
          </div>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400">
          {colorSpace === 'OKLCH' ? t('pasteHex') : t('pasteLch')}
        </div>

        <div className="flex gap-4 pt-4 border-t border-gray-200">
          <button 
            onClick={() => onColorSpaceChange('OKLCH')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              colorSpace === 'OKLCH' 
                ? 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            OKLCH
          </button>
          <button 
            onClick={() => onColorSpaceChange('LCH')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              colorSpace === 'LCH' 
                ? 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            LCH
          </button>
        </div>

        <div className="hidden text-xs text-gray-500 dark:text-gray-400 leading-relaxed whitespace-pre-line">
          {t('evilMartians')}
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-500 dark:bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
            ?
          </div>
          <a href="https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl" className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 flex items-center gap-1 transition-colors">
            {t('whyOklch')}
            <span className="text-xs">↗</span>
          </a>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black dark:bg-gray-900 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </div>
          <a href="https://github.com/ylc6223/OKLCHColorConverter" className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 flex items-center gap-1 transition-colors">
            {t('github')}
            <span className="text-xs">↗</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ColorConverter;
