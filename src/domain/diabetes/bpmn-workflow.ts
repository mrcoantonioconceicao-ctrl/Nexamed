/**
 * Business Process Model and Notation (BPMN 2.0) Clinical Workflow Engine
 * Structured process nodes, gateways, timers and execution states for SRT
 */

export type BpmnNodeType = 
  | 'start_event' 
  | 'task' 
  | 'user_task' 
  | 'timer_event' 
  | 'exclusive_gateway' 
  | 'parallel_gateway' 
  | 'end_event' 
  | 'error_event';

export interface BpmnNode {
  id: string;
  name: string;
  type: BpmnNodeType;
  description: string;
  assignedRole: string;
  actionRequired?: string;
  options?: {
    label: string;
    targetNodeId: string;
    condition?: string;
  }[];
  defaultNextNodeId?: string;
  estimatedMinutes?: number;
}

export interface BpmnProcessDefinition {
  id: string;
  title: string;
  standardReference: string; // ex: "Diretrizes SBD 2024 / ADA 2024"
  description: string;
  initialNodeId: string;
  nodes: BpmnNode[];
}

/**
 * BPMN Process 1: Protocolo de Resgate de Hipoglicemia ("Regra dos 15")
 */
export const HYPOGLYCEMIA_RESCUE_PROCESS: BpmnProcessDefinition = {
  id: 'bpmn-hypo-rescue',
  title: 'BPMN: Manejo Clínico da Hipoglicemia (Regra dos 15)',
  standardReference: 'Sociedade Brasileira de Diabetes (SBD) & Protocolo Institucional SRT',
  description: 'Fluxo padronizado para reversão rápida e segura de episódios hipoglicêmicos (< 70 mg/dL) em residentes.',
  initialNodeId: 'node-start',
  nodes: [
    {
      id: 'node-start',
      name: 'Detecção de HGT < 70 mg/dL ou Sintomas',
      type: 'start_event',
      description: 'Glicemia capilar menor que 70 mg/dL ou residente apresentando sudorese, palidez, confusão mental ou tremores.',
      assignedRole: 'Cuidador ou Técnico de Enfermagem',
      defaultNextNodeId: 'node-eval-severity'
    },
    {
      id: 'node-eval-severity',
      name: 'Avaliação do Nível de Consciência',
      type: 'exclusive_gateway',
      description: 'Residente está consciente e capaz de deglutir com segurança?',
      assignedRole: 'Técnico de Enfermagem',
      options: [
        {
          label: 'Consciente (Deglutição Segura)',
          targetNodeId: 'node-administer-15g',
          condition: 'Residente alerta, deglute líquidos sem engasgo'
        },
        {
          label: 'Inconsciente / Torpor / Convulsão (< 54 mg/dL)',
          targetNodeId: 'node-severe-emergency',
          condition: 'Risco de broncoaspiração se ofertar via oral'
        }
      ]
    },
    {
      id: 'node-administer-15g',
      name: 'Ofertar 15g de Carboidrato Simples',
      type: 'user_task',
      description: 'Administrar imediatamente 150ml de suco de frutas, água com 1 colher de sopa de açúcar refinado ou 3 balas mastigáveis.',
      assignedRole: 'Técnico de Enfermagem ou Cuidador',
      actionRequired: 'Confirmar ingestão completa dos 15g de carboidrato',
      defaultNextNodeId: 'node-timer-15m'
    },
    {
      id: 'node-timer-15m',
      name: 'Aguardar 15 Minutos (Repouso)',
      type: 'timer_event',
      description: 'Manter a residente sentada em repouso. Não ofertar alimentos gordurosos (leite, chocolate retardam absorção da glicose).',
      assignedRole: 'Equipe de Plantão',
      estimatedMinutes: 15,
      defaultNextNodeId: 'node-recheck-bg'
    },
    {
      id: 'node-recheck-bg',
      name: 'Nova Aferição de Glicemia Capilar',
      type: 'task',
      description: 'Realizar nova punção capilar na ponta do dedo para checagem do valor após os 15 minutos.',
      assignedRole: 'Técnico de Enfermagem',
      actionRequired: 'Digitar o novo valor de HGT medido',
      defaultNextNodeId: 'node-eval-recheck'
    },
    {
      id: 'node-eval-recheck',
      name: 'Avaliação do Resultado Pós-Resgate',
      type: 'exclusive_gateway',
      description: 'A glicemia subiu para 70 mg/dL ou mais?',
      assignedRole: 'Técnico de Enfermagem',
      options: [
        {
          label: 'Glicemia ≥ 70 mg/dL (Normalizada)',
          targetNodeId: 'node-complex-snack',
          condition: 'Recuperação dos níveis seguros de glicemia'
        },
        {
          label: 'Glicemia Permanece < 70 mg/dL',
          targetNodeId: 'node-repeat-cycle',
          condition: 'Persistência do quadro hipoglicêmico'
        }
      ]
    },
    {
      id: 'node-repeat-cycle',
      name: 'Repetir 15g de Carboidrato (2º Ciclo)',
      type: 'user_task',
      description: 'Oferecer mais 15g de carboidrato simples e notificar o Enfermeiro RT de plantão. Se persistir após 2 ciclos, acionar médico assistente.',
      assignedRole: 'Técnico de Enfermagem / RT',
      defaultNextNodeId: 'node-timer-15m'
    },
    {
      id: 'node-complex-snack',
      name: 'Ofertar Lanche com Carboidrato Complexo',
      type: 'task',
      description: 'Se a próxima refeição demorar mais de 30 minutos, fornecer pão, biscoito integral ou fruta com fibras para sustentar a glicemia.',
      assignedRole: 'Nutrição / Cuidador',
      defaultNextNodeId: 'node-soap-record'
    },
    {
      id: 'node-severe-emergency',
      name: 'Emergência Médica: Acionar SAMU 192',
      type: 'error_event',
      description: 'Manter vias aéreas livres, decúbito lateral de segurança. Não ofertar nada pela boca! Acionar SAMU 192 e Enfermeiro RT imediatamente.',
      assignedRole: 'Toda a Equipe',
      actionRequired: 'Ligar 192 e relatar: Hipoglicemia severa com rebaixamento de consciência em idosa no SRT',
      defaultNextNodeId: 'node-soap-record'
    },
    {
      id: 'node-soap-record',
      name: 'Registro em Prontuário Eletrônico & Kardex',
      type: 'end_event',
      description: 'Documentar o evento no prontuário SOAP, registrar a conduta adotada e alertar o médico para avaliar ajuste nas doses de antidiabéticos.',
      assignedRole: 'Enfermeiro RT'
    }
  ]
};

/**
 * BPMN Process 2: Rotina de Monitoramento & Aplicação Segura de Insulina no SRT
 */
export const INSULIN_ROUTINE_PROCESS: BpmnProcessDefinition = {
  id: 'bpmn-insulin-routine',
  title: 'BPMN: Rotina de Monitoramento & Aplicação Segura de Insulina',
  standardReference: 'Protocolo de Segurança do Paciente (ANVISA/COFEN)',
  description: 'Garantia dos 9 certos da medicação, prevenção de lipodistrofia e uso seguro de escala móvel.',
  initialNodeId: 'node-sched-start',
  nodes: [
    {
      id: 'node-sched-start',
      name: 'Horário de Medicação / Aferição Prévia',
      type: 'start_event',
      description: 'Início do turno de verificação (ex: 07:00 jejum, 11:30 pré-almoço, 21:00 basal noturna).',
      assignedRole: 'Técnico de Enfermagem',
      defaultNextNodeId: 'node-hgt-check'
    },
    {
      id: 'node-hgt-check',
      name: 'Realizar Aferição de Glicemia Capilar',
      type: 'task',
      description: 'Higienização das mãos, assepsia com álcool 70%, punção em face lateral do dedo, conferência de data da fita.',
      assignedRole: 'Técnico de Enfermagem',
      defaultNextNodeId: 'node-check-prescription'
    },
    {
      id: 'node-check-prescription',
      name: 'Verificar Prescrição e Escala Móvel',
      type: 'exclusive_gateway',
      description: 'Definir necessidade de dose fixa (Basal NPH/Glargina) e/ou dose corretiva (Regular).',
      assignedRole: 'Técnico de Enfermagem',
      options: [
        {
          label: 'Glicemia Normal / Dose Fixa Prescrita',
          targetNodeId: 'node-site-rotation',
          condition: 'Aplicar apenas dose basal prescrita'
        },
        {
          label: 'Glicemia Elevada (> 180 mg/dL)',
          targetNodeId: 'node-sliding-scale-calc',
          condition: 'Calcular unidades adicionais de insulina rápida'
        }
      ]
    },
    {
      id: 'node-sliding-scale-calc',
      name: 'Calcular Unidades na Escala Móvel',
      type: 'task',
      description: 'Consultar tabela médica: 181-220 (2 UI), 221-260 (4 UI), >260 (6 UI + avisar enfermeiro).',
      assignedRole: 'Técnico de Enfermagem',
      defaultNextNodeId: 'node-double-check'
    },
    {
      id: 'node-double-check',
      name: 'Dupla Checagem de Segurança (MAR)',
      type: 'user_task',
      description: 'Segundo profissional ou enfermeiro confere tipo de frasco/caneta, graduação na seringa e nome do residente.',
      assignedRole: 'Enfermeiro RT ou 2º Técnico',
      defaultNextNodeId: 'node-site-rotation'
    },
    {
      id: 'node-site-rotation',
      name: 'Seleção do Sítio de Aplicação (Rodízio)',
      type: 'task',
      description: 'Consultar histórico: afastar no mínimo 2 cm da última picada para prevenir nódulos e lipodistrofia.',
      assignedRole: 'Técnico de Enfermagem',
      defaultNextNodeId: 'node-administer-subcut'
    },
    {
      id: 'node-administer-subcut',
      name: 'Aplicação Subcutânea e Espera de 10s',
      type: 'task',
      description: 'Prega cutânea suave se necessário, ângulo de 90° (agulhas curtas), injetar lentamente e contar 10 segundos antes de retirar.',
      assignedRole: 'Técnico de Enfermagem',
      defaultNextNodeId: 'node-mar-checkin'
    },
    {
      id: 'node-mar-checkin',
      name: 'Checagem no Kardex MAR e Prontuário',
      type: 'end_event',
      description: 'Assinar dose administrada, valor de HGT e sítio anatômico utilizado no sistema NexaMed.',
      assignedRole: 'Técnico de Enfermagem'
    }
  ]
};
