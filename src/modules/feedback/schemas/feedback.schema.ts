import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FeedbackDocument = Feedback & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Feedback {
  @Prop({ type: Types.ObjectId, ref: 'Guest', required: false })
  guestId?: Types.ObjectId;

  @Prop({ required: true })
  text: string;

  createdAt?: Date;
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback);
