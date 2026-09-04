/**
 * Domain-Driven Design (DDD) - Pure Domain Rules and Calculations
 * Clean Code: Single Responsibility, deterministic logic, zero side effects.
 */

import { 
  GlycemicZone, 
  InjectionSite, 
  SlidingScaleRule, 
  GlycemicRecord 
} from './types';

export const SITES_ORDER: InjectionSite[] = [
  'Abdomen Superior Direito',
  'Abdomen Superior Esquerdo',
  'Abdomen Inferior Direito',
  'Abdomen Inferior Esquerdo',
  'Braço Posterior Direito',
  'Braço Posterior Esquerdo',
  'Coxa Anterior Direita',
  'Coxa Anterior Esquerda',
  'Glúteo Superior Direito',
  'Glúteo Superior Esquerdo'
];

/**
 * Classifies a blood glucose reading into standard clinical zones (SBD/ADA)
 */
export function classifyGlycemicZone(bgValue: number): GlycemicZone {
  if (bgValue < 54) return 'VERY_LOW';
  if (bgValue < 70) return 'LOW';
  if (bgValue <= 180) return 'IN_TARGET';
  if (bgValue <= 250) return 'HIGH';
  return 'VERY_HIGH';
}

/**
 * Human-readable label and color scheme for glycemic zones
 */
export function getGlycemicZoneDetails(zone: GlycemicZone) {
  switch (zone) {
    case 'VERY_LOW':
      return {
        label: 'Hipoglicemia Severa (< 54 mg/dL)',
        badgeColor: 'bg-rose-600 text-white border-rose-700 animate-pulse',
        textColor: 'text-rose-600',
        severity: 'Crítico',
        urgencyDescription: 'Risco de perda de consciência / convulsão. Iniciar resgate imediato!'
      };
    case 'LOW':
      return {
        label: 'Hipoglicemia (< 70 mg/dL)',
        badgeColor: 'bg-amber-500 text-white border-amber-600',
        textColor: 'text-amber-600',
        severity: 'Urgente',
        urgencyDescription: 'Acionar Regra dos 15: ofertar 15g de carboidrato rápido e reavaliar em 15 min.'
      };
    case 'IN_TARGET':
      return {
        label: 'Alvo Terapêutico (70 - 180 mg/dL)',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200',
        textColor: 'text-emerald-600',
        severity: 'Normal',
        urgencyDescription: 'Controle metabólico adequado para ambiente de residência terapêutica.'
      };
    case 'HIGH':
      return {
        label: 'Hiperglicemia (181 - 250 mg/dL)',
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200',
        textColor: 'text-amber-600',
        severity: 'Atenção',
        urgencyDescription: 'Estimular hidratação oral com água e monitorar próxima aferição.'
      };
    case 'VERY_HIGH':
      return {
        label: 'Hiperglicemia Severa (> 250 mg/dL)',
        badgeColor: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950 dark:text-rose-200',
        textColor: 'text-rose-700',
        severity: 'Alto Risco',
        urgencyDescription: 'Verificar prescrição de escala móvel (Insulina Regular) e comunicar médico/enfermeiro.'
      };
  }
}

/**
 * Calculates Time-in-Range (TIR) metrics from a collection of records
 */
export function calculateTimeInRangeMetrics(records: GlycemicRecord[]) {
  if (records.length === 0) {
    return {
      total: 0,
      veryLowPct: 0,
      lowPct: 0,
      inTargetPct: 0,
      highPct: 0,
      veryHighPct: 0,
      averageBg: 0,
      glycemicVariability: 0
    };
  }

  const total = records.length;
  let veryLow = 0;
  let low = 0;
  let inTarget = 0;
  let high = 0;
  let veryHigh = 0;
  let sumBg = 0;

  for (const r of records) {
    sumBg += r.value;
    switch (r.zone) {
      case 'VERY_LOW': veryLow++; break;
      case 'LOW': low++; break;
      case 'IN_TARGET': inTarget++; break;
      case 'HIGH': high++; break;
      case 'VERY_HIGH': veryHigh++; break;
    }
  }

  const averageBg = Math.round(sumBg / total);

  // Standard deviation for glycemic variability
  const variance = records.reduce((acc, r) => acc + Math.pow(r.value - averageBg, 2), 0) / total;
  const stdDev = Math.round(Math.sqrt(variance));
  const glycemicVariability = averageBg > 0 ? Math.round((stdDev / averageBg) * 100) : 0;

  return {
    total,
    veryLowPct: Math.round((veryLow / total) * 100),
    lowPct: Math.round((low / total) * 100),
    inTargetPct: Math.round((inTarget / total) * 100),
    highPct: Math.round((high / total) * 100),
    veryHighPct: Math.round((veryHigh / total) * 100),
    averageBg,
    glycemicVariability // < 36% is clinically stable
  };
}

/**
 * Determines insulin correction units based on physician's sliding scale
 */
export function calculateSlidingScaleDose(
  bgValue: number, 
  rules: SlidingScaleRule[]
): { units: number; recommendation: string } {
  for (const rule of rules) {
    if (bgValue >= rule.minBg && bgValue <= rule.maxBg) {
      return {
        units: rule.regularInsulinUnits,
        recommendation: rule.recommendation
      };
    }
  }

  if (bgValue > 250) {
    return {
      units: 6,
      recommendation: 'Aplicar 6 UI de Insulina Regular SC e notificar imediatamente o Enfermeiro RT / Médico assistente.'
    };
  }

  return {
    units: 0,
    recommendation: 'Glicemia dentro ou abaixo do limiar de correção da escala móvel. Não aplicar insulina de correção.'
  };
}

/**
 * Recommends the next anatomical injection site to prevent lipodystrophy
 */
export function getNextInjectionSite(lastUsedSite?: InjectionSite): InjectionSite {
  if (!lastUsedSite) return SITES_ORDER[0];
  const currentIndex = SITES_ORDER.indexOf(lastUsedSite);
  if (currentIndex === -1 || currentIndex === SITES_ORDER.length - 1) {
    return SITES_ORDER[0];
  }
  return SITES_ORDER[currentIndex + 1];
}
