import React, { useState } from 'react';
import { HourlyThermalPoint, TemperatureUnit } from '../types';
import { convertTemperature, formatTemp, getThermalColor } from '../utils/temperature';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { Sun, Moon, Clock, Info, Flame, Eye, Layers } from 'lucide-react';

interface ThermalHeatmapProps {
  hourlyMatrix: HourlyThermalPoint[];
  unit: TemperatureUnit;
}

export const ThermalHeatmap: React.FC<ThermalHeatmapProps> = ({
  hourlyMatrix,
  unit,
}) => {
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [hoveredCell, setHoveredCell] = useState<HourlyThermalPoint | null>(null);

  const months = [
    'Ago/25', 'Set/25', 'Out/25', 'Nov/25', 'Dez/25', 'Jan/26',
    'Fev/26', 'Mar/26', 'Abr/26', 'Mai/26', 'Jun/26', 'Jul/26',
  ];

  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Group matrix into 12 rows (months) x 24 columns (hours)
  const getCell = (monthIdx: number, hour: number) => {
    return hourlyMatrix.find((p) => p.month === monthIdx && p.hour === hour);
  };

  // Prepare Seasonal Diurnal Curves (Verão: Jan, Outono: Abr, Inverno: Jul, Primavera: Out)
  const diurnalCurves = hours.map((h) => {
    const pVerao = getCell(5, h); // Jan/26
    const pOutono = getCell(8, h); // Abr/26
    const pInverno = getCell(11, h); // Jul/26
    const pPrimavera = getCell(2, h); // Out/25

    return {
      hour: `${String(h).padStart(2, '0')}:00`,
      hourNum: h,
      Verao: pVerao ? Number(convertTemperature(pVerao.temp, unit).toFixed(1)) : 0,
      Outono: pOutono ? Number(convertTemperature(pOutono.temp, unit).toFixed(1)) : 0,
      Inverno: pInverno ? Number(convertTemperature(pInverno.temp, unit).toFixed(1)) : 0,
      Primavera: pPrimavera ? Number(convertTemperature(pPrimavera.temp, unit).toFixed(1)) : 0,
    };
  });

  const unitSymbol = unit === 'C' ? '°C' : unit === 'F' ? '°F' : 'K';

  return (
    <div className="space-y-4 font-mono">
      {/* 1. Heatmap Matrix 24h x 12 Meses */}
      <div className="border border-[#1f2937] bg-[#080808] p-4 text-[#d1d5db]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-3 border-b border-[#1f2937]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-orange-500 font-bold tracking-widest uppercase">03 // MATRIZ TÉRMICA DIURNA</span>
              <span className="text-gray-600">//</span>
              <span className="text-[10px] text-gray-400 uppercase font-mono">288 INTERVALOS AMOSTRAIS</span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2 mt-0.5 uppercase">
              <Clock className="w-4 h-4 text-orange-500" />
              Matriz Horária de Temperatura (24H x 12 Meses)
            </h3>
          </div>

          {/* Hovered cell info badge */}
          {hoveredCell ? (
            <div className="bg-black px-3 py-1 border border-orange-500/50 text-xs flex items-center gap-3">
              <span className="text-gray-300 font-bold">{hoveredCell.monthName} @ {String(hoveredCell.hour).padStart(2, '0')}:00</span>
              <span className="font-bold text-orange-400 font-mono">{formatTemp(hoveredCell.temp, unit)}</span>
              <span className="text-gray-400">UR: {hoveredCell.humidity}%</span>
            </div>
          ) : (
            <div className="text-[10px] text-gray-500 uppercase">
              PASSE O MOUSE NAS CÉLULAS PARA TELEMETRIA PONTUAL
            </div>
          )}
        </div>

        {/* Heatmap Grid Table */}
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[700px]">
            {/* Header: Hours 00h to 23h */}
            <div className="grid grid-cols-[70px_repeat(24,1fr)] gap-1 text-[10px] font-mono text-gray-500 mb-1 px-1">
              <div className="font-bold text-gray-400 uppercase">MÊS</div>
              {hours.map((h) => (
                <div 
                  key={h} 
                  className={`text-center font-bold ${h === 6 || h === 15 ? 'text-orange-500' : ''}`}
                  title={`${String(h).padStart(2, '0')}:00`}
                >
                  {h % 2 === 0 ? String(h).padStart(2, '0') : ''}
                </div>
              ))}
            </div>

            {/* Matrix Rows */}
            <div className="space-y-1">
              {months.map((mName, mIdx) => (
                <div key={mIdx} className="grid grid-cols-[70px_repeat(24,1fr)] gap-1 items-center">
                  <span className="text-[11px] font-bold text-gray-300 truncate pr-1 font-mono uppercase">
                    {mName}
                  </span>
                  {hours.map((h) => {
                    const cell = getCell(mIdx, h);
                    if (!cell) return <div key={h} className="h-6 bg-black border border-[#1f2937]" />;
                    const color = getThermalColor(cell.temp);

                    return (
                      <div
                        key={h}
                        onMouseEnter={() => setHoveredCell(cell)}
                        className="h-6 rounded-none transition-all hover:scale-110 hover:z-10 hover:ring-1 hover:ring-white cursor-pointer relative group flex items-center justify-center border border-black/30"
                        style={{ backgroundColor: color }}
                        title={`${mName} ${String(h).padStart(2, '0')}:00 -> ${cell.temp}°C (${cell.humidity}% UR)`}
                      >
                        {/* Show text only if hovered */}
                        <span className="text-[9px] font-bold text-black opacity-0 group-hover:opacity-100 font-mono">
                          {Math.round(cell.temp)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Heatmap Legend Bar */}
        <div className="mt-4 pt-3 border-t border-[#1f2937] flex flex-wrap items-center justify-between gap-3 text-[10px] text-gray-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-300 uppercase">ESCALA TÉRMICA:</span>
            <div className="flex items-center gap-1 font-mono">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5" style={{ backgroundColor: '#3b82f6' }}></span> &lt;10°C</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5" style={{ backgroundColor: '#06b6d4' }}></span> 10-16°C</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5" style={{ backgroundColor: '#10b981' }}></span> 16-21°C</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5" style={{ backgroundColor: '#f59e0b' }}></span> 21-26°C</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5" style={{ backgroundColor: '#f97316' }}></span> 26-31°C</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5" style={{ backgroundColor: '#ef4444' }}></span> 31-36°C</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5" style={{ backgroundColor: '#991b1b' }}></span> &gt;36°C</span>
            </div>
          </div>
          <div className="text-[10px] text-gray-400 flex items-center gap-3">
            <span className="flex items-center gap-1"><Sun className="w-3 h-3 text-amber-400" /> PICO TÉRMICO: ~15:00</span>
            <span className="flex items-center gap-1"><Moon className="w-3 h-3 text-cyan-400" /> MÍNIMA: ~06:00</span>
          </div>
        </div>
      </div>

      {/* 2. Diurnal Cycle Seasonal Curves Chart */}
      <div className="border border-[#1f2937] bg-[#080808] p-4 text-[#d1d5db]">
        <div className="mb-3 pb-2 border-b border-[#1f2937]">
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2 uppercase">
            <Sun className="w-4 h-4 text-amber-400" />
            Curvas do Ciclo Diurno Médio por Estação do Ano
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5 uppercase">
            Perfil de 24 horas evidenciando amplitude térmica no Inverno/Seca vs Verão úmido.
          </p>
        </div>

        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={diurnalCurves} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 2" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="hour" stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }} />
              <YAxis stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }} unit={` ${unitSymbol}`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#000000', borderColor: '#1f2937', borderRadius: '0px', fontSize: '11px', fontFamily: 'JetBrains Mono, monospace' }}
                itemStyle={{ fontSize: '11px' }}
              />
              <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px', fontFamily: 'JetBrains Mono, monospace' }} />

              <Line
                type="monotone"
                dataKey="Verao"
                name="VERÃO (JAN)"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="Primavera"
                name="PRIMAVERA (OUT)"
                stroke="#f97316"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="Outono"
                name="OUTONO (ABR)"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="Inverno"
                name="INVERNO (JUL)"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3 p-2.5 bg-black border border-[#1f2937] text-[10px] text-gray-300 flex items-start gap-2">
          <Info className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
          <span>
            <strong className="text-white">DIAGNÓSTICO CLIMATOLÓGICO:</strong> No inverno (Julho), a perda radiativa noturna provoca mínimas de 11.8°C ao amanhecer (06h), com rápida elevação térmica até 27.5°C às 15h, gerando uma amplitude diária média de 15.7°C. No verão (Janeiro), a cobertura de nuvens e umidade retém calor, limitando a amplitude a 10.5°C.
          </span>
        </div>
      </div>
    </div>
  );
};

