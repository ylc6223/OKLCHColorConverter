/**
 * 复制文本到剪贴板的工具函数
 * 支持现代浏览器的 Clipboard API 和旧版浏览器的 fallback 方法
 */

export interface CopyResult {
  success: boolean;
  error?: string;
}

/**
 * 复制文本到剪贴板
 * @param text 要复制的文本
 * @returns Promise<CopyResult> 复制结果
 */
export async function copyToClipboard(text: string): Promise<CopyResult> {
  // 检查是否支持现代 Clipboard API
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return { success: true };
    } catch (error) {
      console.warn('Clipboard API failed, falling back to legacy method:', error);
      // 如果 Clipboard API 失败，尝试 fallback 方法
      return fallbackCopyToClipboard(text);
    }
  }

  // 使用 fallback 方法
  return fallbackCopyToClipboard(text);
}

/**
 * 旧版浏览器的 fallback 复制方法
 * @param text 要复制的文本
 * @returns CopyResult 复制结果
 */
function fallbackCopyToClipboard(text: string): CopyResult {
  try {
    // 创建一个临时的 textarea 元素
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // 设置样式使其不可见
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.style.opacity = '0';
    textArea.style.pointerEvents = 'none';
    textArea.setAttribute('readonly', '');
    textArea.setAttribute('tabindex', '-1');
    
    // 添加到 DOM
    document.body.appendChild(textArea);
    
    // 选择文本
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, text.length);
    
    // 执行复制命令
    const successful = document.execCommand('copy');
    
    // 清理
    document.body.removeChild(textArea);
    
    if (successful) {
      return { success: true };
    } else {
      return { 
        success: false, 
        error: 'execCommand("copy") failed' 
      };
    }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * 检查是否支持剪贴板功能
 * @returns boolean 是否支持
 */
export function isClipboardSupported(): boolean {
  return !!(navigator.clipboard || document.execCommand);
}
