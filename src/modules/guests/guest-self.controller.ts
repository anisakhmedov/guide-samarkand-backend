import { Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { GuestsService } from './guests.service';
import { GuestJwtGuard } from '../../common/guards/guest-jwt.guard';
import { CurrentGuest } from '../../common/decorators/current-guest.decorator';

// Guest-facing "my status" endpoints, used by the guide-frontend gate/profile screens.
@Controller('guest')
@UseGuards(GuestJwtGuard)
export class GuestSelfController {
  constructor(private readonly guests: GuestsService) {}

  @Get('me')
  async me(@CurrentGuest() user: { guestId: string }) {
    const guest = await this.guests.findById(user.guestId);
    return {
      id: guest._id,
      name: guest.name,
      roomNumber: guest.roomNumber,
      statusResidence: guest.statusResidence,
      statusReview: guest.statusReview,
      accessStatus: guest.accessStatus,
    };
  }

  // Step 5 of the gate flow: guest confirms they left a review on one of the platforms.
  @Patch('me/review-submitted')
  async markReviewSubmitted(@CurrentGuest() user: { guestId: string }) {
    return this.guests.markReviewSubmitted(user.guestId);
  }
}
