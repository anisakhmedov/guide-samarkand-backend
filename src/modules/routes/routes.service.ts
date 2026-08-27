import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Route, RouteDocument } from './schemas/route.schema';
import { PlacesService } from '../places/places.service';
import { MapsService } from '../maps/maps.service';
import { CreateAdminRouteDto, UpdateAdminRouteDto } from './dto/route.dto';
import { RouteCreatedBy, RouteDuration, RouteTheme, TransportType } from '../../common/enums';
import { orderByNearestNeighbour } from '../../common/utils/haversine';

export interface RouteFilter {
  theme?: RouteTheme;
  durationEstimate?: RouteDuration;
  transportType?: TransportType;
}

@Injectable()
export class RoutesService {
  constructor(
    @InjectModel(Route.name) private model: Model<RouteDocument>,
    private readonly places: PlacesService,
    private readonly maps: MapsService,
  ) {}

  async findAllPublished(filter: RouteFilter) {
    const query: Record<string, unknown> = { published: true };
    if (filter.theme) query.theme = filter.theme;
    if (filter.durationEstimate) query.durationEstimate = filter.durationEstimate;
    if (filter.transportType) query.transportType = filter.transportType;
    return this.model.find(query).sort({ createdAt: -1 });
  }

  async findAllForAdmin() {
    return this.model.find({ createdBy: RouteCreatedBy.ADMIN }).sort({ createdAt: -1 });
  }

  async findById(id: string) {
    const route = await this.model.findById(id).populate('points.placeId');
    if (!route) throw new NotFoundException('Route not found');
    return route;
  }

  async createAdminRoute(dto: CreateAdminRouteDto, adminId: string) {
    const { points, totalDistanceMeters, totalDurationMinutes } = await this.buildPoints(
      dto.points,
      dto.transportType,
    );
    return this.model.create({
      title: dto.title,
      theme: dto.theme,
      durationEstimate: dto.durationEstimate,
      transportType: dto.transportType,
      createdBy: RouteCreatedBy.ADMIN,
      createdByAdminId: new Types.ObjectId(adminId),
      points,
      totalDistanceMeters,
      totalDurationMinutes,
      published: dto.published ?? true,
    });
  }

  async updateAdminRoute(id: string, dto: UpdateAdminRouteDto) {
    const route = await this.findById(id);
    const { points, totalDistanceMeters, totalDurationMinutes } = await this.buildPoints(
      dto.points,
      dto.transportType,
    );
    Object.assign(route, {
      title: dto.title,
      theme: dto.theme,
      durationEstimate: dto.durationEstimate,
      transportType: dto.transportType,
      points,
      totalDistanceMeters,
      totalDurationMinutes,
      published: dto.published ?? route.published,
    });
    await route.save();
    return route;
  }

  async setPublished(id: string, published: boolean) {
    const route = await this.findById(id);
    route.published = published;
    await route.save();
    return route;
  }

  async remove(id: string) {
    const route = await this.findById(id);
    await route.deleteOne();
    return { deleted: true };
  }

  /**
   * Guest-built route (PLAN.md "Пользовательские маршруты"): guest picks places from
   * the guide, we order them with a nearest-neighbour heuristic and fetch leg
   * distance/time for each hop, then bucket the total time into a duration tag.
   */
  async buildGuestRoute(placeIds: string[], transportType: TransportType, guestId: string, title?: string) {
    const places = await this.places.findByIds(placeIds);
    if (places.length === 0) throw new NotFoundException('No valid places selected');

    const transport = transportType === TransportType.WALKING ? 'walking' : 'transport';
    const items = places.map((place) => ({ lat: place.location.lat, lng: place.location.lng, place }));
    const ordered = orderByNearestNeighbour({ lat: items[0].lat, lng: items[0].lng }, items);

    const points: any[] = [];
    let totalDistanceMeters = 0;
    let totalDurationMinutes = 0;
    let prev: (typeof items)[number] | null = null;

    for (const item of ordered) {
      const place = item.place;
      let legDistanceMeters = 0;
      let legDurationMinutes = 0;
      if (prev) {
        const leg = await this.maps.estimateLeg(prev.place.location, place.location, transport);
        legDistanceMeters = leg.distanceMeters;
        legDurationMinutes = leg.durationMinutes;
        totalDistanceMeters += legDistanceMeters;
        totalDurationMinutes += legDurationMinutes;
      }
      points.push({
        placeId: place._id,
        order: points.length,
        comment: '',
        legDistanceMeters,
        legDurationMinutes,
      });
      prev = item;
    }

    const durationEstimate = bucketDuration(totalDurationMinutes);

    return this.model.create({
      title: title || 'Мой маршрут',
      durationEstimate,
      transportType,
      createdBy: RouteCreatedBy.GUEST,
      createdByGuestId: new Types.ObjectId(guestId),
      points,
      totalDistanceMeters,
      totalDurationMinutes,
      published: true,
    });
  }

  private async buildPoints(
    inputPoints: { placeId: string; comment?: string }[],
    transportType: TransportType,
  ) {
    const places = await this.places.findByIds(inputPoints.map((p) => p.placeId));
    const placeMap = new Map(places.map((p) => [p._id.toString(), p]));
    const transport = transportType === TransportType.WALKING ? 'walking' : 'transport';

    const points: any[] = [];
    let totalDistanceMeters = 0;
    let totalDurationMinutes = 0;
    let prevPlace: (typeof places)[number] | undefined;

    for (const input of inputPoints) {
      const place = placeMap.get(input.placeId);
      if (!place) throw new NotFoundException(`Place ${input.placeId} not found`);

      let legDistanceMeters = 0;
      let legDurationMinutes = 0;
      if (prevPlace) {
        const leg = await this.maps.estimateLeg(prevPlace.location, place.location, transport);
        legDistanceMeters = leg.distanceMeters;
        legDurationMinutes = leg.durationMinutes;
        totalDistanceMeters += legDistanceMeters;
        totalDurationMinutes += legDurationMinutes;
      }

      points.push({
        placeId: place._id,
        order: points.length,
        comment: input.comment || '',
        legDistanceMeters,
        legDurationMinutes,
      });
      prevPlace = place;
    }

    return { points, totalDistanceMeters, totalDurationMinutes };
  }
}

function bucketDuration(totalMinutes: number): RouteDuration {
  if (totalMinutes <= 150) return RouteDuration.SHORT;
  if (totalMinutes <= 360) return RouteDuration.HALF_DAY;
  return RouteDuration.FULL_DAY;
}
