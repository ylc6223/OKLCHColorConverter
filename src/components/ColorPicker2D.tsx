import React, { useRef, useCallback } from 'react';

interface ColorPicker2DProps {
  width: number;
  height: number;
  value: { x: number; y: number };
  onChange: (value: { x: number; y: number }) => void;
  gradient: string;
  label: string;
}

const ColorPicker2D: React.FC<ColorPicker2DProps> = ({
  width,
  height,
  value,
  onChange,
  gradient,
  label,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      
      const rect = canvasRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height));
      
      onChange({ x, y });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    handleMouseMove(e as any);
  }, [onChange]);

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</div>
      <div 
        ref={canvasRef}
        className="relative border border-gray-200 dark:border-gray-600 rounded-lg cursor-crosshair"
        style={{ 
          width: `${width}px`, 
          height: `${height}px`,
          background: gradient 
        }}
        onMouseDown={handleMouseDown}
      >
        <div 
          className="absolute w-4 h-4 border-2 border-white rounded-full transform -translate-x-2 -translate-y-2 pointer-events-none shadow-md"
          style={{ 
            left: `${value.x * 100}%`, 
            top: `${(1 - value.y) * 100}%`,
            backgroundColor: 'rgba(255, 255, 255, 0.9)'
          }}
        />
      </div>
    </div>
  );
};

export default ColorPicker2D;