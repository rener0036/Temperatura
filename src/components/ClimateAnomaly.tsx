import React from 'react';
import { MonthlyClimateSummary, TemperatureUnit, ClimatologicalNormalComparison } from '../types';
import { CLIMATOLOGICAL_COMPARISONS } from '../data/mockClimateData';
import { formatTemp } from '../utils/temperature';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine 
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  ShieldCheck, 
  AlertTriangle, 
  Globe,
  Info 
} from 'lucide-react';

interface ClimateAnomalyProps {
  monthlySummaries: MonthlyClimateSummary[];
  unit: TemperatureUnit;
}

export const ClimateAnomaly: React.FC<ClimateAnomalyProps> = ({
  monthlySummaries,
  unit,
}) => {
  // Anomaly data per month
  const anomalyData = monthlySummaries.map((m) => ({
    name: m.monthName.toUpperCase(),
    anomaly: m.anomaly,
    tempMean: m.tempMean,
    normal: m.historicalNormalMean,
  }));

  return (
    <div className="space-y-4 font-mono">
      {/* 1. Monthly Anomalies Diverging Bar Chart */}
      <div className="border border-[#1f2937] bg-[#080808] p-4 text-[#d1d5db]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-3 border-b border-[#1f2937]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-orange-500 font-bold tracking-widest uppercase">07 // ANOMALIAS CLIMÁTICAS</span>
              <span className="text-gray-600">//</span>
              <span className="text-[10px] text-gray-400 uppercase font-mono">SÉRIE 1991-2020 INMET</span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2 mt-0.5 uppercase">
              <Globe className="w-4 h-4 text-orange-500" />
              Desvios Térmicos Mensais vs Normal Climatológica Oficial
            </h2>
          </div>

          <div className="flex items-center gap-3 text-[10px] font-bold uppercase">
            <span className="flex items-center gap-1.5 text-red-400">
              <span className="w-2 h-2 bg-red-500"></span>
              ACIMA (+ANOMALIA)
            </span>
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-2 h-2 bg-cyan-500"></span>
              ABAIXO (-ANOMALIA)
            </span>
          </div>
        </div>

        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={anomalyData} margin={{ top: 15, right: 10, left: -10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="2 2" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'monospace' }} />
              <YAxis stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'monospace' }} unit="°C" domain={[-1.5, 3.0]} />
              <ReferenceLine y={0} stroke="#4b5563" strokeWidth={1} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-black border border-[#1f2937] p-2.5 text-xs font-mono shadow-2xl min-w-[170px]">
                        <div className="font-bold text-white border-b border-[#1f2937] pb-1 mb-1 uppercase">{d.name}</div>
                        <div className={`${d.anomaly >= 0 ? 'text-red-400 font-bold' : 'text-cyan-400 font-bold'}`}>
                          DESVIO: {d.anomaly >= 0 ? `+${d.anomaly}` : d.anomaly} °C
                        </div>
                        <div className="text-gray-300 text-[10px] mt-0.5 uppercase">OBSERVADA: {d.tempMean}°C</div>
                        <div className="text-gray-400 text-[10px] uppercase">NORMAL INMET: {d.normal}°C</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="anomaly" name="Anomalia Térmica">
                {anomalyData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.anomaly >= 0 ? '#ef4444' : '#06b6d4'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 pt-3 border-t border-[#1f2937] grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="p-3 bg-black border border-[#1f2937]">
            <span className="text-red-400 font-bold block mb-0.5 text-[10px] uppercase">MAIOR ANOMALIA POSITIVA</span>
            <span className="text-white text-lg font-extrabold font-mono">+2.2 °C</span>
            <span className="text-gray-400 block text-[10px] mt-0.5 uppercase">SETEMBRO/2025 (ONDA DE CALOR PERSISTENTE)</span>
          </div>
          <div className="p-3 bg-black border border-[#1f2937]">
            <span className="text-orange-400 font-bold block mb-0.5 text-[10px] uppercase">MÉDIA GERAL DE ANOMALIA</span>
            <span className="text-white text-lg font-extrabold font-mono">+1.1 °C</span>
            <span className="text-gray-400 block text-[10px] mt-0.5 uppercase">11/12 MESES ACIMA DA NORMAL HISTÓRICA</span>
          </div>
          <div className="p-3 bg-black border border-[#1f2937]">
            <span className="text-cyan-400 font-bold block mb-0.5 text-[10px] uppercase">MÊS MAIS PRÓXIMO DA NORMAL</span>
            <span className="text-white text-lg font-extrabold font-mono">+0.3 °C</span>
            <span className="text-gray-400 block text-[10px] mt-0.5 uppercase">JANEIRO/2026 (ALTA NEBULOSIDADE E CHUVAS)</span>
          </div>
        </div>
      </div>

      {/* 2. Official Climatological Comparisons Table */}
      <div className="border border-[#1f2937] bg-[#080808] p-4 text-[#d1d5db]">
        <div className="mb-3 pb-3 border-b border-[#1f2937]">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-orange-500 font-bold tracking-widest uppercase">08 // VALIDAÇÃO CLIMATOLÓGICA</span>
            <span className="text-gray-600">//</span>
            <span className="text-[10px] text-gray-400 uppercase font-mono">UBERLÂNDIA / MG</span>
          </div>
          <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2 mt-0.5 uppercase">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Tabela de Validação Paramétrica Oficial (INMET / OMM)
          </h3>
        </div>

        <div className="overflow-x-auto border border-[#1f2937]">
          <table className="w-full text-xs text-left text-gray-300 font-mono">
            <thead className="bg-black text-gray-400 uppercase text-[10px] tracking-wider font-bold border-b border-[#1f2937]">
              <tr>
                <th className="px-3.5 py-2.5">PARÂMETRO METEOROLÓGICO</th>
                <th className="px-3.5 py-2.5 text-center">OBSERVADO (12M)</th>
                <th className="px-3.5 py-2.5 text-center">NORMAL (1991-2020)</th>
                <th className="px-3.5 py-2.5 text-center">DESVIO / ANOMALIA</th>
                <th className="px-3.5 py-2.5">DIAGNÓSTICO TÉCNICO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2937] bg-black/40">
              {CLIMATOLOGICAL_COMPARISONS.map((row, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors">
                  <td className="px-3.5 py-2.5 font-bold text-white uppercase">{row.parameter}</td>
                  <td className="px-3.5 py-2.5 text-center font-mono font-bold text-white">
                    {row.observed12m} {row.unit}
                  </td>
                  <td className="px-3.5 py-2.5 text-center font-mono text-gray-400">
                    {row.normal1991_2020} {row.unit}
                  </td>
                  <td className="px-3.5 py-2.5 text-center font-mono font-bold">
                    <span className={`px-1.5 py-0.5 text-[10px] border ${
                      row.deviation > 0 
                        ? 'bg-red-950/80 text-red-400 border-red-800' 
                        : 'bg-blue-950/80 text-blue-400 border-blue-800'
                    }`}>
                      {row.deviation > 0 ? `+${row.deviation}` : row.deviation} {row.unit}
                    </span>
                  </td>
                  <td className="px-3.5 py-2.5 text-gray-300 text-[11px] uppercase">{row.interpretation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

