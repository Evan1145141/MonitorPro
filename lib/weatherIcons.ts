import {
  Sun,
  Cloud,
  CloudSun,
  CloudRain,
  CloudLightning,
  CloudFog,
  CloudSnow,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

export type WeatherCondition =
  | 'sunny'
  | 'partly_cloudy'
  | 'cloudy'
  | 'rain'
  | 'storm'
  | 'snow'
  | 'fog';

export interface WeatherIconConfig {
  Icon: LucideIcon;
  color: string;
}

export function getWeatherIcon(condition: WeatherCondition): WeatherIconConfig {
  switch (condition) {
    case 'sunny':
      return { Icon: Sun, color: '#FACC15' };
    case 'partly_cloudy':
      return { Icon: CloudSun, color: '#0EA5E9' };
    case 'cloudy':
      return { Icon: Cloud, color: '#6B7280' };
    case 'rain':
      return { Icon: CloudRain, color: '#0EA5E9' };
    case 'storm':
      return { Icon: CloudLightning, color: '#F97316' };
    case 'snow':
      return { Icon: CloudSnow, color: '#38BDF8' };
    case 'fog':
      return { Icon: CloudFog, color: '#9CA3AF' };
    default:
      return { Icon: Cloud, color: '#6B7280' };
  }
}
