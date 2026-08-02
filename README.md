# NexaMed — Plataforma de Gestão Clínica e Residências Terapêuticas

> Sistema inteligente e integrado para gestão de residências terapêuticas, clínicas de reabilitação e unidades de cuidados continuados. Desenvolvido para simplificar a rotina da equipe multiprofissional com auxílio de Inteligência Artificial e Banco de Dados em Tempo Real.

---

## 🚀 Principais Funcionalidades

### 🗄️ 1. Banco de Dados Persistente em Tempo Real (Firebase Firestore)
- **Persistência Permanente:** Todas as evoluções clínicas (SOAP), prontuários dos residentes, registros do cartão de medicação MAR e passagens de plantão são armazenadas no **Firebase Firestore**.
- **Sincronização em Tempo Real (`onSnapshot`):** Dados atualizados instantaneamente para toda a equipe, garantindo que mesmo ao sair do sistema ou fechar a sessão, todas as informações permanecem salvas e integradas.

### 💊 2. Protocolo Unificado de Aprazamento de 12 em 12 Horas (08:00h e 20:00h)
- **Horários Padronizados:** Todos os residentes das Residências Terapêuticas seguem a regra institucional de medicação a cada 12 horas, com aprazamento fixo para **08:00h (Diurno/Manhã)** e **20:00h (Noturno/Noite)**.
- **Inserção Rápida nas Evoluções SOAP:** Botão dedicado no editor SOAP para inclusão imediata da checagem das doses de 12/12h nos campos *Objetivo* e *Plano*.
- **Instrução Automática na IA:** Prompt do servidor configurado para sempre exigir e registrar a checagem das doses das 08h/20h nas evoluções geradas por inteligência artificial.
- **Banners e Indicadores Visuais:** Destaques institucionais na visão de Medicamentos (MAR), prontuários e alertas na Passagem de Plantão.

### 💬 3. Chatbot Assistente Nexa (IA)
- **Navegação & Explicação:** Esclarece dúvidas sobre a plataforma, direciona para telas e ensina onde encontrar qualquer comando ou funcionalidade.
- **Geração de Trabalhos:** Redige evoluções clínicas no padrão SOAP, elabora resumos executivos de plantão e analisa histórico de riscos de residentes.
- **Ações Executáveis:** Oferece botões interativos diretamente no chat para navegação rápida ou abertura de formulários.

### 📋 4. Passagem de Plantão & Passagem de Turno
- **Sintetização Automática com IA:** Compila ocorrências do dia/turno de forma concisa.
- **Registro de Ocorrências:** Cadastro rápido de eventos categorizados por prioridade (Alta, Média, Baixa) e rastreamento de pendências de medicação 12/12h.
- **Assinatura Digital & Ciente:** Log de controle do responsável técnico e equipe de enfermagem.

### 📊 5. Central de Relatórios & Intercorrências
- **Auditoria de Intercorrências:** Filtros por categoria (Queda, Sinais Vitais, Medicação, Comportamental) e prioridade.
- **Relatório Executivo IA:** Emissão de pareceres técnicos compilados para a coordenação médica e de enfermagem.
- **Adesão MAR:** Indicadores visuais do cumprimento da grade de medicação ministrada x pendente.

### 📈 6. Dashboard Clínico com Gráficos Recharts
- **Frequência de Ocorrências nos Últimos 7 Dias:** Gráfico de barras iterativo desenvolvido em **Recharts**, permitindo alternar entre visualização *Por Categoria* e *Evolução Diária*.
- **Métricas de Risco & Alertas:** Indicadores visuais em tempo real dos residentes críticos e pendências do plantão.

### 📝 7. Prontuários & Evoluções Clínicas (SOAP)
- Estrutura padronizada: **Subjetivo, Objetivo, Avaliação e Plano**.
- Assistente de IA para transformar notas em linguagem natural em um prontuário clínico formal integrado ao protocolo medicamentoso.

### 📅 8. Escalas da Equipe Multidisciplinar
- Organização dos turnos de trabalho (Manhã, Tarde, Noite, 12x36h) para Médicos, Enfermeiros, Psicólogos, Terapeutas e Cuidadores.

### 🔒 9. Conformidade LGPD & Gestão de Cookies
- **Banner de Consentimento:** Notificação interativa conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018) com salvamento em `localStorage`.
- **Direitos do Titular (Art. 18 LGPD):** Ferramenta de exportação e portabilidade de dados em JSON, solicitação de retificação e revogação de consentimento.
- **Tratamento de Dados de Saúde (Art. 11 LGPD):** Transparência no uso de prontuários eletrônicos em conformidade com as diretrizes do CFM e ANVISA.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** [React 18](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Banco de Dados & Real-Time:** [Firebase Firestore](https://firebase.google.com/docs/firestore)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Gráficos & Visualizações:** [Recharts](https://recharts.org/)
- **Ícones:** [Lucide React](https://lucide.dev/)
- **Backend & Servidor:** [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)
- **Inteligência Artificial:** SDK da API Gemini (`@google/genai`)

---

## 📂 Estrutura do Projeto

```text
├── src/
│   ├── components/       # Componentes reutilizáveis (Sidebar, Navbar, Chatbot Nexa, Modais SOAP/Plantão)
│   ├── views/            # Telas principais (Dashboard, Residentes, Relatórios, Plantão, Medicamentos, etc.)
│   ├── lib/              # Conexão e métodos de sincronização em tempo real do Firebase Firestore (`firebase.ts`)
│   ├── data/             # Dados iniciais/fallback e modelos da aplicação
│   ├── types.ts          # Definições de tipos e interfaces TypeScript
│   ├── App.tsx           # Componente raiz da aplicação integrado ao Firestore
│   └── main.tsx          # Ponto de entrada do React
├── server.ts             # Servidor Express com rotas de API e integração Gemini IA (Com suporte a prompt 12/12h)
├── firebase-blueprint.json # Schema das entidades do Firestore
├── firestore.rules       # Regras de segurança do Firestore
├── package.json          # Dependências e scripts de execução
├── vite.config.ts        # Configurações do Vite
└── .env.example          # Modelo de variáveis de ambiente
```

---

## 🔧 Como Executar o Projeto Localmente

### Pré-requisitos
- **Node.js** (versão 18 ou superior)
- **npm** ou **yarn** ou **bun**

### 1. Clonar o repositório
```bash
git clone https://github.com/seu-usuario/nexamed-plataforma.git
cd nexamed-plataforma
```

### 2. Instalar as dependências
```bash
npm install
```

### 3. Configurar as variáveis de ambiente e segurança do Firebase
Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`:
```bash
cp .env.example .env
```
Adicione as credenciais e chaves do sistema no arquivo `.env`:
```env
# Gemini API Key (Backend)
GEMINI_API_KEY=sua_chave_gemini_aqui

# Firebase Configuration (Variáveis de Ambiente / GitHub Secrets)
VITE_FIREBASE_PROJECT_ID=peta-sanctuary-898sv
VITE_FIREBASE_APP_ID=seu_app_id
VITE_FIREBASE_API_KEY=sua_chave_firebase_api
VITE_FIREBASE_AUTH_DOMAIN=peta-sanctuary-898sv.firebaseapp.com
VITE_FIREBASE_FIRESTORE_DATABASE_ID=ai-studio-nexamed-422bddbb-d440-4749-9e00-30c11a5ae67c
VITE_FIREBASE_STORAGE_BUCKET=peta-sanctuary-898sv.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_messaging_sender_id
```

> 🔒 **Nota de Segurança:** O arquivo `firebase-applet-config.json` e arquivos `.env` foram adicionados ao `.gitignore` para impedir que credenciais sensíveis sejam commitadas no GitHub. O código da aplicação (`src/lib/firebase.ts`) lê as configurações via variáveis de ambiente de forma segura e com fallback para o ambiente de desenvolvimento local.

### 4. Iniciar o servidor de desenvolvimento
```bash
npm run dev
```
O aplicativo estará disponível em `http://localhost:3000`.

---

## 📦 Scripts Disponíveis

- `npm run dev`: Inicia o servidor de desenvolvimento com hot-reload.
- `npm run build`: Compila a aplicação frontend e o servidor Node.js para produção na pasta `dist/`.
- `npm run start`: Inicia o servidor compilado em ambiente de produção (`node dist/server.cjs`).
- `npm run lint`: Executa a verificação de tipos com o TypeScript (`tsc --noEmit`).

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
