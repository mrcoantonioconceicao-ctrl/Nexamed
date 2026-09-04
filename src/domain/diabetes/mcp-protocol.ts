/**
 * Model Context Protocol (MCP) Interface & Tool Declarations
 * Adheres to Anthropic / Model Context Protocol specifications
 * allowing AI agents and external orchestrators to inspect and act on Diabetes Care.
 */

export interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description: string;
      enum?: string[];
    }>;
    required?: string[];
  };
}

export interface McpResourceDefinition {
  uri: string;
  name: string;
  mimeType: string;
  description: string;
}

export interface McpPromptDefinition {
  name: string;
  description: string;
  arguments?: {
    name: string;
    description: string;
    required: boolean;
  }[];
}

export const MCP_DIABETES_TOOLS: McpToolDefinition[] = [
  {
    name: 'diabetes_get_measurements',
    description: 'Recupera o histórico de aferições de glicemia capilar (HGT) de uma residente no SRT com classificação de faixas SBD.',
    inputSchema: {
      type: 'object',
      properties: {
        residentId: {
          type: 'string',
          description: 'ID da residente (res-1 para Helena Vasconcelos, res-3 para Tereza Moreira)'
        },
        limit: {
          type: 'number',
          description: 'Quantidade máxima de registros a retornar (padrão: 10)'
        }
      },
      required: ['residentId']
    }
  },
  {
    name: 'diabetes_calculate_correction_dose',
    description: 'Calcula a dose corretiva de Insulina Regular com base no valor da glicemia atual e nas regras médicas de escala móvel.',
    inputSchema: {
      type: 'object',
      properties: {
        residentId: {
          type: 'string',
          description: 'ID da residente com diabetes'
        },
        bgValue: {
          type: 'number',
          description: 'Valor de glicemia capilar aferido em mg/dL'
        }
      },
      required: ['residentId', 'bgValue']
    }
  },
  {
    name: 'diabetes_trigger_rule_of_15',
    description: 'Aciona o protocolo BPMN de resgate da Regra dos 15 para hipoglicemia aguda (< 70 mg/dL).',
    inputSchema: {
      type: 'object',
      properties: {
        residentId: {
          type: 'string',
          description: 'ID da residente apresentando hipoglicemia'
        },
        currentBg: {
          type: 'number',
          description: 'Valor medido que deflagrou o alarme (< 70 mg/dL)'
        },
        carbGiven: {
          type: 'string',
          description: 'Tipo de carboidrato ofertado (ex: 150ml de suco, 1 colher de açúcar)'
        }
      },
      required: ['residentId', 'currentBg', 'carbGiven']
    }
  },
  {
    name: 'diabetes_generate_soap_draft',
    description: 'Gera um rascunho de evolução multiprofissional (SOAP) focado em controle glicêmico, insulina e riscos metabólicos.',
    inputSchema: {
      type: 'object',
      properties: {
        residentId: {
          type: 'string',
          description: 'ID da residente'
        },
        evaluatorRole: {
          type: 'string',
          description: 'Cargo do profissional que está evoluindo (Enfermeiro RT, Médico, Nutricionista)'
        }
      },
      required: ['residentId']
    }
  }
];

export const MCP_DIABETES_RESOURCES: McpResourceDefinition[] = [
  {
    uri: 'diabetes://resident/res-1/glycemic-profile',
    name: 'Perfil Metabólico & Insulina: Sra. Helena Vasconcelos',
    mimeType: 'application/json',
    description: 'Dados de DM2, esquema de NPH matinal, escala móvel e interação com Quetiapina/Lítio.'
  },
  {
    uri: 'diabetes://resident/res-3/glycemic-profile',
    name: 'Perfil Metabólico & Insulina: Dra. Tereza de Jesus Moreira',
    mimeType: 'application/json',
    description: 'Dados de DM2 geriátrico com Alzheimer, esquema de Glargina noturna e protocolo de hipoglicemia assintomática.'
  },
  {
    uri: 'diabetes://protocols/sbd-2024-srt',
    name: 'Diretrizes SBD 2024 para Residências Terapêuticas',
    mimeType: 'text/markdown',
    description: 'Parâmetros de glicemia capilar, alvos de HbA1c e prevenção de hipoglicemia em saúde mental coletiva.'
  }
];

export const MCP_DIABETES_PROMPTS: McpPromptDefinition[] = [
  {
    name: 'clinical_diabetes_briefing',
    description: 'Gera briefing clínico com GraphRAG e histórico das últimas 48h para a passagem de plantão da enfermagem.',
    arguments: [
      {
        name: 'residentId',
        description: 'ID da residente (res-1 ou res-3)',
        required: true
      }
    ]
  }
];
