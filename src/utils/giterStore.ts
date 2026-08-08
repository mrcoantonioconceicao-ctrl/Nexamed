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
  EvolutionAuditEntry
} from '../types';
import { 
  INITIAL_RESIDENTS, 
  INITIAL_EVOLUTIONS, 
  INITIAL_MEDICATIONS as INITIAL_MAR, 
  INITIAL_HANDOVERS,
  INITIAL_AUDIT_LOGS
} from '../data/mockData';

// Storage Keys
const KEY_RESIDENTS = 'nexamed_residents_v2';
const KEY_EVOLUTIONS = 'nexamed_evolutions_v2';
const KEY_PAS = 'nexamed_pas_v2';
const KEY_APPOINTMENTS = 'nexamed_appointments_v2';
const KEY_SCALES = 'nexamed_scales_v2';
const KEY_PENDING_TASKS = 'nexamed_pending_tasks_v2';
const KEY_AUDIT_LOGS = 'nexamed_audit_logs_v2';
const KEY_MIGRATION_REPORTS = 'nexamed_migration_reports_v2';

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
  saveStoredResidents(INITIAL_RESIDENTS);
  return INITIAL_RESIDENTS;
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
}

// --- EVOLUTIONS CRUD ---
export function getStoredEvolutions(): ClinicalEvolution[] {
  try {
    const raw = localStorage.getItem(KEY_EVOLUTIONS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading stored evolutions:', e);
  }
  saveStoredEvolutions(INITIAL_EVOLUTIONS);
  return INITIAL_EVOLUTIONS;
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
  localStorage.setItem(KEY_PAS, JSON.stringify(INITIAL_PAS));
  return INITIAL_PAS;
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
}

// --- APPOINTMENTS CRUD ---
export function getStoredAppointments(): AppointmentRecord[] {
  try {
    const raw = localStorage.getItem(KEY_APPOINTMENTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading appointments:', e);
  }
  localStorage.setItem(KEY_APPOINTMENTS, JSON.stringify(INITIAL_APPOINTMENTS));
  return INITIAL_APPOINTMENTS;
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
}

// --- SCALES (KATZ & LAWTON) CRUD ---
export function getStoredScaleAssessments(): FunctionalScaleAssessment[] {
  try {
    const raw = localStorage.getItem(KEY_SCALES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading scales:', e);
  }
  localStorage.setItem(KEY_SCALES, JSON.stringify(INITIAL_SCALES));
  return INITIAL_SCALES;
}

export function saveScaleAssessment(assessment: FunctionalScaleAssessment): void {
  const current = getStoredScaleAssessments();
  current.unshift(assessment);
  localStorage.setItem(KEY_SCALES, JSON.stringify(current));
}

// --- PENDING CLINICAL TASKS CRUD ---
export function getStoredPendingTasks(): PendingClinicalTask[] {
  try {
    const raw = localStorage.getItem(KEY_PENDING_TASKS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading pending tasks:', e);
  }
  localStorage.setItem(KEY_PENDING_TASKS, JSON.stringify(INITIAL_PENDING_TASKS));
  return INITIAL_PENDING_TASKS;
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
  localStorage.setItem(KEY_AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
  return INITIAL_AUDIT_LOGS;
}

export function addAuditLogEntry(entry: AuditLogEntry): void {
  const current = getStoredAuditLogs();
  current.unshift(entry);
  localStorage.setItem(KEY_AUDIT_LOGS, JSON.stringify(current));
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
};
