export interface MapPoint {
  x: number;
  y: number;
}

/**
 * Get position and heading angle at a given percentage along a polyline.
 * Used for SVG simulation canvas animation.
 */
export function getPointAndAngleAlongPolyline(
  points: MapPoint[],
  progressPercent: number
): { x: number; y: number; headingDeg: number; isEnd: boolean } {
  const p = Math.max(0, Math.min(100, progressPercent));
  
  if (points.length === 0) return { x: 0, y: 0, headingDeg: 0, isEnd: true };
  if (points.length === 1) return { x: points[0].x, y: points[0].y, headingDeg: 0, isEnd: true };
  if (p === 100) {
    const last = points[points.length - 1];
    const prev = points[points.length - 2];
    const headingDeg = (Math.atan2(last.y - prev.y, last.x - prev.x) * 180) / Math.PI;
    return { x: last.x, y: last.y, headingDeg, isEnd: true };
  }

  let totalLength = 0;
  const segments: { length: number; cumulativeLength: number }[] = [];

  for (let i = 0; i < points.length - 1; i++) {
    const dx = points[i + 1].x - points[i].x;
    const dy = points[i + 1].y - points[i].y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    totalLength += dist;
    segments.push({ length: dist, cumulativeLength: totalLength });
  }

  const targetLength = (p / 100) * totalLength;
  
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const startLength = seg.cumulativeLength - seg.length;
    
    if (targetLength <= seg.cumulativeLength) {
      const segT = seg.length === 0 ? 0 : (targetLength - startLength) / seg.length;
      const startPoint = points[i];
      const endPoint = points[i + 1];
      
      const x = startPoint.x + (endPoint.x - startPoint.x) * segT;
      const y = startPoint.y + (endPoint.y - startPoint.y) * segT;
      const headingDeg = (Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x) * 180) / Math.PI;
      
      return { x, y, headingDeg, isEnd: false };
    }
  }

  // Fallback to end
  const last = points[points.length - 1];
  const prev = points[points.length - 2];
  const headingDeg = (Math.atan2(last.y - prev.y, last.x - prev.x) * 180) / Math.PI;
  return { x: last.x, y: last.y, headingDeg, isEnd: true };
}

/**
 * Linear interpolation between two [lng, lat] geographic points.
 * t ranges from 0 to 1.
 */
export function interpolateLatLng(
  from: [number, number],
  to: [number, number],
  t: number
): [number, number] {
  return [
    from[0] + (to[0] - from[0]) * t,
    from[1] + (to[1] - from[1]) * t
  ];
}

/**
 * Calculate initial bearing in degrees (0-360) between two geographic points.
 * Uses the Haversine initial bearing formula.
 */
export function calculateBearingDeg(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = Math.PI / 180;
  const toDeg = 180 / Math.PI;
  
  const phi1 = lat1 * toRad;
  const phi2 = lat2 * toRad;
  const deltaLambda = (lng2 - lng1) * toRad;
  
  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) -
            Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
            
  const theta = Math.atan2(y, x);
  return (theta * toDeg + 360) % 360;
}

/**
 * Haversine distance between two points in kilometers.
 */
export function haversineDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const toRad = Math.PI / 180;
  
  const dLat = (lat2 - lat1) * toRad;
  const dLon = (lng2 - lng1) * toRad;
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
            
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
