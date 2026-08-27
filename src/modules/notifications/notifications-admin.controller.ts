import { Controller, Get, UseGuards } from '@nestjs/common';
import { ChatService } from '../chat/chat.service';
import { ServiceRequestsService } from '../service-requests/service-requests.service';
import { AdminJwtGuard } from '../../common/guards/admin-jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminRole, ChatSender } from '../../common/enums';

// Admin-facing notification badge (sidebar bell): unread guest chat messages + service
// requests nobody has actioned yet, across every guest.
@Controller('admin/notifications')
@UseGuards(AdminJwtGuard, RolesGuard)
@Roles(AdminRole.SUPER_ADMIN, AdminRole.RECEPTION)
export class NotificationsAdminController {
  constructor(
    private readonly chat: ChatService,
    private readonly requests: ServiceRequestsService,
  ) {}

  @Get()
  async summary() {
    const [unreadChat, newRequests] = await Promise.all([this.chat.countUnread(ChatSender.GUEST), this.requests.countNew()]);
    return { unreadChat, newRequests };
  }
}
