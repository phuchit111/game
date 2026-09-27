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

type PlanarPoint = { x: number; y: number };

const POLYGON_SAMPLE_INTERVAL_METERS = 5;
const POLYGON_SOFT_TOLERANCE_METERS = 16;
const POLYGON_HARD_TOLERANCE_METERS = 24;
const MIN_POLYGON_AREA_RATIO = 0.78;
const MAX_POLYGON_AREA_RATIO = 1.25;
const MIN_BOUNDARY_COVERAGE = 0.9;

function toPlanarPoint(point: L.LatLng, origin: L.LatLng): PlanarPoint {
  const metersPerLatitudeDegree = 111_320;
  const metersPerLongitudeDegree = metersPerLatitudeDegree * Math.cos((origin.lat * Math.PI) / 180);

  return {
    x: (point.lng - origin.lng) * metersPerLongitudeDegree,
    y: (point.lat - origin.lat) * metersPerLatitudeDegree,
  };
}

function planarPolygonArea(points: PlanarPoint[]): number {
  let area = 0;
  for (let index = 0; index < points.length; index++) {
    const current = points[index];
    const next = points[(index + 1) % points.length];
    area += current.x * next.y - next.x * current.y;
  }
  return Math.abs(area) / 2;
}

function pointToSegmentDistanceMeters(point: PlanarPoint, start: PlanarPoint, end: PlanarPoint): number {
  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;
  const segmentLengthSquared = deltaX * deltaX + deltaY * deltaY;

  if (segmentLengthSquared === 0) {
    return Math.hypot(point.x - start.x, point.y - start.y);
  }

  const ratio = Math.max(
    0,
    Math.min(1, ((point.x - start.x) * deltaX + (point.y - start.y) * deltaY) / segmentLengthSquared)
  );
  const closestX = start.x + ratio * deltaX;
  const closestY = start.y + ratio * deltaY;
  return Math.hypot(point.x - closestX, point.y - closestY);
}

function samplePolygonBoundary(points: PlanarPoint[]): PlanarPoint[] {
  const samples: PlanarPoint[] = [];

  for (let index = 0; index < points.length; index++) {
    const start = points[index];
    const end = points[(index + 1) % points.length];
    const segmentLength = Math.hypot(end.x - start.x, end.y - start.y);
    const sampleCount = Math.max(1, Math.ceil(segmentLength / POLYGON_SAMPLE_INTERVAL_METERS));

    for (let sampleIndex = 0; sampleIndex < sampleCount; sampleIndex++) {
      const ratio = sampleIndex / sampleCount;
      samples.push({
        x: start.x + (end.x - start.x) * ratio,
        y: start.y + (end.y - start.y) * ratio,
      });
    }
  }

  return samples;
}

function hasSufficientBoundaryCoverage(samples: PlanarPoint[], boundary: PlanarPoint[]): boolean {
  let samplesWithinSoftTolerance = 0;

  for (const sample of samples) {
    let closestDistance = Infinity;

    for (let index = 0; index < boundary.length; index++) {
      const distance = pointToSegmentDistanceMeters(sample, boundary[index], boundary[(index + 1) % boundary.length]);
      closestDistance = Math.min(closestDistance, distance);
    }

    if (closestDistance > POLYGON_HARD_TOLERANCE_METERS) return false;
    if (closestDistance <= POLYGON_SOFT_TOLERANCE_METERS) samplesWithinSoftTolerance++;
  }

  return samplesWithinSoftTolerance / samples.length >= MIN_BOUNDARY_COVERAGE;
}

/**
 * Checks whether a drawn polygon traces a reference boundary closely enough for a
 * map exercise. It measures the two boundaries in metres, so a trace just inside
 * or outside a guide is accepted without allowing a different, enclosing shape.
 */
export function polygonFollowsReference(
  userLatLngs: L.LatLng[],
  referenceCoordinates: [number, number][]
): boolean {
  if (userLatLngs.length < 3 || referenceCoordinates.length < 3) return false;

  const referenceLatLngs = referenceCoordinates.map(([lat, lng]) => L.latLng(lat, lng));
  const origin = L.latLng(
    referenceLatLngs.reduce((sum, point) => sum + point.lat, 0) / referenceLatLngs.length,
    referenceLatLngs.reduce((sum, point) => sum + point.lng, 0) / referenceLatLngs.length
  );
  const userPoints = userLatLngs.map((point) => toPlanarPoint(point, origin));
  const referencePoints = referenceLatLngs.map((point) => toPlanarPoint(point, origin));
  const referenceArea = planarPolygonArea(referencePoints);
  const userArea = planarPolygonArea(userPoints);

  if (referenceArea === 0) return false;

  const areaRatio = userArea / referenceArea;
  if (areaRatio < MIN_POLYGON_AREA_RATIO || areaRatio > MAX_POLYGON_AREA_RATIO) return false;

  return (
    hasSufficientBoundaryCoverage(samplePolygonBoundary(userPoints), referencePoints) &&
    hasSufficientBoundaryCoverage(samplePolygonBoundary(referencePoints), userPoints)
  );
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
