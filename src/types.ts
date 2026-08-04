export type DependenceLevel = 'Grau I' | 'Grau II' | 'Grau III';
export type ResidentStatus = 'Ativo' | 'Em Observação' | 'Alta Provisória';
export type RiskScore = 'Baixo' | 'Médio' | 'Alto' | 'Crítico';

export interface News2Score {
  totalScore: number; // 0-20
  riskLevel: 'Baixo' | 'Moderado' | 'Alto' | 'Crítico';
  respiratoryRateScore: number;
  oxygenSatScore: number;
  supplementalOxygenScore: number;
  temperatureScore: number;
  systolicBPScore: number;
  heartRateScore: number;
  consciousnessScore: number; // Alert / Voice / Pain / Unresponsive (AVPU)
  lastCalculated: string;
}

export interface AIPrediction {
  id: string;
  residentId: string;
  type: 'Queda' | 'Crise Psiquiátrica' | 'Abandono Terapêutico' | 'Internação' | 'Não Adesão MAR' | 'Sobrecarga Equipe';
  riskPercentage: number; // 0 - 100
  confidenceLevel: 'Alta' | 'Média' | 'Baixa';
  keyVariables: string[];
  explanation: string;
  suggestedAction: string;
  timestamp: string;
}

export type TimelineEventType = 
  | 'Evolução SOAP' 
  | 'Intercorrência' 
  | 'Exame Laboratorial' 
  | 'Medicação MAR' 
  | 'Visita Familiar' 
  | 'Mudança PTS' 
  | 'Sinal Vital IoT' 
  | 'Internação / Alta';

export interface Timeline360Event {
  id: string;
  residentId: string;
  timestamp: string;
  type: TimelineEventType;
  title: string;
  description: string;
  authorName: string;
  authorRole: string;
  severity?: 'Normal' | 'Atenção' | 'Urgente' | 'Crítico';
  metadata?: Record<string, unknown>;
}

export interface FinancialRecord {
  id: string;
  residentId?: string;
  residentName?: string;
  type: 'Mensalidade' | 'SUS / Repasse' | 'Convênio' | 'Insumos Médicos' | 'Folha Pagamento' | 'Outros';
  amount: number;
  dueDate: string;
  status: 'Pago' | 'Pendente' | 'Atrasado' | 'Em Negociação';
  paymentMethod?: 'PIX' | 'Boleto' | 'Transferência' | 'SUS/Guia';
  costCenter: string;
}

export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  category: 'Medicamento' | 'Material Médico' | 'Fralda' | 'EPI' | 'Alimentação' | 'Limpeza' | 'Oxigênio';
  stockCurrent: number;
  stockMinimum: number;
  unit: string;
  batchNumber: string;
  expirationDate: string;
  estimatedConsumptionDays: number;
  suggestedPurchaseQty: number;
}

export interface LabResult {
  id: string;
  residentId: string;
  examName: string;
  date: string;
  status: 'Normal' | 'Alterado' | 'Crítico';
  results: {
    parameter: string;
    value: string;
    referenceRange: string;
    isAbnormal: boolean;
  }[];
  laboratoryName: string;
  reportPdfUrl?: string;
}

export interface OCRDocument {
  id: string;
  residentId?: string;
  type: 'Receita Médica' | 'Atestado' | 'Laudo Médico' | 'Relatório Alta Hospitalar';
  fileName: string;
  extractedText: string;
  structuredData: {
    medicationsFound?: string[];
    diagnosesFound?: string[];
    doctorCrm?: string;
    dateFound?: string;
  };
  processedAt: string;
  verifiedByStaff: boolean;
}

export interface BPMNWorkflowInstance {
  id: string;
  processName: 'Protocolo de Queda' | 'Crise Agressiva' | 'Admissão Residente' | 'Intercorrência Médica';
  residentId: string;
  residentName: string;
  currentState: string;
  stepsCompleted: string[];
  pendingStep: string;
  assignedRole: ClinicalRole;
  startedAt: string;
  updatedAt: string;
  status: 'Em Andamento' | 'Concluído' | 'Cancelado';
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: 'Acesso' | 'Criação' | 'Edição' | 'Exclusão' | 'Exportação LGPD' | 'Assinatura';
  resource: string;
  resourceId?: string;
  ipAddress: string;
  timestamp: string;
  reason: string;
}

export interface FamilyNote {
  id: string;
  residentId: string;
  familyName: string;
  kinship: string;
  date: string;
  message: string;
  status: 'Aprovado' | 'Aguardando Moderação';
  staffResponse?: string;
}

export interface QualityMetric {
  id: string;
  indicator: 'Taxa de Queda (por 1000 leitos/dia)' | 'Adesão MAR (%)' | 'Tempo Médio Atendimento Intercorrências' | 'Satisfação Famílias (NPS)';
  value: number;
  target: number;
  status: 'Meta Atingida' | 'Em Alerta' | 'Fora da Meta';
  period: string;
}

export interface StaffTraining {
  id: string;
  staffName: string;
  role: ClinicalRole;
  topic: 'NR32 Biossegurança' | 'BLS / Suporte Básico de Vida' | 'LGPD e Prontuários' | 'Manejamento de Crise Psiquiátrica';
  completedDate: string;
  expirationDate: string;
  status: 'Válido' | 'A Vencer' | 'Vencido';
  certificateUrl?: string;
}

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
  vitals?: {
    bp: string;
    hr: number;
    temp: number;
    spo2: number;
    respRate: number;
    lastAfericao?: string;
  };
  news2?: News2Score;
  aiPredictions?: AIPrediction[];
  notesCount?: number;
  medsPendingCount?: number;
}


export type ClinicalRole = 
  | 'Psiquiatra' 
  | 'Enfermeiro RT' 
  | 'Técnico de Enfermagem' 
  | 'Cuidador'
  | 'Psicólogo' 
  | 'Terapeuta Ocupacional' 
  | 'Assistente Social' 
  | 'Educador Físico'
  | 'Fisioterapeuta'
  | 'Nutricionista';

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
    respRate?: number; // Frequência Respiratória
  };
}

export type MedRoute = 'VO' | 'IV' | 'IM' | 'SC' | 'Tópico' | 'Inalatório';
export type DoseStatus = 'Pendente' | 'Ministrado' | 'Parcial' | 'Recusado' | 'Atrasado' | 'Suspenso';

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
