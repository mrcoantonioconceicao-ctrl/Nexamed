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
        model: 'gemini-3.6-flash',
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
        model: 'gemini-3.6-flash',
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
        model: 'gemini-3.6-flash',
        contents: prompt,
      });

      return res.json({ summary: response.text });
    } catch (err: unknown) {
      console.error('Erro na API Handover Summary:', err);
      return res.status(500).json({ error: 'Erro ao gerar resumo do plantão' });
    }
  });

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
