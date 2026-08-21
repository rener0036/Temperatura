import React, { useState } from 'react';
import { ThermalWindSector, TemperatureUnit } from '../types';
import { convertTemperature, formatTemp } from '../utils/temperature';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { Wind, Compass, ShieldAlert, Thermometer, Info, ArrowUpRight } from 'lucide-react';

interface ThermalWindRoseProps {
  sectors: ThermalWindSector[];
  unit: TemperatureUnit;
}

export const ThermalWindRose: React.FC<ThermalWindRoseProps> = ({
  sectors,
  unit,
}) => {
  const [selectedAirMass, setSelectedAirMass] = useState<string>('all');
  const [hoveredSector, setHoveredSector] = useState<ThermalWindSector | null>(null);

  const unitSymbol = unit === 'C' ? '°C' : unit === 'F' ? '°F' : 'K';

  // Format data for radar
  const radarData = sectors.map((s) => ({
    direction: s.direction,
    freq: s.frequency,
    avgTemp: Number(convertTemperature(s.avgTemp, unit).toFixed(1)),
    speed: s.avgWindSpeed,
    airMass: s.airMassType,
  }));

  // Filtered list
  const filteredSectors = selectedAirMass === 'all' 
    ? sectors 
    : sectors.filter(s => s.airMassType === selectedAirMass);

  return (
    <div className="space-y-4 font-mono">
      {/* Top Banner introducing Thermal Wind Rose */}
      <div className="border border-[#1f2937] bg-[#080808] p-4 text-[#d1d5db]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-3 border-b border-[#1f2937]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-orange-500 font-bold tracking-widest uppercase">04 // ROSA TÉRMICA & ADVECÇÃO</span>
              <span className="text-gray-600">//</span>
              <span className="text-[10px] text-gray-400 uppercase font-mono">16 SETORES VETORIAIS</span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2 mt-0.5 uppercase">
              <Compass className="w-4 h-4 text-orange-500" />
              Rosa Térmica & Advecção Vetorial dos Ventos
            </h2>
          </div>

          {/* Air mass filter */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase">MASSA DE AR:</span>
            <select
              id="select-airmass"
              value={selectedAirMass}
              onChange={(e) => setSelectedAirMass(e.target.value)}
              className="bg-black text-[11px] text-white border border-[#1f2937] px-2.5 py-1 focus:border-orange-500 focus:outline-none cursor-pointer uppercase font-mono"
            >
              <option value="all">TODAS AS MASSAS DE AR</option>
              <option value="Polar Atlântica">POLAR ATLÂNTICA (FRIO / S)</option>
              <option value="Tropical Continental">TROPICAL CONTINENTAL (CALOR SECO / NW-W)</option>
              <option value="Tropical Atlântica">TROPICAL ATLÂNTICA (AMENO ÚMIDO / E-NE)</option>
              <option value="Equatorial Continental">EQUATORIAL CONTINENTAL (QUENTE / N)</option>
            </select>
          </div>
        </div>

        {/* 2-Column Grid: Radar Chart + Directional Thermal Spectrum */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
          {/* Radar Rosa dos Ventos */}
          <div className="lg:col-span-6 bg-black p-4 border border-[#1f2937] flex flex-col items-center justify-center relative">
            <div className="w-full flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-gray-300 flex items-center gap-1.5 uppercase text-[11px]">
                <Wind className="w-3.5 h-3.5 text-cyan-400" />
                Rosa dos Ventos Térmica (16 Setores)
              </span>
              <span className="text-gray-400 font-mono text-[10px]">EIXO: TEMP MÉD ({unitSymbol})</span>
            </div>

            <div className="h-[320px] w-full max-w-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="#1f2937" />
                  <PolarAngleAxis 
                    dataKey="direction" 
                    tick={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fontWeight: 'bold' }} 
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={['auto', 'auto']} 
                    stroke="#4b5563" 
                    tick={{ fill: '#6b7280', fontSize: 9, fontFamily: 'JetBrains Mono, monospace' }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-black border border-[#1f2937] p-2 text-xs font-mono">
                            <div className="font-bold text-white uppercase">{d.direction} ({d.airMass})</div>
                            <div className="text-orange-400 font-mono text-[11px]">TEMP MÉD: {d.avgTemp} {unitSymbol}</div>
                            <div className="text-cyan-400 font-mono text-[11px]">FREQ: {d.freq}% DO TEMPO</div>
                            <div className="text-gray-400 font-mono text-[11px]">VEL. MÉD: {d.speed} km/h</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Radar
                    name="Temperatura Média Transportada"
                    dataKey="avgTemp"
                    stroke="#f97316"
                    fill="#f97316"
                    fillOpacity={0.25}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="text-[10px] text-gray-400 text-center mt-1 uppercase">
              <span>QUADRANTE SUL (S/SE): <strong className="text-cyan-400">18.2°C A 20.6°C</strong></span> • 
              <span className="ml-1">QUADRANTE NW/N: <strong className="text-red-400">27.8°C A 28.6°C</strong></span>
            </div>
          </div>

          {/* Sector Thermal Bins Bar Chart */}
          <div className="lg:col-span-6 bg-black p-4 border border-[#1f2937] flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-gray-300 flex items-center gap-1.5 uppercase text-[11px]">
                <Thermometer className="w-3.5 h-3.5 text-orange-500" />
                Faixas Térmicas por Direção
              </span>
              <span className="text-[10px] text-gray-400 uppercase">DISTRIBUIÇÃO % HORAS</span>
            </div>

            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectors} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="#1f2937" horizontal={false} />
                  <XAxis type="number" stroke="#6b7280" unit="%" tick={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }} />
                  <YAxis dataKey="direction" type="category" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fontWeight: 'bold' }} width={32} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#000000', borderColor: '#1f2937', borderRadius: '0px', fontSize: '11px', fontFamily: 'JetBrains Mono, monospace' }}
                    formatter={(val: any, name: any) => [`${val}%`, name]}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '4px', fontFamily: 'JetBrains Mono, monospace' }} />
                  <Bar dataKey="tempBins.under18" name="< 18°C (FRIO)" stackId="a" fill="#06b6d4" />
                  <Bar dataKey="tempBins.from18to24" name="18-24°C (AMENO)" stackId="a" fill="#10b981" />
                  <Bar dataKey="tempBins.from24to30" name="24-30°C (QUENTE)" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="tempBins.above30" name="> 30°C (EXTREMO)" stackId="a" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="text-[10px] text-gray-400 mt-2 p-2 bg-[#080808] border border-[#1f2937] uppercase">
              <strong className="text-white">ADVECÇÃO TÉRMICA:</strong> Ventos de <strong className="text-cyan-400">S / SSE / SE</strong> concentram mais de 60% dos eventos &lt;18°C devido a frentes polares.
            </div>
          </div>
        </div>

        {/* Air Mass Classifications Detailed Table */}
        <div className="mt-4 pt-3 border-t border-[#1f2937]">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-3 flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-orange-500" />
            Classificação das Massas de Ar Atuantes (12 Meses)
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
            <div className="bg-black p-3 border border-[#1f2937]">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-cyan-400 uppercase text-[11px]">Polar Atlântica (mPa)</span>
                <span className="px-1 py-0.5 text-[9px] bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono">SE / S / SSW</span>
              </div>
              <div className="text-base font-bold text-white font-mono">18.2 °C <span className="text-[10px] font-normal text-gray-400">MÉD</span></div>
              <p className="text-[10px] text-gray-400 mt-1 leading-snug">
                Incursões de alta pressão do oceano austral com rajadas de até 52 km/h. Provoca as mínimas do inverno.
              </p>
            </div>

            <div className="bg-black p-3 border border-[#1f2937]">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-red-400 uppercase text-[11px]">Tropical Continental (mTc)</span>
                <span className="px-1 py-0.5 text-[9px] bg-red-950 border border-red-800 text-red-300 font-mono">NW / WNW / W</span>
              </div>
              <div className="text-base font-bold text-white font-mono">28.6 °C <span className="text-[10px] font-normal text-gray-400">MÉD</span></div>
              <p className="text-[10px] text-gray-400 mt-1 leading-snug">
                Advecção de ar superaquecido e seco da depressão do Chaco. Responsável pelas ondas de calor.
              </p>
            </div>

            <div className="bg-black p-3 border border-[#1f2937]">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-emerald-400 uppercase text-[11px]">Tropical Atlântica (mTa)</span>
                <span className="px-1 py-0.5 text-[9px] bg-emerald-950 border border-emerald-800 text-emerald-300 font-mono">ENE / E / ESE</span>
              </div>
              <div className="text-base font-bold text-white font-mono">23.8 °C <span className="text-[10px] font-normal text-gray-400">MÉD</span></div>
              <p className="text-[10px] text-gray-400 mt-1 leading-snug">
                Alísios de sudeste/leste com umidade moderada. Regime de vento dominante (mais de 41% do tempo).
              </p>
            </div>

            <div className="bg-black p-3 border border-[#1f2937]">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-amber-400 uppercase text-[11px]">Equatorial Continental (mEc)</span>
                <span className="px-1 py-0.5 text-[9px] bg-amber-950 border border-amber-800 text-amber-300 font-mono">N / NNE</span>
              </div>
              <div className="text-base font-bold text-white font-mono">27.8 °C <span className="text-[10px] font-normal text-gray-400">MÉD</span></div>
              <p className="text-[10px] text-gray-400 mt-1 leading-snug">
                Fluxo quente e úmido da Bacia Amazônica (Jatos de Baixo Nível), gerando instabilidade no verão.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

