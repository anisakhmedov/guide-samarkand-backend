import { Controller, Get, UseGuards } from '@nestjs/common';
import { ChatService } from '../chat/chat.service';
import { ServiceRequestsService } from '../service-requests/service-requests.service';
import { GuestAccessGuard } from '../guests/guards/guest-access.guard';
import { CurrentGuest } from '../../common/decorators/current-guest.decorator';
import { ChatSender } from '../../common/enums';

// Guest-facing notification badge (bottom-nav bell): unread admin chat replies +
// service-request status updates the guest hasn't seen yet.
@Controller('notifications')
@UseGuards(GuestAccessGuard)
export class NotificationsController {
  constructor(
    private readonly chat: ChatService,
    private readonly requests: ServiceRequestsService,
  ) {}

  @Get()
  async summary(@CurrentGuest() user: { guestId: string }) {
    const [unreadChat, unseenRequests] = await Promise.all([
      this.chat.countUnread(ChatSender.ADMIN, user.guestId),
      this.requests.countUnseenByGuest(user.guestId),
    ]);
    return { unreadChat, unseenRequests };
  }
}
