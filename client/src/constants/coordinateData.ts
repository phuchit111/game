import type { UTMTarget } from '../types/coordinateMission';

export const GRID_X_MIN = -3;
export const GRID_X_MAX = 3;
export const GRID_Y_MIN = -3;
export const GRID_Y_MAX = 3;

export const MAP_SIZE_PX = 640;
export const GRID_LEFT_PX = 18;
export const GRID_RIGHT_PX = MAP_SIZE_PX - 18;
export const GRID_TOP_PX = 18;
export const GRID_BOTTOM_PX = MAP_SIZE_PX - 18;

export const ORIGIN_X_PX = GRID_LEFT_PX + (0 - GRID_X_MIN) / (GRID_X_MAX - GRID_X_MIN) * (GRID_RIGHT_PX - GRID_LEFT_PX);
export const ORIGIN_Y_PX = GRID_TOP_PX + (GRID_Y_MAX - 0) / (GRID_Y_MAX - GRID_Y_MIN) * (GRID_BOTTOM_PX - GRID_TOP_PX);
export const CELL_X_PX = (GRID_RIGHT_PX - GRID_LEFT_PX) / (GRID_X_MAX - GRID_X_MIN);
export const CELL_Y_PX = (GRID_BOTTOM_PX - GRID_TOP_PX) / (GRID_Y_MAX - GRID_Y_MIN);

export const UTM_E0 = 500000;
export const UTM_N0 = 1600000;
export const UTM_STEP = 100000;

// Mission reference position: WGS84 / UTM zone 48N central meridian.
// At this longitude the reference point sits on the 500,000 m false easting
// line and the 1,600,000 m northing line used by the 100 km grid.
export const REFERENCE_LAT = 14.472649;
export const REFERENCE_LON = 105.00000;
export const REFERENCE_UTM_E = UTM_E0;
export const REFERENCE_UTM_N = UTM_N0;

// Survey control points supplied for the WGS84 / UTM zone 48 overlay.
// The slight latitude and longitude differences are intentional: the grid
// lines are positioned from these geographic control points on the basemap.
export const UTM_EASTING_REFERENCE_POINTS = [
  { x: -3, E: 200000, N: 1600000, lat: 14.456197, lon: 102.217371 },
  { x: -2, E: 300000, N: 1600000, lat: 14.465333, lon: 103.144481 },
  { x: -1, E: 400000, N: 1600000, lat: 14.470820, lon: 104.072110 },
  { x: 0, E: 500000, N: 1600000, lat: 14.472649, lon: 105.000000 },
  { x: 1, E: 600000, N: 1600000, lat: 14.470820, lon: 105.927890 },
  { x: 2, E: 700000, N: 1600000, lat: 14.465333, lon: 106.855519 },
  { x: 3, E: 800000, N: 1600000, lat: 14.456197, lon: 107.782629 },
] as const;

export const UTM_NORTHING_REFERENCE_POINTS = [
  { y: -3, E: 500000, N: 1300000, lat: 11.759863, lon: 105.000000 },
  { y: -2, E: 500000, N: 1400000, lat: 12.664188, lon: 105.000000 },
  { y: -1, E: 500000, N: 1500000, lat: 13.568451, lon: 105.000000 },
  { y: 0, E: 500000, N: 1600000, lat: 14.472649, lon: 105.000000 },
  { y: 1, E: 500000, N: 1700000, lat: 15.376778, lon: 105.000000 },
  { y: 2, E: 500000, N: 1800000, lat: 16.280833, lon: 105.000000 },
  { y: 3, E: 500000, N: 1900000, lat: 17.184812, lon: 105.000000 },
] as const;

export function gridToUTM(x: number, y: number): UTMTarget {
  return {
    x,
    y,
    E: UTM_E0 + x * UTM_STEP,
    N: UTM_N0 + y * UTM_STEP,
  };
}

export function utmToGrid(E: number, N: number): { x: number; y: number } {
  return {
    x: Math.round((E - UTM_E0) / UTM_STEP),
    y: Math.round((N - UTM_N0) / UTM_STEP),
  };
}

export function fmtNum(n: number): string {
  return n.toLocaleString('en-US');
}

export function dataToPx(x: number, y: number): { px: number; py: number } {
  return {
    px: ORIGIN_X_PX + x * CELL_X_PX,
    py: ORIGIN_Y_PX - y * CELL_Y_PX,
  };
}

export function pxToData(px: number, py: number): { x: number; y: number } {
  return {
    x: Math.max(GRID_X_MIN, Math.min(GRID_X_MAX, Math.round((px - ORIGIN_X_PX) / CELL_X_PX))),
    y: Math.max(GRID_Y_MIN, Math.min(GRID_Y_MAX, Math.round((ORIGIN_Y_PX - py) / CELL_Y_PX))),
  };
}

export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
