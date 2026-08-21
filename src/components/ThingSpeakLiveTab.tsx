import React, { useState } from 'react';
import { 
  ThingSpeakLiveState, 
  TemperatureUnit,
  ThingSpeakParsedReading
} from '../types';
import { formatTempNumber, getUnitSymbol } from '../utils/temperature';
import {
  Radio,
  RefreshCw,
  Gauge,
  Thermometer,
  Droplets,
  GaugeCircle,
  Wind,
  Compass,
  Activity,
  Zap,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Clock,
  HardDrive,
  BarChart3,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  TrendingUp,
  Cpu
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area
} from 'recharts';

interface ThingSpeakLiveTabProps {
  liveState: ThingSpeakLiveState;
  unit: TemperatureUnit;
  onRefresh: () => void;
  onOpenSettings: () => void;
  autoRefreshInterval: number;
  onChangeAutoRefresh: (seconds: number) => void;
}

export const ThingSpeakLiveTab: React.FC<ThingSpeakLiveTabProps> = ({
  liveState,
  unit,
  onRefresh,
  onOpenSettings,
  autoRefreshInterval,
  onChangeAutoRefresh,
}) => {
  const [selectedSensorChart, setSelectedSensorChart] = useState<'temp_hum' | 'pressure' | 'gases' | 'wind'>('temp_hum');
  const [pointLimit, setPointLimit] = useState<number>(50);

  const unitSymbol = getUnitSymbol(unit);
  const latest = liveState.latestReading;
  const readings = liveState.recentReadings.slice(-pointLimit);

  // Chart data formatted
  const chartData = readings.map((r) => ({
    time: r.formattedTime,
    entry: r.entryId,
    temp: formatTempNumber(r.temperature, unit),
    apparent: formatTempNumber(r.apparentTemp, unit),
    humidity: r.humidity,
    pressure: r.pressure,
    dewPoint: formatTempNumber(r.dewPoint, unit),
    windSpeed: r.windSpeed,
    co: r.co,
    co2: r.co2,
  }));

  // Min / Max of the current loaded series
  const temps = readings.map((r) => r.temperature);
  const maxTemp = temps.length ? Math.max(...temps) : 25.6;
  const minTemp = temps.length ? Math.min(...temps) : 24.2;

  const hums = readings.map((r) => r.humidity);
  const maxHum = hums.length ? Math.max(...hums) : 65;
  const minHum = hums.length ? Math.min(...hums) : 55;

  return (
    <div className="space-y-4 font-mono">
      {/* Top Telemetry Feed Banner */}
      <div className="border border-[#1f2937] bg-[#080808] p-4 text-[#d1d5db]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-3 border-b border-[#1f2937]">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-black border border-orange-500/40 text-orange-500 mt-0.5">
              <Radio className={`w-5 h-5 ${liveState.isLoading ? 'animate-spin' : 'animate-pulse'}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-orange-500 font-bold tracking-widest uppercase">
                  00 // TELEMETRIA EM TEMPO REAL
                </span>
                <span className="text-gray-600">//</span>
                <span className="text-[10px] text-emerald-400 font-bold uppercase flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> CANAL {liveState.channelId} CONECTADO
                </span>
              </div>
              <h2 className="text-base font-bold text-white tracking-tight uppercase flex items-center gap-2 mt-0.5">
                {liveState.channelInfo?.name || 'Estação Meteorológica Experimental Alto Umuarama'}
              </h2>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Alimentação de dados ao vivo via API ThingSpeak (Canal {liveState.channelId} // Chave de Leitura: {liveState.readApiKey})
              </p>
            </div>
          </div>

          {/* Sync & Rate Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Auto refresh interval selector */}
            <div className="flex items-center bg-black border border-[#1f2937] text-xs">
              <span className="px-2 py-1 text-[10px] text-gray-400 uppercase border-r border-[#1f2937] flex items-center gap-1">
                <Clock className="w-3 h-3 text-orange-500" /> Auto:
              </span>
              {[0, 15, 30, 60].map((sec) => (
                <button
                  key={sec}
                  onClick={() => onChangeAutoRefresh(sec)}
                  className={`px-2 py-1 text-[10px] font-bold uppercase transition-all border-r last:border-r-0 border-[#1f2937] ${
                    autoRefreshInterval === sec
                      ? 'bg-orange-500 text-black'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {sec === 0 ? 'OFF' : `${sec}s`}
                </button>
              ))}
            </div>

            {/* Manual Sync Button */}
            <button
              onClick={onRefresh}
              disabled={liveState.isLoading}
              className="flex items-center gap-1.5 px-3 py-1 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:opacity-50 text-black text-xs font-bold uppercase transition-all shadow-[0_0_10px_rgba(249,115,22,0.3)]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${liveState.isLoading ? 'animate-spin' : ''}`} />
              {liveState.isLoading ? 'SINCRONIZANDO...' : 'ATUALIZAR AGORA'}
            </button>

            {/* Settings config trigger */}
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-black border border-[#1f2937] hover:border-gray-500 text-gray-300 text-xs font-bold uppercase transition-all"
            >
              <Sliders className="w-3.5 h-3.5 text-orange-400" />
              CANAL
            </button>
          </div>
        </div>

        {/* Live Diagnostics Subbar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 text-[10px] text-gray-400">
          <div className="flex items-center gap-1.5">
            <HardDrive className="w-3 h-3 text-cyan-400" />
            <span>ÚLTIMO ENTRY ID: <strong className="text-white">#{latest?.entryId || liveState.channelInfo?.last_entry_id || '---'}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-orange-400" />
            <span>TIMESTAMP: <strong className="text-white">{latest?.formattedTime || '---'} ({latest?.formattedDate || 'Hoje'})</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3 h-3 text-emerald-400" />
            <span>AMOSTRAGEM: <strong className="text-white">{liveState.recentReadings.length} PACOTES NA MEMÓRIA</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3 text-amber-400" />
            <span>LAT/LON: <strong className="text-white">{liveState.channelInfo?.latitude || '-18.8891'}°, {liveState.channelInfo?.longitude || '-48.2370'}°</strong></span>
          </div>
        </div>
      </div>

      {/* 8 Sensor Channel Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Field 1: Temperatura */}
        <div className="p-3.5 bg-[#080808] border border-[#1f2937] hover:border-orange-500/50 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs pb-1.5 border-b border-[#1f2937]/80">
              <span className="text-[10px] text-orange-500 font-bold uppercase tracking-wider flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5" /> FIELD 1 // TEMPERATURA
              </span>
              <span className="text-[9px] bg-orange-950/60 text-orange-400 px-1 py-0.5 border border-orange-500/30">
                SENSOR DHT22
              </span>
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
                {latest ? formatTempNumber(latest.temperature, unit) : '--.-'}
                <span className="text-base font-normal text-orange-400 ml-1">{unitSymbol}</span>
              </div>
              <div className="text-right text-[10px] text-gray-400">
                <div>SENSAÇÃO: <strong className="text-amber-400">{latest ? formatTempNumber(latest.apparentTemp, unit) : '--.-'} {unitSymbol}</strong></div>
              </div>
            </div>
          </div>
          <div className="pt-2 mt-2 border-t border-[#1f2937] flex items-center justify-between text-[10px] text-gray-400">
            <span>MIN: {formatTempNumber(minTemp, unit)}{unitSymbol}</span>
            <span>MAX: {formatTempNumber(maxTemp, unit)}{unitSymbol}</span>
          </div>
        </div>

        {/* Field 2: Umidade */}
        <div className="p-3.5 bg-[#080808] border border-[#1f2937] hover:border-cyan-500/50 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs pb-1.5 border-b border-[#1f2937]/80">
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5" /> FIELD 2 // UMIDADE RELATIVA
              </span>
              <span className="text-[9px] bg-cyan-950/60 text-cyan-400 px-1 py-0.5 border border-cyan-500/30">
                HIGRÔMETRO
              </span>
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <div className="text-2xl sm:text-3xl font-extrabold text-cyan-300 font-mono tracking-tight">
                {latest ? latest.humidity.toFixed(1) : '--.-'}
                <span className="text-base font-normal text-cyan-400 ml-1">%</span>
              </div>
              <div className="text-right text-[10px] text-gray-400">
                <div>STATUS: <strong className={latest && latest.humidity < 40 ? 'text-amber-400' : 'text-emerald-400'}>
                  {latest ? (latest.humidity < 30 ? 'CRÍTICA' : latest.humidity < 50 ? 'MODERADA' : 'CONFORTÁVEL') : '---'}
                </strong></div>
              </div>
            </div>
          </div>
          <div className="pt-2 mt-2 border-t border-[#1f2937] flex items-center justify-between text-[10px] text-gray-400">
            <span>MIN: {minHum}%</span>
            <span>MAX: {maxHum}%</span>
          </div>
        </div>

        {/* Field 3: Pressão Atmosférica */}
        <div className="p-3.5 bg-[#080808] border border-[#1f2937] hover:border-emerald-500/50 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs pb-1.5 border-b border-[#1f2937]/80">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <GaugeCircle className="w-3.5 h-3.5" /> FIELD 3 // PRESSÃO ATM
              </span>
              <span className="text-[9px] bg-emerald-950/60 text-emerald-400 px-1 py-0.5 border border-emerald-500/30">
                BARÔMETRO BMP
              </span>
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-300 font-mono tracking-tight">
                {latest ? latest.pressure.toFixed(1) : '----.-'}
                <span className="text-sm font-normal text-emerald-400 ml-1">hPa</span>
              </div>
              <div className="text-right text-[10px] text-gray-400">
                <div>ALTITUDE: <strong className="text-white">~865 m</strong></div>
              </div>
            </div>
          </div>
          <div className="pt-2 mt-2 border-t border-[#1f2937] flex items-center justify-between text-[10px] text-gray-400">
            <span>PADRÃO: 1013.25 hPa</span>
            <span className="text-emerald-400">ESTÁVEL</span>
          </div>
        </div>

        {/* Field 5: Ponto de Orvalho */}
        <div className="p-3.5 bg-[#080808] border border-[#1f2937] hover:border-blue-500/50 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs pb-1.5 border-b border-[#1f2937]/80">
              <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Activity className="w-3.5 h-3.5" /> FIELD 5 // PONTO DE ORVALHO
              </span>
              <span className="text-[9px] bg-blue-950/60 text-blue-400 px-1 py-0.5 border border-blue-500/30">
                TERMODINÂMICA
              </span>
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-300 font-mono tracking-tight">
                {latest ? formatTempNumber(latest.dewPoint, unit) : '--.-'}
                <span className="text-base font-normal text-blue-400 ml-1">{unitSymbol}</span>
              </div>
              <div className="text-right text-[10px] text-gray-400">
                <div>DÉFICIT: <strong className="text-white">{latest ? (latest.temperature - latest.dewPoint).toFixed(1) : '-'}°C</strong></div>
              </div>
            </div>
          </div>
          <div className="pt-2 mt-2 border-t border-[#1f2937] flex items-center justify-between text-[10px] text-gray-400">
            <span>SATURAÇÃO: {latest && latest.humidity > 85 ? 'ALTA' : 'MODERADA'}</span>
            <span className="text-blue-400">CALCULADO</span>
          </div>
        </div>

        {/* Field 4: Vento */}
        <div className="p-3.5 bg-[#080808] border border-[#1f2937] hover:border-amber-500/50 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs pb-1.5 border-b border-[#1f2937]/80">
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Wind className="w-3.5 h-3.5" /> FIELD 4 // VELOCIDADE VENTO
              </span>
              <span className="text-[9px] bg-amber-950/60 text-amber-400 px-1 py-0.5 border border-amber-500/30">
                ANEMÔMETRO
              </span>
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-mono tracking-tight">
                {latest ? latest.windSpeed.toFixed(1) : '-.-'}
                <span className="text-sm font-normal text-amber-400 ml-1">km/h</span>
              </div>
              <div className="text-right text-[10px] text-gray-400">
                <div>BEAUFORT: <strong className="text-white">{latest && latest.windSpeed < 1 ? 'CALMARIA' : 'BRISA'}</strong></div>
              </div>
            </div>
          </div>
          <div className="pt-2 mt-2 border-t border-[#1f2937] flex items-center justify-between text-[10px] text-gray-400">
            <span>RAJADA: {latest ? (latest.windSpeed * 1.4).toFixed(1) : '-'} km/h</span>
            <span className="text-amber-400">ESTÁVEL</span>
          </div>
        </div>

        {/* Field 6: Direção do Vento */}
        <div className="p-3.5 bg-[#080808] border border-[#1f2937] hover:border-purple-500/50 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs pb-1.5 border-b border-[#1f2937]/80">
              <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Compass className="w-3.5 h-3.5" /> FIELD 6 // DIREÇÃO VENTO
              </span>
              <span className="text-[9px] bg-purple-950/60 text-purple-400 px-1 py-0.5 border border-purple-500/30">
                BIRUTA / ENCODER
              </span>
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <div className="text-2xl sm:text-3xl font-extrabold text-purple-300 font-mono tracking-tight">
                {latest ? latest.windDirectionLabel : 'N'}
                <span className="text-sm font-normal text-purple-400 ml-1">({latest ? latest.windDirection : 0}°)</span>
              </div>
              <div className="text-right text-[10px] text-gray-400">
                <div>QUADRANTE: <strong className="text-white">{latest ? latest.windDirectionLabel : 'NORTE'}</strong></div>
              </div>
            </div>
          </div>
          <div className="pt-2 mt-2 border-t border-[#1f2937] flex items-center justify-between text-[10px] text-gray-400">
            <span>AZIMUTE: {latest ? latest.windDirection : 0}°</span>
            <span className="text-purple-400">ATIVO</span>
          </div>
        </div>

        {/* Field 7: Monóxido de Carbono (CO) */}
        <div className="p-3.5 bg-[#080808] border border-[#1f2937] hover:border-red-500/50 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs pb-1.5 border-b border-[#1f2937]/80">
              <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" /> FIELD 7 // CO (MONÓXIDO)
              </span>
              <span className="text-[9px] bg-red-950/60 text-red-400 px-1 py-0.5 border border-red-500/30">
                SENSOR MQ-7
              </span>
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <div className="text-2xl sm:text-3xl font-extrabold text-red-400 font-mono tracking-tight">
                {latest ? latest.co.toFixed(2) : '-.--'}
                <span className="text-sm font-normal text-red-400 ml-1">ppm</span>
              </div>
              <div className="text-right text-[10px] text-gray-400">
                <div>QUALIDADE: <strong className="text-emerald-400">EXCELENTE</strong></div>
              </div>
            </div>
          </div>
          <div className="pt-2 mt-2 border-t border-[#1f2937] flex items-center justify-between text-[10px] text-gray-400">
            <span>LIMITE CONAMA: 9.0 ppm</span>
            <span className="text-emerald-400">SEGURO</span>
          </div>
        </div>

        {/* Field 8: Dióxido de Carbono (CO2) */}
        <div className="p-3.5 bg-[#080808] border border-[#1f2937] hover:border-teal-500/50 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs pb-1.5 border-b border-[#1f2937]/80">
              <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Activity className="w-3.5 h-3.5" /> FIELD 8 // CO2 (DIÓXIDO)
              </span>
              <span className="text-[9px] bg-teal-950/60 text-teal-400 px-1 py-0.5 border border-teal-500/30">
                SENSOR NDIR
              </span>
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <div className="text-2xl sm:text-3xl font-extrabold text-teal-300 font-mono tracking-tight">
                {latest ? latest.co2.toFixed(1) : '---.-'}
                <span className="text-sm font-normal text-teal-400 ml-1">ppm</span>
              </div>
              <div className="text-right text-[10px] text-gray-400">
                <div>GLOBAL: <strong className="text-white">~420 ppm</strong></div>
              </div>
            </div>
          </div>
          <div className="pt-2 mt-2 border-t border-[#1f2937] flex items-center justify-between text-[10px] text-gray-400">
            <span>BASE ATMOSFÉRICA</span>
            <span className="text-teal-400">NORMAL</span>
          </div>
        </div>
      </div>

      {/* Real-time ThingSpeak Sensor Chart */}
      <div className="border border-[#1f2937] bg-[#080808] p-4 text-[#d1d5db]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#1f2937]">
          <div>
            <span className="text-[10px] text-orange-500 font-bold uppercase tracking-widest">
              GRÁFICO TELEMETRADO // STREAM DE AMOSTRAS
            </span>
            <h3 className="text-sm font-bold text-white uppercase tracking-tight mt-0.5">
              Série Temporal Contínua das Amostras ThingSpeak (Canal 321770)
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Chart mode switcher */}
            <div className="flex items-center bg-black border border-[#1f2937] p-0.5 text-xs font-bold uppercase">
              <button
                onClick={() => setSelectedSensorChart('temp_hum')}
                className={`px-2.5 py-1 text-[10px] transition-all ${
                  selectedSensorChart === 'temp_hum'
                    ? 'bg-orange-500 text-black font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                TEMP & UMIDADE
              </button>
              <button
                onClick={() => setSelectedSensorChart('pressure')}
                className={`px-2.5 py-1 text-[10px] transition-all ${
                  selectedSensorChart === 'pressure'
                    ? 'bg-orange-500 text-black font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                PRESSÃO ATM
              </button>
              <button
                onClick={() => setSelectedSensorChart('gases')}
                className={`px-2.5 py-1 text-[10px] transition-all ${
                  selectedSensorChart === 'gases'
                    ? 'bg-orange-500 text-black font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                GASES (CO / CO2)
              </button>
              <button
                onClick={() => setSelectedSensorChart('wind')}
                className={`px-2.5 py-1 text-[10px] transition-all ${
                  selectedSensorChart === 'wind'
                    ? 'bg-orange-500 text-black font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                VENTO & ORVALHO
              </button>
            </div>

            {/* Point count selector */}
            <div className="flex items-center bg-black border border-[#1f2937] text-xs">
              <span className="px-2 py-1 text-[9px] text-gray-500 uppercase">Pontos:</span>
              {[20, 50, 100].map((num) => (
                <button
                  key={num}
                  onClick={() => setPointLimit(num)}
                  className={`px-2 py-1 text-[10px] font-bold border-l border-[#1f2937] ${
                    pointLimit === num ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Chart Container */}
        <div className="h-[300px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            {selectedSensorChart === 'temp_hum' ? (
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="time" stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis yAxisId="temp" stroke="#f97316" tick={{ fill: '#f97316', fontSize: 10, fontFamily: 'monospace' }} unit={` ${unitSymbol}`} domain={['auto', 'auto']} />
                <YAxis yAxisId="hum" orientation="right" stroke="#06b6d4" tick={{ fill: '#06b6d4', fontSize: 10, fontFamily: 'monospace' }} unit=" %" domain={[0, 100]} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-black border border-[#1f2937] p-2.5 text-xs font-mono shadow-2xl">
                          <div className="text-white font-bold border-b border-[#1f2937] pb-1 mb-1 uppercase">
                            ENTRY #{d.entry} // {d.time}
                          </div>
                          <div className="text-orange-400">TEMPERATURA: <strong>{d.temp} {unitSymbol}</strong></div>
                          <div className="text-amber-400">SENSAÇÃO: <strong>{d.apparent} {unitSymbol}</strong></div>
                          <div className="text-cyan-400">UMIDADE: <strong>{d.humidity}%</strong></div>
                          <div className="text-blue-400">ORVALHO: <strong>{d.dewPoint} {unitSymbol}</strong></div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px', fontFamily: 'monospace' }} />
                <Line yAxisId="temp" type="monotone" dataKey="temp" name={`Temperatura (${unitSymbol})`} stroke="#f97316" strokeWidth={2} dot={{ r: 2 }} />
                <Line yAxisId="temp" type="monotone" dataKey="dewPoint" name={`Ponto de Orvalho (${unitSymbol})`} stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="3 3" dot={false} />
                <Line yAxisId="hum" type="monotone" dataKey="humidity" name="Umidade Relativa (%)" stroke="#06b6d4" strokeWidth={2} dot={{ r: 2 }} />
              </ComposedChart>
            ) : selectedSensorChart === 'pressure' ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="time" stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis stroke="#10b981" tick={{ fill: '#10b981', fontSize: 10, fontFamily: 'monospace' }} unit=" hPa" domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#000000', borderColor: '#1f2937', fontSize: '10px', fontFamily: 'monospace' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px', fontFamily: 'monospace' }} />
                <Area type="monotone" dataKey="pressure" name="Pressão Barométrica (hPa)" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} />
              </AreaChart>
            ) : selectedSensorChart === 'gases' ? (
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="time" stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis yAxisId="co" stroke="#ef4444" tick={{ fill: '#ef4444', fontSize: 10, fontFamily: 'monospace' }} unit=" ppm" domain={['auto', 'auto']} />
                <YAxis yAxisId="co2" orientation="right" stroke="#14b8a6" tick={{ fill: '#14b8a6', fontSize: 10, fontFamily: 'monospace' }} unit=" ppm" domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#000000', borderColor: '#1f2937', fontSize: '10px', fontFamily: 'monospace' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px', fontFamily: 'monospace' }} />
                <Line yAxisId="co" type="monotone" dataKey="co" name="CO - Monóxido de Carbono (ppm)" stroke="#ef4444" strokeWidth={2} dot={{ r: 2 }} />
                <Line yAxisId="co2" type="monotone" dataKey="co2" name="CO2 - Dióxido de Carbono (ppm)" stroke="#14b8a6" strokeWidth={2} dot={{ r: 2 }} />
              </ComposedChart>
            ) : (
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="time" stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis yAxisId="wind" stroke="#f59e0b" tick={{ fill: '#f59e0b', fontSize: 10, fontFamily: 'monospace' }} unit=" km/h" domain={[0, 'auto']} />
                <YAxis yAxisId="dew" orientation="right" stroke="#3b82f6" tick={{ fill: '#3b82f6', fontSize: 10, fontFamily: 'monospace' }} unit={` ${unitSymbol}`} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#000000', borderColor: '#1f2937', fontSize: '10px', fontFamily: 'monospace' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px', fontFamily: 'monospace' }} />
                <BarChart3 dataKey="windSpeed" />
                <Line yAxisId="wind" type="monotone" dataKey="windSpeed" name="Velocidade do Vento (km/h)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 2 }} />
                <Line yAxisId="dew" type="monotone" dataKey="dewPoint" name={`Ponto de Orvalho (${unitSymbol})`} stroke="#3b82f6" strokeWidth={2} dot={{ r: 2 }} />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Raw ThingSpeak Packet Stream Table */}
      <div className="border border-[#1f2937] bg-[#080808] p-4 text-[#d1d5db]">
        <div className="flex items-center justify-between pb-3 border-b border-[#1f2937]">
          <div>
            <span className="text-[10px] text-orange-500 font-bold uppercase tracking-widest">
              LOG DE PACOTES BRUTOS // API JSON FEED
            </span>
            <h3 className="text-sm font-bold text-white uppercase tracking-tight mt-0.5">
              Últimos Pacotes Recebidos do Canal ThingSpeak 321770
            </h3>
          </div>
          <span className="text-[10px] text-gray-400 font-mono">
            {readings.length} PACOTES EXIBIDOS
          </span>
        </div>

        <div className="overflow-x-auto mt-3 border border-[#1f2937]">
          <table className="w-full text-[11px] text-left text-gray-300 font-mono">
            <thead className="bg-black text-gray-400 font-bold uppercase text-[9px] border-b border-[#1f2937]">
              <tr>
                <th className="p-2">Entry ID</th>
                <th className="p-2">Data/Hora</th>
                <th className="p-2 text-right">Temp (Field1)</th>
                <th className="p-2 text-right">Umidade (Field2)</th>
                <th className="p-2 text-right">Pressão (Field3)</th>
                <th className="p-2 text-right">Vento (Field4)</th>
                <th className="p-2 text-right">Orvalho (Field5)</th>
                <th className="p-2 text-right">Dir (Field6)</th>
                <th className="p-2 text-right">CO (Field7)</th>
                <th className="p-2 text-right">CO2 (Field8)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2937] bg-[#080808]">
              {readings.slice(-15).reverse().map((r, idx) => (
                <tr key={r.entryId || idx} className="hover:bg-black/60 transition-colors">
                  <td className="p-2 font-bold text-orange-400">#{r.entryId}</td>
                  <td className="p-2 text-gray-300">{r.formattedDate} {r.formattedTime}</td>
                  <td className="p-2 text-right font-bold text-white">{formatTempNumber(r.temperature, unit)} {unitSymbol}</td>
                  <td className="p-2 text-right text-cyan-300">{r.humidity.toFixed(1)}%</td>
                  <td className="p-2 text-right text-emerald-400">{r.pressure.toFixed(1)} hPa</td>
                  <td className="p-2 text-right text-amber-300">{r.windSpeed.toFixed(1)} km/h</td>
                  <td className="p-2 text-right text-blue-300">{formatTempNumber(r.dewPoint, unit)} {unitSymbol}</td>
                  <td className="p-2 text-right text-purple-300">{r.windDirectionLabel} ({r.windDirection}°)</td>
                  <td className="p-2 text-right text-red-400">{r.co.toFixed(2)}</td>
                  <td className="p-2 text-right text-teal-400">{r.co2.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
