export type WeatherConditionType = 'sunny' | 'partly_cloudy' | 'cloudy' | 'rain' | 'storm' | 'snow' | 'fog';

interface WeatherCondition {
  temp: number;
  humidity: number;
  pm25: number;
  condition: WeatherConditionType;
}

interface WeatherNow extends WeatherCondition {
  timestamp: string;
}

interface ForecastDay {
  date: string;
  tempHigh: number;
  tempLow: number;
  humidity: number;
  pm25: number;
  condition: WeatherConditionType;
}

class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
}

function getDateSeed(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return year * 10000 + month * 100 + day;
}

function getCondition(seed: number): WeatherConditionType {
  const rng = new SeededRandom(seed);
  const val = rng.next();
  if (val < 0.35) return 'sunny';
  if (val < 0.5) return 'partly_cloudy';
  if (val < 0.7) return 'cloudy';
  if (val < 0.85) return 'rain';
  if (val < 0.93) return 'storm';
  if (val < 0.97) return 'fog';
  return 'snow';
}

function getMonthFactor(month: number): { tempMin: number; tempMax: number } {
  if (month >= 11 || month <= 2) {
    return { tempMin: 6, tempMax: 15 };
  } else if (month >= 6 && month <= 8) {
    return { tempMin: 25, tempMax: 35 };
  } else if (month >= 3 && month <= 5) {
    return { tempMin: 15, tempMax: 25 };
  } else {
    return { tempMin: 18, tempMax: 28 };
  }
}

export function getMockWeatherNow(jitterEnabled: boolean = false): WeatherNow {
  const now = new Date();
  const seed = getDateSeed(now);
  const rng = new SeededRandom(seed + now.getHours());

  const month = now.getMonth() + 1;
  const { tempMin, tempMax } = getMonthFactor(month);

  let temp = rng.range(tempMin, tempMax);
  let humidity = rng.range(40, 95);
  let pm25 = rng.range(10, 120);

  if (jitterEnabled) {
    temp += (Math.random() - 0.5) * 0.6;
    humidity += (Math.random() - 0.5) * 4;
    pm25 += (Math.random() - 0.5) * 10;
  }

  temp = Math.round(temp * 10) / 10;
  humidity = Math.round(humidity);
  pm25 = Math.round(pm25);

  humidity = Math.max(30, Math.min(100, humidity));
  pm25 = Math.max(5, Math.min(200, pm25));

  const condition = getCondition(seed);

  return {
    temp,
    humidity,
    pm25,
    condition,
    timestamp: now.toISOString(),
  };
}

export function getMockForecast(): ForecastDay[] {
  const forecast: ForecastDay[] = [];
  const today = new Date();

  for (let i = 1; i <= 3; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const seed = getDateSeed(date);
    const rng = new SeededRandom(seed);

    const month = date.getMonth() + 1;
    const { tempMin, tempMax } = getMonthFactor(month);

    const tempHigh = Math.round(rng.range(tempMin + 5, tempMax));
    const tempLow = Math.round(rng.range(tempMin, tempMax - 5));
    const humidity = Math.round(rng.range(40, 90));
    const pm25 = Math.round(rng.range(10, 120));
    const condition = getCondition(seed);

    forecast.push({
      date: date.toISOString().split('T')[0],
      tempHigh,
      tempLow,
      humidity,
      pm25,
      condition,
    });
  }

  return forecast;
}

export interface WeatherProvider {
  getWeatherNow: (jitterEnabled?: boolean) => WeatherNow;
  getForecast: () => ForecastDay[];
}

export const mockWeatherProvider: WeatherProvider = {
  getWeatherNow: getMockWeatherNow,
  getForecast: getMockForecast,
};
