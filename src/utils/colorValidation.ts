// Color validation utilities

export function isValidHex(hex: string): boolean {
  return /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
}

export function normalizeHex(hex: string): string {
  // Remove # if present
  let normalized = hex.replace('#', '');
  
  // Convert 3-digit hex to 6-digit
  if (normalized.length === 3) {
    normalized = normalized.split('').map(char => char + char).join('');
  }
  
  return '#' + normalized.toLowerCase();
}

export function isValidRgb(rgb: string): boolean {
  const rgbPattern = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i;
  const match = rgb.match(rgbPattern);
  
  if (!match) return false;
  
  const [, r, g, b] = match;
  return [r, g, b].every(val => {
    const num = parseInt(val);
    return num >= 0 && num <= 255;
  });
}

export function isValidHsl(hsl: string): boolean {
  const hslPattern = /^hsl\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)$/i;
  const match = hsl.match(hslPattern);
  
  if (!match) return false;
  
  const [, h, s, l] = match;
  const hNum = parseInt(h);
  const sNum = parseInt(s);
  const lNum = parseInt(l);
  
  return hNum >= 0 && hNum <= 360 && sNum >= 0 && sNum <= 100 && lNum >= 0 && lNum <= 100;
}

export function parseColorInput(input: string): string | null {
  const trimmed = input.trim();
  
  // Check if it's a valid hex color
  if (isValidHex(trimmed)) {
    return normalizeHex(trimmed);
  }
  
  // Check if it's RGB format
  if (isValidRgb(trimmed)) {
    const rgbPattern = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i;
    const match = trimmed.match(rgbPattern);
    if (match) {
      const [, r, g, b] = match;
      const toHex = (n: number) => n.toString(16).padStart(2, '0');
      return `#${toHex(parseInt(r))}${toHex(parseInt(g))}${toHex(parseInt(b))}`;
    }
  }
  
  // Check if it's HSL format
  if (isValidHsl(trimmed)) {
    // Convert HSL to RGB then to HEX
    const hslPattern = /^hsl\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)$/i;
    const match = trimmed.match(hslPattern);
    if (match) {
      const [, h, s, l] = match;
      const rgb = hslToRgb(parseInt(h), parseInt(s), parseInt(l));
      const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0');
      return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
    }
  }
  
  return null;
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  l /= 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  if (s === 0) {
    const gray = l * 255;
    return { r: gray, g: gray, b: gray };
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  return {
    r: hue2rgb(p, q, h + 1/3) * 255,
    g: hue2rgb(p, q, h) * 255,
    b: hue2rgb(p, q, h - 1/3) * 255
  };
}
