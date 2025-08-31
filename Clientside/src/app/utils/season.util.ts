//Tiny helpers for season + watering status

export type Season = 'Spring' | 'Summer' | 'Autumn' | 'Winter';
export type Severity = 'ok' | 'soon' | 'due' | 'info';

function safeDate(iso: string): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
}

export function seasonFromDate(iso: string): Season {
  const d = safeDate(iso) ?? new Date();
  const m = d.getMonth(); // 0=Jan
  if (m >= 2 && m <= 4) return 'Spring';  // Mar–May
  if (m >= 5 && m <= 7) return 'Summer';  // Jun–Aug
  if (m >= 8 && m <= 10) return 'Autumn'; // Sep–Nov
  return 'Winter';                         // Dec–Feb
}

/**
 * Returns days until watering is due (0=today).
 * - freq 3 = daily -> 0
 * - freq 2 = weekly -> days until next 7-day multiple from planting date
 * - freq 1 (low) -> null (as-needed)
 */
export function daysUntilNextWater(plantingISO: string, freq: number | undefined): number | null {
  if (!freq || freq === 1) return null;
  if (freq === 3) return 0;
  const planted = safeDate(plantingISO);
  if (!planted) return null;

  const MS = 24 * 60 * 60 * 1000;
  const today = new Date();
  const daysSince = Math.floor((Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) -
                                Date.UTC(planted.getFullYear(), planted.getMonth(), planted.getDate())) / MS);
  const mod = ((daysSince % 7) + 7) % 7;
  return mod === 0 ? 0 : 7 - mod;
}

export function wateringStatus(plantingISO: string, freq: number | undefined): { label: string; severity: Severity } {
  const d = daysUntilNextWater(plantingISO, freq);
  if (d === null) return { label: 'Low — as needed', severity: 'info' };
  if (d === 0)    return { label: 'Water today',      severity: 'due'  };
  if (d <= 2)     return { label: `In ${d} day${d===1?'':'s'}`, severity: 'soon' };
  return { label: `In ${d} days`, severity: 'ok' };
}
