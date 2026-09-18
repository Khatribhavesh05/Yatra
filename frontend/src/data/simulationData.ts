import { MapPoint } from '../utils/polylineUtils';

export interface SimulationScenario {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium';
  weather: 'clear' | 'rain' | 'fog';
  originName: string;
  destinationName: string;
  originCoords: MapPoint;
  destCoords: MapPoint;
  incidentCoords: MapPoint;
  incidentLabel: string;
  baseRoutePoints: MapPoint[];
  detourRoutePoints: MapPoint[];
  baseDistanceKm: number;
  baseDurationMins: number;
  detourDistanceKm: number;
  detourDurationMins: number;
  corridorName: string;
  detourCorridorName: string;
}

export const SIMULATION_SCENARIOS: SimulationScenario[] = [
  {
    id: 'scen_001',
    title: 'Road Blockage in Bikaner',
    description: 'Major accident on NH11 causing complete blockage. Rerouting via state highway.',
    severity: 'critical',
    weather: 'clear',
    originName: 'Bikaner Hub',
    destinationName: 'Gajner Delivery Center',
    originCoords: { x: 100, y: 300 },
    destCoords: { x: 900, y: 300 },
    incidentCoords: { x: 500, y: 300 },
    incidentLabel: 'Accident on NH11',
    baseRoutePoints: [
      { x: 100, y: 300 }, { x: 200, y: 300 }, { x: 300, y: 300 },
      { x: 400, y: 300 }, { x: 500, y: 300 }, { x: 600, y: 300 },
      { x: 700, y: 300 }, { x: 800, y: 300 }, { x: 900, y: 300 }
    ],
    detourRoutePoints: [
      { x: 100, y: 300 }, { x: 200, y: 300 }, { x: 300, y: 300 },
      { x: 400, y: 150 }, { x: 500, y: 150 }, { x: 600, y: 150 },
      { x: 700, y: 300 }, { x: 800, y: 300 }, { x: 900, y: 300 }
    ],
    baseDistanceKm: 45.2,
    baseDurationMins: 55,
    detourDistanceKm: 52.8,
    detourDurationMins: 70,
    corridorName: 'NH11 Corridor',
    detourCorridorName: 'SH2A Bypass'
  },
  {
    id: 'scen_002',
    title: 'Low Battery Emergency in Jaipur',
    description: 'Vehicle SOC dropped unexpectedly due to heat. Rerouting to nearest fast charger.',
    severity: 'high',
    weather: 'clear',
    originName: 'Jaipur North Depot',
    destinationName: 'Sitapura Industrial Area',
    originCoords: { x: 150, y: 150 },
    destCoords: { x: 850, y: 550 },
    incidentCoords: { x: 600, y: 400 },
    incidentLabel: 'SOC Critical (8%)',
    baseRoutePoints: [
      { x: 150, y: 150 }, { x: 250, y: 200 }, { x: 350, y: 250 },
      { x: 450, y: 300 }, { x: 550, y: 350 }, { x: 650, y: 450 },
      { x: 750, y: 500 }, { x: 850, y: 550 }
    ],
    detourRoutePoints: [
      { x: 150, y: 150 }, { x: 250, y: 200 }, { x: 350, y: 250 },
      { x: 450, y: 300 }, { x: 550, y: 350 }, { x: 500, y: 500 },
      { x: 550, y: 550 } // Charging station
    ],
    baseDistanceKm: 32.5,
    baseDurationMins: 45,
    detourDistanceKm: 28.0,
    detourDurationMins: 40,
    corridorName: 'Tonk Road Main',
    detourCorridorName: 'JLN Marg to Charger Hub'
  },
  {
    id: 'scen_003',
    title: 'Traffic Congestion in Delhi',
    description: 'Heavy traffic on Outer Ring Road due to rain. Activating green corridor routing.',
    severity: 'medium',
    weather: 'rain',
    originName: 'Okhla Hub',
    destinationName: 'Rohini Sector 3',
    originCoords: { x: 800, y: 500 },
    destCoords: { x: 200, y: 100 },
    incidentCoords: { x: 500, y: 350 },
    incidentLabel: 'Severe Congestion (+45m)',
    baseRoutePoints: [
      { x: 800, y: 500 }, { x: 700, y: 450 }, { x: 600, y: 400 },
      { x: 500, y: 350 }, { x: 400, y: 300 }, { x: 300, y: 200 },
      { x: 200, y: 100 }
    ],
    detourRoutePoints: [
      { x: 800, y: 500 }, { x: 750, y: 400 }, { x: 700, y: 300 },
      { x: 650, y: 200 }, { x: 500, y: 150 }, { x: 350, y: 120 },
      { x: 200, y: 100 }
    ],
    baseDistanceKm: 28.4,
    baseDurationMins: 85,
    detourDistanceKm: 34.2,
    detourDurationMins: 55,
    corridorName: 'Outer Ring Road',
    detourCorridorName: 'Inner City Green Route'
  }
];
