import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HotelSettingsDocument = HotelSettings & Document;

// Singleton document (a single row is created/reused) holding hotel-wide settings that
// don't belong to any one place/route/guest:
// - discountPercent: Options "leave a review" discount, applied to MenuItem prices for guests with discountStatus === approved
// - markupPercent: Global markup percentage (НДС, доставка, etc.) added to all menu prices
// - hookahPrice / hookahAvailable: Options "Кальян" — final price per hookah (no markup/discount)
@Schema({ timestamps: true })
export class HotelSettings {
  @Prop({ default: 10, min: 0, max: 100 })
  discountPercent: number;

  @Prop({ default: 0, min: 0, max: 100 })
  markupPercent: number;

  @Prop({ default: 0, min: 0 })
  hookahPrice: number;

  @Prop({ default: true })
  hookahAvailable: boolean;
}

export const HotelSettingsSchema = SchemaFactory.createForClass(HotelSettings);
