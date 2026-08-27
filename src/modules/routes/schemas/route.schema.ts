import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { RouteCreatedBy, RouteDuration, RouteTheme, TransportType } from '../../../common/enums';

export type RouteDocument = Route & Document;

@Schema({ _id: false })
export class RoutePoint {
  @Prop({ type: Types.ObjectId, ref: 'Place', required: true })
  placeId: Types.ObjectId;

  @Prop({ required: true })
  order: number;

  @Prop({ default: '' })
  comment: string; // e.g. "здесь можно перекусить", "загляните на закат"

  // Leg from the *previous* point to this one (0 for the first point).
  @Prop({ default: 0 })
  legDistanceMeters: number;

  @Prop({ default: 0 })
  legDurationMinutes: number;
}
const RoutePointSchema = SchemaFactory.createForClass(RoutePoint);

@Schema({ timestamps: true })
export class Route {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ type: String, enum: RouteTheme, required: false })
  theme?: RouteTheme;

  @Prop({ type: String, enum: RouteDuration, required: true })
  durationEstimate: RouteDuration;

  @Prop({ type: String, enum: TransportType, required: true })
  transportType: TransportType;

  @Prop({ type: String, enum: RouteCreatedBy, required: true })
  createdBy: RouteCreatedBy;

  @Prop({ type: Types.ObjectId, ref: 'Guest', required: false })
  createdByGuestId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'AdminUser', required: false })
  createdByAdminId?: Types.ObjectId;

  @Prop({ type: [RoutePointSchema], default: [] })
  points: RoutePoint[];

  @Prop({ default: 0 })
  totalDistanceMeters: number;

  @Prop({ default: 0 })
  totalDurationMinutes: number;

  // Admin-built routes stay drafts until explicitly published; guest-built routes are always usable immediately.
  @Prop({ default: true })
  published: boolean;
}

export const RouteSchema = SchemaFactory.createForClass(Route);
RouteSchema.index({ theme: 1, durationEstimate: 1, transportType: 1 });
