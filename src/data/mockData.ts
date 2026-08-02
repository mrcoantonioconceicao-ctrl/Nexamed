import { 
  Resident, 
  ClinicalEvolution, 
  MedicationMAR, 
  StaffRoster, 
  HandoverLog, 
  ClinicalAlert,
  Timeline360Event,
  FinancialRecord,
  InventoryItem,
  LabResult,
  OCRDocument,
  BPMNWorkflowInstance,
  QualityMetric,
  FamilyNote,
  StaffTraining,
  AuditLogEntry
} from '../types';

export const INITIAL_RESIDENTS: Resident[] = [
  {
    id: 'res-1',
    name: 'Sra. Helena Vasconcelos',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    age: 68,
    cpf: '214.890.312-08',
    room: 'Suíte 101 - Leito A',
    unit: 'Unidade Jardim Paulista',
    dependenceLevel: 'Grau II',
    primaryDiagnosis: 'Transtorno Afetivo Bipolar I com Episódios Depressivos Misto',
    secondaryDiagnoses: ['Hipertensão Arterial Sistêmica', 'Osteoartrose leve'],
    status: 'Ativo',
    admissionsDate: '12/03/2025',
    allergies: ['Dipirona', 'Penicilina'],
    emergencyContact: {
      name: 'Roberto Vasconcelos (Filho)',
      relationship: 'Filho Responsável Legal',
      phone: '(11) 98765-4321',
    },
    keyTherapists: [
      { role: 'Psiquiatra', name: 'Dr. Fernando Alencar' },
      { role: 'Psicóloga', name: 'Dra. Camila Meireles' },
      { role: 'Terapeuta Ocupacional', name: 'Dra. Juliana Prado' },
    ],
    riskScore: 'Alto',
    singularTherapeuticPlan: {
      mainFocus: 'Estabilização de humor, engajamento em oficinas de arte e caminhadas supervisionadas no jardim.',
      goals: [
        'Aumentar adesão à rotina de sono e horários de medicação',
        'Participar de 3 sessões semanais de arteterapia com foco em expressividade',
        'Reduzir quadros de ansiedade noturna sem uso abusivo de ansiolíticos'
      ],
      reviewDate: '15/08/2026',
      progressPercentage: 75,
    },
    notesCount: 14,
    medsPendingCount: 1,
    news2: {
      totalScore: 5,
      riskLevel: 'Moderado',
      respiratoryRateScore: 1,
      oxygenSatScore: 0,
      supplementalOxygenScore: 0,
      temperatureScore: 1,
      systolicBPScore: 2,
      heartRateScore: 1,
      consciousnessScore: 0,
      lastCalculated: '01/08/2026 14:30',
    },
    aiPredictions: [
      {
        id: 'pred-1',
        residentId: 'res-1',
        type: 'Crise Psiquiátrica',
        riskPercentage: 68,
        confidenceLevel: 'Alta',
        keyVariables: ['Insônia nas últimas 48h', 'Recusa parcial de medicação às 22h', 'Oscilação em tom de voz'],
        explanation: 'Algoritmo identificou padrão de privação de sono combinado a recusa de medicação, elevando probabilidade de episódios maníacos nos próximos 3 dias.',
        suggestedAction: 'Avaliação psiquiátrica em 24h, reforço de oficina relaxante e checagem dupla na medicação noturna.',
        timestamp: '01/08/2026 11:00',
      },
      {
        id: 'pred-2',
        residentId: 'res-1',
        type: 'Queda',
        riskPercentage: 42,
        confidenceLevel: 'Média',
        keyVariables: ['Hipotensão ortostática', 'Uso de Quetiapina à noite'],
        explanation: 'Risco moderado no trajeto ao banheiro no período noturno devido à sonolência residual.',
        suggestedAction: 'Manter luz noturna guia no quarto e apoio físico para locomoção após as 22h.',
        timestamp: '01/08/2026 11:00',
      }
    ],
  },
  {
    id: 'res-2',
    name: 'Sr. Carlos Eduardo Mendonça',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    age: 54,
    cpf: '098.432.115-44',
    room: 'Suíte 102 - Leito B',
    unit: 'Unidade Jardim Paulista',
    dependenceLevel: 'Grau I',
    primaryDiagnosis: 'Reabilitação Neurocognitiva pós-Traumatismo Cranioencefálico (TCE)',
    secondaryDiagnoses: ['Déficit de Memória Recente', 'Hemiparesia Direita Leve'],
    status: 'Ativo',
    admissionsDate: '05/01/2026',
    allergies: ['Aspirina / AINEs'],
    emergencyContact: {
      name: 'Luciana Mendonça',
      relationship: 'Esposa',
      phone: '(11) 99123-8877',
    },
    keyTherapists: [
      { role: 'Neurologista', name: 'Dr. Lucas Silveira' },
      { role: 'Terapeuta Ocupacional', name: 'Dra. Juliana Prado' },
      { role: 'Educador Físico', name: 'Prof. Marcelo Santos' },
    ],
    riskScore: 'Médio',
    singularTherapeuticPlan: {
      mainFocus: 'Recuperação de autonomia de AVDs (Atividades da Vida Diária) e treino cognitivo.',
      goals: [
        'Treino de memória com diário visual interativo',
        'Aprimoramento da marcha com apoio ortótico',
        'Gerenciamento autônomo do vestuário e higiene básica'
      ],
      reviewDate: '20/08/2026',
      progressPercentage: 60,
    },
    notesCount: 9,
    medsPendingCount: 0,
    news2: {
      totalScore: 1,
      riskLevel: 'Baixo',
      respiratoryRateScore: 0,
      oxygenSatScore: 0,
      supplementalOxygenScore: 0,
      temperatureScore: 0,
      systolicBPScore: 1,
      heartRateScore: 0,
      consciousnessScore: 0,
      lastCalculated: '01/08/2026 10:00',
    },
    aiPredictions: [
      {
        id: 'pred-3',
        residentId: 'res-2',
        type: 'Não Adesão MAR',
        riskPercentage: 12,
        confidenceLevel: 'Baixa',
        keyVariables: ['Boa cooperação', 'Acompanhamento ativo da família'],
        explanation: 'Excelente histórico de adesão medicamentosa nos últimos 60 dias.',
        suggestedAction: 'Manter reforço positivo e estímulo à autonomia.',
        timestamp: '01/08/2026 09:00',
      }
    ],
  },
  {
    id: 'res-3',
    name: 'Dra. Tereza de Jesus Moreira',
    photo: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=150&auto=format&fit=crop&q=80',
    age: 82,
    cpf: '334.112.987-12',
    room: 'Suíte 201 - Leito A',
    unit: 'Unidade Jardim Paulista',
    dependenceLevel: 'Grau III',
    primaryDiagnosis: 'Demência de Alzheimer em Estágio Moderado a Avançado',
    secondaryDiagnoses: ['Hipertensão Arterial', 'Disfagia Leve para Líquidos'],
    status: 'Em Observação',
    admissionsDate: '18/11/2024',
    allergies: ['Frutos do Mar', 'Sulfa'],
    emergencyContact: {
      name: 'Mariana Moreira',
      relationship: 'Neta',
      phone: '(11) 97711-2233',
    },
    keyTherapists: [
      { role: 'Geriatra', name: 'Dr. Antonio Bressan' },
      { role: 'Fonoaudióloga', name: 'Dra. Patricia Lima' },
      { role: 'Enfermeiro RT', name: 'Enf. Bruno Costa' },
    ],
    riskScore: 'Crítico',
    singularTherapeuticPlan: {
      mainFocus: 'Prevenção de quedas, manutenção nutricional segura e estimulação sensorial de reminiscência.',
      goals: [
        'Manter padrão de hidratação com espessante nível 1',
        'Protocolo rigoroso de prevenção de lesões por pressão',
        'Sessões diárias de musicoterapia com playlist nostálgica'
      ],
      reviewDate: '10/08/2026',
      progressPercentage: 40,
    },
    notesCount: 22,
    medsPendingCount: 2,
    news2: {
      totalScore: 7,
      riskLevel: 'Crítico',
      respiratoryRateScore: 2,
      oxygenSatScore: 2,
      supplementalOxygenScore: 0,
      temperatureScore: 1,
      systolicBPScore: 1,
      heartRateScore: 1,
      consciousnessScore: 0,
      lastCalculated: '01/08/2026 12:15',
    },
    aiPredictions: [
      {
        id: 'pred-4',
        residentId: 'res-3',
        type: 'Internação',
        riskPercentage: 81,
        confidenceLevel: 'Alta',
        keyVariables: ['Frequência respiratória alterada (24 irpm)', 'Saturação O2 em 93%', 'Atraso em medicação neuroleptica'],
        explanation: 'Início provável de quadro infeccioso respiratório ou descompensação clínica. Elevado risco de hospitalização nas próximas 48h.',
        suggestedAction: 'Solicitação imediata de Hemograma + PCR, ausculta pulmonar pelo médico plantonista e suplementação de oxigênio se SpO2 < 92%.',
        timestamp: '01/08/2026 12:30',
      },
      {
        id: 'pred-5',
        residentId: 'res-3',
        type: 'Queda',
        riskPercentage: 74,
        confidenceLevel: 'Alta',
        keyVariables: ['Grau III de dependência', 'Agitação motora episódica ao entardecer'],
        explanation: 'Síndrome do pôr-do-sol associada à desorientação espacial eleva risco de queda no leito.',
        suggestedAction: 'Elevar grades acolchoadas da cama e manter campainha de emergência ao alcance da cuidadora.',
        timestamp: '01/08/2026 12:30',
      }
    ],
  },
  {
    id: 'res-4',
    name: 'Sr. Gabriel Barbosa da Silva',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    age: 41,
    cpf: '123.987.654-00',
    room: 'Suíte 202 - Leito A',
    unit: 'Unidade Jardim Paulista',
    dependenceLevel: 'Grau I',
    primaryDiagnosis: 'Esquizofrenia Paranóide em Fase de Remissão e Reabilitação Psicossocial',
    secondaryDiagnoses: ['Transtorno de Ansiedade Generalizada'],
    status: 'Ativo',
    admissionsDate: '01/02/2026',
    allergies: ['Nenhuma alergia conhecida'],
    emergencyContact: {
      name: 'Clara da Silva',
      relationship: 'Irmã',
      phone: '(11) 98822-1100',
    },
    keyTherapists: [
      { role: 'Psiquiatra', name: 'Dr. Fernando Alencar' },
      { role: 'Psicóloga', name: 'Dra. Camila Meireles' },
      { role: 'Assistente Social', name: 'Dra. Renata Paes' },
    ],
    riskScore: 'Baixo',
    singularTherapeuticPlan: {
      mainFocus: 'Reintegração comunitária, habilidades sociais e autonomia financeira monitorada.',
      goals: [
        'Cuidado com medicação de depósito mensal',
        'Treino de usabilidade de transporte público e compras',
        'Desenvolvimento de projeto de marcenaria comunitária'
      ],
      reviewDate: '01/09/2026',
      progressPercentage: 85,
    },
    notesCount: 11,
    medsPendingCount: 0,
  }
];

export const INITIAL_EVOLUTIONS: ClinicalEvolution[] = [
  {
    id: 'evo-101',
    residentId: 'res-1',
    residentName: 'Sra. Helena Vasconcelos',
    room: 'Suíte 101 - Leito A',
    date: '01/08/2026',
    time: '10:30',
    author: 'Dr. Fernando Alencar',
    role: 'Psiquiatra',
    soap: {
      subjective: 'Residente relata boa qualidade de sono esta noite (aproximadamente 7h contínuas). Demonstra humor eutímico, expressando desejo de pintar na oficina da tarde. Nega ideação suicida ou pensamentos intrusivos.',
      objective: 'Orientada em tempo e espaço. Contato verbal fluido e produtivo. Sinais vitais: PA 125/80 mmHg, FC 74 bpm, T 36.5°C. Esquema medicamentoso de 12/12h (08:00h e 20:00h) mantido e checado no MAR.',
      assessment: 'Quadro bipolar estabilizado em fase eutímica sob uso de Carbonato de Lítio e Quetiapina. Boa tolerabilidade farmacológica.',
      plan: 'Mantida prescrição e aprazamento padrão de 12/12h (08:00 e 20:00). Liberada para atividade externa supervisionada com a equipe de psicologia. Reavaliação psiquiátrica em 14 dias.',
    },
    tags: ['Psiquiatria', 'Eutimia', 'Aprazamento 12/12h (08h/20h)', 'Arte'],
    status: 'Finalizado',
    vitals: { bp: '125/80', hr: 74, temp: 36.5 },
  },
  {
    id: 'evo-102',
    residentId: 'res-2',
    residentName: 'Sr. Carlos Eduardo Mendonça',
    room: 'Suíte 102 - Leito B',
    date: '01/08/2026',
    time: '09:15',
    author: 'Dra. Juliana Prado',
    role: 'Terapeuta Ocupacional',
    soap: {
      subjective: 'Residente entusiasmado após conseguir abotoar a camisa sozinho durante o treino matinal de AVD. Relata leve cansaço no braço direito, mas nega dor aguda.',
      objective: 'Realizado treino de coordenação motora fina utilizando tabuleiros de encaixe e simulação de vestuário. Apresentou melhoria de 15% na velocidade de preensão em pinça com a mão direita. Medicação matinal das 08:00h administrada sem intercorrências conforme protocolo 12/12h.',
      assessment: 'Evolução motora expressiva no membro superior acometido. Motivação elevada para novos desafios funcionais.',
      plan: 'Continuar treino 3x por semana. Manter rigor na administração dos medicamentos nos horários das 08:00h e 20:00h. Introduzir utensílios adaptados para refeições independentes a partir de ammanhã.',
    },
    tags: ['Terapia Ocupacional', 'AVD', 'Reabilitação Neuro', 'Aprazamento 12/12h'],
    status: 'Finalizado',
  },
  {
    id: 'evo-103',
    residentId: 'res-3',
    residentName: 'Dra. Tereza de Jesus Moreira',
    room: 'Suíte 201 - Leito A',
    date: '01/08/2026',
    time: '08:00',
    author: 'Enf. Bruno Costa',
    role: 'Enfermeiro RT',
    soap: {
      subjective: 'Acompanhante noturna relata episódios de agitação psicomotora por volta das 03:00 com tentativa de deambulação sem apoio.',
      objective: 'Residente em leito com grades elevadas. Apresenta pele íntegra em região sacra e trocantérica (sem hiperemia). Ausculta respiratória limpa. PA 138/85 mmHg, SatO2 96% em ar ambiente. Dose matinal das 08:00h do esquema 12/12h pendente de fonoaudiologia.',
      assessment: 'Agitação noturna associada a Síndrome do Pôr do Sol (Sundowning) e desacostume com ambiente de penumbra.',
      plan: 'Mantida luz de vigia amarelada no quarto. Protocolo de hidratação fracionada ativo. Notificada equipe médica e fonoaudiologia para liberar dose das 08:00h com espessante e manter rigor no esquema 12/12h (08:00 e 20:00).',
    },
    tags: ['Enfermagem', 'Alzheimer', 'Prevenção de Quedas', 'Aprazamento 12/12h (08h/20h)'],
    status: 'Finalizado',
    vitals: { bp: '138/85', hr: 82, temp: 36.8, spo2: 96 },
  },
];

export const INITIAL_MEDICATIONS: MedicationMAR[] = [
  {
    id: 'med-1',
    residentId: 'res-1',
    residentName: 'Sra. Helena Vasconcelos',
    room: 'Suíte 101 - Leito A',
    medicationName: 'Carbonato de Lítio (Carbolitium CR)',
    dosage: '450 mg',
    route: 'VO',
    frequency: '12/12h (08:00 e 20:00)',
    isControlled: true,
    prescribedBy: 'Dr. Fernando Alencar',
    stockDosesRemaining: 42,
    allergyWarning: 'Atenção: Alergia severa a Dipirona e Penicilina (Não misturar)',
    scheduledDoses: [
      { id: 'dose-1-1', time: '08:00', status: 'Ministrado', administeredBy: 'Enf. Bruno Costa', administeredAt: '08:05' },
      { id: 'dose-1-2', time: '20:00', status: 'Pendente' },
    ],
  },
  {
    id: 'med-2',
    residentId: 'res-1',
    residentName: 'Sra. Helena Vasconcelos',
    room: 'Suíte 101 - Leito A',
    medicationName: 'Quetiapina (Hemifumarato)',
    dosage: '100 mg',
    route: 'VO',
    frequency: '12/12h (08:00 e 20:00)',
    isControlled: true,
    prescribedBy: 'Dr. Fernando Alencar',
    stockDosesRemaining: 28,
    scheduledDoses: [
      { id: 'dose-2-1', time: '08:00', status: 'Ministrado', administeredBy: 'Enf. Bruno Costa', administeredAt: '08:10' },
      { id: 'dose-2-2', time: '20:00', status: 'Pendente' },
    ],
  },
  {
    id: 'med-3',
    residentId: 'res-2',
    residentName: 'Sr. Carlos Eduardo Mendonça',
    room: 'Suíte 102 - Leito B',
    medicationName: 'Levetiracetam (Keppra)',
    dosage: '500 mg',
    route: 'VO',
    frequency: '12/12h (08:00 e 20:00)',
    isControlled: true,
    prescribedBy: 'Dr. Lucas Silveira',
    stockDosesRemaining: 30,
    scheduledDoses: [
      { id: 'dose-3-1', time: '08:00', status: 'Ministrado', administeredBy: 'Enf. Bruno Costa', administeredAt: '08:12' },
      { id: 'dose-3-2', time: '20:00', status: 'Pendente' },
    ],
  },
  {
    id: 'med-4',
    residentId: 'res-3',
    residentName: 'Dra. Tereza de Jesus Moreira',
    room: 'Suíte 201 - Leito A',
    medicationName: 'Donepezila (Cloridrato)',
    dosage: '10 mg',
    route: 'VO',
    frequency: '12/12h (08:00 e 20:00)',
    isControlled: true,
    prescribedBy: 'Dr. Antonio Bressan',
    stockDosesRemaining: 14,
    scheduledDoses: [
      { id: 'dose-4-1', time: '08:00', status: 'Ministrado', administeredBy: 'Enf. Bruno Costa', administeredAt: '08:20' },
      { id: 'dose-4-2', time: '20:00', status: 'Pendente' },
    ],
  },
  {
    id: 'med-5',
    residentId: 'res-3',
    residentName: 'Dra. Tereza de Jesus Moreira',
    room: 'Suíte 201 - Leito A',
    medicationName: 'Memantina (Cloridrato)',
    dosage: '10 mg',
    route: 'VO',
    frequency: '12/12h (08:00 e 20:00)',
    isControlled: true,
    prescribedBy: 'Dr. Antonio Bressan',
    stockDosesRemaining: 8, // estoque baixo para alerta
    scheduledDoses: [
      { id: 'dose-5-1', time: '08:00', status: 'Atrasado', notes: 'Aguardando avaliação fonoaudiológica para líq. espessado' },
      { id: 'dose-5-2', time: '20:00', status: 'Pendente' },
    ],
  },
  {
    id: 'med-6',
    residentId: 'res-4',
    residentName: 'Sr. Gabriel Barbosa da Silva',
    room: 'Suíte 202 - Leito A',
    medicationName: 'Risperidona (Solução Oral 1mg/ml)',
    dosage: '2 mg (2 ml)',
    route: 'VO',
    frequency: '12/12h (08:00 e 20:00)',
    isControlled: true,
    prescribedBy: 'Dr. Fernando Alencar',
    stockDosesRemaining: 60,
    scheduledDoses: [
      { id: 'dose-6-1', time: '08:00', status: 'Ministrado', administeredBy: 'Enf. Bruno Costa', administeredAt: '08:02' },
      { id: 'dose-6-2', time: '20:00', status: 'Pendente' },
    ],
  }
];

export const INITIAL_ROSTER: StaffRoster[] = [
  { id: 'rost-1', date: '01/08/2026', dayOfWeek: 'Segunda', shiftType: 'Manhã (07h-13h)', roleRequired: 'Enfermeiro RT', assignedStaffName: 'Enf. Bruno Costa', status: 'Confirmado' },
  { id: 'rost-2', date: '01/08/2026', dayOfWeek: 'Segunda', shiftType: 'Tarde (13h-19h)', roleRequired: 'Enfermeiro RT', assignedStaffName: 'Enf. Mariana Duarte', status: 'Confirmado' },
  { id: 'rost-3', date: '01/08/2026', dayOfWeek: 'Segunda', shiftType: 'Noturno (19h-07h)', roleRequired: 'Enfermeiro RT', assignedStaffName: 'Enf. Thiago Ramos', status: 'Confirmado' },
  { id: 'rost-4', date: '02/08/2026', dayOfWeek: 'Terça', shiftType: 'Manhã (07h-13h)', roleRequired: 'Enfermeiro RT', assignedStaffName: 'Enf. Bruno Costa', status: 'Confirmado' },
  { id: 'rost-5', date: '02/08/2026', dayOfWeek: 'Terça', shiftType: 'Tarde (13h-19h)', roleRequired: 'Terapeuta Ocupacional', assignedStaffName: 'Dra. Juliana Prado', status: 'Confirmado' },
  { id: 'rost-6', date: '02/08/2026', dayOfWeek: 'Terça', shiftType: 'Noturno (19h-07h)', roleRequired: 'Enfermeiro RT', assignedStaffName: undefined, status: 'Vago', notes: 'LACUNA CRÍTICA: Plantão noturno sem enfermeiro responsável!' },
  { id: 'rost-7', date: '03/08/2026', dayOfWeek: 'Quarta', shiftType: 'Manhã (07h-13h)', roleRequired: 'Psiquiatra', assignedStaffName: 'Dr. Fernando Alencar', status: 'Confirmado' },
];

export const INITIAL_HANDOVERS: HandoverLog[] = [
  {
    id: 'ho-1',
    date: '01/08/2026',
    shift: 'Manhã',
    authorName: 'Enf. Bruno Costa',
    authorRole: 'Enfermeiro RT',
    summaryText: 'Turno da manhã tranquilo e sem intercorrências graves. Todos os residentes realizaram o desjejum normalmente. Sra. Helena apresentou humor estabilizado e participou ativamente das atividades. Dose de Memantina da Dra. Tereza atrasada aguardando frasco de líquido espessante enviado pela farmácia.',
    occurrences: [
      {
        id: 'occ-1',
        residentId: 'res-3',
        residentName: 'Dra. Tereza de Jesus Moreira',
        priority: 'Média',
        category: 'Medicação',
        time: '08:30',
        description: 'Pendente recebimento de espessante da farmácia para administração de medicação via oral.',
        resolved: false,
      },
      {
        id: 'occ-2',
        residentId: 'res-2',
        residentName: 'Sr. Carlos Eduardo Mendonça',
        priority: 'Baixa',
        category: 'Atividade Terapêutica',
        time: '10:00',
        description: 'Sessão de TO finalizada com sucesso. Ganho de autonomia motora registrado em prontuário.',
        resolved: true,
      }
    ],
    acknowledgedBy: ['Enf. Mariana Duarte', 'Dra. Juliana Prado'],
  }
];

export const INITIAL_ALERTS: ClinicalAlert[] = [
  {
    id: 'alt-1',
    residentId: 'res-3',
    residentName: 'Dra. Tereza de Jesus Moreira',
    type: 'Medicação Atrasada',
    severity: 'Crítico',
    message: 'Memantina 10mg das 08:00 com atraso de >2 horas. Necessário avaliar via e consistência com fonoaudiologia.',
    timestamp: '01/08/2026 10:15',
    read: false,
  },
  {
    id: 'alt-2',
    type: 'Lacuna na Escala',
    severity: 'Alto',
    message: 'Escala do dia 02/08 (Noturno) sem Enfermeiro RT escalado. Ação necessária para cobertura imediata.',
    timestamp: '01/08/2026 09:00',
    read: false,
  },
  {
    id: 'alt-3',
    residentId: 'res-1',
    residentName: 'Sra. Helena Vasconcelos',
    type: 'Alergia Medicamentosa',
    severity: 'Médio',
    message: 'Lembrete de segurança: Alergia severa cadastrada (Dipirona e Penicilina). Checagem dupla obrigatória.',
    timestamp: '01/08/2026 08:00',
    read: true,
  },
  {
    id: 'alt-4',
    residentId: 'res-2',
    residentName: 'Sr. Carlos Eduardo Mendonça',
    type: 'PTS Pendente',
    severity: 'Info',
    message: 'Plano Terapêutico Singular possui revisão agendada para 20/08/2026.',
    timestamp: '31/07/2026 14:00',
    read: true,
  }
];

export const INITIAL_TIMELINE_360: Timeline360Event[] = [
  {
    id: 'time-1',
    residentId: 'res-1',
    timestamp: '01/08/2026 14:30',
    type: 'Evolução SOAP',
    title: 'Evolução Psiquiátrica de Rotina',
    description: 'Residente tranquila, relatando boa adaptação ao grupo de arteterapia. Sem sinais de hipotimia ou agitação no momento.',
    authorName: 'Dr. Fernando Alencar',
    authorRole: 'Psiquiatra',
    severity: 'Normal',
  },
  {
    id: 'time-2',
    residentId: 'res-1',
    timestamp: '01/08/2026 08:00',
    type: 'Medicação MAR',
    title: 'Carbonato de Lítio 300mg Ministrado',
    description: 'Dose matinal ministrada sem intercorrências. Boa aceitação da residente.',
    authorName: 'Enf. Mariana Duarte',
    authorRole: 'Enfermeiro RT',
    severity: 'Normal',
  },
  {
    id: 'time-3',
    residentId: 'res-3',
    timestamp: '01/08/2026 12:15',
    type: 'Exame Laboratorial',
    title: 'Resultado de Hemograma e PCR Liberado',
    description: 'Leucocitose leve com neutrofia (11.800/mm³) e PCR em 14 mg/L. Sinalizador de inflamação/infecção incipiente.',
    authorName: 'Lab Diagnósticos Central',
    authorRole: 'Laboratório Integrado',
    severity: 'Urgente',
  },
  {
    id: 'time-4',
    residentId: 'res-3',
    timestamp: '01/08/2026 10:15',
    type: 'Intercorrência',
    title: 'Recusa de Medicação e Tosse ao Deglutir',
    description: 'Dra. Tereza engasgou levemente com a água ao tentar tomar a Memantina. Solicitada avaliação da fonoaudiologia.',
    authorName: 'Téc. Enfermagem Carla',
    authorRole: 'Técnico de Enfermagem',
    severity: 'Crítico',
  },
  {
    id: 'time-5',
    residentId: 'res-2',
    timestamp: '31/07/2026 16:00',
    type: 'Visita Familiar',
    title: 'Visita de Acompanhamento da Esposa',
    description: 'Sra. Luciana esteve na unidade. Trazidos pertences pessoais e fruteira. Residente comunicativo e orientado.',
    authorName: 'Assistente Social Ana',
    authorRole: 'Assistente Social',
    severity: 'Normal',
  }
];

export const INITIAL_FINANCIAL_RECORDS: FinancialRecord[] = [
  {
    id: 'fin-1',
    residentId: 'res-1',
    residentName: 'Sra. Helena Vasconcelos',
    type: 'Mensalidade',
    amount: 7800.00,
    dueDate: '05/08/2026',
    status: 'Pago',
    paymentMethod: 'PIX',
    costCenter: 'Unidade Jardim Paulista',
  },
  {
    id: 'fin-2',
    residentId: 'res-2',
    residentName: 'Sr. Carlos Eduardo Mendonça',
    type: 'Convênio',
    amount: 8500.00,
    dueDate: '10/08/2026',
    status: 'Pendente',
    paymentMethod: 'SUS/Guia',
    costCenter: 'Unidade Jardim Paulista',
  },
  {
    id: 'fin-3',
    residentId: 'res-3',
    residentName: 'Dra. Tereza de Jesus Moreira',
    type: 'Mensalidade',
    amount: 9200.00,
    dueDate: '01/08/2026',
    status: 'Atrasado',
    paymentMethod: 'Boleto',
    costCenter: 'Unidade Jardim Paulista',
  },
  {
    id: 'fin-4',
    type: 'Insumos Médicos',
    amount: 3450.00,
    dueDate: '15/08/2026',
    status: 'Pendente',
    paymentMethod: 'Transferência',
    costCenter: 'Farmácia Central',
  }
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'inv-1',
    code: 'MED-001',
    name: 'Quetiapina 25mg Comprimidos',
    category: 'Medicamento',
    stockCurrent: 140,
    stockMinimum: 50,
    unit: 'Comprimido',
    batchNumber: 'L88231',
    expirationDate: '12/2027',
    estimatedConsumptionDays: 28,
    suggestedPurchaseQty: 100,
  },
  {
    id: 'inv-2',
    code: 'SUP-002',
    name: 'Espessante Alimentar Instantâneo 225g',
    category: 'Material Médico',
    stockCurrent: 3,
    stockMinimum: 10,
    unit: 'Lata',
    batchNumber: 'L10294',
    expirationDate: '09/2026',
    estimatedConsumptionDays: 4,
    suggestedPurchaseQty: 15,
  },
  {
    id: 'inv-3',
    code: 'EPI-003',
    name: 'Luvas de Procedimento Nitrílicas Tam. M',
    category: 'EPI',
    stockCurrent: 450,
    stockMinimum: 200,
    unit: 'Unidade',
    batchNumber: 'L99482',
    expirationDate: '01/2029',
    estimatedConsumptionDays: 15,
    suggestedPurchaseQty: 500,
  },
  {
    id: 'inv-4',
    code: 'FRA-004',
    name: 'Fralda Geriátrica Noturna Tam. G',
    category: 'Fralda',
    stockCurrent: 80,
    stockMinimum: 120,
    unit: 'Unidade',
    batchNumber: 'L44312',
    expirationDate: '05/2028',
    estimatedConsumptionDays: 6,
    suggestedPurchaseQty: 200,
  }
];

export const INITIAL_LAB_RESULTS: LabResult[] = [
  {
    id: 'lab-1',
    residentId: 'res-3',
    examName: 'Hemograma Completo + PCR Ultrassensível',
    date: '01/08/2026',
    status: 'Alterado',
    laboratoryName: 'Laboratório Hermes Pardini',
    results: [
      { parameter: 'Hemácias', value: '4.1 M/µL', referenceRange: '4.0 - 5.2 M/µL', isAbnormal: false },
      { parameter: 'Hemoglobina', value: '11.8 g/dL', referenceRange: '12.0 - 15.5 g/dL', isAbnormal: true },
      { parameter: 'Leucócitos Totais', value: '11.800 /mm³', referenceRange: '4.000 - 10.000 /mm³', isAbnormal: true },
      { parameter: 'Proteína C-Reativa (PCR)', value: '14.2 mg/L', referenceRange: '< 5.0 mg/L', isAbnormal: true }
    ]
  },
  {
    id: 'lab-2',
    residentId: 'res-1',
    examName: 'Litemia + Função Renal (Ureia e Creatinina)',
    date: '25/07/2026',
    status: 'Normal',
    laboratoryName: 'Fleury Medicina Diagnóstica',
    results: [
      { parameter: 'Lítio Sérico', value: '0.8 mEq/L', referenceRange: '0.6 - 1.2 mEq/L', isAbnormal: false },
      { parameter: 'Creatinina', value: '0.9 mg/dL', referenceRange: '0.6 - 1.1 mg/dL', isAbnormal: false },
      { parameter: 'Ureia', value: '32 mg/dL', referenceRange: '15 - 45 mg/dL', isAbnormal: false }
    ]
  }
];

export const INITIAL_OCR_DOCS: OCRDocument[] = [
  {
    id: 'ocr-1',
    residentId: 'res-1',
    type: 'Receita Médica',
    fileName: 'receita_litio_quetiapina_helena.pdf',
    extractedText: 'Receituário C1. Prescrevo para Helena Vasconcelos: 1. Carbonato de Lítio 300mg - Tomar 1 cp VO de 12/12h. 2. Quetiapina 25mg - Tomar 1 cp VO à noite.',
    structuredData: {
      medicationsFound: ['Carbonato de Lítio 300mg', 'Quetiapina 25mg'],
      doctorCrm: 'CRM/SP 142.890',
      dateFound: '15/07/2026'
    },
    processedAt: '15/07/2026 14:20',
    verifiedByStaff: true
  }
];

export const INITIAL_BPMN_WORKFLOWS: BPMNWorkflowInstance[] = [
  {
    id: 'bpmn-1',
    processName: 'Protocolo de Queda',
    residentId: 'res-3',
    residentName: 'Dra. Tereza de Jesus Moreira',
    currentState: 'Avaliação Médica de Urgência',
    stepsCompleted: ['Abertura de Intercorrência', 'Primeiros Socorros Enfermagem', 'Aferição de Sinais Vitais'],
    pendingStep: 'Ausculta Pulmonar & Exames de Imagem',
    assignedRole: 'Psiquiatra',
    startedAt: '01/08/2026 10:20',
    updatedAt: '01/08/2026 11:00',
    status: 'Em Andamento',
  }
];

export const INITIAL_QUALITY_METRICS: QualityMetric[] = [
  {
    id: 'qual-1',
    indicator: 'Taxa de Queda (por 1000 leitos/dia)',
    value: 0.8,
    target: 1.2,
    status: 'Meta Atingida',
    period: 'Julho/2026',
  },
  {
    id: 'qual-2',
    indicator: 'Adesão MAR (%)',
    value: 98.4,
    target: 95.0,
    status: 'Meta Atingida',
    period: 'Julho/2026',
  },
  {
    id: 'qual-3',
    indicator: 'Tempo Médio Atendimento Intercorrências',
    value: 8.5, // minutos
    target: 10.0,
    status: 'Meta Atingida',
    period: 'Julho/2026',
  }
];

export const INITIAL_FAMILY_NOTES: FamilyNote[] = [
  {
    id: 'fam-1',
    residentId: 'res-1',
    familyName: 'Roberto Vasconcelos',
    kinship: 'Filho',
    date: '01/08/2026 09:30',
    message: 'Bom dia equipe! Como foi a noite da minha mãe? Gostaria de agendar a visita presencial para o próximo sábado às 15h.',
    status: 'Aprovado',
    staffResponse: 'Olá Roberto! A Sra. Helena dormiu tranquilamente. Visita confirmada para sábado às 15h no Jardim da Unidade.',
  }
];

export const INITIAL_STAFF_TRAININGS: StaffTraining[] = [
  {
    id: 'train-1',
    staffName: 'Enf. Mariana Castro',
    role: 'Enfermeiro RT',
    topic: 'NR32 Biossegurança',
    completedDate: '10/01/2026',
    expirationDate: '10/01/2027',
    status: 'Válido'
  },
  {
    id: 'train-2',
    staffName: 'Dr. Fernando Alencar',
    role: 'Psiquiatra',
    topic: 'BLS / Suporte Básico de Vida',
    completedDate: '15/03/2025',
    expirationDate: '15/03/2026',
    status: 'Vencido'
  },
  {
    id: 'train-3',
    staffName: 'Tec. Carlos Alberto',
    role: 'Cuidador',
    topic: 'Manejamento de Crise Psiquiátrica',
    completedDate: '20/07/2026',
    expirationDate: '20/08/2026',
    status: 'A Vencer'
  },
  {
    id: 'train-4',
    staffName: 'Dra. Camila Meireles',
    role: 'Psicólogo',
    topic: 'LGPD e Prontuários',
    completedDate: '01/06/2026',
    expirationDate: '01/06/2027',
    status: 'Válido'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'audit-1',
    userId: 'usr-101',
    userName: 'Enf. Mariana Castro',
    userRole: 'Enfermeiro RT',
    action: 'Acesso',
    resource: 'Prontuário de Helena Vasconcelos',
    ipAddress: '187.32.110.45',
    timestamp: '02/08/2026 08:15:22',
    reason: 'Passagem de Plantão e Validação de MAR'
  },
  {
    id: 'audit-2',
    userId: 'usr-102',
    userName: 'Dr. Fernando Alencar',
    userRole: 'Psiquiatra',
    action: 'Assinatura',
    resource: 'Evolução SOAP evo-101',
    ipAddress: '201.88.14.92',
    timestamp: '02/08/2026 09:30:11',
    reason: 'Assinatura Digital de Prescrição Médica'
  },
  {
    id: 'audit-3',
    userId: 'usr-103',
    userName: 'Dra. Camila Meireles',
    userRole: 'DPO / Psicóloga',
    action: 'Exportação LGPD',
    resource: 'Ficha Portabilidade Titular (Art. 18)',
    ipAddress: '177.10.220.18',
    timestamp: '02/08/2026 10:05:00',
    reason: 'Solicitação Formal do Responsável Legal'
  }
];


