import React, { useState } from 'react';
import { 
  Wifi, 
  WifiOff, 
  Database, 
  CheckCircle2, 
  RefreshCw, 
  HardDrive, 
  ShieldCheck,
  X,
  FileText,
  Pill,
  Users
} from 'lucide-react';

interface OfflineIndicatorProps {
  isOnline: boolean;
  isServiceWorkerActive: boolean;
  lastSyncedAt: string | null;
  counts?: {
    residents: number;
    evolutions: number;
    medications: number;
  };
  onForceSync: () => Promise<boolean>;
  showOfflineToast?: boolean;
  showOnlineToast?: boolean;
  onDismissOfflineToast?: () => void;
  onDismissOnlineToast?: () => void;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  isOnline,
  isServiceWorkerActive,
  lastSyncedAt,
  counts = { residents: 0, evolutions: 0, medications: 0 },
  onForceSync,
  showOfflineToast,
  showOnlineToast,
  onDismissOfflineToast,
  onDismissOnlineToast
}) => {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const safeCounts = {
    residents: counts?.residents ?? 0,
    evolutions: counts?.evolutions ?? 0,
    medications: counts?.medications ?? 0
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    await onForceSync();
    setTimeout(() => setIsSyncing(false), 500);
  };

  const formattedTime = lastSyncedAt 
    ? new Date(lastSyncedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'Agora';

  return (
    <>
      {/* Header Status Badge */}
      <button
        type="button"
        onClick={() => setShowDetailsModal(true)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
          !isOnline
            ? 'bg-amber-500 text-white border-amber-600 shadow-sm animate-pulse'
            : isServiceWorkerActive
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
            : 'bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-200'
        }`}
        title="Status de Conexão e Cache do Service Worker"
      >
        {!isOnline ? (
          <>
            <WifiOff className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Modo Offline (Cache Ativo)</span>
          </>
        ) : (
          <>
            <Wifi className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
            <span className="hidden sm:inline">SW Cache:</span>
            <span className="font-bold text-emerald-900">Sincronizado</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          </>
        )}
      </button>

      {/* Offline Toast Banner (floating when connection drops) */}
      {!isOnline && showOfflineToast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md bg-zinc-900 text-white p-4 rounded-2xl shadow-xl border border-amber-500/40 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
            <WifiOff className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Sem Conexão à Internet
              </h4>
              {onDismissOfflineToast && (
                <button
                  type="button"
                  onClick={onDismissOfflineToast}
                  className="text-zinc-400 hover:text-white text-xs"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-xs text-zinc-300 mt-1">
              O <strong>Service Worker</strong> manteve os dados clínicos em cache. A equipe pode continuar consultando prontuários e horários de medicamentos normalmente.
            </p>
            <div className="mt-2.5 flex items-center gap-2 text-[11px] text-zinc-400">
              <span className="flex items-center gap-1"><Users className="w-3 h-3 text-teal-400" /> {safeCounts.residents} Residentes</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Pill className="w-3 h-3 text-amber-400" /> {safeCounts.medications} Medicamentos</span>
            </div>
          </div>
        </div>
      )}

      {/* Online Restored Toast Banner */}
      {isOnline && showOnlineToast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md bg-emerald-900/95 text-white p-4 rounded-2xl shadow-xl border border-emerald-500/40 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 shrink-0 mt-0.5">
            <Wifi className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                Conexão Restabelecida
              </h4>
              {onDismissOnlineToast && (
                <button
                  type="button"
                  onClick={onDismissOnlineToast}
                  className="text-emerald-200 hover:text-white text-xs"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-xs text-emerald-100 mt-1">
              Sincronização em tempo real reativada com sucesso. O cache local do Service Worker foi atualizado.
            </p>
          </div>
        </div>
      )}

      {/* Modal Detalhes do Cache Offline do Service Worker */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-zinc-200 space-y-5 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${isOnline ? 'bg-teal-50 text-teal-700' : 'bg-amber-50 text-amber-700'}`}>
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">Cache Local do Service Worker</h3>
                  <p className="text-[11px] text-zinc-500">Resiliência e Continuidade Assistencial Offline</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailsModal(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Geral */}
            <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-600">Status da Conexão:</span>
                <span className={`font-bold flex items-center gap-1.5 ${isOnline ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
                  {isOnline ? 'Online (Tempo Real)' : 'Offline (Cache Ativo)'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-600">Service Worker:</span>
                <span className="font-bold text-teal-700 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {isServiceWorkerActive ? 'Ativo & Registrado' : 'Instalando...'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-600">Última Sincronização:</span>
                <span className="font-medium text-zinc-800">{formattedTime}</span>
              </div>
            </div>

            {/* Dados Clínicos Protegidos */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                Dados Clínicos em Cache
              </h4>
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-200 text-center">
                  <Users className="w-4 h-4 text-teal-600 mx-auto mb-1" />
                  <div className="text-base font-extrabold text-teal-900">{safeCounts.residents}</div>
                  <div className="text-[10px] text-teal-700 font-medium">Residentes</div>
                </div>
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-center">
                  <Pill className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                  <div className="text-base font-extrabold text-amber-900">{safeCounts.medications}</div>
                  <div className="text-[10px] text-amber-700 font-medium">Medicamentos MAR</div>
                </div>
                <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-200 text-center">
                  <FileText className="w-4 h-4 text-sky-600 mx-auto mb-1" />
                  <div className="text-base font-extrabold text-sky-900">{safeCounts.evolutions}</div>
                  <div className="text-[10px] text-sky-700 font-medium">Prontuários</div>
                </div>
              </div>
            </div>

            {/* Informação Técnica */}
            <p className="text-xs text-zinc-500 leading-relaxed bg-zinc-50 p-3 rounded-xl border border-zinc-200">
              Caso o sinal Wi-Fi ou 4G/5G da residência terapêutica fique indisponível, a equipe de cuidadores e enfermagem mantém acesso irrestrito às prescrições, horários de administração, alergias e diagnósticos clínicos.
            </p>

            {/* Ações */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleManualSync}
                disabled={isSyncing}
                className="flex-1 py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Sincronizando Cache...' : 'Forçar Atualização de Cache'}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowDetailsModal(false)}
                className="py-2.5 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold rounded-xl transition-all"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
