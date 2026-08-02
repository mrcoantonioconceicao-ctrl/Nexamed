export interface VitalsInput {
  systolicBP: number;
  diastolicBP?: number;
  heartRate: number;
  temp: number;
  spO2: number;
  respRate: number;
  consciousness?: 'Alerta' | 'Voz' | 'Dor' | 'Inconsciente';
  supplementalO2?: boolean;
}

export interface News2Result {
  totalScore: number;
  riskLevel: 'Baixo' | 'Moderado' | 'Alto' | 'Crítico';
  colorClass: string;
  badgeBg: string;
  badgeText: string;
  borderClass: string;
  recommendedAction: string;
  breakdown: {
    respRateScore: number;
    spO2Score: number;
    supplementalO2Score: number;
    systolicBPScore: number;
    heartRateScore: number;
    tempScore: number;
    consciousnessScore: number;
  };
}

/**
 * Calculates NEWS2 (National Early Warning Score 2) based on Royal College of Physicians guidelines.
 */
export function calculateNEWS2Risk(vitals: VitalsInput): News2Result {
  const {
    systolicBP,
    heartRate,
    temp,
    spO2,
    respRate,
    consciousness = 'Alerta',
    supplementalO2 = false
  } = vitals;

  // 1. Respiratory Rate (breaths/min)
  let respRateScore = 0;
  if (respRate <= 8 || respRate >= 25) respRateScore = 3;
  else if (respRate >= 21 && respRate <= 24) respRateScore = 2;
  else if (respRate >= 9 && respRate <= 11) respRateScore = 1;

  // 2. SpO2 Scale 1 (%)
  let spO2Score = 0;
  if (spO2 <= 91) spO2Score = 3;
  else if (spO2 >= 92 && spO2 <= 93) spO2Score = 2;
  else if (spO2 >= 94 && spO2 <= 95) spO2Score = 1;

  // 3. Air or Oxygen
  const supplementalO2Score = supplementalO2 ? 2 : 0;

  // 4. Systolic Blood Pressure (mmHg)
  let systolicBPScore = 0;
  if (systolicBP <= 90 || systolicBP >= 220) systolicBPScore = 3;
  else if (systolicBP >= 91 && systolicBP <= 100) systolicBPScore = 2;
  else if (systolicBP >= 101 && systolicBP <= 110) systolicBPScore = 1;

  // 5. Pulse / Heart Rate (bpm)
  let heartRateScore = 0;
  if (heartRate <= 40 || heartRate >= 131) heartRateScore = 3;
  else if (heartRate >= 111 && heartRate <= 130) heartRateScore = 2;
  else if (heartRate <= 50 || (heartRate >= 91 && heartRate <= 110)) heartRateScore = 1;

  // 6. Temperature (°C)
  let tempScore = 0;
  if (temp <= 35.0) tempScore = 3;
  else if (temp >= 39.1) tempScore = 2;
  else if ((temp >= 35.1 && temp <= 36.0) || (temp >= 38.1 && temp <= 39.0)) tempScore = 1;

  // 7. Consciousness (AVPU scale)
  let consciousnessScore = 0;
  if (consciousness !== 'Alerta') consciousnessScore = 3;

  const totalScore = 
    respRateScore + 
    spO2Score + 
    supplementalO2Score + 
    systolicBPScore + 
    heartRateScore + 
    tempScore + 
    consciousnessScore;

  let riskLevel: 'Baixo' | 'Moderado' | 'Alto' | 'Crítico' = 'Baixo';
  let recommendedAction = 'Manter aferição padrão a cada 12 horas (rotina).';
  let colorClass = 'text-emerald-400';
  let badgeBg = 'bg-emerald-950/80';
  let badgeText = 'text-emerald-300';
  let borderClass = 'border-emerald-800/80';

  // Check for single score of 3 or higher total score
  const hasSingleScore3 = [respRateScore, spO2Score, systolicBPScore, heartRateScore, tempScore, consciousnessScore].some(s => s === 3);

  if (totalScore >= 7) {
    riskLevel = 'Crítico';
    recommendedAction = 'ALERTA MÁXIMO: Notificação emergencial imediata ao Médico RT. Monitorização contínua de beira-leito e preparo de kit de emergência.';
    colorClass = 'text-rose-400';
    badgeBg = 'bg-rose-950/90';
    badgeText = 'text-rose-200';
    borderClass = 'border-rose-700/80';
  } else if (totalScore >= 5 || hasSingleScore3) {
    riskLevel = 'Alto';
    recommendedAction = 'Aviso urgente ao Enfermeiro RT e avaliação médica prioritária em até 1 hora. Aferição de sinais vitais a cada 1 hora.';
    colorClass = 'text-amber-400';
    badgeBg = 'bg-amber-950/90';
    badgeText = 'text-amber-200';
    borderClass = 'border-amber-700/80';
  } else if (totalScore >= 1) {
    riskLevel = 'Moderado';
    recommendedAction = 'Avaliação por Enfermeiro em até 30 min. Aumentar frequência de aferição para a cada 4 a 6 horas.';
    colorClass = 'text-yellow-400';
    badgeBg = 'bg-yellow-950/90';
    badgeText = 'text-yellow-200';
    borderClass = 'border-yellow-700/80';
  }

  return {
    totalScore,
    riskLevel,
    colorClass,
    badgeBg,
    badgeText,
    borderClass,
    recommendedAction,
    breakdown: {
      respRateScore,
      spO2Score,
      supplementalO2Score,
      systolicBPScore,
      heartRateScore,
      tempScore,
      consciousnessScore
    }
  };
}
