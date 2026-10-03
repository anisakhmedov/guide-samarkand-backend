import { Controller, Get, UseGuards } from '@nestjs/common';
import { ChatService } from '../chat/chat.service';
import { ServiceRequestsService } from '../service-requests/service-requests.service';
import { GuestsService } from '../guests/guests.service';
import { AdminJwtGuard } from '../../common/guards/admin-jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminRole, ChatSender } from '../../common/enums';

// Admin-facing notification badge (sidebar bell): unread guest chat messages, service
// requests nobody has actioned yet, and guest applications/reviews waiting for approval.
@Controller('admin/notifications')
@UseGuards(AdminJwtGuard, RolesGuard)
@Roles(AdminRole.SUPER_ADMIN, AdminRole.RECEPTION)
export class NotificationsAdminController {
  constructor(
    private readonly chat: ChatService,
    private readonly requests: ServiceRequestsService,
    private readonly guests: GuestsService,
  ) {}

  @Get()
  async summary() {
    const [unreadChat, newRequests, pending] = await Promise.all([
      this.chat.countUnread(ChatSender.GUEST),
      this.requests.countNew(),
      this.guests.countPending(),
    ]);
    return {
      unreadChat,
      newRequests,
      pendingGuests: pending.residence,
      pendingReviews: pending.review,
      pendingDiscounts: pending.discount,
      // Changes on every new application AND on a repeat submission by the same guest,
      // so the admin bell can ping even when the pending count stays the same.
      lastGuestActivityAt: pending.lastActivityAt,
    };
  }
}
