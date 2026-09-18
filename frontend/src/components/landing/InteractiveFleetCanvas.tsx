import React, { useState, useRef, useEffect, useCallback } from 'react';

interface NodePoint {
  id: string;
  x: number;
  y: number;
  label: string;
  sublabel: string;
  eta: string;
  soc: number;
  type: 'bus' | 'hub' | 'stop';
}

const NODES: NodePoint[] = [
  { id: 'n1', x: 80, y: 120, label: 'EV-BUS 01', sublabel: 'Station Road Line', eta: '4 MIN', soc: 84, type: 'bus' },
  { id: 'n2', x: 280, y: 70, label: 'KEM Plaza Hub', sublabel: 'Fast DC 120kW', eta: 'AVAIL', soc: 100, type: 'hub' },
  { id: 'n3', x: 420, y: 180, label: 'EV-BUS 04', sublabel: 'Fort Circular', eta: '12 MIN', soc: 78, type: 'bus' },
  { id: 'n4', x: 220, y: 260, label: 'Depot Interchange', sublabel: 'Core Junction', eta: 'ON TIME', soc: 92, type: 'stop' },
  { id: 'n5', x: 500, y: 100, label: 'EV-BUS 08', sublabel: 'Express Corridors', eta: '2 MIN', soc: 46, type: 'bus' },
];

export const InteractiveFleetCanvas: React.FC<{ className?: string }> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<NodePoint | null>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const normalizedX = (e.clientX - rect.left) / rect.width;
    const normalizedY = (e.clientY - rect.top) / rect.height;

    setMouseOffset({
      x: (normalizedX - 0.5) * -12,
      y: (normalizedY - 0.5) * -8,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMouseOffset({ x: 0, y: 0 });
    setHoveredNode(null);
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface via-surface-container-low to-surface border border-outline-variant/60 shadow-inner ${className}`}
      style={{ minHeight: '300px' }}
    >
      {/* Background Subdued City Grid */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #6f7a70 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      {/* SVG Canvas with Parallax Transition */}
      <svg
        viewBox="0 0 580 320"
        className="w-full h-full select-none"
        style={{
          transform: `translate(${mouseOffset.x}px, ${mouseOffset.y}px)`,
          transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <defs>
          <linearGradient id="routeGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#006a3b" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#268451" stopOpacity="0.9" />
          </linearGradient>

          <linearGradient id="routeGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#376757" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#006a3b" stopOpacity="0.85" />
          </linearGradient>
        </defs>

        {/* Route 1: Main Transit Corridor */}
        <path
          d="M 60,140 C 160,80 220,160 320,120 S 460,60 520,100"
          fill="none"
          stroke="#becabe"
          strokeWidth="6"
          strokeOpacity="0.3"
          strokeLinecap="round"
        />
        <path
          d="M 60,140 C 160,80 220,160 320,120 S 460,60 520,100"
          fill="none"
          stroke="url(#routeGrad1)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M 60,140 C 160,80 220,160 320,120 S 460,60 520,100"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
          strokeDasharray="6,12"
          className="animate-route-flow"
        />

        {/* Route 2: Secondary Feeder Branch */}
        <path
          d="M 120,280 C 180,240 240,260 340,200 S 420,150 480,220"
          fill="none"
          stroke="#becabe"
          strokeWidth="4"
          strokeOpacity="0.2"
          strokeLinecap="round"
        />
        <path
          d="M 120,280 C 180,240 240,260 340,200 S 420,150 480,220"
          fill="none"
          stroke="url(#routeGrad2)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M 120,280 C 180,240 240,260 340,200 S 420,150 480,220"
          fill="none"
          stroke="#376757"
          strokeWidth="1.5"
          strokeDasharray="4,8"
          className="animate-signal-dash"
        />

        {/* Route 3: Cross Interconnector */}
        <path
          d="M 280,70 Q 260,170 220,260"
          fill="none"
          stroke="#6f7a70"
          strokeWidth="1.5"
          strokeDasharray="3,4"
          strokeOpacity="0.6"
        />

        {/* Pulse Nodes */}
        {NODES.map((node) => {
          const isHovered = hoveredNode?.id === node.id;
          const isBus = node.type === 'bus';
          const isHub = node.type === 'hub';

          return (
            <g
              key={node.id}
              transform={`translate(${node.x}, ${node.y})`}
              onMouseEnter={() => setHoveredNode(node)}
              onMouseLeave={() => setHoveredNode(null)}
              className="cursor-pointer"
            >
              {/* Outer Pulse Ping */}
              <circle
                r={isHovered ? '16' : '10'}
                fill={isBus ? '#006a3b' : isHub ? '#376757' : '#6f7a70'}
                fillOpacity="0.25"
                className="animate-ping"
                style={{ animationDuration: isBus ? '2.5s' : '3.5s' }}
              />

              {/* Node Body */}
              <circle
                r={isHovered ? '9' : '7'}
                fill={isBus ? '#006a3b' : isHub ? '#268451' : '#ffffff'}
                stroke={isBus || isHub ? '#ffffff' : '#006a3b'}
                strokeWidth="2"
                className="transition-all duration-200"
              />

              {/* Node Label on Canvas */}
              <text
                y="18"
                textAnchor="middle"
                fontSize="9"
                fontFamily="'Work Sans', sans-serif"
                fontWeight="700"
                fill="#191c1d"
                className="pointer-events-none"
              >
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Floating Glassmorphic Details Card on Hover */}
      {hoveredNode && (
        <div
          className="absolute z-20 bg-white/95 backdrop-blur-md border border-outline-variant rounded-xl shadow-xl p-3 text-xs pointer-events-none animate-in fade-in zoom-in-95 duration-150"
          style={{
            left: `${Math.min(380, Math.max(20, hoveredNode.x - 40))}px`,
            top: `${Math.min(180, Math.max(20, hoveredNode.y - 70))}px`,
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="font-headline-sm font-bold text-on-background">
              {hoveredNode.label}
            </span>
            <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
              {hoveredNode.eta}
            </span>
          </div>
          <p className="text-[11px] text-on-surface-variant mt-0.5">{hoveredNode.sublabel}</p>
          <div className="mt-2 pt-2 border-t border-outline-variant/40 flex items-center justify-between text-[10px] font-semibold text-outline">
            <span>Battery: {hoveredNode.soc}%</span>
            <span className="text-primary font-bold">LIVE TELEMETRY</span>
          </div>
        </div>
      )}

      {/* Footer Info Pill */}
      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm border border-outline-variant/70 rounded-full px-3 py-1 text-[10px] font-label-bold text-on-surface flex items-center gap-1.5 shadow-sm">
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span>Real-Time Fleet Grid Simulation</span>
      </div>
    </div>
  );
};

export default InteractiveFleetCanvas;
