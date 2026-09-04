// Store Service for Diabetes Care Profiles & Measurements in SRT (LocalStorage / In-Memory)
import { 
  DiabetesCareProfile, 
  GlycemicMeasurement, 
  InsulinAdministration, 
  FootCareInspection 
} from '../domain/diabetes/types';
import { IDiabetesRepositoryService } from '../domain/diabetes/soaContracts';
import { GlycemicDomainService } from '../domain/diabetes/domainServices';

const KEY_DIABETES_PROFILES = 'nexamed_diabetes_profiles_v1';

const INITIAL_PROFILES: DiabetesCareProfile[] = [
  {
    residentId: 'res-1',
    residentName: 'Sra. Helena Vasconcelos',
    age: 68,
    room: 'Suíte 101 - Leito A',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    diabetesType: 'Diabetes Mellitus Tipo 2',
    treatmentType: 'Antidiabéticos Orais',
    diagnosisYear: 2021,
    currentHbA1c: 6.8,
    lastHbA1cDate: '15/07/2026',
    glycemicTarget: {
      fastingMin: 80,
      fastingMax: 130,
      postPrandialMax: 180,
      rationale: 'Idosa com autonomia funcional Grau II e boa cooperação; alvo padrão SBD/ADA visando evitar microangiopatia e manter estabilidade cognitiva.'
    },
    prescriptions: [
      {
        name: 'Cloridrato de Metformina',
        dosage: '850 mg',
        schedule: '12/12h (08:00 e 20:00 junto às refeições)',
        route: 'VO',
        isSlidingScale: false
      }
    ],
    psychotropicMetabolicInteractions: [
      {
        drug: 'Hemifumarato de Quetiapina 100mg',
        mechanism: 'Bloqueio de receptores 5-HT2C e H1 causa aumento do apetite por carboidratos e potencializa resistência periférica à insulina.',
        alertLevel: 'Alto',
        careRecommendation: 'Vigilância contínua do peso corporal e perfil lipídico; evitar beliscos após a tomada noturna das 22h.'
      },
      {
        drug: 'Carbonato de Lítio (Carbolitium CR) 450mg',
        mechanism: 'Competição renal com sódio. Risco de intoxicação por lítio em episódios de desidratação secundária a glicosúria/poliúria osmótica.',
        alertLevel: 'Médio',
        careRecommendation: 'Meta hídrica rigorosa de 1.800 a 2.000 ml de água/dia distribuída pela equipe da residência.'
      }
    ],
    hypoglycemiaRescuePlan: {
      carbGramsFast: 15,
      rescueBeverageOptions: [
        '150 ml de suco de laranja ou uva integral',
        '1 copo d’água com 1 colher de sopa de açúcar refinado',
        '3 balas mastigáveis de glicose'
      ],
      retestMinutes: 15,
      alertThreshold: 70,
      severeThreshold: 54,
      samuEmergencyAction: 'Se perda de consciência, deitar de lado (decúbito lateral), não dar líquidos por boca e acionar SAMU 192.'
    },
    recentMeasurements: [
      {
        id: 'meas-h1',
        residentId: 'res-1',
        timestamp: '2026-09-04T07:30:00Z',
        value: 112,
        context: 'Jejum',
        classification: 'Faixa Alvo (70-180 mg/dL)',
        measuredBy: 'Enf. Bruno Costa',
        measuredRole: 'Enfermeiro RT',
        symptoms: ['Assintomática', 'Disposta para oficina'],
        actionTaken: 'Liberado café da manhã comunitário.'
      },
      {
        id: 'meas-h2',
        residentId: 'res-1',
        timestamp: '2026-09-03T21:00:00Z',
        value: 135,
        context: 'Ceia / Dormir',
        classification: 'Faixa Alvo (70-180 mg/dL)',
        measuredBy: 'Tec. Luciana Santos',
        measuredRole: 'Técnica de Enfermagem',
        symptoms: ['Assintomática'],
        actionTaken: 'Ceia leve oferecida conforme cardápio.'
      },
      {
        id: 'meas-h3',
        residentId: 'res-1',
        timestamp: '2026-09-03T14:00:00Z',
        value: 142,
        context: 'Pós-Prandial (2h)',
        classification: 'Faixa Alvo (70-180 mg/dL)',
        measuredBy: 'Tec. Luciana Santos',
        measuredRole: 'Técnica de Enfermagem',
        symptoms: ['Sem queixas'],
        actionTaken: 'Meta atingida.'
      },
      {
        id: 'meas-h4',
        residentId: 'res-1',
        timestamp: '2026-09-03T07:30:00Z',
        value: 108,
        context: 'Jejum',
        classification: 'Faixa Alvo (70-180 mg/dL)',
        measuredBy: 'Enf. Bruno Costa',
        measuredRole: 'Enfermeiro RT',
        symptoms: ['Assintomática'],
        actionTaken: 'Medicação matinal administrada no MAR.'
      }
    ],
    recentInsulinLogs: [],
    footCareHistory: [
      {
        id: 'foot-h1',
        residentId: 'res-1',
        date: '2026-08-20',
        examinerName: 'Enf. Bruno Costa',
        examinerRole: 'Enfermeiro RT',
        skinIntegrity: 'Íntegra e Hidratada',
        pedalPulses: 'Palpáveis e Amplos',
        monofilamentSensitivity: 'Normal (10g preservado)',
        temperatureColor: 'Normotérmico e Corado',
        footwearAdequacy: 'Adequado (Amplo, macio, sem costuras internas)',
        riskTier: 'Grau 0 (Baixo Risco - Sensibilidade e Pulsos Preservados)',
        recommendations: [
          'Manter hidratação diária da pele com creme à base de ureia 10% (evitar aplicar entre os dedos).',
          'Uso de meias de algodão sem elástico apertado no tornozelo.',
          'Reavaliação semestral do pé diabético.'
        ]
      }
    ]
  },
  {
    residentId: 'res-3',
    residentName: 'Dra. Tereza de Jesus Moreira',
    age: 82,
    room: 'Suíte 201 - Leito A',
    photo: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=150&auto=format&fit=crop&q=80',
    diabetesType: 'Diabetes Mellitus Tipo 2',
    treatmentType: 'Insulinoterapia (NPH + Regular)',
    diagnosisYear: 2016,
    currentHbA1c: 7.9,
    lastHbA1cDate: '10/08/2026',
    glycemicTarget: {
      fastingMin: 100,
      fastingMax: 160,
      postPrandialMax: 200,
      rationale: 'Idosa frágil com demência moderada/avançada e disfagia. Critério de segurança ADA/SBD: evitar hipoglicemia severa a qualquer custo, tolerando glicemias até 200 mg/dL sem intervenções agressivas.'
    },
    prescriptions: [
      {
        name: 'Insulina Humana NPH 100 UI/ml',
        dosage: '14 UI manhã (07:30) e 8 UI noite (21:30)',
        schedule: 'Manhã (07:30) e Antes de Dormir (21:30)',
        route: 'SC (Subcutânea)',
        isSlidingScale: false
      },
      {
        name: 'Insulina Humana Regular 100 UI/ml',
        dosage: 'Escala Móvel: >200 a 250 mg/dL: 2 UI | >250 mg/dL: 4 UI',
        schedule: 'Se HGT > 200 mg/dL antes das principais refeições',
        route: 'SC (Subcutânea)',
        isSlidingScale: true,
        slidingScaleRules: 'Se HGT < 200: 0 UI | 201-250: 2 UI | >250: 4 UI (Notificar médico se >300 mg/dL)'
      }
    ],
    psychotropicMetabolicInteractions: [
      {
        drug: 'Cloridrato de Memantina & Donepezila',
        mechanism: 'Anticolinesterásicos e moduladores NMDA podem mascarar sintomas de hipoglicemia por alteração autonômica e confusão mental.',
        alertLevel: 'Alto',
        careRecommendation: 'Vigilância rigorosa de sinais sutis de hipoglicemia: sudorese fria na nuca, palidez cutânea e piora súbita da desorientação.'
      },
      {
        drug: 'Risperidona 1mg (à noite para agitação)',
        mechanism: 'Pode induzir hiperprolactinemia e descompensação de resistência à insulina.',
        alertLevel: 'Médio',
        careRecommendation: 'Controle de glicemia ao deitar e nas primeiras horas da manhã.'
      }
    ],
    hypoglycemiaRescuePlan: {
      carbGramsFast: 15,
      rescueBeverageOptions: [
        'Suco de fruta espessado com amido/goma xantana (Nível 2 - Néctar/Mel)',
        'Gel de glicose ou sachê de mel aplicado na mucosa oral interna (gengiva/bochecha)',
        'ATENÇÃO: PROIBIDO OFERECER LÍQUIDOS RALOS (Risco iminente de broncoaspiração devido à disfagia)'
      ],
      retestMinutes: 15,
      alertThreshold: 70,
      severeThreshold: 54,
      samuEmergencyAction: 'Em rebaixamento ou crise convulsiva, lateralizar no leito com grades elevadas, manter aspiração de vias aéreas a postos e ligar 192 (SAMU).'
    },
    recentMeasurements: [
      {
        id: 'meas-t1',
        residentId: 'res-3',
        timestamp: '2026-09-04T07:15:00Z',
        value: 64,
        context: 'Jejum',
        classification: 'Hipoglicemia (<70 mg/dL)',
        measuredBy: 'Enf. Bruno Costa',
        measuredRole: 'Enfermeiro RT',
        symptoms: ['Sudorese fria na fronte', 'Palidez', 'Sonolência excessiva ao acordar'],
        actionTaken: 'Ativado Protocolo BPMN de Resgate: Administrado gel de glicose 15g na mucosa jugal devido à disfagia. Aguardado 15 minutos.',
        rescueCarbsGiven: true
      },
      {
        id: 'meas-t1-recheck',
        residentId: 'res-3',
        timestamp: '2026-09-04T07:32:00Z',
        value: 128,
        context: 'Sintomático (Suspeita de Hipo/Hiper)',
        classification: 'Faixa Alvo (70-180 mg/dL)',
        measuredBy: 'Enf. Bruno Costa',
        measuredRole: 'Enfermeiro RT',
        symptoms: ['Recuperação do alerta', 'Coloração cutânea normalizada'],
        actionTaken: 'Hipoglicemia revertida com sucesso. Liberado café da manhã pastoso com supervisão fonoaudiológica.'
      },
      {
        id: 'meas-t2',
        residentId: 'res-3',
        timestamp: '2026-09-03T21:30:00Z',
        value: 168,
        context: 'Ceia / Dormir',
        classification: 'Faixa Alvo (70-180 mg/dL)',
        measuredBy: 'Tec. Luciana Santos',
        measuredRole: 'Técnica de Enfermagem',
        symptoms: ['Calma no leito'],
        actionTaken: 'Administrada Insulina NPH 8 UI SC em coxa direita. Ceia espessada ingerida.'
      },
      {
        id: 'meas-t3',
        residentId: 'res-3',
        timestamp: '2026-09-03T11:45:00Z',
        value: 195,
        context: 'Pré-Almoço',
        classification: 'Hiperglicemia Leve/Mod (181-250 mg/dL)',
        measuredBy: 'Tec. Luciana Santos',
        measuredRole: 'Técnica de Enfermagem',
        symptoms: ['Sem queixas'],
        actionTaken: 'Valor < 200 mg/dL na escala móvel. Não indicada dose de Insulina Regular. Liberado almoço pastoso.'
      },
      {
        id: 'meas-t4',
        residentId: 'res-3',
        timestamp: '2026-09-03T07:20:00Z',
        value: 144,
        context: 'Jejum',
        classification: 'Faixa Alvo (70-180 mg/dL)',
        measuredBy: 'Enf. Bruno Costa',
        measuredRole: 'Enfermeiro RT',
        symptoms: ['Orientada no leito'],
        actionTaken: 'Insulina NPH 14 UI administrada em abdômen inferior esquerdo.'
      }
    ],
    recentInsulinLogs: [
      {
        id: 'ins-t1',
        residentId: 'res-3',
        timestamp: '2026-09-04T07:40:00Z',
        insulinType: 'NPH (Ação Intermediária)',
        units: 14,
        site: 'Abdômen Inferior Direito',
        administeredBy: 'Enf. Bruno Costa',
        rotationVerified: true,
        bloodGlucoseAtTime: 128,
        notes: 'Aplicada 2 dedos de distância da cicatriz umbilical. Pele sem endurecimento.'
      },
      {
        id: 'ins-t2',
        residentId: 'res-3',
        timestamp: '2026-09-03T21:30:00Z',
        insulinType: 'NPH (Ação Intermediária)',
        units: 8,
        site: 'Coxa Anterior Direita',
        administeredBy: 'Tec. Luciana Santos',
        rotationVerified: true,
        bloodGlucoseAtTime: 168,
        notes: 'Sem queixas dolorosas.'
      },
      {
        id: 'ins-t3',
        residentId: 'res-3',
        timestamp: '2026-09-03T07:30:00Z',
        insulinType: 'NPH (Ação Intermediária)',
        units: 14,
        site: 'Abdômen Inferior Esquerdo',
        administeredBy: 'Enf. Bruno Costa',
        rotationVerified: true,
        bloodGlucoseAtTime: 144,
        notes: 'Local alternado em relação ao plantão anterior.'
      }
    ],
    footCareHistory: [
      {
        id: 'foot-t1',
        residentId: 'res-3',
        date: '2026-08-25',
        examinerName: 'Enf. Bruno Costa',
        examinerRole: 'Enfermeiro RT',
        skinIntegrity: 'Ressecamento Leve',
        pedalPulses: 'Diminuídos',
        monofilamentSensitivity: 'Parcialmente Diminuída',
        temperatureColor: 'Frio / Pálido',
        footwearAdequacy: 'Inadequado (Apertado, desgastado ou rígido)',
        riskTier: 'Grau 1 (Risco Moderado - Neuropatia Sensorial Periférica)',
        recommendations: [
          'Solicitar à família calçados geriátricos especiais acolchoados com fecho de velcro e bico largo.',
          'Inspeção diária dos pés pelos cuidadores no momento do banho de leito/cadeira.',
          'Hidratação plantar com massagem suave para estimular microcirculação periférica.',
          'Manter unhas cortadas em linha reta por profissional de podologia.'
        ]
      }
    ]
  }
];

export class DiabetesStoreService implements IDiabetesRepositoryService {
  private static instance: DiabetesStoreService;

  private constructor() {
    this.ensureInitialized();
  }

  public static getInstance(): DiabetesStoreService {
    if (!DiabetesStoreService.instance) {
      DiabetesStoreService.instance = new DiabetesStoreService();
    }
    return DiabetesStoreService.instance;
  }

  private ensureInitialized(): void {
    const existing = localStorage.getItem(KEY_DIABETES_PROFILES);
    if (!existing) {
      localStorage.setItem(KEY_DIABETES_PROFILES, JSON.stringify(INITIAL_PROFILES));
    }
  }

  public async getAllProfiles(): Promise<DiabetesCareProfile[]> {
    this.ensureInitialized();
    try {
      const data = localStorage.getItem(KEY_DIABETES_PROFILES);
      return data ? JSON.parse(data) : INITIAL_PROFILES;
    } catch {
      return INITIAL_PROFILES;
    }
  }

  public async getProfileByResidentId(residentId: string): Promise<DiabetesCareProfile | null> {
    const profiles = await this.getAllProfiles();
    return profiles.find(p => p.residentId === residentId) || null;
  }

  public async saveMeasurement(measurement: GlycemicMeasurement): Promise<GlycemicMeasurement> {
    const profiles = await this.getAllProfiles();
    const profile = profiles.find(p => p.residentId === measurement.residentId);
    
    if (profile) {
      profile.recentMeasurements.unshift(measurement);
      localStorage.setItem(KEY_DIABETES_PROFILES, JSON.stringify(profiles));
    }
    return measurement;
  }

  public async saveInsulinLog(log: InsulinAdministration): Promise<InsulinAdministration> {
    const profiles = await this.getAllProfiles();
    const profile = profiles.find(p => p.residentId === log.residentId);
    
    if (profile) {
      profile.recentInsulinLogs.unshift(log);
      localStorage.setItem(KEY_DIABETES_PROFILES, JSON.stringify(profiles));
    }
    return log;
  }

  public async saveFootInspection(inspection: FootCareInspection): Promise<FootCareInspection> {
    const profiles = await this.getAllProfiles();
    const profile = profiles.find(p => p.residentId === inspection.residentId);
    
    if (profile) {
      profile.footCareHistory.unshift(inspection);
      localStorage.setItem(KEY_DIABETES_PROFILES, JSON.stringify(profiles));
    }
    return inspection;
  }

  public async resetToDefaults(): Promise<DiabetesCareProfile[]> {
    localStorage.setItem(KEY_DIABETES_PROFILES, JSON.stringify(INITIAL_PROFILES));
    return INITIAL_PROFILES;
  }
}

export const diabetesStore = DiabetesStoreService.getInstance();
