import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { GuestAccessGuard } from '../guests/guards/guest-access.guard';
import { CurrentGuest } from '../../common/decorators/current-guest.decorator';
import { ChatSender } from '../../common/enums';

class SendMessageDto {
  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsString()
  photo?: string;
}

// Guest-facing chat REST fallback/history (realtime path is the Socket.io /chat namespace).
@Controller('chat')
@UseGuards(GuestAccessGuard)
export class ChatController {
  constructor(private readonly chat: ChatService, private readonly gateway: ChatGateway) {}

  @Get('messages')
  history(@CurrentGuest() user: { guestId: string }) {
    return this.chat.findByGuest(user.guestId);
  }

  @Post('messages')
  async send(@Body() dto: SendMessageDto, @CurrentGuest() user: { guestId: string }) {
    const message = await this.chat.create(user.guestId, ChatSender.GUEST, dto.text || '', dto.photo);
    this.gateway.server?.to(`guest_${user.guestId}`).to('admins').emit('message', message);
    return message;
  }

  @Patch('messages/read')
  async markRead(@CurrentGuest() user: { guestId: string }) {
    await this.chat.markRead(user.guestId, ChatSender.ADMIN);
    return { ok: true };
  }
}
