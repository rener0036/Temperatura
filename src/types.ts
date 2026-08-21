export type TemperatureUnit = 'C' | 'F' | 'K';

export interface DailyClimateRecord {
  id: string;
  date: string; // YYYY-MM-DD
  month: number; // 0-11
  day: number;
  monthName: string;
  tempMax: number; // in Celsius
  tempMin: number;
  tempMean: number;
  apparentTempMax: number; // Sensation
  apparentTempMin: number;
  humidityMean: number; // %
  dewPointMean: number; // °C
  solarRadiation: number; // MJ/m² or W/m²
  precipitation: number; // mm
  windSpeedMean: number; // km/h
  windSpeedMax: number; // km/h (rajada)
  windDirectionDominant: string; // N, NE, E, SE, S, SW, W, NW
  windDirectionDeg: number;
  cdd: number; // Cooling Degree Days base 18°C
  hdd: number; // Heating Degree Days base 18°C
  anomaly: number; // vs normal
  condition: 'sunny' | 'cloudy' | 'rainy' | 'storm' | 'heatwave' | 'coldfront';
  alert?: 'heatwave' | 'coldfront' | 'dry' | 'frost' | null;
}

export interface MonthlyClimateSummary {
  monthIndex: number; // 0-11
  monthName: string;
  year: number;
  tempMean: number;
  tempMaxAvg: number;
  tempMinAvg: number;
  tempAbsoluteMax: number;
  tempAbsoluteMaxDate: string;
  tempAbsoluteMin: number;
  tempAbsoluteMinDate: string;
  thermalAmplitudeAvg: number;
  historicalNormalMean: number; // Climatological normal (e.g. 1991-2020 INMET)
  historicalNormalMax: number;
  historicalNormalMin: number;
  anomaly: number;
  totalPrecipitation: number;
  humidityMean: number;
  extremeHeatDays: number; // days >= 33°C
  cddTotal: number;
  hddTotal: number;
  dominantWindDirection: string;
  dominantWindSpeed: number;
  p10: number;
  p25: number;
  median: number;
  p75: number;
  p90: number;
}

export interface HourlyThermalPoint {
  hour: number; // 0-23
  month: number; // 0-11
  monthName: string;
  temp: number;
  apparentTemp: number;
  humidity: number;
}

export interface ThermalWindSector {
  direction: string; // N, NNE, NE, ENE, E, ESE, SE, SSE, S, SSW, SW, WSW, W, WNW, NW, NNW
  angle: number;
  frequency: number; // % of time
  avgTemp: number; // °C
  avgWindSpeed: number; // km/h
  airMassType: 'Tropical Continental' | 'Polar Atlântica' | 'Tropical Atlântica' | 'Equatorial Continental';
  tempBins: {
    under18: number;
    from18to24: number;
    from24to30: number;
    above30: number;
  };
}

export interface WeatherStation {
  id: string;
  name: string;
  code: string;
  location: string;
  state: string;
  coordinates: {
    lat: number;
    lon: number;
    alt: number; // altitude in meters
  };
  sensorModel: string;
  installationDate: string;
  lastTransmission: string;
  status: 'online' | 'calibrating' | 'maintenance';
  channelId?: number | string;
  readApiKey?: string;
  isThingSpeak?: boolean;
}

export interface ThingSpeakRawFeed {
  created_at: string;
  entry_id: number;
  field1: string | null; // Temperatura (°C)
  field2: string | null; // Umidade (%)
  field3: string | null; // Pressão Atmosférica (hPa)
  field4: string | null; // Velocidade do Vento (km/h ou m/s)
  field5: string | null; // Ponto de Orvalho (°C)
  field6: string | null; // Direção do Vento (°)
  field7: string | null; // CO (ppm)
  field8: string | null; // CO2 (ppm)
}

export interface ThingSpeakParsedReading {
  entryId: number;
  timestamp: string;
  formattedTime: string;
  formattedDate: string;
  temperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  dewPoint: number;
  windDirection: number;
  windDirectionLabel: string;
  co: number;
  co2: number;
  apparentTemp: number;
}

export interface ThingSpeakChannelInfo {
  id: number;
  name: string;
  description: string;
  latitude: string;
  longitude: string;
  field1: string;
  field2: string;
  field3: string;
  field4: string;
  field5: string;
  field6: string;
  field7: string;
  field8: string;
  created_at: string;
  updated_at: string;
  last_entry_id: number;
}

export interface ThingSpeakLiveState {
  isConnected: boolean;
  isLoading: boolean;
  lastSync: string | null;
  error: string | null;
  channelId: string;
  readApiKey: string;
  channelInfo: ThingSpeakChannelInfo | null;
  latestReading: ThingSpeakParsedReading | null;
  recentReadings: ThingSpeakParsedReading[];
  totalEntries: number;
}

export interface ClimatologicalNormalComparison {
  parameter: string;
  observed12m: number;
  normal1991_2020: number;
  deviation: number;
  unit: string;
  interpretation: string;
}
