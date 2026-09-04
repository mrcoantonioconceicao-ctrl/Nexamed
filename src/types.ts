export type DependenceLevel = 'Grau I' | 'Grau II' | 'Grau III';
export type ResidentStatus = 'Ativo' | 'Em Observação' | 'Alta Provisória';
export type RiskScore = 'Baixo' | 'Médio' | 'Alto' | 'Crítico';

export type ClinicalRole = 
  | 'Enfermeiro Responsável Técnico (RT)' 
  | 'Enfermeiro RT'
  | 'Técnico de Enfermagem' 
  | 'Médico Psiquiatra' 
  | 'Psiquiatra'
  | 'Clínico Geral' 
  | 'Médico'
  | 'Psicólogo' 
  | 'Terapeuta Ocupacional' 
  | 'Assistente Social' 
  | 'Fisioterapeuta' 
  | 'Nutricionista' 
  | 'Cuidador Residencial'
  | 'Cuidador'
  | 'Direção'
  | 'Outro'
  | string;

export interface SOAPNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

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
}

export interface EvolutionAuditEntry {
  id: string;
  timestamp: string;
  authorName?: string;
  authorRole?: string;
  userId?: string;
  userName?: string;
  userRole?: string;
  action: 'Criado' | 'Editado' | 'Assinado' | 'Auditado' | 'Criação' | 'Edição' | string;
  previousValues?: Record<string, any>;
  newValues?: Record<string, any>;
  newValue?: string;
  justification?: string;
  reason?: string;
  device?: string;
  sessionToken?: string;
}

export type EvolutionType = 
  | 'Diária' 
  | 'Enfermagem' 
  | 'Médica' 
  | 'Psicológica' 
  | 'Multiprofissional' 
  | 'Cuidador' 
  | 'Plantão' 
  | 'Intercorrência' 
  | 'Evolução Noturna'
  | 'Noturna';

export type TurnoType = 'Manhã' | 'Tarde' | 'Noite' | 'Outros';

export interface PASRecord {
  id: string;
  residentId: string;
  residentName: string;
  type: 'PAS Inicial' | 'PAS Periódico' | 'Revisão Extraordinária' | string;
  date?: string;
  creationDate?: string;
  authorName: string;
  authorRole: string;
  careLevel?: 'Grau I' | 'Grau II' | 'Grau III';
  mainGoals?: string[];
  goals?: string[];
  interventions: string[];
  clinicalObservations?: string;
  nextReviewDate: string;
  status: 'Ativo' | 'Revisado' | 'Arquivado' | string;
  version?: number;
}

export interface AppointmentRecord {
  id: string;
  residentId: string;
  residentName: string;
  room?: string;
  date: string;
  time?: string;
  specialty: string;
  professionalName?: string;
  professionals?: { name: string; role: string; crmCoren?: string }[] | string[];
  reason?: string;
  conduct: string;
  referrals?: string[] | string;
  summary?: string;
  evolutionSummary?: string;
  attachments?: string[];
  createdAt?: string;
  status?: string;
}

export interface FunctionalScaleAssessment {
  id: string;
  residentId: string;
  residentName?: string;
  scaleType: 'Katz' | 'Lawton';
  date?: string;
  assessmentDate?: string;
  evaluatorName?: string;
  evaluatorRole?: string;
  assessedBy?: string;
  score?: number;
  totalScore?: number;
  maxScore?: number;
  classification: string;
  details: Record<string, any>;
}

export interface PendingClinicalTask {
  id: string;
  residentId: string;
  residentName: string;
  room: string;
  category?: string;
  type?: string;
  actionType?: string;
  priority: 'Crítica' | 'Atenção' | 'Alta' | 'Normal' | string;
  description: string;
  dueTime?: string;
  responsibleRole?: ClinicalRole;
  targetModule?: string;
  targetFormId?: string;
  targetResidentId?: string;
  status?: string;
}

export interface GiterMigrationReport {
  id: string;
  importedAt?: string;
  timestamp?: string;
  date?: string;
  fileName?: string;
  sourceSystem?: 'GITER' | 'CSV' | 'JSON' | 'Excel' | string;
  recordsType?: string;
  totalFound?: number;
  recordsProcessed?: number;
  totalImported?: number;
  successCount?: number;
  totalDuplicates?: number;
  totalErrors?: number;
  errorCount?: number;
  status?: string;
  logs?: string[];
  importedBy: string;
}

export type ReminderCategory = 
  | 'Consulta Médica' 
  | 'Atividade Agendada' 
  | 'Exame Laboratorial' 
  | 'Visita Familiar' 
  | 'Renovação Receita' 
  | 'Cuidado Específico' 
  | 'Outro';

export type ReminderPriority = 'Crítica' | 'Alta' | 'Média' | 'Normal';

export interface ResidentReminder {
  id: string;
  residentId: string;
  residentName: string;
  residentRoom?: string;
  title: string;
  category: ReminderCategory;
  date: string; // YYYY-MM-DD ou DD/MM/YYYY
  time: string; // HH:mm
  location?: string; // ex: "CAPS II Blumenau", "Sala de Terapia Ocupacional", "Posto Central"
  professionalOrOrganizer?: string; // ex: "Dr. Fernando Alencar (Psiquiatra)", "Terapeuta Juliana"
  responsibleStaff?: string; // ex: "Enf. Mariana Castro", "Cuidador João"
  priority: ReminderPriority;
  notifyTeam: boolean; // Se deve alertar a equipe via notificações
  notificationSent?: boolean;
  notes?: string;
  completed: boolean;
  completedAt?: string;
  completedBy?: string;
  createdAt: string;
  createdBy?: string;
}

export interface Resident {
  id: string;
  name: string;
  photo: string;
  age: number;
  cpf?: string;
  cns?: string;
  gender?: 'Feminino' | 'Masculino' | 'Outro';
  birthDate?: string;
  room: string; // e.g. "Quarto 102 - Leito A"
  unit?: string; // e.g. "Unidade Jardim Paulista"
  dependenceLevel?: DependenceLevel;
  careLevel?: string;
  riskScore?: RiskScore;
  keyTherapists?: (string | { role: string; name: string })[];
  singularTherapeuticPlan?: any;
  medsPendingCount?: number;
  notesCount?: number;
  customReminders?: ResidentReminder[];
  remindersCount?: number;
  aiPredictions?: AIPrediction[];
  primaryDiagnosis?: string;
  primaryDiagnostic?: string;
  secondaryDiagnoses?: string[];
  status?: ResidentStatus;
  admissionsDate?: string;
  allergies?: string[];
  vitals?: {
    bp: string;
    hr: number;
    temp: number;
    spo2: number;
    respRate: number;
    lastAfericao?: string;
    [key: string]: any;
  };
  news2?: {
    totalScore: number;
    riskLevel: string;
    [key: string]: any;
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };
  responsibles?: {
    name: string;
    kinship: string;
    phone: string;
    email?: string;
    isLegalGuardian: boolean;
  }[];
}

export interface ClinicalEvolution {
  id: string;
  residentId: string;
  residentName: string;
  room: string;
  date: string;
  time: string;
  author: string;
  role: ClinicalRole | string;
  evolutionType?: EvolutionType;
  turno?: TurnoType;
  soap: SOAPNote;
  isSoapModel?: boolean;
  freeTextContent?: string;
  tags: string[];
  status: 'Finalizado' | 'Rascunho';
  vitals?: {
    bp?: string;
    hr?: number;
    temp?: number;
    spo2?: number;
    glucose?: number;
    respRate?: number;
  };
  nightEvolution?: {
    sleepQualityScore: number; // 0 a 10
    sleepHours?: number;
    sleepInterruptions?: number;
    nightBehavior?: string;
    interventionsNeeded?: boolean;
    interferences?: string[];
    nightObservations?: string;
  };
  auditTrail?: EvolutionAuditEntry[];
  sourceSystem?: 'GITER' | 'NEXAMED';
}

export type MedRoute = 'VO' | 'IV' | 'IM' | 'SC' | 'Tópico' | 'Inalatório';
export type DoseStatus = 'Pendente' | 'Ministrado' | 'Parcial' | 'Recusado' | 'Atrasado' | 'Suspenso';

export interface ScheduledDose {
  id: string;
  time: string;
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
  frequency: string;
  scheduledDoses: ScheduledDose[];
  stockDosesRemaining: number;
  isControlled: boolean;
  allergyWarning?: string;
  prescribedBy: string;
}

export type ShiftType = 'Diurno (07h-19h)' | 'Noturno (19h-07h)' | 'Manhã (07h-13h)' | 'Tarde (13h-19h)';

export interface StaffRoster {
  id: string;
  date: string;
  dayOfWeek: string;
  shiftType: ShiftType;
  roleRequired: ClinicalRole | string;
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
  authorRole: ClinicalRole | string;
  summaryText: string;
  occurrences: OccurrenceItem[];
  acknowledgedBy: string[];
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

export interface DailyHuddleTopic {
  id: string;
  shift: 'Manhã' | 'Tarde' | 'Noturno';
  title: string;
  category: 'Segurança do Paciente' | 'Farmacovigilância' | 'Manejamento de Crise' | 'Comunicação e Handover' | 'Normas SRT / LGPD' | 'Cuidado Humanizado';
  priority: 'Alta' | 'Média' | 'Normal';
  description: string;
  assignedLead: string;
  completed: boolean;
  notes?: string;
  residentHighlights?: string[];
}

export interface StaffTrainingEvent {
  id: string;
  title: string;
  instructor: string;
  category: 'Suporte Básico de Vida (BLS)' | 'Prev. Incêndio / Evacuação' | 'Biossegurança NR32' | 'Humanização e Psicopatologia' | 'Boas Práticas MAR';
  date: string;
  time: string;
  location: string;
  targetRoles: string[];
  registeredParticipants: string[];
  maxSeats: number;
  mandatoryForRoles?: string[];
  status: 'Agendado' | 'Em Andamento' | 'Concluído';
}

export interface ClinicalBriefingItem {
  id: string;
  title: string;
  sourceModule: 'NEWS2 / Vitais' | 'Alergias MAR' | 'Aviso Epidemiológico' | 'Relatório de Plantão' | 'Protocolo Institucional';
  residentName?: string;
  urgency: 'Crítica' | 'Atenção' | 'Informativa';
  content: string;
  actionRequired: string;
  acknowledgedBy: string[];
}

export interface ShiftHuddlePlan {
  id: string;
  date: string;
  shift: 'Manhã' | 'Tarde' | 'Noturno';
  teamLeadName: string;
  teamLeadRole: string;
  shiftFocusGoal: string;
  briefingItems: ClinicalBriefingItem[];
  focusTopics: DailyHuddleTopic[];
  trainingsToday: StaffTrainingEvent[];
  attendanceList: { staffName: string; role: string; present: boolean }[];
  huddleStatus: 'Planejado' | 'Em Andamento' | 'Concluído';
  completedAt?: string;
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

export type MicroLearningCategory = 
  | 'Administração MAR'
  | 'Rotina Residencial Terapêutico'
  | 'Saúde Mental & Convivência'
  | 'Aferição NEWS2 & Vitais'
  | 'Protocolo SOAP'
  | 'Prevenção de Quedas'
  | 'Lesão por Pressão'
  | 'Manejamento de Crise'
  | 'Biossegurança & Higiene'
  | 'Treinamento YouTube';

export interface MicroLearningQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface MicroLearningModule {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  type: 'video' | 'guide' | 'interactive_case';
  category: MicroLearningCategory;
  targetRole?: string;
  staffName?: string;
  clinicalTrigger: string;
  aiReasoning: string;
  videoUrl?: string;
  youtubeId?: string;
  youtubeUrl?: string;
  thumbnailUrl?: string;
  guideContent?: string;
  keyTakeaways: string[];
  quiz: MicroLearningQuizQuestion[];
  status: 'Pendente' | 'Em Andamento' | 'Concluído';
  scorePercentage?: number;
  completedAt?: string;
  suggestedByNexa: boolean;
}

export interface StaffMicroLearningProfile {
  staffId: string;
  staffName: string;
  role: string;
  shift: string;
  avatarUrl?: string;
  pendingClinicalGapsCount: number;
  completedTrainingsCount: number;
  totalAssignedCount: number;
  readinessScore: number; // 0 to 100%
  recentGapsFound: string[];
  assignedModules: MicroLearningModule[];
}

export interface BackupRecordCounts {
  residents: number;
  evolutions: number;
  medications: number;
  handovers: number;
  auditLogs: number;
  functionalScales: number;
  pasRecords: number;
  appointments: number;
  totalRecords: number;
}

export interface BackupSnapshot {
  id: string;
  timestamp: string; // ISO 8601
  date: string;      // YYYY-MM-DD
  time: string;      // HH:mm:ss
  scheduledTime: string; // '00:00'
  type: 'AUTOMATIC_DAILY_MIDNIGHT' | 'MANUAL_ON_DEMAND';
  status: 'Sucesso' | 'Pendente' | 'Erro';
  storageTarget: 'Firebase Storage / Firestore Redundancy' | 'Local Redundancy' | 'Cloud Redundancy';
  storagePath?: string;
  fileName: string;
  fileSizeBytes: number;
  fileSizeFormatted: string;
  checksumSha256: string;
  recordCounts: BackupRecordCounts;
  summary: string;
  executedBy: string;
  payloadJson?: string;
  pdfHtmlExport?: string;
  version?: string;
}

// --- TRIAGEM NUTRICIONAL (SRT) ---
export type NutritionalRiskClassification = 
  | 'Eutrofia / Sem Risco'
  | 'Risco Nutricional Leve'
  | 'Risco Nutricional Moderado'
  | 'Alto Risco / Desnutrição'
  | 'Risco Metabólico / Obesidade';

export type DietConsistencyType = 
  | 'Geral / Livre'
  | 'Branda'
  | 'Pastosa'
  | 'Líquida Completa'
  | 'Enteral / SNE';

export interface MealIntakeRecord {
  label: string;
  time: string;
  targetKcal: number;
  acceptance: number; // 0, 25, 50, 75, 100 (%)
  consumedKcal: number;
  notes?: string;
}

export interface NutritionalScreening {
  id: string;
  residentId: string;
  residentName: string;
  room: string;
  date: string;
  evaluatorName: string;
  evaluatorRole: ClinicalRole | string;
  
  // Antropometria
  weight: number; // kg
  height: number; // cm
  bmi: number; // kg/m²
  bmiClassification: string;
  previousWeight?: number; // kg
  weightChangeKg?: number; // ex: -2.5 kg
  weightChangePercent?: number; // ex: -4.1%
  weightChangePeriodDays?: number; // ex: 30 dias
  
  // Ingestão Calórica & Hidratação
  caloricIntake: {
    estimatedDailyKcalTarget: number; // ex: 1850 kcal
    estimatedKcalConsumed: number; // ex: 1420 kcal
    acceptancePercentage: number; // ex: 76.7%
    hydrationMl: number; // ex: 1600 ml
    hydrationTargetMl: number; // ex: 2000 ml
    meals: {
      breakfast: MealIntakeRecord;
      lunch: MealIntakeRecord;
      afternoonSnack: MealIntakeRecord;
      dinner: MealIntakeRecord;
      supper: MealIntakeRecord;
    };
  };

  // Perfil Clínico Nutricional
  clinicalContext: {
    dietConsistency: DietConsistencyType;
    appetite: 'Normal / Preservado' | 'Bom' | 'Reduzido / Inapetência' | 'Anorexia Severa' | 'Hiperfagia / Compulsão';
    swallowingIssues: boolean; // Disfagia / Engasgos
    chewingIssues: boolean; // Dentição / Dificuldade mastigatória
    bowelHabit: 'Regular (1x/dia)' | 'Constipação (>2 dias sem evacuar)' | 'Diarreia / Fezes líquidas';
    dietaryRestrictions: string[]; // ex: ['Hipossódica (HAS)', 'Hipoglicídica (DM)', 'Sem Lactose']
    physicalActivityLevel: 'Acamado / Restrito' | 'Sedentário / Leve' | 'Ativo em Oficinas';
  };

  // Parecer Gerado pela IA Nexa / Gemini
  aiAssessment?: {
    nutritionalRisk: NutritionalRiskClassification;
    vetKcal: number; // Valor Energético Total em kcal/dia
    proteinGramsPerKg: number; // g/kg/dia
    dietAdjustments: string[]; // Ajustes recomendados no cardápio
    hydrationPlan: string; // Metas e estratégias de hidratação
    textureRecommendation: string; // Recomendação de textura/consistência
    supplementation: string; // Indicação de suplementação ou 'Não indicado no momento'
    guidanceForCaregivers: string[]; // Orientações para cuidadores e copa do SRT
    monitoringPlan: string; // Frequência de pesagem e acompanhamento
    clinicalRationale: string; // Correlação clínica com diagnósticos e histórico
    generatedAt: string;
  };
}



