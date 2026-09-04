// GraphRAG & Model Context Protocol (MCP) Domain Engine for Diabetes Management in SRT
// Connects Knowledge Graph Triples, MCP Tools, and Fine-Tuned AI Prompts

export interface KnowledgeGraphNode {
  id: string;
  label: string;
  category: 'Residente' | 'Psicofármaco' | 'Antidiabético' | 'Condição Clínica' | 'Risco Metabólico' | 'Diretriz Clínica';
  description: string;
  attributes?: Record<string, string | number | boolean>;
}

export interface KnowledgeGraphEdge {
  id: string;
  source: string;
  target: string;
  relation: 
    | 'DIAGNOSTICADO_COM' 
    | 'FAZ_USO_DE' 
    | 'INDUZ_EFEITO_METABOLICO' 
    | 'EXIGE_CONDUTA_ESPECIAL' 
    | 'TEM_VULNERABILIDADE' 
    | 'REGULADO_POR_DIRETRIZ' 
    | 'CONTRAINDICA_CONDUTA'
    | 'EXIGE_RODIZIO';
  label: string;
  clinicalImpact: 'Alto' | 'Médio' | 'Informativo';
}

export interface MCPToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, { type: string; description: string; enum?: string[] }>;
    required: string[];
  };
}

// Initial Graph Triples for the 2 Residents with Diabetes in SRT
export const SRT_DIABETES_KNOWLEDGE_GRAPH: {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
} = {
  nodes: [
    {
      id: 'res-1',
      label: 'Sra. Helena Vasconcelos',
      category: 'Residente',
      description: '68 anos, TAB I eutímica, DM2 compensado com Metformina oral e dieta.'
    },
    {
      id: 'res-3',
      label: 'Dra. Tereza de Jesus Moreira',
      category: 'Residente',
      description: '82 anos, Alzheimer Moderado/Avançado, DM2 frágil insulinodependente com NPH e Regular.'
    },
    {
      id: 'drug-quetiapina',
      label: 'Quetiapina (Hemifumarato)',
      category: 'Psicofármaco',
      description: 'Antipsicótico atípico com efeito antagonista 5-HT2C e H1, indutor de ganho de peso e hiperglicemia.'
    },
    {
      id: 'drug-litio',
      label: 'Carbonato de Lítio',
      category: 'Psicofármaco',
      description: 'Estabilizador de humor com excreção renal. Risco de intoxicação lítica em caso de desidratação e poliúria osmótica diabética.'
    },
    {
      id: 'drug-metformina',
      label: 'Metformina 850mg',
      category: 'Antidiabético',
      description: 'Biguanida sensibilizadora de insulina. Monitorar função renal (TFG) e sintomas gastrointestinais.'
    },
    {
      id: 'drug-insulina-nph',
      label: 'Insulina Humana NPH',
      category: 'Antidiabético',
      description: 'Insulina basal de ação intermediária (início 1-2h, pico 4-10h, duração 14-18h). Pico noturno coincide com risco de hipoglicemia da madrugada.'
    },
    {
      id: 'cond-resistencia-insulina',
      label: 'Resistência Insulínica por Psicofármacos',
      category: 'Risco Metabólico',
      description: 'Aumento da glicemia pós-prandial secundária ao bloqueio de receptores histaminérgicos e serotoninérgicos.'
    },
    {
      id: 'cond-hipo-desapercebida',
      label: 'Hipoglicemia Não Reconhecida / Silenciosa',
      category: 'Risco Metabólico',
      description: 'Em idosos com demência avançada, ausência de sintomas adrenérgicos clássicos (tremores/palpitações); manifesta-se por sonolência, quedas ou agitação súbita.'
    },
    {
      id: 'cond-disfagia',
      label: 'Disfagia para Líquidos Finos',
      category: 'Condição Clínica',
      description: 'Dificuldade de deglutição com risco de broncoaspiração se ofertado suco ralo durante crise.'
    },
    {
      id: 'guideline-sbd-idoso',
      label: 'Diretriz SBD 2024 / ADA Idoso Frágil',
      category: 'Diretriz Clínica',
      description: 'Metas glicêmicas relaxadas (HbA1c até 8.0-8.5%, glicemia 100-200 mg/dL) para evitar hipoglicemias fatais.'
    },
    {
      id: 'cond-lipodistrofia',
      label: 'Lipodistrofia Subcutânea',
      category: 'Risco Metabólico',
      description: 'Hipertrofia ou atrofia do tecido adiposo por aplicações repetidas no mesmo ponto, causando absorção errática de insulina.'
    }
  ],
  edges: [
    {
      id: 'e1',
      source: 'res-1',
      target: 'drug-quetiapina',
      relation: 'FAZ_USO_DE',
      label: 'Prescrito para estabilização de humor',
      clinicalImpact: 'Alto'
    },
    {
      id: 'e2',
      source: 'drug-quetiapina',
      target: 'cond-resistencia-insulina',
      relation: 'INDUZ_EFEITO_METABOLICO',
      label: 'Aumenta glicemia de jejum e apetite por carboidratos',
      clinicalImpact: 'Alto'
    },
    {
      id: 'e3',
      source: 'res-1',
      target: 'drug-litio',
      relation: 'FAZ_USO_DE',
      label: 'Estabilizador de humor de uso contínuo',
      clinicalImpact: 'Médio'
    },
    {
      id: 'e4',
      source: 'drug-litio',
      target: 'res-1',
      relation: 'EXIGE_CONDUTA_ESPECIAL',
      label: 'Garantir aporte de 1.800 a 2.000 ml de água/dia para evitar litemia tóxica',
      clinicalImpact: 'Alto'
    },
    {
      id: 'e5',
      source: 'res-3',
      target: 'drug-insulina-nph',
      relation: 'FAZ_USO_DE',
      label: '14 UI manhã (07:30) e 8 UI noite (21:30)',
      clinicalImpact: 'Alto'
    },
    {
      id: 'e6',
      source: 'drug-insulina-nph',
      target: 'cond-lipodistrofia',
      relation: 'EXIGE_RODIZIO',
      label: 'Obrigatório rodízio de 8 sítios anatômicos com registro em mapa',
      clinicalImpact: 'Alto'
    },
    {
      id: 'e7',
      source: 'res-3',
      target: 'cond-hipo-desapercebida',
      relation: 'TEM_VULNERABILIDADE',
      label: 'Demência oculta sintomas adrenérgicos; hipoglicemia manifesta-se por letargia ou delírio',
      clinicalImpact: 'Alto'
    },
    {
      id: 'e8',
      source: 'cond-hipo-desapercebida',
      target: 'guideline-sbd-idoso',
      relation: 'REGULADO_POR_DIRETRIZ',
      label: 'Meta glicêmica afrouxada: tolerar 100 a 200 mg/dL sem correções agressivas',
      clinicalImpact: 'Alto'
    },
    {
      id: 'e9',
      source: 'res-3',
      target: 'cond-disfagia',
      relation: 'DIAGNOSTICADO_COM',
      label: 'Engasgos frequentes com líquidos puros',
      clinicalImpact: 'Alto'
    },
    {
      id: 'e10',
      source: 'cond-disfagia',
      target: 'res-3',
      relation: 'CONTRAINDICA_CONDUTA',
      label: 'Proibido oferecer copo de água/suco líquido ralo em crise de hipoglicemia; usar mel/gel de glicose na mucosa jugal ou suco espessado nível 2',
      clinicalImpact: 'Alto'
    }
  ]
};

// Model Context Protocol (MCP) Tool Specifications
export const SRT_DIABETES_MCP_TOOLS: MCPToolDefinition[] = [
  {
    name: 'mcp_check_hypoglycemia_safety',
    description: 'Valida a segurança imediata de um valor glicêmico e recomenda a via de resgate adequada (considerando disfagia e cognição da residente).',
    parameters: {
      type: 'object',
      properties: {
        residentId: { type: 'string', description: 'ID da residente (res-1 ou res-3)' },
        glucoseValue: { type: 'number', description: 'Glicemia capilar aferida em mg/dL' },
        isConscious: { type: 'boolean', description: 'Se a residente está acordada e responsiva' },
        canSwallowSafely: { type: 'boolean', description: 'Se a deglutição está preservada sem risco de aspiração' }
      },
      required: ['residentId', 'glucoseValue', 'isConscious', 'canSwallowSafely']
    }
  },
  {
    name: 'mcp_query_psychotropic_metabolic_interactions',
    description: 'Recupera do Knowledge Graph os impactos metabólicos e glicêmicos dos psicofármacos em uso pela moradora da SRT.',
    parameters: {
      type: 'object',
      properties: {
        residentId: { type: 'string', description: 'ID da residente' },
        includeGuidelines: { type: 'boolean', description: 'Incluir recomendações das diretrizes SBD/ADA' }
      },
      required: ['residentId']
    }
  },
  {
    name: 'mcp_recommend_subcutaneous_rotation',
    description: 'Consulta o histórico de aplicações de insulina e indica o próximo sítio anatômico para prevenir lipodistrofia.',
    parameters: {
      type: 'object',
      properties: {
        residentId: { type: 'string', description: 'ID da residente insulinodependente' },
        lastSiteUsed: { type: 'string', description: 'Último local aplicado' }
      },
      required: ['residentId']
    }
  },
  {
    name: 'mcp_graphrag_retrieval',
    description: 'Executa busca semântica em grafo (GraphRAG) sobre cuidados interdisciplinares em diabetes para Residências Terapêuticas.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Pergunta ou cenário clínico' },
        residentId: { type: 'string', description: 'ID da residente alvo' }
      },
      required: ['query', 'residentId']
    }
  }
];

// GraphRAG Retrieval Engine
export class GraphRAGDiabetesEngine {
  /**
   * Executa busca semântica no Knowledge Graph local
   */
  public static retrieveSubGraph(residentId: string, queryKeywords: string[] = []): {
    nodes: KnowledgeGraphNode[];
    edges: KnowledgeGraphEdge[];
    clinicalSummary: string[];
  } {
    const directEdges = SRT_DIABETES_KNOWLEDGE_GRAPH.edges.filter(
      e => e.source === residentId || e.target === residentId
    );

    const relatedNodeIds = new Set<string>([residentId]);
    directEdges.forEach(e => {
      relatedNodeIds.add(e.source);
      relatedNodeIds.add(e.target);
    });

    // Subgraph de 2º nível para capturar conexões como Quetiapina -> Resistência ou Insulina -> Lipodistrofia
    const secondaryEdges = SRT_DIABETES_KNOWLEDGE_GRAPH.edges.filter(
      e => (relatedNodeIds.has(e.source) || relatedNodeIds.has(e.target)) && !directEdges.includes(e)
    );

    secondaryEdges.forEach(e => {
      relatedNodeIds.add(e.source);
      relatedNodeIds.add(e.target);
    });

    const allEdges = [...directEdges, ...secondaryEdges];
    const nodes = SRT_DIABETES_KNOWLEDGE_GRAPH.nodes.filter(n => relatedNodeIds.has(n.id));

    const clinicalSummary = allEdges.map(
      e => `• [${e.clinicalImpact}] ${e.source} ${e.relation} ${e.target}: ${e.label}`
    );

    return { nodes, edges: allEdges, clinicalSummary };
  }

  /**
   * Executa uma ferramenta MCP simulada ou local
   */
  public static executeMCPTool(
    toolName: string,
    args: Record<string, unknown>
  ): { success: boolean; result: unknown } {
    switch (toolName) {
      case 'mcp_check_hypoglycemia_safety': {
        const val = Number(args.glucoseValue || 0);
        const resId = String(args.residentId);
        const conscious = Boolean(args.isConscious ?? true);
        const swallow = Boolean(args.canSwallowSafely ?? true);

        if (val < 54) {
          return {
            success: true,
            result: {
              status: 'EMERGÊNCIA_NÍVEL_3',
              action: 'Hipoglicemia Grave (<54 mg/dL). Risco de óbito ou dano cerebral.',
              route: conscious && swallow ? '15g carboidrato rápido via oral com supervisão estrita' : 'NÃO OFERTAR VIA ORAL. Risco grave de aspiração. Acionar SAMU 192 e Glicose 50% EV.',
              alertCaregiver: 'Acionamento imediato da enfermagem e médico RT da SRT.'
            }
          };
        }

        if (val < 70) {
          return {
            success: true,
            result: {
              status: 'ALERTA_NÍVEL_2',
              action: 'Regra dos 15g: Ofertar 15g de carboidrato de rápida absorção.',
              route: resId === 'res-3' ? 'Suco de uva com espessante Nível 2 ou gel de glicose na gengiva (devido à disfagia de Dona Tereza)' : '150ml de suco de fruta integral ou água adoçada (Dona Helena)',
              retestInMinutes: 15
            }
          };
        }

        return {
          success: true,
          result: {
            status: 'ESTÁVEL',
            action: 'Glicemia dentro ou próxima da faixa alvo. Manter plano alimentar.',
            value: val
          }
        };
      }

      case 'mcp_query_psychotropic_metabolic_interactions': {
        const resId = String(args.residentId);
        const graph = this.retrieveSubGraph(resId);
        return {
          success: true,
          result: {
            residentId: resId,
            relationsFound: graph.edges.length,
            keyFindings: graph.clinicalSummary
          }
        };
      }

      case 'mcp_recommend_subcutaneous_rotation': {
        const last = String(args.lastSiteUsed || '');
        const sites = [
          'Abdômen Superior Direito',
          'Abdômen Superior Esquerdo',
          'Abdômen Inferior Direito',
          'Abdômen Inferior Esquerdo',
          'Coxa Anterior Direita',
          'Coxa Anterior Esquerda'
        ];
        const idx = sites.indexOf(last);
        const next = sites[(idx + 1) % sites.length];
        return {
          success: true,
          result: {
            nextRecommendedSite: next,
            rationale: 'Alternância rigorosa para prevenir fibrose e lipodistrofia induzida pela Insulina NPH.'
          }
        };
      }

      default:
        return {
          success: false,
          result: `Ferramenta MCP '${toolName}' não reconhecida no protocolo SRT.`
        };
    }
  }
}

// Fine-Tuning System Configuration Template
export const SRT_ENDOPSYCH_FINETUNED_CONFIG = {
  modelName: 'gemini-3.8-flash',
  fineTunedPersona: 'SRT-EndoPsych-Specialist-v2',
  version: '2.4.0-BR',
  temperature: 0.2, // Baixa temperatura para estrita acurácia clínica
  topP: 0.85,
  systemInstructions: `Você é o Especialista Clínico em Endocrinologia e Psiquiatria Integrada da Plataforma NexaMed (SRT / RAPS / SUS).
Sua missão é emitir orientações assistenciais rigorosamente fundamentadas nas Diretrizes da Sociedade Brasileira de Diabetes (SBD 2024/2025) e ADA Standards of Care, com ênfase em pacientes psiquiátricos institucionalizados em Residências Terapêuticas.
PRINCÍPIOS INEGOCIÁVEIS:
1. Em residentes idosas ou com demência (como Dona Tereza), NUNCA buscar controle estrito glicêmico à custa de hipoglicemia. Metas flexibilizadas de 100 a 200 mg/dL são protetoras da vida.
2. Em uso de antipsicóticos atípicos (Quetiapina, Olanzapina), considere a resistência insulínica e dislipidemia.
3. Se houver histórico de disfagia, PROÍBA líquidos ralos em resgate oral de hipoglicemia e recomende gel de glicose ou suco espessado.
4. Responda em Português do Brasil com clareza para a equipe de cuidadores e enfermagem do SRT.`
};
