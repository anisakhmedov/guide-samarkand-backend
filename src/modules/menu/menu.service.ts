import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MenuItem, MenuItemDocument } from './schemas/menu-item.schema';
import { MenuItemType } from '../../common/enums';
import { SettingsService } from '../settings/settings.service';
import { CreateMenuItemDto, UpdateMenuItemDto } from './dto/menu-item.dto';

export interface MenuItemWithPrice {
  _id: string;
  type: MenuItemType;
  name: string;
  description: string;
  price: number;
  discountedPrice: number;
  photo: string;
}

@Injectable()
export class MenuService {
  constructor(
    @InjectModel(MenuItem.name) private model: Model<MenuItemDocument>,
    private readonly settings: SettingsService,
  ) {}

  // ---- Admin CRUD (mirrors PlacesService) ----

  findAll(type?: MenuItemType) {
    const query: Record<string, unknown> = {};
    if (type) query.type = type;
    return this.model.find(query).sort({ createdAt: -1 }).exec();
  }

  async findById(id: string) {
    const item = await this.model.findById(id);
    if (!item) throw new NotFoundException('Menu item not found');
    return item;
  }

  create(dto: CreateMenuItemDto) {
    return this.model.create(dto);
  }

  async update(id: string, dto: UpdateMenuItemDto) {
    const item = await this.findById(id);
    Object.assign(item, dto);
    await item.save();
    return item;
  }

  async remove(id: string) {
    const item = await this.findById(id);
    await item.deleteOne();
    return { deleted: true };
  }

  // ---- Guest-facing (Options -> Food / Drinks) ----

  /** Active items for the given type, with discountedPrice applied if hasDiscount. */
  async findAllActive(type: MenuItemType | undefined, hasDiscount: boolean): Promise<MenuItemWithPrice[]> {
    const query: Record<string, unknown> = { active: true };
    if (type) query.type = type;
    const items = await this.model.find(query).sort({ name: 1 }).exec();
    const percent = hasDiscount ? await this.settings.discountPercent() : 0;

    return items.map((item) => ({
      _id: String(item._id),
      type: item.type,
      name: item.name,
      description: item.description,
      price: item.price,
      discountedPrice: Math.round(item.price * (1 - percent / 100)),
      photo: item.photo,
    }));
  }
}
