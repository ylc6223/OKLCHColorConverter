export type ColorSpace = 'OKLCH' | 'LCH';
export type Theme = 'light' | 'dark' | 'system';
export type Language = 'en' | 'zh';

export interface OKLCH {
  l: number; // 0-1
  c: number; // 0-0.4
  h: number; // 0-360
  a: number; // 0-100
}

export interface LCH {
  l: number; // 0-100
  c: number; // 0-150
  h: number; // 0-360
  a: number; // 0-100
}

export interface RGB {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}