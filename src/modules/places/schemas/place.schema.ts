import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { PlaceCategory } from '../../../common/enums';

export type PlaceDocument = Place & Document;

@Schema({ _id: false })
export class GeoPoint {
  @Prop({ required: true })
  lat: number;

  @Prop({ required: true })
  lng: number;
}
const GeoPointSchema = SchemaFactory.createForClass(GeoPoint);

@Schema({ timestamps: true })
export class Place {
  @Prop({ type: String, enum: PlaceCategory, required: true })
  category: PlaceCategory;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ type: [String], default: [] })
  photos: string[];

  @Prop({ type: GeoPointSchema, required: true })
  location: GeoPoint;

  @Prop({ default: '' })
  district: string;

  @Prop({ default: '' })
  workingHours: string;

  // Category-specific extras, e.g. { cuisine, priceRange } for restaurants,
  // { ticketPrice, visitDuration } for attractions, free-form by design.
  @Prop({ type: Object, default: {} })
  extraFields: Record<string, unknown>;

  @Prop({ default: false })
  recommendedByHotel: boolean;

  @Prop({ default: true })
  active: boolean;
}

export const PlaceSchema = SchemaFactory.createForClass(Place);
PlaceSchema.index({ category: 1 });
PlaceSchema.index({ name: 'text', description: 'text' });
