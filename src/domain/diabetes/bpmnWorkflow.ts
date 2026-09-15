// BPMN 2.0 Executable Clinical Workflow Engine for SRT Diabetes Management
// Process: PRC-SRT-DIABETES-001 (Monitoramento Glicêmico & Resgate de Hipoglicemia)

export type BPMNElementType = 
  | 'startEvent' 
  | 'userTask' 
  | 'serviceTask' 
  | 'exclusiveGateway' 
  | 'intermediateTimerEvent' 
  | 'callActivity' 
  | 'endEvent';

export interface BPMNNode {
  id: string;
  name: string;
  type: BPMNElementType;
  description: string;
  actor: 'Enfermagem' | 'Cuidador' | 'Sistema Nexa / IA' | 'Médico Assistente' | 'SAMU 192';
  next: string[];
  conditionLogic?: string;
  actionGuideline?: string;
}

export interface BPMNExecutionState {
  processId: string;
  activeNodeId: string;
  executionHistory: Array<{
    nodeId: string;
    timestamp: string;
    note: string;
    status: 'completed' | 'active' | 'skipped';
  }>;
  variables: {
    glucoseValue: number;
    residentName: string;
    cycleCount: number;
    resolved: boolean;
    requiresEmergency: boolean;
  };
}

export const SRT_DIABETES_BPMN_NODES: BPMNNode[] = [
  {
    id: 'START_EVENT',
    name: 'Início: Horário de Verificação HGT',
    type: 'startEvent',
    description: 'Disparo programado pela escala de enfermagem ou suspeita de sintomas hipo/hiper.',
    actor: 'Enfermagem',
    next: ['TASK_MEASURE_HGT'],
    actionGuideline: 'Higienizar as mãos e dedo da residente; conferir calibragem do glicosímetro.'
  },
  {
    id: 'TASK_MEASURE_HGT',
    name: 'Aferição da Glicemia Capilar (HGT)',
    type: 'userTask',
    description: 'Punção digital lateral e leitura imediata na fita reagente.',
    actor: 'Enfermagem',
    next: ['GATEWAY_EVAL_GLUCOSE'],
    actionGuideline: 'Registrar valor exato em mg/dL e observar se há sinais físicos (sudorese, tremores, agitação).'
  },
  {
    id: 'GATEWAY_EVAL_GLUCOSE',
    name: 'Avaliação de Faixa Glicêmica (XOR)',
    type: 'exclusiveGateway',
    description: 'Bifurcação de decisão clínica conforme valores de referência SBD/ADA.',
    actor: 'Sistema Nexa / IA',
    next: [
      'TASK_RESCUE_SEVERE_HYPO', 
      'TASK_RESCUE_MILD_HYPO', 
      'TASK_TARGET_RANGE_OK', 
      'TASK_EVAL_MILD_HYPER', 
      'TASK_MANAGE_SEVERE_HYPER'
    ],
    conditionLogic: '<54 = Grave | 54-69 = Hipoglicemia | 70-180 = Alvo | 181-250 = Hiper Leve | >250 = Hiper Grave'
  },
  {
    id: 'TASK_RESCUE_MILD_HYPO',
    name: 'Protocolo de Resgate: Regra dos 15g CHO',
    type: 'userTask',
    description: 'Ofertar 15g de carboidrato de rápida absorção por via oral (150ml suco de fruta ou água c/ 1 colher sopa açúcar).',
    actor: 'Cuidador',
    next: ['TIMER_WAIT_15MIN'],
    actionGuideline: 'Certificar-se de que a residente está sentada e deglutindo com segurança.'
  },
  {
    id: 'TASK_RESCUE_SEVERE_HYPO',
    name: 'Emergência: Hipoglicemia Grave (<54 mg/dL)',
    type: 'userTask',
    description: 'Se inconsciente/disfágica, NÃO administrar nada por boca (risco de broncoaspiração). Posicionar em decúbito lateral e acionar SAMU 192.',
    actor: 'Enfermagem',
    next: ['TASK_CALL_EMERGENCY'],
    actionGuideline: 'Glicose 50% EV pelo enfermeiro/médico ou acionamento de suporte avançado 192.'
  },
  {
    id: 'TIMER_WAIT_15MIN',
    name: 'Aguardar 15 Minutos em Repouso',
    type: 'intermediateTimerEvent',
    description: 'Tempo fisiológico para digestão e elevação da glicemia sérica.',
    actor: 'Sistema Nexa / IA',
    next: ['TASK_RECHECK_HGT'],
    actionGuideline: 'Manter a residente em vigilância constante, sem deixá-la sozinha.'
  },
  {
    id: 'TASK_RECHECK_HGT',
    name: 'Reaferição de HGT pós-resgate',
    type: 'userTask',
    description: 'Nova punção capilar para checagem da resposta aos 15g de carboidrato.',
    actor: 'Enfermagem',
    next: ['GATEWAY_HYPO_RESOLVED'],
    actionGuideline: 'Se glicemia atingir > 70 mg/dL, estabilizada. Caso contrário, novo ciclo.'
  },
  {
    id: 'GATEWAY_HYPO_RESOLVED',
    name: 'Glicemia Normalizou? (XOR)',
    type: 'exclusiveGateway',
    description: 'Verifica se o resgate teve sucesso ou necessita de 2º ciclo / suporte médico.',
    actor: 'Sistema Nexa / IA',
    next: ['TASK_SERVE_COMPLEX_CARB', 'TASK_RESCUE_MILD_HYPO', 'TASK_CALL_EMERGENCY'],
    conditionLogic: 'Se >=70 -> Lanche Complexo | Se <70 (1º ciclo) -> Repetir 15g | Se <70 (2º ciclo) -> SAMU'
  },
  {
    id: 'TASK_SERVE_COMPLEX_CARB',
    name: 'Lanche com Carboidrato Complexo',
    type: 'userTask',
    description: 'Oferecer carboidrato de lenta absorção (1 fatia de pão com queijo ou bolacha integral com leite) para prevenir efeito rebote.',
    actor: 'Cuidador',
    next: ['END_EVENT_RECORD_SOAP'],
    actionGuideline: 'Garantir que a refeição regular seja mantida sem supressões não prescritas.'
  },
  {
    id: 'TASK_CALL_EMERGENCY',
    name: 'Acionamento SAMU 192 & Médico RT',
    type: 'callActivity',
    description: 'Contatar serviço de atendimento móvel de urgência e médico assistente da residência.',
    actor: 'Médico Assistente',
    next: ['END_EVENT_RECORD_SOAP'],
    actionGuideline: 'Informar histórico de SRT, diabetes e medicações psiquiátricas em uso.'
  },
  {
    id: 'TASK_TARGET_RANGE_OK',
    name: 'Faixa Alvo Atingida (70-180 mg/dL)',
    type: 'serviceTask',
    description: 'Glicemia controlada dentro dos parâmetros estabelecidos pela equipe multiprofissional.',
    actor: 'Sistema Nexa / IA',
    next: ['END_EVENT_RECORD_SOAP'],
    actionGuideline: 'Liberar refeição padrão da dieta balanceada elaborada pela nutricionista.'
  },
  {
    id: 'TASK_EVAL_MILD_HYPER',
    name: 'Manejo de Hiperglicemia Leve/Mod (181-250)',
    type: 'userTask',
    description: 'Estimular hidratação oral com água e programar reavaliação no próximo plantão.',
    actor: 'Enfermagem',
    next: ['END_EVENT_RECORD_SOAP'],
    actionGuideline: 'Evitar alimentos ultraprocessados ou açúcares de adição na copa.'
  },
  {
    id: 'TASK_MANAGE_SEVERE_HYPER',
    name: 'Manejo Hiperglicemia Acentuada (> 250 mg/dL)',
    type: 'userTask',
    description: 'Aplicar escala móvel de Insulina Regular se prescrita e checar sintomas de desidratação e cetonúria.',
    actor: 'Enfermagem',
    next: ['END_EVENT_RECORD_SOAP'],
    actionGuideline: 'Notificar enfermeiro RT e verificar se houve omissão de dose no MAR.'
  },
  {
    id: 'END_EVENT_RECORD_SOAP',
    name: 'Fim: Registro no Prontuário SOAP & MAR',
    type: 'endEvent',
    description: 'Documentação do evento glicêmico, conduta adotada e auditoria do plantão.',
    actor: 'Sistema Nexa / IA',
    next: [],
    actionGuideline: 'Armazenar no prontuário do morador para acompanhamento na passagem de plantão.'
  }
];

export class BPMNWorkflowSimulator {
  /**
   * Simula a execução completa do processo BPMN para um dado valor de HGT
   */
  public static simulate(
    residentName: string,
    glucoseValue: number
  ): BPMNExecutionState {
    const history: BPMNExecutionState['executionHistory'] = [];

    // Step 1: Start
    history.push({
      nodeId: 'START_EVENT',
      timestamp: '08:00',
      note: `Início da verificação HGT de rotina para ${residentName}.`,
      status: 'completed'
    });

    // Step 2: Measure HGT
    history.push({
      nodeId: 'TASK_MEASURE_HGT',
      timestamp: '08:02',
      note: `Glicemia capilar aferida: ${glucoseValue} mg/dL.`,
      status: 'completed'
    });

    // Step 3: Gateway
    history.push({
      nodeId: 'GATEWAY_EVAL_GLUCOSE',
      timestamp: '08:02',
      note: `Sistema Nexa avaliou o valor ${glucoseValue} mg/dL.`,
      status: 'completed'
    });

    let activeNode = 'END_EVENT_RECORD_SOAP';

    if (glucoseValue < 54) {
      history.push({
        nodeId: 'TASK_RESCUE_SEVERE_HYPO',
        timestamp: '08:03',
        note: 'ALERTA SEVERO: Valor abaixo de 54 mg/dL. Proteção imediata de vias aéreas.',
        status: 'completed'
      });
      history.push({
        nodeId: 'TASK_CALL_EMERGENCY',
        timestamp: '08:04',
        note: 'Chamado acionado ao SAMU 192 e médico responsável.',
        status: 'completed'
      });
      activeNode = 'TASK_CALL_EMERGENCY';
    } else if (glucoseValue < 70) {
      history.push({
        nodeId: 'TASK_RESCUE_MILD_HYPO',
        timestamp: '08:03',
        note: 'Regra dos 15g administrada: 150 ml de suco de fruta oferecido.',
        status: 'completed'
      });
      history.push({
        nodeId: 'TIMER_WAIT_15MIN',
        timestamp: '08:18',
        note: 'Aguardado intervalo de 15 minutos em repouso.',
        status: 'completed'
      });
      history.push({
        nodeId: 'TASK_RECHECK_HGT',
        timestamp: '08:19',
        note: 'Nova aferição de HGT após resgate simulada.',
        status: 'completed'
      });

      // Simulate re-check value based on initial glucose to demonstrate gateway branching.
      // If initial glucose was very low (e.g., <= 60), simulate that re-check is still low (e.g., 65 mg/dL),
      // forcing an escalation or second cycle. Otherwise, simulate a successful re-check (e.g., 92 mg/dL).
      const simulatedRecheckGlucoseValue = (glucoseValue <= 60) ? 65 : 92;

      history.push({
        nodeId: 'GATEWAY_HYPO_RESOLVED',
        timestamp: '08:20',
        note: `Sistema Nexa avaliou o valor re-checado de ${simulatedRecheckGlucoseValue} mg/dL.`,        status: 'completed'
      });

      if (simulatedRecheckGlucoseValue >= 70) {
        history.push({
          nodeId: 'TASK_SERVE_COMPLEX_CARB',
          timestamp: '08:21',
          note: 'Glicemia normalizada. Ofertada refeição com carboidrato complexo para prevenir efeito rebote.',
          status: 'completed'
        });
        activeNode = 'TASK_SERVE_COMPLEX_CARB';
      } else { // simulatedRecheckGlucoseValue < 70
        // According to GATEWAY_HYPO_RESOLVED logic: "Se <70 (1º ciclo) -> Repetir 15g | Se <70 (2º ciclo) -> SAMU"
        // For simplicity in this single-pass simulation, if still low after the first rescue attempt, we escalate.
        history.push({
          nodeId: 'TASK_CALL_EMERGENCY',
          timestamp: '08:21',
          note: 'Glicemia ainda baixa após 1º resgate. Acionado SAMU 192 e médico responsável.',
          status: 'completed'
        });
        activeNode = 'TASK_CALL_EMERGENCY';
      }
    } else if (glucoseValue > 250) {
      history.push({
        nodeId: 'TASK_MANAGE_SEVERE_HYPER',
        timestamp: '08:03',
        note: 'Hiperglicemia > 250 mg/dL: Aplicada escala móvel de Insulina Regular e hidratação oral.',
        status: 'completed'
      });
      activeNode = 'TASK_MANAGE_SEVERE_HYPER';
    } else if (glucoseValue > 180) {
      history.push({
        nodeId: 'TASK_EVAL_MILD_HYPER',
        timestamp: '08:03',
        note: 'Hiperglicemia leve: Reforço hídrico prescrito e reavaliação agendada.',
        status: 'completed'
      });
      activeNode = 'TASK_EVAL_MILD_HYPER';
    } else {
      history.push({
        nodeId: 'TASK_TARGET_RANGE_OK',
        timestamp: '08:03',
        note: 'Euglicemia: Valor dentro da faixa alvo 70-180 mg/dL. Dieta liberada.',
        status: 'completed'
      });
      activeNode = 'TASK_TARGET_RANGE_OK';
    }

    // Step End
    history.push({
      nodeId: 'END_EVENT_RECORD_SOAP',
      timestamp: '08:25',
      note: 'Episódio e condutas registradas no Prontuário Eletrônico da SRT.',
      status: 'completed'
    });

    return {
      processId: 'PRC-SRT-DIABETES-001',
      activeNodeId: activeNode,
      executionHistory: history,
      variables: {
        glucoseValue,
        residentName,
        cycleCount: glucoseValue < 70 ? 1 : 0,
        resolved: glucoseValue >= 70 && glucoseValue <= 250,
        requiresEmergency: glucoseValue < 54
      }
    };
  }
}
