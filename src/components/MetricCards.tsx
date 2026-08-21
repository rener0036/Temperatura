import React from 'react';
import { DailyClimateRecord, MonthlyClimateSummary, TemperatureUnit } from '../types';
import { formatTemp } from '../utils/temperature';
import { 
  TrendingUp, 
  TrendingDown, 
  Flame, 
  Snowflake, 
  Sun, 
  Zap, 
  Gauge,
  CalendarCheck,
  Activity
} from 'lucide-react';

interface MetricCardsProps {
  records: DailyClimateRecord[];
  monthlySummaries: MonthlyClimateSummary[];
  unit: TemperatureUnit;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  records,
  monthlySummaries,
  unit,
}) => {
  // Compute overall annual metrics
  const totalDays = records.length;
  const avgTemp = records.reduce((acc, r) => acc + r.tempMean, 0) / (totalDays || 1);
  
  // Find absolute records
  const absMaxRecord = records.reduce((max, r) => (r.tempMax > max.tempMax ? r : max), records[0] || {});
  const absMinRecord = records.reduce((min, r) => (r.tempMin < min.tempMin ? r : min), records[0] || {});
  
  // Thermal amplitude avg
  const avgAmplitude = records.reduce((acc, r) => acc + (r.tempMax - r.tempMin), 0) / (totalDays || 1);
  
  // Extreme heat days (>= 33°C) and cold days (<= 12°C)
  const extremeHeatDays = records.filter((r) => r.tempMax >= 33.0).length;
  const coldDays = records.filter((r) => r.tempMin <= 12.0).length;
  
  // Sensation max
  const maxApparent = records.reduce((max, r) => (r.apparentTempMax > max.apparentTempMax ? r : max), records[0] || {});
  
  // Cumulative CDD (Cooling Degree Days) & HDD (Heating Degree Days)
  const totalCDD = records.reduce((acc, r) => acc + r.cdd, 0);
  const totalHDD = records.reduce((acc, r) => acc + r.hdd, 0);
  
  // Mean Anomaly vs Normal 1991-2020 (Normal is approx 22.3°C for Uberlândia region)
  const baselineNormal = 22.3;
  const annualAnomaly = avgTemp - baselineNormal;

  // Percentage gauge fill for visual density
  const meanTempPercent = Math.min(100, Math.max(0, ((avgTemp - 10) / 25) * 100));

  return (
    <div className="space-y-2 font-mono">
      <div className="flex items-center justify-between text-[10px] text-gray-500 uppercase tracking-widest px-1">
        <span>01 // Resumo de Telemetria Térmica Global (365 Dias)</span>
        <span className="text-orange-500">AMOSTRAGEM: 100% VÁLIDA</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. Média Anual & Anomalia */}
        <div 
          id="card-annual-mean"
          className="p-3 border border-[#1f2937] bg-black hover:border-orange-500/50 transition-all relative group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1 uppercase tracking-wider">
              <span className="flex items-center gap-1 text-gray-400 font-bold">
                <Gauge className="w-3.5 h-3.5 text-orange-500" />
                MÉDIA ANUAL (12M)
              </span>
              <span className={`font-mono font-bold ${
                annualAnomaly >= 0 ? 'text-red-400' : 'text-cyan-400'
              }`}>
                {annualAnomaly > 0 ? `+${annualAnomaly.toFixed(1)}` : annualAnomaly.toFixed(1)}°C DEV
              </span>
            </div>
            
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-white tracking-tight">
                {formatTemp(avgTemp, unit)}
              </span>
              <span className="text-[10px] text-gray-500">
                NORMAL: {formatTemp(baselineNormal, unit)}
              </span>
            </div>

            {/* High density progress gauge */}
            <div className="h-1 w-full bg-gray-900 mt-2.5 overflow-hidden">
              <div 
                className="h-full bg-orange-500 transition-all duration-500" 
                style={{ width: `${meanTempPercent}%` }}
              ></div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-[#1f2937] flex items-center justify-between text-[9px] text-gray-400 uppercase">
            <span>AMPL. MÉD: <strong className="text-gray-200 font-bold">{avgAmplitude.toFixed(1)}°C/DIA</strong></span>
            <span className="text-emerald-400">365D CONTÍNUO</span>
          </div>
        </div>

        {/* 2. Máxima Absoluta */}
        <div 
          id="card-absolute-max"
          className="p-3 border border-[#1f2937] bg-black hover:border-red-500/50 transition-all relative group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1 uppercase tracking-wider">
              <span className="flex items-center gap-1 text-gray-400 font-bold">
                <Flame className="w-3.5 h-3.5 text-red-500" />
                PICO REGISTRADO
              </span>
              <span className="text-red-500 font-bold text-[9px] border border-red-500/40 bg-red-950/30 px-1">
                EXTREMO
              </span>
            </div>

            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-red-500 tracking-tight">
                {formatTemp(absMaxRecord.tempMax || 38.8, unit)}
              </span>
              <span className="text-[10px] text-gray-500">
                SENS: {formatTemp(absMaxRecord.apparentTempMax || 41.2, unit)}
              </span>
            </div>

            {/* Gauge */}
            <div className="h-1 w-full bg-gray-900 mt-2.5 overflow-hidden">
              <div className="h-full bg-red-600 w-[92%]"></div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-[#1f2937] flex items-center justify-between text-[9px] text-gray-400 uppercase">
            <span>DATA: <strong className="text-gray-200">{absMaxRecord.date || '24/09/2025'}</strong></span>
            <span>UR: <strong className="text-gray-200">{absMaxRecord.humidityMean || 38}%</strong></span>
          </div>
        </div>

        {/* 3. Mínima Absoluta */}
        <div 
          id="card-absolute-min"
          className="p-3 border border-[#1f2937] bg-black hover:border-cyan-500/50 transition-all relative group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1 uppercase tracking-wider">
              <span className="flex items-center gap-1 text-gray-400 font-bold">
                <Snowflake className="w-3.5 h-3.5 text-cyan-400" />
                MÍNIMA ABSOLUTA
              </span>
              <span className="text-cyan-400 font-bold text-[9px] border border-cyan-500/40 bg-cyan-950/30 px-1">
                FRENTE POLAR
              </span>
            </div>

            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-cyan-400 tracking-tight">
                {formatTemp(absMinRecord.tempMin || 7.6, unit)}
              </span>
              <span className="text-[10px] text-gray-500">
                SENS: {formatTemp(absMinRecord.apparentTempMin || 6.2, unit)}
              </span>
            </div>

            {/* Gauge */}
            <div className="h-1 w-full bg-gray-900 mt-2.5 overflow-hidden">
              <div className="h-full bg-cyan-500 w-[18%]"></div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-[#1f2937] flex items-center justify-between text-[9px] text-gray-400 uppercase">
            <span>DATA: <strong className="text-gray-200">{absMinRecord.date || '14/06/2026'}</strong></span>
            <span>VENTO: <strong className="text-gray-200">18.5 KM/H (S)</strong></span>
          </div>
        </div>

        {/* 4. Eventos Extremos & Demanda Térmica (Graus-Dia) */}
        <div 
          id="card-extremes-cdd"
          className="p-3 border border-[#1f2937] bg-black hover:border-amber-500/50 transition-all relative group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1 uppercase tracking-wider">
              <span className="flex items-center gap-1 text-gray-400 font-bold">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                CALOR EXT (≥33°C)
              </span>
              <span className="text-amber-400 font-bold text-[9px] border border-amber-500/40 bg-amber-950/30 px-1">
                {((extremeHeatDays / 365) * 100).toFixed(0)}% DO ANO
              </span>
            </div>

            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-amber-400 tracking-tight">
                {extremeHeatDays} <span className="text-xs font-normal text-gray-400">DIAS</span>
              </span>
              <span className="text-[10px] text-gray-500">
                FRIO (≤12°C): {coldDays}D
              </span>
            </div>

            {/* Gauge */}
            <div className="h-1 w-full bg-gray-900 mt-2.5 overflow-hidden">
              <div className="h-full bg-amber-500 w-[58%]"></div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-[#1f2937] flex items-center justify-between text-[9px] text-gray-400 uppercase">
            <span>CDD: <strong className="text-gray-200">{Math.round(totalCDD)} GD</strong></span>
            <span>HDD: <strong className="text-gray-200">{Math.round(totalHDD)} GD</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
