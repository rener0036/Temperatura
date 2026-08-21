import React, { useState, useEffect, useCallback } from 'react';
import { 
  WeatherStation, 
  TemperatureUnit, 
  DailyClimateRecord, 
  MonthlyClimateSummary,
  ThingSpeakLiveState,
  ThingSpeakParsedReading
} from './types';
import { 
  STATIONS, 
  MONTHLY_SUMMARIES, 
  DAILY_RECORDS, 
  HOURLY_THERMAL_MATRIX, 
  THERMAL_WIND_SECTORS 
} from './data/mockClimateData';
import { 
  DEFAULT_THINGSPEAK_CHANNEL, 
  DEFAULT_THINGSPEAK_API_KEY,
  fetchThingSpeakData,
  integrateThingSpeakIntoDailyRecords
} from './services/thingspeak';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { ThingSpeakLiveTab } from './components/ThingSpeakLiveTab';
import { TimeSeriesChart } from './components/TimeSeriesChart';
import { ThermalHeatmap } from './components/ThermalHeatmap';
import { ThermalWindRose } from './components/ThermalWindRose';
import { DistributionStats } from './components/DistributionStats';
import { ClimateAnomaly } from './components/ClimateAnomaly';
import { DataTable } from './components/DataTable';
import { BioclimaticCalculator } from './components/BioclimaticCalculator';
import { ReportModal } from './components/ReportModal';
import { StationSettingsModal } from './components/StationSettingsModal';
import { 
  Activity, 
  Flame, 
  Snowflake, 
  Wind, 
  Download, 
  Calendar, 
  Sparkles,
  Info,
  CheckCircle2,
  Radio
} from 'lucide-react';

export default function App() {
  const [stations, setStations] = useState<WeatherStation[]>(STATIONS);
  const [selectedStation, setSelectedStation] = useState<WeatherStation>(STATIONS[0]);
  const [unit, setUnit] = useState<TemperatureUnit>('C');
  const [activeTab, setActiveTab] = useState<string>('thingspeak');
  const [records, setRecords] = useState<DailyClimateRecord[]>(DAILY_RECORDS);
  const [monthlySummaries, setMonthlySummaries] = useState<MonthlyClimateSummary[]>(MONTHLY_SUMMARIES);
  const [liveSimulation, setLiveSimulation] = useState<boolean>(true);
  const [autoRefreshSeconds, setAutoRefreshSeconds] = useState<number>(15);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // ThingSpeak live state
  const [thingSpeakState, setThingSpeakState] = useState<ThingSpeakLiveState>({
    isConnected: false,
    isLoading: true,
    lastSync: null,
    error: null,
    channelId: DEFAULT_THINGSPEAK_CHANNEL,
    readApiKey: DEFAULT_THINGSPEAK_API_KEY,
    channelInfo: null,
    latestReading: null,
    recentReadings: [],
    totalEntries: 0,
  });

  // Fetch data from ThingSpeak
  const loadThingSpeakData = useCallback(async (channelId?: string, apiKey?: string) => {
    const ch = channelId || selectedStation.channelId ? String(selectedStation.channelId) : DEFAULT_THINGSPEAK_CHANNEL;
    const key = apiKey || selectedStation.readApiKey || DEFAULT_THINGSPEAK_API_KEY;

    setThingSpeakState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await fetchThingSpeakData(ch, key, 80);
      const latest = result.feeds.length > 0 ? result.feeds[result.feeds.length - 1] : null;

      setThingSpeakState({
        isConnected: true,
        isLoading: false,
        lastSync: new Date().toLocaleTimeString('pt-BR'),
        error: null,
        channelId: ch,
        readApiKey: key,
        channelInfo: result.channel,
        latestReading: latest,
        recentReadings: result.feeds,
        totalEntries: result.channel.last_entry_id || result.feeds.length,
      });

      // Integrate real feeds into daily records
      if (result.feeds.length > 0) {
        setRecords((prev) => integrateThingSpeakIntoDailyRecords(result.feeds, prev));
        
        // Update station metadata with real channel name & coordinates
        setSelectedStation((prev) => ({
          ...prev,
          name: result.channel.name || prev.name,
          coordinates: {
            lat: result.channel.latitude ? parseFloat(result.channel.latitude) : prev.coordinates.lat,
            lon: result.channel.longitude ? parseFloat(result.channel.longitude) : prev.coordinates.lon,
            alt: prev.coordinates.alt,
          },
          lastTransmission: `${latest?.formattedDate} ${latest?.formattedTime} (ThingSpeak #${latest?.entryId})`,
        }));
      }
    } catch (err: any) {
      setThingSpeakState((prev) => ({
        ...prev,
        isLoading: false,
        error: err.message || 'Falha ao sincronizar com ThingSpeak',
      }));
    }
  }, [selectedStation.channelId, selectedStation.readApiKey]);

  // Initial load
  useEffect(() => {
    loadThingSpeakData();
  }, [loadThingSpeakData]);

  // Auto-refresh interval (ThingSpeak polling)
  useEffect(() => {
    if (autoRefreshSeconds <= 0) return;

    const timer = setInterval(() => {
      loadThingSpeakData();
    }, autoRefreshSeconds * 1000);

    return () => clearInterval(timer);
  }, [autoRefreshSeconds, loadThingSpeakData]);

  // Fallback subtle live fluctuation when live simulation is toggled on
  useEffect(() => {
    if (!liveSimulation) return;

    const interval = setInterval(() => {
      setRecords((prev) => {
        const lastIdx = prev.length - 1;
        if (lastIdx < 0) return prev;
        const current = { ...prev[lastIdx] };
        const delta = (Math.random() - 0.5) * 0.2;
        current.tempMean = Number((current.tempMean + delta).toFixed(1));
        current.tempMax = Math.max(current.tempMax, current.tempMean + 2.0);
        current.tempMin = Math.min(current.tempMin, current.tempMean - 2.0);

        const newRecords = [...prev];
        newRecords[lastIdx] = current;
        return newRecords;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [liveSimulation]);

  // Handle station updating from modal
  const handleUpdateStation = (updated: WeatherStation) => {
    setSelectedStation(updated);
    setStations((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    if (updated.channelId && updated.readApiKey) {
      loadThingSpeakData(String(updated.channelId), updated.readApiKey);
    }
  };

  // Export CSV generator
  const handleExportCSV = () => {
    const headers = [
      'Data',
      'Mes',
      'Temp_Maxima_C',
      'Temp_Media_C',
      'Temp_Minima_C',
      'Sensacao_Maxima_C',
      'Sensacao_Minima_C',
      'Umidade_Relativa_Pct',
      'Ponto_Orvalho_C',
      'Precipitacao_mm',
      'Vento_Velocidade_kmh',
      'Vento_Direcao',
      'Graus_Dia_CDD',
      'Graus_Dia_HDD',
      'Anomalia_C',
      'Condicao'
    ];

    const rows = records.map((r) => [
      r.date,
      r.monthName,
      r.tempMax,
      r.tempMean,
      r.tempMin,
      r.apparentTempMax,
      r.apparentTempMin,
      r.humidityMean,
      r.dewPointMean,
      r.precipitation,
      r.windSpeedMean,
      r.windDirectionDominant,
      r.cdd,
      r.hdd,
      r.anomaly,
      r.condition
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `telemetria_thingspeak_321770_${selectedStation.code}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#d1d5db] font-mono antialiased selection:bg-orange-500 selection:text-black flex flex-col">
      {/* Top Header & Navigation */}
      <Header
        stations={stations}
        selectedStation={selectedStation}
        onSelectStation={(st) => {
          setSelectedStation(st);
          if (st.channelId && st.readApiKey) {
            loadThingSpeakData(String(st.channelId), st.readApiKey);
          }
        }}
        unit={unit}
        onToggleUnit={setUnit}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onExportCSV={handleExportCSV}
        liveSimulation={liveSimulation}
        onToggleLive={() => setLiveSimulation(!liveSimulation)}
        isThingSpeakConnected={thingSpeakState.isConnected}
      />

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-2 sm:px-4 py-4 space-y-4 flex-1">
        {/* KPI Metrics Summary Row */}
        <MetricCards
          records={records}
          monthlySummaries={monthlySummaries}
          unit={unit}
        />

        {/* Tab 0: ThingSpeak Live & 8 Sensor Monitor */}
        {activeTab === 'thingspeak' && (
          <ThingSpeakLiveTab
            liveState={thingSpeakState}
            unit={unit}
            onRefresh={() => loadThingSpeakData()}
            onOpenSettings={() => setIsSettingsOpen(true)}
            autoRefreshInterval={autoRefreshSeconds}
            onChangeAutoRefresh={setAutoRefreshSeconds}
          />
        )}

        {/* Tab 1: Overview & Time Series */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <TimeSeriesChart
              records={records}
              monthlySummaries={monthlySummaries}
              unit={unit}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-8">
                <BioclimaticCalculator unit={unit} />
              </div>

              {/* Station Health & Climatological Highlights */}
              <div className="lg:col-span-4 bg-[#080808] p-4 border border-[#1f2937] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs pb-3 mb-3 border-b border-[#1f2937]">
                    <span className="font-bold uppercase tracking-wider text-white flex items-center gap-1.5 text-[10px]">
                      <Activity className="w-3.5 h-3.5 text-emerald-400" />
                      03 // DESTAQUES CLIMATOLÓGICOS
                    </span>
                    <span className="text-emerald-400 text-[10px] font-mono flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> 100% VÁLIDO
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-[#d1d5db]">
                    <div className="p-2.5 bg-black border border-[#1f2937]">
                      <strong className="text-orange-400 block mb-0.5 text-[10px] uppercase">Ondas de Calor (Primavera 2025):</strong>
                      <span className="text-[11px] text-gray-300">Setembro e Outubro registraram 31 dias com temperaturas superiores a 33°C sob bloqueio atmosférico.</span>
                    </div>

                    <div className="p-2.5 bg-black border border-[#1f2937]">
                      <strong className="text-cyan-400 block mb-0.5 text-[10px] uppercase">Mínima Extrema de Inverno (Jun 2026):</strong>
                      <span className="text-[11px] text-gray-300">Massa Polar Atlântica (mPa) derrubou a temperatura para 7.6°C no dia 14/06/2026 (sensação 6.2°C).</span>
                    </div>

                    <div className="p-2.5 bg-black border border-[#1f2937]">
                      <strong className="text-amber-400 block mb-0.5 text-[10px] uppercase">Advecção Noroeste vs Sul:</strong>
                      <span className="text-[11px] text-gray-300">Ventos NW aquecem o ar em média para 28.6°C; ventos S resfriam para 18.2°C.</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-[#1f2937] flex items-center justify-between text-[10px] text-gray-400 uppercase">
                  <span>SENSOR: DHT22 / PT100</span>
                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="text-orange-400 hover:text-orange-300 font-bold underline underline-offset-2"
                  >
                    ESPECIFICAÇÕES
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Heatmap 24h x 12 Meses */}
        {activeTab === 'heatmap' && (
          <ThermalHeatmap
            hourlyMatrix={HOURLY_THERMAL_MATRIX}
            unit={unit}
          />
        )}

        {/* Tab 3: Rosa Térmica & Ventos */}
        {activeTab === 'windrose' && (
          <ThermalWindRose
            sectors={THERMAL_WIND_SECTORS}
            unit={unit}
          />
        )}

        {/* Tab 4: Distribuição & Boxplot */}
        {activeTab === 'distribution' && (
          <DistributionStats
            records={records}
            monthlySummaries={monthlySummaries}
            unit={unit}
          />
        )}

        {/* Tab 5: Anomalias & Normais INMET */}
        {activeTab === 'anomalies' && (
          <ClimateAnomaly
            monthlySummaries={monthlySummaries}
            unit={unit}
          />
        )}

        {/* Tab 6: Tabela de Dados Diários */}
        {activeTab === 'table' && (
          <DataTable
            records={records}
            unit={unit}
            onExportCSV={handleExportCSV}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#080808] border-t border-[#1f2937] py-3 text-[10px] text-gray-400 mt-auto uppercase">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">NUTEC / UFU</span>
            <span>//</span>
            <span>MONITORAMENTO METEOROLÓGICO DE TEMPERATURAS - THINGSPEAK CANAL 321770</span>
          </div>
          <div className="flex items-center gap-3 text-[10px]">
            <span>NORMAIS INMET 1991-2020</span>
            <span>//</span>
            <span className="text-emerald-400 font-mono font-bold">STATUS: TELEMETRIA ATIVA (ONLINE)</span>
          </div>
        </div>
      </footer>

      {/* Technical Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        station={selectedStation}
        monthlySummaries={monthlySummaries}
        records={records}
        unit={unit}
      />

      {/* Station Settings Modal */}
      <StationSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        station={selectedStation}
        onUpdateStation={handleUpdateStation}
      />
    </div>
  );
}
