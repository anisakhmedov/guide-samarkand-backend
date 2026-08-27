import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { AccessStatus, DiscountStatus, ResidenceStatus, ReviewStatus } from '../../../common/enums';

export type GuestDocument = Guest & Document;

@Schema({ _id: false })
export class GuestHistoryEntry {
  @Prop({ required: true })
  action: string; // e.g. "residence:approved", "access:open"

  @Prop({ type: Types.ObjectId, ref: 'AdminUser', required: false })
  byAdminId?: Types.ObjectId;

  @Prop({ required: false })
  byAdminName?: string;

  @Prop({ default: () => new Date() })
  at: Date;
}
const GuestHistoryEntrySchema = SchemaFactory.createForClass(GuestHistoryEntry);

@Schema({ timestamps: { createdAt: true, updatedAt: true } })
export class Guest {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  roomNumber: string;

  @Prop({ type: String, enum: ResidenceStatus, default: ResidenceStatus.PENDING })
  statusResidence: ResidenceStatus;

  @Prop({ type: String, enum: ReviewStatus, default: ReviewStatus.NOT_SENT })
  statusReview: ReviewStatus;

  @Prop({ type: String, enum: AccessStatus, default: AccessStatus.CLOSED })
  accessStatus: AccessStatus;

  // In-app "Options -> Leave a review" discount flow (separate from the mandatory gate
  // review above): guest self-reports, admin verifies in the "Гости" panel before any
  // discounted pricing applies — mirrors statusReview's trust model.
  @Prop({ type: String, enum: DiscountStatus, default: DiscountStatus.NONE })
  discountStatus: DiscountStatus;

  @Prop({ required: true, unique: true })
  deviceSessionToken: string;

  @Prop({ type: [GuestHistoryEntrySchema], default: [] })
  history: GuestHistoryEntry[];

  createdAt?: Date;
  updatedAt?: Date;
}

export const GuestSchema = SchemaFactory.createForClass(Guest);
// Fast lookup for the "same name+room already approved" re-entry flow (see PLAN.md open questions).
GuestSchema.index({ name: 1, roomNumber: 1 });
