import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  FileCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Database, 
  ArrowRight, 
  FileSpreadsheet, 
  Code, 
  ShieldCheck, 
  RefreshCw,
  Sparkles,
  Download
} from 'lucide-react';
import { giterStore } from '../utils/giterStore';
import { GiterMigrationReport } from '../types';

interface GiterMigrationViewProps {
  onRefreshData?: () => void;
}

export const GiterMigrationView: React.FC<GiterMigrationViewProps> = ({ onRefreshData }) => {
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileType, setFileType] = useState<'JSON' | 'CSV'>('JSON');
  const [parsedDataPreview, setParsedDataPreview] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [reports, setReports] = useState<GiterMigrationReport[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = () => {
    setReports(giterStore.getMigrationReports());
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const isCsv = file.name.endsWith('.csv');
    setFileType(isCsv ? 'CSV' : 'JSON');

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setFileContent(text);
      parsePreview(text, isCsv);
    };
    reader.readAsText(file);
  };

  const parsePreview = (text: string, isCsv: boolean) => {
    try {
      if (isCsv) {
        const lines = text.split('\n').filter(Boolean);
        const headers = lines[0].split(',').map(h => h.trim());
        const preview = lines.slice(1, 6).map(line => {
          const values = line.split(',');
          const obj: any = {};
          headers.forEach((h, idx) => {
            obj[h] = values[idx]?.trim() || '';
          });
          return obj;
        });
        setParsedDataPreview(preview);
      } else {
        const json = JSON.parse(text);
        const records = Array.isArray(json) ? json : [json];
        setParsedDataPreview(records.slice(0, 5));
      }
    } catch (err) {
      console.error('Error parsing file:', err);
      setParsedDataPreview([]);
    }
  };

  const handleExecuteImport = () => {
    if (!fileContent) return;

    setIsProcessing(true);
    setTimeout(() => {
      let importedCount = 0;
      let errorsCount = 0;

      try {
        if (fileType === 'JSON') {
          const parsed = JSON.parse(fileContent);
          const list = Array.isArray(parsed) ? parsed : [parsed];
          list.forEach(item => {
            if (item.name && item.room) {
              giterStore.saveResident({
                id: item.id || `res-giter-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
                name: item.name,
                age: Number(item.age) || 60,
                room: String(item.room),
                photo: item.photo || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
                cns: item.cns || '',
                birthDate: item.birthDate || '',
                primaryDiagnostic: item.primaryDiagnostic || 'Diagnóstico Migrado do GITER',
                vitals: { bp: '120/80', hr: 75, temp: 36.5, spo2: 98, respRate: 16 }
              });
              importedCount++;
            }
          });
        } else {
          // CSV Parser
          const lines = fileContent.split('\n').filter(Boolean);
          const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
          const nameIdx = headers.findIndex(h => h.includes('nome') || h.includes('name'));
          const roomIdx = headers.findIndex(h => h.includes('quarto') || h.includes('room'));
          const cnsIdx = headers.findIndex(h => h.includes('cns'));

          lines.slice(1).forEach((line, index) => {
            const cols = line.split(',');
            const name = cols[nameIdx]?.trim();
            const room = cols[roomIdx]?.trim() || '101';
            const cns = cols[cnsIdx]?.trim() || '';

            if (name) {
              giterStore.saveResident({
                id: `res-giter-csv-${Date.now()}-${index}`,
                name: name,
                age: 65,
                room: room,
                photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
                cns: cns,
                birthDate: '1960-01-01',
                primaryDiagnostic: 'Acompanhamento do Sistema Legado GITER',
                vitals: { bp: '120/80', hr: 75, temp: 36.5, spo2: 98, respRate: 16 }
              });
              importedCount++;
            } else {
              errorsCount++;
            }
          });
        }

        const report: GiterMigrationReport = {
          id: `mig-${Date.now()}`,
          timestamp: new Date().toISOString(),
          fileName: fileName,
          recordsProcessed: importedCount + errorsCount,
          successCount: importedCount,
          errorCount: errorsCount,
          importedBy: 'Enf. Responsável Técnico'
        };

        giterStore.saveMigrationReport(report);
        loadReports();
        setSuccessMessage(`Migração do GITER concluída com sucesso! ${importedCount} registros importados e vinculados ao NexaMed.`);
        setFileContent(null);
        setParsedDataPreview([]);
        if (onRefreshData) onRefreshData();
      } catch (err: any) {
        console.error('Import error:', err);
      } finally {
        setIsProcessing(false);
      }
    }, 800);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-white border border-zinc-200/90 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Database className="w-5 h-5 text-teal-600" />
            <h1 className="text-lg font-black text-zinc-900 uppercase tracking-wider">
              NexaMed Migration Center — Legado GITER
            </h1>
          </div>
          <p className="text-xs text-zinc-500 font-medium">
            Ferramenta oficial de importação, mapeamento e migração de prontuários e históricos assistenciais do GITER
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-purple-50 text-purple-800 border border-purple-200 font-bold text-xs rounded-xl">
            🔒 Paridade Funcional GITER
          </span>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-xs font-bold text-emerald-900">{successMessage}</p>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-xs text-emerald-700 font-bold hover:underline">
            Fechar
          </button>
        </div>
      )}

      {/* Upload Zone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white border border-zinc-200/90 rounded-2xl shadow-xs space-y-4">
          <h2 className="text-xs font-black text-zinc-800 uppercase tracking-wider flex items-center gap-2">
            <Upload className="w-4 h-4 text-teal-600" />
            1. Selecionar Arquivo de Exportação do GITER
          </h2>

          <div className="border-2 border-dashed border-zinc-300 hover:border-teal-500 rounded-2xl p-8 text-center transition-colors bg-zinc-50/50">
            <FileSpreadsheet className="w-10 h-10 text-teal-600 mx-auto mb-3" />
            <p className="text-xs font-bold text-zinc-800 mb-1">
              Arraste ou selecione o arquivo CSV ou JSON do GITER
            </p>
            <p className="text-[11px] text-zinc-400 mb-4">
              Suporta planilhas de cadastros de residentes, históricos de evolução e tabelas do GITER.
            </p>

            <label className="py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-2">
              <Upload className="w-4 h-4" />
              <span>Buscar Arquivo no Computador</span>
              <input
                type="file"
                accept=".csv, .json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {fileName && (
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between text-xs">
              <span className="font-bold text-teal-900">Arquivo Carregado: {fileName} ({fileType})</span>
              <span className="text-[10px] bg-teal-200 text-teal-900 font-black px-2 py-0.5 rounded">Pronto</span>
            </div>
          )}
        </div>

        {/* Preview & Execution */}
        <div className="p-6 bg-white border border-zinc-200/90 rounded-2xl shadow-xs space-y-4">
          <h2 className="text-xs font-black text-zinc-800 uppercase tracking-wider flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-teal-600" />
            2. Mapeamento & Pré-visualização dos Dados
          </h2>

          {parsedDataPreview.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-zinc-200 rounded-2xl text-xs text-zinc-400">
              Nenhum dado para pré-visualização. Carregue um arquivo para checar os campos mapeados.
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs font-bold text-zinc-700">Amostra dos Registros Detectados (Primeiros 5):</p>
              <div className="overflow-x-auto max-h-48 border border-zinc-200 rounded-xl p-2 bg-zinc-50">
                <pre className="text-[11px] text-zinc-800 font-mono">
                  {JSON.stringify(parsedDataPreview, null, 2)}
                </pre>
              </div>

              <button
                onClick={handleExecuteImport}
                disabled={isProcessing}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
                <span>{isProcessing ? 'Processando e Gravando...' : 'Executar Migração Definitiva'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Migration Audit Reports */}
      <div className="p-5 bg-white border border-zinc-200/90 rounded-2xl shadow-xs space-y-4">
        <h2 className="text-xs font-black text-zinc-800 uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-purple-600" />
          Histórico de Relatórios de Migração Executados ({reports.length})
        </h2>

        {reports.length === 0 ? (
          <p className="text-xs text-zinc-400 font-medium">Nenhuma migração registrada até o momento.</p>
        ) : (
          <div className="divide-y divide-zinc-100">
            {(reports || []).map(r => (
              <div key={r.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-extrabold text-zinc-900">{r.fileName}</span>
                  <p className="text-[11px] text-zinc-500">
                    Executado por {r.importedBy} em {new Date(r.timestamp || r.importedAt || r.date || Date.now()).toLocaleString('pt-BR')}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-[10px]">
                    {r.successCount} Sucessos
                  </span>
                  {r.errorCount > 0 && (
                    <span className="px-2.5 py-1 bg-rose-100 text-rose-800 font-bold rounded-lg text-[10px]">
                      {r.errorCount} Erros
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
