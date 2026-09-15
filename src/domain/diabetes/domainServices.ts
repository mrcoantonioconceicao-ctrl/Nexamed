// Domain Services for DiabetesManagement Bounded Context (DDD)
import { 
  GlycemicMeasurement, 
  GlycemicClassification, 
  GlycemicContext,
  DiabetesCareProfile, 
  InjectionSite,
  InsulinAdministration 
} from './types';

export class GlycemicDomainService {
  /**
   * Classifica a aferição com base em diretrizes clínicas da SBD/ADA
   */
  public static classifyGlycemia(value: number): GlycemicClassification {
    if (!Number.isFinite(value)) {
      return {
        urgentAlert: true,
        title: 'ERRO: Valor de Glicemia Inválido',
        actionText: 'Não foi possível interpretar o valor da glicemia. Por favor, verifique se o valor é um número válido e finito.',
        level: 'emergency',
        bpmnStepId: 'TASK_ERROR_INVALID_GLYCEMIA_VALUE'
      };
    }

    if (value < 54) {
      return 'VERY_LOW';
    }
    if (value < 70) {
      return 'LOW';
    }
    if (value <= 180) {
      return 'IN_TARGET';
    }
    if (value <= 250) {
      return 'HIGH';
    }
    return 'VERY_HIGH';
  }

  /**
   * Calcula métricas de Time in Range (TIR), Média, Desvio Padrão e CV%
   */
  public static calculateTIRMetrics(measurements: GlycemicMeasurement[]) {
    if (!measurements || measurements.length === 0) {
      return {
        totalReadings: 0,
        averageGlucose: 0,
        tirPercentage: 0, // 70-180 mg/dL
        tbrPercentage: 0, // < 70 mg/dL
        tarPercentage: 0, // > 180 mg/dL
        severeHypoCount: 0, // < 54 mg/dL
        glycemicVariabilityCV: 0, // % CV
        estimatedGMI: 0, // HbA1c estimada
      };
    }

    const values = measurements.map(m => m.value);
    const total = values.length;
    const sum = values.reduce((acc, v) => acc + v, 0);
    const mean = Math.round(sum / total);

    // Contagens
    const inRange = values.filter(v => v >= 70 && v <= 180).length;
    const belowRange = values.filter(v => v < 70).length;
    const aboveRange = values.filter(v => v > 180).length;
    const severeHypo = values.filter(v => v < 54).length;

    // Desvio Padrão
    const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / total;
    const standardDeviation = Math.sqrt(variance);

    // Coeficiente de Variação (CV% = DP / Média * 100)
    const cv = mean > 0 ? Math.round((standardDeviation / mean) * 100) : 0;

    // Glucose Management Indicator (GMI / HbA1c Estimada): (Média + 46.7) / 28.7
    const gmi = Number(((mean + 46.7) / 28.7).toFixed(1));

    return {
      totalReadings: total,
      averageGlucose: mean,
      tirPercentage: Math.round((inRange / total) * 100),
      tbrPercentage: Math.round((belowRange / total) * 100),
      tarPercentage: Math.round((aboveRange / total) * 100),
      severeHypoCount: severeHypo,
      glycemicVariabilityCV: cv,
      estimatedGMI: gmi,
    };
  }

  /**
   * Lógica de recomendação de rodízio de aplicação subcutânea
   * Evita hipertrofia e lipodistrofia alternando quadrantes anatômicos
   */
  public static recommendNextInjectionSite(
    recentLogs: InsulinAdministration[]
  ): { recommendedSite: InjectionSite; rationale: string } {
    const allSites: InjectionSite[] = [
      'Abdômen Superior Direito',
      'Abdômen Superior Esquerdo',
      'Abdômen Inferior Direito',
      'Abdômen Inferior Esquerdo',
      'Coxa Anterior Direita',
      'Coxa Anterior Esquerda',
      'Braço Posterior Direito',
      'Braço Posterior Esquerdo'
    ];

    if (!recentLogs || recentLogs.length === 0) {
      return {
        recommendedSite: allSites[0],
        rationale: 'Início do ciclo de rodízio pelo quadrante abdominal superior direito.'
      };
    }

    const lastSite = recentLogs[0].injectionSite;
    const currentIndex = allSites.indexOf(lastSite);
    const nextIndex = (currentIndex + 1) % allSites.length;
    const nextSite = allSites[nextIndex];

    return {
      recommendedSite: nextSite,
      rationale: `Última aplicação realizada em "${lastSite}". Alternar para "${nextSite}" para preservar a integridade tecidual e evitar lipo-hipertrofia.`
    };
  }

  /**
   * Avalia a conduta imediata para um valor de HGT
   */
  public static determineImmediateAction(
    value: number,
    profile: DiabetesCareProfile
  ): {
    urgentAlert: boolean;
    title: string;
    actionText: string;
    level: 'emergency' | 'warning' | 'normal';
    bpmnStepId: string;
  } {
    if (value < 54) {
      return {
        urgentAlert: true,
        title: 'ALERTA CRÍTICO: Hipoglicemia Grave (< 54 mg/dL)',
        actionText: 'Risco iminente de perda de consciência ou convulsão. Administrar 15g de carboidrato rápido se a residente estiver lúcida e engolindo (150ml suco com 1 colher de açúcar). Se rebaixamento de nível de consciência ou disfagia aguda, NÃO OFERTAR LÍQUIDOS VIA ORAL (risco de aspiração) e acionar SAMU 192 imediatamente para glicose 50% EV.',
        level: 'emergency',
        bpmnStepId: 'TASK_RESCUE_SEVERE_HYPO'
      };
    }

    if (value < 70) {
      return {
        urgentAlert: true,
        title: 'ATENÇÃO: Hipoglicemia (< 70 mg/dL)',
        actionText: 'Aplicar a Regra dos 15g: Oferecer 15g de carboidrato de rápida absorção (1 copo pequeno de 150ml de suco integral de uva ou água adoçada). Aguardar 15 minutos em repouso e re-testar HGT. Se permanecer < 70, repetir a dose.',
        level: 'warning',
        bpmnStepId: 'TASK_RESCUE_MILD_HYPO'
      };
    }

    if (value > 250) {
      return {
        urgentAlert: true,
        title: 'ATENÇÃO: Hiperglicemia Acentuada (> 250 mg/dL)',
        actionText: 'Verificar prescrição médica para escala móvel de Insulina Regular. Ofertar hidratação hídrica abundante (água fracionada). Avaliar queixas de náuseas, vômitos, dor abdominal ou hálito cetônico. Notificar o enfermeiro ou médico assistente da residência.',
        level: 'warning',
        bpmnStepId: 'TASK_MANAGE_SEVERE_HYPER'
      };
    }

    if (value > 180) {
      return {
        urgentAlert: false,
        title: 'Hiperglicemia Pós-Prandial (> 180 mg/dL)',
        actionText: 'Valor acima da meta ideal. Estimular ingestão hídrica e evitar beliscos calóricos entre as refeições programadas. Reavaliar no próximo horário de checagem.',
        level: 'normal',
        bpmnStepId: 'TASK_EVAL_MILD_HYPER'
      };
    }

    return {
      urgentAlert: false,
      title: 'Euglicemia (Faixa Alvo 70-180 mg/dL)',
      actionText: 'Controle glicêmico excelente dentro da meta terapêutica. Liberar alimentação de rotina planejada pela nutrição.',
      level: 'normal',
      bpmnStepId: 'TASK_TARGET_RANGE_OK'
    };
  }
}
