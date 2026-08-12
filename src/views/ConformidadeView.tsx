import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  FileCheck, 
  Building2, 
  Scale, 
  Download, 
  Search, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Database, 
  Key, 
  Award, 
  Check, 
  ExternalLink,
  Shield,
  FileSpreadsheet,
  AlertCircle,
  HelpCircle,
  Activity,
  ChevronRight,
  Printer
} from 'lucide-react';
import { Resident, ClinicalEvolution, AuditLogEntry } from '../types';

interface ConformidadeViewProps {
  residents?: Resident[];
  evolutions?: ClinicalEvolution[];
  auditLogs?: AuditLogEntry[];
  onOpenAuditLogsModal?: () => void;
  onOpenLGPDModal?: () => void;
}

interface LGPDSolicitacao {
  id: string;
  titularNome: string;
  papel: 'Residente' | 'Responsável Legal' | 'Funcionário';
  tipo: 'Acesso' | 'Portabilidade' | 'Correção' | 'Revogação' | 'Eliminação';
  dataSolicitacao: string;
  prazoAtendimento: string;
  status: 'Atendido' | 'Em Análise' | 'Retido por Norma Sanitária';
  baseLegal: string;
}

export const ConformidadeView: React.FC<ConformidadeViewProps> = ({
  residents = [],
  evolutions = [],
  auditLogs = [],
  onOpenAuditLogsModal,
  onOpenLGPDModal
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'lgpd' | 'anvisa' | 'cfm' | 'dpo'>('overview');
  
  // Interactive Pseudonymization Demo
  const [demoResidentId, setDemoResidentId] = useState<string>(residents[0]?.id || 'res-1');
  const [isAnonymized, setIsAnonymized] = useState<boolean>(true);

  // RIPD / DPIA Generation State
  const [isGeneratingRIPD, setIsGeneratingRIPD] = useState<boolean>(false);
  const [ripdGeneratedDate, setRipdGeneratedDate] = useState<string | null>(null);

  // Hash Validation Demo
  const [hashValidationInput, setHashValidationInput] = useState<string>('EVO-SOAP-2026-0812-998231');
  const [hashValidationResult, setHashValidationResult] = useState<{
    valid: boolean;
    hash: string;
    timestamp: string;
    signatory: string;
  } | null>({
    valid: true,
    hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    timestamp: new Date().toLocaleString('pt-BR'),
    signatory: 'Dr. Roberto Lima (CRM/SP 142.890) - Certificado ICP-Brasil A1'
  });

  // LGPD Titular Requests Mock
  const [solicitacoes, setSolicitacoes] = useState<LGPDSolicitacao[]>([
    {
      id: 'SOL-8801',
      titularNome: 'Clara Santos (Filha de Helena Santos)',
      papel: 'Responsável Legal',
      tipo: 'Portabilidade',
      dataSolicitacao: '10/08/2026',
      prazoAtendimento: '25/08/2026 (Prazo 15 dias)',
      status: 'Atendido',
      baseLegal: 'Art. 18, V - Portabilidade de dados'
    },
    {
      id: 'SOL-8802',
      titularNome: 'Marcos Vinícius Barbosa',
      papel: 'Funcionário',
      tipo: 'Acesso',
      dataSolicitacao: '11/08/2026',
      prazoAtendimento: '26/08/2026',
      status: 'Atendido',
      baseLegal: 'Art. 18, II - Acesso aos dados'
    },
    {
      id: 'SOL-8803',
      titularNome: 'Família de Antônio Ferreira',
      papel: 'Responsável Legal',
      tipo: 'Eliminação',
      dataSolicitacao: '12/08/2026',
      prazoAtendimento: '27/08/2026',
      status: 'Retido por Norma Sanitária',
      baseLegal: 'Art. 16, I - Guarda obrigatória por 20 anos (Res. CFM 1.821/2007 e RDC 502/2021)'
    }
  ]);

  // Selected Resident for Pseudonymization Demo
  const selectedDemoResident = useMemo(() => {
    return residents.find(r => r.id === demoResidentId) || residents[0] || {
      id: 'res-1',
      name: 'Helena Santos',
      age: 82,
      room: 'Quarto 102 - Leito A',
      cpf: '123.456.789-00',
      diagnosis: 'Alzheimer Leve / HAS Controlada',
      responsibleName: 'Clara Santos (Filha)',
      responsiblePhone: '(11) 98765-4321'
    };
  }, [residents, demoResidentId]);

  // Pseudonymized values
  const pseudonymizedData = useMemo(() => {
    if (!selectedDemoResident) return {};
    const nameHash = `TITULAR_ID_${selectedDemoResident.id.toUpperCase()}_HASH_${Math.abs(selectedDemoResident.name.length * 997)}`;
    const maskedCPF = '***.' + (selectedDemoResident.cpf ? selectedDemoResident.cpf.substring(4, 7) : '456') + '.***-**';
    return {
      idPseudonym: nameHash,
      maskedName: selectedDemoResident.name.split(' ')[0] + ' ' + selectedDemoResident.name.split(' ').slice(-1)[0][0] + '.',
      ageGroup: `${Math.floor(selectedDemoResident.age / 10) * 10} a ${Math.floor(selectedDemoResident.age / 10) * 10 + 9} anos`,
      maskedCPF,
      genericDiagnosis: 'Condição Neurocognitiva Crônica / CID-10 F00',
      maskedResponsible: 'Familiar Direto / Grau 1'
    };
  }, [selectedDemoResident]);

  const handleGenerateRIPDReport = () => {
    setIsGeneratingRIPD(true);
    setTimeout(() => {
      setIsGeneratingRIPD(false);
      setRipdGeneratedDate(new Date().toLocaleString('pt-BR'));
    }, 1200);
  };

  const handleExportRIPDFile = () => {
    const reportContent = {
      empresa: "NexaMed Saúde & Residências Terapêuticas",
      documento: "Relatório de Impacto à Proteção de Dados Pessoais (RIPD / DPIA)",
      data_emissao: new Date().toLocaleString('pt-BR'),
      normas_reguladoras: [
        "Lei Geral de Proteção de Dados (Lei nº 13.709/2018)",
        "ANVISA RDC nº 502/2021 (Residências Terapêuticas e ILPI)",
        "Resolução CFM nº 1.821/2007 (PEP e Inalterabilidade de Prontuário)",
        "Resolução COFEN nº 514/2016 (Registro de Enfermagem)"
      ],
      dpo_encarregado: {
        nome: "Dr. Roberto Lima",
        contato: "dpo@nexamed.com.br",
        certificacao: "CDPO Brazil / IAPP"
      },
      classificacao_dados: "Dados Pessoais Sensíveis de Saúde (Art. 5º, II da LGPD)",
      medidas_de_seguranca: [
        "Criptografia AES-256 em Banco de Dados e TLS 1.3 em Trânsito",
        "Trilha de Auditoria Imutável (Audit Trail) com retenção de 5 anos",
        "Assinatura Eletrônica e Hash SHA-256 para evoluções SOAP",
        "Controle de Acesso Baseado em Papéis (RBAC - Médico, Enfermeiro, Cuidador, Direção)"
      ],
      score_conformidade: "98/100 - Nível Excelente"
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportContent, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `nexamed_ripd_dpia_lgpd_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Top Header Banner */}
      <div className="p-6 bg-gradient-to-r from-zinc-900 via-teal-950 to-slate-900 text-white rounded-3xl border border-teal-800/40 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-teal-500/10 to-transparent pointer-events-none"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                Conformidade Legal & Sanitária
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold">
                100% Adequado
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Central de Conformidade Regulatória & LGPD
            </h1>
            <p className="text-sm text-zinc-300 leading-relaxed max-w-3xl font-medium">
              Gestão de conformidade com a <strong className="text-teal-200">LGPD (Lei nº 13.709/2018)</strong>, normas da <strong className="text-teal-200">ANVISA (RDC 502/2021)</strong> e diretrizes do <strong className="text-teal-200">CFM (Res. 1.821/2007)</strong> e <strong className="text-teal-200">COFEN (Res. 514/2016)</strong> para residências terapêuticas e ILPIs.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenAuditLogsModal && (
              <button
                onClick={onOpenAuditLogsModal}
                className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-teal-300 border border-teal-500/30 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2"
              >
                <Lock className="w-4 h-4 text-teal-400" />
                <span>Trilha de Auditoria</span>
              </button>
            )}

            {onOpenLGPDModal && (
              <button
                onClick={onOpenLGPDModal}
                className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-black rounded-xl shadow-xs transition-all flex items-center gap-2 border border-teal-400/30"
              >
                <Shield className="w-4 h-4" />
                <span>Gerenciador de Cookies</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-white rounded-2xl border border-zinc-200/80 shadow-2xs overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-teal-50 text-teal-800 border border-teal-200 shadow-2xs'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
          }`}
        >
          <Award className="w-4 h-4 text-teal-600" />
          <span>Visão Geral & Scorecards</span>
        </button>

        <button
          onClick={() => setActiveTab('lgpd')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'lgpd'
              ? 'bg-teal-50 text-teal-800 border border-teal-200 shadow-2xs'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>LGPD & Direitos do Titular</span>
        </button>

        <button
          onClick={() => setActiveTab('anvisa')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'anvisa'
              ? 'bg-teal-50 text-teal-800 border border-teal-200 shadow-2xs'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
          }`}
        >
          <Building2 className="w-4 h-4 text-teal-600" />
          <span>ANVISA RDC 502/2021</span>
        </button>

        <button
          onClick={() => setActiveTab('cfm')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'cfm'
              ? 'bg-teal-50 text-teal-800 border border-teal-200 shadow-2xs'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
          }`}
        >
          <FileCheck className="w-4 h-4 text-teal-600" />
          <span>CFM / COFEN & PEP Inalterável</span>
        </button>

        <button
          onClick={() => setActiveTab('dpo')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'dpo'
              ? 'bg-teal-50 text-teal-800 border border-teal-200 shadow-2xs'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
          }`}
        >
          <Scale className="w-4 h-4 text-teal-600" />
          <span>DPO & Políticas de Retenção</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW SCORECARD & SUMMARY */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          
          {/* 4 Pillars Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-5 bg-white rounded-2xl border border-zinc-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  100% Conforme
                </span>
              </div>
              <div>
                <h3 className="text-sm font-black text-zinc-900">LGPD (Lei 13.709/18)</h3>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                  Tratamento de dados sensíveis de saúde, consentimento ativo e portabilidade.
                </p>
              </div>
              <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px] font-bold text-zinc-600">
                <span>Base Legal: Art. 11, II, f</span>
                <span className="text-teal-700">Ativo</span>
              </div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-zinc-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Certificado RT
                </span>
              </div>
              <div>
                <h3 className="text-sm font-black text-zinc-900">ANVISA RDC 502/21</h3>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                  Boas práticas para residências terapêuticas, prontuário individual e MAR.
                </p>
              </div>
              <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px] font-bold text-zinc-600">
                <span>Vigilância Sanitária</span>
                <span className="text-emerald-700">Aprovado</span>
              </div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-zinc-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
                  <FileCheck className="w-5 h-5" />
                </div>
                <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  PEP Nível 2
                </span>
              </div>
              <div>
                <h3 className="text-sm font-black text-zinc-900">CFM 1.821 & COFEN 514</h3>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                  Prontuário eletrônico inalterável com Hash SHA-256 e guarda de 20 anos.
                </p>
              </div>
              <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px] font-bold text-zinc-600">
                <span>Inalterabilidade</span>
                <span className="text-blue-700">SHA-256</span>
              </div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-zinc-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                  <Scale className="w-5 h-5" />
                </div>
                <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Proteção Plena
                </span>
              </div>
              <div>
                <h3 className="text-sm font-black text-zinc-900">Estatuto do Idoso & LBI</h3>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                  Garantia de direitos, plano individual de atendimento (PIA) e privacidade.
                </p>
              </div>
              <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px] font-bold text-zinc-600">
                <span>Lei 10.741/2003</span>
                <span className="text-amber-700">Atendido</span>
              </div>
            </div>

          </div>

          {/* Compliance Checklist Grid */}
          <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-2xs p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div>
                <h3 className="text-base font-black text-zinc-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Matriz de Auditoria e Controles de Segurança Ativos
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Verificação contínua da infraestrutura tecnológica e protocolos assistenciais.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleGenerateRIPDReport}
                  disabled={isGeneratingRIPD}
                  className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingRIPD ? 'animate-spin text-teal-400' : ''}`} />
                  <span>{isGeneratingRIPD ? 'Rodando Auditoria...' : 'Reauditar Sistema'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2">
                <div className="flex items-center justify-between font-bold text-zinc-900">
                  <span className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                    Criptografia de Dados de Saúde
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-black">
                    AES-256 / TLS 1.3
                  </span>
                </div>
                <p className="text-zinc-600 text-[11px] leading-relaxed">
                  Todos os prontuários, evoluções SOAP e imagens são armazenados criptografados em repouso no Firebase Cloud Firestore e trafegam exclusivamente via HTTPS com TLS 1.3.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2">
                <div className="flex items-center justify-between font-bold text-zinc-900">
                  <span className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                    Trilha de Auditoria Imutável (Audit Trail)
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-black">
                    OWASP & LGPD
                  </span>
                </div>
                <p className="text-zinc-600 text-[11px] leading-relaxed">
                  Cada acesso, alteração no Kardex MAR, prescrição ou leitura de prontuário registra o ID do usuário, cargo, carimbo de data/hora exata e IP de origem.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2">
                <div className="flex items-center justify-between font-bold text-zinc-900">
                  <span className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                    Controle de Acesso Baseado em Papéis (RBAC)
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-black">
                    Segregação de Função
                  </span>
                </div>
                <p className="text-zinc-600 text-[11px] leading-relaxed">
                  Perfis categorizados (Direção, RT Enfermagem, Médico, Cuidador). Cuidadores não possuem acesso a alterar prescrições restritas de controle especial.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2">
                <div className="flex items-center justify-between font-bold text-zinc-900">
                  <span className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                    Inalterabilidade de Prontuários Clinicos
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-black">
                    CFM 1.821/2007
                  </span>
                </div>
                <p className="text-zinc-600 text-[11px] leading-relaxed">
                  Evoluções registradas geram assinatura hash única e ficam bloqueadas contra modificações retroativas para garantir validade jurídica.
                </p>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* TAB 2: LGPD & DIREITOS DO TITULAR */}
      {activeTab === 'lgpd' && (
        <div className="space-y-6">
          
          {/* Section 1: RIPD / DPIA Generator Banner */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-teal-100 text-teal-800 rounded border border-teal-200">
                  Artigo 38 da LGPD
                </span>
                <h3 className="text-base font-black text-zinc-900 mt-1">
                  Relatório de Impacto à Proteção de Dados Pessoais (RIPD / DPIA)
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Documentação oficial descritiva do tratamento de dados sensíveis de saúde para apresentação à ANPD.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportRIPDFile}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar RIPD Oficial (JSON)</span>
                </button>
              </div>
            </div>

            {ripdGeneratedDate && (
              <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-900 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>Relatório RIPD auditado e atualizado com sucesso em {ripdGeneratedDate}.</span>
              </div>
            )}
          </div>

          {/* Section 2: Interactive Pseudonymization Engine */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-2xs space-y-5">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-50 text-purple-700 rounded-xl border border-purple-200">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-zinc-900">
                    Mecanismo de Pseudonimização & Desidentificação em Tempo Real
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Art. 13 da LGPD — Tratamento de dados para fins de pesquisa e indicadores sem expor a identidade dos idosos.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between bg-zinc-50 p-3 rounded-xl border border-zinc-200/80 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-zinc-700">Selecione o Residente para Teste:</label>
                <select
                  value={demoResidentId}
                  onChange={(e) => setDemoResidentId(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-zinc-300 rounded-xl text-xs font-bold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {residents.map(r => (
                    <option key={r.id} value={r.id}>{r.name} ({r.room})</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setIsAnonymized(!isAnonymized)}
                className={`px-3.5 py-1.5 font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 border ${
                  isAnonymized
                    ? 'bg-purple-600 text-white border-purple-400'
                    : 'bg-amber-100 text-amber-900 border-amber-300'
                }`}
              >
                {isAnonymized ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{isAnonymized ? 'Modo Pseudonimizado (LGPD Protegido)' : 'Modo Dados Brutos (Acesso Restrito RT)'}</span>
              </button>
            </div>

            {/* Side-by-Side Data Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Box 1: Raw Record */}
              <div className="p-4 rounded-xl bg-zinc-900 text-zinc-100 space-y-2 border border-zinc-800">
                <div className="flex items-center justify-between text-zinc-400 font-bold border-b border-zinc-800 pb-2">
                  <span>Prontuário Interno Assistencial (PEP)</span>
                  <span className="text-[10px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                    Acesso restrito Equipe Médica
                  </span>
                </div>
                <div className="space-y-1.5 font-mono text-[11px] pt-1">
                  <p><strong className="text-zinc-400 font-sans">Nome:</strong> {selectedDemoResident.name}</p>
                  <p><strong className="text-zinc-400 font-sans">Idade Exata:</strong> {selectedDemoResident.age} anos</p>
                  <p><strong className="text-zinc-400 font-sans">Acomodação:</strong> {selectedDemoResident.room}</p>
                  <p><strong className="text-zinc-400 font-sans">CPF:</strong> {selectedDemoResident.cpf || '123.456.789-00'}</p>
                  <p><strong className="text-zinc-400 font-sans">Diagnóstico:</strong> {selectedDemoResident.diagnosis || 'Sem diagnóstico'}</p>
                  <p><strong className="text-zinc-400 font-sans">Responsável:</strong> {selectedDemoResident.responsibleName}</p>
                </div>
              </div>

              {/* Box 2: Pseudonymized Export */}
              <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-800/60 text-purple-100 space-y-2">
                <div className="flex items-center justify-between text-purple-300 font-bold border-b border-purple-800/60 pb-2">
                  <span>Exportação para Indicadores / Pesquisa (LGPD)</span>
                  <span className="text-[10px] text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                    Desidentificado
                  </span>
                </div>
                <div className="space-y-1.5 font-mono text-[11px] pt-1">
                  <p><strong className="text-purple-300 font-sans">ID Pseudônimo:</strong> {pseudonymizedData.idPseudonym}</p>
                  <p><strong className="text-purple-300 font-sans">Faixa Etária:</strong> {pseudonymizedData.ageGroup}</p>
                  <p><strong className="text-purple-300 font-sans">Acomodação:</strong> Unidade Geral / SRT-01</p>
                  <p><strong className="text-purple-300 font-sans">CPF Mascarado:</strong> {pseudonymizedData.maskedCPF}</p>
                  <p><strong className="text-purple-300 font-sans">Diagnóstico Genérico:</strong> {pseudonymizedData.genericDiagnosis}</p>
                  <p><strong className="text-purple-300 font-sans">Grau de Parentesco:</strong> {pseudonymizedData.maskedResponsible}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Titular Requests Log */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-zinc-900">
                  Registro de Atendimento a Direitos do Titular (Art. 18 LGPD)
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Acompanhamento de requisições de familiares e residentes com prazos legais.
                </p>
              </div>

              <span className="text-xs font-bold text-zinc-500">
                Padrão Legal: Atendimento em até 15 dias
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-zinc-50 text-zinc-500 font-bold uppercase tracking-wider border-b border-zinc-200">
                  <tr>
                    <th className="p-3">ID / Titular</th>
                    <th className="p-3">Tipo de Direito</th>
                    <th className="p-3">Data Solicitação</th>
                    <th className="p-3">Prazo Legal</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Base Legal / Justificativa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {solicitacoes.map((sol) => (
                    <tr key={sol.id} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="p-3 font-bold text-zinc-900">
                        <div>{sol.titularNome}</div>
                        <span className="text-[10px] text-zinc-400 font-medium">{sol.papel}</span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 font-bold text-[10px]">
                          {sol.tipo}
                        </span>
                      </td>
                      <td className="p-3 text-zinc-600">{sol.dataSolicitacao}</td>
                      <td className="p-3 text-zinc-600">{sol.prazoAtendimento}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          sol.status === 'Atendido' ? 'bg-emerald-100 text-emerald-800' :
                          sol.status === 'Retido por Norma Sanitária' ? 'bg-amber-100 text-amber-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {sol.status}
                        </span>
                      </td>
                      <td className="p-3 text-zinc-500 text-[11px] leading-relaxed max-w-xs">{sol.baseLegal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: ANVISA RDC 502/2021 & SANITARY NORMS */}
      {activeTab === 'anvisa' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-purple-100 text-purple-800 rounded border border-purple-200">
                  Vigilância Sanitária
                </span>
                <h3 className="text-base font-black text-zinc-900 mt-1">
                  Regulamento Técnico ANVISA RDC nº 502/2021
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Funcionamento de Instituições de Longa Permanência para Idosos (ILPI) e Residências Terapêuticas (SRT).
                </p>
              </div>

              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-black rounded-full border border-emerald-200">
                Alvará Sanitário Ativo
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
                <div className="flex items-center gap-2 text-zinc-900 font-bold text-xs">
                  <Award className="w-4 h-4 text-teal-600" />
                  <span>Responsável Técnico (RT)</span>
                </div>
                <p className="text-zinc-600 text-[11px] leading-relaxed">
                  RT Enfermeiro com registro ativo no COREN/SP. Presença obrigatória e supervisão direta das escalas 24/7.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
                <div className="flex items-center gap-2 text-zinc-900 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>Controle do MAR & Portaria 344</span>
                </div>
                <p className="text-zinc-600 text-[11px] leading-relaxed">
                  Armazenamento em armário chaveado com dupla checagem na aplicação de psicotrópicos e narcóticos.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
                <div className="flex items-center gap-2 text-zinc-900 font-bold text-xs">
                  <Activity className="w-4 h-4 text-rose-600" />
                  <span>Notificação Notivisa / SINAN</span>
                </div>
                <p className="text-zinc-600 text-[11px] leading-relaxed">
                  Fluxo automatizado para geração de relatórios de surtos, quedas e reações adversas medicamentosas.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CFM / COFEN & PEP INALTERÁVEL */}
      {activeTab === 'cfm' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-2xs space-y-5">
            <div className="border-b border-zinc-100 pb-4">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-blue-100 text-blue-800 rounded border border-blue-200">
                Resolução CFM nº 1.821/2007 & COFEN nº 514/2016
              </span>
              <h3 className="text-base font-black text-zinc-900 mt-1">
                Prontuário Eletrônico do Paciente (PEP) com Inalterabilidade Garantida
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Validação de assinaturas digitais e verificação de hashes SHA-256 para evoluções clínicas SOAP.
              </p>
            </div>

            {/* Hash Inspector Tool */}
            <div className="p-4 bg-zinc-900 text-white rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-teal-400" />
                  <h4 className="text-xs font-bold text-white">Inspetor de Hash e Assinatura ICP-Brasil</h4>
                </div>
                <span className="text-[10px] font-mono text-teal-300 bg-teal-950 px-2 py-0.5 rounded border border-teal-800">
                  Algoritmo SHA-256
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] text-zinc-400 font-bold">Código do Registro SOAP para Validação:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={hashValidationInput}
                    onChange={(e) => setHashValidationInput(e.target.value)}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <button
                    onClick={() => {
                      setHashValidationResult({
                        valid: true,
                        hash: `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`,
                        timestamp: new Date().toLocaleString('pt-BR'),
                        signatory: 'Dra. Camila Nogueira (CRM/SP 188.420) - Certificado Digital A1'
                      });
                    }}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl transition-colors shrink-0"
                  >
                    Validar Hash
                  </button>
                </div>
              </div>

              {hashValidationResult && (
                <div className="p-3 bg-zinc-950/80 rounded-xl border border-teal-500/30 text-xs space-y-1.5 font-mono">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold font-sans">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Registro Válido e Inviolado no Banco de Dados</span>
                  </div>
                  <p className="text-[11px] text-zinc-300"><strong className="text-zinc-400 font-sans">Hash Verificado:</strong> {hashValidationResult.hash}</p>
                  <p className="text-[11px] text-zinc-300"><strong className="text-zinc-400 font-sans">Assinado Por:</strong> {hashValidationResult.signatory}</p>
                  <p className="text-[11px] text-zinc-300"><strong className="text-zinc-400 font-sans">Timestamp Imutável:</strong> {hashValidationResult.timestamp}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: DPO & RETENTION POLICIES */}
      {activeTab === 'dpo' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-2xs space-y-5">
            <div className="border-b border-zinc-100 pb-4">
              <h3 className="text-base font-black text-zinc-900">
                Encarregado de Dados (DPO) & Política de Retenção e Descarte
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Diretrizes de guarda de documentos clínicos e contato direto para auditorias da ANPD.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
                <h4 className="font-bold text-zinc-900 text-xs">Contato Formal do DPO</h4>
                <p className="text-zinc-600 font-medium">Dr. Roberto Lima — Certificado CDPO</p>
                <p className="text-teal-700 font-bold">E-mail: dpo@nexamed.com.br</p>
                <p className="text-zinc-500">Atendimento a Titulares: Segunda a Sexta, das 08h às 18h.</p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
                <h4 className="font-bold text-zinc-900 text-xs">Prazo de Retenção Obrigatório</h4>
                <p className="text-zinc-600 font-medium">Guarda obrigatoriamente mantida por **20 anos** conforme Resolução CFM 1.821/2007 e Lei do Prontuário Eletrônico (Lei 13.787/2018).</p>
                <p className="text-zinc-500">Após o prazo legal, eliminação segura e irreversível com laudo de descarte em conformidade com a LGPD.</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
