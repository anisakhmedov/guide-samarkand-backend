import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { MenuItemType } from '../../../common/enums';

export type MenuItemDocument = MenuItem & Document;

// Room-service menu (Options -> "Питание в номера" / "Напитки с бара"). Prices are set here
// by the admin; the guest-facing price shown is discounted per-request for guests whose
// discountStatus is approved (see SettingsService.discountPercent, MenuService.findAllActive).
@Schema({ timestamps: true })
export class MenuItem {
  @Prop({ type: String, enum: MenuItemType, required: true })
  type: MenuItemType;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ default: '' })
  photo: string;

  @Prop({ default: true })
  active: boolean;
}

export const MenuItemSchema = SchemaFactory.createForClass(MenuItem);
MenuItemSchema.index({ type: 1 });
