import type { MissionId } from './types/player';

export const MISSION_IDS: readonly MissionId[] = [
  'vector',
  'attribute',
  'raster',
  'rs',
  'coordinate',
];

export type AppRoute =
  | { type: 'welcome' }
  | { type: 'hub' }
  | { type: 'mission'; missionId: MissionId };

const missionIdSet = new Set<string>(MISSION_IDS);

export const isMissionId = (value: string): value is MissionId => missionIdSet.has(value);

const normalizePathname = (pathname: string) => {
  const withoutTrailingSlash = pathname.replace(/\/+$/, '');
  return withoutTrailingSlash || '/';
};

const decodeRouteSegment = (segment: string) => {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
};

/** Resolves /missions/:missionId without requiring a routing dependency. */
export const resolveRoute = (pathname: string): AppRoute => {
  const normalizedPathname = normalizePathname(pathname);

  if (normalizedPathname === '/') return { type: 'welcome' };
  if (normalizedPathname === '/missions') return { type: 'hub' };

  const missionMatch = normalizedPathname.match(/^\/missions\/([^/]+)$/);
  const missionId = missionMatch ? decodeRouteSegment(missionMatch[1]) : '';

  if (isMissionId(missionId)) {
    return { type: 'mission', missionId };
  }

  return { type: 'welcome' };
};

export const pathForRoute = (route: AppRoute) => {
  if (route.type === 'welcome') return '/';
  if (route.type === 'hub') return '/missions';
  return `/missions/${route.missionId}`;
};
