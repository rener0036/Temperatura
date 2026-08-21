import { 
  ThingSpeakRawFeed, 
  ThingSpeakParsedReading, 
  ThingSpeakChannelInfo,
  DailyClimateRecord,
  HourlyThermalPoint,
  ThermalWindSector
} from '../types';

export const DEFAULT_THINGSPEAK_CHANNEL = '321770';
export const DEFAULT_THINGSPEAK_API_KEY = '0EPAIXIM4UL9LIW9';

/**
 * Maps degrees to 16 compass points
 */
export function getWindDirectionSector(deg: number): string {
  const normalized = ((deg % 360) + 360) % 360;
  const sectors = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(normalized / 22.5) % 16;
  return sectors[index];
}

/**
 * Calculates apparent temperature / heat index or wind chill
 */
export function calculateApparentTemperature(t: number, rh: number, windKmh: number = 0): number {
  if (t >= 20) {
    // Simplified Steadman Rothfusz Heat Index
    const c1 = -8.78469475556;
    const c2 = 1.61139411;
    const c3 = 2.33854883889;
    const c4 = -0.14611605;
    const c5 = -0.012308094;
    const c6 = -0.0164248277778;
    const c7 = 0.002211732;
    const c8 = 0.00072546;
    const c9 = -0.000003582;

    const hi = c1 + c2 * t + c3 * rh + c4 * t * rh + c5 * t * t + c6 * rh * rh +
      c7 * t * t * rh + c8 * t * rh * rh + c9 * t * t * rh * rh;
    return Number(Math.max(t, hi).toFixed(1));
  } else if (t <= 10 && windKmh > 4.8) {
    // Wind chill
    const wc = 13.12 + 0.6215 * t - 11.37 * Math.pow(windKmh, 0.16) + 0.3965 * t * Math.pow(windKmh, 0.16);
    return Number(wc.toFixed(1));
  }
  return t;
}

/**
 * Parses raw ThingSpeak feed item
 */
export function parseThingSpeakFeed(feed: ThingSpeakRawFeed): ThingSpeakParsedReading {
  const temp = feed.field1 !== null && feed.field1 !== '' ? parseFloat(feed.field1) : 24.5;
  const humidity = feed.field2 !== null && feed.field2 !== '' ? parseFloat(feed.field2) : 60;
  const pressure = feed.field3 !== null && feed.field3 !== '' ? parseFloat(feed.field3) : 1014.2;
  const windSpeed = feed.field4 !== null && feed.field4 !== '' ? parseFloat(feed.field4) : 0;
  const dewPoint = feed.field5 !== null && feed.field5 !== '' ? parseFloat(feed.field5) : 17.5;
  const windDirDeg = feed.field6 !== null && feed.field6 !== '' ? parseFloat(feed.field6) : 0;
  const co = feed.field7 !== null && feed.field7 !== '' ? parseFloat(feed.field7) : 0.65;
  const co2 = feed.field8 !== null && feed.field8 !== '' ? parseFloat(feed.field8) : 403.0;

  const dateObj = new Date(feed.created_at);
  const formattedTime = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formattedDate = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const safeTemp = isNaN(temp) ? 24.0 : temp;
  const safeHumidity = isNaN(humidity) ? 60.0 : humidity;
  const apparentTemp = calculateApparentTemperature(safeTemp, safeHumidity, isNaN(windSpeed) ? 0 : windSpeed);

  return {
    entryId: feed.entry_id,
    timestamp: feed.created_at,
    formattedTime,
    formattedDate,
    temperature: safeTemp,
    humidity: isNaN(humidity) ? 60 : humidity,
    pressure: isNaN(pressure) ? 1014.0 : pressure,
    windSpeed: isNaN(windSpeed) ? 0 : windSpeed,
    dewPoint: isNaN(dewPoint) ? 17.0 : dewPoint,
    windDirection: isNaN(windDirDeg) ? 0 : windDirDeg,
    windDirectionLabel: getWindDirectionSector(isNaN(windDirDeg) ? 0 : windDirDeg),
    co: isNaN(co) ? 0.6 : co,
    co2: isNaN(co2) ? 400.0 : co2,
    apparentTemp,
  };
}

/**
 * Fetches recent feeds from ThingSpeak
 */
export async function fetchThingSpeakData(
  channelId: string = DEFAULT_THINGSPEAK_CHANNEL,
  apiKey: string = DEFAULT_THINGSPEAK_API_KEY,
  results: number = 100
): Promise<{ channel: ThingSpeakChannelInfo; feeds: ThingSpeakParsedReading[] }> {
  const url = `https://api.thingspeak.com/channels/${channelId}/feeds.json?api_key=${apiKey}&results=${results}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Erro na API ThingSpeak (${response.status}): ${response.statusText}`);
  }
  
  const data = await response.json();
  if (!data || !data.channel) {
    throw new Error('Canal ThingSpeak não encontrado ou resposta vazia.');
  }

  const feeds = (data.feeds || []).map((f: ThingSpeakRawFeed) => parseThingSpeakFeed(f));
  
  return {
    channel: data.channel as ThingSpeakChannelInfo,
    feeds,
  };
}

/**
 * Fetches the single latest reading from ThingSpeak
 */
export async function fetchThingSpeakLatest(
  channelId: string = DEFAULT_THINGSPEAK_CHANNEL,
  apiKey: string = DEFAULT_THINGSPEAK_API_KEY
): Promise<ThingSpeakParsedReading> {
  const url = `https://api.thingspeak.com/channels/${channelId}/feeds/last.json?api_key=${apiKey}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Erro ao obter último feed (${response.status})`);
  }
  const data: ThingSpeakRawFeed = await response.json();
  return parseThingSpeakFeed(data);
}

/**
 * Merges real-time ThingSpeak feeds into daily records
 */
export function integrateThingSpeakIntoDailyRecords(
  feeds: ThingSpeakParsedReading[],
  baseRecords: DailyClimateRecord[]
): DailyClimateRecord[] {
  if (!feeds || feeds.length === 0) return baseRecords;

  const updated = [...baseRecords];
  const lastIndex = updated.length - 1;

  if (lastIndex >= 0) {
    // Calculate statistics from recent real feeds
    const temps = feeds.map((f) => f.temperature);
    const humidities = feeds.map((f) => f.humidity);
    const dewPoints = feeds.map((f) => f.dewPoint);
    const winds = feeds.map((f) => f.windSpeed);

    const latest = feeds[feeds.length - 1];
    const avgTemp = Number((temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1));
    const maxTemp = Number(Math.max(...temps).toFixed(1));
    const minTemp = Number(Math.min(...temps).toFixed(1));
    const avgHum = Math.round(humidities.reduce((a, b) => a + b, 0) / humidities.length);
    const avgDew = Number((dewPoints.reduce((a, b) => a + b, 0) / dewPoints.length).toFixed(1));
    const avgWind = Number((winds.reduce((a, b) => a + b, 0) / winds.length).toFixed(1));

    // Update current day with real telemetry
    updated[lastIndex] = {
      ...updated[lastIndex],
      tempMean: avgTemp || latest.temperature,
      tempMax: Math.max(updated[lastIndex].tempMax, maxTemp, latest.temperature),
      tempMin: Math.min(updated[lastIndex].tempMin, minTemp, latest.temperature),
      apparentTempMax: calculateApparentTemperature(Math.max(updated[lastIndex].tempMax, maxTemp), avgHum),
      apparentTempMin: calculateApparentTemperature(Math.min(updated[lastIndex].tempMin, minTemp), avgHum),
      humidityMean: avgHum,
      dewPointMean: avgDew,
      windSpeedMean: avgWind,
      windDirectionDominant: latest.windDirectionLabel,
      windDirectionDeg: latest.windDirection,
    };
  }

  return updated;
}
