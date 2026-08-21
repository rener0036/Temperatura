import { TemperatureUnit } from '../types';

export function convertTemperature(valueInCelsius: number, unit: TemperatureUnit): number {
  if (unit === 'F') {
    return (valueInCelsius * 9) / 5 + 32;
  }
  if (unit === 'K') {
    return valueInCelsius + 273.15;
  }
  return valueInCelsius;
}

export function getUnitSymbol(unit: TemperatureUnit): string {
  return unit === 'C' ? '°C' : unit === 'F' ? '°F' : 'K';
}

export function formatTemp(valueInCelsius: number, unit: TemperatureUnit, decimals: number = 1): string {
  const converted = convertTemperature(valueInCelsius, unit);
  const symbol = unit === 'C' ? '°C' : unit === 'F' ? '°F' : 'K';
  return `${converted.toFixed(decimals)} ${symbol}`;
}

export function formatTempNumber(valueInCelsius: number, unit: TemperatureUnit, decimals: number = 1): number {
  const converted = convertTemperature(valueInCelsius, unit);
  return Number(converted.toFixed(decimals));
}

export function getThermalColor(tempC: number): string {
  if (tempC < 10) return '#3b82f6'; // blue
  if (tempC < 16) return '#06b6d4'; // cyan
  if (tempC < 21) return '#10b981'; // emerald
  if (tempC < 26) return '#f59e0b'; // amber
  if (tempC < 31) return '#f97316'; // orange
  if (tempC < 36) return '#ef4444'; // red
  return '#991b1b'; // dark red
}

export function getThermalCategory(tempC: number): { label: string; color: string; bg: string } {
  if (tempC < 12) return { label: 'Muito Frio', color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-500/10' };
  if (tempC < 18) return { label: 'Frio / Ameno', color: 'text-cyan-700 dark:text-cyan-400', bg: 'bg-cyan-500/10' };
  if (tempC < 24) return { label: 'Confortável', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-500/10' };
  if (tempC < 29) return { label: 'Quente', color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-500/10' };
  if (tempC < 34) return { label: 'Muito Quente', color: 'text-orange-700 dark:text-orange-400', bg: 'bg-orange-500/10' };
  return { label: 'Calor Extremo', color: 'text-red-700 dark:text-red-400', bg: 'bg-red-500/10' };
}

/**
 * Calculates Heat Index (NOAA / Steadman formula) for temperatures >= 27°C and RH >= 40%
 */
export function calculateHeatIndex(tempC: number, rhPercent: number): number {
  if (tempC < 26.7 || rhPercent < 40) {
    // Steadman simple formula
    return 0.5 * (tempC * 1.8 + 32 + 61.0 + ((tempC * 1.8 + 32 - 68.0) * 1.2) + (rhPercent * 0.094));
  }

  const T = tempC * 1.8 + 32;
  const R = rhPercent;

  const c1 = -42.379;
  const c2 = 2.04901523;
  const c3 = 10.14333127;
  const c4 = -0.22475541;
  const c5 = -0.00683783;
  const c6 = -0.05481717;
  const c7 = 0.00122874;
  const c8 = 0.00085282;
  const c9 = -0.00000199;

  let hiF = c1 + (c2 * T) + (c3 * R) + (c4 * T * R) + (c5 * T * T) + (c6 * R * R) + (c7 * T * T * R) + (c8 * T * R * R) + (c9 * T * T * R * R);

  // Convert back to Celsius
  return (hiF - 32) * (5 / 9);
}

/**
 * Calculates Wind Chill (Sensação de Frio pelo Vento - Jag/NOAA) for T <= 10°C and Wind > 4.8 km/h
 */
export function calculateWindChill(tempC: number, windSpeedKmh: number): number {
  if (tempC > 10 || windSpeedKmh < 4.8) {
    return tempC;
  }
  const v = windSpeedKmh;
  const wc = 13.12 + 0.6215 * tempC - 11.37 * Math.pow(v, 0.16) + 0.3965 * tempC * Math.pow(v, 0.16);
  return wc;
}

/**
 * Calculates Dew Point (Ponto de Orvalho) using Magnus formula
 */
export function calculateDewPoint(tempC: number, rhPercent: number): number {
  const a = 17.27;
  const b = 237.7;
  const alpha = ((a * tempC) / (b + tempC)) + Math.log(rhPercent / 100);
  return (b * alpha) / (a - alpha);
}
