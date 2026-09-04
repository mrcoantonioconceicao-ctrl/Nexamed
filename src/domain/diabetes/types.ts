/**
 * Domain-Driven Design (DDD) - Bounded Context: Diabetes Care
 * Entities, Value Objects, and Domain Types for Therapeutic Residence (SRT)
 */

export type GlycemicZone = 
  | 'VERY_LOW'   // < 54 mg/dL (Hipoglicemia Severa - Risco de Convulsão/Coma)
  | 'LOW'        // 54 - 69 mg/dL (Hipoglicemia Leve/Moderada - Regra dos 15)
  | 'IN_TARGET'  // 70 - 180 mg/dL (Alvo Terapêutico SBD/ADA para SRT)
  | 'HIGH'       // 181 - 250 mg/dL (Hiperglicemia - Hidratação e Atenção)
  | 'VERY_HIGH'  // > 250 mg/dL (Hiperglicemia Crítica - Escala Móvel / Médico)
  | string;

export type MealTime = 
  | 'Jejum' 
  | 'Pré-Almoço' 
  | 'Pós-Prandial (2h)' 
  | 'Pré-Jantar' 
  | 'Antes de Dormir' 
  | 'Madrugada (03:00)' 
  | 'Intercorrência';

export type InjectionSite = 
  | 'Abdomen Superior Direito' 
  | 'Abdomen Superior Esquerdo' 
  | 'Abdomen Inferior Direito' 
  | 'Abdomen Inferior Esquerdo' 
  | 'Abdômen Superior Direito' 
  | 'Abdômen Superior Esquerdo' 
  | 'Abdômen Inferior Direito' 
  | 'Abdômen Inferior Esquerdo' 
  | 'Braço Posterior Direito' 
  | 'Braço Posterior Esquerdo' 
  | 'Coxa Anterior Direita' 
  | 'Coxa Anterior Esquerda' 
  | 'Glúteo Superior Direito' 
  | 'Glúteo Superior Esquerdo';

export type InsulinType = 
  | 'NPH (Ação Intermediária)' 
  | 'Glargina / Lantus (Basal Longa)' 
  | 'Degludeca (Ultra-Longa)' 
  | 'Regular (Ação Rápida)' 
  | 'Lispro / Asparte (Ultra-Rápida)';

export interface TargetRange {
  fastingMin: number;      // ex: 80 mg/dL
  fastingMax: number;      // ex: 130 mg/dL
  postPrandialMax: number; // ex: 180 mg/dL
  bedtimeMin: number;      // ex: 100 mg/dL
  bedtimeMax: number;      // ex: 150 mg/dL
  hba1cTarget: number;     // ex: 7.5% (metas flexibilizadas para idosos em SRT)
}

export interface GlycemicRecord {
  id: string;
  residentId: string;
  residentName?: string;
  timestamp: string;
  value: number; // mg/dL
  zone?: GlycemicZone;
  classification?: GlycemicClassification;
  mealTime?: MealTime;
  context?: string;
  symptoms?: string[]; // Sudorese, tremores, confusão mental, sonolência
  measuredBy: string;
  measuredByRole?: string;
  measuredRole?: string;
  notes?: string;
  actionTaken?: string;
  rescueCarbsGiven?: boolean;
  triggeredRescueProtocol?: boolean;
  correctionInsulinGiven?: number; // Unidades aplicadas se hiperglicemia
}

export interface InsulinDoseRecord {
  id: string;
  residentId: string;
  residentName?: string;
  timestamp: string;
  insulinName?: string;
  insulinType?: InsulinType | string;
  prescribedUnits?: number;
  actualUnitsGiven?: number;
  units?: number; // Compatibility with modal/service
  injectionSite?: InjectionSite;
  site?: InjectionSite; // Compatibility with domainServices
  administeredBy: string;
  administeredByRole?: string;
  administeredRole?: string;
  checkedBy?: string; // Dupla checagem de segurança
  status?: 'Aplicado' | 'Recusado' | 'Suspenso';
  reason?: string;
  rotationVerified?: boolean;
  bloodGlucoseAtTime?: number;
  notes?: string;
}

export interface FootInspectionRecord {
  id: string;
  residentId: string;
  residentName?: string;
  date: string;
  inspectedBy: string;
  skinIntegrity: 'Íntegra' | 'Ressecamento / Fissuras' | 'Calosidade' | 'Micose Interdigital' | 'Úlcera / Lesão Ativa' | string;
  pulsesPresent: boolean; // Pulsos pediosos palpáveis
  sensitivityMonofilament: 'Preservada' | 'Diminuída' | 'Ausente';
  appropriateFootwear: boolean; // Usa calçado protetor fechado (sem costuras agressivas)
  edemaLevel: 'Ausente' | 'Leve (+/4)' | 'Moderado (++/4)' | 'Grave (+++/4)';
  actionPlan: string;
}  riskCategory: 'Grau 0 (Sem neuropatia)' | 'Grau 1 (Neuropatia)' | 'Grau 2 (Doença vascular)' | 'Grau 3 (Histórico úlcera)';
}

export interface HypoglycemiaRescueEvent {
  id: string;
  residentId: string;
  residentName: string;
  timestamp: string;
  initialBg: number; // < 70 mg/dL
  step1AdministeredAt: string;
  step1CarbType: string; // ex: "150ml Suco de Laranja / 1 colher de açúcar"
  step1CarbGrams: number; // 15g
  step2CheckAt: string; // 15 min depois
  recheckBg: number;
  resolved: boolean;
  escalatedToSamu: boolean;
  notes: string;
  responsibleStaff: string;
}

export interface SlidingScaleRule {
  minBg: number;
  maxBg: number;
  regularInsulinUnits: number;
  recommendation: string;
}

export interface DiabetesResidentProfile {
  residentId: string;
  name: string;
  age: number;
  room: string;
  photo: string;
  diabetesType: 'Diabetes Mellitus Tipo 2 (DM2)' | 'Diabetes Mellitus Tipo 1 (DM1)' | 'DM Induzido por Antipsicóticos (Síndrome Metabólica)' | 'Diabetes Mellitus Tipo 2';
  diagnosedYear: number;
  currentHbA1c?: number;
  targetRange: TargetRange;
  recentMeasurements?: GlycemicRecord[];
  recentInsulinLogs?: InsulinDoseRecord[];
  footCareHistory?: FootInspectionRecord[];
  insulinRegimen: {
    basalInsulin: string;
    basalDose: string; // ex: "18 UI NPH às 07:00 e 6 UI às 21:00"
    hasSlidingScale: boolean;
    slidingScaleRules: SlidingScaleRule[];
  };
  oralMedications: string[]; // ex: ["Metformina 850mg 12/12h", "Gliclazida MR 30mg matinal"]
  psychotropicInteractions: {
    drugName: string;
    mechanism: string;
    clinicalImpact: string;
    preventionStrategy: string;
  }[];
  activeRescueProtocolState?: {
    inProgress: boolean;
    stage: 'ofertar_15g' | 'aguardar_15m' | 'reavaliar' | 'normalizado' | 'acionar_emergencia';
    startedAt?: string;
    countdownMinutes?: number;
    initialReading?: number;
  };
}

// Domain Model Type Aliases & Compatibility Exports
export type GlycemicMeasurement = GlycemicRecord;
export type InsulinAdministration = InsulinDoseRecord;
export type FootCareInspection = FootInspectionRecord;
export type DiabetesCareProfile = DiabetesResidentProfile;
export type GlycemicClassification = GlycemicZone;
export type GlycemicContext = MealTime;
