import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface WeatherDay {
  date: string;
  min: number;
  max: number;
  label: string;
}

export interface WeatherInfo {
  current: { temp: number; label: string };
  daily: WeatherDay[];
}

// WMO weather codes (https://open-meteo.com/en/docs) collapsed into a small set of label
// keys the frontend translates via i18n (same pattern as the `status.*` dictionary keys).
function codeToLabel(code: number): string {
  if (code === 0) return 'clear';
  if (code <= 2) return 'partly_cloudy';
  if (code === 3) return 'cloudy';
  if (code === 45 || code === 48) return 'fog';
  if (code >= 51 && code <= 57) return 'drizzle';
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return 'snow';
  if (code >= 95) return 'thunderstorm';
  return 'cloudy';
}

/**
 * Options -> weather forecast. Uses Open-Meteo — free, no API key, consistent with the
 * project's OSM-based mapping stack (see MapsService). Cached in-memory for ~30 minutes
 * since every guest hits the same fixed location and the forecast barely changes minute to
 * minute; a restart just refetches on the next request.
 */
@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);
  private readonly lat: number;
  private readonly lng: number;
  private cache: { at: number; data: WeatherInfo } | null = null;
  private readonly CACHE_TTL_MS = 30 * 60 * 1000;

  constructor(private readonly config: ConfigService) {
    this.lat = this.config.get<number>('weather.lat') ?? 39.6542;
    this.lng = this.config.get<number>('weather.lng') ?? 66.9597;
  }

  async get(): Promise<WeatherInfo> {
    if (this.cache && Date.now() - this.cache.at < this.CACHE_TTL_MS) {
      return this.cache.data;
    }

    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', String(this.lat));
    url.searchParams.set('longitude', String(this.lng));
    url.searchParams.set('current', 'temperature_2m,weather_code');
    url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,weather_code');
    url.searchParams.set('forecast_days', '4');
    url.searchParams.set('timezone', 'Asia/Samarkand');

    try {
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`Open-Meteo status: ${res.status}`);
      const data: any = await res.json();

      const info: WeatherInfo = {
        current: {
          temp: Math.round(data.current.temperature_2m),
          label: codeToLabel(data.current.weather_code),
        },
        daily: data.daily.time.map((date: string, i: number) => ({
          date,
          min: Math.round(data.daily.temperature_2m_min[i]),
          max: Math.round(data.daily.temperature_2m_max[i]),
          label: codeToLabel(data.daily.weather_code[i]),
        })),
      };

      this.cache = { at: Date.now(), data: info };
      return info;
    } catch (err) {
      this.logger.warn(`Open-Meteo call failed: ${err}`);
      if (this.cache) return this.cache.data;
      throw err;
    }
  }
}
