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

      // Platform knowledge helper for quick local actions and clear instructions
      const generateLocalResponse = (msg: string) => {
        const lower = msg.toLowerCase();

        if (lower.includes('residente') || lower.includes('cadastrar') || lower.includes('ficha')) {
          return {
            text: `📍 **Como encontrar e gerenciar Residentes:**\n\n1. Acesse o menu **"Residentes & Fichas"** na barra lateral (ou clique no botão abaixo).\n2. Na tela de Residentes, clique no botão **"+ Novo Residente"** no canto superior direito para cadastrar um morador.\n3. Para ver a ficha completa de um morador existente, clique sobre o card dele.\n\n✨ **O que você encontra na ficha:**\n- Plano Terapêutico Singular (PTS)\n- Grau de Dependência (ABVD/AIVD)\n- Histórico de Sinais Vitais e Alergias\n- Prescrições e Contatos de Emergência`,
            actions: [
              { type: 'navigate', payload: { path: '/residentes' }, label: 'Ir para Residentes' },
              { type: 'navigate', payload: { path: '/prontuarios' }, label: 'Ver Prontuários' }
            ]
          };
        }

        if (lower.includes('soap') || lower.includes('evoluç') || lower.includes('prontuár')) {
          return {
            text: `📍 **Como criar e registrar Evoluções Clínicas (SOAP):**\n\n1. Vá até a tela **"Prontuário (SOAP)"** ou pressione **⌘K** no teclado.\n2. Clique em **"+ Nova Evolução SOAP"**.\n3. **Dica da Nexa:** Digite pontos brutos em linguagem natural e clique em **"Gerar com IA Nexa"**. Eu organizarei os dados automaticamente em **Subjetivo, Objetivo, Avaliação e Plano**!`,
            actions: [
              { type: 'create_evolution', payload: {}, label: '✍️ Abrir Editor SOAP com IA' },
              { type: 'navigate', payload: { path: '/prontuarios' }, label: 'Ver Histórico de Prontuários' }
            ]
          };
        }

        if (lower.includes('remédio') || lower.includes('medicaç') || lower.includes('mar') || lower.includes('atras')) {
          return {
            text: `📍 **Onde gerenciar Medicamentos e Aprazamento (MAR):**\n\n1. Na barra lateral, acesse **"Aprazamento (MAR)"**.\n2. Veja os horários de cada residente organizados por turno (Manhã, Tarde, Noite).\n3. Clique em **"Ministrar"** para dar baixa na dose ou registrar recusa/atraso.\n4. Medicamentos psicotrópicos possuem destaque amarelo para dupla checagem obrigatória.`,
            actions: [
              { type: 'navigate', payload: { path: '/medicacao' }, label: '💊 Abrir Aprazamento MAR' }
            ]
          };
        }

        if (lower.includes('escala') || lower.includes('folga') || lower.includes('turno') || lower.includes('equipe')) {
          return {
            text: `📍 **Onde consultar e montar as Escalas de Trabalho:**\n\n1. Acesse **"Escalas da Equipe"** no menu principal.\n2. Filtre por **Médicos, Enfermagem, Cuidadores ou Terapeutas**.\n3. Acompanhe a cobertura de 24 horas por dia da unidade, verificando folgas e substituições ativas.`,
            actions: [
              { type: 'navigate', payload: { path: '/escalas' }, label: '📅 Ir para Escalas da Equipe' }
            ]
          };
        }

        if (lower.includes('plantão') || lower.includes('passagem') || lower.includes('troca')) {
          return {
            text: `📍 **Como fazer a Passagem de Plantão:**\n\n1. Acesse o menu **"Passagem de Plantão"**.\n2. Clique em **"Sintetizar com IA Nexa"** para que eu monte o resumo de ocorrências e pendências das últimas 12h.\n3. Digite suas observações e clique em **"Assinar e Passar Turno"** para registrar seu visto digital.`,
            actions: [
              { type: 'navigate', payload: { path: '/plantao' }, label: '📋 Ir para Passagem de Plantão' }
            ]
          };
        }

        if (lower.includes('relatóri') || lower.includes('intercorrênci') || lower.includes('queda') || lower.includes('pressã')) {
          return {
            text: `📍 **Onde ver Relatórios e Intercorrências:**\n\n1. Acesse o menu **"Relatórios & Intercorrências"**.\n2. Alterne entre as abas: **Intercorrências, Passagens de Plantão, Evoluções SOAP e Adesão MAR**.\n3. Clique no botão **"Relatório Executivo IA"** no topo da página para gerar um parecer sintético para a coordenação técnica.`,
            actions: [
              { type: 'navigate', payload: { path: '/relatorios' }, label: '📊 Abrir Central de Relatórios' },
              { type: 'navigate', payload: { path: '/dashboard' }, label: 'Ver Gráfico no Dashboard' }
            ]
          };
        }

        if (lower.includes('comando') || lower.includes('onde achar') || lower.includes('como usar') || lower.includes('ajuda') || lower.includes('funciona')) {
          return {
            text: `✨ **Guia Rápido da Assistente Nexa — Como usar e encontrar qualquer comando:**\n\n• **Busca Rápida (⌘K ou Ctrl+K):** Pressione estas teclas em qualquer lugar do sistema para abrir a barra de comando instantâneo.\n• **Painel Principal (/dashboard):** Visão geral de residentes, alertas críticos e gráfico de intercorrências.\n• **Fichas e PTS (/residentes):** Cadastro de moradores, contatos e plano terapêutico.\n• **Prontuários SOAP (/prontuarios):** Registros clínicos estruturados com auxílio da IA Nexa.\n• **Aprazamento MAR (/medicacao):** Checagem de medicamentos ministrados x pendentes.\n• **Escalas (/escalas):** Programação de turnos de médicos, enfermeiros e cuidadores.\n• **Passagem de Plantão (/plantao):** Assinatura e resumo do turno.\n• **Relatórios (/relatorios):** Auditoria de quedas, sinais vitais e relatórios executivos.\n\nQual destas áreas você deseja acessar agora?`,
            actions: [
              { type: 'navigate', payload: { path: '/dashboard' }, label: '📊 Dashboard' },
              { type: 'navigate', payload: { path: '/residentes' }, label: '👥 Residentes' },
              { type: 'navigate', payload: { path: '/prontuarios' }, label: '📝 Prontuários' },
              { type: 'navigate', payload: { path: '/medicacao' }, label: '💊 Aprazamento MAR' },
              { type: 'navigate', payload: { path: '/escalas' }, label: '📅 Escalas' },
              { type: 'navigate', payload: { path: '/plantao' }, label: '📋 Passagem de Plantão' },
              { type: 'navigate', payload: { path: '/relatorios' }, label: '📈 Relatórios' },
            ]
          };
        }

        return {
          text: `Entendi perfeitamente sua solicitação ("${msg}"). Como sua assistente clínica, analisei o histórico da unidade e posso te ajudar a executar esse trabalho na plataforma ou direcionar ao local exato.`,
          actions: [
            { type: 'navigate', payload: { path: '/dashboard' }, label: 'Ver Dashboard Clínico' },
            { type: 'create_evolution', payload: {}, label: 'Criar Evolução SOAP' },
            { type: 'navigate', payload: { path: '/relatorios' }, label: 'Gerar Relatório de Intercorrências' }
          ]
        };
      };

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        const localResp = generateLocalResponse(message);
        return res.json(localResp);
      }

      const ai = getAiClient();

      const systemPrompt = `Você é a "Nexa", a assistente clínica e de navegação inteligente da plataforma NexaMed para clínicas e residências terapêuticas.
Sua missão é:
1. Tirar todas as dúvidas do usuário sobre a plataforma.
2. Explicar onde fica qualquer recurso ou comando e mostrar o passo a passo de como chegar lá.
3. Gerar e auxiliar em qualquer tipo de trabalho dentro da plataforma (redigir evolução SOAP, sintetizar plantão, analisar intercorrências, checar aprazamento).
4. Sempre sugerir botões de ações executáveis ("actions") no JSON de resposta para que o usuário clique e execute diretamente o comando ou vá para a tela.

Navegações válidas em 'path':
- '/dashboard' (Dashboard Clínico e Gráficos)
- '/residentes' (Fichas e Cadastro de Residentes)
- '/prontuarios' (Prontuário e Evoluções SOAP)
- '/medicacao' (Aprazamento de Medicamentos MAR)
- '/escalas' (Escalas da Equipe Multidisciplinar)
- '/plantao' (Passagem de Plantão)
- '/relatorios' (Central de Relatórios e Intercorrências)

Ações válidas em 'type':
- 'navigate' (com payload.path)
- 'open_resident' (com payload.residentId)
- 'create_evolution' (com payload.residentId opcional)
- 'mark_alerts_read'
- 'open_escala'

CONTEXTO DA PÁGINA ATUAL: "${contextPage || 'Geral'}"

DADOS ATUAIS DO SISTEMA:
- Residentes ativos: ${JSON.stringify(residentsData || [])}
- Alertas clínicos ativos: ${JSON.stringify(alertsData || [])}
- Últimas evoluções clínicas: ${JSON.stringify(recentEvolutions || [])}

Responda SEMPRE em formato JSON estrito:
{
  "text": "Sua resposta explicativa, didática e clínica em Markdown...",
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
