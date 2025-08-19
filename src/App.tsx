import React, { useState, useEffect, useMemo } from 'react';
import ColorSlider from './components/ColorSlider';
import ColorPicker2D from './components/ColorPicker2D';
import ColorConverter from './components/ColorConverter';
import ToggleSwitch from './components/ToggleSwitch';
import SettingsPanel from './components/SettingsPanel';
import Toast from './components/Toast';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { useToast } from './hooks/useToast';
import { ColorSpace, OKLCH, LCH } from './types';
import { t } from './utils/translations';
import { 
  oklchToRgb, 
  rgbToHex, 
  hexToRgb, 
  rgbToOklch,
  oklchToLch,
  lchToOklch,
  lchToRgb,
  rgbToLch,
  generateLightnessGradient,
  generateChromaGradient,
  generateHueGradient
} from './utils/colorConversion';

function AppContent() {
  const { language } = useSettings();
  const { toasts, showToast, hideToast } = useToast();
  const [colorSpace, setColorSpace] = useState<ColorSpace>('OKLCH');
  const [oklch, setOklch] = useState<OKLCH>({ l: 0.7, c: 0.1, h: 104, a: 100 });
  const [lch, setLch] = useState<LCH>({ l: 70, c: 15, h: 104, a: 100 });
  const [hex, setHex] = useState('#a9a254');
  const [show3D, setShow3D] = useState(true);
  const [showGraphs, setShowGraphs] = useState(true);
  const [showP3, setShowP3] = useState(true);
  const [showRec2020, setShowRec2020] = useState(false);

  // Sync OKLCH and LCH values - only sync when colorSpace changes or when the active color space value changes
  useEffect(() => {
    if (colorSpace === 'OKLCH') {
      setLch(oklchToLch(oklch));
    }
  }, [oklch, colorSpace]);

  useEffect(() => {
    if (colorSpace === 'LCH') {
      setOklch(lchToOklch(lch));
    }
  }, [lch, colorSpace]);

  // Update hex when color values change
  useEffect(() => {
    console.log('🔄 [App] Color values changed, updating hex. ColorSpace:', colorSpace);
    console.log('🔄 [App] Current OKLCH:', oklch);
    console.log('🔄 [App] Current LCH:', lch);

    const rgb = colorSpace === 'OKLCH' ? oklchToRgb(oklch) : lchToRgb(lch);
    const alpha = colorSpace === 'OKLCH' ? oklch.a : lch.a;

    let newHex;
    if (alpha >= 100) {
      // 标准 6 位 hex
      newHex = rgbToHex(rgb);
    } else {
      // 8 位 hex（包含 alpha）
      const alphaHex = Math.round((alpha / 100) * 255).toString(16).padStart(2, '0');
      newHex = rgbToHex(rgb) + alphaHex;
    }

    console.log('🔄 [App] Generated hex:', newHex, 'alpha:', alpha);
    setHex(newHex);
  }, [oklch, lch, colorSpace]);

  const handleHexChange = (newHex: string) => {
    console.log('🚀 [App] handleHexChange called with:', newHex);
    console.log('🚀 [App] Current colorSpace:', colorSpace);

    // 只有当输入是有效的完整 hex 颜色时才更新颜色值
    const rgb = hexToRgb(newHex);
    console.log('🚀 [App] hexToRgb result:', rgb);

    if (rgb) {
      console.log('✅ [App] Valid RGB, updating states...');
      setHex(newHex);

      // 解析 alpha 值（如果是 8 位 hex）
      const cleanHex = newHex.replace('#', '');
      let alpha = 100;
      if (cleanHex.length === 8) {
        alpha = Math.round((parseInt(cleanHex.substr(6, 2), 16) / 255) * 100);
      }

      if (colorSpace === 'OKLCH') {
        const newOklch = { ...rgbToOklch(rgb), a: alpha };
        console.log('🚀 [App] Converting to OKLCH:', newOklch);
        setOklch(newOklch);
      } else {
        const newLch = { ...rgbToLch(rgb), a: alpha };
        console.log('🚀 [App] Converting to LCH:', newLch);
        setLch(newLch);
      }
    } else {
      console.log('❌ [App] Invalid hex value, not updating states');
    }
  };

  // 生成当前颜色，包含 alpha 值
  const currentColor = useMemo(() => {
    const rgb = colorSpace === 'OKLCH' ? oklchToRgb(oklch) : lchToRgb(lch);
    const alpha = colorSpace === 'OKLCH' ? oklch.a / 100 : lch.a / 100;

    let result;
    // 如果 alpha 是 100%，返回普通的 hex 值
    if (alpha >= 0.99) {
      result = rgbToHex(rgb);
    } else {
      // 否则返回 rgba 值
      result = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
    }

    console.log('🎨 [App] currentColor result:', result, 'alpha:', alpha);
    return result;
  }, [oklch, lch, colorSpace]);

  const handleColorSpaceChange = (newColorSpace: ColorSpace) => {
    setColorSpace(newColorSpace);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors flex flex-col">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {t('title', language)}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Color Display & Converter */}
          <div className="space-y-6">
            {/* Color Swatch */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div
                className="w-full h-32 rounded-lg border border-gray-200 dark:border-gray-600 mb-4 relative"
                style={{
                  backgroundImage: `
                    linear-gradient(45deg, #ccc 25%, transparent 25%),
                    linear-gradient(-45deg, #ccc 25%, transparent 25%),
                    linear-gradient(45deg, transparent 75%, #ccc 75%),
                    linear-gradient(-45deg, transparent 75%, #ccc 75%)
                  `,
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                }}
              >
                <div
                  className="w-full h-full rounded-lg"
                  style={{ backgroundColor: currentColor }}
                />
              </div>
            </div>

            {/* Color Converter */}
            <ColorConverter
              oklch={oklch}
              lch={lch}
              hex={hex}
              colorSpace={colorSpace}
              onColorSpaceChange={handleColorSpaceChange}
              onOklchChange={(value) => {}}
              onLchChange={(value) => {}}
              onHexChange={handleHexChange}
              onToast={showToast}
              t={(key) => t(key, language)}
            />

            {/* Toggle Options */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="space-y-3">
                <ToggleSwitch 
                  label={t('show3D', language)} 
                  checked={show3D} 
                  onChange={setShow3D} 
                />
                <ToggleSwitch 
                  label={t('showGraphs', language)} 
                  checked={showGraphs} 
                  onChange={setShowGraphs} 
                />
                <ToggleSwitch 
                  label={t('showP3', language)} 
                  checked={showP3} 
                  onChange={setShowP3} 
                />
                <ToggleSwitch 
                  label={t('showRec2020', language)} 
                  checked={showRec2020} 
                  onChange={setShowRec2020} 
                />
              </div>
            </div>
          </div>

          {/* Center Column - Sliders */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="space-y-6">
                {colorSpace === 'OKLCH' ? (
                  <>
                    <ColorSlider
                      label={t('lightness', language)}
                      value={oklch.l}
                      min={0}
                      max={1}
                      step={0.01}
                      onChange={(l) => setOklch({ ...oklch, l })}
                      gradient={generateLightnessGradient(oklch.c, oklch.h, false)}
                    />

                    <ColorSlider
                      label={t('chroma', language)}
                      value={oklch.c}
                      min={0}
                      max={0.4}
                      step={0.01}
                      onChange={(c) => setOklch({ ...oklch, c })}
                      gradient={generateChromaGradient(oklch.l, oklch.h, false)}
                    />

                    <ColorSlider
                      label={t('hue', language)}
                      value={oklch.h}
                      min={0}
                      max={360}
                      step={1}
                      onChange={(h) => setOklch({ ...oklch, h })}
                      gradient={generateHueGradient(oklch.l, oklch.c, false)}
                      unit="°"
                    />

                    <ColorSlider
                      label={t('alpha', language)}
                      value={oklch.a / 100}
                      min={0}
                      max={1}
                      step={0.01}
                      onChange={(a) => setOklch({ ...oklch, a: a * 100 })}
                      gradient={`linear-gradient(to right, transparent, ${rgbToHex(oklchToRgb(oklch))})`}
                      unit="%"
                    />
                  </>
                ) : (
                  <>
                    <ColorSlider
                      label={t('lightness', language)}
                      value={lch.l}
                      min={0}
                      max={100}
                      step={1}
                      onChange={(l) => setLch({ ...lch, l })}
                      gradient={generateLightnessGradient(lch.c, lch.h, true)}
                    />

                    <ColorSlider
                      label={t('chroma', language)}
                      value={lch.c}
                      min={0}
                      max={150}
                      step={1}
                      onChange={(c) => setLch({ ...lch, c })}
                      gradient={generateChromaGradient(lch.l, lch.h, true)}
                    />

                    <ColorSlider
                      label={t('hue', language)}
                      value={lch.h}
                      min={0}
                      max={360}
                      step={1}
                      onChange={(h) => setLch({ ...lch, h })}
                      gradient={generateHueGradient(lch.l, lch.c, true)}
                      unit="°"
                    />

                    <ColorSlider
                      label={t('alpha', language)}
                      value={lch.a / 100}
                      min={0}
                      max={1}
                      step={0.01}
                      onChange={(a) => setLch({ ...lch, a: a * 100 })}
                      gradient={`linear-gradient(to right, transparent, ${rgbToHex(lchToRgb(lch))})`}
                      unit="%"
                    />
                  </>
                )}
              </div>
            </div>

            {/* 2D Color Picker */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              {colorSpace === 'OKLCH' ? (
                <ColorPicker2D
                  width={280}
                  height={160}
                  value={{ x: oklch.c / 0.4, y: oklch.l }}
                  onChange={({ x, y }) => setOklch({ ...oklch, c: x * 0.4, l: y })}
                  gradient={`linear-gradient(to right, 
                    oklch(${oklch.l} 0 ${oklch.h}), 
                    oklch(${oklch.l} 0.4 ${oklch.h})), 
                    linear-gradient(to top, 
                    oklch(0 ${oklch.c} ${oklch.h}), 
                    oklch(1 ${oklch.c} ${oklch.h}))`}
                  label={t('lightnessVsChroma', language)}
                />
              ) : (
                <ColorPicker2D
                  width={280}
                  height={160}
                  value={{ x: lch.c / 150, y: lch.l / 100 }}
                  onChange={({ x, y }) => setLch({ ...lch, c: x * 150, l: y * 100 })}
                  gradient={`linear-gradient(to right, 
                    lch(${lch.l} 0 ${lch.h}), 
                    lch(${lch.l} 150 ${lch.h})), 
                    linear-gradient(to top, 
                    lch(0 ${lch.c} ${lch.h}), 
                    lch(100 ${lch.c} ${lch.h}))`}
                  label={t('lightnessVsChroma', language)}
                />
              )}
            </div>
          </div>

          {/* Right Column - More Color Pickers */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              {colorSpace === 'OKLCH' ? (
                <ColorPicker2D
                  width={280}
                  height={160}
                  value={{ x: oklch.c / 0.4, y: oklch.h / 360 }}
                  onChange={({ x, y }) => setOklch({ ...oklch, c: x * 0.4, h: y * 360 })}
                  gradient={`conic-gradient(from 0deg,
                    hsl(0, 100%, 50%), hsl(60, 100%, 50%),
                    hsl(120, 100%, 50%), hsl(180, 100%, 50%),
                    hsl(240, 100%, 50%), hsl(300, 100%, 50%),
                    hsl(0, 100%, 50%))`}
                  label={t('chromaVsHue', language)}
                />
              ) : (
                <ColorPicker2D
                  width={280}
                  height={160}
                  value={{ x: lch.c / 150, y: lch.h / 360 }}
                  onChange={({ x, y }) => setLch({ ...lch, c: x * 150, h: y * 360 })}
                  gradient={`conic-gradient(from 0deg,
                    hsl(0, 100%, 50%), hsl(60, 100%, 50%),
                    hsl(120, 100%, 50%), hsl(180, 100%, 50%),
                    hsl(240, 100%, 50%), hsl(300, 100%, 50%),
                    hsl(0, 100%, 50%))`}
                  label={t('chromaVsHue', language)}
                />
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              {colorSpace === 'OKLCH' ? (
                <ColorPicker2D
                  width={280}
                  height={200}
                  value={{ x: oklch.h / 360, y: oklch.l }}
                  onChange={({ x, y }) => setOklch({ ...oklch, h: x * 360, l: y })}
                  gradient={`linear-gradient(90deg,
                    oklch(${oklch.l} ${oklch.c} 0),
                    oklch(${oklch.l} ${oklch.c} 60),
                    oklch(${oklch.l} ${oklch.c} 120),
                    oklch(${oklch.l} ${oklch.c} 180),
                    oklch(${oklch.l} ${oklch.c} 240),
                    oklch(${oklch.l} ${oklch.c} 300),
                    oklch(${oklch.l} ${oklch.c} 360))`}
                  label={t('hueVsLightness', language)}
                />
              ) : (
                <ColorPicker2D
                  width={280}
                  height={200}
                  value={{ x: lch.h / 360, y: lch.l / 100 }}
                  onChange={({ x, y }) => setLch({ ...lch, h: x * 360, l: y * 100 })}
                  gradient={`linear-gradient(90deg,
                    lch(${lch.l} ${lch.c} 0),
                    lch(${lch.l} ${lch.c} 60),
                    lch(${lch.l} ${lch.c} 120),
                    lch(${lch.l} ${lch.c} 180),
                    lch(${lch.l} ${lch.c} 240),
                    lch(${lch.l} ${lch.c} 300),
                    lch(${lch.l} ${lch.c} 360))`}
                  label={t('hueVsLightness', language)}
                />
              )}
            </div>

            {show3D && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">{t('colorSpace3D', language)}</div>
                <div className="w-full h-48 bg-gradient-to-br from-purple-400 via-blue-400 to-green-400 rounded-lg flex items-center justify-center">
                  <div className="text-white font-medium">{t('visualization3D', language)}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      <SettingsPanel />

      {/* Toast 组件 */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          show={toast.show}
          onClose={() => hideToast(toast.id)}
        />
      ))}

      <style>{`
        .slider-custom::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: transparent;
          border: none;
          cursor: pointer;
        }

        .slider-custom::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: transparent;
          border: none;
          cursor: pointer;
        }

        .slider-custom {
          background: transparent;
        }

        .slider-custom::-webkit-slider-track {
          background: transparent;
        }

        .slider-custom::-moz-range-track {
          background: transparent;
        }
      `}</style>

      {/* Footer */}
      <footer className="mt-auto py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2">
            {/* Copyright and Creator */}
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <p>
                © 2024 {t('footer.copyright', language)} | {t('footer.madeBy', language)} {t('footer.creator', language)}
              </p>
            </div>

            {/* Acknowledgments */}
            <div className="text-xs text-gray-400 dark:text-gray-500">
              <p className="opacity-75">
                {t('footer.thanks', language)}
                <a
                  href="https://oklch.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors underline decoration-dotted underline-offset-2 mx-1"
                >
                  OKLCH
                </a>
                {t('footer.and', language)}
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors underline decoration-dotted underline-offset-2 mx-1"
                >
                  {t('footer.community', language)}
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}

export default App;
