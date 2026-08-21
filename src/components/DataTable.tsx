import React, { useState, useMemo } from 'react';
import { DailyClimateRecord, TemperatureUnit } from '../types';
import { convertTemperature, formatTemp, getThermalCategory } from '../utils/temperature';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Download, 
  AlertTriangle, 
  Flame, 
  Snowflake, 
  Sun, 
  CloudRain, 
  Wind,
  Calendar
} from 'lucide-react';

interface DataTableProps {
  records: DailyClimateRecord[];
  unit: TemperatureUnit;
  onExportCSV: () => void;
}

export const DataTable: React.FC<DataTableProps> = ({
  records,
  unit,
  onExportCSV,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedAlert, setSelectedAlert] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof DailyClimateRecord>('date');
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const months = [
    'Ago/25', 'Set/25', 'Out/25', 'Nov/25', 'Dez/25', 'Jan/26',
    'Fev/26', 'Mar/26', 'Abr/26', 'Mai/26', 'Jun/26', 'Jul/26',
  ];

  const handleSort = (field: keyof DailyClimateRecord) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchesSearch = r.date.includes(searchTerm) || r.monthName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMonth = selectedMonth === 'all' || r.monthName === selectedMonth;
      const matchesAlert = 
        selectedAlert === 'all' 
          ? true 
          : selectedAlert === 'heatwave' 
          ? r.tempMax >= 34 
          : selectedAlert === 'cold' 
          ? r.tempMin <= 11 
          : selectedAlert === 'rain' 
          ? r.precipitation > 0 
          : true;

      return matchesSearch && matchesMonth && matchesAlert;
    }).sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }
      return sortAsc 
        ? String(valA).localeCompare(String(valB)) 
        : String(valB).localeCompare(String(valA));
    });
  }, [records, searchTerm, selectedMonth, selectedAlert, sortField, sortAsc]);

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getConditionBadge = (r: DailyClimateRecord) => {
    if (r.tempMax >= 36) {
      return (
        <span className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold bg-red-950/80 text-red-400 border border-red-800 uppercase">
          <Flame className="w-3 h-3 text-red-500" /> CALOR ({r.tempMax.toFixed(0)}°)
        </span>
      );
    }
    if (r.tempMin <= 9) {
      return (
        <span className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold bg-cyan-950/80 text-cyan-400 border border-cyan-800 uppercase">
          <Snowflake className="w-3 h-3 text-cyan-400" /> FRIO ({r.tempMin.toFixed(0)}°)
        </span>
      );
    }
    if (r.precipitation > 10) {
      return (
        <span className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold bg-blue-950/80 text-blue-400 border border-blue-800 uppercase">
          <CloudRain className="w-3 h-3 text-blue-400" /> CHUVA ({r.precipitation}mm)
        </span>
      );
    }
    if (r.humidityMean < 30) {
      return (
        <span className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold bg-amber-950/80 text-amber-400 border border-amber-800 uppercase">
          <AlertTriangle className="w-3 h-3 text-amber-500" /> SECO (&lt;30%)
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-black text-gray-500 border border-[#1f2937] uppercase">
        <Sun className="w-3 h-3 text-amber-500/70" /> ESTÁVEL
      </span>
    );
  };

  return (
    <div className="border border-[#1f2937] bg-[#080808] p-4 text-[#d1d5db] font-mono">
      {/* Table Header & Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 pb-3 border-b border-[#1f2937]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-orange-500 font-bold tracking-widest uppercase">06 // REGISTROS BRUTOS & AUDITORIA</span>
            <span className="text-gray-600">//</span>
            <span className="text-[10px] text-gray-400 uppercase font-mono">365 DIAS AMOSTRAIS</span>
          </div>
          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2 mt-0.5 uppercase">
            <Calendar className="w-4 h-4 text-orange-500" />
            Tabela de Dados Diários de Telemetria Contínua
          </h2>
        </div>

        {/* Action button */}
        <button
          onClick={onExportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-black text-xs font-bold font-mono transition-all self-start lg:self-auto uppercase"
        >
          <Download className="w-3.5 h-3.5" />
          EXPORTAR CSV (365D)
        </button>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-3 text-xs">
        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="BUSCAR DATA (AAAA-MM-DD)..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-8 pr-2.5 py-1.5 bg-black text-xs text-white border border-[#1f2937] focus:outline-none focus:border-orange-500 font-mono placeholder:text-gray-600"
          />
        </div>

        {/* Month Filter */}
        <div className="flex items-center gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full py-1.5 px-2.5 bg-black text-xs text-white border border-[#1f2937] focus:outline-none focus:border-orange-500 cursor-pointer font-mono uppercase"
          >
            <option value="all">TODOS OS 12 MESES</option>
            {months.map((m) => (
              <option key={m} value={m}>{m.toUpperCase()}</option>
            ))}
          </select>
        </div>

        {/* Alert / Condition Filter */}
        <div className="flex items-center gap-2">
          <select
            value={selectedAlert}
            onChange={(e) => {
              setSelectedAlert(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full py-1.5 px-2.5 bg-black text-xs text-white border border-[#1f2937] focus:outline-none focus:border-orange-500 cursor-pointer font-mono uppercase"
          >
            <option value="all">TODAS AS CONDIÇÕES</option>
            <option value="heatwave">CALOR EXTREMO (≥ 34°C)</option>
            <option value="cold">DIAS FRIOS (≤ 11°C)</option>
            <option value="rain">COM PRECIPITAÇÃO</option>
          </select>
        </div>
      </div>

      {/* Table Component */}
      <div className="overflow-x-auto border border-[#1f2937]">
        <table className="w-full text-xs text-left text-gray-300 font-mono">
          <thead className="bg-black text-gray-400 uppercase text-[10px] tracking-wider font-bold border-b border-[#1f2937]">
            <tr>
              <th 
                className="px-3 py-2 cursor-pointer hover:text-white"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center gap-1">
                  DATA
                  {sortField === 'date' ? (sortAsc ? <ArrowUp className="w-3 h-3 text-orange-500" /> : <ArrowDown className="w-3 h-3 text-orange-500" />) : <ArrowUpDown className="w-3 h-3 text-gray-600" />}
                </div>
              </th>
              <th 
                className="px-3 py-2 text-right cursor-pointer hover:text-white"
                onClick={() => handleSort('tempMax')}
              >
                <div className="flex items-center justify-end gap-1">
                  T. MÁX
                  {sortField === 'tempMax' ? (sortAsc ? <ArrowUp className="w-3 h-3 text-orange-500" /> : <ArrowDown className="w-3 h-3 text-orange-500" />) : <ArrowUpDown className="w-3 h-3 text-gray-600" />}
                </div>
              </th>
              <th 
                className="px-3 py-2 text-right cursor-pointer hover:text-white"
                onClick={() => handleSort('tempMean')}
              >
                <div className="flex items-center justify-end gap-1">
                  T. MÉD
                  {sortField === 'tempMean' ? (sortAsc ? <ArrowUp className="w-3 h-3 text-orange-500" /> : <ArrowDown className="w-3 h-3 text-orange-500" />) : <ArrowUpDown className="w-3 h-3 text-gray-600" />}
                </div>
              </th>
              <th 
                className="px-3 py-2 text-right cursor-pointer hover:text-white"
                onClick={() => handleSort('tempMin')}
              >
                <div className="flex items-center justify-end gap-1">
                  T. MÍN
                  {sortField === 'tempMin' ? (sortAsc ? <ArrowUp className="w-3 h-3 text-orange-500" /> : <ArrowDown className="w-3 h-3 text-orange-500" />) : <ArrowUpDown className="w-3 h-3 text-gray-600" />}
                </div>
              </th>
              <th 
                className="px-3 py-2 text-right cursor-pointer hover:text-white"
                onClick={() => handleSort('apparentTempMax')}
              >
                <div className="flex items-center justify-end gap-1">
                  SENSAÇÃO
                  {sortField === 'apparentTempMax' ? (sortAsc ? <ArrowUp className="w-3 h-3 text-orange-500" /> : <ArrowDown className="w-3 h-3 text-orange-500" />) : <ArrowUpDown className="w-3 h-3 text-gray-600" />}
                </div>
              </th>
              <th 
                className="px-3 py-2 text-right cursor-pointer hover:text-white"
                onClick={() => handleSort('humidityMean')}
              >
                <div className="flex items-center justify-end gap-1">
                  UR %
                  {sortField === 'humidityMean' ? (sortAsc ? <ArrowUp className="w-3 h-3 text-orange-500" /> : <ArrowDown className="w-3 h-3 text-orange-500" />) : <ArrowUpDown className="w-3 h-3 text-gray-600" />}
                </div>
              </th>
              <th 
                className="px-3 py-2 text-center cursor-pointer hover:text-white"
                onClick={() => handleSort('windDirectionDominant')}
              >
                <div className="flex items-center justify-center gap-1">
                  VENTO
                  {sortField === 'windDirectionDominant' ? (sortAsc ? <ArrowUp className="w-3 h-3 text-orange-500" /> : <ArrowDown className="w-3 h-3 text-orange-500" />) : <ArrowUpDown className="w-3 h-3 text-gray-600" />}
                </div>
              </th>
              <th className="px-3 py-2 text-center">STATUS / ALERTA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1f2937] bg-black/40">
            {paginatedRecords.map((r) => (
              <tr key={r.id} className="hover:bg-white/5 transition-colors">
                <td className="px-3 py-2 font-mono text-gray-200">
                  {r.date}
                </td>
                <td className="px-3 py-2 text-right font-mono font-bold text-red-400">
                  {formatTemp(r.tempMax, unit)}
                </td>
                <td className="px-3 py-2 text-right font-mono font-bold text-amber-300">
                  {formatTemp(r.tempMean, unit)}
                </td>
                <td className="px-3 py-2 text-right font-mono font-bold text-cyan-300">
                  {formatTemp(r.tempMin, unit)}
                </td>
                <td className="px-3 py-2 text-right font-mono text-orange-400">
                  {formatTemp(r.apparentTempMax, unit)}
                </td>
                <td className="px-3 py-2 text-right font-mono text-gray-300">
                  {r.humidityMean}%
                </td>
                <td className="px-3 py-2 text-center font-mono text-[11px]">
                  <span className="bg-black px-1.5 py-0.5 text-gray-300 font-bold border border-[#1f2937]">
                    {r.windDirectionDominant} ({r.windSpeedMean}km/h)
                  </span>
                </td>
                <td className="px-3 py-2 text-center">
                  <div className="flex justify-center">
                    {getConditionBadge(r)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-3 pt-3 border-t border-[#1f2937] text-[11px] text-gray-400 uppercase">
        <div>
          MOSTRANDO <strong className="text-white">{(currentPage - 1) * itemsPerPage + 1}</strong> A{' '}
          <strong className="text-white">{Math.min(currentPage * itemsPerPage, filteredRecords.length)}</strong> DE{' '}
          <strong className="text-white">{filteredRecords.length}</strong> DIAS FILTRADOS
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-2.5 py-1 bg-black hover:bg-[#1f2937] text-white disabled:opacity-30 disabled:cursor-not-allowed border border-[#1f2937] text-[10px] font-bold uppercase"
          >
            ANTERIOR
          </button>
          <span className="px-2 font-mono text-gray-300 text-[10px]">
            PÁG {currentPage} / {totalPages || 1}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-2.5 py-1 bg-black hover:bg-[#1f2937] text-white disabled:opacity-30 disabled:cursor-not-allowed border border-[#1f2937] text-[10px] font-bold uppercase"
          >
            PRÓXIMA
          </button>
        </div>
      </div>
    </div>
  );
};

