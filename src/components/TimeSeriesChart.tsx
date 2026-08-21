import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid, 
  ReferenceLine,
  Brush
} from 'recharts';
import { DailyClimateRecord, MonthlyClimateSummary, TemperatureUnit } from '../types';
import { convertTemperature, formatTempNumber } from '../utils/temperature';
import { 
  SlidersHorizontal, 
  Maximize2, 
  Calendar, 
  Eye, 
  Info,
  Layers
} from 'lucide-react';

interface TimeSeriesChartProps {
  records: DailyClimateRecord[];
  monthlySummaries: MonthlyClimateSummary[];
  unit: TemperatureUnit;
}

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  records,
  monthlySummaries,
  unit,
}) => {
  const [viewMode, setViewMode] = useState<'monthly' | 'daily'>('monthly');
  const [showMax, setShowMax] = useState(true);
  const [showMean, setShowMean] = useState(true);
  const [showMin, setShowMin] = useState(true);
  const [showApparent, setShowApparent] = useState(true);
  const [showNormal, setShowNormal] = useState(true);
  const [showDewPoint, setShowDewPoint] = useState(false);
  const [showEnvelope, setShowEnvelope] = useState(true);

  const unitSymbol = unit === 'C' ? '°C' : unit === 'F' ? '°F' : 'K';

  // Prepare monthly data converted to selected unit
  const monthlyData = monthlySummaries.map((m) => ({
    name: m.monthName,
    fullName: `${m.monthName} ${m.year}`,
    tMean: formatTempNumber(m.tempMean, unit),
    tMax: formatTempNumber(m.tempMaxAvg, unit),
    tMin: formatTempNumber(m.tempMinAvg, unit),
    absMax: formatTempNumber(m.tempAbsoluteMax, unit),
    absMin: formatTempNumber(m.tempAbsoluteMin, unit),
    normalMean: formatTempNumber(m.historicalNormalMean, unit),
    normalMax: formatTempNumber(m.historicalNormalMax, unit),
    normalMin: formatTempNumber(m.historicalNormalMin, unit),
    amplitude: m.thermalAmplitudeAvg,
    precip: m.totalPrecipitation,
    humidity: m.humidityMean,
    range: [formatTempNumber(m.tempMinAvg, unit), formatTempNumber(m.tempMaxAvg, unit)],
  }));

  // Prepare daily data
  const dailyData = records.map((d) => ({
    date: d.date.substring(5), // MM-DD
    fullDate: d.date,
    monthName: d.monthName,
    tMean: formatTempNumber(d.tempMean, unit),
    tMax: formatTempNumber(d.tempMax, unit),
    tMin: formatTempNumber(d.tempMin, unit),
    apparentMax: formatTempNumber(d.apparentTempMax, unit),
    apparentMin: formatTempNumber(d.apparentTempMin, unit),
    dewPoint: formatTempNumber(d.dewPointMean, unit),
    normalMean: formatTempNumber(22.3, unit),
    humidity: d.humidityMean,
    precip: d.precipitation,
    wind: d.windSpeedMean,
    range: [formatTempNumber(d.tempMin, unit), formatTempNumber(d.tempMax, unit)],
  }));

  const chartData = viewMode === 'monthly' ? monthlyData : dailyData;

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 border border-slate-700 p-3 rounded-lg shadow-xl text-xs backdrop-blur-md z-50 min-w-[220px]">
          <div className="font-bold text-slate-200 border-b border-slate-800 pb-1.5 mb-2 flex items-center justify-between">
            <span>{data.fullName || data.fullDate || label}</span>
            <span className="text-orange-400 font-mono text-[11px]">{data.humidity}% UR</span>
          </div>

          <div className="space-y-1">
            {showMax && (
              <div className="flex justify-between items-center text-red-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  {viewMode === 'monthly' ? 'Média das Máximas' : 'Máxima Diária'}:
                </span>
                <span className="font-bold font-mono">{data.tMax} {unitSymbol}</span>
              </div>
            )}

            {showMean && (
              <div className="flex justify-between items-center text-amber-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Temperatura Média:
                </span>
                <span className="font-bold font-mono">{data.tMean} {unitSymbol}</span>
              </div>
            )}

            {showMin && (
              <div className="flex justify-between items-center text-cyan-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  {viewMode === 'monthly' ? 'Média das Mínimas' : 'Mínima Diária'}:
                </span>
                <span className="font-bold font-mono">{data.tMin} {unitSymbol}</span>
              </div>
            )}

            {showApparent && viewMode === 'daily' && (
              <div className="flex justify-between items-center text-orange-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                  Sensação Térmica Máx:
                </span>
                <span className="font-bold font-mono">{data.apparentMax} {unitSymbol}</span>
              </div>
            )}

            {showDewPoint && viewMode === 'daily' && (
              <div className="flex justify-between items-center text-emerald-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Ponto de Orvalho:
                </span>
                <span className="font-bold font-mono">{data.dewPoint} {unitSymbol}</span>
              </div>
            )}

            {showNormal && (
              <div className="flex justify-between items-center text-slate-400 pt-1 border-t border-slate-800">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                  Normal Climatológica:
                </span>
                <span className="font-mono">{data.normalMean} {unitSymbol}</span>
              </div>
            )}
          </div>

          {viewMode === 'monthly' && (
            <div className="mt-2 pt-1.5 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
              <span>Abs: <strong className="text-red-300">{data.absMax}°</strong> / <strong className="text-cyan-300">{data.absMin}°</strong></span>
              <span>Chuva: <strong className="text-blue-300">{data.precip} mm</strong></span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="border border-[#1f2937] bg-[#080808] p-4 text-[#d1d5db] font-mono">
      {/* Chart Control Bar */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 mb-4 pb-3 border-b border-[#1f2937]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-orange-500 font-bold tracking-widest uppercase">02 // SÉRIE TEMPORAL</span>
            <span className="text-gray-600">//</span>
            <span className="text-[10px] text-gray-400 uppercase font-mono">
              {viewMode === 'monthly' ? '12 PONTOS MENSAIS' : '365 REGISTROS DIÁRIOS'}
            </span>
          </div>
          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2 mt-0.5 uppercase">
            <span className="w-2 h-2 bg-orange-500 inline-block shadow-[0_0_6px_rgba(249,115,22,0.8)]"></span>
            Evolução Contínua de Temperaturas (12 Meses)
          </h2>
        </div>

        {/* View Mode Toggle & Layer Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Monthly / Daily mode */}
          <div className="flex items-center bg-black border border-[#1f2937] text-xs">
            <button
              id="btn-view-monthly"
              onClick={() => setViewMode('monthly')}
              className={`px-3 py-1 text-xs font-mono font-bold transition-all ${
                viewMode === 'monthly'
                  ? 'bg-orange-500 text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              VISÃO MENSAL (12M)
            </button>
            <button
              id="btn-view-daily"
              onClick={() => setViewMode('daily')}
              className={`px-3 py-1 text-xs font-mono font-bold transition-all border-l border-[#1f2937] ${
                viewMode === 'daily'
                  ? 'bg-orange-500 text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              VISÃO DIÁRIA (365D)
            </button>
          </div>
        </div>
      </div>

      {/* Series Visibility Toggles */}
      <div className="flex flex-wrap items-center gap-1.5 mb-4 text-[10px]">
        <span className="text-gray-500 font-bold uppercase tracking-wider mr-1 flex items-center gap-1">
          <SlidersHorizontal className="w-3 h-3 text-orange-500" />
          CAMADAS:
        </span>

        <button
          onClick={() => setShowMax(!showMax)}
          className={`flex items-center gap-1.5 px-2 py-1 border transition-all ${
            showMax
              ? 'bg-red-950/40 border-red-500 text-red-400'
              : 'bg-black border-[#1f2937] text-gray-600 line-through'
          }`}
        >
          <span className="w-1.5 h-1.5 bg-red-500"></span>
          T. MÁX
        </button>

        <button
          onClick={() => setShowMean(!showMean)}
          className={`flex items-center gap-1.5 px-2 py-1 border transition-all ${
            showMean
              ? 'bg-amber-950/40 border-amber-500 text-amber-300'
              : 'bg-black border-[#1f2937] text-gray-600 line-through'
          }`}
        >
          <span className="w-1.5 h-1.5 bg-amber-500"></span>
          T. MÉD
        </button>

        <button
          onClick={() => setShowMin(!showMin)}
          className={`flex items-center gap-1.5 px-2 py-1 border transition-all ${
            showMin
              ? 'bg-cyan-950/40 border-cyan-500 text-cyan-400'
              : 'bg-black border-[#1f2937] text-gray-600 line-through'
          }`}
        >
          <span className="w-1.5 h-1.5 bg-cyan-400"></span>
          T. MÍN
        </button>

        {viewMode === 'daily' && (
          <button
            onClick={() => setShowApparent(!showApparent)}
            className={`flex items-center gap-1.5 px-2 py-1 border transition-all ${
              showApparent
                ? 'bg-orange-950/40 border-orange-500 text-orange-400'
                : 'bg-black border-[#1f2937] text-gray-600 line-through'
            }`}
          >
            <span className="w-1.5 h-1.5 bg-orange-500"></span>
            SENSAÇÃO
          </button>
        )}

        {viewMode === 'daily' && (
          <button
            onClick={() => setShowDewPoint(!showDewPoint)}
            className={`flex items-center gap-1.5 px-2 py-1 border transition-all ${
              showDewPoint
                ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400'
                : 'bg-black border-[#1f2937] text-gray-600 line-through'
            }`}
          >
            <span className="w-1.5 h-1.5 bg-emerald-400"></span>
            PTO. ORVALHO
          </button>
        )}

        <button
          onClick={() => setShowNormal(!showNormal)}
          className={`flex items-center gap-1.5 px-2 py-1 border transition-all ${
            showNormal
              ? 'bg-gray-900 border-gray-600 text-gray-300'
              : 'bg-black border-[#1f2937] text-gray-600 line-through'
          }`}
        >
          <span className="w-1.5 h-0.5 bg-gray-400"></span>
          NORMAL INMET (1991-2020)
        </button>
      </div>

      {/* Chart Canvas */}
      <div className="h-[360px] sm:h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="2 2" stroke="#1f2937" vertical={false} />

            <XAxis 
              dataKey={viewMode === 'monthly' ? 'name' : 'date'} 
              stroke="#6b7280" 
              tick={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
              tickMargin={8}
            />

            <YAxis 
              stroke="#6b7280" 
              tick={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
              domain={['auto', 'auto']}
              unit={` ${unitSymbol}`}
              tickMargin={4}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Historical Normal Reference Line */}
            {showNormal && (
              <Line
                type="monotone"
                dataKey="normalMean"
                name="Normal Climatológica"
                stroke="#6b7280"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
              />
            )}

            {/* Máximas */}
            {showMax && (
              <Line
                type="monotone"
                dataKey="tMax"
                name="Máxima"
                stroke="#ef4444"
                strokeWidth={2}
                dot={viewMode === 'monthly' ? { r: 3, fill: '#ef4444' } : false}
                activeDot={{ r: 5 }}
              />
            )}

            {/* Médias */}
            {showMean && (
              <Line
                type="monotone"
                dataKey="tMean"
                name="Média"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={viewMode === 'monthly' ? { r: 3, fill: '#f59e0b' } : false}
              />
            )}

            {/* Mínimas */}
            {showMin && (
              <Line
                type="monotone"
                dataKey="tMin"
                name="Mínima"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={viewMode === 'monthly' ? { r: 3, fill: '#06b6d4' } : false}
                activeDot={{ r: 5 }}
              />
            )}

            {/* Apparent Temp (Daily) */}
            {showApparent && viewMode === 'daily' && (
              <Line
                type="monotone"
                dataKey="apparentMax"
                name="Sensação Térmica"
                stroke="#f97316"
                strokeWidth={1.5}
                strokeDasharray="2 2"
                dot={false}
              />
            )}

            {/* Dew Point (Daily) */}
            {showDewPoint && viewMode === 'daily' && (
              <Line
                type="monotone"
                dataKey="dewPoint"
                name="Ponto de Orvalho"
                stroke="#10b981"
                strokeWidth={1.5}
                dot={false}
              />
            )}

            {/* Brush slider for daily view */}
            {viewMode === 'daily' && (
              <Brush 
                dataKey="date" 
                height={22} 
                stroke="#f97316" 
                fill="#000000" 
                tickFormatter={() => ''} 
                travellerWidth={8}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Footer with Key Highlights */}
      <div className="mt-3 pt-3 border-t border-[#1f2937] grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-gray-400 uppercase font-mono">
        <div className="flex items-center gap-1.5 p-2 bg-black border border-[#1f2937]">
          <span className="w-1.5 h-1.5 bg-red-500"></span>
          <span>PICO MÁX: <strong className="text-white">SET/25 (38.8°C)</strong></span>
        </div>
        <div className="flex items-center gap-1.5 p-2 bg-black border border-[#1f2937]">
          <span className="w-1.5 h-1.5 bg-cyan-400"></span>
          <span>PICO MÍN: <strong className="text-white">JUN/26 (7.6°C)</strong></span>
        </div>
        <div className="flex items-center gap-1.5 p-2 bg-black border border-[#1f2937]">
          <span className="w-1.5 h-1.5 bg-amber-400"></span>
          <span>MAIOR AMPL: <strong className="text-white">AGO/25 (15.7°C)</strong></span>
        </div>
        <div className="flex items-center gap-1.5 p-2 bg-black border border-[#1f2937]">
          <span className="w-1.5 h-1.5 bg-gray-400"></span>
          <span>MENOR AMPL: <strong className="text-white">JAN/26 (10.5°C)</strong></span>
        </div>
      </div>
    </div>
  );
};
