import React, { useState } from 'react';
import { AuditLogEntry } from '../types';
import { 
  ShieldCheck, 
  X, 
  Search, 
  Download, 
  Filter, 
  Lock, 
  User, 
  Calendar, 
  FileText, 
  Key, 
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

interface AuditLogViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditLogs: AuditLogEntry[];
}

export const AuditLogViewerModal: React.FC<AuditLogViewerModalProps> = ({
  isOpen,
  onClose,
  auditLogs
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');

  if (!isOpen) return null;

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ipAddress.includes(searchQuery);

    const matchesAction = filterAction === 'all' || log.action === filterAction;

    return matchesSearch && matchesAction;
  });

  const handleExportAuditJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `trilha_auditoria_lgpd_nexamed_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 text-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Trilha de Auditoria Imutável (Audit Trail)</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  LGPD Art. 11 & OWASP
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Log completo de acessos, modificações e exportações de dados sensíveis de saúde.
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 bg-zinc-900/80 border-b border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por usuário, ação, IP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs"
              />
            </div>

            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs"
            >
              <option value="all">Todas as Ações</option>
              <option value="Acesso">Acesso</option>
              <option value="Criação">Criação</option>
              <option value="Edição">Edição</option>
              <option value="Exportação LGPD">Exportação LGPD</option>
              <option value="Assinatura">Assinatura Digital</option>
            </select>
          </div>

          <button
            onClick={handleExportAuditJSON}
            className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar Log de Auditoria (JSON)
          </button>
        </div>

        {/* Audit Log Table */}
        <div className="p-4 max-h-[450px] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-zinc-950 text-zinc-400 font-bold uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="p-3">Data / Hora</th>
                <th className="p-3">Usuário & Cargo</th>
                <th className="p-3">Ação</th>
                <th className="p-3">Recurso Acessado</th>
                <th className="p-3">IP de Origem</th>
                <th className="p-3">Motivo / Base Legal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono text-[11px]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-zinc-800/40 transition-colors text-zinc-300">
                  <td className="p-3 text-zinc-400 font-sans whitespace-nowrap">{log.timestamp}</td>
                  <td className="p-3 font-sans">
                    <strong className="text-white block">{log.userName}</strong>
                    <span className="text-zinc-500 text-[10px]">{log.userRole}</span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-sans ${
                      log.action === 'Exportação LGPD' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      log.action === 'Edição' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                      log.action === 'Assinatura' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3 text-zinc-200 font-sans">{log.resource}</td>
                  <td className="p-3 text-zinc-400">{log.ipAddress}</td>
                  <td className="p-3 text-zinc-400 font-sans">{log.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
          <span className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-teal-400" />
            Criptografia SHA-256 no armazenamento de hashes de auditoria
          </span>
          <span>Registros Totais: {filteredLogs.length}</span>
        </div>

      </div>
    </div>
  );
};
