export type DependenceLevel = 'Grau I' | 'Grau II' | 'Grau III';
export type ResidentStatus = 'Ativo' | 'Em Observação' | 'Alta Provisória';
export type RiskScore = 'Baixo' | 'Médio' | 'Alto' | 'Crítico';

export interface Resident {
  id: string;
  name: string;
  photo: string;
  age: number;
  cpf: string;
  room: string; // e.g. "Quarto 102 - Leito A"
  unit: string; // e.g. "Unidade Jardim Paulista"
  dependenceLevel: DependenceLevel;
  primaryDiagnosis: string;
  secondaryDiagnoses?: string[];
  status: ResidentStatus;
  admissionsDate: string;
  allergies: string[];
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  keyTherapists: {
    role: string;
    name: string;
  }[];
  riskScore: RiskScore;
  singularTherapeuticPlan: {
    goals: string[];
    mainFocus: string;
    reviewDate: string;
    progressPercentage: number;
  };
  notesCount?: number;
  medsPendingCount?: number;
}

export type ClinicalRole = 
  | 'Psiquiatra' 
  | 'Enfermeiro RT' 
  | 'Técnico de Enfermagem' 
  | 'Psicólogo' 
  | 'Terapeuta Ocupacional' 
  | 'Assistente Social' 
  | 'Educador Físico';

export interface SOAPNote {
  subjective: string; // S: Queixas, relato do residente ou familiares
  objective: string;   // O: Exame físico, sinais vitais, dados mensuráveis
  assessment: string;  // A: Análise do quadro clínico/psicológico
  plan: string;        // P: Conduta, encaminhamentos e prescrições
}

export interface ClinicalEvolution {
  id: string;
  residentId: string;
  residentName: string;
  room: string;
  date: string;
  time: string;
  author: string;
  role: ClinicalRole;
  soap: SOAPNote;
  tags: string[];
  status: 'Finalizado' | 'Rascunho';
  vitals?: {
    bp?: string; // Pressão Arterial
    hr?: number; // Frequência Cardíaca
    temp?: number; // Temperatura
    spo2?: number; // Sat O2
    glucose?: number; // Glicemia
  };
}

export type MedRoute = 'VO' | 'IV' | 'IM' | 'SC' | 'Tópico' | 'Inalatório';
export type DoseStatus = 'Pendente' | 'Ministrado' | 'Recusado' | 'Atrasado' | 'Suspenso';

export interface ScheduledDose {
  id: string;
  time: string; // e.g. "08:00"
  status: DoseStatus;
  administeredBy?: string;
  administeredAt?: string;
  notes?: string;
}

export interface MedicationMAR {
  id: string;
  residentId: string;
  residentName: string;
  room: string;
  medicationName: string;
  dosage: string;
  route: MedRoute;
  frequency: string; // e.g. "12/12h", "Uma vez ao dia", "Se necessário (SOS)"
  scheduledDoses: ScheduledDose[];
  stockDosesRemaining: number;
  isControlled: boolean; // Psicotrópico/Portaria 344
  allergyWarning?: string;
  prescribedBy: string;
}

export type ShiftType = 'Manhã (07h-13h)' | 'Tarde (13h-19h)' | 'Noturno (19h-07h)';

export interface StaffRoster {
  id: string;
  date: string;
  dayOfWeek: string;
  shiftType: ShiftType;
  roleRequired: ClinicalRole;
  assignedStaffId?: string;
  assignedStaffName?: string;
  status: 'Confirmado' | 'Vago' | 'Sobreposição';
  notes?: string;
}

export type OccurrenceCategory = 
  | 'Comportamental' 
  | 'Medicação' 
  | 'Sinais Vitais' 
  | 'Visita Familiar' 
  | 'Queda/Incidente' 
  | 'Atividade Terapêutica';

export interface OccurrenceItem {
  id: string;
  residentId?: string;
  residentName?: string;
  priority: 'Alta' | 'Média' | 'Baixa';
  category: OccurrenceCategory;
  description: string;
  time: string;
  resolved: boolean;
}

export interface HandoverLog {
  id: string;
  date: string;
  shift: 'Manhã' | 'Tarde' | 'Noturno';
  authorName: string;
  authorRole: ClinicalRole;
  summaryText: string;
  occurrences: OccurrenceItem[];
  acknowledgedBy: string[]; // Nomes dos profissionais que deram ciente
}

export interface ClinicalAlert {
  id: string;
  residentId?: string;
  residentName?: string;
  type: 'Medicação Atrasada' | 'Alergia Medicamentosa' | 'Sinal Vital Alterado' | 'Intercorrência Comportamental' | 'Lacuna na Escala' | 'PTS Pendente';
  severity: 'Crítico' | 'Alto' | 'Médio' | 'Info';
  message: string;
  timestamp: string;
  read: boolean;
}

export interface NexaAction {
  type: 'navigate' | 'open_resident' | 'create_evolution' | 'mark_alerts_read' | 'open_escala' | 'trigger_alert';
  payload?: {
    path?: string;
    residentId?: string;
    alertId?: string;
    initialData?: Record<string, unknown>;
  };
  label: string;
}

export interface NexaMessage {
  id: string;
  sender: 'user' | 'nexa';
  text: string;
  timestamp: string;
  actions?: NexaAction[];
  contextPage?: string;
  isThinking?: boolean;
}
