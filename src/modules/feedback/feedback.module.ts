import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Feedback, FeedbackSchema } from './schemas/feedback.schema';
import { FeedbackService } from './feedback.service';
import { FeedbackController, FeedbackAdminController } from './feedback.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Feedback.name, schema: FeedbackSchema }])],
  providers: [FeedbackService],
  controllers: [FeedbackController, FeedbackAdminController],
})
export class FeedbackModule {}
