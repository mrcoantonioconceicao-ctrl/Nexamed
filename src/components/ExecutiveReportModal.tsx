import React from 'react';
import { Resident, QualityMetric } from '../types';
import { 
  FileText, 
  X, 
  Download, 
  Printer, 
  CheckCircle2, 
  ShieldCheck, 
  Building2, 
  TrendingUp, 
  Activity, 
  BarChart3,
  Award
} from 'lucide-react';

interface ExecutiveReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  residents: Resident[];
  qualityMetrics: QualityMetric[];
}

export const ExecutiveReportModal: React.FC<ExecutiveReportModalProps> = ({
  isOpen,
  onClose,
  residents,
  qualityMetrics
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const criticalCount = residents.filter(r => r.news2?.riskLevel === 'Crítico').length;
  const moderateCount = residents.filter(r => r.news2?.riskLevel === 'Moderado').length;
  const lowCount = residents.filter(r => r.news2?.riskLevel === 'Baixo').length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white text-zinc-900 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-zinc-200">
        
        {/* Header Bar */}
        <div className="p-4 bg-zinc-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Relatório Executivo Assistencial & Governança ONA 3</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Exportação Oficial
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Consolidado clínico-psiquiátrico para auditoria, diretoria e conselhos regionais.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrint}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl transition-all text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir / Salvar PDF
            </button>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 sm:p-8 space-y-6 text-xs text-zinc-800 bg-white" id="printable-executive-report">
          
          {/* Document Header */}
          <div className="flex items-center justify-between border-b-2 border-teal-600 pb-4">
            <div>
              <h1 className="text-xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
                NexaMed Enterprise ILPI & Saúde Mental
              </h1>
              <p className="text-xs text-zinc-500 font-medium mt-0.5">
                Residencial Salomão (Rua Dr. Pedro Zimmermann, 2391 - Blumenau/SC) • Responsabilidade Técnica: Dra. Camila Meireles (CRM/Coren)
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                Acreditação ONA Nível 3 (Excelência)
              </span>
              <p className="text-[10px] text-zinc-400 mt-1">Data de Emissão: {new Date().toLocaleDateString('pt-BR')}</p>
            </div>
          </div>

          {/* Key Executive Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl">
              <span className="text-zinc-500 text-[10px] font-bold block uppercase">Total Residentes Ativos</span>
              <span className="text-lg font-extrabold text-zinc-900">{residents.length} Acolhidos</span>
            </div>

            <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-xl">
              <span className="text-teal-800 text-[10px] font-bold block uppercase">Taxa Adesão MAR</span>
              <span className="text-lg font-extrabold text-teal-900">98.4% Sucesso</span>
            </div>

            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
              <span className="text-amber-800 text-[10px] font-bold block uppercase">Quedas no Mês</span>
              <span className="text-lg font-extrabold text-amber-900">0 Incidentes Graves</span>
            </div>

            <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl">
              <span className="text-purple-800 text-[10px] font-bold block uppercase">Contenção Física</span>
              <span className="text-lg font-extrabold text-purple-900">0.0% (Meta Atingida)</span>
            </div>
          </div>

          {/* Stratification NEWS2 */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-200 pb-1">
              <Activity className="w-4 h-4 text-teal-600" />
              Estratificação NEWS2 e Risco Clínico-Psiquiátrico
            </h3>
            <div className="grid grid-cols-3 gap-3 font-sans">
              <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-900">
                <strong className="block text-sm font-bold">{lowCount} Residentes</strong>
                <span className="text-[10px]">Risco Baixo (NEWS2 0-2)</span>
              </div>
              <div className="p-3 rounded-xl border border-amber-200 bg-amber-50 text-amber-900">
                <strong className="block text-sm font-bold">{moderateCount} Residentes</strong>
                <span className="text-[10px]">Risco Moderado (NEWS2 3-4)</span>
              </div>
              <div className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-900">
                <strong className="block text-sm font-bold">{criticalCount} Residentes</strong>
                <span className="text-[10px]">Risco Crítico (NEWS2 &ge;5)</span>
              </div>
            </div>
          </div>

          {/* Quality Metrics Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-200 pb-1">
              <BarChart3 className="w-4 h-4 text-teal-600" />
              Indicadores Assistenciais & Metas de Qualidade (ISO 9001)
            </h3>

            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-zinc-100 text-zinc-600 font-bold uppercase text-[10px] border-b border-zinc-200">
                <tr>
                  <th className="p-2.5">Indicador Assitencial</th>
                  <th className="p-2.5">Resultado Atual</th>
                  <th className="p-2.5">Meta Anvisa / ONA</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 font-medium">
                {qualityMetrics.map((qm) => (
                  <tr key={qm.id} className="hover:bg-zinc-50">
                    <td className="p-2.5 font-bold text-zinc-900">{qm.indicatorName}</td>
                    <td className="p-2.5 font-mono font-bold text-teal-700">{qm.currentValue}%</td>
                    <td className="p-2.5 font-mono text-zinc-500">{qm.targetValue}%</td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        qm.status === 'Conforme' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {qm.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Signatures Footer */}
          <div className="pt-8 border-t border-zinc-300 grid grid-cols-2 gap-8 text-center text-[11px] text-zinc-600">
            <div>
              <div className="border-b border-zinc-400 mb-1 w-48 mx-auto" />
              <strong className="block text-zinc-900">Dr. Fernando Alencar</strong>
              <span>Diretor Médico Psiquiatra • CRM 148290-SP</span>
            </div>
            <div>
              <div className="border-b border-zinc-400 mb-1 w-48 mx-auto" />
              <strong className="block text-zinc-900">Enf. Mariana Castro</strong>
              <span>Enfermeira Responsável Técnica • COREN 304921-SP</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
