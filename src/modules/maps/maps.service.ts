import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { estimateDurationMinutes, haversineDistanceMeters, LatLng } from '../../common/utils/haversine';

export interface LegEstimate {
  distanceMeters: number;
  durationMinutes: number;
  source: 'osrm' | 'estimate';
}

export interface GeocodeResult {
  displayName: string;
  lat: number;
  lng: number;
}

/**
 * Free OSM-based mapping stack (PLAN.md "Картографический стек"): OSRM for routing,
 * Nominatim for geocoding — no API key, no billing. Falls back to a haversine-distance
 * estimate whenever OSRM is unreachable or doesn't support the requested profile, which
 * matters in dev: the public demo server (https://router.project-osrm.org) generally only
 * serves the "driving" profile, not "foot" — a self-hosted OSRM/Valhalla instance is needed
 * for real walking directions in production (see PLAN.md "Открытые вопросы").
 */
@Injectable()
export class MapsService {
  private readonly logger = new Logger(MapsService.name);
  private readonly osrmBaseUrl: string;
  private readonly osrmProfileWalking: string;
  private readonly osrmProfileDriving: string;
  private readonly nominatimBaseUrl: string;
  private readonly nominatimUserAgent: string;

  constructor(private readonly config: ConfigService) {
    this.osrmBaseUrl = this.config.get<string>('osrm.baseUrl') || 'https://router.project-osrm.org';
    this.osrmProfileWalking = this.config.get<string>('osrm.profileWalking') || 'foot';
    this.osrmProfileDriving = this.config.get<string>('osrm.profileDriving') || 'driving';
    this.nominatimBaseUrl = this.config.get<string>('nominatim.baseUrl') || 'https://nominatim.openstreetmap.org';
    this.nominatimUserAgent = this.config.get<string>('nominatim.userAgent') || 'samarkand-hotel-guide/1.0';
  }

  async estimateLeg(from: LatLng, to: LatLng, transport: 'walking' | 'transport'): Promise<LegEstimate> {
    try {
      return await this.callOsrm(from, to, transport);
    } catch (err) {
      this.logger.warn(`OSRM routing call failed, falling back to estimate: ${err}`);
    }
    const distanceMeters = Math.round(haversineDistanceMeters(from, to));
    return {
      distanceMeters,
      durationMinutes: estimateDurationMinutes(distanceMeters, transport),
      source: 'estimate',
    };
  }

  private async callOsrm(from: LatLng, to: LatLng, transport: 'walking' | 'transport'): Promise<LegEstimate> {
    const profile = transport === 'walking' ? this.osrmProfileWalking : this.osrmProfileDriving;
    const coords = `${from.lng},${from.lat};${to.lng},${to.lat}`;
    const url = `${this.osrmBaseUrl}/route/v1/${profile}/${coords}?overview=false`;

    const res = await fetch(url);
    const data: any = await res.json();
    if (data.code !== 'Ok' || !data.routes?.[0]) {
      throw new Error(`OSRM status: ${data.code || res.status}`);
    }

    return {
      distanceMeters: Math.round(data.routes[0].distance),
      durationMinutes: Math.max(1, Math.round(data.routes[0].duration / 60)),
      source: 'osrm',
    };
  }

  /** Address -> coordinates lookup for the admin content form (PLAN.md "Геокодирование"). */
  async geocode(query: string): Promise<GeocodeResult[]> {
    const url = new URL(`${this.nominatimBaseUrl}/search`);
    url.searchParams.set('q', query);
    url.searchParams.set('format', 'json');
    url.searchParams.set('limit', '5');

    const res = await fetch(url.toString(), {
      headers: { 'User-Agent': this.nominatimUserAgent },
    });
    if (!res.ok) throw new Error(`Nominatim status: ${res.status}`);

    const data = (await res.json()) as any[];
    return data.map((r) => ({ displayName: r.display_name, lat: parseFloat(r.lat), lng: parseFloat(r.lon) }));
  }
}
