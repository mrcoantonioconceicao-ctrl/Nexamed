import { 
  Resident, 
  ClinicalEvolution, 
  PASRecord, 
  AppointmentRecord, 
  FunctionalScaleAssessment, 
  PendingClinicalTask, 
  AuditLogEntry, 
  GiterMigrationReport,
  MedicationMAR,
  HandoverLog,
  EvolutionAuditEntry,
  NutritionalScreening
} from '../types';
import { 
  INITIAL_RESIDENTS, 
  INITIAL_EVOLUTIONS, 
  INITIAL_MEDICATIONS as INITIAL_MAR, 
  INITIAL_HANDOVERS,
  INITIAL_AUDIT_LOGS
} from '../data/mockData';
import { 
  saveResidentToDb, 
  saveEvolutionToDb, 
  saveAuditLogToDb, 
  savePASRecordToDb, 
  saveAppointmentToDb, 
  saveFunctionalScaleToDb 
} from '../lib/firebase';

// Storage Keys
const KEY_RESIDENTS = 'nexamed_residents_v2';
const KEY_EVOLUTIONS = 'nexamed_evolutions_v2';
const KEY_PAS = 'nexamed_pas_v2';
const KEY_APPOINTMENTS = 'nexamed_appointments_v2';
const KEY_SCALES = 'nexamed_scales_v2';
const KEY_PENDING_TASKS = 'nexamed_pending_tasks_v2';
const KEY_AUDIT_LOGS = 'nexamed_audit_logs_v2';
const KEY_MIGRATION_REPORTS = 'nexamed_migration_reports_v2';
const KEY_NUTRITION = 'nexamed_nutrition_screenings_v2';

// Seed Initial Nutritional Screenings
const INITIAL_NUTRITION_SCREENINGS: NutritionalScreening[] = [
  {
    id: 'nutri-1',
    residentId: 'res-1',
    residentName: 'Sra. Helena Vasconcelos',
    room: 'Suíte 101 - Leito A',
    date: '2026-08-28',
    evaluatorName: 'Dra. Beatriz Fontana',
    evaluatorRole: 'Nutricionista',
    weight: 58.5,
    height: 156,
    bmi: 24.0,
    bmiClassification: 'Eutrofia (Faixa ideal para idosos)',
    previousWeight: 60.0,
    weightChangeKg: -1.5,
    weightChangePercent: -2.5,
    weightChangePeriodDays: 30,
    caloricIntake: {
      estimatedDailyKcalTarget: 1750,
      estimatedKcalConsumed: 1470,
      acceptancePercentage: 84,
      hydrationMl: 1700,
      hydrationTargetMl: 1900,
      meals: {
        breakfast: { label: 'Café da Manhã', time: '08:00', targetKcal: 350, acceptance: 100, consumedKcal: 350, notes: 'Ingeriu café com leite, 1 fatia de pão integral com ricota e mamão.' },
        lunch: { label: 'Almoço', time: '12:00', targetKcal: 600, acceptance: 75, consumedKcal: 450, notes: 'Boa aceitação do arroz, feijão e frango desfiado; deixou parte dos legumes.' },
        afternoonSnack: { label: 'Lanche da Tarde', time: '15:30', targetKcal: 250, acceptance: 100, consumedKcal: 250, notes: 'Vitamina de banana com aveia e biscoito de água e sal.' },
        dinner: { label: 'Jantar', time: '19:00', targetKcal: 400, acceptance: 75, consumedKcal: 300, notes: 'Sopa cremosa de mandioquinha com carne moída.' },
        supper: { label: 'Ceia', time: '21:30', targetKcal: 150, acceptance: 80, consumedKcal: 120, notes: 'Chá de camomila e 2 bolachas doces.' }
      }
    },
    clinicalContext: {
      dietConsistency: 'Geral / Livre',
      appetite: 'Bom',
      swallowingIssues: false,
      chewingIssues: false,
      bowelHabit: 'Regular (1x/dia)',
      dietaryRestrictions: ['Hipossódica (HAS leve)', 'Sem frituras'],
      physicalActivityLevel: 'Ativo em Oficinas'
    },
    aiAssessment: {
      nutritionalRisk: 'Eutrofia / Sem Risco',
      vetKcal: 1750,
      proteinGramsPerKg: 1.2,
      dietAdjustments: [
        'Manutenção de Dieta Geral com temperos naturais (ervas finas, alho e cúrcuma) para estimular o paladar sem elevar o sódio.',
        'Inclusão de legumes cozidos no vapor com azeite extravirgem para melhorar aceitação no almoço.',
        'Oferta contínua de água aromatizada com hortelã no período vespertino.'
      ],
      hydrationPlan: 'Meta de 1.800 a 2.000 ml/dia. Ofertar copos de 150ml entre as 08h e 19h para evitar polaciúria noturna.',
      textureRecommendation: 'Geral com consistência preservada.',
      supplementation: 'Não indicado suplemento industrializado; densidade calórica e proteica da dieta comunitária atende aos requerimentos.',
      guidanceForCaregivers: [
        'Estimular a moradora a manter a caminhada diária no jardim após o café da manhã.',
        'Verificar se ingere líquidos ao longo da tarde durante as oficinas de arte.'
      ],
      monitoringPlan: 'Pesagem quinzenal e reavaliação da triagem em 60 dias.',
      clinicalRationale: 'Moradora idosa com IMC adequado (24.0 kg/m²), leve redução ponderal não significativa (-2.5% em 30d). Excelente adesão às rotinas com autonomia preservada.',
      generatedAt: '2026-08-28T14:35:00Z'
    }
  },
  {
    id: 'nutri-2',
    residentId: 'res-2',
    residentName: 'Sr. Carlos Eduardo Mendonça',
    room: 'Suíte 102 - Leito B',
    date: '2026-09-02',
    evaluatorName: 'Dra. Beatriz Fontana',
    evaluatorRole: 'Nutricionista',
    weight: 63.2,
    height: 172,
    bmi: 21.3,
    bmiClassification: 'Baixo Peso para Idoso (Critério OPAS < 22)',
    previousWeight: 67.0,
    weightChangeKg: -3.8,
    weightChangePercent: -5.7,
    weightChangePeriodDays: 45,
    caloricIntake: {
      estimatedDailyKcalTarget: 2100,
      estimatedKcalConsumed: 1350,
      acceptancePercentage: 64,
      hydrationMl: 1200,
      hydrationTargetMl: 2100,
      meals: {
        breakfast: { label: 'Café da Manhã', time: '08:00', targetKcal: 400, acceptance: 50, consumedKcal: 200, notes: 'Engasgou com líquidos ralos (café com leite fluido). Rejeitou metade.' },
        lunch: { label: 'Almoço', time: '12:00', targetKcal: 700, acceptance: 50, consumedKcal: 350, notes: 'Lentidão acentuada para mastigar carne em pedaços e arroz solto.' },
        afternoonSnack: { label: 'Lanche da Tarde', time: '15:30', targetKcal: 300, acceptance: 75, consumedKcal: 225, notes: 'Iogurte com maçã raspada teve melhor deglutição.' },
        dinner: { label: 'Jantar', time: '19:00', targetKcal: 500, acceptance: 75, consumedKcal: 375, notes: 'Purê de batata com frango bem desfiado e caldo grosso.' },
        supper: { label: 'Ceia', time: '21:30', targetKcal: 200, acceptance: 100, consumedKcal: 200, notes: 'Mingau de aveia bem tolerado.' }
      }
    },
    clinicalContext: {
      dietConsistency: 'Pastosa',
      appetite: 'Reduzido / Inapetência',
      swallowingIssues: true,
      chewingIssues: true,
      bowelHabit: 'Constipação (>2 dias sem evacuar)',
      dietaryRestrictions: ['Líquidos Espessados (Néctar)', 'Hipossódica'],
      physicalActivityLevel: 'Sedentário / Leve'
    },
    aiAssessment: {
      nutritionalRisk: 'Alto Risco / Desnutrição',
      vetKcal: 2100,
      proteinGramsPerKg: 1.4,
      dietAdjustments: [
        'Transição imediata para Dieta Pastosa Homogênea (IDDSI nível 4) com carnes moídas bem umedecidas com molho/caldo encorpado.',
        'Espessamento obrigatório de todos os líquidos com espessante alimentar na consistência néctar/mel.',
        'Adição de 1 colher de sobremesa de azeite extravirgem cru e 1 colher de leite em pó integral nas preparações salgadas para incremento calórico sem aumento de volume.'
      ],
      hydrationPlan: 'Meta de 1.800 a 2.100 ml/dia com líquidos exclusivamente espessados. Proibido canudo (aumenta velocidade do fluxo na faringe).',
      textureRecommendation: 'Pastosa homogênea e purês consistentes. Líquidos espessados.',
      supplementation: 'Indicação urgente de suplemento nutricional oral hipercalórico e hiperproteico (1.5 kcal/ml), 200ml/dia no lanche das 16h.',
      guidanceForCaregivers: [
        'Postura a 90° durante todas as refeições e repouso ereto por 40 minutos pós-prandial.',
        'Evitar dupla consistência (ex: sopa com pedaços e caldo ralo no mesmo prato).',
        'Registrar evacuações diariamente para monitorar a constipação.'
      ],
      monitoringPlan: 'Pesagem semanal em balança sentada/cadeira de rodas e reavaliação clínica nutricional em 14 dias.',
      clinicalRationale: 'Queda ponderal involuntária crítica (-5.7% em 45 dias) associada a sinais de disfagia orofaríngea e lentificação psicomotora induzida por antipsicóticos. Risco iminente de desnutrição energético-proteica e pneumonia aspirativa.',
      generatedAt: '2026-09-02T10:15:00Z'
    }
  }
];

// Seed Initial PAS
const INITIAL_PAS: PASRecord[] = [
  {
    id: 'pas-1',
    residentId: 'res-1',
    residentName: 'Sra. Helena Vasconcelos',
    type: 'PAS Inicial',
    date: '15/03/2025',
    authorName: 'Dra. Camila Meireles',
    authorRole: 'Psicóloga',
    mainGoals: [
      'Estabilização de humor e redução de episódios de hiperatividade noturna',
      'Inserção gradual em oficinas terapêuticas de arteterapia (3x/semana)',
      'Manutenção de ciclo de sono regular com mínimo de 7 horas contínuas'
    ],
    interventions: [
      'Acompanhamento psiquiátrico quinzenal',
      'Atividade de caminhada guiada no jardim após o almoço',
      'Higienização do sono com redução de estímulos às 21h'
    ],
    clinicalObservations: 'Residente responsiva a estímulos verbais e afetuosa. Apresenta ansiedade leve ao final da tarde (Síndrome do Pôr do Sol).',
    nextReviewDate: '15/09/2026',
    status: 'Ativo',
    version: 1
  },
  {
    id: 'pas-2',
    residentId: 'res-2',
    residentName: 'Sr. Carlos Eduardo Mendonça',
    type: 'PAS Periódico',
    date: '10/01/2026',
    authorName: 'Dra. Juliana Prado',
    authorRole: 'Terapeuta Ocupacional',
    mainGoals: [
      'Reabilitação da marcha e independência no vestuário',
      'Estímulo de memória de curto prazo através de diário de bordo'
    ],
    interventions: [
      'Sessões de TO diárias às 10h',
      'Fisioterapia motora para membros superiores'
    ],
    clinicalObservations: 'Boa evolução motora. Ótima adesão às oficinas de memória.',
    nextReviewDate: '10/10/2026',
    status: 'Ativo',
    version: 2
  }
];

// Seed Initial Appointments
const INITIAL_APPOINTMENTS: AppointmentRecord[] = [
  {
    id: 'app-1',
    residentId: 'res-1',
    residentName: 'Sra. Helena Vasconcelos',
    room: 'Suíte 101 - Leito A',
    date: '02/08/2026',
    time: '14:30',
    specialty: 'Psiquiatra',
    professionals: [
      { name: 'Dr. Fernando Alencar', role: 'Psiquiatra', crmCoren: 'CRM-SP 142.901' },
      { name: 'Enfª. Mariana Souza', role: 'Enfermeira RT', crmCoren: 'COREN-SP 184.920' }
    ],
    reason: 'Ajuste posológico de estabilizador de humor e avaliação de padrão de sono.',
    conduct: 'Mantido Lítio 300mg. Ajustada Quetiapina noturna para 50mg.',
    referrals: 'Acompanhamento diário de qualidade do sono pela equipe noturna.',
    evolutionSummary: 'Residente eufórica no início da consulta, aceitou diálogo com tranquilidade. Sinais vitais estáveis.',
    createdAt: '02/08/2026 15:00'
  }
];

// Seed Initial Katz & Lawton Scales
const INITIAL_SCALES: FunctionalScaleAssessment[] = [
  {
    id: 'scale-1',
    residentId: 'res-1',
    residentName: 'Sra. Helena Vasconcelos',
    scaleType: 'Katz',
    date: '20/07/2026',
    evaluatorName: 'Enfª. Mariana Souza',
    evaluatorRole: 'Enfermeiro RT',
    totalScore: 5,
    maxScore: 6,
    classification: 'Dependência Leve / Independente em 5 AVDs',
    details: {
      banho: 1,
      vestuario: 1,
      banheiro: 1,
      transferencia: 1,
      continencia: 0,
      alimentacao: 1
    }
  },
  {
    id: 'scale-2',
    residentId: 'res-1',
    residentName: 'Sra. Helena Vasconcelos',
    scaleType: 'Lawton',
    date: '20/07/2026',
    evaluatorName: 'Dra. Juliana Prado',
    evaluatorRole: 'Terapeuta Ocupacional',
    totalScore: 18,
    maxScore: 27,
    classification: 'Dependência Parcial para AIVDs',
    details: {
      telefone: 3,
      compras: 2,
      refeicoes: 2,
      domestico: 2,
      lavanderia: 2,
      transporte: 2,
      medicamentos: 3,
      financas: 2
    }
  }
];

// Seed Initial Pending Tasks
const INITIAL_PENDING_TASKS: PendingClinicalTask[] = [
  {
    id: 'task-1',
    residentId: 'res-3',
    residentName: 'Dra. Beatriz Santos',
    room: 'Suíte 103 - Leito A',
    type: 'Evolução Pendente',
    priority: 'Crítica',
    description: 'Evolução de turno não realizada referente ao plantão matutino.',
    dueTime: '13:00',
    responsibleRole: 'Técnico de Enfermagem',
    targetModule: '/evolucao',
    targetResidentId: 'res-3'
  },
  {
    id: 'task-2',
    residentId: 'res-1',
    residentName: 'Sra. Helena Vasconcelos',
    room: 'Suíte 101 - Leito A',
    type: 'Medicação Atrasada MAR',
    priority: 'Atenção',
    description: 'Checagem de dose MAR Quetiapina 25mg pendente das 08:00.',
    dueTime: '08:00',
    responsibleRole: 'Técnico de Enfermagem',
    targetModule: '/medicacao',
    targetResidentId: 'res-1'
  }
];

// --- RESIDENTS CRUD ---
export function getStoredResidents(): Resident[] {
  try {
    const raw = localStorage.getItem(KEY_RESIDENTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading stored residents:', e);
  }
  return [];
}

export function saveStoredResidents(residents: Resident[]): void {
  try {
    localStorage.setItem(KEY_RESIDENTS, JSON.stringify(residents));
  } catch (e) {
    console.error('Error saving residents:', e);
  }
}

export function saveSingleResident(resident: Resident): void {
  const current = getStoredResidents();
  const index = current.findIndex(r => r.id === resident.id);
  if (index >= 0) {
    current[index] = resident;
  } else {
    current.unshift(resident);
  }
  saveStoredResidents(current);
  saveResidentToDb(resident);
}

// --- EVOLUTIONS CRUD ---
export function getStoredEvolutions(): ClinicalEvolution[] {
  try {
    const raw = localStorage.getItem(KEY_EVOLUTIONS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading stored evolutions:', e);
  }
  return [];
}

export function saveStoredEvolutions(evolutions: ClinicalEvolution[]): void {
  try {
    localStorage.setItem(KEY_EVOLUTIONS, JSON.stringify(evolutions));
  } catch (e) {
    console.error('Error saving evolutions:', e);
  }
}

export function addOrUpdateEvolution(evolution: ClinicalEvolution, auditReason?: string): void {
  const current = getStoredEvolutions();
  const index = current.findIndex(e => e.id === evolution.id);

  const now = new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const auditEntry: EvolutionAuditEntry = {
    id: `audit-${Date.now()}`,
    timestamp: now,
    userId: 'user-current',
    userName: evolution.author || 'Profissional SRT',
    userRole: evolution.role || 'Enfermeiro RT',
    action: index >= 0 ? 'Edição' : 'Criação',
    newValue: JSON.stringify({ soap: evolution.soap, vitals: evolution.vitals, night: evolution.nightEvolution }),
    reason: auditReason || (index >= 0 ? 'Atualização clínica de rotina' : 'Registro de evolução assistencial'),
    device: 'NexaMed Web Workstation (Navegador)',
    sessionToken: `sess-${Math.random().toString(36).substring(2, 9)}`
  };

  const updatedAudit = [...(evolution.auditTrail || []), auditEntry];
  const finalEvolution = { ...evolution, auditTrail: updatedAudit };

  if (index >= 0) {
    current[index] = finalEvolution;
  } else {
    current.unshift(finalEvolution);
  }
  saveStoredEvolutions(current);
  saveEvolutionToDb(finalEvolution);

  // Auto record system audit entry
  addAuditLogEntry({
    id: `log-${Date.now()}`,
    userId: 'user-current',
    userName: evolution.author || 'Profissional SRT',
    userRole: evolution.role || 'Enfermeiro RT',
    action: index >= 0 ? 'Edição' : 'Criação',
    resource: 'Evolução Clínica GITER',
    resourceId: evolution.id,
    ipAddress: '192.168.1.100',
    timestamp: now,
    reason: auditReason || `Evolução para residente ${evolution.residentName}`
  });
}

// --- PAS RECORDS CRUD ---
export function getStoredPASRecords(): PASRecord[] {
  try {
    const raw = localStorage.getItem(KEY_PAS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading PAS records:', e);
  }
  return [];
}

export function savePASRecord(record: PASRecord): void {
  const current = getStoredPASRecords();
  const index = current.findIndex(p => p.id === record.id);
  if (index >= 0) {
    current[index] = record;
  } else {
    current.unshift(record);
  }
  localStorage.setItem(KEY_PAS, JSON.stringify(current));
  savePASRecordToDb(record);
}

// --- APPOINTMENTS CRUD ---
export function getStoredAppointments(): AppointmentRecord[] {
  try {
    const raw = localStorage.getItem(KEY_APPOINTMENTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading appointments:', e);
  }
  return [];
}

export function saveAppointmentRecord(record: AppointmentRecord): void {
  const current = getStoredAppointments();
  const index = current.findIndex(a => a.id === record.id);
  if (index >= 0) {
    current[index] = record;
  } else {
    current.unshift(record);
  }
  localStorage.setItem(KEY_APPOINTMENTS, JSON.stringify(current));
  saveAppointmentToDb(record);
}

// --- SCALES (KATZ & LAWTON) CRUD ---
export function getStoredScaleAssessments(): FunctionalScaleAssessment[] {
  try {
    const raw = localStorage.getItem(KEY_SCALES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading scales:', e);
  }
  return [];
}

export function saveScaleAssessment(assessment: FunctionalScaleAssessment): void {
  const current = getStoredScaleAssessments();
  current.unshift(assessment);
  localStorage.setItem(KEY_SCALES, JSON.stringify(current));
  saveFunctionalScaleToDb(assessment);
}

// --- PENDING CLINICAL TASKS CRUD ---
export function getStoredPendingTasks(): PendingClinicalTask[] {
  try {
    const raw = localStorage.getItem(KEY_PENDING_TASKS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading pending tasks:', e);
  }
  return [];
}

export function savePendingTasks(tasks: PendingClinicalTask[]): void {
  localStorage.setItem(KEY_PENDING_TASKS, JSON.stringify(tasks));
}

export function removePendingTask(taskId: string): void {
  const current = getStoredPendingTasks().filter(t => t.id !== taskId);
  savePendingTasks(current);
}

// --- AUDIT LOGS ---
export function getStoredAuditLogs(): AuditLogEntry[] {
  try {
    const raw = localStorage.getItem(KEY_AUDIT_LOGS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading audit logs:', e);
  }
  return [];
}

export function addAuditLogEntry(entry: AuditLogEntry): void {
  const current = getStoredAuditLogs();
  current.unshift(entry);
  localStorage.setItem(KEY_AUDIT_LOGS, JSON.stringify(current));
  saveAuditLogToDb(entry);
}

// --- MIGRATION REPORTS ---
export function getStoredMigrationReports(): GiterMigrationReport[] {
  try {
    const raw = localStorage.getItem(KEY_MIGRATION_REPORTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading migration reports:', e);
  }
  return [];
}

export function saveMigrationReport(report: GiterMigrationReport): void {
  const current = getStoredMigrationReports();
  current.unshift(report);
  localStorage.setItem(KEY_MIGRATION_REPORTS, JSON.stringify(current));
}

// --- NUTRITIONAL SCREENINGS (TRIAGEM NUTRICIONAL) ---
export function getStoredNutritionalScreenings(): NutritionalScreening[] {
  try {
    const raw = localStorage.getItem(KEY_NUTRITION);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error loading nutritional screenings:', e);
  }
  // Initialize with seeds if empty
  try {
    localStorage.setItem(KEY_NUTRITION, JSON.stringify(INITIAL_NUTRITION_SCREENINGS));
  } catch (e) {
    console.warn('Could not cache initial nutritional screenings:', e);
  }
  return INITIAL_NUTRITION_SCREENINGS;
}

export function saveNutritionalScreening(screening: NutritionalScreening): void {
  const current = getStoredNutritionalScreenings();
  const existingIdx = current.findIndex(n => n.id === screening.id);
  if (existingIdx >= 0) {
    current[existingIdx] = screening;
  } else {
    current.unshift(screening);
  }
  localStorage.setItem(KEY_NUTRITION, JSON.stringify(current));
}

export function deleteNutritionalScreening(screeningId: string): void {
  const current = getStoredNutritionalScreenings();
  const filtered = current.filter(n => n.id !== screeningId);
  localStorage.setItem(KEY_NUTRITION, JSON.stringify(filtered));
}

export function clearAllGiterStorage(): void {
  localStorage.removeItem(KEY_RESIDENTS);
  localStorage.removeItem(KEY_EVOLUTIONS);
  localStorage.removeItem(KEY_PAS);
  localStorage.removeItem(KEY_APPOINTMENTS);
  localStorage.removeItem(KEY_SCALES);
  localStorage.removeItem(KEY_PENDING_TASKS);
  localStorage.removeItem(KEY_AUDIT_LOGS);
  localStorage.removeItem(KEY_MIGRATION_REPORTS);
  localStorage.removeItem(KEY_NUTRITION);
}

// Composite Store Export
export const giterStore = {
  getResidents: getStoredResidents,
  saveResident: saveSingleResident,
  getEvolutions: getStoredEvolutions,
  saveEvolution: addOrUpdateEvolution,
  getPASRecords: getStoredPASRecords,
  savePASRecord: savePASRecord,
  getAppointments: getStoredAppointments,
  saveAppointment: saveAppointmentRecord,
  getAssessments: getStoredScaleAssessments,
  saveAssessment: saveScaleAssessment,
  getPendingTasks: getStoredPendingTasks,
  savePendingTasks: savePendingTasks,
  removePendingTask: removePendingTask,
  getAuditLogs: getStoredAuditLogs,
  addAuditLog: addAuditLogEntry,
  getMigrationReports: getStoredMigrationReports,
  saveMigrationReport: saveMigrationReport,
  getNutritionalScreenings: getStoredNutritionalScreenings,
  saveNutritionalScreening: saveNutritionalScreening,
  deleteNutritionalScreening: deleteNutritionalScreening,
};
