import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HotelSettingsDocument = HotelSettings & Document;

// Singleton document (a single row is created/reused) holding hotel-wide settings that
// don't belong to any one place/route/guest — currently just the Options "leave a review"
// discount percentage, applied to MenuItem prices for guests with discountStatus === approved.
@Schema({ timestamps: true })
export class HotelSettings {
  @Prop({ default: 10, min: 0, max: 100 })
  discountPercent: number;
}

export const HotelSettingsSchema = SchemaFactory.createForClass(HotelSettings);
