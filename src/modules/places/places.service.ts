import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Place, PlaceDocument } from './schemas/place.schema';
import { PlaceCategory } from '../../common/enums';
import { CreatePlaceDto, UpdatePlaceDto } from './dto/place.dto';

@Injectable()
export class PlacesService {
  constructor(@InjectModel(Place.name) private model: Model<PlaceDocument>) {}

  async findAll(opts: { category?: PlaceCategory; onlyActive?: boolean } = {}) {
    const query: Record<string, unknown> = {};
    if (opts.category) query.category = opts.category;
    if (opts.onlyActive) query.active = true;
    return this.model.find(query).sort({ createdAt: -1 });
  }

  async findById(id: string) {
    const place = await this.model.findById(id);
    if (!place) throw new NotFoundException('Place not found');
    return place;
  }

  async findByIds(ids: string[]) {
    return this.model.find({ _id: { $in: ids } });
  }

  create(dto: CreatePlaceDto) {
    return this.model.create(dto);
  }

  async update(id: string, dto: UpdatePlaceDto) {
    const place = await this.findById(id);
    Object.assign(place, dto);
    await place.save();
    return place;
  }

  async remove(id: string) {
    const place = await this.findById(id);
    await place.deleteOne();
    return { deleted: true };
  }
}
