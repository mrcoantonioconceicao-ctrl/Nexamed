import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Cookie, 
  X, 
  Check, 
  Lock, 
  FileText, 
  Download, 
  Trash2, 
  Mail, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  Info
} from 'lucide-react';

interface LGPDPreferences {
  essential: boolean; // Always true
  analytics: boolean;
  performance: boolean;
  acceptedAt: string | null;
}

interface LGPDAndCookieManagerProps {
  isOpenModal: boolean;
  onCloseModal: () => void;
}

export const LGPDAndCookieManager: React.FC<LGPDAndCookieManagerProps> = ({
  isOpenModal,
  onCloseModal,
}) => {
  const [showBanner, setShowBanner] = useState(false);
  const [activeTab, setActiveTab] = useState<'cookies' | 'direitos' | 'dpo' | 'termos'>('cookies');
  const [preferences, setPreferences] = useState<LGPDPreferences>({
    essential: true,
    analytics: true,
    performance: true,
    acceptedAt: null,
  });
  const [requestStatus, setRequestStatus] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('nexamed_lgpd_consent');
    if (saved) {
      try {
        setPreferences(JSON.parse(saved));
      } catch (e) {
        setShowBanner(true);
      }
    } else {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const newPref: LGPDPreferences = {
      essential: true,
      analytics: true,
      performance: true,
      acceptedAt: new Date().toISOString(),
    };
    setPreferences(newPref);
    localStorage.setItem('nexamed_lgpd_consent', JSON.stringify(newPref));
    setShowBanner(false);
  };

  const handleAcceptEssentialOnly = () => {
    const newPref: LGPDPreferences = {
      essential: true,
      analytics: false,
      performance: false,
      acceptedAt: new Date().toISOString(),
    };
    setPreferences(newPref);
    localStorage.setItem('nexamed_lgpd_consent', JSON.stringify(newPref));
    setShowBanner(false);
  };

  const handleSaveCustomPreferences = () => {
    const newPref: LGPDPreferences = {
      ...preferences,
      acceptedAt: new Date().toISOString(),
    };
    setPreferences(newPref);
    localStorage.setItem('nexamed_lgpd_consent', JSON.stringify(newPref));
    setShowBanner(false);
    onCloseModal();
  };

  const handleDataExport = () => {
    setRequestStatus('Iniciando exportação segura de dados anonimizados em formato JSON...');
    setTimeout(() => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
        plataforma: "NexaMed Saúde & Residências Terapêuticas",
        lgpd_artigo: "Art. 18, V - Portabilidade de dados",
        data_solicitacao: new Date().toLocaleString('pt-BR'),
        status_consentimento: preferences,
        dpo_responsavel: "dpo@nexamed.com.br",
        regulamento: "Lei Geral de Proteção de Dados (Lei nº 13.709/2018)"
      }, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `nexamed_lgpd_portabilidade_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setRequestStatus('Exportação concluída com sucesso!');
    }, 1200);
  };

  const handleRevokeConsent = () => {
    setRequestStatus('Consentimento revogado. Retendo apenas dados essenciais exigidos por norma sanitária (ANVISA/CFM).');
    handleAcceptEssentialOnly();
  };

  return (
    <>
      {/* 1. Bottom Cookie Consent Banner (LGPD) */}
      {showBanner && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-zinc-900/95 text-white border-t border-teal-500/30 backdrop-blur-md shadow-2xl animate-in slide-in-from-bottom duration-300">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-teal-500/20 text-teal-400 rounded-xl border border-teal-500/30 mt-0.5 shrink-0">
                <Cookie className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-teal-300">
                    Proteção de Dados & Cookies (LGPD - Lei nº 13.709/2018)
                  </h3>
                  <span className="text-[10px] bg-teal-900/80 text-teal-200 px-2 py-0.5 rounded-full border border-teal-700">
                    Saúde & Prontuários
                  </span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed max-w-4xl font-medium">
                  Utilizamos cookies e tecnologias de criptografia ponta a ponta para garantir a segurança dos prontuários clínicos, otimizar sua navegação e cumprir as exigências do CFM e da ANVISA. Você pode gerenciar suas preferências a qualquer momento.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0 w-full md:w-auto justify-end">
              <button
                onClick={handleAcceptEssentialOnly}
                className="py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-xl border border-zinc-700 transition-colors"
              >
                Apenas Essenciais
              </button>
              <button
                onClick={handleAcceptAll}
                className="py-2 px-4 bg-teal-600 hover:bg-teal-500 text-white text-xs font-black rounded-xl shadow-xs transition-colors border border-teal-400/30"
              >
                Aceitar Todos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Full LGPD Management Modal */}
      {isOpenModal && (
        <div className="fixed inset-0 z-50 bg-zinc-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 bg-zinc-900 text-white flex items-center justify-between border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-teal-500/20 rounded-xl border border-teal-500/30 text-teal-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wider text-white">
                    Central de Privacidade & LGPD
                  </h2>
                  <p className="text-[11px] text-zinc-400 font-medium">
                    Gestão de Consentimento, Direitos do Titular (Art. 18) e Encarregado de Dados (DPO)
                  </p>
                </div>
              </div>
              <button
                onClick={onCloseModal}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 p-2 bg-zinc-100 border-b border-zinc-200 text-xs font-bold overflow-x-auto">
              <button
                onClick={() => setActiveTab('cookies')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'cookies'
                    ? 'bg-white text-teal-800 shadow-2xs border border-zinc-200'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <Cookie className="w-4 h-4 text-teal-600" />
                <span>Preferências de Cookies</span>
              </button>

              <button
                onClick={() => setActiveTab('direitos')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'direitos'
                    ? 'bg-white text-teal-800 shadow-2xs border border-zinc-200'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <FileText className="w-4 h-4 text-teal-600" />
                <span>Seus Direitos (Art. 18 LGPD)</span>
              </button>

              <button
                onClick={() => setActiveTab('dpo')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'dpo'
                    ? 'bg-white text-teal-800 shadow-2xs border border-zinc-200'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <Mail className="w-4 h-4 text-teal-600" />
                <span>Contato do DPO / Encarregado</span>
              </button>

              <button
                onClick={() => setActiveTab('termos')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'termos'
                    ? 'bg-white text-teal-800 shadow-2xs border border-zinc-200'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <Lock className="w-4 h-4 text-teal-600" />
                <span>Tratamento de Dados de Saúde</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs text-zinc-700 leading-relaxed flex-1">
              {/* Tab 1: Cookies Preferences */}
              {activeTab === 'cookies' && (
                <div className="space-y-4">
                  <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-900 font-medium">
                    <p className="flex items-center gap-1.5 font-bold mb-1">
                      <Info className="w-4 h-4 text-teal-700" />
                      Como os Cookies Funcionam na NexaMed
                    </p>
                    Cookies são necessários para autenticar profissionais de saúde, armazenar preferências de visualização dos prontuários e garantir a rastreabilidade das ações exigidas por auditoria sanitária.
                  </div>

                  <div className="space-y-3">
                    {/* Essential Cookies */}
                    <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-zinc-900 text-xs">Cookies Estritamente Necessários</h4>
                          <span className="text-[10px] bg-zinc-200 text-zinc-800 font-bold px-2 py-0.5 rounded-md">
                            Sempre Ativos (Obrigatório)
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 font-medium mt-1">
                          Essenciais para o login seguro, manutenção da sessão do profissional, token de criptografia e auditoria de log do CFM.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={true}
                        disabled
                        className="w-4 h-4 accent-teal-600 cursor-not-allowed opacity-60"
                      />
                    </div>

                    {/* Analytics Cookies */}
                    <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl flex items-center justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-zinc-900 text-xs">Cookies de Desempenho e Prontuário</h4>
                        <p className="text-[11px] text-zinc-500 font-medium mt-1">
                          Permitem salvar rascunhos automáticos de evoluções SOAP e personalizar a ordenação dos cards de residentes.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.analytics}
                        onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                        className="w-4 h-4 accent-teal-600 cursor-pointer"
                      />
                    </div>

                    {/* Performance / AI Telemetry */}
                    <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl flex items-center justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-zinc-900 text-xs">Telemetria Anonimizada da Assistente Nexa IA</h4>
                        <p className="text-[11px] text-zinc-500 font-medium mt-1">
                          Métricas agregadas sobre o tempo de resposta da IA para otimização de infraestrutura. Nenhum dado identificável de paciente é enviado.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.performance}
                        onChange={(e) => setPreferences({ ...preferences, performance: e.target.checked })}
                        className="w-4 h-4 accent-teal-600 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Direitos do Titular (Art. 18 LGPD) */}
              {activeTab === 'direitos' && (
                <div className="space-y-4">
                  <p className="font-medium text-zinc-700">
                    Nos termos do **Art. 18 da Lei nº 13.709/2018 (LGPD)**, você e os responsáveis legais dos residentes têm direito de solicitar a qualquer momento:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                      <span className="font-bold text-teal-800 text-xs block">1. Confirmação e Acesso</span>
                      <p className="text-[11px] text-zinc-600">
                        Consultar a existência de tratamento e acessar os dados do prontuário do residente.
                      </p>
                    </div>

                    <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                      <span className="font-bold text-teal-800 text-xs block">2. Correção de Dados</span>
                      <p className="text-[11px] text-zinc-600">
                        Solicitar retificação de dados incompletos, inexatos ou desatualizados na ficha.
                      </p>
                    </div>

                    <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                      <span className="font-bold text-teal-800 text-xs block">3. Portabilidade dos Dados</span>
                      <p className="text-[11px] text-zinc-600">
                        Baixar o relatório completo de histórico em formato estruturado (JSON/PDF).
                      </p>
                    </div>

                    <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                      <span className="font-bold text-teal-800 text-xs block">4. Revogação do Consentimento</span>
                      <p className="text-[11px] text-zinc-600">
                        Revogar autorizações não essenciais a qualquer momento.
                      </p>
                    </div>
                  </div>

                  {requestStatus && (
                    <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-900 text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-600" />
                      <span>{requestStatus}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <button
                      onClick={handleDataExport}
                      className="py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-2 shadow-xs"
                    >
                      <Download className="w-4 h-4" />
                      <span>Exportar Meus Dados (Portabilidade)</span>
                    </button>

                    <button
                      onClick={handleRevokeConsent}
                      className="py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs rounded-xl border border-rose-200 transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 className="w-4 h-4 text-rose-600" />
                      <span>Revogar Consentimentos Opcionais</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 3: DPO Contact */}
              {activeTab === 'dpo' && (
                <div className="space-y-4">
                  <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-2">
                    <h3 className="font-bold text-zinc-900 text-xs">Encarregado pelo Tratamento de Dados Pessoais (DPO)</h3>
                    <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                      Caso necessite fazer requisições formais, exercer os direitos do titular ou esclarecer dúvidas sobre a política de privacidade da NexaMed:
                    </p>
                    
                    <div className="pt-2 space-y-1.5 text-xs">
                      <p className="font-bold text-zinc-800">
                        • Encarregado Responsável: <span className="text-teal-700">Dr. Roberto Lima (DPO Certificado)</span>
                      </p>
                      <p className="font-bold text-zinc-800">
                        • E-mail Direto: <span className="text-teal-700">dpo@nexamed.com.br</span>
                      </p>
                      <p className="font-bold text-zinc-800">
                        • Endereço da Unidade: <span className="text-zinc-600">Alameda Santos, 1200 - São Paulo/SP</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Termos de Dados de Saúde (Art. 11 LGPD) */}
              {activeTab === 'termos' && (
                <div className="space-y-3">
                  <h3 className="font-bold text-zinc-900 text-xs">
                    Tratamento de Dados Pessoais Sensíveis de Saúde (Art. 11 LGPD)
                  </h3>
                  <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                    1. **Finalidade Legítima:** Os dados de saúde, exames, medicação (MAR) e relatos de evolução (SOAP) são coletados estritamente para a prestação de cuidados médicos e psicológicos nas residências terapêuticas.
                  </p>
                  <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                    2. **Segurança:** O armazenamento segue os padrões de segurança em conformidade com a Resolução CFM nº 1.821/2007 para prontuários eletrônicos do paciente (PEP).
                  </p>
                  <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                    3. **Compartilhamento Restrito:** Os dados nunca são comercializados e só são compartilhados com equipes autorizadas de pronto atendimento hospitalar sob expressa necessidade clínica ou ordem judicial.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between">
              <span className="text-[11px] text-zinc-500 font-medium">
                Último consentimento: {preferences.acceptedAt ? new Date(preferences.acceptedAt).toLocaleDateString('pt-BR') : 'Pendente'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={onCloseModal}
                  className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-xs font-bold rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveCustomPreferences}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-black rounded-xl shadow-xs transition-colors"
                >
                  Salvar Preferências
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
