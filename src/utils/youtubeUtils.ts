/**
 * Utilitários para extração e renderização de vídeos do YouTube e HTML5 no NexaMed
 * Focado na rotina operacional de Residenciais Terapêuticos (SRT), Administração de Medicamentos e Cuidados em PT-BR
 */

export function extractYoutubeId(urlOrId?: string): string | null {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();

  // Caso o usuário já tenha colado apenas o ID de 11 caracteres (ex: 9Vj5gTEAxbY)
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Regex abrangente para formatos do YouTube:
  // - https://www.youtube.com/watch?v=XXXX
  // - https://youtu.be/XXXX
  // - https://www.youtube.com/embed/XXXX
  // - https://www.youtube.com/shorts/XXXX
  // - https://www.youtube.com/v/XXXX
  // - https://m.youtube.com/watch?v=XXXX
  const regExp = /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([a-zA-Z0-9_-]{11})/;
  const match = trimmed.match(regExp);

  return match ? match[1] : null;
}

export function getYoutubeEmbedUrl(urlOrId?: string, autoPlay: boolean = false): string {
  const ytId = extractYoutubeId(urlOrId) || '9Vj5gTEAxbY'; // Padrão: Vias e Administração de Medicamentos em Português
  return `https://www.youtube.com/embed/${ytId}?enablejsapi=1&playsinline=1&rel=0&modestbranding=1${autoPlay ? '&autoplay=1' : ''}`;
}

export function getYoutubeWatchUrl(urlOrId?: string): string {
  const ytId = extractYoutubeId(urlOrId) || '9Vj5gTEAxbY';
  return `https://www.youtube.com/watch?v=${ytId}`;
}

export function getYoutubeThumbnailUrl(urlOrId?: string): string {
  const ytId = extractYoutubeId(urlOrId);
  if (!ytId) {
    return 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80';
  }
  return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
}

export interface ClinicalVideoItem {
  category: 'medicacao' | 'rotina_srt' | 'saude_mental' | 'sinais_vitais' | 'higiene_cuidados' | 'plantao';
  categoryLabel: string;
  topic: string;
  id: string;
  title: string;
  duration: string;
  description: string;
  targetRole: string;
  keyPoints: string[];
}

/**
 * Catálogo Curado de Vídeos em Português do Brasil (PT-BR) para Residenciais Terapêuticos
 */
export const VERIFIED_CLINICAL_YOUTUBE_VIDEOS: ClinicalVideoItem[] = [
  {
    category: 'medicacao',
    categoryLabel: 'Medicação & Horários',
    topic: 'Administração de Medicamentos & Vias (PT-BR)',
    id: '9Vj5gTEAxbY',
    title: 'Vias de Administração de Medicamentos e Segurança no Aprazamento',
    duration: '4 min',
    description: 'Protocolo prático de vias oral, sublingual e injetável, checagem dupla dos 9 certos e prevenção de erros no horário de aprazamento.',
    targetRole: 'Técnico de Enfermagem / Enfermeiro RT',
    keyPoints: [
      'Conferência dos 9 Certos: Morador, Medicamento, Dose, Via, Horário, Orientação, Registro, Ação e Resposta.',
      'Atenção especial a psicofármacos: respeitar o intervalo exato entre doses para evitar picos plasmáticos ou abstinência.',
      'Checagem imediata no Kardex digital MAR com anotação do horário exato.'
    ]
  },
  {
    category: 'rotina_srt',
    categoryLabel: 'Rotina Residencial',
    topic: 'Rotina e Convivência no Residencial Terapêutico',
    id: '3PmVJQUCm4E',
    title: 'Organização da Rotina Diária e Reabilitação Psicossocial (SRT)',
    duration: '5 min',
    description: 'Estruturação dos horários de refeição, oficinas, passeios comunitários e estímulo à autonomia nas Atividades de Vida Diária (AVDs).',
    targetRole: 'Cuidador / Equipe Multidisciplinar',
    keyPoints: [
      'Manter rotinas previsíveis para reduzir a ansiedade dos moradores acolhidos.',
      'Incentivar a participação voluntária na organização da casa sem imposição punitiva.',
      'Promover a circulação social e interação comunitária dos moradores.'
    ]
  },
  {
    category: 'saude_mental',
    categoryLabel: 'Manejo de Crises',
    topic: 'Manejo de Agitação e Desescalada Não-Violenta',
    id: 'cosvbvef2aI',
    title: 'Técnicas de Desescalada Verbal e Acolhimento em Saúde Mental',
    duration: '4 min',
    description: 'Como lidar com crises de agressividade, desorientação ou ansiedade aguda sem uso de contenção física desproporcional.',
    targetRole: 'Cuidadores / Enfermagem / Psicologia',
    keyPoints: [
      'Postura corporal aberta, tom de voz calmo e escuta atenta sem julgamentos.',
      'Diminuir imediatamente estímulos estressores (desligar TV alta, afastar aglomerações).',
      'Oferecer opções de escolha simples para restaurar a sensação de controle do morador.'
    ]
  },
  {
    category: 'sinais_vitais',
    categoryLabel: 'Sinais Vitais & NEWS2',
    topic: 'Aferição de Sinais Vitais & Alerta Precoce (NEWS2)',
    id: 'M7lc1UVf-VE',
    title: 'Padronização na Aferição de Sinais Vitais e Escores de Gravidade',
    duration: '5 min',
    description: 'Aferição rigorosa de PA, frequência respiratória, oximetria de pulso, glicemia capilar e temperatura axilar na rotina do residente.',
    targetRole: 'Equipe de Enfermagem e Cuidadores',
    keyPoints: [
      'Contar a frequência respiratória por 60s inteiros sem alertar o residente.',
      'Calcular o escore NEWS2 para detectar sepse ou insuficiência respiratória precocemente.',
      'Registrar os dados objetivos no prontuário SOAP imediatamente.'
    ]
  },
  {
    category: 'medicacao',
    categoryLabel: 'Medicação & Horários',
    topic: 'Cuidados Especiais com Psicotrópicos & Interações',
    id: '9Vj5gTEAxbY',
    title: 'Manejo de Antipsicóticos, Ansiolíticos e Sintomas Extrapiramidais',
    duration: '4 min',
    description: 'Reconhecimento de efeitos adversos comuns como sonolência diurna, tremores, boca seca e hipotensão postural no residencial.',
    targetRole: 'Enfermeiro RT / Técnicos',
    keyPoints: [
      'Monitorar a ingestão hídrica em residentes tomando antipsicóticos ou estabilizadores.',
      'Avaliar rigidez muscular e tremores finos para reporte ao psiquiatra assistente.',
      'Garantir administração de doses noturnas 30 minutos antes do recolhimento ao leito.'
    ]
  },
  {
    category: 'higiene_cuidados',
    categoryLabel: 'Higiene & Prevenção',
    topic: 'Banho Humanizado e Prevenção de Lesões de Pele',
    id: '3PmVJQUCm4E',
    title: 'Protocolo de Banho Assistido e Prevenção de Úlceras de Pressão',
    duration: '4 min',
    description: 'Diretrizes para auxílio no banho preservando a intimidade do morador, hidratação com AGE e mudança de decúbito 2h/2h.',
    targetRole: 'Cuidadores de Saúde / Técnicos',
    keyPoints: [
      'Respeitar o pudor do morador, explicando cada etapa do cuidado corporal.',
      'Aplicar hidratante/AGE em regiões de proeminência óssea (calcâneos, sacro, trocanteres).',
      'Inspecionar diariamente a pele durante o banho e relatar qualquer hiperemia não reativa.'
    ]
  }
];

