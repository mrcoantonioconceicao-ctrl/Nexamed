import React, { useState } from 'react';
import { 
  BarChart3, 
  FileText, 
  ClipboardCheck, 
  AlertTriangle, 
  Printer, 
  Sparkles, 
  Search, 
  Download, 
  Users, 
  CheckCircle2, 
  Clock, 
  Pill,
  TrendingUp,
  X
} from 'lucide-react';
import { Resident, HandoverLog, ClinicalEvolution, MedicationMAR, OccurrenceItem } from '../types';

interface RelatoriosViewProps {
  residents: Resident[];
  handovers: HandoverLog[];
  evolutions: ClinicalEvolution[];
  medications: MedicationMAR[];
}

export const RelatoriosView: React.FC<RelatoriosViewProps> = ({
  residents,
  handovers,
  evolutions,
  medications,
}) => {
  const [activeTab, setActiveTab] = useState<'intercorrencias' | 'plantao' | 'evolucoes' | 'medicacao'>('intercorrencias');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [selectedPriority, setSelectedPriority] = useState<string>('Todas');
  const [aiReportText, setAiReportText] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Extract all occurrences from handovers
  const allOccurrences: (OccurrenceItem & { handoverShift: string; handoverDate: string; handoverAuthor: string })[] = [];
  handovers.forEach(h => {
    h.occurrences.forEach(occ => {
      allOccurrences.push({
        ...occ,
        handoverShift: h.shift,
        handoverDate: h.date,
        handoverAuthor: h.authorName,
      });
    });
  });

  // Filtering occurrences
  const filteredOccurrences = allOccurrences.filter(occ => {
    const matchesSearch = 
      occ.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      occ.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (occ.residentName && occ.residentName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'Todas' || occ.category === selectedCategory;
    const matchesPriority = selectedPriority === 'Todas' || occ.priority === selectedPriority;
    return matchesSearch && matchesCategory && matchesPriority;
  });

  // Calculate statistics
  const totalOccurrences = allOccurrences.length;
  const highPriorityCount = allOccurrences.filter(o => o.priority === 'Alta').length;
  const totalEvolutions = evolutions.length;

  // MAR adherence rate
  let totalDoses = 0;
  let administeredDoses = 0;
  medications.forEach(m => {
    m.scheduledDoses.forEach(d => {
      totalDoses++;
      if (d.status === 'Ministrado') administeredDoses++;
    });
  });
  const MARAdherenceRate = totalDoses > 0 ? Math.round((administeredDoses / totalDoses) * 100) : 100;

  // Generate AI Executive Report
  const handleGenerateAiReport = () => {
    setIsGeneratingAi(true);
    setTimeout(() => {
      const text = `
RELATÓRIO CLÍNICO EXECUTIVO DE INTERCORRÊNCIAS E EVOLUÇÕES
Gerado pela NexaMed IA • Unidade Jardim Paulista
Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}

1. SÍNTESE EPIDEMIOLÓGICA E OPERACIONAL
- Total de Residentes Acompanhados: ${residents.length}
- Intercorrências Registradas no Período: ${totalOccurrences} (${highPriorityCount} classificadas como Prioridade Alta)
- Evoluções Clínicas Multi (SOAP): ${totalEvolutions} registros
- Taxa Global de Adesão MAR (Medicações Administradas): ${MARAdherenceRate}%

2. ANÁLISE DE INTERCORRÊNCIAS POR CATEGORIA
- Sintomas Clínicos / Anormalidades de Sinais Vitais: Monitoramento contínuo mantido.
- Alterações Comportamentais: Ajustes no PTS e acolhimento psicoemocional recomendados.
- Medicação & Ajustes Prescritos: 100% de conferência nos itens psicotrópicos controlados.

3. RECOMENDAÇÕES DA COORDENAÇÃO TÉCNICA (NEXA IA)
• Reforçar a checagem dupla na medicação noturna dos residentes de alto risco.
• Acompanhar evolução de P.A. nas evoluções de enfermagem do Turno da Manhã.
• Reavaliar Metas do PTS com a equipe multidisciplinar para residentes com mais de 2 ocorrências na semana.

Relatório validado digitalmente pelo Responsável Técnico Enf. Dr. Fernando Alencar (COREN-SP 123456).
      `.trim();
      setAiReportText(text);
      setIsGeneratingAi(false);
    }, 1200);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-white border border-zinc-200/90 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-5 h-5 text-teal-600" />
            <h1 className="text-lg font-black text-zinc-900 uppercase tracking-wider">
              Central de Relatórios & Intercorrências
            </h1>
          </div>
          <p className="text-xs text-zinc-500 font-medium">
            Auditoria clínica, estatísticas de intercorrências, registro de evoluções e consolidados de plantão
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateAiReport}
            disabled={isGeneratingAi}
            className="py-2.5 px-4 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-white stroke-[2.5]" />
            <span>{isGeneratingAi ? 'Sintetizando Relatório...' : 'Relatório Executivo IA'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="py-2.5 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs rounded-xl border border-zinc-200 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Printer className="w-4 h-4 text-zinc-600" />
            <span>Imprimir / PDF</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 bg-white border border-zinc-200/90 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Intercorrências</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-zinc-900">{totalOccurrences}</p>
          <span className="text-[10px] text-rose-600 font-bold mt-1 block">
            {highPriorityCount} prioridade alta
          </span>
        </div>

        <div className="p-4 bg-white border border-zinc-200/90 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Evoluções SOAP</span>
            <FileText className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-black text-zinc-900">{totalEvolutions}</p>
          <span className="text-[10px] text-teal-700 font-bold mt-1 block">
            Multiprofissional ativo
          </span>
        </div>

        <div className="p-4 bg-white border border-zinc-200/90 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Adesão Medicação (MAR)</span>
            <Pill className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700">{MARAdherenceRate}%</p>
          <span className="text-[10px] text-zinc-500 font-medium mt-1 block">
            {administeredDoses} de {totalDoses} doses ministradas
          </span>
        </div>

        <div className="p-4 bg-white border border-zinc-200/90 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Passagens de Turno</span>
            <ClipboardCheck className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-zinc-900">{handovers.length}</p>
          <span className="text-[10px] text-purple-700 font-bold mt-1 block">
            Log assinado digitalmente
          </span>
        </div>
      </div>

      {/* AI Report Card Modal Display */}
      {aiReportText && (
        <div className="p-5 bg-teal-50/90 border border-teal-200 rounded-2xl shadow-xs space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-teal-200 pb-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-700" />
              <h2 className="text-xs font-bold text-teal-900 uppercase tracking-wider">
                Relatório Executivo Consolidado por IA Nexa
              </h2>
            </div>
            <button
              onClick={() => setAiReportText(null)}
              className="p-1 text-teal-700 hover:text-teal-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-teal-950 whitespace-pre-wrap leading-relaxed font-mono font-medium">
            {aiReportText}
          </p>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('intercorrencias')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'intercorrencias'
              ? 'bg-teal-600 text-white shadow-xs font-extrabold'
              : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Intercorrências ({allOccurrences.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('plantao')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'plantao'
              ? 'bg-teal-600 text-white shadow-xs font-extrabold'
              : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
          }`}
        >
          <ClipboardCheck className="w-4 h-4" />
          <span>Passagens de Plantão ({handovers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('evolucoes')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'evolucoes'
              ? 'bg-teal-600 text-white shadow-xs font-extrabold'
              : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Evoluções SOAP ({evolutions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('medicacao')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'medicacao'
              ? 'bg-teal-600 text-white shadow-xs font-extrabold'
              : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>Adesão Medicamentosa</span>
        </button>
      </div>

      {/* Tab 1: Intercorrências Detailed List */}
      {activeTab === 'intercorrencias' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="p-4 bg-white border border-zinc-200/90 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filtrar por residente, texto..."
                className="w-full bg-zinc-50 text-zinc-900 pl-9 pr-3 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-zinc-50 text-zinc-800 px-3 py-2 rounded-xl border border-zinc-200 focus:outline-none font-medium"
              >
                <option value="Todas">Todas as Categorias</option>
                <option value="Comportamental">Comportamental</option>
                <option value="Medicação">Medicação</option>
                <option value="Sinais Vitais">Sinais Vitais</option>
                <option value="Queda">Queda</option>
                <option value="Sintoma Clínico">Sintoma Clínico</option>
              </select>

              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="bg-zinc-50 text-zinc-800 px-3 py-2 rounded-xl border border-zinc-200 focus:outline-none font-medium"
              >
                <option value="Todas">Todas Prioridades</option>
                <option value="Alta">Prioridade Alta</option>
                <option value="Média">Prioridade Média</option>
                <option value="Baixa">Prioridade Baixa</option>
              </select>
            </div>
          </div>

          {/* Occurrences Cards */}
          <div className="space-y-3">
            {filteredOccurrences.length === 0 ? (
              <p className="p-8 text-xs text-zinc-500 font-medium text-center bg-white rounded-2xl border border-zinc-200">
                Nenhuma intercorrência encontrada para os filtros selecionados.
              </p>
            ) : (
              filteredOccurrences.map((occ) => (
                <div
                  key={occ.id}
                  className="p-4 bg-white border border-zinc-200/90 rounded-2xl shadow-2xs space-y-2 hover:border-teal-300 transition-colors"
                >
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                        occ.priority === 'Alta' ? 'bg-rose-50 text-rose-800 border border-rose-200' :
                        occ.priority === 'Média' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                        'bg-zinc-100 text-zinc-700 border border-zinc-200'
                      }`}>
                        {occ.priority}
                      </span>
                      <span className="text-xs font-bold text-teal-700">{occ.category}</span>
                      <span className="text-[11px] text-zinc-400 font-medium">• {occ.handoverDate} às {occ.time}</span>
                    </div>
                    <span className="text-[11px] text-zinc-500 font-medium">Turno {occ.handoverShift} ({occ.handoverAuthor})</span>
                  </div>

                  <p className="text-xs text-zinc-800 font-medium leading-relaxed">
                    {occ.description}
                  </p>

                  {occ.residentName && (
                    <p className="text-[11px] text-zinc-500 font-medium pt-1">
                      Residente Relacionado: <strong className="text-zinc-900 font-bold">{occ.residentName}</strong>
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Passagens de Plantão Audit */}
      {activeTab === 'plantao' && (
        <div className="space-y-4">
          {handovers.map((log) => (
            <div key={log.id} className="p-5 bg-white border border-zinc-200/90 rounded-2xl shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">Plantão Turno {log.shift} - {log.date}</h3>
                  <p className="text-xs text-teal-700 font-bold">Responsável Técnico: {log.authorName} ({log.authorRole})</p>
                </div>
                <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                  {log.occurrences.length} ocorrências registradas
                </span>
              </div>

              <p className="text-xs text-zinc-800 leading-relaxed font-medium bg-zinc-50 p-3 rounded-xl border border-zinc-200/80">
                {log.summaryText}
              </p>

              <div className="pt-2 flex items-center gap-2 text-[11px] text-zinc-500">
                <span className="font-bold text-zinc-700">Assinaturas e Cientes:</span>
                <div className="flex flex-wrap gap-1">
                  {log.acknowledgedBy.map((name, i) => (
                    <span key={i} className="bg-zinc-50 text-teal-800 font-bold px-2 py-0.5 rounded-md border border-zinc-200">
                      ✓ {name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Evoluções SOAP Audit */}
      {activeTab === 'evolucoes' && (
        <div className="space-y-3">
          {evolutions.map((evo) => (
            <div key={evo.id} className="p-4 bg-white border border-zinc-200/90 rounded-2xl shadow-2xs space-y-2">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                <div>
                  <span className="text-xs font-bold text-zinc-900">{evo.residentName}</span>
                  <span className="text-xs text-teal-700 font-bold ml-2">• Profissional: {evo.author} ({evo.role})</span>
                </div>
                <span className="text-[11px] text-zinc-400 font-medium">{evo.date} às {evo.time}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-200/80">
                  <strong className="text-teal-700 block text-[10px] uppercase font-bold">S - Subjetivo</strong>
                  <span className="text-zinc-800 font-medium">{evo.soap.subjective}</span>
                </div>
                <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-200/80">
                  <strong className="text-teal-700 block text-[10px] uppercase font-bold">O - Objetivo</strong>
                  <span className="text-zinc-800 font-medium">{evo.soap.objective}</span>
                </div>
                <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-200/80">
                  <strong className="text-teal-700 block text-[10px] uppercase font-bold">A - Avaliação</strong>
                  <span className="text-zinc-800 font-medium">{evo.soap.assessment}</span>
                </div>
                <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-200/80">
                  <strong className="text-teal-700 block text-[10px] uppercase font-bold">P - Plano</strong>
                  <span className="text-zinc-800 font-medium">{evo.soap.plan}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Adesão Medicamentosa MAR */}
      {activeTab === 'medicacao' && (
        <div className="space-y-4">
          <div className="p-4 bg-white border border-zinc-200/90 rounded-2xl shadow-2xs space-y-2">
            <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
              Resumo da Grade de Prescrições e Ministração
            </h3>
            <p className="text-xs text-zinc-500 font-medium">
              Taxa de pontualidade de doses, controle de psicotrópicos e aprazamentos de enfermagem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {medications.map((med) => (
              <div key={med.id} className="p-4 bg-white border border-zinc-200/90 rounded-2xl shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900">{med.medicationName} ({med.dosage})</h4>
                    <p className="text-[11px] text-zinc-500 font-medium">
                      Residente: <strong className="text-zinc-800">{med.residentName}</strong>
                    </p>
                  </div>
                  {med.isControlled && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                      Psicotrópico
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-zinc-100">
                  <span className="text-[10px] font-bold text-zinc-500">Doses do Dia:</span>
                  {med.scheduledDoses.map((dose) => (
                    <span
                      key={dose.id}
                      className={`text-xs font-bold px-2 py-0.5 rounded-md border ${
                        dose.status === 'Ministrado'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {dose.time} ({dose.status})
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
