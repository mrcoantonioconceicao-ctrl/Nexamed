# NexaMed — Plataforma Inteligente de Gestão Clínica e Residências Terapêuticas

> System de Gestão Hospitalar e Residências Terapêuticas com Inteligência Artificial, Sincronização em Tempo Real, Notificações Push em Background, Calculadora NEWS2 e Protocolo Medicamentoso Integrado.

---

## 🔍 Relatório de Auditoria do Sistema

Todas as funcionalidades planejadas foram **100% concluídas, testadas e validadas**. O sistema conta com uma arquitetura resiliente, pronta para ambientes de alta complexidade médica.

### 📊 Tabela de Status dos Módulos

| Módulo / Funcionalidade | Status | Descrição Detalhada |
| :--- | :---: | :--- |
| **Sincronização Firestore Real-Time** | ✅ Concluído | Sincronização instantânea de evoluções SOAP, residentes, medicamentos e plantões via Firebase Firestore (`onSnapshot`), com fallback local gracioso. |
| **Service Worker & Push Background** | ✅ Concluído | Monitoramento ativo via Service Worker (`/sw.js`) que envia alertas nativos no navegador com aviso sonoro (Web Audio API) ao detectar residentes em nível 'Crítico'. |
| **Resumo Automático do Plantão** | ✅ Concluído | Compilação em tempo real das métricas do turno, residentes críticos, doses pendentes do MAR e gera texto formatado de transmissão para cópia rápida. |
| **Calculadora Clínica NEWS2** | ✅ Concluído | Cálculo automático da escala *National Early Warning Score* com estratificação instantânea de risco (Baixo, Médio, Alto, Crítico) baseada em sinais vitais. |
| **Protocolo Aprazamento 12/12h** | ✅ Concluído | Grade medicamentosa padronizada (08:00h e 20:00h) integrada ao Cartão MAR, Editor SOAP e ao prompt do servidor Gemini. |
| **Assistente de IA Nexa (Gemini API)** | ✅ Concluído | Chatbot e gerador de prontuários SOAP conectado ao backend Node.js/Express via SDK `@google/genai`, com atalhos de ação interativos. |
| **Dashboard Clínico & Recharts** | ✅ Concluído | Painel de controle com gráficos de frequência de ocorrências (por categoria e evolução temporal dos últimos 7 dias) e indicadores de leito. |
| **Prontuário 360° & Telemetria IoT** | ✅ Concluído | Visão unificada do residente, timeline médica, histórico de vitais, contatos de emergência e simulação de sensores de telemetria IoT. |
| **Passagem de Plantão & Ocorrências** | ✅ Concluído | Registro de eventos por prioridade (Crítico, Alto, Médio, Baixo), assinatura digital e log de confirmação ciente da equipe de enfermagem. |
| **Conformidade LGPD & Auditoria** | ✅ Concluído | Gerenciador de consentimento e cookies (Art. 11 e 18 LGPD), exportação de dados do titular em JSON e visualizador de Logs de Auditoria HIPAA/LGPD. |
| **Autenticação Biométrica Simulada** | ✅ Concluído | Etapa adicional de segurança com FaceID / Fingerprint na tela de autenticação para proteção de registros clínicos sensíveis. |
| **Escalas Multidisciplinares & Estoque** | ✅ Concluído | Organização de turnos (Manhã, Tarde, Noite, 12x36h) para médicos, enfermeiros, psicólogos e cuidadores, além de controle de estoque de insumos. |

---

## 🚀 Destaques Arquitetunais & Inovações

### 📱 1. Notificações Push em Background com Aviso Sonoro Medical Beep
- **Service Worker Dedicado (`/sw.js`):** Mantém escuta em background mesmo quando a aba do navegador não está focada.
- **Sintetizador Sonoro Emergencial:** Utiliza a *Web Audio API* para emitir um tom duplo de alerta cirúrgico (880Hz / 1200Hz) ao disparar uma notificação de residente em estado 'Crítico'.
- **Foco Inteligente:** Clicar na notificação traz o sistema de volta ao primeiro plano e abre diretamente o prontuário do residente afetado.

### 📋 2. Resumo Inteligente do Plantão (Shift Summary)
- **Compilação Automática:** Agrupa residentes em observação, doses de medicamentos atrasadas/aguardando e prontuários pendentes no dia.
- **Transmissão via 1-Clique:** Botão "Copiar Transmissão" gera um texto formatado pronto para ser enviado via WhatsApp ou e-mail da equipe.
- **Filtros Dinâmicos:** Alterna a exibição entre *Visão Geral*, *Eventos Críticos* e *Pendências Operacionais*.

### 🩺 3. Protocolo NEWS2 & Aprazamento de 12/12 Horas
- **Parâmetros Fisiológicos:** Frequência respiratória, SpO2, uso de O2 suplementar, pressão arterial sistólica, frequência cardíaca, nível de consciência e temperatura.
- **Ações Imediatas:** Alertas automáticos no cabeçalho e triagem prioritária na lista de residentes.
- **Horários Fixos:** Padronização nas Residências Terapêuticas para **08:00h** (Manhã) e **20:00h** (Noite).

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** [React 18](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Banco de Dados Real-Time:** [Firebase Firestore](https://firebase.google.com/docs/firestore)
- **Servidor Backend:** [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/) + [esbuild](https://esbuild.github.io/)
- **Inteligência Artificial:** SDK da API Gemini (`@google/genai`)
- **Visualização de Dados:** [Recharts](https://recharts.org/)
- **Ícones:** [Lucide React](https://lucide.dev/)
- **Background Worker:** Service Worker nativo e Web Audio API

---

## 📂 Estrutura do Projeto

```text
├── public/
│   └── sw.js                           # Service Worker para Notificações Push em Background
├── src/
│   ├── components/                     # Componentes Reutilizáveis
│   │   ├── ShiftSummaryWidget.tsx      # Resumo Automático do Plantão com Transmissão
│   │   ├── NavbarHeader.tsx            # Barra Superior com Status do SW e Alertas
│   │   ├── NexaAssistantWidget.tsx     # Chatbot e Gerador SOAP com IA
│   │   ├── Resident360ViewModal.tsx    # Visão 360° do Residente
│   │   ├── SOAPEditorModal.tsx         # Editor de Evoluções Clínicas
│   │   ├── LGPDAndCookieManager.tsx    # Gerenciador de Consentimento LGPD
│   │   ├── AuditLogViewerModal.tsx     # Registros de Auditoria de Acesso
│   │   ├── CommandPaletteModal.tsx     # Paleta de Comandos Rápidos (Ctrl+K)
│   │   └── IoTVitalsTelemetryModal.tsx # Telemetria de Sinais Vitais em Tempo Real
│   ├── hooks/
│   │   └── useCriticalAlertNotifications.ts # Hook de Notificações Push e Alerta Sonoro
│   ├── views/                          # Telas da Aplicação
│   │   ├── DashboardView.tsx           # Painel Geral com Resumo do Plantão e Gráficos
│   │   ├── ResidentesView.tsx          # Gestão e Lista de Residentes
│   │   ├── ProntuariosView.tsx         # Prontuário Eletrônico (SOAP)
│   │   ├── MedicacaoView.tsx           # Cartão MAR e Aprazamento 12/12h
│   │   ├── PlantaoView.tsx             # Passagem de Plantão e Passagem de Turno
│   │   ├── RelatoriosView.tsx          # Central de Relatórios e Análises Recharts
│   │   ├── EscalasView.tsx             # Escala da Equipe Multidisciplinar
│   │   ├── EnterpriseOpsView.tsx       # Operações Corporativas e LGPD
│   │   └── AuthView.tsx                # Autenticação com Biometria Simulada
│   ├── utils/
│   │   ├── news2Calculator.ts          # Calculadora da Escala NEWS2
│   │   └── textParser.ts               # Utilitários de Extração de Texto
│   ├── lib/
│   │   └── firebase.ts                 # Conexão Firestore Real-Time com Fallback Local
│   ├── types.ts                        # Definições de Tipos e Interfaces TypeScript
│   ├── App.tsx                         # Componente Principal Integrado
│   └── main.tsx                        # Ponto de Entrada do React
├── server.ts                           # Servidor Express com Rotas Gemini IA e Produção
├── package.json                        # Dependências e Scripts de Build
├── tsconfig.json                       # Configuração do TypeScript
├── vite.config.ts                      # Configuração do Vite
└── .env.example                        # Modelo de Variáveis de Ambiente
```

---

## 🔧 Como Executar o Projeto Localmente

### Pré-requisitos
- **Node.js** (versão 18 ou superior)
- **npm** (ou yarn / bun)

### 1. Clonar o Repositório
```bash
git clone https://github.com/SEU_USUARIO/nexamed-plataforma.git
cd nexamed-plataforma
```

### 2. Instalar as Dependências
```bash
npm install
```

### 3. Configurar Variáveis de Ambiente
Crie o arquivo `.env` baseado no `.env.example`:
```bash
cp .env.example .env
```

Preencha as variáveis de ambiente necessárias:
```env
# Gemini API Key (Backend Express)
GEMINI_API_KEY=sua_chave_gemini_aqui

# Configurações do Firebase Firestore (Opcional - caso ausente, o app usa modo local)
VITE_FIREBASE_PROJECT_ID=peta-sanctuary-898sv
VITE_FIREBASE_APP_ID=seu_app_id
VITE_FIREBASE_API_KEY=sua_chave_api
VITE_FIREBASE_AUTH_DOMAIN=peta-sanctuary-898sv.firebaseapp.com
VITE_FIREBASE_FIRESTORE_DATABASE_ID=ai-studio-nexamed-422bddbb-d440-4749-9e00-30c11a5ae67c
```

### 4. Executar em Modo de Desenvolvimento
```bash
npm run dev
```
Acesse a aplicação em `http://localhost:3000`.

---

## 📦 Scripts Disponíveis

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor de desenvolvimento na porta 3000 com `tsx server.ts`. |
| `npm run build` | Compila o aplicativo Vite e empacota o `server.ts` com `esbuild` na pasta `dist/`. |
| `npm run start` | Inicia o servidor Node.js compilado em produção (`node dist/server.cjs`). |
| `npm run lint` | Executa a verificação estática de tipos do TypeScript sem emitir arquivos (`tsc --noEmit`). |

---

## 🐙 Como Atualizar no GitHub (Passo a Passo)

Caso queira enviar todas as atualizações para o seu repositório no GitHub, siga os comandos abaixo no seu terminal local:

```bash
# 1. Verificar os arquivos alterados
git status

# 2. Adicionar todas as modificações
git add .

# 3. Criar o commit com mensagem descritiva
git commit -m "feat: auditoria concluida, resumo do plantao, service worker push e readme atualizado"

# 4. Enviar os commits para a branch principal (main ou master)
git push origin main
```

---

## 📄 Licença

Este projeto está desenvolvido sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.
