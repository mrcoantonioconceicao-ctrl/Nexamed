# 🏠 NexaMed — Plataforma de Gestão Especializada em Serviços de Residência Terapêutica (SRT)

> **Plataforma de Gestão Técnica, Clínica e Assistencial Especializada para Serviços de Residência Terapêutica (SRT Tipo I e Tipo II)** com Inteligência Artificial Clínica (Google Gemini API), Sincronização em Tempo Real (Firebase Firestore), Aprazamento e Checagem MAR (Regra dos 9 Certos), Prontuário Eletrônico SOAP com Sugestões Inteligentes de Histórico, Módulo de Micro-Learning com Player YouTube em PT-BR, Daily Huddle Clínico de 5 Minutos, Guia Operacional Normativo (Portaria MS/GM nº 106/2000 & RAPS), Calculadora NEWS2, Service Worker com Alerta Sonoro de Emergência e Conformidade LGPD/ANVISA.

---

## 📌 Sumário Executivo

1. [Visão Geral e Foco em Residência Terapêutica](#-visão-geral-e-foco-em-residência-terapêutica)
2. [Marco Regulatório e Normas Técnicas (SUS / Ministério da Saúde)](#-marco-regulatório-e-normas-técnicas-sus--ministério-da-saúde)
3. [Módulos Principais & Funcionalidades](#-módulos-principais--funcionalidades)
   - [1. Prontuário Eletrônico SOAP com Sugestões Inteligentes do Histórico](#1-prontuário-eletrônico-soap-com-sugestões-inteligentes-do-histórico)
   - [2. Aprazamento e Checagem de Medicação (MAR - Regra dos 9 Certos)](#2-aprazamento-e-checagem-de-medicação-mar---regra-dos-9-certos)
   - [3. Micro-Learning & Capacitação Contínua em Vídeo (PT-BR)](#3-micro-learning--capacitação-contínua-em-vídeo-pt-br)
   - [4. Daily Huddle Clínico & Alinhamento Operacional de 5 Minutos](#4-daily-huddle-clínico--alinhamento-operacional-de-5-minutos)
   - [5. Passagem de Plantão Inteligente & Auditoria de Pendências (SBAR)](#5-passagem-de-plantão-inteligente--auditoria-de-pendências-sbar)
   - [6. Gestão de Moradores & Plano Terapêutico Singular (PTS)](#6-gestão-de-moradores--plano-terapêutico-singular-pts)
   - [7. Assistente Técnica Nexa (Respostas Curtas e Comandos Diretos)](#7-assistente-técnica-nexa-respostas-curtas-e-comandos-diretos)
   - [8. Guia Residencial Terapêutico & Procedimentos Operacionais Padrão (POP)](#8-guia-residencial-terapêutico--procedimentos-operacionais-padrão-pop)
   - [9. Triagem NEWS2, Telemetria & Alerta Sonoro em Background](#9-triagem-news2-telemetria--alerta-sonoro-em-background)
   - [10. Escalas da Equipe Multidisciplinar & Cobertura 24/7](#10-escalas-da-equipe-multidisciplinar--cobertura-247)
   - [11. Central de Relatórios, Indicadores e Pareceres Técnicos](#11-central-de-relatórios-indicadores-e-pareceres-técnicos)
   - [12. Segurança da Informação, LGPD e Logs de Auditoria](#12-segurança-da-informação-lgpd-e-logs-de-auditoria)
4. [Tabela de Status dos Módulos](#-tabela-de-status-dos-módulos)
5. [Arquitetura Tecnológica e Stack](#-arquitetura-tecnológica-e-stack)
6. [Estrutura de Diretórios e Arquivos](#-estrutura-de-diretórios-e-arquivos)
7. [Instalação e Execução Local](#-instalação-e-execução-local)
8. [Variáveis de Ambiente](#-variáveis-de-ambiente)
9. [Deploy e Integração Contínua (CI/CD)](#-deploy-e-integração-contínua-cicd)
10. [Licença](#-licença)

---

## 🏠 Visão Geral e Foco em Residência Terapêutica

O **NexaMed** é uma solução completa desenvolvida especificamente para as necessidades e a rotina dos **Serviços de Residência Terapêutica (SRT Tipo I e Tipo II)** da Rede de Atenção Psicossocial (RAPS) do SUS.

Diferente de sistemas hospitalares genéricos, o NexaMed foi concebido com base nos princípios da **desinstitucionalização, reabilitação psicossocial, respeito à autonomia dos moradores e fortalecimento dos laços comunitários**, integrando rigor técnico no controle de psicofármacos e prontuário estruturado com interfaces ágeis para cuidadores, técnicos de enfermagem e enfermeiros responsáveis técnicos (RT).

---

## 📜 Marco Regulatório e Normas Técnicas (SUS / Ministério da Saúde)

O sistema foi modelado em total conformidade com as legislações vigentes de Saúde Mental e Enfermagem no Brasil:

- **Portaria MS/GM nº 106/2000:** Regulamentação e diretrizes de funcionamento dos Serviços de Residência Terapêutica.
- **Lei nº 10.216/2001 (Reforma Psiquiátrica):** Proteção e garantia dos direitos das pessoas com transtornos mentais e redirecionamento do modelo assistencial.
- **Portaria MS/GM nº 3.088/2011:** Instituição e estruturação da Rede de Atenção Psicossocial (RAPS).
- **RDC ANVISA nº 50/2002:** Normas e condições de habitabilidade e segurança para estabelecimentos de saúde.
- **Portaria SVS/MS nº 344/1998:** Regulamento técnico sobre substâncias e medicamentos sujeitos a controle especial (psicotrópicos).
- **Resoluções COFEN nº 564/2017 & nº 681/2021:** Código de Ética e padronização dos registros de enfermagem em prontuário eletrônico.
- **Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018):** Tratamento e proteção de dados sensíveis de saúde mental.

---

## 🚀 Módulos Principais & Funcionalidades

### 1. Prontuário Eletrônico SOAP com Sugestões Inteligentes do Histórico
- **Metodologia SOAP:** Campos dedicados para **Subjetivo (S)**, **Objetivo (O)**, **Avaliação (A)** e **Plano (P)**.
- **Sugestões Inteligentes de Histórico:** O sistema analisa as evoluções anteriores registradas para o morador selecionado e oferece atalhos com 1 clique para reaproveitar condutas frequentes, queixas subjetivas recorrentes e metas pactuadas.
- **Estruturador Automático por IA (Google Gemini):** Transforma anotações informais em texto livre em uma evolução clínica formal, corrigida e classificada segundo a norma técnica.
- **Linha do Tempo Clínica:** Histórico completo e auditável de cada intervenção com identificação do profissional e carimbo de data/hora.

### 2. Aprazamento e Checagem de Medicação (MAR - Regra dos 9 Certos)
- **Kardex Digital de Medicação:** Controle por turnos e horários aprazados (ex: esquemas 12/12h às 08h e 20h, 8/8h, 6/6h e dosagens noturnas).
- **Conferência dos 9 Certos:** Morador certo, Medicamento certo, Dose certa, Via certa, Horário certo, Orientação certa, Registro certo, Ação certa e Resposta certa.
- **Registro de Desfecho Rápido:**
  - **Administrado (100%):** Baixa imediata com checagem de tomada observada e atualização do saldo de estoque.
  - **Administrado Parcial:** Registro com seleção rápida de motivo clínico.
  - **Recusa Acolhida:** Notificação de recusa com justificativa humanizada, nova tentativa programada e aviso ao Enfermeiro RT.
- **Destaque Visual para Psicotrópicos (Portaria 344):** Alertas de dupla checagem para antipsicóticos, estabilizadores de humor, antidepressivos e ansiolíticos.

### 3. Micro-Learning & Capacitação Contínua em Vídeo (PT-BR)
- **Player YouTube Embutido e Seguro:** Reprodução contínua de vídeos de treinamento sem redirecionamento externo (`youtube-nocookie.com`).
- **Catálogo Curado em Português (PT-BR) para SRT:**
  - *Vias de Administração de Medicamentos, Aprazamento e os 9 Certos (MAR)*;
  - *Organização da Rotina Diária e Reabilitação Psicossocial no SRT*;
  - *Manejo de Crises e Desescalada Verbal em Saúde Mental (Acolhimento Não-Violento)*;
  - *Manejo Seguro de Psicotrópicos: Efeitos Adversos, Hidratação e Horários*;
  - *Higiene Pessoal, Banho Humanizado e Prevenção de Lesões por Pressão (Escala de Braden)*;
  - *Aferição Padronizada de Sinais Vitais, Glicemia e Alerta Precoce NEWS2*;
  - *Prevenção de Quedas e Adaptação do Ambiente Físico no SRT*;
  - *Passagem de Plantão Humanizada (Método SBAR) e Registro SOAP*.
- **Sintetizador por IA:** Importação de novos links do YouTube com geração automática de pontos-chave, normas da Anvisa/COFEN e quiz de fixação de conhecimento.
- **Capítulos Interativos:** Marcadores de tempo com salto direto para os trechos mais importantes do vídeo.

### 4. Daily Huddle Clínico & Alinhamento Operacional de 5 Minutos
- **Modo Apresentador Express com Cronômetro:** Slideshow dinâmico com contagem regressiva de 5 minutos para alinhamentos rápidos de início de turno.
- **Atribuição de Foco da Liderança:** Definição de prioridades clínicas, comportamentais e rotinas específicas por turno (Manhã, Tarde, Noite).
- **Painel de Briefings de Prontidão:** Agrupamento automático de alertas NEWS2, alergias do aprazamento MAR e recusas recentes.
- **Agenda de Capacitações e Certificações:** Controle de presença e inscrições em cursos obrigatórios (BLS, biossegurança NR32, desescalada de crises).
- **Exportação Instantânea:** Botão para cópia formatada para o grupo de WhatsApp da equipe e impressão da folha de huddle do turno.

### 5. Passagem de Plantão Inteligente & Auditoria de Pendências (SBAR)
- **Método SBAR:** Estruturado em **Situação**, **Breve Histórico (Background)**, **Avaliação** e **Recomendação**.
- **Resumo Automático por IA:** Síntese em linguagem natural dos acontecimentos mais relevantes das últimas 12 horas.
- **Auditoria Obrigatória de Pendências:** Bloqueio e alerta visual caso existam medicamentos não checados no MAR ou moradores sem evolução diária.
- **Assinatura Digital de Plantão:** Registro duplo e imutável do profissional que entrega e do que assume o plantão com timestamp e código de validação.

### 6. Gestão de Moradores & Plano Terapêutico Singular (PTS)
- **Cadastro Completo:** Perfil sociodemográfico, foto, grau de dependência (Grau I, II ou III), quarto/leito, data de acolhimento e contatos da rede de apoio.
- **Plano Terapêutico Singular (PTS):** Metas de convivência, oficinas terapêuticas, passeios comunitários e acompanhamento conjunto com o CAPS de referência.
- **Prontuário 360°:** Visão consolidada de sinais vitais, histórico de medicamentos, linha do tempo de ocorrências e evoluções clínicas.

### 7. Assistente Técnica Nexa (Respostas Curtas e Comandos Diretos)
- **Engine Especializada:** Assistente baseada na API Google Gemini ajustada para respostas ultra-objetivas (máximo 2 a 3 tópicos práticos).
- **Ações Executáveis no Chat:** Botões interativos para disparar ações diretamente na tela (abrir editor SOAP, abrir grade de medicação MAR, listar moradores).
- **Base de Conhecimento SRT:** Treinada nas diretrizes do Ministério da Saúde, desescalada verbal, cuidados de enfermagem e desinstitucionalização.

### 8. Guia Residencial Terapêutico & Procedimentos Operacionais Padrão (POP)
- **Manual Operacional Integrado:** Consulta rápida de protocolos e condutas para cuidadores e técnicos de enfermagem.
- **Tópicos Normativos:**
  - Direitos, Convivência e Cidadania dos Acolhidos;
  - Administração Segura e Armazenamento de Psicotrópicos;
  - Manejo de Descompensação e Crises em Saúde Mental;
  - Articulação com a Rede de Atenção Psicossocial (RAPS, CAPS, UBS e SAMU 192).

### 9. Triagem NEWS2, Telemetria & Alerta Sonoro em Background
- **Calculadora Automática NEWS2 (National Early Warning Score):** Pontuação fisiológica instantânea a partir de Pressão Arterial, Frequência Cardíaca, Frequência Respiratória, Temperatura, SpO2 e Nível de Consciência (ACVPU).
- **Alerta Sonoro em Tempo Real:** Disparo de bipe cirúrgico duplo via Web Audio API e notificação push caso o escore atinja nível de risco médio/alto.
- **Service Worker Nativo (`/sw.js`):** Monitoramento contínuo de background para manter os alertas ativos mesmo com a aba em segundo plano.

### 10. Escalas da Equipe Multidisciplinar & Cobertura 24/7
- **Gestão Visual de Turnos:** Escala mensal e diária de cuidadores de saúde mental, técnicos de enfermagem, enfermeiros RT e acompanhantes terapêuticos.
- **Prevenção de Furos de Escala:** Alertas visuais automáticos caso algum turno fique com número insuficiente de profissionais.

### 11. Central de Relatórios, Indicadores e Pareceres Técnicos
- **Indicadores de Gestão:** Gráficos de adesão medicamentosa, distribuição de ocorrências (quedas, agitação, recusa, eventos clínicos) e ocupação da casa.
- **Gerador de Parecer Executivo:** Emissão simplificada de relatórios gerenciais para prestação de contas à Coordenação de Saúde Mental do município.

### 12. Segurança da Informação, LGPD e Logs de Auditoria
- **Conformidade LGPD:** Painel de consentimento informado, anonimização e exportação de dados do titular.
- **Logs de Auditoria Imutáveis:** Rastreamento detalhado de acessos, visualizações de prontuário, edições e administrações medicamentosas com registro de usuário, função e IP.

---

## 📊 Tabela de Status dos Módulos

| Módulo / Funcionalidade | Status | Escopo & Aplicação no SRT |
| :--- | :---: | :--- |
| **Micro-Learning & Player YouTube (PT-BR)** | ✅ 100% Concluído | Capacitação contínua com player do YouTube embutido, síntese de IA e testes de fixação. |
| **Daily Huddle Clínico & Briefings Express** | ✅ 100% Concluído | Alinhamento de 5 minutos, cronômetro regressivo, agenda de treinamentos e envio p/ WhatsApp. |
| **Prontuário SOAP com Sugestões do Histórico** | ✅ 100% Concluído | Evolução rápida com reaproveitamento de histórico do morador e corretor por IA. |
| **Aprazamento & Checagem MAR (9 Certos)** | ✅ 100% Concluído | Controle de psicotrópicos, dupla checagem, registro de recusa acolhida e saldo de estoque. |
| **Assistente Nexa (Respostas Curtas e Ações)** | ✅ 100% Concluído | Respostas diretas ao ponto, sem prolixidade, com botões de navegação direta. |
| **Passagem de Plantão & Auditoria de Pendências** | ✅ 100% Concluído | Método SBAR, resumo de turno por IA e assinatura digital de entrega/recebimento. |
| **Ficha do Morador & Plano Terapêutico (PTS)** | ✅ 100% Concluído | Cadastro de acolhimento, metas de reabilitação e prontuário 360°. |
| **Guia Residencial Terapêutico (Manual SRT)** | ✅ 100% Concluído | Procedimentos e normas técnicas baseadas nas Portarias MS 106/2000 e RAPS. |
| **Escalas da Equipe da Casa (24/7)** | ✅ 100% Concluído | Gestão de plantões de cuidadores e equipe de enfermagem. |
| **Triagem NEWS2 & Alerta Sonoro Web Audio** | ✅ 100% Concluído | Identificação de descompensação clínica e alarme sonoro em tempo real. |
| **Sincronização Real-Time (Firestore)** | ✅ 100% Concluído | Persistência na nuvem com atualização instantânea entre dispositivos. |
| **Segurança LGPD & Logs de Auditoria** | ✅ 100% Concluído | Rastreabilidade total e proteção de dados sensíveis de saúde mental. |

---

## 🛠️ Arquitetura Tecnológica e Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    NexaMed Client (SPA)                     │
│  React 18 • TypeScript • Tailwind CSS • Lucide • Recharts  │
│  Service Worker (/sw.js) • Web Audio API • YouTube Embed   │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               │ REST / API Routes (/api/*)   │ SDK Real-Time
               ▼                              ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│   Node.js + Express Server   │ │     Firebase Firestore      │
│     (server.ts / .cjs)       │ │    (Sincronização Nuvem     │
│   • Endpoints Assistente     │ │     & Fallback Local)       │
│   • Proxy Google Gemini API  │ └────────────────────────────┘
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│      Google Gemini API       │
│      (@google/genai)         │
│  • gemini-2.5-flash / 3.7    │
└──────────────────────────────┘
```

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts.
- **Backend:** Node.js, Express, `esbuild` (compilação para arquivo único `dist/server.cjs`).
- **Inteligência Artificial:** Google Gemini API (`@google/genai` com modelos `gemini-2.5-flash` / `gemini-3.7-flash`).
- **Banco de Dados:** Firebase Firestore com sincronização em tempo real e fallback local offline.
- **Áudio e Background:** Service Worker PWA (`/sw.js`) e Web Audio API para alertas sonoros em tempo real.

---

## 📂 Estrutura de Diretórios e Arquivos

```text
├── public/
│   ├── favicon.svg                       # Ícone da aplicação
│   └── sw.js                             # Service Worker para alertas sonoros e PWA
├── src/
│   ├── components/
│   │   ├── AppSidebar.tsx                # Menu lateral estruturado para SRT
│   │   ├── CommandPaletteModal.tsx       # Paleta de busca e atalhos rápidos (⌘K / Ctrl+K)
│   │   ├── IoTVitalsTelemetryModal.tsx   # Telemetria e aferição de sinais vitais
│   │   ├── LGPDAndCookieManager.tsx      # Gerenciamento de consentimento e LGPD
│   │   ├── MedicationDashboardPanel.tsx  # Painel de aprazamento e checagem MAR
│   │   ├── MicroLearningPlayerModal.tsx  # Player do YouTube com capítulos e quiz
│   │   ├── NavbarHeader.tsx              # Barra de topo com relógio e alertas ativos
│   │   ├── NexaAssistantWidget.tsx       # Chatbot com respostas curtas e comandos diretos
│   │   ├── Resident360ViewModal.tsx      # Prontuário 360° unificado do morador
│   │   ├── ResidentDetailModal.tsx       # Ficha detalhada do morador e histórico
│   │   ├── ShiftSummaryWidget.tsx        # Resumo rápido para transmissão de plantão
│   │   ├── SmartHandoverModal.tsx        # Passagem de plantão com auditoria de pendências
│   │   ├── SOAPEditorModal.tsx           # Editor SOAP com sugestões do histórico e IA
│   │   └── TelehealthModal.tsx           # Teleconsulta integrada com CAPS
│   ├── data/
│   │   └── mockData.ts                   # Base inicial de moradores, escalas, MAR e módulos
│   ├── lib/
│   │   └── firebase.ts                   # Conexão Firestore e fallback de dados
│   ├── utils/
│   │   ├── news2Calculator.ts            # Motor de cálculo de risco NEWS2
│   │   ├── textParser.ts                 # Formatadores de texto e datas
│   │   └── youtubeUtils.ts               # Utilitários de extração e validação de vídeos YouTube
│   ├── views/
│   │   ├── AuthView.tsx                  # Tela de autenticação e perfis
│   │   ├── DailyHuddleView.tsx           # Daily Huddle Clínico de 5 min e capacitações
│   │   ├── DashboardView.tsx             # Dashboard principal do residencial
│   │   ├── EscalasView.tsx               # Escalas da equipe da casa (24/7)
│   │   ├── EvolucaoMedicacaoView.tsx     # Painel unificado de evolução e medicação
│   │   ├── MedicacaoView.tsx             # Grade MAR de aprazamento e estoque
│   │   ├── MicroLearningView.tsx         # Central de vídeos de treinamento em PT-BR
│   │   ├── PlantaoView.tsx               # Passagem de plantão e ocorrências
│   │   ├── ProntuariosView.tsx           # Prontuários eletrônicos e histórico
│   │   ├── RelatoriosView.tsx            # Relatórios gerenciais e indicadores
│   │   ├── ResidencialGuiaView.tsx       # Guia Residencial Terapêutico (Manual SRT)
│   │   └── ResidentesView.tsx            # Gestão de moradores e Plano Terapêutico (PTS)
│   ├── types.ts                          # Tipagens TypeScript completas da aplicação
│   ├── App.tsx                           # Roteamento e estado global da aplicação
│   ├── main.tsx                          # Ponto de entrada React
│   └── index.css                         # Estilos globais e Tailwind CSS
├── server.ts                             # Servidor Express com integração segura Gemini API
├── package.json                          # Scripts e dependências do projeto
├── tsconfig.json                         # Configuração do compilador TypeScript
└── vite.config.ts                        # Configuração de build do Vite
```

---

## 🔧 Instalação e Execução Local

### Pré-requisitos
- **Node.js**: Versão 18.x ou superior (Recomendado Node.js 20+ LTS).
- **NPM**: Versão 9.x ou superior.

### Passo a Passo

1. **Clonar o Repositório:**
   ```bash
   git clone https://github.com/SEU_USUARIO/nexamed-srt.git
   cd nexamed-srt
   ```

2. **Instalar as Dependências:**
   ```bash
   npm install
   ```

3. **Configurar as Variáveis de Ambiente:**
   Crie um arquivo `.env` na raiz do projeto:
   ```env
   GEMINI_API_KEY=sua_chave_do_google_gemini_aqui
   ```

4. **Executar em Modo de Desenvolvimento:**
   ```bash
   npm run dev
   ```
   Abra no navegador em: `http://localhost:3000`.

---

## ⚙️ Variáveis de Ambiente

| Variável | Tipo | Obrigatoriedade | Descrição |
| :--- | :---: | :---: | :--- |
| `GEMINI_API_KEY` | Backend (Segredo) | **Recomendado** | Chave da Google Gemini API para geração de resumos SOAP, respostas da assistente Nexa e síntese de vídeos. |
| `VITE_FIREBASE_PROJECT_ID` | Frontend (Público) | *Opcional* | ID do projeto Firebase para sincronização em nuvem. |
| `VITE_FIREBASE_API_KEY` | Frontend (Público) | *Opcional* | Chave pública do Firebase Web Client. |

---

## 🐙 Deploy e Integração Contínua (CI/CD)

### 1. Build de Produção
Para compilar o frontend estático e empacotar o servidor backend em um arquivo CommonJS unificado:
```bash
npm run build
```
O comando executa:
1. `vite build`: Gera os assets otimizados em `dist/`.
2. `esbuild server.ts`: Compila o servidor Express em `dist/server.cjs`.

Para iniciar o servidor em produção:
```bash
npm run start
```

### 2. Containerização Docker
A aplicação inclui suporte nativo para contêineres Docker:
```bash
# Compilar a imagem Docker
docker build -t nexamed-srt:latest .

# Executar o contêiner na porta 3000
docker run -d -p 3000:3000 -e GEMINI_API_KEY="sua_chave" --name nexamed nexamed-srt:latest
```

### 3. Deploy em Cloud (Google Cloud Run / Render / Fly.io)
- **Google Cloud Run:** Totalmente compatível com deploy serverless na porta 3000 (`0.0.0.0:3000`).
- **Render.com:** Conecte o repositório GitHub, selecione *Web Service*, configure o comando de build como `npm run build` e o comando de start como `npm run start`.
- **Fly.io:** Deploy direto via CLI executando `fly launch` seguido de `fly deploy`.

---

## 📦 Scripts Disponíveis no `package.json`

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor de desenvolvimento com TypeScript (`tsx server.ts`) na porta 3000. |
| `npm run build` | Compila o frontend Vite e empacota o backend com `esbuild` em `dist/server.cjs`. |
| `npm run start` | Executa o servidor de produção compilado via Node.js (`node dist/server.cjs`). |
| `npm run lint` | Executa o linter e checagem estática de tipos TypeScript (`tsc --noEmit`). |

---

## 📄 Licença

Este projeto é protegido e distribuído sob os termos da licença **MIT**. Consulte o arquivo de licença para mais detalhes.

---

<div align="center">
  <sub>Desenvolvido para fortalecer o cuidado humanizado, a cidadania e a segurança assistencial nos Serviços de Residência Terapêutica (SRT).</sub>
</div>
