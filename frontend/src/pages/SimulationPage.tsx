import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SIMULATION_SCENARIOS, SimulationScenario } from '../data/simulationData';
import { getPointAndAngleAlongPolyline, MapPoint } from '../utils/polylineUtils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SimulationState {
  isPlaying: boolean;
  speed: number;       // 1, 2, or 5
  progress: number;    // 0-100%
  selectedScenarioId: string;
  showDetour: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const VIEW_BOX_W = 1000;
const VIEW_BOX_H = 600;
const TICK_MS = 60;
const BASE_INCREMENT = 0.12; // % per tick at 1x

const SPEED_OPTIONS = [1, 2, 5];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const SimulationPage: React.FC = () => {
  const [state, setState] = useState<SimulationState>({
    isPlaying: false,
    speed: 1,
    progress: 0,
    selectedScenarioId: SIMULATION_SCENARIOS[0]?.id ?? '',
    showDetour: false,
  });

  const svgRef = useRef<SVGSVGElement>(null);
  const animFrameRef = useRef<number>(0);
  const lastTickRef = useRef<number>(0);

  // Pan & Zoom state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });

  const scenario: SimulationScenario | undefined = SIMULATION_SCENARIOS.find(
    (s) => s.id === state.selectedScenarioId,
  );

  // ---- Animation loop ----
  useEffect(() => {
    if (!state.isPlaying || !scenario) return;

    const loop = (now: number) => {
      if (!lastTickRef.current) lastTickRef.current = now;
      const elapsed = now - lastTickRef.current;

      if (elapsed >= TICK_MS) {
        lastTickRef.current = now;
        setState((prev) => {
          const next = prev.progress + BASE_INCREMENT * prev.speed;
          if (next >= 100) {
            return { ...prev, progress: 100, isPlaying: false };
          }
          // Show detour after 35%
          const showDetour = next > 35;
          return { ...prev, progress: next, showDetour };
        });
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [state.isPlaying, state.speed, scenario]);

  // ---- Handlers ----

  const togglePlay = () => {
    setState((prev) => {
      if (prev.progress >= 100) {
        return { ...prev, isPlaying: true, progress: 0, showDetour: false };
      }
      return { ...prev, isPlaying: !prev.isPlaying };
    });
    lastTickRef.current = 0;
  };

  const setSpeed = (s: number) => setState((prev) => ({ ...prev, speed: s }));
  const resetSim = () => {
    lastTickRef.current = 0;
    setState((prev) => ({ ...prev, isPlaying: false, progress: 0, showDetour: false }));
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setState((prev) => ({ ...prev, progress: val, showDetour: val > 35 }));
  };

  const selectScenario = (id: string) => {
    lastTickRef.current = 0;
    setState({
      isPlaying: false,
      speed: 1,
      progress: 0,
      selectedScenarioId: id,
      showDetour: false,
    });
  };

  // ---- Pan / Zoom handlers ----

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.min(3.5, Math.max(0.7, z - e.deltaY * 0.001)));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    panStart.current = { ...pan };
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    setPan({
      x: panStart.current.x + (e.clientX - dragStart.current.x) / zoom,
      y: panStart.current.y + (e.clientY - dragStart.current.y) / zoom,
    });
  }, [zoom]);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  // ---- Derived values ----

  const baseVehicle = scenario
    ? getPointAndAngleAlongPolyline(scenario.baseRoutePoints, Math.min(state.progress, state.showDetour ? 35 : 100))
    : null;

  const detourVehicle =
    scenario && state.showDetour
      ? getPointAndAngleAlongPolyline(
          scenario.detourRoutePoints,
          Math.max(0, ((state.progress - 35) / 65) * 100),
        )
      : null;

  const activeVehicle = state.showDetour && detourVehicle ? detourVehicle : baseVehicle;

  const simulatedSpeed = state.isPlaying ? (28 + Math.sin(state.progress * 0.1) * 12).toFixed(0) : '0';
  const simulatedSoc = Math.max(5, 82 - state.progress * 0.4).toFixed(0);

  const svgTransform = `translate(${VIEW_BOX_W / 2 + pan.x}, ${VIEW_BOX_H / 2 + pan.y}) scale(${zoom}) translate(${-VIEW_BOX_W / 2}, ${-VIEW_BOX_H / 2})`;

  // ---- Polyline helper ----

  const pointsToPath = (pts: MapPoint[]) => pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');

  if (!scenario) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-on-surface-variant font-body-md">No simulation scenarios available.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-surface">
      {/* Page Header */}
      <div className="bg-white border-b border-outline-variant px-4 py-3 flex items-center justify-between flex-wrap gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-xl">science</span>
          <h1 className="font-headline-sm text-base font-bold text-on-background">
            URJA Fleet Simulation
          </h1>
          <span className="text-[10px] font-label-bold uppercase tracking-wider text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded">
            Digital Twin
          </span>
        </div>

        {/* Scenario Selector */}
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-outline text-sm">emergency</span>
          <select
            value={state.selectedScenarioId}
            onChange={(e) => selectScenario(e.target.value)}
            className="bg-surface-container-low border border-outline-variant rounded-lg text-xs font-label-bold px-3 py-2 text-on-surface focus:outline-none focus:border-primary min-w-[220px]"
          >
            {SIMULATION_SCENARIOS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* SVG Canvas */}
        <div className="flex-1 relative overflow-hidden bg-surface-container-low">
          {/* Grid pattern background */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                'radial-gradient(circle, #becabe 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          <svg
            ref={svgRef}
            viewBox={`0 0 ${VIEW_BOX_W} ${VIEW_BOX_H}`}
            className="w-full h-full cursor-grab active:cursor-grabbing select-none"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <g transform={svgTransform}>
              {/* Background grid lines */}
              {Array.from({ length: 12 }).map((_, i) => (
                <React.Fragment key={`grid-${i}`}>
                  <line
                    x1={0} y1={i * 55} x2={VIEW_BOX_W} y2={i * 55}
                    stroke="#becabe" strokeWidth="0.5" strokeOpacity="0.3"
                  />
                  <line
                    x1={i * 90} y1={0} x2={i * 90} y2={VIEW_BOX_H}
                    stroke="#becabe" strokeWidth="0.5" strokeOpacity="0.3"
                  />
                </React.Fragment>
              ))}

              {/* Decorative road network */}
              <line x1={100} y1={100} x2={900} y2={100} stroke="#becabe" strokeWidth="2" strokeDasharray="4,4" />
              <line x1={100} y1={300} x2={900} y2={300} stroke="#becabe" strokeWidth="2" strokeDasharray="4,4" />
              <line x1={100} y1={500} x2={900} y2={500} stroke="#becabe" strokeWidth="2" strokeDasharray="4,4" />
              <line x1={200} y1={50} x2={200} y2={550} stroke="#becabe" strokeWidth="2" strokeDasharray="4,4" />
              <line x1={500} y1={50} x2={500} y2={550} stroke="#becabe" strokeWidth="2" strokeDasharray="4,4" />
              <line x1={800} y1={50} x2={800} y2={550} stroke="#becabe" strokeWidth="2" strokeDasharray="4,4" />

              {/* Highway overlay */}
              <path
                d={pointsToPath(scenario.baseRoutePoints.slice(0, 3))}
                stroke="#006a3b" strokeWidth="3" fill="none" strokeOpacity="0.3"
              />

              {/* Base Route */}
              <path
                d={pointsToPath(scenario.baseRoutePoints)}
                stroke={state.showDetour ? '#ba1a1a' : '#006a3b'}
                strokeWidth="4"
                fill="none"
                strokeOpacity={state.showDetour ? 0.4 : 0.9}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {!state.showDetour && (
                  <animate
                    attributeName="stroke-dashoffset"
                    from="24" to="0"
                    dur="1.5s" repeatCount="indefinite"
                  />
                )}
              </path>
              {!state.showDetour && (
                <path
                  d={pointsToPath(scenario.baseRoutePoints)}
                  stroke="#006a3b"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray="12,12"
                  strokeLinecap="round"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from="24" to="0"
                    dur="1.5s" repeatCount="indefinite"
                  />
                </path>
              )}

              {/* Detour Route */}
              {state.showDetour && (
                <>
                  <path
                    d={pointsToPath(scenario.detourRoutePoints)}
                    stroke="#376757"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray="8,6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeOpacity="0.9"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      from="28" to="0"
                      dur="1.2s" repeatCount="indefinite"
                    />
                  </path>
                </>
              )}

              {/* Incident zone */}
              {state.showDetour && (
                <g>
                  <circle
                    cx={scenario.incidentCoords.x}
                    cy={scenario.incidentCoords.y}
                    r="30"
                    fill="#ba1a1a"
                    fillOpacity="0.12"
                    stroke="#ba1a1a"
                    strokeWidth="1.5"
                    strokeOpacity="0.4"
                  />
                  <circle
                    cx={scenario.incidentCoords.x}
                    cy={scenario.incidentCoords.y}
                    r="8"
                    fill="#ba1a1a"
                    fillOpacity="0.9"
                  >
                    <animate
                      attributeName="r"
                      values="6;10;6"
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="fill-opacity"
                      values="0.9;0.4;0.9"
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <text
                    x={scenario.incidentCoords.x}
                    y={scenario.incidentCoords.y - 40}
                    textAnchor="middle"
                    fill="#ba1a1a"
                    fontSize="11"
                    fontWeight="700"
                    fontFamily="'Work Sans', sans-serif"
                  >
                    ⚠ {scenario.incidentLabel}
                  </text>
                </g>
              )}

              {/* Origin marker */}
              <g>
                <circle
                  cx={scenario.originCoords.x}
                  cy={scenario.originCoords.y}
                  r="10"
                  fill="#006a3b"
                  stroke="white"
                  strokeWidth="2"
                />
                <text
                  x={scenario.originCoords.x}
                  y={scenario.originCoords.y + 4}
                  textAnchor="middle"
                  fill="white"
                  fontSize="10"
                  fontWeight="bold"
                >
                  O
                </text>
                <text
                  x={scenario.originCoords.x}
                  y={scenario.originCoords.y + 24}
                  textAnchor="middle"
                  fill="#191c1d"
                  fontSize="10"
                  fontFamily="'Work Sans', sans-serif"
                  fontWeight="600"
                >
                  {scenario.originName}
                </text>
              </g>

              {/* Destination marker */}
              <g>
                <circle
                  cx={scenario.destCoords.x}
                  cy={scenario.destCoords.y}
                  r="10"
                  fill="#ba1a1a"
                  stroke="white"
                  strokeWidth="2"
                />
                <text
                  x={scenario.destCoords.x}
                  y={scenario.destCoords.y + 4}
                  textAnchor="middle"
                  fill="white"
                  fontSize="10"
                  fontWeight="bold"
                >
                  D
                </text>
                <text
                  x={scenario.destCoords.x}
                  y={scenario.destCoords.y + 24}
                  textAnchor="middle"
                  fill="#191c1d"
                  fontSize="10"
                  fontFamily="'Work Sans', sans-serif"
                  fontWeight="600"
                >
                  {scenario.destinationName}
                </text>
              </g>

              {/* Active Vehicle */}
              {activeVehicle && (
                <g transform={`translate(${activeVehicle.x}, ${activeVehicle.y})`}>
                  {/* Glow */}
                  <circle r="16" fill="#006a3b" fillOpacity="0.15">
                    <animate attributeName="r" values="14;20;14" dur="2s" repeatCount="indefinite" />
                  </circle>
                  {/* Vehicle body */}
                  <circle r="7" fill="#006a3b" stroke="white" strokeWidth="2" />
                  {/* Direction arrow */}
                  <g transform={`rotate(${activeVehicle.headingDeg})`}>
                    <polygon points="0,-12 -3,-6 3,-6" fill="#006a3b" />
                  </g>
                </g>
              )}
            </g>
          </svg>

          {/* Floating Controls */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3 z-10">
            {/* Playback Controls */}
            <div className="bg-white border border-outline-variant rounded-xl shadow-lg p-2.5 flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors"
                title={state.isPlaying ? 'Pause' : 'Play'}
              >
                <span className="material-symbols-outlined text-lg">
                  {state.isPlaying ? 'pause' : 'play_arrow'}
                </span>
              </button>

              {/* Speed selector */}
              <div className="flex gap-1">
                {SPEED_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={`px-2 py-1 rounded text-[10px] font-label-bold transition-colors ${
                      state.speed === s
                        ? 'bg-primary text-white'
                        : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>

              {/* Progress scrubber */}
              <input
                type="range"
                min="0"
                max="100"
                step="0.5"
                value={state.progress}
                onChange={handleScrub}
                className="w-36 h-1.5 accent-primary"
              />
              <span className="text-[10px] font-label-bold text-on-surface-variant min-w-[36px] text-right">
                {state.progress.toFixed(0)}%
              </span>

              <button
                onClick={resetSim}
                className="w-8 h-8 rounded-lg bg-surface-container-low text-outline hover:bg-surface-container flex items-center justify-center transition-colors"
                title="Reset"
              >
                <span className="material-symbols-outlined text-base">replay</span>
              </button>
            </div>

            {/* Zoom indicator */}
            <div className="bg-white border border-outline-variant rounded-lg shadow-sm px-2.5 py-1 text-[10px] font-label-bold text-on-surface-variant">
              {(zoom * 100).toFixed(0)}%
            </div>
          </div>
        </div>

        {/* Right Side Panels */}
        <div className="w-80 bg-white border-l border-outline-variant overflow-y-auto shrink-0 hidden lg:flex flex-col p-4 gap-4">
          {/* Scenario Info */}
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${
                scenario.severity === 'critical' ? 'bg-error' :
                scenario.severity === 'high' ? 'bg-amber-500' : 'bg-primary'
              }`} />
              <span className="text-[10px] font-label-bold uppercase tracking-wider text-on-surface-variant">
                {scenario.severity} Severity
              </span>
              <span className="text-[10px] text-outline ml-auto flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">cloud</span>
                {scenario.weather}
              </span>
            </div>
            <h3 className="font-headline-sm text-sm font-bold text-on-background mb-1">
              {scenario.title}
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {scenario.description}
            </p>
          </div>

          {/* Route Comparison */}
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
            <h4 className="text-[10px] font-label-bold uppercase tracking-wider text-on-surface-variant mb-3">
              Route Comparison
            </h4>

            <div className="space-y-3">
              {/* Original Route */}
              <div className={`p-3 rounded-lg border ${state.showDetour ? 'border-error/30 bg-error/5' : 'border-primary/30 bg-primary/5'}`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <div className={`w-3 h-1 rounded-full ${state.showDetour ? 'bg-error' : 'bg-primary'}`} />
                  <span className="text-[10px] font-label-bold text-on-surface">Original Route</span>
                </div>
                <div className="text-xs text-on-surface-variant">
                  {scenario.corridorName}
                </div>
                <div className="flex gap-4 mt-1.5 text-[11px] font-label-bold">
                  <span className="text-on-surface">{scenario.baseDistanceKm} km</span>
                  <span className="text-on-surface-variant">{scenario.baseDurationMins} min</span>
                </div>
              </div>

              {/* AI Detour */}
              <div className={`p-3 rounded-lg border transition-opacity duration-500 ${
                state.showDetour
                  ? 'border-primary/30 bg-primary/5 opacity-100'
                  : 'border-outline-variant bg-surface-container-low opacity-40'
              }`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-3 h-1 rounded-full bg-secondary" style={{ borderStyle: 'dashed' }} />
                  <span className="text-[10px] font-label-bold text-on-surface">AI Detour</span>
                  {state.showDetour && (
                    <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded ml-auto">
                      ACTIVE
                    </span>
                  )}
                </div>
                <div className="text-xs text-on-surface-variant">
                  {scenario.detourCorridorName}
                </div>
                <div className="flex gap-4 mt-1.5 text-[11px] font-label-bold">
                  <span className="text-on-surface">{scenario.detourDistanceKm} km</span>
                  <span className="text-on-surface-variant">{scenario.detourDurationMins} min</span>
                </div>
                {state.showDetour && (
                  <div className="mt-2 text-[10px] font-bold text-primary flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">check_circle</span>
                    Saves {scenario.baseDurationMins - scenario.detourDurationMins} min
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Vehicle Status */}
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
            <h4 className="text-[10px] font-label-bold uppercase tracking-wider text-on-surface-variant mb-3">
              Vehicle Telemetry
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 bg-surface-container-low rounded-lg">
                <div className="text-[10px] text-on-surface-variant font-label-sm">Speed</div>
                <div className="text-lg font-bold text-primary font-display-lg">{simulatedSpeed}</div>
                <div className="text-[9px] text-outline">km/h</div>
              </div>
              <div className="p-2.5 bg-surface-container-low rounded-lg">
                <div className="text-[10px] text-on-surface-variant font-label-sm">Battery</div>
                <div className={`text-lg font-bold font-display-lg ${
                  Number(simulatedSoc) > 50 ? 'text-primary' :
                  Number(simulatedSoc) > 20 ? 'text-amber-600' : 'text-error'
                }`}>
                  {simulatedSoc}%
                </div>
                <div className="text-[9px] text-outline">SOC</div>
              </div>
              <div className="p-2.5 bg-surface-container-low rounded-lg">
                <div className="text-[10px] text-on-surface-variant font-label-sm">Progress</div>
                <div className="text-lg font-bold text-on-surface font-display-lg">{state.progress.toFixed(0)}%</div>
                <div className="text-[9px] text-outline">of route</div>
              </div>
              <div className="p-2.5 bg-surface-container-low rounded-lg">
                <div className="text-[10px] text-on-surface-variant font-label-sm">Status</div>
                <div className="text-xs font-bold text-primary mt-1 flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${state.isPlaying ? 'bg-primary animate-pulse' : 'bg-outline'}`} />
                  {state.isPlaying ? 'Moving' : 'Stopped'}
                </div>
              </div>
            </div>

            {/* Battery bar */}
            <div className="mt-3">
              <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    Number(simulatedSoc) > 50 ? 'bg-primary' :
                    Number(simulatedSoc) > 20 ? 'bg-amber-500' : 'bg-error'
                  }`}
                  style={{ width: `${simulatedSoc}%` }}
                />
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
            <h4 className="text-[10px] font-label-bold uppercase tracking-wider text-on-surface-variant mb-2">
              Legend
            </h4>
            <div className="space-y-1.5 text-xs text-on-surface-variant">
              <div className="flex items-center gap-2">
                <div className="w-5 h-1 bg-primary rounded-full" />
                <span>Original Route</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-0.5 border-t-2 border-dashed border-secondary" />
                <span>AI Detour</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-error/20 border border-error" />
                <span>Incident Zone</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary border-2 border-white shadow-sm" />
                <span>Vehicle</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationPage;
