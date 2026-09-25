import L from 'leaflet';
import type { KKULocation } from '../types/vectorMission';

// Line length in meters
export function calculateLineLengthMeters(latlngs: L.LatLng[]): number {
  let lengthM = 0;
  for (let i = 1; i < latlngs.length; i++) {
    lengthM += latlngs[i - 1].distanceTo(latlngs[i]);
  }
  return lengthM;
}

// Polygon perimeter in meters
export function calculatePerimeterMeters(latlngs: L.LatLng[]): number {
  let perimeter = 0;
  for (let i = 0; i < latlngs.length; i++) {
    perimeter += latlngs[i].distanceTo(latlngs[(i + 1) % latlngs.length]);
  }
  return perimeter;
}

// Geodesic Area in square meters using spherical trapezoid formula
export function calculateGeodesicArea(latlngs: L.LatLng[]): number {
  const pointsCount = latlngs.length;
  if (pointsCount < 3) return 0;

  const RADIUS = 6378137; // Earth's WGS84 mean radius in meters
  let area = 0;

  for (let i = 0; i < pointsCount; i++) {
    const p1 = latlngs[i];
    const p2 = latlngs[(i + 1) % pointsCount];
    const radLat1 = (p1.lat * Math.PI) / 180;
    const radLat2 = (p2.lat * Math.PI) / 180;
    const radLngDiff = ((p2.lng - p1.lng) * Math.PI) / 180;

    area += radLngDiff * (2 + Math.sin(radLat1) + Math.sin(radLat2));
  }

  area = (area * RADIUS * RADIUS) / 2.0;
  return Math.abs(area);
}

// Check if user's polyline visits targets in order
export function lineVisitsTargetsInOrder(
  latlngs: L.LatLng[],
  targets: KKULocation[],
  toleranceMeters: number
): boolean {
  let searchFrom = 0;
  for (const target of targets) {
    let found = false;
    for (let i = searchFrom; i < latlngs.length; i++) {
      const d = latlngs[i].distanceTo(L.latLng(target.lat, target.lng));
      if (d <= toleranceMeters) {
        found = true;
        searchFrom = i;
        break;
      }
    }
    if (!found) return false;
  }
  return true;
}

// Speed bonus calculation
export function computeSpeedBonus(basePoints: number, timeUsedSec: number, timeAllottedSec: number): number {
  const remainingRatio = Math.max(0, 1 - (timeUsedSec / timeAllottedSec));
  if (remainingRatio >= 0.5) return Math.round(basePoints * 0.5);   // >= 50% left -> +50%
  if (remainingRatio >= 0.25) return Math.round(basePoints * 0.25); // >= 25% left -> +25%
  return 0;
}
