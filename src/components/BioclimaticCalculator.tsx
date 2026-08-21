import React, { useState } from 'react';
import { TemperatureUnit } from '../types';
import { 
  calculateHeatIndex, 
  calculateWindChill, 
  calculateDewPoint, 
  convertTemperature, 
  formatTemp,
  getThermalCategory
} from '../utils/temperature';
import { 
  Sliders, 
  Thermometer, 
  Droplets, 
  Wind, 
  ShieldCheck, 
  Sparkles,
  Info,
  Flame,
  Snowflake
} from 'lucide-react';

interface BioclimaticCalculatorProps {
  unit: TemperatureUnit;
}

export const BioclimaticCalculator: React.FC<BioclimaticCalculatorProps> = ({ unit }) => {
  const [tempInput, setTempInput] = useState<number>(31.5);
  const [rhInput, setRhInput] = useState<number>(65);
  const [windInput, setWindInput] = useState<number>(14);

  // Computations
  const heatIndex = calculateHeatIndex(tempInput, rhInput);
  const windChill = calculateWindChill(tempInput, windInput);
  const dewPoint = calculateDewPoint(tempInput, rhInput);

  // Apparent sensation based on temperature range
  const apparentTemp = tempInput >= 26 ? heatIndex : tempInput <= 12 ? windChill : tempInput;
  const category = getThermalCategory(apparentTemp);

  const unitSymbol = unit === 'C' ? '°C' : unit === 'F' ? '°F' : 'K';

  return (
    <div className="border border-[#1f2937] bg-[#080808] p-4 text-[#d1d5db] font-mono">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#1f2937]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-orange-500 font-bold tracking-widest uppercase">05 // SIMULADOR BIOCLIMÁTICO</span>
            <span className="text-gray-600">//</span>
            <span className="text-[10px] text-gray-400 uppercase font-mono">ÍNDICE NOAA & WIND CHILL</span>
          </div>
          <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2 mt-0.5 uppercase">
            <Sliders className="w-4 h-4 text-orange-500" />
            Simulador de Sensação Térmica Interativa
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Sliders Input Column */}
        <div className="lg:col-span-7 space-y-3.5">
          {/* 1. Temp Slider */}
          <div className="bg-black p-3 border border-[#1f2937]">
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-gray-300 flex items-center gap-1.5 uppercase text-[11px]">
                <Thermometer className="w-3.5 h-3.5 text-orange-500" />
                Temperatura do Ar (Bulbo Seco):
              </span>
              <span className="text-orange-400 font-mono font-bold text-xs">
                {tempInput.toFixed(1)} °C ({((tempInput * 9) / 5 + 32).toFixed(1)} °F)
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="45"
              step="0.5"
              value={tempInput}
              onChange={(e) => setTempInput(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-[#1f2937] rounded-none appearance-none cursor-pointer accent-orange-500"
            />
            <div className="flex justify-between text-[9px] text-gray-500 font-mono mt-1 uppercase">
              <span>0 °C (FRIO)</span>
              <span>22 °C (CONFORTO)</span>
              <span>45 °C (EXTREMO)</span>
            </div>
          </div>

          {/* 2. Humidity Slider */}
          <div className="bg-black p-3 border border-[#1f2937]">
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-gray-300 flex items-center gap-1.5 uppercase text-[11px]">
                <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                Umidade Relativa do Ar (UR):
              </span>
              <span className="text-cyan-400 font-mono font-bold text-xs">
                {rhInput}%
              </span>
            </div>
            <input
              type="range"
              min="15"
              max="100"
              step="1"
              value={rhInput}
              onChange={(e) => setRhInput(parseInt(e.target.value))}
              className="w-full h-1.5 bg-[#1f2937] rounded-none appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="flex justify-between text-[9px] text-gray-500 font-mono mt-1 uppercase">
              <span>15% (SECO)</span>
              <span>55% (IDEAL)</span>
              <span>100% (SATURADO)</span>
            </div>
          </div>

          {/* 3. Wind Speed Slider */}
          <div className="bg-black p-3 border border-[#1f2937]">
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-gray-300 flex items-center gap-1.5 uppercase text-[11px]">
                <Wind className="w-3.5 h-3.5 text-emerald-400" />
                Velocidade do Vento:
              </span>
              <span className="text-emerald-400 font-mono font-bold text-xs">
                {windInput} km/h ({(windInput / 3.6).toFixed(1)} m/s)
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              step="1"
              value={windInput}
              onChange={(e) => setWindInput(parseInt(e.target.value))}
              className="w-full h-1.5 bg-[#1f2937] rounded-none appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[9px] text-gray-500 font-mono mt-1 uppercase">
              <span>0 km/h (CALMARIA)</span>
              <span>25 km/h (BRISA)</span>
              <span>60 km/h (VENDAVAL)</span>
            </div>
          </div>
        </div>

        {/* Results Badge Column */}
        <div className="lg:col-span-5 bg-black p-4 border border-[#1f2937] flex flex-col justify-between">
          <div>
            <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-2">
              SENSAÇÃO TÉRMICA APARENTE CALCULADA
            </div>
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
                {formatTemp(apparentTemp, unit)}
              </span>
              <span className={`px-2 py-0.5 text-[10px] font-bold uppercase border ${category.bg} ${category.color} border-current/30`}>
                {category.label}
              </span>
            </div>
          </div>

          {/* Diagnostic Sub-metrics */}
          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-[#1f2937] text-xs">
            <div className="p-2 bg-[#080808] border border-[#1f2937]">
              <span className="text-gray-400 block text-[9px] uppercase">Ponto de Orvalho (Td)</span>
              <span className="font-bold text-emerald-400 font-mono text-sm">{formatTemp(dewPoint, unit)}</span>
            </div>
            <div className="p-2 bg-[#080808] border border-[#1f2937]">
              <span className="text-gray-400 block text-[9px] uppercase">Índice NOAA (Heat Index)</span>
              <span className="font-bold text-red-400 font-mono text-sm">{formatTemp(heatIndex, unit)}</span>
            </div>
          </div>

          <div className="mt-3 p-2 bg-[#080808] border border-[#1f2937] text-[10px] text-gray-400 flex items-start gap-1.5 uppercase">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              {apparentTemp > 38 
                ? 'ALERTA DE PERIGO: RISCO DE EXAUSTÃO E INSOLAÇÃO.' 
                : apparentTemp < 10 
                ? 'ALERTA DE FRIO: EXIGE PROTEÇÃO CONTRA BAIXA TEMPERATURA.' 
                : 'CONDIÇÃO DENTRO DA FAIXA DE ACEITABILIDADE BIOCLIMÁTICA.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

