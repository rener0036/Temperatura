import React, { useState } from 'react';
import { DailyClimateRecord, MonthlyClimateSummary, TemperatureUnit } from '../types';
import { convertTemperature, formatTemp, formatTempNumber } from '../utils/temperature';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  BarChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { 
  BarChart3, 
  Thermometer, 
  Zap, 
  Flame, 
  Snowflake, 
  Sparkles, 
  Info,
  Layers
} from 'lucide-react';

interface DistributionStatsProps {
  records: DailyClimateRecord[];
  monthlySummaries: MonthlyClimateSummary[];
  unit: TemperatureUnit;
}

export const DistributionStats: React.FC<DistributionStatsProps> = ({
  records,
  monthlySummaries,
  unit,
}) => {
  const [metricTab, setMetricTab] = useState<'histogram' | 'boxplot' | 'degreedays'>('histogram');
  const unitSymbol = unit === 'C' ? '°C' : unit === 'F' ? '°F' : 'K';

  // Calculate histogram frequency bins
  const bins = [
    { label: '< 12°C', min: -50, max: 12, count: 0, color: '#38bdf8', category: 'Muito Frio' },
    { label: '12 - 16°C', min: 12, max: 16, count: 0, color: '#06b6d4', category: 'Frio' },
    { label: '16 - 20°C', min: 16, max: 20, count: 0, color: '#2dd4bf', category: 'Ameno' },
    { label: '20 - 24°C', min: 20, max: 24, count: 0, color: '#34d399', category: 'Confortável' },
    { label: '24 - 28°C', min: 24, max: 28, count: 0, color: '#fbbf24', category: 'Quente' },
    { label: '28 - 32°C', min: 28, max: 32, count: 0, color: '#fb923c', category: 'Muito Quente' },
    { label: '32 - 36°C', min: 32, max: 36, count: 0, color: '#f87171', category: 'Calor Intenso' },
    { label: '> 36°C', min: 36, max: 60, count: 0, color: '#dc2626', category: 'Calor Extremo' },
  ];

  records.forEach((r) => {
    // evaluate max temperatures frequency
    const bin = bins.find((b) => r.tempMax >= b.min && r.tempMax < b.max);
    if (bin) bin.count += 1;
  });

  const histogramData = bins.map((b) => ({
    range: b.label,
    dias: b.count,
    percentage: Number(((b.count / records.length) * 100).toFixed(1)),
    category: b.category,
    color: b.color,
  }));

  // Boxplot representation data
  const boxplotData = monthlySummaries.map((m) => ({
    name: m.monthName.toUpperCase(),
    p10: formatTempNumber(m.p10, unit),
    p25: formatTempNumber(m.p25, unit),
    median: formatTempNumber(m.median, unit),
    p75: formatTempNumber(m.p75, unit),
    p90: formatTempNumber(m.p90, unit),
    absMax: formatTempNumber(m.tempAbsoluteMax, unit),
    absMin: formatTempNumber(m.tempAbsoluteMin, unit),
    iqr: Number((m.p75 - m.p25).toFixed(1)),
  }));

  // Degree Days (CDD vs HDD)
  const degreeDaysData = monthlySummaries.map((m) => ({
    name: m.monthName.toUpperCase(),
    cdd: m.cddTotal,
    hdd: m.hddTotal,
    netDemand: m.cddTotal - m.hddTotal,
  }));

  return (
    <div className="space-y-4 font-mono">
      {/* Top Selector Card */}
      <div className="border border-[#1f2937] bg-[#080808] p-4 text-[#d1d5db]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#1f2937]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-orange-500 font-bold tracking-widest uppercase">09 // ESTATÍSTICA & DISTRIBUIÇÃO</span>
              <span className="text-gray-600">//</span>
              <span className="text-[10px] text-gray-400 uppercase font-mono">PROBABILIDADE & GRAUS-DIA</span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2 mt-0.5 uppercase">
              <BarChart3 className="w-4 h-4 text-orange-500" />
              Análise Paramétrica de Frequência & Dispersão
            </h2>
          </div>

          {/* Sub-view switcher */}
          <div className="flex items-center bg-black border border-[#1f2937] p-0.5 text-xs font-bold uppercase">
            <button
              onClick={() => setMetricTab('histogram')}
              className={`px-2.5 py-1 text-[10px] transition-all ${
                metricTab === 'histogram'
                  ? 'bg-orange-500 text-black font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              HISTOGRAMA ANUAL
            </button>
            <button
              onClick={() => setMetricTab('boxplot')}
              className={`px-2.5 py-1 text-[10px] transition-all ${
                metricTab === 'boxplot'
                  ? 'bg-orange-500 text-black font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              PERCENTIS (P10-P90)
            </button>
            <button
              onClick={() => setMetricTab('degreedays')}
              className={`px-2.5 py-1 text-[10px] transition-all ${
                metricTab === 'degreedays'
                  ? 'bg-orange-500 text-black font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              GRAUS-DIA (CDD/HDD)
            </button>
          </div>
        </div>

        {/* 1. HISTOGRAM VIEW */}
        {metricTab === 'histogram' && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-3 uppercase">
              <span className="font-bold text-gray-300 text-[11px]">
                Frequência de Ocorrência por Faixa de Temperatura Máxima (365 Dias)
              </span>
              <span className="font-mono text-orange-400 font-bold text-[10px]">TOTAL: 365 DIAS</span>
            </div>

            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={histogramData} margin={{ top: 15, right: 10, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="#1f2937" vertical={false} />
                  <XAxis dataKey="range" stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'monospace' }} />
                  <YAxis stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'monospace' }} unit=" d" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-black border border-[#1f2937] p-2.5 text-xs font-mono shadow-2xl">
                            <div className="font-bold text-white uppercase">{d.range} ({d.category})</div>
                            <div className="text-orange-400 font-mono font-bold mt-1 uppercase">{d.dias} DIAS ({d.percentage}% DO ANO)</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="dias" name="Número de Dias" fill="#f97316" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-[#1f2937] text-xs">
              <div className="p-2.5 bg-black border border-[#1f2937]">
                <span className="text-gray-400 block text-[9px] uppercase">Faixa Mais Frequente</span>
                <span className="font-bold text-amber-300 font-mono text-xs">28 - 32°C (142 DIAS)</span>
              </div>
              <div className="p-2.5 bg-black border border-[#1f2937]">
                <span className="text-gray-400 block text-[9px] uppercase">Calor Extremo (&gt;36°C)</span>
                <span className="font-bold text-red-400 font-mono text-xs">18 DIAS (4.9%)</span>
              </div>
              <div className="p-2.5 bg-black border border-[#1f2937]">
                <span className="text-gray-400 block text-[9px] uppercase">Conforto (20-24°C)</span>
                <span className="font-bold text-emerald-400 font-mono text-xs">34 DIAS (9.3%)</span>
              </div>
              <div className="p-2.5 bg-black border border-[#1f2937]">
                <span className="text-gray-400 block text-[9px] uppercase">Dias Frios (&lt;16°C)</span>
                <span className="font-bold text-cyan-400 font-mono text-xs">6 DIAS (1.6%)</span>
              </div>
            </div>
          </div>
        )}

        {/* 2. BOXPLOT & PERCENTILES VIEW */}
        {metricTab === 'boxplot' && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-3 uppercase">
              <span className="font-bold text-gray-300 text-[11px]">
                Dispersão Estatística Mensal (Percentis P10, P25, Mediana, P75, P90)
              </span>
              <span className="text-[10px] text-orange-400 font-mono">MEDIANA: LINHA LARANJA</span>
            </div>

            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={boxplotData} margin={{ top: 15, right: 10, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="#1f2937" vertical={false} />
                  <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'monospace' }} />
                  <YAxis stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'monospace' }} unit={` ${unitSymbol}`} domain={['auto', 'auto']} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-black border border-[#1f2937] p-2.5 text-xs font-mono shadow-2xl min-w-[180px]">
                            <div className="font-bold text-white border-b border-[#1f2937] pb-1 mb-1 uppercase">{d.name}</div>
                            <div className="text-red-400">P90: <strong>{d.p90} {unitSymbol}</strong></div>
                            <div className="text-amber-400">P75: <strong>{d.p75} {unitSymbol}</strong></div>
                            <div className="text-orange-400 font-bold">MEDIANA: <strong>{d.median} {unitSymbol}</strong></div>
                            <div className="text-cyan-400">P25: <strong>{d.p25} {unitSymbol}</strong></div>
                            <div className="text-blue-400">P10: <strong>{d.p10} {unitSymbol}</strong></div>
                            <div className="text-gray-400 pt-1 mt-1 border-t border-[#1f2937] text-[10px] uppercase">IQR: {d.iqr}°C</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px', fontFamily: 'monospace' }} />
                  <Line type="monotone" dataKey="p90" name="P90" stroke="#ef4444" strokeDasharray="3 3" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="p75" name="P75 (Q3)" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="median" name="MEDIANA (Q2)" stroke="#f97316" strokeWidth={2} dot={{ r: 3, fill: '#f97316' }} />
                  <Line type="monotone" dataKey="p25" name="P25 (Q1)" stroke="#06b6d4" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="p10" name="P10" stroke="#3b82f6" strokeDasharray="3 3" strokeWidth={1.5} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 p-2.5 bg-black border border-[#1f2937] text-[11px] text-gray-300 flex items-start gap-2 uppercase">
              <Info className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
              <span>
                <strong>DISPERSÃO:</strong> O mês de <strong>Setembro/2025</strong> apresentou a maior dispersão térmica do ano (P90 de 35.3°C e P10 de 16.3°C), refletindo transição de massa de ar seco de primavera.
              </span>
            </div>
          </div>
        )}

        {/* 3. DEGREE DAYS (CDD / HDD) VIEW */}
        {metricTab === 'degreedays' && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-3 uppercase">
              <span className="font-bold text-gray-300 text-[11px]">
                Graus-Dia de Refrigeração (CDD - Base 18°C) vs Aquecimento (HDD)
              </span>
              <span className="text-[10px] text-orange-400 font-mono">CONSUMO ENERGÉTICO</span>
            </div>

            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={degreeDaysData} margin={{ top: 15, right: 10, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="#1f2937" vertical={false} />
                  <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'monospace' }} />
                  <YAxis stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'monospace' }} unit=" GD" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#000000', borderColor: '#1f2937', borderRadius: '0px', fontSize: '10px', fontFamily: 'monospace' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px', fontFamily: 'monospace' }} />
                  <Bar dataKey="cdd" name="CDD (RESFRIAMENTO)" fill="#ef4444" />
                  <Bar dataKey="hdd" name="HDD (AQUECIMENTO)" fill="#38bdf8" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 p-2.5 bg-black border border-[#1f2937] text-[11px] text-gray-300 flex items-start gap-2 uppercase">
              <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>EFICIÊNCIA ENERGÉTICA:</strong> O acúmulo anual de CDD foi de <strong>1.866 Graus-Dia</strong> contra apenas <strong>96 Graus-Dia</strong> de HDD, confirmando predomínio de alta demanda de resfriamento entre Setembro e Março.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
