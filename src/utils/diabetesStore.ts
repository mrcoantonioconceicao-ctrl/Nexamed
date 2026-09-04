/**
 * Service-Oriented Architecture (SOA) - Diabetes Repository & State Service
 * Handles persistence, reactive subscriptions, and domain coordination.
 */

import { 
  DiabetesResidentProfile, 
  GlycemicRecord, 
  InsulinDoseRecord, 
  FootInspectionRecord, 
  HypoglycemiaRescueEvent 
} from '../domain/diabetes/types';
import { classifyGlycemicZone } from '../domain/diabetes/rules';

const KEY_DIABETES_PROFILES = 'nexamed_diabetes_profiles_v1';
const KEY_GLYCEMIC_RECORDS = 'nexamed_glycemic_records_v1';
const KEY_INSULIN_RECORDS = 'nexamed_insulin_records_v1';
const KEY_FOOT_RECORDS = 'nexamed_foot_inspections_v1';
const KEY_RESCUE_EVENTS = 'nexamed_rescue_events_v1';

export const INITIAL_DIABETES_PROFILES: DiabetesResidentProfile[] = [
  {
    residentId: 'res-1',
    name: 'Sra. Helena Vasconcelos',
    age: 68,
    room: 'Suíte 101 - Leito A',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    diabetesType: 'DM Induzido por Antipsicóticos (Síndrome Metabólica)',
    diagnosedYear: 2021,
    currentHbA1c: 7.8,
    targetRange: {
      fastingMin: 80,
      fastingMax: 130,
      postPrandialMax: 180,
      bedtimeMin: 100,
      bedtimeMax: 160,
      hba1cTarget: 7.5
    },
    insulinRegimen: {
      basalInsulin: 'Insulina NPH (Humana)',
      basalDose: '18 UI às 07:00 (SC) + 6 UI às 21:00 (SC)',
      hasSlidingScale: true,
      slidingScaleRules: [
        { minBg: 70, maxBg: 180, regularInsulinUnits: 0, recommendation: 'Faixa segura. Nenhuma unidade de correção necessária.' },
        { minBg: 181, maxBg: 220, regularInsulinUnits: 2, recommendation: 'Aplicar 2 UI de Insulina Regular SC e ofertar 200ml de água.' },
        { minBg: 221, maxBg: 260, regularInsulinUnits: 4, recommendation: 'Aplicar 4 UI de Insulina Regular SC e reavaliar glicemia em 2 horas.' },
        { minBg: 261, maxBg: 400, regularInsulinUnits: 6, recommendation: 'Aplicar 6 UI de Insulina Regular SC e comunicar o Enfermeiro RT de plantão.' }
      ]
    },
    oralMedications: [
      'Metformina 850mg (1 comprimido após café e jantar)',
      'Carbonato de Lítio 300mg (1 comprimido de 12/12h)',
      'Quetiapina 25mg (1 comprimido à noite)'
    ],
    psychotropicInteractions: [
      {
        drugName: 'Quetiapina 25mg',
        mechanism: 'Bloqueio de receptores serotoninérgicos e histamínicos promove resistência à insulina.',
        clinicalImpact: 'Tendência a picos glicêmicos noturnos e compulsão alimentar vespertina.',
        preventionStrategy: 'Ceia balanceada com baixo índice glicêmico e monitoramento do HGT às 22:00.'
      },
      {
        drugName: 'Carbonato de Lítio 300mg',
        mechanism: 'Compete com o sódio na excreção tubular renal.',
        clinicalImpact: 'Poliúria decorrente de hiperglicemia eleva o risco de intoxicação por lítio.',
        preventionStrategy: 'Garantir aporte hídrico de 2 a 2,5 litros diários e litemia periódica.'
      }
    ]
  },
  {
    residentId: 'res-3',
    name: 'Dra. Tereza de Jesus Moreira',
    age: 82,
    room: 'Suíte 201 - Leito A',
    photo: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=150&auto=format&fit=crop&q=80',
    diabetesType: 'Diabetes Mellitus Tipo 2 (DM2)',
    diagnosedYear: 2014,
    currentHbA1c: 7.4,
    targetRange: {
      fastingMin: 90,
      fastingMax: 150,
      postPrandialMax: 200,
      bedtimeMin: 110,
      bedtimeMax: 180,
      hba1cTarget: 8.0 // Metas relaxadas para idosa frágil com demência (SBD 2024)
    },
    insulinRegimen: {
      basalInsulin: 'Insulina Glargina (Lantus)',
      basalDose: '14 UI às 21:00 (SC diário)',
      hasSlidingScale: false,
      slidingScaleRules: []
    },
    oralMedications: [
      'Gliclazida MR 30mg (1 comprimido pela manhã)',
      'Memantina 10mg (1 comprimido pela manhã)'
    ],
    psychotropicInteractions: [
      {
        drugName: 'Demência de Alzheimer & Sedativos',
        mechanism: 'Prejuízo na comunicação verbal e resposta adrenérgica diminuída.',
        clinicalImpact: 'Hipoglicemias assintomáticas: residente não expressa fome, tontura ou tremores.',
        preventionStrategy: 'Aferição rigorosa pré-refeição e observação de sinais comportamentais (apatia súbita, sonolência anormal).'
      }
    ]
  }
];

export const INITIAL_GLYCEMIC_RECORDS: GlycemicRecord[] = [
  // Helena Vasconcelos
  {
    id: 'gly-1',
    residentId: 'res-1',
    residentName: 'Sra. Helena Vasconcelos',
    timestamp: 'Hoje, 07:15',
    value: 124,
    zone: 'IN_TARGET',
    mealTime: 'Jejum',
    measuredBy: 'Téc. Carlos Lima',
    measuredByRole: 'Técnico de Enfermagem',
    notes: 'Jejum noturno respeitado. Residente calma e colaborativa.'
  },
  {
    id: 'gly-2',
    residentId: 'res-1',
    residentName: 'Sra. Helena Vasconcelos',
    timestamp: 'Hoje, 11:30',
    value: 142,
    zone: 'IN_TARGET',
    mealTime: 'Pré-Almoço',
    measuredBy: 'Téc. Carlos Lima',
    measuredByRole: 'Técnico de Enfermagem',
    notes: 'Aferição antes do almoço. Dentro da meta.'
  },
  {
    id: 'gly-3',
    residentId: 'res-1',
    residentName: 'Sra. Helena Vasconcelos',
    timestamp: 'Ontem, 21:30',
    value: 198,
    zone: 'HIGH',
    mealTime: 'Antes de Dormir',
    measuredBy: 'Enf. Mariana Castro',
    measuredByRole: 'Enfermeiro RT',
    notes: 'Pico após consumo de sobremesa no jantar. Aplicadas 2 UI de Regular conforme escala móvel.',
    correctionInsulinGiven: 2
  },
  {
    id: 'gly-4',
    residentId: 'res-1',
    residentName: 'Sra. Helena Vasconcelos',
    timestamp: 'Ontem, 14:00',
    value: 168,
    zone: 'IN_TARGET',
    mealTime: 'Pós-Prandial (2h)',
    measuredBy: 'Téc. Juliana Prado',
    measuredByRole: 'Técnico de Enfermagem'
  },
  {
    id: 'gly-5',
    residentId: 'res-1',
    residentName: 'Sra. Helena Vasconcelos',
    timestamp: 'Anteontem, 07:20',
    value: 135,
    zone: 'IN_TARGET',
    mealTime: 'Jejum',
    measuredBy: 'Téc. Carlos Lima',
    measuredByRole: 'Técnico de Enfermagem'
  },

  // Dra. Tereza de Jesus Moreira
  {
    id: 'gly-6',
    residentId: 'res-3',
    residentName: 'Dra. Tereza de Jesus Moreira',
    timestamp: 'Hoje, 07:30',
    value: 118,
    zone: 'IN_TARGET',
    mealTime: 'Jejum',
    measuredBy: 'Téc. Carlos Lima',
    measuredByRole: 'Técnico de Enfermagem',
    notes: 'Acordou bem, sem sudorese ou confusão.'
  },
  {
    id: 'gly-7',
    residentId: 'res-3',
    residentName: 'Dra. Tereza de Jesus Moreira',
    timestamp: 'Hoje, 11:45',
    value: 132,
    zone: 'IN_TARGET',
    mealTime: 'Pré-Almoço',
    measuredBy: 'Téc. Carlos Lima',
    measuredByRole: 'Técnico de Enfermagem'
  },
  {
    id: 'gly-8',
    residentId: 'res-3',
    residentName: 'Dra. Tereza de Jesus Moreira',
    timestamp: 'Anteontem, 16:30',
    value: 62,
    zone: 'LOW',
    mealTime: 'Intercorrência',
    symptoms: ['Sonolência incomum', 'Palidez cutânea', 'Olhar vago'],
    measuredBy: 'Enf. Bruno Costa',
    measuredByRole: 'Enfermeiro RT',
    notes: 'Deflagrado protocolo da Regra dos 15 com 150ml de suco de caju adoçado. Revertido para 98 mg/dL em 15 minutos.',
    triggeredRescueProtocol: true
  },
  {
    id: 'gly-9',
    residentId: 'res-3',
    residentName: 'Dra. Tereza de Jesus Moreira',
    timestamp: 'Ontem, 21:00',
    value: 145,
    zone: 'IN_TARGET',
    mealTime: 'Antes de Dormir',
    measuredBy: 'Téc. Juliana Prado',
    measuredByRole: 'Técnico de Enfermagem',
    notes: 'Aferição antes da Glargina noturna.'
  }
];

export const INITIAL_INSULIN_RECORDS: InsulinDoseRecord[] = [
  {
    id: 'ins-1',
    residentId: 'res-1',
    residentName: 'Sra. Helena Vasconcelos',
    timestamp: 'Hoje, 07:30',
    insulinName: 'Insulina NPH 100 UI/ml',
    insulinType: 'NPH (Ação Intermediária)',
    prescribedUnits: 18,
    actualUnitsGiven: 18,
    injectionSite: 'Abdomen Inferior Direito',
    administeredBy: 'Téc. Carlos Lima',
    administeredByRole: 'Técnico de Enfermagem',
    checkedBy: 'Enf. Mariana Castro',
    status: 'Aplicado'
  },
  {
    id: 'ins-2',
    residentId: 'res-1',
    residentName: 'Sra. Helena Vasconcelos',
    timestamp: 'Ontem, 21:40',
    insulinName: 'Insulina Regular 100 UI/ml',
    insulinType: 'Regular (Ação Rápida)',
    prescribedUnits: 2,
    actualUnitsGiven: 2,
    injectionSite: 'Braço Posterior Esquerdo',
    administeredBy: 'Enf. Mariana Castro',
    administeredByRole: 'Enfermeiro RT',
    status: 'Aplicado',
    reason: 'Correção de glicemia 198 mg/dL conforme escala móvel'
  },
  {
    id: 'ins-3',
    residentId: 'res-3',
    residentName: 'Dra. Tereza de Jesus Moreira',
    timestamp: 'Ontem, 21:05',
    insulinName: 'Insulina Glargina (Lantus)',
    insulinType: 'Glargina / Lantus (Basal Longa)',
    prescribedUnits: 14,
    actualUnitsGiven: 14,
    injectionSite: 'Coxa Anterior Direita',
    administeredBy: 'Téc. Juliana Prado',
    administeredByRole: 'Técnico de Enfermagem',
    checkedBy: 'Enf. Bruno Costa',
    status: 'Aplicado'
  }
];

export const INITIAL_FOOT_RECORDS: FootInspectionRecord[] = [
  {
    id: 'foot-1',
    residentId: 'res-1',
    residentName: 'Sra. Helena Vasconcelos',
    date: 'Ontem, 15:00',
    inspectedBy: 'Enf. Mariana Castro (RT)',
    skinIntegrity: 'Ressecamento / Fissuras',
    pulsesPresent: true,
    sensitivityMonofilament: 'Preservada',
    appropriateFootwear: true,
    edemaLevel: 'Leve (+/4)',
    riskCategory: 'Grau 0 (Sem neuropatia)',
    actionPlan: 'Aplicado hidratante à base de ureia 10% na região dos calcanhares (evitar região interdigital). Estimulado uso de meias de algodão sem costura.'
  },
  {
    id: 'foot-2',
    residentId: 'res-3',
    residentName: 'Dra. Tereza de Jesus Moreira',
    date: 'Anteontem, 14:30',
    inspectedBy: 'Enf. Bruno Costa (RT)',
    skinIntegrity: 'Íntegra',
    pulsesPresent: true,
    sensitivityMonofilament: 'Diminuída',
    appropriateFootwear: true,
    edemaLevel: 'Moderado (++/4)',
    riskCategory: 'Grau 1 (Neuropatia)',
    actionPlan: 'Sensibilidade distal reduzida. Manter vigilância diária contra microtraumas e corte reto das unhas pelo podólogo da equipe.'
  }
];

// --- GETTERS ---

export function getStoredDiabetesProfiles(): DiabetesResidentProfile[] {
  try {
    const raw = localStorage.getItem(KEY_DIABETES_PROFILES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Could not read diabetes profiles from localStorage:', e);
  }
  return INITIAL_DIABETES_PROFILES;
}

export function saveStoredDiabetesProfiles(profiles: DiabetesResidentProfile[]): void {
  try {
    localStorage.setItem(KEY_DIABETES_PROFILES, JSON.stringify(profiles));
  } catch (e) {
    console.warn('Could not save diabetes profiles to localStorage:', e);
  }
}

export function getStoredGlycemicRecords(): GlycemicRecord[] {
  try {
    const raw = localStorage.getItem(KEY_GLYCEMIC_RECORDS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Could not read glycemic records from localStorage:', e);
  }
  return INITIAL_GLYCEMIC_RECORDS;
}

export function saveStoredGlycemicRecords(records: GlycemicRecord[]): void {
  try {
    localStorage.setItem(KEY_GLYCEMIC_RECORDS, JSON.stringify(records));
  } catch (e) {
    console.warn('Could not save glycemic records to localStorage:', e);
  }
}

export function addGlycemicRecord(record: Omit<GlycemicRecord, 'id' | 'zone'>): GlycemicRecord {
  const current = getStoredGlycemicRecords();
  const zone = classifyGlycemicZone(record.value);
  const newRecord: GlycemicRecord = {
    ...record,
    id: `gly-${Date.now()}`,
    zone
  };

  const updated = [newRecord, ...current];
  saveStoredGlycemicRecords(updated);
  return newRecord;
}

export function getStoredInsulinRecords(): InsulinDoseRecord[] {
  try {
    const raw = localStorage.getItem(KEY_INSULIN_RECORDS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Could not read insulin records from localStorage:', e);
  }
  return INITIAL_INSULIN_RECORDS;
}

export function saveStoredInsulinRecords(records: InsulinDoseRecord[]): void {
  try {
    localStorage.setItem(KEY_INSULIN_RECORDS, JSON.stringify(records));
  } catch (e) {
    console.warn('Could not save insulin records to localStorage:', e);
  }
}

export function addInsulinRecord(record: Omit<InsulinDoseRecord, 'id'>): InsulinDoseRecord {
  const current = getStoredInsulinRecords();
  const newRecord: InsulinDoseRecord = {
    ...record,
    id: `ins-${Date.now()}`
  };
  const updated = [newRecord, ...current];
  saveStoredInsulinRecords(updated);
  return newRecord;
}

export function getStoredFootRecords(): FootInspectionRecord[] {
  try {
    const raw = localStorage.getItem(KEY_FOOT_RECORDS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Could not read foot records from localStorage:', e);
  }
  return INITIAL_FOOT_RECORDS;
}

export function saveStoredFootRecords(records: FootInspectionRecord[]): void {
  try {
    localStorage.setItem(KEY_FOOT_RECORDS, JSON.stringify(records));
  } catch (e) {
    console.warn('Could not save foot records to localStorage:', e);
  }
}

export function addFootRecord(record: Omit<FootInspectionRecord, 'id'>): FootInspectionRecord {
  const current = getStoredFootRecords();
  const newRecord: FootInspectionRecord = {
    ...record,
    id: `foot-${Date.now()}`
  };
  const updated = [newRecord, ...current];
  saveStoredFootRecords(updated);
  return newRecord;
}
