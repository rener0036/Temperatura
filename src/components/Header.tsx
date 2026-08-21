import React from 'react';
import { WeatherStation, TemperatureUnit } from '../types';
import { 
  Thermometer, 
  Wind, 
  Activity, 
  Download, 
  Printer, 
  MapPin, 
  Radio, 
  Settings2,
  Calendar,
  Layers,
  RadioTower,
  Cpu
} from 'lucide-react';

interface HeaderProps {
  stations: WeatherStation[];
  selectedStation: WeatherStation;
  onSelectStation: (station: WeatherStation) => void;
  unit: TemperatureUnit;
  onToggleUnit: (unit: TemperatureUnit) => void;
  activeTab: string;
  onChangeTab: (tab: string) => void;
  onOpenReport: () => void;
  onOpenSettings: () => void;
  onExportCSV: () => void;
  liveSimulation: boolean;
  onToggleLive: () => void;
  isThingSpeakConnected?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  stations,
  selectedStation,
  onSelectStation,
  unit,
  onToggleUnit,
  activeTab,
  onChangeTab,
  onOpenReport,
  onOpenSettings,
  onExportCSV,
  liveSimulation,
  onToggleLive,
  isThingSpeakConnected = true,
}) => {
  const tabs = [
    { id: 'thingspeak', label: 'ThingSpeak Live & Sensores', icon: Radio },
    { id: 'overview', label: 'Visão Geral & Séries', icon: Activity },
    { id: 'heatmap', label: 'Matriz Diurna (Heatmap)', icon: Layers },
    { id: 'windrose', label: 'Rosa Térmica & Ventos', icon: Wind },
    { id: 'distribution', label: 'Distribuição & Boxplot', icon: Thermometer },
    { id: 'anomalies', label: 'Anomalias & Normais', icon: Calendar },
    { id: 'table', label: 'Tabela de Dados Diários', icon: Download },
  ];

  return (
    <header className="bg-[#0a0a0a] text-[#d1d5db] border-b border-[#1f2937] sticky top-0 z-30 font-mono">
      {/* Top Station & System Bar */}
      <div className="w-full px-4 sm:px-6 lg:px-8 border-b border-[#1f2937]/80">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between py-2.5 gap-3">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3.5">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-orange-500 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.8)] animate-pulse"></div>
              <span className="text-[10px] font-bold tracking-widest text-orange-500 uppercase">Live Thermal Feed</span>
            </div>
            <div className="h-4 w-px bg-[#1f2937] hidden sm:block"></div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tighter text-white uppercase flex items-center gap-2">
                MTR-12: Monitoramento Térmico Anual
                <span className="text-[10px] font-mono font-bold text-orange-400 border border-orange-500/50 px-1.5 py-0.5 bg-black hidden md:inline-flex items-center gap-1">
                  <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
                  THINGSPEAK #{selectedStation.channelId || '321770'}
                </span>
                <span className="text-[10px] font-mono font-normal text-gray-400 border border-[#1f2937] px-1.5 py-0.5 bg-black hidden lg:inline-block">
                  AGO/2025 – JUL/2026
                </span>
              </h1>
            </div>
          </div>

          {/* System Telemetry & Quick Controls */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Station dropdown */}
            <div className="relative flex items-center">
              <MapPin className="w-3.5 h-3.5 text-orange-400 absolute left-2.5 pointer-events-none" />
              <select
                id="station-selector"
                value={selectedStation.id}
                onChange={(e) => {
                  const found = stations.find((s) => s.id === e.target.value);
                  if (found) onSelectStation(found);
                }}
                className="pl-8 pr-7 py-1 bg-black hover:bg-[#111] text-xs font-mono font-medium text-gray-200 rounded-none border border-[#1f2937] focus:outline-none focus:border-orange-500 transition-all cursor-pointer uppercase tracking-tight"
              >
                {stations.map((station) => (
                  <option key={station.id} value={station.id} className="bg-black text-gray-200">
                    {station.code} // {station.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Temperature Unit Toggle */}
            <div className="flex items-center bg-black border border-[#1f2937]">
              <button
                id="btn-unit-c"
                onClick={() => onToggleUnit('C')}
                className={`px-2.5 py-1 text-xs font-mono font-bold transition-all ${
                  unit === 'C'
                    ? 'bg-orange-500 text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                °C
              </button>
              <button
                id="btn-unit-f"
                onClick={() => onToggleUnit('F')}
                className={`px-2.5 py-1 text-xs font-mono font-bold transition-all border-l border-[#1f2937] ${
                  unit === 'F'
                    ? 'bg-orange-500 text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                °F
              </button>
              <button
                id="btn-unit-k"
                onClick={() => onToggleUnit('K')}
                className={`px-2.5 py-1 text-xs font-mono font-bold transition-all border-l border-[#1f2937] ${
                  unit === 'K'
                    ? 'bg-orange-500 text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                K
              </button>
            </div>

            {/* Live simulation toggle */}
            <button
              id="btn-toggle-live"
              onClick={onToggleLive}
              title={liveSimulation ? 'Pausar Simulação em Tempo Real' : 'Iniciar Atualização em Tempo Real'}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-semibold border transition-all ${
                liveSimulation
                  ? 'bg-emerald-950/50 border-emerald-500 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                  : 'bg-black border-[#1f2937] text-gray-400 hover:text-gray-200 hover:border-gray-600'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${liveSimulation ? 'bg-emerald-400 animate-ping' : 'bg-gray-600'}`}></span>
              <span>{liveSimulation ? 'STREAM: ON' : 'STREAM: OFF'}</span>
            </button>

            {/* Export & Actions */}
            <div className="flex items-center gap-1">
              <button
                id="btn-export-csv"
                onClick={onExportCSV}
                title="Exportar dados 12 meses em CSV"
                className="px-2.5 py-1 bg-black hover:bg-[#111] text-gray-300 border border-[#1f2937] hover:border-orange-500/50 transition-all text-xs font-mono flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5 text-orange-400" />
                <span className="hidden sm:inline">CSV</span>
              </button>

              <button
                id="btn-open-report"
                onClick={onOpenReport}
                title="Emitir Laudo / Relatório Técnico"
                className="px-2.5 py-1 bg-black hover:bg-[#111] text-gray-300 border border-[#1f2937] hover:border-orange-500/50 transition-all text-xs font-mono flex items-center gap-1"
              >
                <Printer className="w-3.5 h-3.5 text-orange-400" />
                <span className="hidden sm:inline">LAUDO</span>
              </button>

              <button
                id="btn-open-station-settings"
                onClick={onOpenSettings}
                title="Metadados da Estação & Sensores"
                className="p-1 bg-black hover:bg-[#111] text-gray-300 border border-[#1f2937] hover:border-orange-500/50 transition-all"
              >
                <Settings2 className="w-4 h-4 text-orange-400" />
              </button>
            </div>

            {/* Status indicators */}
            <div className="hidden lg:flex items-center space-x-3 text-[10px] uppercase tracking-widest opacity-70 border-l border-[#1f2937] pl-3">
              <span>LAT: {selectedStation.coordinates.lat}°</span>
              <span>ALT: {selectedStation.coordinates.alt}M</span>
              <span className="text-emerald-400">STATUS: OK</span>
            </div>

          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="w-full px-4 sm:px-6 lg:px-8 bg-[#080808]">
        <div className="flex items-center space-x-1 overflow-x-auto py-1.5 scrollbar-none no-scrollbar">
          {tabs.map((tab, idx) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => onChangeTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono font-bold uppercase tracking-wider whitespace-nowrap transition-all border ${
                  isActive
                    ? 'bg-orange-500/10 text-orange-400 border-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.2)]'
                    : 'text-gray-400 hover:text-white bg-black border-[#1f2937]'
                }`}
              >
                <span className="text-[9px] opacity-60">0{idx + 1} //</span>
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-orange-400' : 'text-gray-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
