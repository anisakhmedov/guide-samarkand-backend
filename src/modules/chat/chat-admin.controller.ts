import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { AdminJwtGuard } from '../../common/guards/admin-jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminRole, ChatSender } from '../../common/enums';

class SendMessageDto {
  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsString()
  photo?: string;
}

// Admin "Чат" section (PLAN.md).
@Controller('admin/chat')
@UseGuards(AdminJwtGuard, RolesGuard)
@Roles(AdminRole.SUPER_ADMIN, AdminRole.RECEPTION)
export class ChatAdminController {
  constructor(private readonly chat: ChatService, private readonly gateway: ChatGateway) {}

  @Get('conversations')
  conversations() {
    return this.chat.listConversations();
  }

  @Get(':guestId/messages')
  history(@Param('guestId') guestId: string) {
    return this.chat.findByGuest(guestId);
  }

  @Post(':guestId/messages')
  async send(@Param('guestId') guestId: string, @Body() dto: SendMessageDto) {
    const message = await this.chat.create(guestId, ChatSender.ADMIN, dto.text || '', dto.photo);
    this.gateway.server?.to(`guest_${guestId}`).to('admins').emit('message', message);
    return message;
  }

  @Patch(':guestId/read')
  async markRead(@Param('guestId') guestId: string) {
    await this.chat.markRead(guestId, ChatSender.GUEST);
    return { ok: true };
  }
}
