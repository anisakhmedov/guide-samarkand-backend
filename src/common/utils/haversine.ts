export interface LatLng {
  lat: number;
  lng: number;
}

/** Great-circle distance in meters between two points. */
export function haversineDistanceMeters(a: LatLng, b: LatLng): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const WALKING_SPEED_M_PER_MIN = 80; // ~4.8 km/h
const TRANSPORT_SPEED_M_PER_MIN = 400; // ~24 km/h average incl. stops, city traffic

export function estimateDurationMinutes(distanceMeters: number, transport: 'walking' | 'transport'): number {
  const speed = transport === 'walking' ? WALKING_SPEED_M_PER_MIN : TRANSPORT_SPEED_M_PER_MIN;
  return Math.max(1, Math.round(distanceMeters / speed));
}

/**
 * Orders a set of points into a short round trip starting from `start` using a
 * simple nearest-neighbour heuristic. Good enough for guest-built routes of a
 * handful of stops; not a true TSP solver.
 */
export function orderByNearestNeighbour<T extends LatLng>(start: LatLng, points: T[]): T[] {
  const remaining = [...points];
  const ordered: T[] = [];
  let current = start;

  while (remaining.length) {
    let bestIdx = 0;
    let bestDist = Infinity;
    remaining.forEach((p, i) => {
      const d = haversineDistanceMeters(current, p);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    });
    const [next] = remaining.splice(bestIdx, 1);
    ordered.push(next);
    current = next;
  }

  return ordered;
}
