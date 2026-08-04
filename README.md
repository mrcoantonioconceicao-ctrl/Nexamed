# 🏥 NexaMed — Plataforma Inteligente de Gestão Clínica e Residências Terapêuticas

> **Sistema de Gestão Hospitalar e Residências Terapêuticas (SRT/RT)** com Inteligência Artificial (Gemini API), Sincronização Real-Time (Firebase Firestore), Painel de Checagem por Horários de Medicação (MAR), Cadastro Integrado de Medicamentos no Acolhimento, Guia Operacional Normativo, Calculadora NEWS2, Service Worker com Alerta Sonoro de Emergência e Conformidade LGPD/HIPAA.

---

## 📌 Sumário

1. [Visão Geral do Sistema](#-visão-geral-do-sistema)
2. [Módulos Principais & Funcionalidades](#-módulos-principais--funcionalidades)
   - [1. Painel Dashboard & Resumo Automático do Plantão](#1-painel-dashboard--resumo-automático-do-plantão)
   - [2. Acolhimento de Residentes & Cadastro de Medicamentos](#2-acolhimento-de-residentes--cadastro-de-medicamentos)
   - [3. Painel de Checagem por Horários de Medicação (MAR)](#3-painel-de-checagem-por-horários-de-medicação-mar)
   - [4. Guia Residencial Terapêutico (Manual Técnico e Normativo)](#4-guia-residencial-terapêutico-manual-técnico-e-normativo)
   - [5. Prontuário Eletrônico SOAP & Assistente de IA Nexa](#5-prontuário-eletrônico-soap--assistente-de-ia-nexa)
   - [6. Triagem Fisiológica NEWS2 & Alertas Sonoros em Background](#6-triagem-fisiológica-news2--alertas-sonoros-em-background)
   - [7. Passagem de Plantão & Registro de Ocorrências](#7-passagem-de-plantão--registro-de-ocorrências)
   - [8. Prontuário 360°, Telemetria IoT & Visita Telemedicina](#8-prontuário-360-telemetria-iot--visita-telemedicina)
   - [9. Segurança, Biometria, LGPD & Auditoria](#9-segurança-biometria-lgpd--auditoria)
   - [10. Escalas Multidisciplinares & Gestão de Estoque](#10-escalas-multidisciplinares--gestão-de-estoque)
3. [📊 Tabela de Status dos Módulos](#-tabela-de-status-dos-módulos)
4. [🛠️ Tecnologias Utilizadas](#️-tecnologias-utilizadas)
5. [📂 Estrutura Completa do Projeto](#-estrutura-completa-do-projeto)
6. [🔧 Como Executar o Projeto Localmente](#-como-executar-o-projeto-localmente)
7. [⚙️ Configuração de Variáveis de Ambiente](#️-configuração-de-variáveis-de-ambiente)
8. [📦 Scripts Disponíveis](#-scripts-disponíveis)
9. [🐙 Guia de Atualização no GitHub](#-guia-de-atualização-no-github)
10. [📄 Licença](#-licença)

---

## 🌟 Visão Geral do Sistema

O **NexaMed** é uma solução completa desenvolvida para suprir as demandas complexas de equipes multidisciplinares em **Serviços de Residência Terapêutica (SRT)**, Instituições de Longa Permanência e Clínicas Especializadas em Saúde Mental.

Construído sob as diretrizes da **Portaria MS/GM nº 106/2000**, **RDC ANVISA nº 50/2002** e **Lei nº 10.216/2001 (Reforma Psiquiátrica)**, o NexaMed une a humanização do acolhimento ao rigor técnico da enfermagem e medicina. O sistema elimina falhas na administração de medicamentos, agiliza a passagem de turno, calcula o risco clínico em tempo real e emite alertas emergenciais mesmo quando a tela do computador está inativa.

---

## 🚀 Módulos Principais & Funcionalidades

### 1. Painel Dashboard & Resumo Automático do Plantão
- **Indicadores Rápidos de Leito:** Contagem instantânea de residentes ativos, leitos ocupados, casos críticos e pendências do MAR.
- **Resumo Inteligente (Shift Summary):** Compilação automática de eventos do turno, residentes em observação rigorosa e lista de remédios aguardando checagem.
- **Transmissão via 1-Clique:** Botão de cópia formatada para rápido envio do relatório de passagem de turno via WhatsApp ou e-mail da equipe.
- **Análises Gráficas (Recharts):** Gráficos de distribuição de ocorrências por categoria e evolução temporal dos episódios clínicos dos últimos 7 dias.

### 2. Acolhimento de Residentes & Cadastro de Medicamentos
- **Formulário de Entrada do Residente:** Coleta de dados pessoais, idade, CPF, quarto/leito, grau de dependência (Grau I, II ou III), diagnóstico principal, alergias conhecidas e contato familiar de emergência.
- **Cadastro Integrado de Remédios no Acolhimento:** Permite cadastrar a prescrição contínua diretamente durante a criação do residente.
  - **Atalhos Rápidos (Presets):** Inserção em 1-clique de psicotrópicos e medicamentos frequentes (Quetiapina, Risperidona, Losartana, Clonazepam, Sertralina, Memantina).
  - **Atributos Completos:** Configuração de dosagem, via de administração (VO, IV, IM, SC, Tópico, Inalatório), frequência, horários de aprazamento, estoque inicial de doses, alerta de psicotrópico (Portaria 344) e orientações de enfermagem.
  - **Geração Automática do MAR:** Cria automaticamente as doses pendentes na grade do Kardex Eletrônico para o novo residente.

### 3. Painel de Checagem por Horários de Medicação (MAR)
- **Visão Categorizada por Horário:** Agrupamento de todas as medicação a serem ministradas nos horários padronizados (08:00h, 12:00h, 16:00h, 20:00h, 22:00h).
- **Ações Diretas de Administração:**
  - **Tomou (100%):** Botão verde de confirmação imediata da ingestão completa em 1-clique.
  - **Parcial:** Permite registrar administração incompleta escolhendo justificativas pré-definidas (ex: *ingeriu 50% e cuspiu*, *aceitou apenas parte da solução*) ou inserindo texto livre da enfermagem.
  - **Recusou:** Permite registrar a recusa do medicamento selecionando causas clínicas ou comportamentais (ex: *recusa verbal*, *agitação/desorientação*, *disfagia*, *náusea*) com gravação do motivo no prontuário.
- **Badges de Contagem de Doses:** Destaque para o número de remédios pendentes em cada faixa horária e sinalização imediata para residentes em estado 'Crítico'.

### 4. Guia Residencial Terapêutico (Manual Técnico e Normativo)
- **Manual Operacional Integrado:** Guia de referência rápida para cuidadores, técnicos de enfermagem e enfermeiros sobre a rotina de Residência Terapêutica.
- **Fundamentação Legal:** Conteúdo alinhado com a Portaria MS nº 106/2000, RDC ANVISA nº 50/2002 e diretrizes do Ministério da Saúde.
- **Seções Temáticas:**
  - Diretrizes de Autonomia e Convivência Comunitária.
  - Protocolo de Administração e Armazenamento Seguro de Medicamentos.
  - Rotinas de Higiene, Nutrição e Prevenção de Lesões.
  - Manejo de Crises e Protocolos de Urgência Psiquiátrica.
  - Projeto Terapêutico Singular (PTS) e Articulação com CAPS.

### 5. Prontuário Eletrônico SOAP & Assistente de IA Nexa
- **Evoluções SOAP Padronizadas:** Registro dividido em *Subjetivo*, *Objetivo*, *Avaliação* e *Plano*, garantindo consistência com normas do COFEN/CFM.
- **Assistente Nexa (Gemini API):** Chatbot especializado e gerador de rascunho de evolução SOAP integrado via SDK `@google/genai`. Analisa histórico do residente e sugere intervenções baseadas em evidências.
- **Atalhos Interativos:** Botões para aplicar sugestões diretamente nos campos do prontuário ou copiar condutas médicas.

### 6. Triagem Fisiológica NEWS2 & Alertas Sonoros em Background
- **CalculadoraNEWS2:** Cálculo automático da pontuação *National Early Warning Score* considerando Frequência Respiratória, SpO2, Suporte de O2, Pressão Arterial Sistólica, Frequência Cardíaca, Nível de Consciência (AVPU) e Temperatura.
- **Classificação de Risco:** Categorização imediata em Baixo, Médio, Alto e Crítico.
- **Notificações Push com Service Worker (`/sw.js`):** Escuta contínua no navegador em segundo plano.
- **Sintetizador Sonoro Medical Beep:** Emite um bipe cirúrgico duplo (Web Audio API) ao detectar a transição de um residente para o nível 'Crítico', garantindo atenção imediata da equipe de plantão.

### 7. Passagem de Plantão & Registro de Ocorrências
- **Passagem de Turno Estruturada:** Registro de intercorrências com classificação por severidade (Crítica, Alta, Média, Baixa).
- **Assinatura Digital & Ciente:** Sistema de assinatura pelo profissional transmissor e receptor com registro de data/hora.
- **Linha do Tempo de Ocorrências:** Histórico filtrável por período e por residente.

### 8. Prontuário 360°, Telemetria IoT & Visita Telemedicina
- **Visualização Holística (Prontuário 360°):** Abas dedicadas a Dados Pessoais, Histórico Clínico, Gráfico MAR de Medicamentos, Plano Terapêutico Singular (PTS) e Linha do Tempo.
- **Telemetria de Sinais Vitais IoT:** Simulação de sensores em tempo real monitorando Oximetria, Frequência Cardíaca e Pressão Arterial.
- **Módulo de Telemedicina:** Agendamento e realização de teleconsultas com psiquiatras e médicos da rede.

### 9. Segurança, Biometria, LGPD & Auditoria
- **Autenticação Biométrica Simulada:** Etapa adicional de proteção via FaceID / Impressão Digital para liberação de dados sensíveis.
- **Conformidade LGPD (Art. 11 e 18):** Termos de consentimento do titular de dados, gerenciador de cookies e ferramenta de exportação completa dos registros em formato JSON.
- **Logs de Auditoria (HIPAA/LGPD):** Registro imutável de ações no sistema (quem acessou, qual prontuário foi alterado, data, hora e IP).

### 10. Escalas Multidisciplinares & Gestão de Estoque
- **Escala de Plantão:** Organização por turnos (Manhã, Tarde, Noite, 12x36h) para Médicos, Enfermeiros, Psicólogos, Cuidadores e Assistentes Sociais.
- **Estoque de Insumos e Fármacos:** Controle de quantidade mínima, validade e reposição de materiais de enfermagem e medicamentos.

---

## 📊 Tabela de Status dos Módulos

| Módulo / Funcionalidade | Status | Descrição Detalhada |
| :--- | :---: | :--- |
| **Painel de Checagem por Horário (MAR)** | ✅ 100% Concluído | Visão categorizada por horário com botões 'Tomou', 'Parcial' e 'Recusou' (com justificativa). |
| **Cadastro de Remédios no Acolhimento** | ✅ 100% Concluído | Inclusão de medicamentos com presets rápidos, vias, horários e geração automática no MAR. |
| **Guia Residencial Terapêutico** | ✅ 100% Concluído | Manual técnico-operacional integrado com diretrizes da Portaria MS 106/2000 e ANVISA. |
| **Sincronização Firestore Real-Time** | ✅ 100% Concluído | Atualização instantânea de evoluções, residentes e medicações via `onSnapshot` com fallback local. |
| **Service Worker & Push Background** | ✅ 100% Concluído | Notificações nativas no navegador com alarme sonoro (Web Audio API) para residentes críticos. |
| **Resumo Automático do Plantão** | ✅ 100% Concluído | Agrupamento de eventos do turno e texto de transmissão formatado para cópia rápida. |
| **Calculadora Clínica NEWS2** | ✅ 100% Concluído | Cálculo automatizado de pontuação fisiológica e estratificação de risco imediata. |
| **Assistente de IA Nexa (Gemini API)** | ✅ 100% Concluído | Integração backend com SDK `@google/genai` para apoio no diagnóstico e evoluções SOAP. |
| **Dashboard Clínico & Recharts** | ✅ 100% Concluído | Gráficos de intercorrências e métricas operacionais atualizadas dinamicamente. |
| **Prontuário 360° & Telemetria IoT** | ✅ 100% Concluído | Visão holística do residente, histórico vital e simulação de sensores de telemetria. |
| **Conformidade LGPD & Auditoria** | ✅ 100% Concluído | Gestão de consentimento, exportação JSON de dados e auditoria de logs HIPAA/LGPD. |
| **Autenticação Biométrica Simulada** | ✅ 100% Concluído | Verificação facial/digital para acesso a prontuários e administração de medicamentos. |
| **Escalas & Gestão de Estoque** | ✅ 100% Concluído | Grade de turnos multidisciplinares e controle de estoque de insumos de enfermagem. |

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** [React 18](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Banco de Dados Real-Time:** [Firebase Firestore](https://firebase.google.com/docs/firestore)
- **Backend / Servidor Express:** [Node.js](https://nodejs.org/), [Express](https://expressjs.com/), [esbuild](https://esbuild.github.io/)
- **Inteligência Artificial:** SDK da API Gemini (`@google/genai`)
- **Gráficos & Visualização:** [Recharts](https://recharts.org/)
- **Ícones:** [Lucide React](https://lucide.dev/)
- **Workers e Áudio:** Service Worker PWA nativo e Web Audio API (Sintetizador Sonoro)

---

## 📂 Estrutura Completa do Projeto

```text
├── public/
│   └── sw.js                             # Service Worker para Notificações Push em Background
├── src/
│   ├── components/                       # Componentes Reutilizáveis
│   │   ├── MedicationDashboardPanel.tsx  # Painel de Checagem por Horário de Medicação (MAR)
│   │   ├── ShiftSummaryWidget.tsx        # Resumo Automático do Plantão com Botão de Transmissão
│   │   ├── NavbarHeader.tsx              # Barra Superior com Status do Service Worker e Alertas
│   │   ├── NexaAssistantWidget.tsx       # Chatbot e Gerador SOAP impulsionado por Gemini IA
│   │   ├── Resident360ViewModal.tsx      # Modal de Visão Holística 360° do Residente
│   │   ├── ResidentDetailModal.tsx       # Detalhes Rápidos e Prontuário Resumido
│   │   ├── SOAPEditorModal.tsx           # Editor de Evolução Clínica Estruturada (SOAP)
│   │   ├── LGPDAndCookieManager.tsx      # Gerenciador de Consentimento e Cookies LGPD
│   │   ├── AuditLogViewerModal.tsx       # Visualizador de Logs de Auditoria HIPAA/LGPD
│   │   ├── CommandPaletteModal.tsx       # Paleta de Comandos Rápidos (Ctrl + K)
│   │   ├── IoTVitalsTelemetryModal.tsx   # Painel de Telemetria de Sinais Vitais em Tempo Real
│   │   ├── SmartHandoverModal.tsx        # Modal de Passagem de Plantão Inteligente
│   │   ├── TelehealthModal.tsx           # Módulo de Consultas de Telemedicina
│   │   ├── AddInventoryModal.tsx         # Cadastro e Entrada de Estoque de Insumos
│   │   └── AppSidebar.tsx                # Menu Lateral de Navegação
│   ├── hooks/
│   │   └── useCriticalAlertNotifications.ts # Hook de Notificações Push e Alerta Sonoro
│   ├── views/                            # Telas/Visões da Aplicação
│   │   ├── DashboardView.tsx             # Painel Principal com Indicadores e Gráficos
│   │   ├── ResidentesView.tsx            # Gestão de Residentes e Form com Cadastro de Remedios
│   │   ├── EvolucaoMedicacaoView.tsx     # Visão MAR e Painel Dashboard por Horários
│   │   ├── ResidencialGuiaView.tsx       # Guia Residencial Terapêutico (Manual Normativo)
│   │   ├── ProntuariosView.tsx           # Prontuário Eletrônico e Registros SOAP
│   │   ├── MedicacaoView.tsx             # Cartão de Aprazamento e Kardex
│   │   ├── PlantaoView.tsx               # Passagem de Turno e Histórico de Ocorrências
│   │   ├── RelatoriosView.tsx            # Relatórios Gerenciais e Análises Clínicas
│   │   ├── EscalasView.tsx               # Escalas da Equipe Multidisciplinar e Estoque
│   │   ├── EnterpriseOpsView.tsx         # Operações Corporativas, Governança e LGPD
│   │   └── AuthView.tsx                  # Tela de Login com Biometria Simulada
│   ├── utils/
│   │   ├── news2Calculator.ts            # Calculadora da Escala Fisiológica NEWS2
│   │   └── textParser.ts                 # Manipulação de Texto e Tokens
│   ├── lib/
│   │   └── firebase.ts                   # Conexão Firestore Real-Time com Fallback Local
│   ├── types.ts                          # Definições de Tipos e Interfaces TypeScript
│   ├── App.tsx                           # Componente Raiz da Aplicação
│   ├── main.tsx                          # Ponto de Entrada do React
│   └── index.css                         # Estilização Global com Tailwind CSS
├── server.ts                             # Servidor Express Backend para Gemini IA e Produção
├── package.json                          # Dependências do Projeto e Scripts
├── tsconfig.json                         # Configurações do Compilador TypeScript
├── vite.config.ts                        # Configurações do Vite
└── .env.example                          # Modelo de Variáveis de Ambiente
```

---

## 🔧 Como Executar o Projeto Localmente

### Pré-requisitos
- **Node.js** (versão 18 ou superior)
- **npm** (ou yarn)

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

### 4. Executar em Modo de Desenvolvimento
```bash
npm run dev
```
Acesse a aplicação no seu navegador em: `http://localhost:3000`.

---

## ⚙️ Configuração de Variáveis de Ambiente

No arquivo `.env`, preencha as variáveis de acordo com suas credenciais:

```env
# Chave da API do Google Gemini (utilizada no backend server.ts)
GEMINI_API_KEY=sua_chave_gemini_aqui

# Configurações do Firebase Firestore (Opcional - se omitido, o app opera com persistência local)
VITE_FIREBASE_PROJECT_ID=peta-sanctuary-898sv
VITE_FIREBASE_APP_ID=seu_app_id
VITE_FIREBASE_API_KEY=sua_chave_api
VITE_FIREBASE_AUTH_DOMAIN=peta-sanctuary-898sv.firebaseapp.com
VITE_FIREBASE_FIRESTORE_DATABASE_ID=ai-studio-nexamed-422bddbb-d440-4749-9e00-30c11a5ae67c
```

---

## 📦 Scripts Disponíveis

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor de desenvolvimento na porta 3000 com `tsx server.ts`. |
| `npm run build` | Compila a aplicação Vite e gera o bundle do servidor backend `dist/server.cjs` via `esbuild`. |
| `npm run start` | Inicia o servidor Node.js compilado para ambiente de produção (`node dist/server.cjs`). |
| `npm run lint` | Executa a verificação estática de tipos do TypeScript (`tsc --noEmit`). |

---

## 🐙 Guia de Atualização no GitHub

Para enviar todas as atualizações e novos módulos para o repositório no GitHub:

```bash
# 1. Verificar o status dos arquivos modificados e criados
git status

# 2. Adicionar todas as alterações ao staging
git add .

# 3. Criar o commit com uma mensagem explicativa
git commit -m "feat: painel de administracao de medicacao, cadastro de remedios no acolhimento, guia residencial e readme detalhado"

# 4. Enviar as alterações para a branch principal
git push origin main
```

---

## 📄 Licença

Este projeto é disponibilizado sob a licença **MIT**. Consulte o arquivo `LICENSE` para mais informações.
