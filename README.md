# 🏠 NexaMed — Plataforma de Gestão Especializada em Residências Terapêuticas (SRT)

> **Plataforma de Gestão Técnica e Assistencial para Serviços de Residência Terapêutica (SRT Tipo I e Tipo II)** com Inteligência Artificial Clínica (Gemini API), Sincronização Real-Time (Firebase Firestore), Aprazamento Medicamentoso por Turnos (MAR), Sugestões Inteligentes no Prontuário SOAP baseadas no Histórico do Morador, Guia Operacional Normativo (Portaria MS/GM nº 106/2000 & RAPS), Calculadora NEWS2, Service Worker com Notificações e Alerta Sonoro de Emergência em Background, e Conformidade LGPD/HIPAA.

---

## 📌 Sumário

1. [Visão Geral e Foco em Residência Terapêutica](#-visão-geral-e-foco-em-residência-terapêutica)
2. [Conformidade Legal e Normas Técnicas (MS/SUS)](#-conformidade-legal-e-normas-técnicas-mssus)
3. [Módulos Principais & Funcionalidades](#-módulos-principais--funcionalidades)
   - [1. Prontuário Eletrônico SOAP com Sugestões Inteligentes de Histórico](#1-prontuário-eletrônico-soap-com-sugestões-inteligentes-de-histórico)
   - [2. Assistente Técnica Nexa (Respostas Curtas e Objetivas)](#2-assistente-técnica-nexa-respostas-curtas-e-objetivas)
   - [3. Gestão de Moradores & Plano Terapêutico Singular (PTS)](#3-gestão-de-moradores--plano-terapêutico-singular-pts)
   - [4. Aprazamento e Checagem de Medicação (MAR - 12/12h)](#4-aprazamento-e-checagem-de-medicação-mar---1212h)
   - [5. Passagem de Plantão & Auditoria de Pendências (Smart Handover)](#5-passagem-de-plantão--auditoria-de-pendências-smart-handover)
   - [6. Guia Residencial Terapêutico (Manual Técnico & Operacional)](#6-guia-residencial-terapêutico-manual-técnico--operacional)
   - [7. Escalas de Cuidadores, Enfermagem e Equipe Multidisciplinar](#7-escalas-de-cuidadores-enfermagem-e-equipe-multidisciplinar)
   - [8. Triagem NEWS2, Telemetria e Alerta Sonoro de Emergência](#8-triagem-news2-telemetria-e-alerta-sonoro-de-emergência)
   - [9. Relatórios Gerenciais, Ocorrências e Indicadores SRT](#9-relatórios-gerenciais-ocorrências-e-indicadores-srt)
   - [10. Segurança, Privacidade, LGPD e Logs de Auditoria](#10-segurança-privacidade-lgpd-e-logs-de-auditoria)
4. [📊 Status dos Módulos SRT](#-status-dos-módulos-srt)
5. [🛠️ Arquitetura Tecnológica](#️-arquitetura-tecnológica)
6. [📂 Estrutura de Arquivos da Aplicação](#-estrutura-de-arquivos-da-aplicação)
7. [🔧 Como Executar Localmente](#-como-executar-localmente)
8. [⚙️ Variáveis de Ambiente](#️-variáveis-de-ambiente)
9. [🐙 Guia de Deploy e Versionamento](#-guia-de-deploy-e-versionamento)
10. [📄 Licença](#-licença)

---

## 🏠 Visão Geral e Foco em Residência Terapêutica

O **NexaMed** foi reestruturado e otimizado para atender de forma **exclusiva e especializada** os **Serviços de Residência Terapêutica (SRT - Tipo I e Tipo II)**, garantindo conformidade estrita com as diretrizes do Ministério da Saúde e da Rede de Atenção Psicossocial (RAPS).

O sistema abandona estruturas hospitalares generalistas ou burocracias corporativas para focar 100% no **cuidado residencial, na reabilitação psicossocial, na autonomia dos moradores e na segurança do acompanhamento medicamentoso e clínico**.

---

## 📜 Conformidade Legal e Normas Técnicas (MS/SUS)

- **Portaria MS/GM nº 106/2000:** Regulamentação dos Serviços de Residência Terapêutica no âmbito do SUS.
- **Portaria MS/GM nº 3.088/2011:** Instituição da Rede de Atenção Psicossocial (RAPS).
- **Lei nº 10.216/2001 (Reforma Psiquiátrica):** Proteção e os direitos das pessoas portadoras de transtornos mentais e redirecionamento do modelo assistencial.
- **RDC ANVISA nº 50/2002:** Normas para estabelecimentos assistenciais de saúde.
- **Resolução COFEN nº 564/2017 & COFEN nº 681/2021:** Registros de enfermagem em prontuário eletrônico e aplicação da metodologia SOAP.

---

## 🚀 Módulos Principais & Funcionalidades

### 1. Prontuário Eletrônico SOAP com Sugestões Inteligentes de Histórico
- **Editor Modal de Evolução SOAP:** Interface focada em agilidade e precisão para registro de evoluções técnicas (*Subjetivo, Objetivo, Avaliação, Plano*).
- **Sugestões Inteligentes Focadas no Histórico do Morador:**
  - O sistema analisa evoluções anteriores registradas especificamente para o morador selecionado.
  - Exibe um painel de **"Sugestões Inteligentes do Histórico"** com um clique direto para reaproveitamento de padrões de conduta, queixas subjetivas recorrentes ou padrões de resposta ao PTS.
  - Reduz drasticamente o tempo de digitação da equipe de cuidadores, técnicos e enfermeiros.
- **Gerador Automático Nexa (Gemini IA):** Botão para estruturação instantânea de notas brutas em linguagem natural para a norma SOAP padronizada.

### 2. Assistente Técnica Nexa (Respostas Curtas e Objetivas)
- **Engine Redesenhada no Backend (`server.ts`):** A assistente virtual Nexa foi programada com diretrizes estritas para fornecer **respostas extremamente curtas, diretas e objetivas** (máximo de 2 a 3 tópicos práticos), eliminando enrolação.
- **Foco Exclusivo em SRT:** Especializada na rotina de Residências Terapêuticas (reabilitação, reinserção comunitária, PTS e medicação assistida).
- **Ações Executáveis Diretas (Actions):** Toda resposta traz botões de navegação e execução direta de comandos (ex: *Abrir Editor SOAP*, *Ver Aprazamento 12/12h*, *Ver Residentes*).

### 3. Gestão de Moradores & Plano Terapêutico Singular (PTS)
- **Ficha Completa do Morador:** Cadastro com foto, idade, grau de dependência (Grau I, II ou III), CAPS de referência, contato da rede de apoio e diagnóstico principal.
- **Plano Terapêutico Singular (PTS):** Monitoramento das metas de autonomia, reinserção comunitária, oficinas, convivência e acompanhamento no CAPS.
- **Prontuário 360°:** Visão holística reunindo histórico de sinais vitais, linha do tempo de intercorrências, cartão de medicação e evoluções anteriores.

### 4. Aprazamento e Checagem de Medicação (MAR - 12/12h)
- **Esquema Padronizado 12/12h (08:00h e 20:00h):** Visão rápida da administração de psicotrópicos e fármacos contínuos.
- **Confirmação e Justificativas Rápidas:**
  - **Ministrado (100%):** Dar baixa imediata com um clique e atualização em tempo real do estoque.
  - **Parcial:** Registro de ingestão parcial com motivos pré-formatados.
  - **Recusa:** Registro formal de recusa comportamental ou clínica para notificação à equipe médica do CAPS.
- **Dupla Checagem:** Destaque visual diferenciado para medicamentos de alta vigilância / Portaria 344.

### 5. Passagem de Plantão & Auditoria de Pendências (Smart Handover)
- **Sintetizador com IA Nexa:** Resumo automático e objetivo das ocorrências das últimas 12 horas.
- **Auditoria de Pendências:** Verificação imediata de medicações não checadas ou ausência de evolução diária antes do encerramento do turno.
- **Assinatura Digital de Plantão:** Registro imutável de quem entregou e quem assumiu o turno com timestamp e código de confirmação.

### 6. Guia Residencial Terapêutico (Manual Técnico & Operacional)
- **Manual de Procedimentos SRT:** Guia de referência rápida integrado ao sistema para consulta de cuidadores e técnicos.
- **Seções Normativas:**
  - Convivência, Direitos e Autonomia dos Moradores.
  - Administração Segura de Medicamentos e Armazenamento.
  - Sinais de Alerta e Manejo de Crises Psiquiátricas.
  - Articulação com a RAPS, CAPS e Atenção Básica (UBS).

### 7. Escalas de Cuidadores, Enfermagem e Equipe Multidisciplinar
- **Gestão de Turnos 24/7:** Programação visual de escalas de cuidadores de saúde mental, técnicos de enfermagem, enfermeiros RT e acompanhantes terapêuticos.
- **Controle de Folgas e Substituições:** Prevenção de desfalques na cobertura da residência.

### 8. Triagem NEWS2, Telemetria e Alerta Sonoro de Emergência
- **EscalaNEWS2 Integrada:** Cálculo automatizado do score fisiológico em tempo real.
- **Service Worker (`/sw.js`) & Alerta Sonoro:** Emite bipe cirúrgico duplo em tempo real (Web Audio API) e notificação push caso o status de um morador mude para 'Crítico'.

### 9. Relatórios Gerenciais, Ocorrências e Indicadores SRT
- **Central de Relatórios:** Análise visual de ocorrências por tipo (quedas, recusa medicamentosa, alteração de comportamento, emergências clínicas).
- **Exportação e Parecer Executivo:** Gerador de parecer técnico simplificado para apresentação à coordenação de saúde mental do município.

### 10. Segurança, Privacidade, LGPD e Logs de Auditoria
- **LGPD & HIPAA Compliance:** Ferramenta de exportação de dados do titular, consentimento transparente e gerenciamento de cookies.
- **Logs de Auditoria Rastreáveis:** Registro imutável de leituras, edições e cadastros com identificação de usuário, função e IP.

---

## 📊 Status dos Módulos SRT

| Módulo / Funcionalidade | Status | Aplicação na Residência Terapêutica |
| :--- | :---: | :--- |
| **Prontuário SOAP com Sugestões do Histórico** | ✅ 100% Concluído | Agiliza o preenchimento reaproveitando histórico anterior do morador. |
| **Assistente Nexa (Curta & Objetiva)** | ✅ 100% Concluído | Respostas diretas ao ponto, sem prolixidade, focadas na rotina da SRT. |
| **Aprazamento MAR (12/12h)** | ✅ 100% Concluído | Controle rigoroso da medicação assitida de uso contínuo e psicotrópicos. |
| **Passagem de Plantão Inteligente** | ✅ 100% Concluído | Troca de turno com checagem de pendências e assinatura dos cuidadores. |
| **Guia Residencial Terapêutico** | ✅ 100% Concluído | Manual normativo técnico baseado nas Portarias MS 106/2000 e RAPS. |
| **Ficha do Morador & PTS** | ✅ 100% Concluído | Acompanhamento da evolução de autonomia e projetos do morador. |
| **Escalas da Equipe Multidisciplinar** | ✅ 100% Concluído | Garantia da cobertura 24h por cuidadores e equipe de enfermagem. |
| **Triagem NEWS2 & Alerta Sonoro** | ✅ 100% Concluído | Monitoramento de descompensação clínica com alarme em background. |
| **Persistência Real-Time (Firestore)** | ✅ 100% Concluído | Sincronização automática entre computadores/tablets da casa. |
| **Gestão LGPD & Auditoria** | ✅ 100% Concluído | Proteção total de dados sensíveis de saúde mental. |

---

## 🛠️ Arquitetura Tecnológica

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS.
- **Backend Servidor:** Node.js, Express, `esbuild` (Compilação para `dist/server.cjs`).
- **Engine de IA:** Google Gemini API (`@google/genai` com modelo `gemini-3.6-flash`).
- **Banco de Dados:** Firebase Firestore Real-Time com Fallback Local Inteligente.
- **Background Worker & Som:** Service Worker PWA nativo (`/sw.js`) e Web Audio API.
- **Gráficos:** Recharts.
- **Ícones:** Lucide React.

---

## 📂 Estrutura de Arquivos da Aplicação

```text
├── public/
│   └── sw.js                             # Service Worker de Notificações e PWA
├── src/
│   ├── components/
│   │   ├── SOAPEditorModal.tsx           # Editor SOAP com Sugestões Inteligentes do Histórico
│   │   ├── NexaAssistantWidget.tsx       # Chatbot e Assistente IA com Respostas Objetivas
│   │   ├── SmartHandoverModal.tsx        # Troca de Plantão e Auditoria de Pendências
│   │   ├── MedicationDashboardPanel.tsx  # Checagem de Medicação por Turno (MAR)
│   │   ├── ShiftSummaryWidget.tsx        # Resumo Rápido para Transmissão de Plantão
│   │   ├── Resident360ViewModal.tsx      # Modal Prontuário 360° do Morador
│   │   ├── ResidentDetailModal.tsx       # Detalhes e Ficha Rápida
│   │   ├── NavbarHeader.tsx              # Barra Superior e Alertas Ativos
│   │   ├── AppSidebar.tsx                # Navegação Lateral Ajustada para SRT
│   │   ├── CommandPaletteModal.tsx       # Paleta de Comandos (⌘K)
│   │   ├── IoTVitalsTelemetryModal.tsx   # Telemetria de Sinais Vitais Beira-Leito
│   │   ├── TelehealthModal.tsx           # Módulo de Telemedicina / Teleconsulta CAPS
│   │   └── LGPDAndCookieManager.tsx      # Gerenciador de Consentimento LGPD
│   ├── views/
│   │   ├── DashboardView.tsx             # Dashboard Residencial Principal
│   │   ├── ResidentesView.tsx            # Gestão de Moradores e PTS
│   │   ├── ProntuariosView.tsx           # Prontuários e Evoluções Clínicas
│   │   ├── EvolucaoMedicacaoView.tsx     # Painel Unificado de Evolução e Medicação
│   │   ├── MedicacaoView.tsx             # Grade MAR de Aprazamento
│   │   ├── PlantaoView.tsx               # Passagem de Turno e Ocorrências
│   │   ├── RelatoriosView.tsx            # Central de Relatórios e Análise de Ocorrências
│   │   ├── EscalasView.tsx               # Escalas da Equipe da Casa
│   │   ├── ResidencialGuiaView.tsx       # Guia Residencial Terapêutico (Manual SRT)
│   │   └── AuthView.tsx                  # Login e Segurança
│   ├── lib/
│   │   └── firebase.ts                   # Sincronização Firestore Real-Time
│   ├── utils/
│   │   ├── news2Calculator.ts            # Calculadora de RiscoNEWS2
│   │   └── textParser.ts                 # Utilitários de Tratamento de Texto
│   ├── types.ts                          # Tipagens Globais da Aplicação
│   ├── App.tsx                           # Componente Principal e Rotas SRT
│   ├── main.tsx                          # Bootstrap React
│   └── index.css                         # CSS Global com Tailwind
├── server.ts                             # Servidor Express com Endpoints da IA Nexa
├── package.json                          # Dependências e Scripts
├── tsconfig.json                         # Configuração do Compilador TypeScript
└── vite.config.ts                        # Configuração do Vite
```

---

## 🔧 Como Executar Localmente

### 1. Clonar e Instalar
```bash
git clone https://github.com/SEU_USUARIO/nexamed-srt.git
cd nexamed-srt
npm install
```

### 2. Configurar Variáveis de Ambiente
Crie o arquivo `.env` na raiz:
```env
GEMINI_API_KEY=sua_chave_gemini_aqui
```

### 3. Iniciar a Aplicação
```bash
npm run dev
```
Acesse no navegador: `http://localhost:3000`.

---

## ⚙️ Variáveis de Ambiente

| Variável | Obrigatoriedade | Descrição |
| :--- | :---: | :--- |
| `GEMINI_API_KEY` | Recomendado | Chave de API do Google Gemini para respostas da Nexa IA e geração de SOAP. |
| `VITE_FIREBASE_PROJECT_ID` | Opcional | ID do projeto Firebase para sincronização real-time. |
| `VITE_FIREBASE_API_KEY` | Opcional | Chave de API do Firebase. |

---

## 📦 Scripts Disponíveis

- `npm run dev`: Executa a aplicação em modo de desenvolvimento na porta 3000.
- `npm run build`: Gera o build estático do Vite e agrupa o servidor em `dist/server.cjs`.
- `npm run start`: Inicia o servidor em produção executando `node dist/server.cjs`.
- `npm run lint`: Executa a validação de tipos TypeScript (`tsc --noEmit`).

---

## 📄 Licença

Este projeto é protegido e distribuído sob a Licença **MIT**.
