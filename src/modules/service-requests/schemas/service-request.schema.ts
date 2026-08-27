import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ServiceRequestStatus, ServiceRequestType } from '../../../common/enums';

export type ServiceRequestDocument = ServiceRequest & Document;

// Everything a guest can ask hotel staff for from Options, other than the menu/discount
// flows which have their own dedicated models. `payload` is free-form by design (like
// Place.extraFields) since each type carries different data:
//   food_order/drink_order: { items: [{ menuItemId, name, qty, price }] }
//   wake_up:                { time: string, note?: string }
//   cleaning:                { time?: string, note?: string }
//   problem:                 { category: string, description: string, photo?: string }
//   extension:                { until: string, note?: string }
@Schema({ timestamps: { createdAt: true, updatedAt: true } })
export class ServiceRequest {
  @Prop({ type: Types.ObjectId, ref: 'Guest', required: true })
  guestId: Types.ObjectId;

  @Prop({ type: String, enum: ServiceRequestType, required: true })
  type: ServiceRequestType;

  @Prop({ type: String, enum: ServiceRequestStatus, default: ServiceRequestStatus.NEW })
  status: ServiceRequestStatus;

  @Prop({ type: Object, default: {} })
  payload: Record<string, unknown>;

  // Staff-facing note the guest can see (e.g. "уборка через 20 минут" when marking a
  // cleaning request in-progress) — separate from `payload`, which is guest-authored.
  @Prop({ default: '' })
  adminComment: string;

  // Notification tracking: true from creation (the guest just made it, nothing to notify
  // about yet) — flipped to false whenever an admin changes `status`, and back to true
  // once the guest opens the Notifications page. Powers the guide-frontend's unread badge.
  @Prop({ default: true })
  seenByGuest: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export const ServiceRequestSchema = SchemaFactory.createForClass(ServiceRequest);
ServiceRequestSchema.index({ type: 1, status: 1 });
ServiceRequestSchema.index({ guestId: 1 });
