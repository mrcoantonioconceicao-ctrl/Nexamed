# NexaMed — Plataforma de Gestão Clínica e Residências Terapêuticas

> Sistema inteligente e integrado para gestão de residências terapêuticas, clínicas de reabilitação e unidades de cuidados continuados. Desenvolvido para simplificar a rotina da equipe multiprofissional com auxílio de Inteligência Artificial.

---

## 🚀 Principais Funcionalidades

### 💬 1. Chatbot Assistente Nexa (IA)
- **Navegação & Explicação:** Esclarece dúvidas sobre a plataforma, direciona para telas e ensina onde encontrar qualquer comando ou funcionalidade.
- **Geração de Trabalhos:** Redige evoluções clínicas no padrão SOAP, elabora resumos executivos de plantão e analisa histórico de riscos de residentes.
- **Ações Executáveis:** Oferece botões interativos diretamente no chat para navegação rápida ou abertura de formulários.

### 📋 2. Passagem de Plantão & Passagem de Turno
- **Sintetização Automática com IA:** Compila ocorrências do dia/turno de forma concisa.
- **Registro de Ocorrências:** Cadastro rápido de eventos categorizados por prioridade (Alta, Média, Baixa).
- **Assinatura Digital & Ciente:** Log de controle do responsável técnico e equipe de enfermagem.

### 📊 3. Central de Relatórios & Intercorrências
- **Auditoria de Intercorrências:** Filtros por categoria (Queda, Sinais Vitais, Medicação, Comportamental) e prioridade.
- **Relatório Executivo IA:** Emissão de pareceres técnicos compilados para a coordenação médica e de enfermagem.
- **Adesão MAR:** Indicadores visuais do cumprimento da grade de medicação ministrada x pendente.

### 📈 4. Dashboard Clínico com Gráficos Recharts
- **Frequência de Ocorrências nos Últimos 7 Dias:** Gráfico de barras iterativo desenvolvido em **Recharts**, permitindo alternar entre visualização *Por Categoria* e *Evolução Diária*.
- **Métricas de Risco & Alertas:** Indicadores visuais em tempo real dos residentes críticos e pendências do plantão.

### 📝 5. Prontuários & Evoluções Clínicas (SOAP)
- Estrutura padronizada: **Subjetivo, Objetivo, Avaliação e Plano**.
- Assistente de IA para transformar notas em linguagem natural em um prontuário clínico formal.

### 💊 6. Aprazamento de Medicamentos (MAR)
- Controle de horários e checagem de ministração de medicamentos por turno.
- Destaque automático para medicamentos psicotrópicos controlados com checagem dupla.

### 📅 7. Escalas da Equipe Multidisciplinar
- Organização dos turnos de trabalho (Manhã, Tarde, Noite, 12x36h) para Médicos, Enfermeiros, Psicólogos, Terapeutas e Cuidadores.

### 🔒 8. Conformidade LGPD & Gestão de Cookies
- **Banner de Consentimento:** Notificação interativa conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018) com salvamento em `localStorage`.
- **Direitos do Titular (Art. 18 LGPD):** Ferramenta de exportação e portabilidade de dados em JSON, solicitação de retificação e revogação de consentimento.
- **Tratamento de Dados de Saúde (Art. 11 LGPD):** Transparência no uso de prontuários eletrônicos em conformidade com as diretrizes do CFM e ANVISA.
- **Contato do DPO:** Encarregado pelo tratamento de dados pessoais diretamente acessível pelo painel.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** [React 18](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Gráficos & Visualizações:** [Recharts](https://recharts.org/)
- **Ícones:** [Lucide React](https://lucide.dev/)
- **Backend & Servidor:** [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)
- **Inteligência Artificial:** SDK da API Gemini (`@google/genai`)

---

## 📂 Estrutura do Projeto

```text
├── src/
│   ├── components/       # Componentes reutilizáveis (Sidebar, Navbar, Chatbot Nexa, Modais)
│   ├── views/            # Telas principais (Dashboard, Residentes, Relatórios, Plantão, etc.)
│   ├── data/             # Dados mock e inicializadores de estado
│   ├── types.ts          # Definições de tipos e interfaces TypeScript
│   ├── App.tsx           # Componente raiz da aplicação
│   └── main.tsx          # Ponto de entrada do React
├── server.ts             # Servidor Express com rotas de API e integração Gemini IA
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

### 3. Configurar as variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`:
```bash
cp .env.example .env
```
Adicione sua chave da API Gemini no arquivo `.env`:
```env
GEMINI_API_KEY=sua_chave_gemini_aqui
```

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
