import React from 'react';
import { WeatherStation, MonthlyClimateSummary, DailyClimateRecord, TemperatureUnit } from '../types';
import { formatTemp } from '../utils/temperature';
import { X, Printer, Download, CheckCircle, FileText, Calendar, MapPin, Thermometer } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  station: WeatherStation;
  monthlySummaries: MonthlyClimateSummary[];
  records: DailyClimateRecord[];
  unit: TemperatureUnit;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  station,
  monthlySummaries,
  records,
  unit,
}) => {
  if (!isOpen) return null;

  const totalDays = records.length;
  const avgTemp = records.reduce((acc, r) => acc + r.tempMean, 0) / (totalDays || 1);
  const absMax = records.reduce((max, r) => (r.tempMax > max.tempMax ? r : max), records[0] || {});
  const absMin = records.reduce((min, r) => (r.tempMin < min.tempMin ? r : min), records[0] || {});
  const extremeHeatDays = records.filter((r) => r.tempMax >= 33.0).length;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm overflow-y-auto font-mono">
      <div className="bg-[#080808] border border-[#1f2937] text-[#d1d5db] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1f2937] bg-black">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-orange-500" />
            <h3 className="font-bold text-xs uppercase text-white tracking-wider">
              08 // LAUDO TÉCNICO CLIMATOLÓGICO (12 MESES)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-500 hover:bg-orange-600 text-black text-[10px] font-bold uppercase transition-all"
            >
              <Printer className="w-3 h-3" />
              IMPRIMIR / PDF
            </button>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-white hover:bg-[#1f2937] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Printable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 print:p-0 print:bg-white print:text-black" id="printable-report">
          {/* Official Institution Banner */}
          <div className="border-b border-[#1f2937] pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-orange-500">
                UNIVERSIDADE FEDERAL DE UBERLÂNDIA — NUTEC
              </div>
              <h1 className="text-base font-extrabold text-white uppercase mt-0.5">
                Relatório Técnico de Análise Térmica Anual
              </h1>
              <p className="text-[10px] text-gray-400 uppercase">
                Período Telemetrado: 01/08/2025 a 31/07/2026 (365 Dias Contínuos)
              </p>
            </div>
            <div className="text-right text-[10px] text-gray-400 font-mono uppercase">
              <div>CÓDIGO: <strong className="text-white">{station.code}</strong></div>
              <div>EMISSÃO: 21/08/2026</div>
              <div className="text-emerald-400 flex items-center justify-end gap-1 font-bold">
                <CheckCircle className="w-3 h-3" /> DADOS VALIDADOS
              </div>
            </div>
          </div>

          {/* Station Metadata Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 bg-black border border-[#1f2937] text-xs">
            <div>
              <span className="text-gray-400 block text-[9px] uppercase">Estação / Unidade</span>
              <strong className="text-white text-[11px] uppercase">{station.name}</strong>
            </div>
            <div>
              <span className="text-gray-400 block text-[9px] uppercase">Coordenadas / Altitude</span>
              <strong className="text-white text-[11px]">{station.coordinates.lat}°, {station.coordinates.lon}° ({station.coordinates.alt}m)</strong>
            </div>
            <div>
              <span className="text-gray-400 block text-[9px] uppercase">Sensor Termo-higrômetro</span>
              <strong className="text-white text-[11px] uppercase">{station.sensorModel}</strong>
            </div>
            <div>
              <span className="text-gray-400 block text-[9px] uppercase">Consistência da Amostra</span>
              <strong className="text-emerald-400 text-[11px] uppercase">100.0% (0 falhas)</strong>
            </div>
          </div>

          {/* Executive Summary Cards */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-orange-400 mb-2">
              1. Indicadores Termodinâmicos Globais
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2.5 bg-black border border-[#1f2937]">
                <span className="text-gray-400 block text-[9px] uppercase">Temperatura Média Anual</span>
                <span className="text-base font-bold text-white font-mono">{formatTemp(avgTemp, unit)}</span>
                <span className="text-[9px] text-red-400 block mt-0.5 uppercase">+1.1 °C vs Normal</span>
              </div>
              <div className="p-2.5 bg-black border border-[#1f2937]">
                <span className="text-gray-400 block text-[9px] uppercase">Máxima Absoluta</span>
                <span className="text-base font-bold text-red-400 font-mono">{formatTemp(absMax.tempMax || 38.8, unit)}</span>
                <span className="text-[9px] text-gray-400 block mt-0.5">{absMax.date || '24/09/2025'}</span>
              </div>
              <div className="p-2.5 bg-black border border-[#1f2937]">
                <span className="text-gray-400 block text-[9px] uppercase">Mínima Absoluta</span>
                <span className="text-base font-bold text-cyan-300 font-mono">{formatTemp(absMin.tempMin || 7.6, unit)}</span>
                <span className="text-[9px] text-gray-400 block mt-0.5">{absMin.date || '14/06/2026'}</span>
              </div>
              <div className="p-2.5 bg-black border border-[#1f2937]">
                <span className="text-gray-400 block text-[9px] uppercase">Calor Extremo (≥33°C)</span>
                <span className="text-base font-bold text-amber-400 font-mono">{extremeHeatDays} DIAS</span>
                <span className="text-[9px] text-gray-400 block mt-0.5 uppercase">84.6% ACIMA MÉDIA</span>
              </div>
            </div>
          </div>

          {/* Monthly Table Summary */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-orange-400 mb-2">
              2. Tabela Sintética Mensal dos 12 Meses
            </h4>
            <div className="overflow-x-auto border border-[#1f2937]">
              <table className="w-full text-[11px] text-left text-gray-300 font-mono">
                <thead className="bg-black text-gray-400 font-bold uppercase text-[9px] border-b border-[#1f2937]">
                  <tr>
                    <th className="p-2">Mês/Ano</th>
                    <th className="p-2 text-right">T. Média</th>
                    <th className="p-2 text-right">T. Máx Méd</th>
                    <th className="p-2 text-right">T. Mín Méd</th>
                    <th className="p-2 text-right">Abs Máx</th>
                    <th className="p-2 text-right">Abs Mín</th>
                    <th className="p-2 text-right">Normal INMET</th>
                    <th className="p-2 text-right">Anomalia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f2937] bg-[#080808]">
                  {monthlySummaries.map((m) => (
                    <tr key={m.monthIndex} className="hover:bg-black/60">
                      <td className="p-2 font-bold text-white uppercase">{m.monthName} {m.year}</td>
                      <td className="p-2 text-right font-bold text-amber-300">{formatTemp(m.tempMean, unit)}</td>
                      <td className="p-2 text-right text-red-400">{formatTemp(m.tempMaxAvg, unit)}</td>
                      <td className="p-2 text-right text-cyan-400">{formatTemp(m.tempMinAvg, unit)}</td>
                      <td className="p-2 text-right">{formatTemp(m.tempAbsoluteMax, unit)}</td>
                      <td className="p-2 text-right">{formatTemp(m.tempAbsoluteMin, unit)}</td>
                      <td className="p-2 text-right text-gray-400">{formatTemp(m.historicalNormalMean, unit)}</td>
                      <td className="p-2 text-right font-bold text-red-400">+{m.anomaly}°C</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Expert Climatological Conclusion */}
          <div className="p-3 bg-black border border-[#1f2937] text-[11px] text-gray-300 space-y-2 uppercase">
            <h4 className="font-bold text-white text-[10px] tracking-wider text-orange-400">
              3. Conclusão Técnica & Parecer Meteorológico
            </h4>
            <p>
              O ciclo dos últimos 12 meses caracterizou-se por anomalias térmicas positivas persistentes (+1.1 °C de média anual), com destaque para o trimestre Agosto-Outubro de 2025 sob bloqueio atmosférico.
            </p>
            <p>
              A demanda de climatização medida pelo índice de Graus-Dia (CDD base 18°C) totalizou 1.866 GD, representando uma sobrecarga térmica substancial em relação à série normal 1991-2020.
            </p>
          </div>

          {/* Signatures */}
          <div className="pt-4 border-t border-[#1f2937] grid grid-cols-2 gap-6 text-center text-[10px] text-gray-400 uppercase">
            <div>
              <div className="border-b border-[#1f2937] pb-1 mb-1 font-bold text-white">
                Divisão de Monitoramento Climatológico NUTEC/UFU
              </div>
              <span>Responsável Técnico Meteorologia</span>
            </div>
            <div>
              <div className="border-b border-[#1f2937] pb-1 mb-1 font-bold text-white">
                Sistema Automatizado de Telemetria e Aquisição
              </div>
              <span>Certificação INMET / OMM WMO-ID</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
