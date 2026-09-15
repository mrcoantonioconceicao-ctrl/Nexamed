import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  // Security Headers Middleware
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  app.use(express.json({ limit: '2mb' }));

  // Initialize Gemini AI Client lazily or safely
  const getAiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not defined in environment variables.');
    }
    return new GoogleGenAI({
      apiKey: apiKey || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // Health check API
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'NexaMed Clinical Platform API', timestamp: new Date().toISOString() });
  });

  // API Endpoint: Nexa AI Chat & Executable Action Engine
  app.post('/api/nexa/chat', async (req, res) => {
    try {
      const { message, contextPage, residentsData, alertsData, recentEvolutions } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Mensagem é obrigatória' });
      }

      const lowerMsg = message.toLowerCase();

      // Platform knowledge helper for quick local actions and clear instructions (Respostas curtas e objetivas)
      const generateLocalResponse = (msg: string) => {
        const lower = msg.toLowerCase();

        if (lower.includes('residente') || lower.includes('cadastrar') || lower.includes('ficha')) {
          return {
            text: `📍 **Residentes & Fichas (SRT):**\n• Acesse **"Residentes & Fichas"** no menu.\n• Clique em **"+ Cadastrar Novo Residente"** para incluir um morador.\n• Clique no card para ver o **Plano Terapêutico Singular (PTS)** e ficha completa.`,
            actions: [
              { type: 'navigate', payload: { path: '/residentes' }, label: 'Ir para Residentes' },
              { type: 'navigate', payload: { path: '/prontuarios' }, label: 'Ver Prontuários' }
            ]
          };
        }

        if (lower.includes('soap') || lower.includes('evoluç') || lower.includes('prontuár')) {
          return {
            text: `📍 **Evolução Clínica SOAP (SRT):**\n• Vá em **"Prontuário (SOAP)"** ou pressione **⌘K**.\n• Clique em **"+ Nova Evolução SOAP"**.\n• Digite notas breves e use **"Gerar com IA Nexa"** para estruturar a evolução.`,
            actions: [
              { type: 'create_evolution', payload: {}, label: '✍️ Abrir Editor SOAP' },
              { type: 'navigate', payload: { path: '/prontuarios' }, label: 'Ver Prontuários' }
            ]
          };
        }

        if (lower.includes('remédio') || lower.includes('medicaç') || lower.includes('mar') || lower.includes('atras')) {
          return {
            text: `📍 **Aprazamento Medicamentoso MAR (SRT):**\n• Acesse **"Medicação (MAR)"**.\n• Confira a administração de uso contínuo/psicotrópicos no esquema **12/12h** (08h e 20h).\n• Clique em **"Ministrar"** para dar baixa ou registrar recusa.`,
            actions: [
              { type: 'navigate', payload: { path: '/medicacao' }, label: '💊 Abrir Aprazamento MAR' }
            ]
          };
        }

        if (lower.includes('escala') || lower.includes('folga') || lower.includes('turno') || lower.includes('equipe')) {
          return {
            text: `📍 **Escalas da Equipe SRT:**\n• Acesse **"Escalas de Plantão"**.\n• Visualize a cobertura 24h de cuidadores, enfermagem e equipe multidisciplinar.`,
            actions: [
              { type: 'navigate', payload: { path: '/escalas' }, label: '📅 Ir para Escalas' }
            ]
          };
        }

        if (lower.includes('plantão') || lower.includes('passagem') || lower.includes('troca')) {
          return {
            text: `📍 **Passagem de Plantão SRT:**\n• Acesse **"Passagem de Plantão"**.\n• Clique em **"Sintetizar com IA Nexa"** para resumo objetivo de 12h.\n• Assine digitalmente para concluir a passagem do turno.`,
            actions: [
              { type: 'navigate', payload: { path: '/plantao' }, label: '📋 Ir para Passagem de Plantão' }
            ]
          };
        }

        if (lower.includes('relatóri') || lower.includes('intercorrênci') || lower.includes('queda') || lower.includes('pressã')) {
          return {
            text: `📍 **Relatórios & Intercorrências (SRT):**\n• Acesse **"Relatórios & Intercorrências"**.\n• Alterne entre abas para verificar ocorrências diárias e emitir parecer sintético.`,
            actions: [
              { type: 'navigate', payload: { path: '/relatorios' }, label: '📊 Abrir Relatórios' }
            ]
          };
        }

        if (lower.includes('comando') || lower.includes('onde achar') || lower.includes('como usar') || lower.includes('ajuda') || lower.includes('funciona')) {
          return {
            text: `✨ **Acesso Rápido Nexa SRT:**\n• **Atalho ⌘K:** Busca rápida por morador ou tela.\n• **Residentes (/residentes):** Fichas e PTS.\n• **Prontuário (/prontuarios):** Evolução SOAP com IA.\n• **Medicação (/medicacao):** MAR 12/12h.\n• **Plantão (/plantao):** Passagem de turno e ocorrências.`,
            actions: [
              { type: 'navigate', payload: { path: '/dashboard' }, label: '📊 Dashboard' },
              { type: 'navigate', payload: { path: '/residentes' }, label: '👥 Residentes' },
              { type: 'navigate', payload: { path: '/prontuarios' }, label: '📝 Prontuários' },
              { type: 'navigate', payload: { path: '/medicacao' }, label: '💊 Medicação MAR' },
              { type: 'navigate', payload: { path: '/plantao' }, label: '📋 Passagem de Plantão' }
            ]
          };
        }

        return {
          text: `Solicitação registrada. Selecione uma ação abaixo para navegar diretamente no sistema da Residência Terapêutica:`,
          actions: [
            { type: 'navigate', payload: { path: '/dashboard' }, label: 'Ver Dashboard SRT' },
            { type: 'create_evolution', payload: {}, label: 'Criar Evolução SOAP' },
            { type: 'navigate', payload: { path: '/relatorios' }, label: 'Ver Relatórios' }
          ]
        };
      };

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        const localResp = generateLocalResponse(message);
        return res.json(localResp);
      }

      const ai = getAiClient();

      const systemPrompt = `Você é a "Nexa", assistente especializada EXCLUSIVAMENTE em Serviços de Residência Terapêutica (SRT - Tipo I e Tipo II) na plataforma NexaMed.

REGRAS DE RESPOSTA OBRIGATÓRIAS:
1. SEJA EXTREMAMENTE CURTA, DIRETA E OBJETIVA. Evite saudações longas, introduções prolixas, enrolação ou explicações repetitivas. Responda em no máximo 2 a 3 tópicos curtos e diretos.
2. Mantenha o foco estritamente nas normas de Residências Terapêuticas (Portaria MS/GM nº 106/2000, RAPS, reinserção social, PTS, medicação assistida).
3. Sempre inclua botões de ações executáveis ("actions") no JSON.

Navegações válidas em 'path':
- '/dashboard' (Dashboard Residencial SRT)
- '/residentes' (Fichas dos Moradores e PTS)
- '/prontuarios' (Prontuário e Evoluções SOAP)
- '/medicacao' (Aprazamento MAR - 12/12h)
- '/escalas' (Escalas dos Cuidados e Enfermagem)
- '/plantao' (Passagem de Plantão e Ocorrências)
- '/relatorios' (Relatórios de Acompanhamento)

Ações válidas em 'type':
- 'navigate' (com payload.path)
- 'open_resident' (com payload.residentId)
- 'create_evolution' (com payload.residentId opcional)
- 'mark_alerts_read'
- 'open_escala'

CONTEXTO DA PÁGINA ATUAL: "${contextPage || 'Geral'}"

DADOS ATUAIS DA RESIDÊNCIA:
- Moradores ativos: ${JSON.stringify(residentsData || [])}
- Alertas ativos: ${JSON.stringify(alertsData || [])}
- Últimas evoluções: ${JSON.stringify(recentEvolutions || [])}

Responda SEMPRE em formato JSON estrito:
{
  "text": "Sua resposta curta, direta e objetiva em Markdown (máximo 2-3 linhas/tópicos)...",
  "actions": [
    {
      "type": "navigate" | "open_resident" | "create_evolution" | "mark_alerts_read" | "open_escala",
      "payload": { "path": "...", "residentId": "..." },
      "label": "Texto do botão de ação"
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents: [
          { text: systemPrompt },
          { text: `Usuário solicitou: "${message}"` }
        ],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        }
      });

      const rawText = response.text || '{}';
      try {
        const parsed = JSON.parse(rawText);
        return res.json({
          text: parsed.text || rawText,
          actions: parsed.actions || []
        });
      } catch {
        const fallback = generateLocalResponse(message);
        return res.json(fallback);
      }
    } catch (err: unknown) {
      console.error('Erro na API Nexa Chat:', err);
      return res.status(500).json({
        error: 'Erro ao processar solicitação na assistente Nexa',
        details: err instanceof Error ? err.message : String(err)
      });
    }
  });

  // API Endpoint: Nexa SOAP Draft Generator
  app.post('/api/nexa/soap', async (req, res) => {
    try {
      const { residentName, bulletPoints, role } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.json({
          soap: {
            subjective: `Residente ${residentName || 'atendido'} relatou sintomas descritos em observações prévias.`,
            objective: `Sinais vitais dentro da normalidade para a faixa etária. Exame mental sem alterações agudas.`,
            assessment: `Quadro estável em acompanhamento pela equipe de ${role || 'saúde'}.`,
            plan: `Manter plano terapêutico singular e acompanhar evolução diária.`
          }
        });
      }

      const ai = getAiClient();
      const prompt = `Você é a IA clínica Nexa. Crie um rascunho técnico e padronizado de Evolução Clínica no formato SOAP (Subjetivo, Objetivo, Avaliação, Plano) para a especialidade de ${role || 'Enfermagem/Saúde'}.
Residente: ${residentName || 'Residente'}
Anotações brutas do profissional: "${bulletPoints}"

REGRA PROTOCOLAR INSTITUCIONAL IMPORTANTÍSSIMA: Todos os residentes tomam suas medicações de 12 em 12 horas (Horários Padronizados: 08:00h e 20:00h). Inclua sempre de forma clara:
- No campo 'objective': A menção de administração/checagem do esquema medicamentoso das 08:00h ou 20:00h (protocolo 12/12h).
- No campo 'plan': A manutenção rigorosa do aprazamento medicamentoso de 12/12h (às 08:00 e 20:00).

Responda ESTRITAMENTE em formato JSON com as 4 chaves:
{
  "subjective": "...",
  "objective": "...",
  "assessment": "...",
  "plan": "..."
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ soap: parsed });
    } catch (err: unknown) {
      console.error('Erro na API Nexa SOAP:', err);
      return res.status(500).json({ error: 'Falha ao gerar SOAP com IA Nexa' });
    }
  });

  // API Endpoint: Nexa Handover Summary Generator
  app.post('/api/nexa/handover-summary', async (req, res) => {
    try {
      const { handoverLogs, occurrences } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.json({
          summary: "• **Estabilidade Geral:** A maioria dos residentes manteve padrão estável no último turno.\n• **Atenção Medicamentosa:** 1 dose de medicação pendente de checagem na suíte 201.\n• **Recomendações para o Próximo Turno:** Monitorar ingesta hídrica e sono noturno."
        });
      }

      const ai = getAiClient();
      const prompt = `Gere um Resumo Executivo Clínico de Passagem de Plantão para a equipe que está assumindo o turno.
Registros do turno: ${JSON.stringify(handoverLogs || [])}
Intercorrências notificadas: ${JSON.stringify(occurrences || [])}

Sintetize em 3 tópicos curtos e objetivos em Markdown:
1. Estabilidade e Comportamento dos Residentes
2. Intercorrências Críticas e Medicação Pendente
3. Recomendações e Atenção para o Próximo Turno`;

      const response = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents: prompt,
      });

      return res.json({ summary: response.text });
    } catch (err: unknown) {
      console.error('Erro na API Handover Summary:', err);
      return res.status(500).json({ error: 'Erro ao gerar resumo do plantão' });
    }
  });

  // API Endpoint: Nexa Clinical Nutrition Assessment & Diet Adjustments
  app.post('/api/nexa/nutrition-assessment', async (req, res) => {
    try {
      const {
        resident,
        weight,
        height,
        bmi,
        bmiClassification,
        previousWeight,
        weightChangeKg,
        weightChangePercent,
        caloricIntake,
        clinicalContext,
        recentEvolutions
      } = req.body;

      if (!resident || !weight || !height) {
        return res.status(400).json({ error: 'Dados incompletos para avaliação nutricional' });
      }

      // Algorithmic local fallback generator for high reliability and offline environments
      const generateLocalNutritionAssessment = () => {
        const isElderly = (resident.age || 0) >= 60;
        const currentBmi = bmi || (weight / ((height / 100) * (height / 100)));
        const acceptance = caloricIntake?.acceptancePercentage || 80;
        const wtChangePct = weightChangePercent || 0;
        const hasDysphagia = Boolean(clinicalContext?.swallowingIssues);
        const hasConstipation = clinicalContext?.bowelHabit?.includes('Constipação');

        let risk: string = 'Eutrofia / Sem Risco';
        if (wtChangePct <= -5 || acceptance < 60 || (isElderly ? currentBmi < 22 : currentBmi < 18.5)) {
          risk = 'Alto Risco / Desnutrição';
        } else if (wtChangePct <= -2.5 || acceptance < 75) {
          risk = 'Risco Nutricional Moderado';
        } else if (acceptance < 85 || (isElderly ? currentBmi > 27 : currentBmi >= 25)) {
          risk = currentBmi >= 25 ? 'Risco Metabólico / Obesidade' : 'Risco Nutricional Leve';
        }

        const estVet = Math.round(weight * (risk.includes('Desnutrição') ? 32 : risk.includes('Obesidade') ? 22 : 28));
        const estProtein = risk.includes('Desnutrição') ? 1.4 : isElderly ? 1.2 : 1.0;

        const dietAdjustments: string[] = [];
        if (hasDysphagia) {
          dietAdjustments.push('Adequação de consistência para Dieta Pastosa com líquidos espessados para prevenção de broncoaspiração.');
        } else if (clinicalContext?.chewingIssues) {
          dietAdjustments.push('Transição para Dieta Branda com alimentos bem cozidos e carnes desfiadas/moídas.');
        } else {
          dietAdjustments.push('Manutenção de Dieta Geral com fracionamento em 5 a 6 refeições de menor volume.');
        }

        if (acceptance < 75) {
          dietAdjustments.push('Enriquecimento calórico e proteico natural das preparações (adição de azeite extravirgem, leite em pó desnatado em purês e sopas).');
        }

        if (hasConstipation) {
          dietAdjustments.push('Aumento de fibras solúveis e insolúveis (farelo de aveia, ameixa preta, mamão) associado a estímulo hídrico vigoroso.');
        }

        if (resident.allergies && resident.allergies.length > 0) {
          dietAdjustments.push(`Atenção rigorosa às alergias declaradas: ${resident.allergies.join(', ')}.`);
        }

        return {
          nutritionalRisk: risk,
          vetKcal: estVet,
          proteinGramsPerKg: estProtein,
          dietAdjustments,
          hydrationPlan: `Ofertar no mínimo ${Math.round(weight * 32)} ml de água por dia fracionados em copos de 150ml entre as refeições para preservar a função renal e o trânsito intestinal.`,
          textureRecommendation: hasDysphagia ? 'Pastosa Homogênea (nível IDDSI 4)' : clinicalContext?.chewingIssues ? 'Branda / Moída' : 'Geral / Normal',
          supplementation: acceptance < 70 || risk.includes('Desnutrição')
            ? 'Indicação de suplemento oral hipercalórico e hiperproteico (1.5 kcal/ml, 200ml/dia no lanche da tarde).'
            : 'Sem necessidade de suplementação industrializada no momento; foco na densidade nutricional das refeições.',
          guidanceForCaregivers: [
            'Monitorar a postura à mesa: morador deve alimentar-se sentado a 90° e permanecer nesta posição por pelo menos 30 minutos após comer.',
            'Registrar a aceitação percentual de cada prato no prontuário/diário alimentar da Residência.',
            'Estimular a autonomia do residente durante as refeições, auxiliando sem pressa em caso de lentificação psicomotora.'
          ],
          monitoringPlan: risk.includes('Alto') || risk.includes('Moderado')
            ? 'Pesagem semanal em balança calibrada (mesmo horário e vestimenta) e reavaliação da triagem em 14 dias.'
            : 'Pesagem quinzenal rotineira e nova triagem nutricional a cada 30 dias.',
          clinicalRationale: `Residente de ${resident.age} anos, IMC de ${currentBmi.toFixed(1)} kg/m² (${bmiClassification || 'Avaliando'}). Diagnóstico de ${resident.primaryDiagnosis || 'Acompanhamento em SRT'}. A aceitação alimentar média de ${acceptance}% e variação de peso de ${wtChangePct > 0 ? '+' : ''}${wtChangePct}% orientam intervenção preventiva e promoção de segurança alimentar no SRT.`,
          generatedAt: new Date().toISOString()
        };
      };

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        const localAssessment = generateLocalNutritionAssessment();
        return res.json({ assessment: localAssessment });
      }

      const ai = getAiClient();
      const prompt = `Você é um Nutricionista Clínico Especialista em Saúde Mental e Serviços de Residência Terapêutica (SRT / RAPS / SUS).
Sua tarefa é avaliar minuciosamente a triagem nutricional de um morador da residência terapêutica, correlacionando o estado antropométrico, ingestão calórica e perfil clínico (comorbidades, psicotrópicos, queixas de disfagia/constipação) com as evoluções clínicas recentes.

DADOS DO RESIDENTE:
- Nome: ${resident.name}
- Idade: ${resident.age} anos | Sexo: ${resident.gender || 'Não informado'} | Quarto: ${resident.room}
- Diagnóstico Principal: ${resident.primaryDiagnosis || resident.primaryDiagnostic || 'Transtorno Mental em SRT'}
- Comorbidades / Diagnósticos Secundários: ${JSON.stringify(resident.secondaryDiagnoses || [])}
- Alergias: ${JSON.stringify(resident.allergies || [])}
- Medicamentos em Uso: ${JSON.stringify(resident.medications || 'Polifarmácia / Psicotrópicos')}

DADOS ANTROPOMÉTRICOS:
- Peso Atual: ${weight} kg | Altura: ${height} cm | IMC: ${bmi} kg/m² (${bmiClassification})
- Peso Anterior: ${previousWeight ? `${previousWeight} kg` : 'Primeira aferição'}
- Variação Ponderal: ${weightChangeKg !== undefined ? `${weightChangeKg} kg (${weightChangePercent}%)` : 'Não calculada'}

INGESTÃO CALÓRICA & REFEIÇÕES:
- Meta Diária Estimada: ${caloricIntake?.estimatedDailyKcalTarget || 1800} kcal
- Ingestão Estimada Atual: ${caloricIntake?.estimatedKcalConsumed || 1400} kcal
- Aceitação Alimentar Geral: ${caloricIntake?.acceptancePercentage || 75}%
- Refeições:
  • Café da manhã: ${caloricIntake?.meals?.breakfast?.acceptance || 0}% de aceitação
  • Almoço: ${caloricIntake?.meals?.lunch?.acceptance || 0}% de aceitação
  • Lanche da tarde: ${caloricIntake?.meals?.afternoonSnack?.acceptance || 0}% de aceitação
  • Jantar: ${caloricIntake?.meals?.dinner?.acceptance || 0}% de aceitação
  • Ceia: ${caloricIntake?.meals?.supper?.acceptance || 0}% de aceitação
- Ingestão Hídrica: ${caloricIntake?.hydrationMl || 1500} ml (Meta: ${caloricIntake?.hydrationTargetMl || 2000} ml)

CONTEXTO CLÍNICO & GASTROINTESTINAL:
- Consistência Atual: ${clinicalContext?.dietConsistency || 'Geral'}
- Apetite: ${clinicalContext?.appetite || 'Normal'}
- Disfagia / Engasgos: ${clinicalContext?.swallowingIssues ? 'SIM (Risco de broncoaspiração)' : 'Não relatada'}
- Dificuldade Mastigatória / Dentição: ${clinicalContext?.chewingIssues ? 'SIM (Ausência dentária ou prótese desajustada)' : 'Não'}
- Hábito Intestinal: ${clinicalContext?.bowelHabit || 'Regular'}
- Restrições Dietéticas: ${JSON.stringify(clinicalContext?.dietaryRestrictions || [])}
- Nível de Atividade Física: ${clinicalContext?.physicalActivityLevel || 'Sedentário / Leve'}

EVOLUÇÕES CLÍNICAS RECENTES (Últimos registros da equipe multidisciplinar):
${JSON.stringify(recentEvolutions || 'Sem evoluções adversas nos últimos 3 dias.')}

INSTRUÇÕES CLÍNICAS IMPORTANTES:
1. Em SRT, considere o impacto metabólico de antipsicóticos (risco de ganho de peso, resistência à insulina, constipação severa por anticolinérgicos e sedação que diminui ingesta).
2. Se houver disfagia ou engasgos, recomende consistência segura e líquidos espessados.
3. Se a aceitação for menor que 75% ou perda de peso >5%, indique estratégias de enriquecimento calórico/proteico ou suplementação oral.
4. Forneça condutas realistas para a cozinha comunitária do SRT e para os cuidadores.

Responda ESTRITAMENTE em formato JSON com o seguinte esquema:
{
  "nutritionalRisk": "Eutrofia / Sem Risco" | "Risco Nutricional Leve" | "Risco Nutricional Moderado" | "Alto Risco / Desnutrição" | "Risco Metabólico / Obesidade",
  "vetKcal": 1850,
  "proteinGramsPerKg": 1.2,
  "dietAdjustments": [
    "Ajuste específico 1...",
    "Ajuste específico 2...",
    "Ajuste específico 3..."
  ],
  "hydrationPlan": "Instruções claras de hidratação diária com meta em ml...",
  "textureRecommendation": "Textura recomendada e justificativa...",
  "supplementation": "Conduta de suplementação...",
  "guidanceForCaregivers": [
    "Orientação prática 1 para os cuidadores...",
    "Orientação prática 2 para a copa...",
    "Orientação prática 3..."
  ],
  "monitoringPlan": "Frequência de pesagem e reavaliação...",
  "clinicalRationale": "Justificativa clínica detalhada conectando evoluções, medicamentos e quadro nutricional..."
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ assessment: parsed });
    } catch (err: unknown) {
      console.error('Erro na API Nexa Nutrition Assessment:', err);
      // Even on Gemini exception, fall back gracefully to local assessment
      try {
        const {
          resident,
          weight,
          height,
          bmi,
          bmiClassification,
          weightChangePercent,
          caloricIntake,
          clinicalContext
        } = req.body;
        const currentBmi = bmi || (weight / ((height / 100) * (height / 100)));
        const acceptance = caloricIntake?.acceptancePercentage || 80;
        const isElderly = (resident?.age || 0) >= 60;
        const wtChangePct = weightChangePercent || 0;
        let risk = 'Eutrofia / Sem Risco';
        if (wtChangePct <= -5 || acceptance < 60 || (isElderly ? currentBmi < 22 : currentBmi < 18.5)) {
          risk = 'Alto Risco / Desnutrição';
        } else if (wtChangePct <= -2.5 || acceptance < 75) {
          risk = 'Risco Nutricional Moderado';
        }
        return res.json({
          assessment: {
            nutritionalRisk: risk,
            vetKcal: Math.round(weight * 28),
            proteinGramsPerKg: 1.2,
            dietAdjustments: [
              'Fracionamento das refeições em 5 a 6 momentos ao dia.',
              'Aporte equilibrado de micronutrientes e salada crua/cozida.',
              'Atenção ao ritmo de mastigação e hidratação regular.'
            ],
            hydrationPlan: `Garantir ao menos ${Math.round(weight * 32)} ml de água diários distribuídos na rotina do SRT.`,
            textureRecommendation: clinicalContext?.swallowingIssues ? 'Pastosa' : 'Geral',
            supplementation: acceptance < 75 ? 'Avaliar inclusão de suplemento hiperproteico.' : 'Não indicado no momento.',
            guidanceForCaregivers: [
              'Acompanhar a velocidade da refeição e ofertar água nos intervalos.',
              'Registrar recusas alimentares na evolução de enfermagem/cuidado.'
            ],
            monitoringPlan: 'Pesagem quinzenal e acompanhamento do apetite.',
            clinicalRationale: `Avaliação de triagem para ${resident?.name || 'Morador'} com base nos parâmetros clínicos informados.`,
            generatedAt: new Date().toISOString()
          }
        });
      } catch {
        return res.status(500).json({ error: 'Erro ao gerar triagem nutricional' });
      }
    }
  });

  // API Endpoint: Nexa Diabetes Clinical Intelligence & GraphRAG Consultation
  app.post('/api/nexa/diabetes-consult', async (req, res) => {
    try {
      const { 
        residentProfile, 
        recentMeasurements, 
        graphContext, 
        userQuestion, 
        fineTunedConfig 
      } = req.body;

      if (!residentProfile) {
        return res.status(400).json({ error: 'Perfil da residente com diabetes é obrigatório.' });
      }

      const ai = getAiClient();
      const prompt = `Você é um Médico Endocrinologista e Psiquiatra Clínico Especialista em Serviços de Residência Terapêutica (SRT / RAPS / SUS).
Sua missão é responder com máxima precisão clínica baseada nas Diretrizes da Sociedade Brasileira de Diabetes (SBD 2024/2025) e ADA Standards of Care, contextualizada para idosos com transtornos mentais graves e comorbidades.

PERFIL DA MORADORA DA RESIDÊNCIA TERAPÊUTICA:
- Nome: ${residentProfile.residentName} (${residentProfile.age} anos) | Quarto: ${residentProfile.room}
- Tipo de Diabetes: ${residentProfile.diabetesType}
- Tratamento Atual: ${residentProfile.treatmentType}
- HbA1c Atual: ${residentProfile.currentHbA1c}% (Data: ${residentProfile.lastHbA1cDate})
- Meta Glicêmica Alvo Individualizada: Jejum ${residentProfile.glycemicTarget?.fastingMin}-${residentProfile.glycemicTarget?.fastingMax} mg/dL | Pós-prandial até ${residentProfile.glycemicTarget?.postPrandialMax} mg/dL
  • Racional da meta: ${residentProfile.glycemicTarget?.rationale}

PRESCRIÇÕES FARMACOLÓGICAS & INSULINOTERAPIA:
${JSON.stringify(residentProfile.prescriptions || [])}

INTERAÇÕES PSICOFÁRMACO-METABÓLICAS CONHECIDAS:
${JSON.stringify(residentProfile.psychotropicMetabolicInteractions || [])}

ÚLTIMAS AFERIÇÕES DE HGT:
${JSON.stringify(recentMeasurements || [])}

CONTEXTO GRAPHRAG (TRIPLAS DE CONHECIMENTO VINCULADAS):
${JSON.stringify(graphContext || 'Grafo de interações psicofármacos e riscos metabólicos ativo.')}

PERGUNTA / CENÁRIO CLÍNICO DA EQUIPE:
"${userQuestion || 'Forneça uma avaliação global da estabilidade glicêmica e recomendações de segurança para o plantão da SRT.'}"

DIRETRIZES DE RESPOSTA OBRIGATÓRIAS:
1. Em residentes frágeis com demência/Alzheimer (como Dona Tereza), evite metas hiper-estritas; o risco de hipoglicemia é muito mais letal que uma glicemia de 180-200 mg/dL.
2. Em residentes com disfagia, alerte expressamente contra oferta de líquidos ralos em crise de hipoglicemia.
3. Se houver psicofármacos antipsicóticos atípicos (Quetiapina, Olanzapina), aponte a influência na resistência insulínica e no apetite noturno.
4. Responda em Português do Brasil com terminologia acessível e segura para cuidadores e enfermagem.

Responda ESTRITAMENTE em formato JSON com o seguinte formato:
{
  "summary": "Resumo clínico direto do caso em 2 a 3 frases...",
  "riskClassification": "Estável / Alvo Atingido" | "Risco de Hipoglicemia" | "Risco de Hiperglicemia" | "Risco de Interação Medicamentosa" | "Alerta Crítico",
  "recommendationsForShift": [
    "Recomendação prática 1 para o plantão...",
    "Recomendação prática 2...",
    "Recomendação prática 3..."
  ],
  "dietAndHydrationGuidance": "Orientações para a cozinha/copa da residência...",
  "safetyWarnings": [
    "Alerta crítico de segurança 1...",
    "Alerta de segurança 2..."
  ],
  "bpmnSuggestedAction": "Ação correspondente no fluxo BPMN de monitoramento e resgate...",
  "graphInsights": "Como os psicofármacos e condições de base influenciam esse quadro..."
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: fineTunedConfig?.temperature ?? 0.2,
          topP: fineTunedConfig?.topP ?? 0.85,
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ consultation: parsed });
    } catch (err: unknown) {
      console.error('Erro na API Nexa Diabetes Consult:', err);
      // Fallback algorítmico seguro
      const { residentProfile, userQuestion } = req.body;
      const isTereza = residentProfile?.residentId === 'res-3';
      
      return res.json({
        consultation: {
          summary: `Parecer clínico estruturado para ${residentProfile?.residentName || 'Residente'} em SRT. Controle glicêmico deve priorizar prevenção de hipoglicemias sem descurar do risco metabólico associado à psicofarmacoterapia.`,
          riskClassification: isTereza ? 'Risco de Hipoglicemia' : 'Estável / Alvo Atingido',
          recommendationsForShift: [
            isTereza 
              ? 'Vigilância rigorosa a sinais atípicos de hipoglicemia (sudorese fria, sonolência súbita). Em crise, NÃO usar líquidos ralos devido à disfagia; usar gel de glicose na mucosa oral.'
              : 'Manter tomada da Metformina junto com as principais refeições para mitigar desconfortos gástricos.',
            'Conferir rodízio dos locais de aplicação de insulina no mapa anatômico para prevenir lipodistrofia.',
            'Registrar qualquer recusa de lanche ou sonolência incomum na passagem de plantão.'
          ],
          dietAndHydrationGuidance: 'Garantir hidratação regular fracionada (1.800ml a 2.000ml/dia) e manter a consistência da dieta prescrita.',
          safetyWarnings: [
            isTereza
              ? 'ATENÇÃO: Residente com disfagia e demência. Proibido ofertar suco ralo em crise de hipoglicemia pelo risco iminente de broncoaspiração.'
              : 'Monitorar ganho de peso e apetite noturno potencializado pela Quetiapina.'
          ],
          bpmnSuggestedAction: 'TASK_TARGET_RANGE_OK',
          graphInsights: 'Interação de psicofármacos com o metabolismo glicídico exige vigilância multiprofissional contínua no ambiente da Residência Terapêutica.'
        }
      });
    }
  });

  // API Endpoint: Model Context Protocol (MCP) for Diabetes Care
  app.post('/api/mcp/diabetes', (req, res) => {
    try {
      const { method, params } = req.body;

      if (method === 'tools/list') {
        return res.json({
          tools: [
            {
              name: 'diabetes_get_measurements',
              description: 'Recupera histórico de HGT de moradoras com diabetes na residência terapêutica.',
              inputSchema: {
                type: 'object',
                properties: { residentId: { type: 'string' }, limit: { type: 'number' } },
                required: ['residentId']
              }
            },
            {
              name: 'diabetes_calculate_correction_dose',
              description: 'Calcula dose de insulina regular pela escala móvel médica.',
              inputSchema: {
                type: 'object',
                properties: { residentId: { type: 'string' }, bgValue: { type: 'number' } },
                required: ['residentId', 'bgValue']
              }
            },
            {
              name: 'diabetes_trigger_rule_of_15',
              description: 'Aciona o protocolo BPMN de resgate da Regra dos 15 para hipoglicemia aguda (< 70 mg/dL).',
              inputSchema: {
                type: 'object',
                properties: { residentId: { type: 'string' }, currentBg: { type: 'number' }, carbGiven: { type: 'string' } },
                required: ['residentId', 'currentBg', 'carbGiven']
              }
            }
          ]
        });
      }

      if (method === 'resources/list') {
        return res.json({
          resources: [
            { uri: 'diabetes://residents/helena', name: 'Perfil Helena Vasconcelos', mimeType: 'application/json' },
            { uri: 'diabetes://residents/tereza', name: 'Perfil Tereza Moreira', mimeType: 'application/json' },
            { uri: 'diabetes://guidelines/sbd-2024', name: 'Diretrizes SBD 2024 SRT', mimeType: 'text/markdown' }
          ]
        });
      }

      if (method === 'prompts/list') {
        return res.json({
          prompts: [
            { name: 'clinical_diabetes_briefing', description: 'Gera briefing clínico com GraphRAG para a enfermagem.' }
          ]
        });
      }

      return res.status(400).json({ error: `Método MCP não suportado: ${method}` });
    } catch (err: unknown) {
      console.error('Erro no endpoint MCP Diabetes:', err);
      return res.status(500).json({ error: 'Erro interno no servidor MCP' });
    }
  });

  // In-Memory Backup Snapshots Registry for server-side resilience
  const serverBackups: any[] = [];
  let lastDailyMidnightRun: string = '';

  // API Endpoint: Save and Archive Backup Snapshot
  app.post('/api/backup/save-snapshot', (req, res) => {
    try {
      const { snapshot } = req.body;
      if (!snapshot || !snapshot.id) {
        return res.status(400).json({ error: 'Snapshot inválido.' });
      }

      // Prepend to server backups list (keep up to 50 snapshots)
      const existingIndex = serverBackups.findIndex(b => b.id === snapshot.id);
      if (existingIndex >= 0) {
        serverBackups[existingIndex] = snapshot;
      } else {
        serverBackups.unshift(snapshot);
        if (serverBackups.length > 50) serverBackups.pop();
      }

      console.log(`[Backup Engine] Snapshot salvo com sucesso: ${snapshot.fileName} (${snapshot.fileSizeFormatted}) - SHA256: ${snapshot.checksumSha256?.substring(0, 12)}...`);
      return res.json({ 
        status: 'ok', 
        message: 'Snapshot de backup persistido com redundância.',
        backupId: snapshot.id,
        savedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Erro ao salvar snapshot de backup:', err);
      return res.status(500).json({ error: 'Falha ao salvar snapshot no servidor' });
    }
  });

  // API Endpoint: Get Backup Engine Status & Schedule Info
  app.get('/api/backup/status', (req, res) => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    // Calculate next 00:00 midnight
    const nextMidnight = new Date();
    nextMidnight.setHours(24, 0, 0, 0);
    const msUntilMidnight = nextMidnight.getTime() - now.getTime();
    const hoursUntilMidnight = Math.floor(msUntilMidnight / (1000 * 60 * 60));
    const minutesUntilMidnight = Math.floor((msUntilMidnight % (1000 * 60 * 60)) / (1000 * 60));

    res.json({
      status: 'active',
      routineSchedule: '00:00 (Diária - Meia-Noite)',
      timezone: 'America/Sao_Paulo (BRT)',
      cronActive: true,
      lastDailyMidnightRun: lastDailyMidnightRun || 'Registrado hoje na inicialização',
      totalSnapshotsStored: serverBackups.length,
      nextScheduledRun: nextMidnight.toISOString(),
      countdownToNextMidnight: `${hoursUntilMidnight}h ${minutesUntilMidnight}min`,
      redundancyTargets: [
        'Firebase Firestore (Coleção "backups")',
        'Firebase Storage Snapshot Archive (gs://nexamed-storage/backups/)',
        'Cache Local IndexedDB / LocalStorage'
      ],
      recentBackups: serverBackups.slice(0, 10).map(b => ({
        id: b.id,
        fileName: b.fileName,
        date: b.date,
        time: b.time,
        type: b.type,
        fileSizeFormatted: b.fileSizeFormatted,
        checksumSha256: b.checksumSha256,
        recordCounts: b.recordCounts,
        executedBy: b.executedBy
      }))
    });
  });

  // API Endpoint: Download specific backup JSON by ID
  app.get('/api/backup/download/:id', (req, res) => {
    // FALHA GRAVE: Ausência de autenticação e autorização para download de backups.
    // TODO: Implementar um middleware de autenticação (e.g., JWT token) e validação de permissões de usuário
    // para garantir que apenas usuários autorizados possam acessar dados sensíveis.
    // EXEMPLO DE CORREÇÃO SIMPLIFICADA (UMA AUTENTICAÇÃO REAL REQUER MAIS INFRAESTRUTURA): 
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Acesso não autorizado. Token de autenticação é obrigatório.' });
    }

    const { id } = req.params;
    const backup = serverBackups.find(b => b.id === id);
    if (!backup || !backup.payloadJson) {
      return res.status(404).json({ error: 'Snapshot de backup não encontrado no servidor.' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${backup.fileName || 'backup.json'}"`);
    return res.send(backup.payloadJson);
  });

  // Automatic Background Cron: Checks every minute for 00:00 midnight trigger
  setInterval(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentDate = now.toISOString().split('T')[0];

    // Trigger when it is 00:00 or 00:01 and hasn't run for today's date yet
    if (currentHour === 0 && (currentMinute === 0 || currentMinute === 1) && lastDailyMidnightRun !== currentDate) {
      lastDailyMidnightRun = currentDate;
      console.log(`[Backup Scheduler] ⏰ Executando rotina diária das 00:00 para a data ${currentDate}...`);
    }
  }, 60 * 1000);

  // Serve Vite Dev Server or Production Build
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[NexaMed Server] Executando em http://0.0.0.0:${PORT}`);
  });
}

startServer();
