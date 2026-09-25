import type { PointRecord, Category, CatalogItem } from '../types/mission';
import { CATALOG, GAME_CONFIG } from '../constants/catalog';

export function matchCatalogType(category: Category, userType: string): CatalogItem | null {
  const cleanType = userType.trim();
  if (!cleanType) return null;
  const items = CATALOG[category];
  if (!items) return null;
  const match = items.find(item => item[0].trim() === cleanType);
  return match || null;
}

export function calculateTotalSpent(points: PointRecord[]): number {
  return points.reduce((sum, p) => {
    return sum + (p.matched ? p.matched[1] : 0);
  }, 0);
}

export function calculateAttributeScore(points: PointRecord[]): number {
  return points.reduce((sum, p) => {
    return sum + (p.matched ? p.matched[2] : 0);
  }, 0);
}

export function calculateBudgetPenalty(spent: number): number {
  const over = spent - GAME_CONFIG.TOTAL_BUDGET;
  if (over <= 0) return 0;
  return Math.ceil(over / GAME_CONFIG.PENALTY_UNIT) * GAME_CONFIG.PENALTY_PER_UNIT;
}

export function calculateEffectiveScore(points: PointRecord[]): number {
  const rawScore = calculateAttributeScore(points);
  const spent = calculateTotalSpent(points);
  const penalty = calculateBudgetPenalty(spent);
  return Math.max(0, rawScore - penalty);
}

export function formatMoney(amount: number): string {
  return Number(amount).toLocaleString('th-TH');
}

export function formatTime(seconds: number): string {
  const m = Math.max(0, Math.floor(seconds / 60));
  const s = Math.max(0, seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
