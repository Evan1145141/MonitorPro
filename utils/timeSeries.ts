interface GenSeriesOptions {
  days: number;
  baseTemp: number;
  tempRange: number;
  baseHum: number;
  humRange: number;
  trend?: number;
  deviceId: string;
  tz?: string;
}

interface TimeSeriesData {
  labels: string[];
  temps: number[];
  hums: number[];
}

let todayOverride: Date | null = null;

export function overrideToday(dateString: string | null) {
  if (dateString === null) {
    todayOverride = null;
  } else {
    todayOverride = new Date(dateString);
  }
}

function getToday(): Date {
  return todayOverride || new Date();
}

export function seedFrom(date: Date, deviceId: string): number {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  let hash = year * 10000 + month * 100 + day;

  for (let i = 0; i < deviceId.length; i++) {
    hash = ((hash << 5) - hash) + deviceId.charCodeAt(i);
    hash = hash & hash;
  }

  hash = Math.abs(hash);
  const seed = (hash * 9301 + 49297) % 233280;
  return seed / 233280;
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function getLastGeneratedDay(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem('lastGeneratedDay');
}

function setLastGeneratedDay(day: string) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem('lastGeneratedDay', day);
}

export function needsRegeneration(): boolean {
  const today = getToday();
  const todayStr = today.toISOString().split('T')[0];
  const lastGenerated = getLastGeneratedDay();

  if (lastGenerated !== todayStr) {
    setLastGeneratedDay(todayStr);
    return true;
  }
  return false;
}

export function genSeries(opts: GenSeriesOptions): TimeSeriesData {
  const {
    days,
    baseTemp,
    tempRange,
    baseHum,
    humRange,
    trend = 0,
    deviceId,
  } = opts;

  const labels: string[] = [];
  const temps: number[] = [];
  const hums: number[] = [];

  const today = getToday();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    const seed = seedFrom(date, deviceId);
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);

    const seasonalOffset = Math.sin((dayOfYear / 365) * 2 * Math.PI * 7) * (tempRange * 0.3);
    const dailyVariance = (seededRandom(seed * 1000) - 0.5) * tempRange;
    const trendOffset = trend * (days - i);

    let temp = baseTemp + seasonalOffset + dailyVariance + trendOffset;
    temp = Math.max(0, Math.min(40, temp));
    temp = Math.round(temp * 10) / 10;

    const humSeasonalOffset = Math.sin((dayOfYear / 365) * 2 * Math.PI * 7) * (humRange * 0.2);
    const humDailyVariance = (seededRandom(seed * 2000) - 0.5) * humRange;
    const humTrendOffset = (trend * 0.5) * (days - i);

    let hum = baseHum + humSeasonalOffset + humDailyVariance + humTrendOffset;
    hum = Math.max(20, Math.min(90, hum));
    hum = Math.round(hum);

    const month = date.getMonth() + 1;
    const day = date.getDate();
    labels.push(`${month}/${day}`);
    temps.push(temp);
    hums.push(hum);
  }

  return { labels, temps, hums };
}

export function aggregateWeekly(data: TimeSeriesData): TimeSeriesData {
  const labels: string[] = [];
  const temps: number[] = [];
  const hums: number[] = [];

  for (let i = 0; i < data.labels.length; i += 7) {
    const weekTemps = data.temps.slice(i, i + 7);
    const weekHums = data.hums.slice(i, i + 7);

    const avgTemp = weekTemps.reduce((a, b) => a + b, 0) / weekTemps.length;
    const avgHum = weekHums.reduce((a, b) => a + b, 0) / weekHums.length;

    labels.push(data.labels[i]);
    temps.push(Math.round(avgTemp * 10) / 10);
    hums.push(Math.round(avgHum));
  }

  return { labels, temps, hums };
}

export function getLastNDays(data: TimeSeriesData, n: number): TimeSeriesData {
  return {
    labels: data.labels.slice(-n),
    temps: data.temps.slice(-n),
    hums: data.hums.slice(-n),
  };
}

export function getTodayData(deviceId: string, baseTemp: number, baseHum: number): { temp: number; hum: number; timestamp: string } {
  const series = genSeries({
    days: 1,
    baseTemp,
    tempRange: 5,
    baseHum,
    humRange: 12,
    deviceId,
  });

  return {
    temp: series.temps[0],
    hum: series.hums[0],
    timestamp: getToday().toISOString(),
  };
}

function seedFromHour(date: Date, hour: number, deviceId: string): number {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  let hash = year * 10000000 + month * 100000 + day * 1000 + hour;

  for (let i = 0; i < deviceId.length; i++) {
    hash = ((hash << 5) - hash) + deviceId.charCodeAt(i);
    hash = hash & hash;
  }

  hash = Math.abs(hash);
  const seed = (hash * 9301 + 49297) % 233280;
  return seed / 233280;
}

export interface HourlySeriesOptions {
  hours: number;
  baseTemp: number;
  tempRange: number;
  baseHum: number;
  humRange: number;
  deviceId: string;
}

export function genHourlySeries(opts: HourlySeriesOptions): TimeSeriesData {
  const { hours, baseTemp, tempRange, baseHum, humRange, deviceId } = opts;

  const labels: string[] = [];
  const temps: number[] = [];
  const hums: number[] = [];

  const now = getToday();

  for (let i = hours - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setHours(date.getHours() - i);

    const hour = date.getHours();
    const seed = seedFromHour(date, hour, deviceId);

    const hourOfDay = hour / 24;
    const diurnalCycle = Math.sin(hourOfDay * 2 * Math.PI - Math.PI / 2);
    const diurnalOffset = diurnalCycle * (tempRange * 0.4);

    const hourlyVariance = (seededRandom(seed * 1000) - 0.5) * (tempRange * 0.4);

    let temp = baseTemp + diurnalOffset + hourlyVariance;
    temp = Math.max(0, Math.min(40, temp));
    temp = Math.round(temp * 10) / 10;

    const humDiurnalOffset = -diurnalCycle * (humRange * 0.3);
    const humHourlyVariance = (seededRandom(seed * 2000) - 0.5) * (humRange * 0.3);

    let hum = baseHum + humDiurnalOffset + humHourlyVariance;
    hum = Math.max(20, Math.min(90, hum));
    hum = Math.round(hum);

    const timeLabel = `${hour.toString().padStart(2, '0')}:00`;
    labels.push(timeLabel);
    temps.push(temp);
    hums.push(hum);
  }

  return { labels, temps, hums };
}
