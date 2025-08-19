// OKLCH to RGB conversion utilities
import { OKLCH, LCH, RGB } from '../types';

// Convert OKLCH to RGB (using HSL as intermediate)
export function oklchToRgb(oklch: OKLCH): RGB {
  const { l, c, h } = oklch;

  // For grayscale (c ≈ 0), return gray value
  if (c < 0.001) {
    const gray = Math.round(l * 255);
    return { r: gray, g: gray, b: gray };
  }

  // Convert OKLCH to HSL-like values
  const hslL = l; // Lightness is similar
  const hslS = c / 0.4; // Scale chroma back to saturation range
  const hslH = h; // Hue is the same

  // Convert HSL to RGB
  const hNorm = hslH / 60;
  const chroma = (1 - Math.abs(2 * hslL - 1)) * hslS;
  const x = chroma * (1 - Math.abs((hNorm % 2) - 1));
  const m = hslL - chroma / 2;

  let r = 0, g = 0, b = 0;

  if (hNorm >= 0 && hNorm < 1) {
    r = chroma; g = x; b = 0;
  } else if (hNorm >= 1 && hNorm < 2) {
    r = x; g = chroma; b = 0;
  } else if (hNorm >= 2 && hNorm < 3) {
    r = 0; g = chroma; b = x;
  } else if (hNorm >= 3 && hNorm < 4) {
    r = 0; g = x; b = chroma;
  } else if (hNorm >= 4 && hNorm < 5) {
    r = x; g = 0; b = chroma;
  } else if (hNorm >= 5 && hNorm < 6) {
    r = chroma; g = 0; b = x;
  }

  return {
    r: Math.max(0, Math.min(255, Math.round((r + m) * 255))),
    g: Math.max(0, Math.min(255, Math.round((g + m) * 255))),
    b: Math.max(0, Math.min(255, Math.round((b + m) * 255)))
  };
}

// Convert RGB to HEX
export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0');
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

// Convert HEX to RGB (supports 3, 6, and 8 digit hex)
export function hexToRgb(hex: string): RGB | null {
  // Remove # if present
  const cleanHex = hex.replace('#', '');

  let rgb: RGB | null = null;

  // Handle 8-digit hex with alpha (e.g., "ff0000ff" or "#ff0000ff")
  if (/^[a-f\d]{8}$/i.test(cleanHex)) {
    rgb = {
      r: parseInt(cleanHex.substr(0, 2), 16),
      g: parseInt(cleanHex.substr(2, 2), 16),
      b: parseInt(cleanHex.substr(4, 2), 16)
    };
    // Note: We ignore the alpha part for RGB conversion
  }
  // Handle 6-digit hex (e.g., "ff0000" or "#ff0000")
  else if (/^[a-f\d]{6}$/i.test(cleanHex)) {
    rgb = {
      r: parseInt(cleanHex.substr(0, 2), 16),
      g: parseInt(cleanHex.substr(2, 2), 16),
      b: parseInt(cleanHex.substr(4, 2), 16)
    };
  }
  // Handle 3-digit hex (e.g., "f00" or "#f00")
  else if (/^[a-f\d]{3}$/i.test(cleanHex)) {
    rgb = {
      r: parseInt(cleanHex[0] + cleanHex[0], 16),
      g: parseInt(cleanHex[1] + cleanHex[1], 16),
      b: parseInt(cleanHex[2] + cleanHex[2], 16)
    };
  }

  return rgb;
}

// Simple RGB to OKLCH conversion (using HSL as intermediate)
export function rgbToOklch(rgb: RGB): OKLCH {
  const { r, g, b } = rgb;

  // Convert RGB to HSL first
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  // Calculate lightness (L in OKLCH ≈ L in HSL but normalized to 0-1)
  const l = (max + min) / 2;

  // Calculate chroma (C in OKLCH ≈ S in HSL but scaled)
  let c = 0;
  if (delta !== 0) {
    c = delta / (1 - Math.abs(2 * l - 1));
    c = Math.min(c * 0.4, 0.4); // Scale to OKLCH range
  }

  // Calculate hue (same as HSL)
  let h = 0;
  if (delta !== 0) {
    if (max === rNorm) {
      h = ((gNorm - bNorm) / delta) % 6;
    } else if (max === gNorm) {
      h = (bNorm - rNorm) / delta + 2;
    } else {
      h = (rNorm - gNorm) / delta + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }

  return { l, c, h, a: 100 };
}

// Convert OKLCH to LCH
export function oklchToLch(oklch: OKLCH): LCH {
  return {
    l: oklch.l * 100, // Convert 0-1 to 0-100
    c: oklch.c * 150 / 0.4, // Convert 0-0.4 to 0-150
    h: oklch.h,
    a: oklch.a
  };
}

// Convert LCH to OKLCH
export function lchToOklch(lch: LCH): OKLCH {
  return {
    l: lch.l / 100, // Convert 0-100 to 0-1
    c: lch.c * 0.4 / 150, // Convert 0-150 to 0-0.4
    h: lch.h,
    a: lch.a
  };
}

// Convert LCH to RGB (via OKLCH)
export function lchToRgb(lch: LCH): RGB {
  const oklch = lchToOklch(lch);
  return oklchToRgb(oklch);
}

// Convert RGB to LCH (via OKLCH)
export function rgbToLch(rgb: RGB): LCH {
  const oklch = rgbToOklch(rgb);
  return oklchToLch(oklch);
}

// Generate gradient strings for sliders
export function generateLightnessGradient(c: number, h: number, isLch: boolean = false): string {
  const stops = [];
  for (let i = 0; i <= 10; i++) {
    let rgb: RGB;
    if (isLch) {
      const l = (i / 10) * 100;
      rgb = lchToRgb({ l, c, h, a: 100 });
    } else {
      const l = i / 10;
      rgb = oklchToRgb({ l, c, h, a: 100 });
    }
    const hex = rgbToHex(rgb);
    stops.push(`${hex} ${i * 10}%`);
  }
  return `linear-gradient(to right, ${stops.join(', ')})`;
}

export function generateChromaGradient(l: number, h: number, isLch: boolean = false): string {
  const stops = [];
  for (let i = 0; i <= 10; i++) {
    let rgb: RGB;
    if (isLch) {
      const c = (i / 10) * 150;
      rgb = lchToRgb({ l, c, h, a: 100 });
    } else {
      const c = (i / 10) * 0.4;
      rgb = oklchToRgb({ l, c, h, a: 100 });
    }
    const hex = rgbToHex(rgb);
    stops.push(`${hex} ${i * 10}%`);
  }
  return `linear-gradient(to right, ${stops.join(', ')})`;
}

export function generateHueGradient(l: number, c: number, isLch: boolean = false): string {
  const stops = [];
  for (let i = 0; i <= 12; i++) {
    const h = (i / 12) * 360;
    let rgb: RGB;
    if (isLch) {
      rgb = lchToRgb({ l, c, h, a: 100 });
    } else {
      rgb = oklchToRgb({ l, c, h, a: 100 });
    }
    const hex = rgbToHex(rgb);
    stops.push(`${hex} ${(i / 12) * 100}%`);
  }
  return `linear-gradient(to right, ${stops.join(', ')})`;
}