import React, { useState } from 'react';
import { Resident, News2Score, Timeline360Event, ClinicalAlert } from '../types';
import { calculateNEWS2Risk } from '../utils/news2Calculator';
import { 
  Activity, 
  Heart, 
  Thermometer, 
  Wind, 
  Zap, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  ShieldAlert,
  Radio,
  Clock
} from 'lucide-react';

interface IoTVitalsTelemetryModalProps {
  resident: Resident | null;
  onClose: () => void;
  onUpdateVitals: (
    residentId: string, 
    vitals: {
      spO2: number;
      heartRate: number;
      systolicBP: number;
      diastolicBP: number;
      temp: number;
      respRate: number;
      consciousness: 'Alerta' | 'Voz' | 'Dor' | 'Inconsciente';
      supplementalO2: boolean;
    }
  ) => void;
}

export const IoTVitalsTelemetryModal: React.FC<IoTVitalsTelemetryModalProps> = ({
  resident,
  onClose,
  onUpdateVitals
}) => {
  // Local state for interactive live simulation
  const [spO2, setSpO2] = useState<number>(97);
  const [heartRate, setHeartRate] = useState<number>(76);
  const [systolicBP, setSystolicBP] = useState<number>(122);
  const [diastolicBP, setDiastolicBP] = useState<number>(78);
  const [temp, setTemp] = useState<number>(36.6);
  const [respRate, setRespRate] = useState<number>(16);
  const [consciousness, setConsciousness] = useState<'Alerta' | 'Voz' | 'Dor' | 'Inconsciente'>('Alerta');
  const [supplementalO2, setSupplementalO2] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  if (!resident) return null;

  // NEWS2 calculation using official utility
  const news2Result = calculateNEWS2Risk({
    systolicBP,
    diastolicBP,
    heartRate,
    temp,
    spO2,
    respRate,
    consciousness,
    supplementalO2
  });

  const currentNews2Score = news2Result.totalScore;
  const currentNews2Risk = news2Result.riskLevel;

  // Presets
  const applyPreset = (type: 'normal' | 'hypoxia' | 'fever' | 'critical') => {
    setIsSimulating(true);
    setTimeout(() => {
      if (type === 'normal') {
        setSpO2(98);
        setHeartRate(72);
        setSystolicBP(120);
        setDiastolicBP(80);
        setTemp(36.5);
        setRespRate(15);
        setConsciousness('Alerta');
        setSupplementalO2(false);
      } else if (type === 'hypoxia') {
        setSpO2(89);
        setHeartRate(104);
        setSystolicBP(115);
        setDiastolicBP(75);
        setTemp(37.1);
        setRespRate(24);
        setConsciousness('Alerta');
        setSupplementalO2(true);
      } else if (type === 'fever') {
        setSpO2(95);
        setHeartRate(112);
        setSystolicBP(128);
        setDiastolicBP(82);
        setTemp(38.8);
        setRespRate(22);
        setConsciousness('Alerta');
        setSupplementalO2(false);
      } else if (type === 'critical') {
        setSpO2(86);
        setHeartRate(138);
        setSystolicBP(85);
        setDiastolicBP(55);
        setTemp(39.4);
        setRespRate(28);
        setConsciousness('Voz');
        setSupplementalO2(true);
      }
      setIsSimulating(false);
    }, 600);
  };

  const handleTransmitVitals = () => {
    onUpdateVitals(resident.id, {
      spO2,
      heartRate,
      systolicBP,
      diastolicBP,
      temp,
      respRate,
      consciousness,
      supplementalO2
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 text-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 relative">
              <Radio className="w-5 h-5 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Telemetria de Sinais Vitais IoT (Beira-Leito)</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Ao Vivo
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Residente: <strong>{resident.name}</strong> ({resident.room})
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

        {/* Modal Body */}
        <div className="p-6 space-y-6">

          {/* NEWS2 Score Real-Time Banner */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            currentNews2Risk === 'Crítico' ? 'bg-rose-950/80 border-rose-800 text-rose-200' :
            currentNews2Risk === 'Alto' ? 'bg-amber-950/80 border-amber-800 text-amber-200' :
            currentNews2Risk === 'Moderado' ? 'bg-yellow-950/80 border-yellow-800 text-yellow-200' :
            'bg-emerald-950/80 border-emerald-800 text-emerald-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-black/30">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider font-bold block">
                  Algoritmo NEWS2 (National Early Warning Score)
                </span>
                <span className="text-lg font-black">
                  Score Calculado: {currentNews2Score} / 20 — Risco {currentNews2Risk}
                </span>
              </div>
            </div>

            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-black/40 border border-white/10">
              Atualização Instantânea
            </span>
          </div>

          {/* Preset Simulation Buttons */}
          <div className="space-y-2">
            <span className="text-xs text-zinc-400 font-bold block">Simular Evento/Estresse do Sensor IoT:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <button
                onClick={() => applyPreset('normal')}
                disabled={isSimulating}
                className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-semibold transition-all flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Estável / Normal
              </button>

              <button
                onClick={() => applyPreset('hypoxia')}
                disabled={isSimulating}
                className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-amber-800/60 font-semibold transition-all flex items-center justify-center gap-1.5"
              >
                <Wind className="w-3.5 h-3.5 text-amber-400" />
                Hipóxia Leve (89%)
              </button>

              <button
                onClick={() => applyPreset('fever')}
                disabled={isSimulating}
                className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-orange-300 border border-orange-800/60 font-semibold transition-all flex items-center justify-center gap-1.5"
              >
                <Thermometer className="w-3.5 h-3.5 text-orange-400" />
                Febril (38.8°C)
              </button>

              <button
                onClick={() => applyPreset('critical')}
                disabled={isSimulating}
                className="p-2.5 rounded-xl bg-rose-900/60 hover:bg-rose-900 text-rose-200 border border-rose-700 font-bold transition-all flex items-center justify-center gap-1.5 animate-pulse"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                Crise Crítica IoT
              </button>
            </div>
          </div>

          {/* Vitals Controls Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            
            {/* SpO2 */}
            <div className="p-3 bg-zinc-800/60 rounded-xl border border-zinc-700/60 space-y-1">
              <div className="flex items-center justify-between text-zinc-400 font-semibold">
                <span className="flex items-center gap-1"><Wind className="w-3.5 h-3.5 text-cyan-400" /> Sat. Oxigênio (SpO2)</span>
                <span className="text-cyan-400 font-bold">{spO2}%</span>
              </div>
              <input 
                type="range" min="70" max="100" value={spO2} 
                onChange={(e) => setSpO2(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer" 
              />
            </div>

            {/* Heart Rate */}
            <div className="p-3 bg-zinc-800/60 rounded-xl border border-zinc-700/60 space-y-1">
              <div className="flex items-center justify-between text-zinc-400 font-semibold">
                <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-rose-400" /> Freq. Cardíaca</span>
                <span className="text-rose-400 font-bold">{heartRate} bpm</span>
              </div>
              <input 
                type="range" min="30" max="180" value={heartRate} 
                onChange={(e) => setHeartRate(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer" 
              />
            </div>

            {/* Systolic BP */}
            <div className="p-3 bg-zinc-800/60 rounded-xl border border-zinc-700/60 space-y-1">
              <div className="flex items-center justify-between text-zinc-400 font-semibold">
                <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-amber-400" /> Pressão Sistólica</span>
                <span className="text-amber-400 font-bold">{systolicBP} mmHg</span>
              </div>
              <input 
                type="range" min="70" max="230" value={systolicBP} 
                onChange={(e) => setSystolicBP(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer" 
              />
            </div>

            {/* Temperature */}
            <div className="p-3 bg-zinc-800/60 rounded-xl border border-zinc-700/60 space-y-1">
              <div className="flex items-center justify-between text-zinc-400 font-semibold">
                <span className="flex items-center gap-1"><Thermometer className="w-3.5 h-3.5 text-orange-400" /> Temperatura</span>
                <span className="text-orange-400 font-bold">{temp}°C</span>
              </div>
              <input 
                type="range" min="34" max="41" step="0.1" value={temp} 
                onChange={(e) => setTemp(Number(e.target.value))}
                className="w-full accent-orange-500 cursor-pointer" 
              />
            </div>

            {/* Resp Rate */}
            <div className="p-3 bg-zinc-800/60 rounded-xl border border-zinc-700/60 space-y-1">
              <div className="flex items-center justify-between text-zinc-400 font-semibold">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-purple-400" /> Freq. Respiratória</span>
                <span className="text-purple-400 font-bold">{respRate} irpm</span>
              </div>
              <input 
                type="range" min="6" max="35" value={respRate} 
                onChange={(e) => setRespRate(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer" 
              />
            </div>

            {/* Supplemental Oxygen Toggle */}
            <div className="p-3 bg-zinc-800/60 rounded-xl border border-zinc-700/60 flex items-center justify-between">
              <span className="text-zinc-400 font-semibold">Oxigênio Suplementar?</span>
              <button
                onClick={() => setSupplementalO2(!supplementalO2)}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  supplementalO2 ? 'bg-cyan-600 text-white' : 'bg-zinc-700 text-zinc-400'
                }`}
              >
                {supplementalO2 ? 'SIM (2L/min)' : 'NÃO (Ar Amb.)'}
              </button>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between">
          <span className="text-[11px] text-zinc-500 flex items-center gap-1">
            <Radio className="w-3.5 h-3.5 text-teal-400" />
            Conectado via protocolo HL7/FHIR IoT Gateway
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleTransmitVitals}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg flex items-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" />
              Transmitir Vitais & Recalcular NEWS2
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
