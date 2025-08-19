import React from 'react';

interface ColorSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  gradient?: string;
  unit?: string;
}

const ColorSlider: React.FC<ColorSliderProps> = ({
  label,
  value,
  min,
  max,
  step,
  onChange,
  gradient,
  unit = '',
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
            {unit === '%' ? Math.round(value * 100) : value.toFixed(unit === '°' ? 0 : 2)}
          </span>
          <span className="text-sm text-gray-400 dark:text-gray-500">{unit}</span>
        </div>
      </div>

      <div className="relative">
        <div
          className="w-full h-8 rounded-lg border border-gray-200 dark:border-gray-600"
          style={{ background: gradient || `linear-gradient(to right, #000, #fff)` }}
        />
        <div className="relative -mt-8">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-8 bg-transparent appearance-none cursor-pointer slider-custom"
          />
          <div
            className="absolute top-1/2 w-4 h-4 bg-white border-2 border-amber-500 rounded-full transform -translate-y-1/2 -translate-x-2 pointer-events-none shadow-md"
            style={{ left: `${((value - min) / (max - min)) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default ColorSlider;