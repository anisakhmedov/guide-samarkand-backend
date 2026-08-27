import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { AdminRole } from '../../../common/enums';

export type AdminUserDocument = AdminUser & Document;

@Schema({ timestamps: true })
export class AdminUser {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  login: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ type: String, enum: AdminRole, default: AdminRole.RECEPTION })
  role: AdminRole;

  @Prop({ default: true })
  active: boolean;
}

export const AdminUserSchema = SchemaFactory.createForClass(AdminUser);
