import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Feedback, FeedbackDocument } from './schemas/feedback.schema';

@Injectable()
export class FeedbackService {
  constructor(@InjectModel(Feedback.name) private model: Model<FeedbackDocument>) {}

  create(text: string, guestId?: string) {
    return this.model.create({ text, guestId: guestId ? new Types.ObjectId(guestId) : undefined });
  }

  findAll() {
    return this.model.find().sort({ createdAt: -1 }).populate('guestId');
  }
}
