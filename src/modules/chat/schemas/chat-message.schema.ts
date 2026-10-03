import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ChatSender } from '../../../common/enums';

export type ChatMessageDocument = ChatMessage & Document;

@Schema({ timestamps: { createdAt: 'timestamp', updatedAt: false } })
export class ChatMessage {
  @Prop({ type: Types.ObjectId, ref: 'Guest', required: true })
  guestId: Types.ObjectId;

  @Prop({ type: String, enum: ChatSender, required: true })
  sender: ChatSender;

  @Prop({ default: '' })
  text: string;

  @Prop({ required: false })
  photo?: string;

  @Prop({ default: false })
  readStatus: boolean;

  timestamp?: Date;
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);
ChatMessageSchema.index({ guestId: 1, timestamp: 1 });
// Conversation list aggregation ($sort by timestamp first) and unread badge counters.
ChatMessageSchema.index({ timestamp: -1 });
ChatMessageSchema.index({ sender: 1, readStatus: 1 });
