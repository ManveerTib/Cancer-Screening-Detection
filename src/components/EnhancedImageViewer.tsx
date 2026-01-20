import { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, Move, Ruler, Edit3, Trash2, RotateCcw, Sliders } from 'lucide-react';

interface Annotation {
  id: string;
  type: 'arrow' | 'circle' | 'text';
  x: number;
  y: number;
  x2?: number;
  y2?: number;
  radius?: number;
  text?: string;
  color: string;
}

interface Measurement {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  length: number;
}

interface EnhancedImageViewerProps {
  imageUrl: string;
  heatmapUrl?: string;
  title: string;
}

export default function EnhancedImageViewer({
  imageUrl,
  heatmapUrl,
  title,
}: EnhancedImageViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [heatmapOpacity, setHeatmapOpacity] = useState(0.6);
  const [tool, setTool] = useState<'pan' | 'measure' | 'annotate'>('pan');
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [currentMeasurement, setCurrentMeasurement] = useState<{ x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 4));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setHeatmapOpacity(0.6);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (tool === 'pan') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    } else if (tool === 'measure') {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (e.clientX - rect.left) / zoom;
        const y = (e.clientY - rect.top) / zoom;
        setCurrentMeasurement({ x, y });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && tool === 'pan') {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (tool === 'measure' && currentMeasurement) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x2 = (e.clientX - rect.left) / zoom;
        const y2 = (e.clientY - rect.top) / zoom;
        const length = Math.sqrt(
          Math.pow(x2 - currentMeasurement.x, 2) + Math.pow(y2 - currentMeasurement.y, 2)
        );

        if (length > 10) {
          setMeasurements([
            ...measurements,
            {
              id: Date.now().toString(),
              x1: currentMeasurement.x,
              y1: currentMeasurement.y,
              x2,
              y2,
              length,
            },
          ]);
        }
        setCurrentMeasurement(null);
      }
    }
    setIsDragging(false);
  };

  const deleteMeasurement = (id: string) => {
    setMeasurements(measurements.filter(m => m.id !== id));
  };

  const deleteAnnotation = (id: string) => {
    setAnnotations(annotations.filter(a => a.id !== id));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
        <h3 className="text-lg font-bold text-white">{title}</h3>
      </div>

      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTool('pan')}
              className={`p-2 rounded-lg transition-colors ${
                tool === 'pan'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              title="Pan Tool"
            >
              <Move className="h-5 w-5" />
            </button>
            <button
              onClick={() => setTool('measure')}
              className={`p-2 rounded-lg transition-colors ${
                tool === 'measure'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              title="Measurement Tool"
            >
              <Ruler className="h-5 w-5" />
            </button>
            <button
              onClick={() => setTool('annotate')}
              className={`p-2 rounded-lg transition-colors ${
                tool === 'annotate'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              title="Annotation Tool"
            >
              <Edit3 className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              className="p-2 bg-white text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="h-5 w-5" />
            </button>
            <span className="text-sm font-medium text-gray-700 min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-2 bg-white text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="h-5 w-5" />
            </button>
            <button
              onClick={handleReset}
              className="p-2 bg-white text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Reset View"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
          </div>
        </div>

        {heatmapUrl && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <Sliders className="h-4 w-4 text-gray-600" />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showHeatmap}
                  onChange={(e) => setShowHeatmap(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm font-medium text-gray-700">Show Heatmap</span>
              </label>
              {showHeatmap && (
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-sm text-gray-600">Intensity:</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={heatmapOpacity}
                    onChange={(e) => setHeatmapOpacity(parseFloat(e.target.value))}
                    className="flex-1 max-w-xs"
                  />
                  <span className="text-sm font-medium text-gray-700 min-w-[40px]">
                    {Math.round(heatmapOpacity * 100)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div
        ref={containerRef}
        className="relative overflow-hidden bg-gray-900"
        style={{ height: '600px', cursor: tool === 'pan' ? 'move' : 'crosshair' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => setIsDragging(false)}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'top left',
            transition: isDragging ? 'none' : 'transform 0.1s',
            position: 'relative',
          }}
        >
          <img
            src={imageUrl}
            alt="X-Ray"
            className="max-w-none"
            draggable={false}
            style={{ display: 'block' }}
          />
          {heatmapUrl && showHeatmap && (
            <img
              src={heatmapUrl}
              alt="Heatmap"
              className="absolute top-0 left-0 max-w-none pointer-events-none"
              style={{ opacity: heatmapOpacity, mixBlendMode: 'multiply' }}
              draggable={false}
            />
          )}

          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 pointer-events-none"
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </div>

      {measurements.length > 0 && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <h4 className="text-sm font-bold text-gray-900 mb-2">Measurements</h4>
          <div className="space-y-1">
            {measurements.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between text-sm bg-white p-2 rounded"
              >
                <span className="text-gray-700">
                  Length: {m.length.toFixed(2)} pixels
                </span>
                <button
                  onClick={() => deleteMeasurement(m.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-3 bg-blue-50 border-t border-blue-200">
        <p className="text-xs text-blue-900">
          <strong>Tip:</strong> Use the pan tool to navigate, measure tool to calculate sizes, and
          annotation tool to mark regions of interest. Zoom in for detailed inspection.
        </p>
      </div>
    </div>
  );
}
