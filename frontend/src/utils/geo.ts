/**
 * Calculate geographical distance between two lat/lng points using Haversine formula (km)
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Format distance nicely (e.g. "850 m" or "4.2 km")
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Calculate approximate ETA in minutes given distance (km) and average speed (km/h)
 */
export function calculateEtaMinutes(distanceKm: number, averageSpeedKph: number = 25): number {
  if (distanceKm <= 0) return 0;
  const speed = Math.max(averageSpeedKph, 10);
  const hours = distanceKm / speed;
  return Math.max(1, Math.round(hours * 60));
}
