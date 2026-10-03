import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { AccessStatus, ContactChannel, DiscountStatus, ResidenceStatus, ReviewStatus } from '../../../common/enums';

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

@Schema({ _id: false })
export class GuestContact {
  @Prop({ type: String, enum: ContactChannel, required: true })
  type: ContactChannel;

  @Prop({ default: '', trim: true })
  value: string;
}
const GuestContactSchema = SchemaFactory.createForClass(GuestContact);

@Schema({ timestamps: { createdAt: true, updatedAt: true } })
export class Guest {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  roomNumber: string;

  // Not `required` at DB level so guests registered before this field existed stay valid;
  // the gate DTO enforces it for every new registration / re-entry.
  @Prop({ default: '', trim: true })
  phone: string;

  @Prop({ type: [GuestContactSchema], default: [] })
  contacts: GuestContact[];

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

  // Registration step 2 (after name/room/phone): residence country (ISO 3166-1 alpha-2)
  // and date of birth (YYYY-MM-DD, kept as a plain date — no timezone shifts).
  @Prop({ default: '' })
  country: string;

  @Prop({ default: '' })
  birthDate: string;

  // Registration step 3: house rules accepted + handwritten signature (PNG data URL).
  // The signature is only loaded for the admin guest card (select: false keeps it out of
  // lists and the guest's own /guest/me payload).
  @Prop({ type: Date, default: null })
  rulesAcceptedAt: Date | null;

  @Prop({ default: '', select: false })
  rulesSignature: string;

  // select: false — internal device credential, never sent to the admin panel.
  @Prop({ required: true, unique: true, select: false })
  deviceSessionToken: string;

  @Prop({ type: [GuestHistoryEntrySchema], default: [] })
  history: GuestHistoryEntry[];

  createdAt?: Date;
  updatedAt?: Date;
}

export const GuestSchema = SchemaFactory.createForClass(Guest);
// Fast lookup for the "same name+room already approved" re-entry flow (see PLAN.md open questions).
GuestSchema.index({ name: 1, roomNumber: 1 });
// Admin bell counters (countDocuments on each status) + the default list sort.
GuestSchema.index({ statusResidence: 1 });
GuestSchema.index({ statusReview: 1 });
GuestSchema.index({ discountStatus: 1 });
GuestSchema.index({ createdAt: -1 });
