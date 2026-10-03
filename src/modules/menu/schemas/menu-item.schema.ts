import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { MenuItemType } from '../../../common/enums';

export type MenuItemDocument = MenuItem & Document;

// Room-service menu (Options -> "Питание в номера" / "Напитки с бара").
// Price: base menu item price
// discountedPrice: explicit price for guests with discountStatus === approved (if set, used instead of auto-calculated)
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

  @Prop({ default: 0, min: 0 })
  discountedPrice: number;

  @Prop({ default: '' })
  photo: string;

  @Prop({ default: true })
  active: boolean;
}

export const MenuItemSchema = SchemaFactory.createForClass(MenuItem);
MenuItemSchema.index({ type: 1 });
