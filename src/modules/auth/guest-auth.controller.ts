import { Body, Controller, Get, Post } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { GuestsService, toGuestMe } from '../guests/guests.service';
import { EnterGateDto } from '../guests/dto/enter-gate.dto';

// Public gate: name + room number + phone/messenger contacts, no password/SMS (see PLAN.md "Доступ и авторизация гостей").
@Controller('auth/guest')
export class GuestAuthController {
  constructor(
    private readonly guests: GuestsService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  @Post('enter')
  async enter(@Body() dto: EnterGateDto) {
    const guest = await this.guests.findOrCreateOnGate(dto.name, dto.roomNumber, dto.phone, dto.contacts);
    const token = this.jwt.sign(
      { guestId: guest._id.toString() },
      {
        secret: this.config.get<string>('guestJwtSecret'),
        expiresIn: this.config.get<string>('guestJwtExpiresIn'),
      },
    );
    return {
      token,
      guest: toGuestMe(guest),
      reviewLinks: this.reviewLinksPayload(),
    };
  }

  // Public — reviewLinks aren't sensitive, and the guest app needs them again on the
  // Options "leave a review" page independently of the one-time /enter response (e.g.
  // after a page reload, long after the gate flow finished).
  @Get('review-links')
  reviewLinks() {
    return this.reviewLinksPayload();
  }

  private reviewLinksPayload() {
    return {
      google: this.config.get('reviewLinks.google'),
      yandex: this.config.get('reviewLinks.yandex'),
      twoGis: this.config.get('reviewLinks.twoGis'),
    };
  }
}
