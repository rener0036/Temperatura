import React, { useState } from 'react';
import { WeatherStation } from '../types';
import { X, Settings, MapPin, Radio, Shield, Cpu, Activity, Key, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';
import { fetchThingSpeakData } from '../services/thingspeak';

interface StationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  station: WeatherStation;
  onUpdateStation?: (updated: WeatherStation) => void;
}

export const StationSettingsModal: React.FC<StationSettingsModalProps> = ({
  isOpen,
  onClose,
  station,
  onUpdateStation,
}) => {
  const [channelId, setChannelId] = useState(station.channelId ? String(station.channelId) : '321770');
  const [apiKey, setApiKey] = useState(station.readApiKey || '0EPAIXIM4UL9LIW9');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetchThingSpeakData(channelId.trim(), apiKey.trim(), 2);
      setTestResult({
        success: true,
        message: `Conexão bem-sucedida com "${res.channel.name}". Último entry ID: #${res.channel.last_entry_id}`,
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Falha ao conectar com a API ThingSpeak.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    if (onUpdateStation) {
      onUpdateStation({
        ...station,
        channelId: channelId.trim(),
        readApiKey: apiKey.trim(),
        isThingSpeak: true,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm font-mono">
      <div className="bg-[#080808] border border-[#1f2937] text-[#d1d5db] w-full max-w-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1f2937] bg-black">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-orange-500" />
            <h3 className="font-bold text-xs uppercase text-white tracking-wider">
              10 // CONFIGURAÇÃO DA ESTAÇÃO & CANAL THINGSPEAK
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white hover:bg-[#1f2937] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 text-xs">
          {/* Station identification */}
          <div className="p-3 bg-black border border-[#1f2937] flex items-center justify-between">
            <div>
              <span className="text-[9px] text-gray-400 block uppercase">Estação Ativa</span>
              <strong className="text-xs font-bold text-white uppercase">{station.name}</strong>
              <span className="text-gray-400 block mt-0.5 text-[10px] uppercase">{station.location}</span>
            </div>
            <span className="px-2 py-1 bg-black text-orange-400 font-bold border border-orange-500/50 text-[10px]">
              {station.code}
            </span>
          </div>

          {/* ThingSpeak API Parameters */}
          <div className="p-3 bg-black border border-orange-500/30 space-y-2.5">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-orange-400 uppercase">
              <Radio className="w-3.5 h-3.5" /> Parâmetros de Conexão ThingSpeak IoT
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] text-gray-400 block uppercase mb-1">ID do Canal (Channel ID):</label>
                <input
                  type="text"
                  value={channelId}
                  onChange={(e) => setChannelId(e.target.value)}
                  placeholder="321770"
                  className="w-full bg-[#111] border border-[#1f2937] focus:border-orange-500 px-2.5 py-1 text-white text-xs font-mono outline-none"
                />
              </div>
              <div>
                <label className="text-[9px] text-gray-400 block uppercase mb-1">Chave de Leitura (Read API Key):</label>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="0EPAIXIM4UL9LIW9"
                  className="w-full bg-[#111] border border-[#1f2937] focus:border-orange-500 px-2.5 py-1 text-white text-xs font-mono outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="flex items-center gap-1 px-2.5 py-1 bg-[#1f2937] hover:bg-gray-700 text-white text-[10px] font-bold uppercase transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${isTesting ? 'animate-spin' : ''}`} />
                {isTesting ? 'TESTANDO...' : 'TESTAR CONEXÃO'}
              </button>
              <span className="text-[9px] text-gray-500">FORMATO JSON REST API</span>
            </div>

            {testResult && (
              <div className={`p-2 text-[10px] flex items-start gap-1.5 ${
                testResult.success ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/40' : 'bg-red-950/40 text-red-300 border border-red-500/40'
              }`}>
                {testResult.success ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-400" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-400" />}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 bg-black border border-[#1f2937]">
              <span className="text-gray-400 block text-[9px] flex items-center gap-1 uppercase">
                <MapPin className="w-3 h-3 text-orange-500" /> LATITUDE / LONGITUDE
              </span>
              <span className="font-bold text-white font-mono text-xs block mt-1">
                {station.coordinates.lat}°, {station.coordinates.lon}°
              </span>
            </div>
            <div className="p-2.5 bg-black border border-[#1f2937]">
              <span className="text-gray-400 block text-[9px] flex items-center gap-1 uppercase">
                <Activity className="w-3 h-3 text-cyan-400" /> ALTITUDE BAROMÉTRICA
              </span>
              <span className="font-bold text-white font-mono text-xs block mt-1">
                {station.coordinates.alt} METROS
              </span>
            </div>
          </div>

          <div className="p-3 bg-black border border-[#1f2937] space-y-1.5">
            <span className="font-bold text-white block flex items-center gap-1.5 text-[10px] uppercase text-orange-400">
              <Cpu className="w-3.5 h-3.5" />
              Sensores Ativos (Campos ThingSpeak)
            </span>
            <div className="text-gray-300 grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] uppercase">
              <div>• FIELD 1: <strong className="text-white">TEMPERATURA (°C)</strong></div>
              <div>• FIELD 2: <strong className="text-white">UMIDADE RELATIVA (%)</strong></div>
              <div>• FIELD 3: <strong className="text-white">PRESSÃO ATM (HPA)</strong></div>
              <div>• FIELD 4: <strong className="text-white">VEL. VENTO (KM/H)</strong></div>
              <div>• FIELD 5: <strong className="text-white">PONTO ORVALHO (°C)</strong></div>
              <div>• FIELD 6: <strong className="text-white">DIR. VENTO (°)</strong></div>
              <div>• FIELD 7: <strong className="text-white">MONÓXIDO CO (PPM)</strong></div>
              <div>• FIELD 8: <strong className="text-white">DIÓXIDO CO2 (PPM)</strong></div>
            </div>
          </div>

          <div className="p-2.5 bg-black border border-emerald-500/30 text-emerald-400 text-[10px] flex items-center gap-2 uppercase">
            <Shield className="w-3.5 h-3.5 shrink-0" />
            <span>Sistema em conformidade com as diretrizes da Organização Meteorológica Mundial (OMM).</span>
          </div>
        </div>

        <div className="px-4 py-2.5 border-t border-[#1f2937] bg-black flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3 py-1 bg-black border border-[#1f2937] hover:bg-gray-900 text-gray-300 text-[10px] font-bold uppercase transition-colors"
          >
            CANCELAR
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1 bg-orange-500 hover:bg-orange-600 text-black text-[10px] font-bold uppercase transition-colors"
          >
            SALVAR & ATUALIZAR
          </button>
        </div>
      </div>
    </div>
  );
};
