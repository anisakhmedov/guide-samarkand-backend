import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { IsString, MinLength } from 'class-validator';
import { FeedbackService } from './feedback.service';
import { GuestJwtGuard } from '../../common/guards/guest-jwt.guard';
import { AdminJwtGuard } from '../../common/guards/admin-jwt.guard';
import { CurrentGuest } from '../../common/decorators/current-guest.decorator';

class CreateFeedbackDto {
  @IsString()
  @MinLength(1)
  text: string;
}

// Guest self-service feedback about the app itself — no moderation, just a feed (PLAN.md).
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedback: FeedbackService) {}

  @Post()
  @UseGuards(GuestJwtGuard)
  create(@Body() dto: CreateFeedbackDto, @CurrentGuest() user: { guestId: string }) {
    return this.feedback.create(dto.text, user.guestId);
  }
}

// Admin "Обратная связь" feed (PLAN.md).
@Controller('admin/feedback')
@UseGuards(AdminJwtGuard)
export class FeedbackAdminController {
  constructor(private readonly feedback: FeedbackService) {}

  @Get()
  findAll() {
    return this.feedback.findAll();
  }
}
