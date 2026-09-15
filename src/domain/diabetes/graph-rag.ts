/**
 * Graph Retrieval-Augmented Generation (GraphRAG) Knowledge Service
 * Semantic knowledge graph of clinical interactions, psychotropic risks,
 * and evidence-based diabetes guidelines for Therapeutic Residences (SRT).
 */

export interface GraphNode {
  id: string;
  label: string;
  type: 'RESIDENT' | 'DIAGNOSIS' | 'MEDICATION' | 'MECHANISM' | 'CLINICAL_RISK' | 'PROTOCOL' | 'NUTRIENT';
  description: string;
  evidenceSource?: string;
  metadata?: Record<string, string | number>;
}

export interface GraphEdge {
  sourceId: string;
  targetId: string;
  relation: 
    | 'PRESCRIBED_TO' 
    | 'INDUCED_BY' 
    | 'AGGRAVATES' 
    | 'MASKS_SYMPTOMS_OF' 
    | 'REQUIRES_MONITORING' 
    | 'MITIGATED_BY' 
    | 'EVIDENCED_IN';
  description: string;
  confidenceWeight: number; // 0.0 a 1.0
}

export interface GraphRagContext {
  nodes: GraphNode[];
  edges: GraphEdge[];
  clinicalInsights: string[];
  retrievedGuidelines: string[];
}

export const CLINICAL_KNOWLEDGE_GRAPH: { nodes: GraphNode[]; edges: GraphEdge[] } = {
  nodes: [
    // Residents
    {
      id: 'res-helena',
      label: 'Sra. Helena Vasconcelos',
      type: 'RESIDENT',
      description: 'Idosa de 68 anos, diagnóstico de TAB I + DM Tipo 2, polifarmácia com Quetiapina e Lítio.'
    },
    {
      id: 'res-tereza',
      label: 'Dra. Tereza de Jesus Moreira',
      type: 'RESIDENT',
      description: 'Idosa de 82 anos, DA moderada + DM Tipo 2, em uso de Insulina Glargina e Memantina.'
    },
    
    // Medications
    {
      id: 'med-quetiapina',
      label: 'Quetiapina (Antipsicótico Atípico)',
      type: 'MEDICATION',
      description: 'Antipsicótico de 2ª geração com alto potencial de ganho de peso e alteração do metabolismo glicêmico.'
    },
    {
      id: 'med-litio',
      label: 'Carbonato de Lítio',
      type: 'MEDICATION',
      description: 'Estabilizador de humor com excreção renal. Risco de toxicidade se desidratação por poliúria hiperglicêmica.'
    },
    {
      id: 'med-nph',
      label: 'Insulina NPH (Humana)',
      type: 'MEDICATION',
      description: 'Insulina de ação intermediária. Pico de ação entre 4 e 10 horas após aplicação matinal.'
    },
    {
      id: 'med-glargina',
      label: 'Insulina Glargina (Lantus)',
      type: 'MEDICATION',
      description: 'Insulina análoga basal sem pico pronunciado, duração de 24 horas, menor risco de hipoglicemia noturna.'
    },
    {
      id: 'med-metformina',
      label: 'Metformina 850mg',
      type: 'MEDICATION',
      description: 'Biguanida sensibilizadora de insulina. Aumenta captação muscular e reduz gliconeogênese hepática.'
    },

    // Clinical Risks & Mechanisms
    {
      id: 'mech-insulin-resistance',
      label: 'Resistência Insulínica por Antipsicóticos',
      type: 'MECHANISM',
      description: 'Bloqueio de receptores 5-HT2C e H1 causa hiperfagia, adiposidade visceral e diminuição da sensibilidade insulínica.'
    },
    {
      id: 'risk-silent-hypo',
      label: 'Hipoglicemia Não Percebida (Assintomática)',
      type: 'CLINICAL_RISK',
      description: 'Em idosos com demência e usuários de psicotrópicos sedativos, a resposta adrenérgica (tremores, taquicardia) pode estar abolida.'
    },
    {
      id: 'risk-dehydration',
      label: 'Desidratação e Risco de Litemia Elevada',
      type: 'CLINICAL_RISK',
      description: 'Hiperglicemia gera diurese osmótica (poliúria), reduzindo volemia e concentrando os níveis séricos de Lítio.'
    },
    {
      id: 'risk-lipodystrophy',
      label: 'Lipodistrofia por Repetição de Sítio',
      type: 'CLINICAL_RISK',
      description: 'Injeções repetidas no mesmo ponto provocam hipertrofia gordurosa que retarda a absorção da insulina em até 40%.'
    },

    // Protocols
    {
      id: 'proto-sbd-2024',
      label: 'Diretriz SBD 2024: Diabetes no Idoso e SRT',
      type: 'PROTOCOL',
      description: 'Recomenda alvos glicêmicos individualizados (HbA1c 7.5% - 8.0%, Glicemia Jejum 100-140 mg/dL) para evitar hipoglicemias fatais.'
    },
    {
      id: 'proto-regra-15',
      label: 'Regra dos 15 (Resgate de Hipoglicemia)',
      type: 'PROTOCOL',
      description: '15g de carboidrato de rápida absorção, reavaliação em 15 minutos. Padrão-ouro para evitar coma hipoglicêmico.'
    },
    {
      id: 'proto-rodizio',
      label: 'Protocolo de Rodízio de Aplicação de Insulina',
      type: 'PROTOCOL',
      description: 'Alternância sistemática entre quadrantes abdominais, braços e coxas, distanciando 2 cm da picada anterior.'
    }
  ],
  edges: [
    {
      sourceId: 'res-helena',
      targetId: 'med-quetiapina',
      relation: 'PRESCRIBED_TO',
      description: 'Usa Quetiapina para controle de humor e estabilização psiquiátrica.',
      confidenceWeight: 1.0
    },
    {
      sourceId: 'med-quetiapina',
      targetId: 'mech-insulin-resistance',
      relation: 'AGGRAVATES',
      description: 'Quetiapina induz resistência periférica à insulina e apetite por carboidratos.',
      confidenceWeight: 0.95
    },
    {
      sourceId: 'res-helena',
      targetId: 'med-litio',
      relation: 'PRESCRIBED_TO',
      description: 'Usa Carbonato de Lítio de uso contínuo.',
      confidenceWeight: 1.0
    },
    {
      sourceId: 'risk-dehydration',
      targetId: 'med-litio',
      relation: 'AGGRAVATES',
      description: 'Glicosúria com desidratação reduz depuração renal do lítio, elevando risco de intoxicação.',
      confidenceWeight: 0.9
    },
    {
      sourceId: 'res-tereza',
      targetId: 'risk-silent-hypo',
      relation: 'REQUIRES_MONITORING',
      description: 'Dra. Tereza tem Alzheimer moderado e não comunica fome, sudorese ou tontura ao ter hipoglicemia.',
      confidenceWeight: 0.98
    },
    {
      sourceId: 'res-tereza',
      targetId: 'med-glargina',
      relation: 'PRESCRIBED_TO',
      description: 'Usa Insulina Glargina noturna 14 UI para controle basal plano.',
      confidenceWeight: 1.0
    },
    {
      sourceId: 'risk-silent-hypo',
      targetId: 'proto-regra-15',
      relation: 'MITIGATED_BY',
      description: 'Detecção por mapa glicêmico preventivo e reversão rápida com 15g de carboidrato.',
      confidenceWeight: 0.99
    },
    {
      sourceId: 'med-nph',
      targetId: 'risk-lipodystrophy',
      relation: 'REQUIRES_MONITORING',
      description: 'Aplicações diárias exigem estrita alternância dos pontos de punção.',
      confidenceWeight: 0.95
    },
    {
      sourceId: 'risk-lipodystrophy',
      targetId: 'proto-rodizio',
      relation: 'MITIGATED_BY',
      description: 'Uso de mapa corporal interativo com quadrantes numerados.',
      confidenceWeight: 1.0
    }
  ]
};

/**
 * Traverses the knowledge graph to extract context for a specific resident
 */
export function queryGraphRagContext(residentId: string): GraphRagContext {
  let targetResidentNodeId: string;

  // Resolve aliases for resident IDs
  let resolvedInputId = residentId;
  if (resolvedInputId === 'res-1') {
    resolvedInputId = 'res-helena';
  }

  // Find the actual resident node in the graph based on the resolved ID
  const residentNode = CLINICAL_KNOWLEDGE_GRAPH.nodes.find(
    (node) => node.id === resolvedInputId && node.type === 'RESIDENT'
  );

  if (!residentNode) {
    // Critical: If resident is not found, return an empty context to prevent providing incorrect or default data.
    // Logging a warning helps in debugging missing resident configurations.
    console.warn(`Resident with ID '${residentId}' (resolved to '${resolvedInputId}') not found in the knowledge graph. Returning empty context.`);
    return {
      nodes: [],
      edges: [],
      clinicalInsights: [],
      retrievedGuidelines: []
    };
  }
  targetResidentNodeId = residentNode.id;
  
  // Find directly and 2-hop connected nodes
  const connectedEdgeIds = new Set<string>();
  const connectedNodeIds = new Set<string>([targetResidentNodeId]);

  // Hop 1
  CLINICAL_KNOWLEDGE_GRAPH.edges.forEach(edge => {
    if (edge.sourceId === targetResidentNodeId || edge.targetId === targetResidentNodeId) {
      connectedEdgeIds.add(`${edge.sourceId}->${edge.targetId}`);
      connectedNodeIds.add(edge.sourceId);
      connectedNodeIds.add(edge.targetId);
    }
  });

  // Hop 2
  CLINICAL_KNOWLEDGE_GRAPH.edges.forEach(edge => {
    if (connectedNodeIds.has(edge.sourceId) || connectedNodeIds.has(edge.targetId)) {
      connectedEdgeIds.add(`${edge.sourceId}->${edge.targetId}`);
      connectedNodeIds.add(edge.sourceId);
      connectedNodeIds.add(edge.targetId);
    }
  });

  const relevantNodes = CLINICAL_KNOWLEDGE_GRAPH.nodes.filter(n => connectedNodeIds.has(n.id));
  const relevantEdges = CLINICAL_KNOWLEDGE_GRAPH.edges.filter(e => connectedEdgeIds.has(`${e.sourceId}->${e.targetId}`));

  const clinicalInsights: string[] = [];
  if (targetResidentNodeId === 'res-helena') {
    clinicalInsights.push('Interação Quetiapina x Resistência Insulínica: Exige controle dietético de carboidratos simples e monitoramento rigoroso pós-prandial.');
    clinicalInsights.push('Segurança com Lítio: Manter ingesta hídrica mínima de 2.000 mL/dia para evitar retenção de lítio se houver pico glicêmico poliúrico.');
    clinicalInsights.push('Pico da Insulina NPH matinal (11:00 às 14:00): Deve coincidir com o almoço para prevenir hipoglicemia pré-prandial.');
  } else {
    clinicalInsights.push('Alerta de Hipoglicemia Silenciosa (Dra. Tereza): Devido ao Alzheimer, vigiar sinais atípicos como sonolência súbita, apatia, queda ou olhar vago.');
    clinicalInsights.push('Alvo Glicêmico Geriátrico (SBD 2024): Manter glicemia entre 100 e 180 mg/dL. Evitar buscar estritamente valores < 90 mg/dL para não induzir hipo.');
    clinicalInsights.push('Inspeção Diária de Pés: Risco de marcha claudicante sem queixa de dor por polineuropatia periférica.');
  }

  const retrievedGuidelines = [
    'Diretrizes SBD 2024: No idoso institucionalizado com déficit cognitivo, o foco prioritário é a prevenção de hipoglicemia e preservação do estado funcional.',
    'Protocolo de Enfermagem COFEN: Dupla checagem obrigatória na aspiração e aplicação de insulinas intermediárias e rápidas no ambiente coletivo.'
  ];

  return {
    nodes: relevantNodes,
    edges: relevantEdges,
    clinicalInsights,
    retrievedGuidelines
  };
}
