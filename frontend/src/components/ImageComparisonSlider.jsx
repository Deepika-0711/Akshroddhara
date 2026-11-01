import React, { useState, useRef, useCallback } from 'react';
import { Columns, SplitSquareVertical, Eye, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

export default function ImageComparisonSlider({
  originalUrl,
  enhancedUrl,
  originalFilename = 'Original Document',
}) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState('slider'); // 'slider' | 'side-by-side' | 'enhanced-only' | 'original-only'
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef(null);

  const handleMove = useCallback(
    (clientX) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percentage = (x / rect.width) * 100;
      setSliderPosition(percentage);
    },
    []
  );

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e) => {
    if (isDragging) handleMove(e.clientX);
  };

  const handleTouchMove = (e) => {
    if (e.touches.length > 0) handleMove(e.touches[0].clientX);
  };

  const resetZoom = () => setZoom(1);

  return (
    <div className="bg-ivory-50 rounded-xl border border-ivory-300 shadow-parchment overflow-hidden">
      {/* Controls Bar */}
      <div className="px-4 py-3 bg-ivory-200 border-b border-ivory-300 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-ink-800">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="font-semibold text-forest-700">ವೀಕ್ಷಣೆ (View):</span>
          <button
            onClick={() => setViewMode('slider')}
            className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
              viewMode === 'slider'
                ? 'bg-forest-600 text-ivory-50 font-medium'
                : 'hover:bg-ivory-300 text-ink-700'
            }`}
            title="Interactive Split Slider"
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span>ಸ್ಲೈಡರ್ (Slider)</span>
          </button>
          <button
            onClick={() => setViewMode('side-by-side')}
            className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
              viewMode === 'side-by-side'
                ? 'bg-forest-600 text-ivory-50 font-medium'
                : 'hover:bg-ivory-300 text-ink-700'
            }`}
            title="Side by Side"
          >
            <Columns className="w-3.5 h-3.5" />
            <span>ಪಕ್ಕಪಕ್ಕದಲ್ಲಿ (Side by Side)</span>
          </button>
          <button
            onClick={() => setViewMode('enhanced-only')}
            className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
              viewMode === 'enhanced-only'
                ? 'bg-forest-600 text-ivory-50 font-medium'
                : 'hover:bg-ivory-300 text-ink-700'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>ಸುಧಾರಿತ ಮಾತ್ರ (Enhanced)</span>
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoom((z) => Math.max(0.75, z - 0.25))}
            className="p-1.5 rounded hover:bg-ivory-300 text-ink-700"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="px-1 text-xs text-ink-600 min-w-[40px] text-center font-mono">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(2.5, z + 0.25))}
            className="p-1.5 rounded hover:bg-ivory-300 text-ink-700"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          {zoom !== 1 && (
            <button
              onClick={resetZoom}
              className="p-1.5 rounded hover:bg-ivory-300 text-gold-700"
              title="Reset Zoom"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Display Area */}
      <div className="p-4 sm:p-6 overflow-auto max-h-[600px] flex items-center justify-center bg-parchment">
        {viewMode === 'slider' && (
          <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchMove={handleTouchMove}
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
            className="relative select-none cursor-ew-resize max-w-full overflow-hidden rounded-lg shadow-parchment border border-gold-300/60 transition-transform duration-100"
          >
            {/* Enhanced Image (Background Base) */}
            <img
              src={enhancedUrl}
              alt="Enhanced Kannada Document"
              className="block max-h-[500px] w-auto object-contain mx-auto pointer-events-none"
              draggable={false}
            />

            {/* Original Image (Clipped Overlay) */}
            <div
              className="absolute top-0 left-0 bottom-0 overflow-hidden"
              style={{ width: `${sliderPosition}%` }}
            >
              <img
                src={originalUrl}
                alt="Original Kannada Document"
                className="max-h-[500px] w-auto object-contain pointer-events-none"
                style={{
                  maxWidth: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%',
                }}
                draggable={false}
              />
            </div>

            {/* Slider Divider Line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-gold-500 shadow-md pointer-events-none"
              style={{ left: `${sliderPosition}%` }}
            >
              <div
                onMouseDown={handleMouseDown}
                onTouchStart={() => setIsDragging(true)}
                onTouchEnd={() => setIsDragging(false)}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-forest-700 text-ivory-100 border-2 border-gold-400 flex items-center justify-center shadow-lg pointer-events-auto cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
              >
                <SplitSquareVertical className="w-4 h-4" />
              </div>
            </div>

            {/* Badges */}
            <div className="absolute top-3 left-3 bg-ink-900/80 backdrop-blur-sm text-ivory-100 text-xs px-2.5 py-1 rounded shadow-sm pointer-events-none">
              ಮೂಲ ದಾಖಲೆ (Original)
            </div>
            <div className="absolute top-3 right-3 bg-forest-800/85 backdrop-blur-sm text-gold-200 border border-gold-500/30 text-xs px-2.5 py-1 rounded shadow-sm pointer-events-none">
              ಸುಧಾರಿತ ಪ್ರತಿ (Enhanced)
            </div>
          </div>
        )}

        {viewMode === 'side-by-side' && (
          <div
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl transition-transform duration-100"
          >
            {/* Original */}
            <div className="flex flex-col rounded-lg overflow-hidden border border-ivory-300 bg-white/70 shadow-sm">
              <div className="bg-ivory-200 px-3 py-2 text-xs font-semibold text-ink-700 flex justify-between items-center border-b border-ivory-300">
                <span>ಮೂಲ ಚಿತ್ರ (Original)</span>
                <span className="text-ink-500 font-mono text-[11px] truncate max-w-[180px]">
                  {originalFilename}
                </span>
              </div>
              <div className="p-2 flex items-center justify-center min-h-[300px]">
                <img
                  src={originalUrl}
                  alt="Original Document"
                  className="max-h-[420px] w-auto object-contain rounded"
                />
              </div>
            </div>

            {/* Enhanced */}
            <div className="flex flex-col rounded-lg overflow-hidden border-2 border-forest-600/30 bg-white/90 shadow-sm">
              <div className="bg-forest-700 text-gold-200 px-3 py-2 text-xs font-semibold flex justify-between items-center">
                <span>ಸುಧಾರಿತ ಫಲಿತಾಂಶ (Enhanced Document)</span>
                <span className="text-[11px] bg-forest-800 px-2 py-0.5 rounded text-gold-300">
                  JavaScript Processed
                </span>
              </div>
              <div className="p-2 flex items-center justify-center min-h-[300px]">
                <img
                  src={enhancedUrl}
                  alt="Enhanced Document"
                  className="max-h-[420px] w-auto object-contain rounded"
                />
              </div>
            </div>
          </div>
        )}

        {viewMode === 'enhanced-only' && (
          <div
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
            className="flex flex-col items-center max-w-full transition-transform duration-100"
          >
            <div className="rounded-lg overflow-hidden border-2 border-forest-600/40 bg-white shadow-parchment p-3">
              <img
                src={enhancedUrl}
                alt="Enhanced Kannada Document"
                className="max-h-[520px] w-auto object-contain rounded"
              />
            </div>
          </div>
        )}
      </div>

      {/* Caption note */}
      <div className="px-4 py-2.5 bg-ivory-100/90 border-t border-ivory-300 text-[12px] text-ink-600 text-center">
        💡 ಸ್ಲೈಡರ್ ಅನ್ನು ಎಡ-ಬಲಕ್ಕೆ ಎಳೆಯುವ ಮೂಲಕ ಮೂಲ ಮತ್ತು ಸುಧಾರಿತ ಚಿತ್ರಗಳ ನಡುವಿನ ಅಕ್ಷರಗಳ ಸ್ಪಷ್ಟತೆಯನ್ನು ಹೋಲಿಸಿ ನೋಡಿ.
        (Drag the slider handle left/right to compare character clarity between the original and enhanced documents).
      </div>
    </div>
  );
}
