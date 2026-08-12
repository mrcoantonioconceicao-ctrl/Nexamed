import React, { useState } from 'react';
import { 
  Rocket, 
  X, 
  CheckCircle2, 
  Copy, 
  Check, 
  Terminal, 
  Server, 
  Cloud, 
  ShieldCheck, 
  Activity, 
  Cpu, 
  RefreshCw,
  ExternalLink,
  Code2
} from 'lucide-react';

interface AutoDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AutoDeployModal: React.FC<AutoDeployModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [healthStatus, setHealthStatus] = useState<'idle' | 'checking' | 'ok' | 'error'>('idle');
  const [healthDetails, setHealthDetails] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'docker' | 'github' | 'cloudrun' | 'render'>('docker');

  if (!isOpen) return null;

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const checkHealth = async () => {
    setHealthStatus('checking');
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setHealthDetails(data);
        setHealthStatus('ok');
      } else {
        setHealthStatus('error');
      }
    } catch {
      setHealthStatus('error');
    }
  };

  const dockerCommands = [
    {
      title: '1. Build da Imagem Docker de Produção',
      cmd: 'docker build -t nexamed-platform:latest .'
    },
    {
      title: '2. Execução do Contêiner na Porta 3000',
      cmd: 'docker run -d -p 3000:3000 -e NODE_ENV=production -e GEMINI_API_KEY="sua_chave" nexamed-platform:latest'
    },
    {
      title: '3. Verificação de Saúde (Health Check)',
      cmd: 'curl http://localhost:3000/api/health'
    }
  ];

  const cloudRunCommands = [
    {
      title: '1. Build e Tag da Imagem no Google Artifact Registry / GCR',
      cmd: 'gcloud builds submit --tag gcr.io/SEU_PROJETO_GCP/nexamed-platform:latest .'
    },
    {
      title: '2. Implantação Direta no Cloud Run',
      cmd: 'gcloud run deploy nexamed-platform --image gcr.io/SEU_PROJETO_GCP/nexamed-platform:latest --platform managed --region us-east1 --allow-unauthenticated --port 3000'
    }
  ];

  return (
    <div className="fixed inset-0 bg-zinc-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-zinc-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-teal-950 to-zinc-900 text-white flex items-center justify-between shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center shrink-0">
              <Rocket className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-teal-800/80 text-teal-200 px-2 py-0.5 rounded border border-teal-600/50">
                  Deploy Automático & CI/CD
                </span>
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Pronto para Produção
                </span>
              </div>
              <h2 className="text-lg font-black text-white tracking-tight">
                Preparação e Implantação da Plataforma
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors relative z-10"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">

          {/* Infrastructure Readiness Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 flex items-center gap-3">
              <div className="p-2 bg-emerald-500 text-white rounded-xl shrink-0">
                <Server className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-emerald-900 uppercase tracking-wide">Dockerfile</p>
                <p className="text-xs text-emerald-700 font-extrabold">Multi-Stage Ready</p>
              </div>
            </div>

            <div className="p-3 bg-teal-50/70 rounded-2xl border border-teal-200/80 flex items-center gap-3">
              <div className="p-2 bg-teal-600 text-white rounded-xl shrink-0">
                <Code2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-teal-900 uppercase tracking-wide">CI/CD Pipeline</p>
                <p className="text-xs text-teal-700 font-extrabold">GitHub Actions</p>
              </div>
            </div>

            <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-200/80 flex items-center gap-3">
              <div className="p-2 bg-blue-600 text-white rounded-xl shrink-0">
                <Cloud className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-blue-900 uppercase tracking-wide">Nuvem Alvo</p>
                <p className="text-xs text-blue-700 font-extrabold">Cloud Run / Render</p>
              </div>
            </div>

            <div className="p-3 bg-indigo-50/70 rounded-2xl border border-indigo-200/80 flex items-center gap-3">
              <div className="p-2 bg-indigo-600 text-white rounded-xl shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-indigo-900 uppercase tracking-wide">Segurança</p>
                <p className="text-xs text-indigo-700 font-extrabold">Non-Root Node20</p>
              </div>
            </div>
          </div>

          {/* Live API Health Check Tool */}
          <div className="p-4 bg-zinc-900 text-zinc-100 rounded-2xl border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-400" />
                <span className="text-xs font-bold text-zinc-200">Teste de API Healthcheck Server-Side</span>
              </div>
              <button
                onClick={checkHealth}
                disabled={healthStatus === 'checking'}
                className="px-3 py-1 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${healthStatus === 'checking' ? 'animate-spin' : ''}`} />
                <span>{healthStatus === 'checking' ? 'Testando...' : 'Testar /api/health'}</span>
              </button>
            </div>

            {healthStatus === 'ok' && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-800/80 rounded-xl text-xs space-y-1 text-emerald-300">
                <div className="flex items-center gap-2 font-bold text-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>API Ativa e Respondendo com Sucesso!</span>
                </div>
                {healthDetails && (
                  <pre className="text-[11px] font-mono text-emerald-400/90 pt-1">
                    {JSON.stringify(healthDetails, null, 2)}
                  </pre>
                )}
              </div>
            )}

            {healthStatus === 'error' && (
              <div className="p-3 bg-rose-950/80 border border-rose-800/80 rounded-xl text-xs text-rose-300 font-medium">
                Falha ao comunicar com /api/health. Verifique se o servidor está em execução.
              </div>
            )}
          </div>

          {/* Deploy Target Tabs */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-zinc-200 pb-2">
              <button
                onClick={() => setActiveTab('docker')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                  activeTab === 'docker'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Docker Local / VPS</span>
              </button>

              <button
                onClick={() => setActiveTab('github')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                  activeTab === 'github'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>GitHub Actions CI/CD</span>
              </button>

              <button
                onClick={() => setActiveTab('cloudrun')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                  activeTab === 'cloudrun'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                <Cloud className="w-3.5 h-3.5" />
                <span>Google Cloud Run</span>
              </button>

              <button
                onClick={() => setActiveTab('render')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                  activeTab === 'render'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Render / Fly.io</span>
              </button>
            </div>

            {/* Tab Contents */}
            {activeTab === 'docker' && (
              <div className="space-y-3">
                <p className="text-xs text-zinc-600 font-medium">
                  Comandos para compilar e executar o contêiner isolado em qualquer servidor Docker:
                </p>
                {dockerCommands.map((item, idx) => (
                  <div key={idx} className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-1.5">
                    <p className="text-[11px] font-bold text-teal-400">{item.title}</p>
                    <div className="flex items-center justify-between gap-2">
                      <code className="text-xs font-mono text-zinc-200 select-all overflow-x-auto">
                        {item.cmd}
                      </code>
                      <button
                        onClick={() => copyToClipboard(item.cmd, idx)}
                        className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors shrink-0"
                        title="Copiar comando"
                      >
                        {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'github' && (
              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-3 text-xs text-zinc-700">
                <div className="flex items-center gap-2 text-zinc-900 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Pipeline Automático Configurado em <code className="bg-zinc-200 px-1.5 py-0.5 rounded">.github/workflows/deploy.yml</code></span>
                </div>
                <p className="leading-relaxed">
                  Basta fazer o envio (<code className="bg-zinc-200 px-1 rounded">git push origin main</code>) para acionar os testes automatizados, build estático, compilação do servidor Express em CommonJS e publicação.
                </p>
                <div className="p-3 bg-white rounded-xl border border-zinc-200 space-y-1 font-mono text-[11px] text-zinc-800">
                  <p className="text-emerald-700 font-bold">Secrets necessários no repositório do GitHub:</p>
                  <p>• <code>GCP_PROJECT_ID</code>: ID do Projeto no Google Cloud</p>
                  <p>• <code>GCP_SA_KEY</code>: Chave JSON da Service Account com permissão de Cloud Run Admin</p>
                </div>
              </div>
            )}

            {activeTab === 'cloudrun' && (
              <div className="space-y-3">
                <p className="text-xs text-zinc-600 font-medium">
                  Comandos para implantar diretamente no Google Cloud Run usando o <code className="font-mono bg-zinc-100 px-1 rounded">gcloud SDK</code>:
                </p>
                {cloudRunCommands.map((item, idx) => (
                  <div key={idx + 10} className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-1.5">
                    <p className="text-[11px] font-bold text-teal-400">{item.title}</p>
                    <div className="flex items-center justify-between gap-2">
                      <code className="text-xs font-mono text-zinc-200 select-all overflow-x-auto">
                        {item.cmd}
                      </code>
                      <button
                        onClick={() => copyToClipboard(item.cmd, idx + 10)}
                        className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors shrink-0"
                        title="Copiar comando"
                      >
                        {copiedIndex === (idx + 10) ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'render' && (
              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-3 text-xs text-zinc-700">
                <p className="font-bold text-zinc-900">
                  Arquivos de Implantação 1-Clique incluídos no projeto:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-zinc-900">Render Blueprint:</span> <code className="bg-zinc-200 px-1 rounded">render.yaml</code> detecta automaticamente o contêiner Docker e o endpoint de healthcheck <code className="bg-zinc-200 px-1 rounded">/api/health</code>.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-zinc-900">Fly.io Setup:</span> <code className="bg-zinc-200 px-1 rounded">fly.toml</code> configurado para implantação rápida na porta 3000 com verificação HTTP automática.
                    </div>
                  </li>
                </ul>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-zinc-500 font-medium flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Estrutura compilada e validada em TypeScript
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors"
          >
            Entendido & Concluir
          </button>
        </div>

      </div>
    </div>
  );
};
