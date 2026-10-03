import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { GuestsService, toGuestMe } from './guests.service';
import { AcceptRulesDto, UpdateGuestProfileDto } from './dto/guest-profile.dto';
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
    return toGuestMe(await this.guests.openAccessIfOnlyBlockedByReview(guest));
  }

  // Registration step 2: residence country + date of birth.
  @Patch('me/profile')
  async updateProfile(@Body() dto: UpdateGuestProfileDto, @CurrentGuest() user: { guestId: string }) {
    return toGuestMe(await this.guests.updateProfile(user.guestId, dto.country, dto.birthDate));
  }

  // Registration step 3: house rules accepted with a handwritten signature.
  @Post('me/rules')
  async acceptRules(@Body() dto: AcceptRulesDto, @CurrentGuest() user: { guestId: string }) {
    return toGuestMe(await this.guests.acceptRules(user.guestId, dto.signature));
  }

  // Guest confirms they left a review (asked inside the app on a later visit, no longer a gate step).
  @Patch('me/review-submitted')
  async markReviewSubmitted(@CurrentGuest() user: { guestId: string }) {
    return toGuestMe(await this.guests.markReviewSubmitted(user.guestId));
  }

  // "Options -> Leave a review" discount flow: separate from the mandatory gate review above.
  @Patch('me/discount-submitted')
  async markDiscountSubmitted(@CurrentGuest() user: { guestId: string }) {
    return toGuestMe(await this.guests.markDiscountSubmitted(user.guestId));
  }
}
