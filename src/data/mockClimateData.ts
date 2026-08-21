import { DailyClimateRecord, MonthlyClimateSummary, HourlyThermalPoint, ThermalWindSector, WeatherStation, ClimatologicalNormalComparison } from '../types';

export const STATIONS: WeatherStation[] = [
  {
    id: 'thingspeak-321770',
    name: 'Estação Meteorológica Experimental Bairro Alto Umuarama',
    code: 'TS-321770',
    location: 'Bairro Alto Umuarama / Campus Umuarama - Uberlândia / MG',
    state: 'MG',
    coordinates: {
      lat: -18.8891,
      lon: -48.2370,
      alt: 865,
    },
    sensorModel: 'DHT22 / Vaisala PT100 + BMP280 + Anemômetro + Sensores CO/CO2',
    installationDate: '24/08/2017',
    lastTransmission: '21/08/2026 (ThingSpeak Live Feed)',
    status: 'online',
    channelId: '321770',
    readApiKey: '0EPAIXIM4UL9LIW9',
    isThingSpeak: true,
  },
  {
    id: 'ufu-nutec-01',
    name: 'Estação Meteorológica Central NUTEC/UFU',
    code: 'NUTEC-A528',
    location: 'Campus Santa Mônica - Uberlândia / MG',
    state: 'MG',
    coordinates: {
      lat: -18.9186,
      lon: -48.2589,
      alt: 872,
    },
    sensorModel: 'Vaisala WXT530 + Termo-higrômetro PT100 Classe A',
    installationDate: '15/03/2018',
    lastTransmission: '21/08/2026 10:28:45',
    status: 'online',
  },
  {
    id: 'ufu-gloria-03',
    name: 'Estação Micrometeorológica Fazenda Glória',
    code: 'GLO-C104',
    location: 'Fazenda Experimental do Glória - Uberlândia / MG',
    state: 'MG',
    coordinates: {
      lat: -18.9554,
      lon: -48.2045,
      alt: 915,
    },
    sensorModel: 'Davis Vantage Pro2 Plus',
    installationDate: '22/11/2021',
    lastTransmission: '21/08/2026 10:25:30',
    status: 'online',
  },
];

// Months list (Last 12 months: Aug/2025 to Jul/2026)
const MONTH_NAMES = [
  'Ago/25', 'Set/25', 'Out/25', 'Nov/25', 'Dez/25', 'Jan/26',
  'Fev/26', 'Mar/26', 'Abr/26', 'Mai/26', 'Jun/26', 'Jul/26',
];

const FULL_MONTH_NAMES = [
  'Agosto 2025', 'Setembro 2025', 'Outubro 2025', 'Novembro 2025', 'Dezembro 2025', 'Janeiro 2026',
  'Fevereiro 2026', 'Março 2026', 'Abril 2026', 'Maio 2026', 'Junho 2026', 'Julho 2026',
];

const DAYS_IN_MONTH = [31, 30, 31, 30, 31, 31, 28, 31, 30, 31, 30, 31];

// Monthly baseline patterns for Brazilian Cerrado / Southeast (Uberlândia/Triângulo Mineiro)
const MONTHLY_BASELINES = [
  // Aug 25 (Dry, cold nights, warm afternoons)
  { tMean: 22.4, tMaxAvg: 30.2, tMinAvg: 14.5, absMax: 34.6, absMin: 10.8, normal: 21.2, prec: 8.5, rh: 44, cdd: 142, hdd: 6 },
  // Sep 25 (Transition, hot spring begin, heatwave)
  { tMean: 25.8, tMaxAvg: 34.1, tMinAvg: 17.8, absMax: 38.8, absMin: 14.2, normal: 23.6, prec: 34.0, rh: 42, cdd: 234, hdd: 0 },
  // Oct 25 (Warm, rain starting, high humidity)
  { tMean: 26.2, tMaxAvg: 33.4, tMinAvg: 19.5, absMax: 37.5, absMin: 16.8, normal: 24.8, prec: 112.5, rh: 62, cdd: 254, hdd: 0 },
  // Nov 25 (Rainy, warm)
  { tMean: 24.9, tMaxAvg: 30.8, tMinAvg: 19.2, absMax: 34.2, absMin: 17.1, normal: 24.4, prec: 198.0, rh: 76, cdd: 207, hdd: 0 },
  // Dec 25 (Summer rainy season)
  { tMean: 24.6, tMaxAvg: 30.1, tMinAvg: 19.4, absMax: 33.8, absMin: 17.9, normal: 24.2, prec: 275.4, rh: 81, cdd: 204, hdd: 0 },
  // Jan 26 (Peak summer rain)
  { tMean: 24.4, tMaxAvg: 29.8, tMinAvg: 19.3, absMax: 33.4, absMin: 17.5, normal: 24.1, prec: 310.2, rh: 83, cdd: 198, hdd: 0 },
  // Feb 26 (Warm summer)
  { tMean: 24.8, tMaxAvg: 30.6, tMinAvg: 19.1, absMax: 34.5, absMin: 17.0, normal: 24.3, prec: 185.0, rh: 79, cdd: 190, hdd: 0 },
  // Mar 26 (Transition summer-autumn)
  { tMean: 24.2, tMaxAvg: 30.2, tMinAvg: 18.6, absMax: 33.1, absMin: 15.8, normal: 23.9, prec: 145.8, rh: 77, cdd: 192, hdd: 0 },
  // Apr 26 (Autumn, drier)
  { tMean: 22.8, tMaxAvg: 29.4, tMinAvg: 16.5, absMax: 32.0, absMin: 13.1, normal: 22.5, prec: 58.2, rh: 68, cdd: 144, hdd: 2 },
  // May 26 (Cool nights, sunny days)
  { tMean: 20.4, tMaxAvg: 27.6, tMinAvg: 13.2, absMax: 30.2, absMin: 9.8, normal: 20.0, prec: 22.4, rh: 62, cdd: 74, hdd: 18 },
  // Jun 26 (Winter, cold front, frost risk)
  { tMean: 19.2, tMaxAvg: 26.8, tMinAvg: 11.6, absMax: 29.1, absMin: 7.6, normal: 18.8, prec: 6.0, rh: 58, cdd: 36, hdd: 38 },
  // Jul 26 (Cold dry winter)
  { tMean: 19.6, tMaxAvg: 27.5, tMinAvg: 11.8, absMax: 30.5, absMin: 8.2, normal: 18.9, prec: 2.5, rh: 48, cdd: 49, hdd: 32 },
];

export const MONTHLY_SUMMARIES: MonthlyClimateSummary[] = MONTHLY_BASELINES.map((base, idx) => {
  const years = [2025, 2025, 2025, 2025, 2025, 2026, 2026, 2026, 2026, 2026, 2026, 2026];
  const absMaxDates = ['28/08/2025', '24/09/2025', '18/10/2025', '09/11/2025', '14/12/2025', '19/01/2026', '23/02/2026', '12/03/2026', '05/04/2026', '02/05/2026', '03/06/2026', '16/07/2026'];
  const absMinDates = ['11/08/2025', '02/09/2025', '04/10/2025', '22/11/2025', '01/12/2025', '08/01/2026', '15/02/2026', '28/03/2026', '29/04/2026', '20/05/2026', '14/06/2026', '09/07/2026'];
  const heatDays = [6, 17, 14, 5, 2, 1, 4, 2, 0, 0, 0, 0];
  const windDirs = ['ENE', 'N', 'NNW', 'E', 'SE', 'SE', 'E', 'E', 'ESE', 'SE', 'S', 'ENE'];

  return {
    monthIndex: idx,
    monthName: MONTH_NAMES[idx],
    year: years[idx],
    tempMean: base.tMean,
    tempMaxAvg: base.tMaxAvg,
    tempMinAvg: base.tMinAvg,
    tempAbsoluteMax: base.absMax,
    tempAbsoluteMaxDate: absMaxDates[idx],
    tempAbsoluteMin: base.absMin,
    tempAbsoluteMinDate: absMinDates[idx],
    thermalAmplitudeAvg: Number((base.tMaxAvg - base.tMinAvg).toFixed(1)),
    historicalNormalMean: base.normal,
    historicalNormalMax: Number((base.tMaxAvg - (base.tMean - base.normal)).toFixed(1)),
    historicalNormalMin: Number((base.tMinAvg - (base.tMean - base.normal)).toFixed(1)),
    anomaly: Number((base.tMean - base.normal).toFixed(1)),
    totalPrecipitation: base.prec,
    humidityMean: base.rh,
    extremeHeatDays: heatDays[idx],
    cddTotal: base.cdd,
    hddTotal: base.hdd,
    dominantWindDirection: windDirs[idx],
    dominantWindSpeed: Number((12.5 + Math.sin(idx * 0.5) * 3.5).toFixed(1)),
    p10: Number((base.tMinAvg - 1.5).toFixed(1)),
    p25: Number((base.tMinAvg + 2.0).toFixed(1)),
    median: Number((base.tMean).toFixed(1)),
    p75: Number((base.tMaxAvg - 2.0).toFixed(1)),
    p90: Number((base.tMaxAvg + 1.2).toFixed(1)),
  };
});

// Generate 365 Daily Records realistically
export function generateDailyRecords(): DailyClimateRecord[] {
  const records: DailyClimateRecord[] = [];
  let currentId = 1;

  const windDirections = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const degMap: Record<string, number> = {
    N: 0, NNE: 22.5, NE: 45, ENE: 67.5, E: 90, ESE: 112.5, SE: 135, SSE: 157.5,
    S: 180, SSW: 202.5, SW: 225, WSW: 247.5, W: 270, WNW: 292.5, NW: 315, NNW: 337.5,
  };

  MONTHLY_BASELINES.forEach((mBase, mIdx) => {
    const daysInMonth = DAYS_IN_MONTH[mIdx];
    const monthNum = mIdx < 5 ? mIdx + 8 : mIdx - 4; // 8-12, 1-7
    const year = mIdx < 5 ? 2025 : 2026;

    for (let day = 1; day <= daysInMonth; day++) {
      // Deterministic pseudorandom cycle based on day and month
      const seed = Math.sin(day * 12.34 + mIdx * 56.78);
      const seed2 = Math.cos(day * 8.91 + mIdx * 34.56);

      const dayOffset = seed * 2.8;
      const tMean = Number((mBase.tMean + dayOffset).toFixed(1));
      const amplitude = Math.max(7.5, (mBase.tMaxAvg - mBase.tMinAvg) + seed2 * 2.2);
      const tMax = Number((tMean + amplitude * 0.55).toFixed(1));
      const tMin = Number((tMean - amplitude * 0.45).toFixed(1));

      // Humidity inversely correlated with temperature and amplitude
      const rhOffset = -seed * 12;
      const rh = Math.min(96, Math.max(25, Math.round(mBase.rh + rhOffset)));

      // Apparent temperature / Heat Index calculation
      const appMax = tMax >= 27 && rh > 40 ? Number((tMax + (rh - 40) * 0.08 + Math.max(0, tMax - 30) * 0.4).toFixed(1)) : tMax;
      const appMin = tMin <= 12 ? Number((tMin - 1.2).toFixed(1)) : tMin;

      // Dew point
      const a = 17.27;
      const b = 237.7;
      const alpha = ((a * tMean) / (b + tMean)) + Math.log(rh / 100);
      const dewPoint = Number(((b * alpha) / (a - alpha)).toFixed(1));

      // Wind direction depending on season and cold fronts
      let windDir = mIdx >= 9 || mIdx === 0 ? 'SE' : 'NE';
      if (tMin < 10) windDir = 'S';
      if (tMax > 35) windDir = 'NW';
      const windSpeed = Number((9.5 + Math.abs(seed) * 11).toFixed(1));
      const windGust = Number((windSpeed + 8 + Math.abs(seed2) * 14).toFixed(1));

      // Precipitation
      let prec = 0;
      if (mBase.prec > 100 && seed > 0.3) {
        prec = Number((Math.abs(seed2) * 28.5).toFixed(1));
      } else if (mBase.prec > 20 && seed > 0.6) {
        prec = Number((Math.abs(seed2) * 8.0).toFixed(1));
      }

      // Condition and alerts
      let condition: DailyClimateRecord['condition'] = 'sunny';
      let alert: DailyClimateRecord['alert'] = null;

      if (prec > 15) condition = 'storm';
      else if (prec > 0) condition = 'rainy';
      else if (rh > 75) condition = 'cloudy';

      if (tMax >= 36) {
        condition = 'heatwave';
        alert = 'heatwave';
      } else if (tMin <= 8.5) {
        condition = 'coldfront';
        alert = 'frost';
      } else if (rh < 25) {
        alert = 'dry';
      }

      // Cooling / Heating degree days base 18°C
      const cdd = Math.max(0, Number((tMean - 18.0).toFixed(1)));
      const hdd = Math.max(0, Number((18.0 - tMean).toFixed(1)));
      const anomaly = Number((tMean - mBase.normal).toFixed(1));

      const dateStr = `${year}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      records.push({
        id: `rec-${currentId++}`,
        date: dateStr,
        month: mIdx,
        day,
        monthName: MONTH_NAMES[mIdx],
        tempMax: tMax,
        tempMin: tMin,
        tempMean: tMean,
        apparentTempMax: appMax,
        apparentTempMin: appMin,
        humidityMean: rh,
        dewPointMean: dewPoint,
        solarRadiation: Number((16.5 + seed * 6.5).toFixed(1)),
        precipitation: prec,
        windSpeedMean: windSpeed,
        windSpeedMax: windGust,
        windDirectionDominant: windDir,
        windDirectionDeg: degMap[windDir] || 90,
        cdd,
        hdd,
        anomaly,
        condition,
        alert,
      });
    }
  });

  return records;
}

export const DAILY_RECORDS = generateDailyRecords();

// Hourly Heatmap 24 hours x 12 months
export function generateHourlyThermalMatrix(): HourlyThermalPoint[] {
  const points: HourlyThermalPoint[] = [];

  MONTHLY_BASELINES.forEach((mBase, mIdx) => {
    const tMin = mBase.tMinAvg;
    const tMax = mBase.tMaxAvg;
    const amplitude = tMax - tMin;

    for (let hour = 0; hour < 24; hour++) {
      // Diurnal temperature curve model (standard meteorology: min at 06h, max at 15h)
      // Sinusoidal daytime + exponential cooling nighttime
      let temp = 0;
      if (hour >= 6 && hour <= 15) {
        const rad = ((hour - 6) / 9) * (Math.PI / 2);
        temp = tMin + amplitude * Math.sin(rad);
      } else if (hour > 15) {
        const coolingFraction = (hour - 15) / 15;
        temp = tMax - amplitude * 0.75 * Math.sqrt(coolingFraction);
      } else {
        // 0 to 5h
        const coolingFraction = (hour + 9) / 15;
        temp = tMax - amplitude * 0.95 * Math.sqrt(coolingFraction);
      }

      // Humidity cycle (inverse to temperature)
      const rh = Math.round(Math.min(95, Math.max(28, mBase.rh + (temp < mBase.tMean ? 18 : -18))));
      const appTemp = temp > 26 ? temp + (rh - 40) * 0.05 : temp;

      points.push({
        hour,
        month: mIdx,
        monthName: MONTH_NAMES[mIdx],
        temp: Number(temp.toFixed(1)),
        apparentTemp: Number(appTemp.toFixed(1)),
        humidity: rh,
      });
    }
  });

  return points;
}

export const HOURLY_THERMAL_MATRIX = generateHourlyThermalMatrix();

// Thermal Wind Rose data (16 sectors correlating Wind Direction with Thermal Properties & Air Masses)
export const THERMAL_WIND_SECTORS: ThermalWindSector[] = [
  {
    direction: 'N',
    angle: 0,
    frequency: 11.2,
    avgTemp: 27.8,
    avgWindSpeed: 14.5,
    airMassType: 'Equatorial Continental',
    tempBins: { under18: 3, from18to24: 18, from24to30: 52, above30: 27 },
  },
  {
    direction: 'NNE',
    angle: 22.5,
    frequency: 7.8,
    avgTemp: 26.5,
    avgWindSpeed: 13.2,
    airMassType: 'Tropical Continental',
    tempBins: { under18: 5, from18to24: 25, from24to30: 48, above30: 22 },
  },
  {
    direction: 'NE',
    angle: 45,
    frequency: 14.5,
    avgTemp: 25.2,
    avgWindSpeed: 15.0,
    airMassType: 'Tropical Atlântica',
    tempBins: { under18: 8, from18to24: 32, from24to30: 45, above30: 15 },
  },
  {
    direction: 'ENE',
    angle: 67.5,
    frequency: 16.4,
    avgTemp: 24.1,
    avgWindSpeed: 16.8,
    airMassType: 'Tropical Atlântica',
    tempBins: { under18: 12, from18to24: 42, from24to30: 36, above30: 10 },
  },
  {
    direction: 'E',
    angle: 90,
    frequency: 15.2,
    avgTemp: 23.4,
    avgWindSpeed: 15.4,
    airMassType: 'Tropical Atlântica',
    tempBins: { under18: 15, from18to24: 48, from24to30: 30, above30: 7 },
  },
  {
    direction: 'ESE',
    angle: 112.5,
    frequency: 9.8,
    avgTemp: 22.8,
    avgWindSpeed: 14.2,
    airMassType: 'Tropical Atlântica',
    tempBins: { under18: 20, from18to24: 52, from24to30: 24, above30: 4 },
  },
  {
    direction: 'SE',
    angle: 135,
    frequency: 8.5,
    avgTemp: 20.6,
    avgWindSpeed: 16.1,
    airMassType: 'Polar Atlântica',
    tempBins: { under18: 38, from18to24: 44, from24to30: 16, above30: 2 },
  },
  {
    direction: 'SSE',
    angle: 157.5,
    frequency: 4.2,
    avgTemp: 19.4,
    avgWindSpeed: 18.2,
    airMassType: 'Polar Atlântica',
    tempBins: { under18: 48, from18to24: 40, from24to30: 11, above30: 1 },
  },
  {
    direction: 'S',
    angle: 180,
    frequency: 3.6,
    avgTemp: 18.2,
    avgWindSpeed: 19.5,
    airMassType: 'Polar Atlântica',
    tempBins: { under18: 62, from18to24: 30, from24to30: 8, above30: 0 },
  },
  {
    direction: 'SSW',
    angle: 202.5,
    frequency: 1.8,
    avgTemp: 19.0,
    avgWindSpeed: 16.0,
    airMassType: 'Polar Atlântica',
    tempBins: { under18: 54, from18to24: 36, from24to30: 10, above30: 0 },
  },
  {
    direction: 'SW',
    angle: 225,
    frequency: 1.5,
    avgTemp: 20.8,
    avgWindSpeed: 12.5,
    airMassType: 'Polar Atlântica',
    tempBins: { under18: 35, from18to24: 45, from24to30: 18, above30: 2 },
  },
  {
    direction: 'WSW',
    angle: 247.5,
    frequency: 1.2,
    avgTemp: 22.5,
    avgWindSpeed: 10.8,
    airMassType: 'Tropical Continental',
    tempBins: { under18: 20, from18to24: 50, from24to30: 25, above30: 5 },
  },
  {
    direction: 'W',
    angle: 270,
    frequency: 1.1,
    avgTemp: 25.1,
    avgWindSpeed: 11.2,
    airMassType: 'Tropical Continental',
    tempBins: { under18: 10, from18to24: 35, from24to30: 42, above30: 13 },
  },
  {
    direction: 'WNW',
    angle: 292.5,
    frequency: 1.8,
    avgTemp: 27.2,
    avgWindSpeed: 12.4,
    airMassType: 'Tropical Continental',
    tempBins: { under18: 5, from18to24: 25, from24to30: 48, above30: 22 },
  },
  {
    direction: 'NW',
    angle: 315,
    frequency: 3.4,
    avgTemp: 28.6,
    avgWindSpeed: 13.8,
    airMassType: 'Tropical Continental',
    tempBins: { under18: 2, from18to24: 15, from24to30: 50, above30: 33 },
  },
  {
    direction: 'NNW',
    angle: 337.5,
    frequency: 4.8,
    avgTemp: 28.1,
    avgWindSpeed: 14.1,
    airMassType: 'Tropical Continental',
    tempBins: { under18: 3, from18to24: 18, from24to30: 51, above30: 28 },
  },
];

// Climatological Normal Comparison (INMET 1991-2020)
export const CLIMATOLOGICAL_COMPARISONS: ClimatologicalNormalComparison[] = [
  {
    parameter: 'Temperatura Média Anual',
    observed12m: 23.4,
    normal1991_2020: 22.3,
    deviation: +1.1,
    unit: '°C',
    interpretation: 'Anomalia positiva moderada (+1.1 °C acima do padrão histórico 1991-2020).',
  },
  {
    parameter: 'Média das Máximas Diárias',
    observed12m: 29.8,
    normal1991_2020: 28.4,
    deviation: +1.4,
    unit: '°C',
    interpretation: 'Tardes significativamente mais quentes, influenciadas por bloqueios atmosféricos.',
  },
  {
    parameter: 'Média das Mínimas Diárias',
    observed12m: 16.9,
    normal1991_2020: 16.2,
    deviation: +0.7,
    unit: '°C',
    interpretation: 'Noites ligeiramente mais quentes com menor perda radiativa noturna.',
  },
  {
    parameter: 'Amplitude Térmica Média',
    observed12m: 12.9,
    normal1991_2020: 12.2,
    deviation: +0.7,
    unit: '°C',
    interpretation: 'Maior oscilação térmica diurna devido a períodos de seca prolongados.',
  },
  {
    parameter: 'Dias com Temp. Máxima ≥ 33°C',
    observed12m: 48,
    normal1991_2020: 26,
    deviation: +22,
    unit: 'dias',
    interpretation: 'Aumento de 84.6% na frequência de dias de calor intenso.',
  },
  {
    parameter: 'Dias com Temp. Mínima ≤ 10°C',
    observed12m: 8,
    normal1991_2020: 14,
    deviation: -6,
    unit: 'dias',
    interpretation: 'Inverno com incursões polares menos frequentes e de menor duração.',
  },
];
