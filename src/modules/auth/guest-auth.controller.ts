import { Body, Controller, Post } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { GuestsService } from '../guests/guests.service';
import { EnterGateDto } from '../guests/dto/enter-gate.dto';

// Public gate: name + room number, no password/SMS (see PLAN.md "Доступ и авторизация гостей").
@Controller('auth/guest')
export class GuestAuthController {
  constructor(
    private readonly guests: GuestsService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  @Post('enter')
  async enter(@Body() dto: EnterGateDto) {
    const guest = await this.guests.findOrCreateOnGate(dto.name, dto.roomNumber);
    const token = this.jwt.sign(
      { guestId: guest._id.toString() },
      {
        secret: this.config.get<string>('guestJwtSecret'),
        expiresIn: this.config.get<string>('guestJwtExpiresIn'),
      },
    );
    return {
      token,
      guest: {
        id: guest._id,
        name: guest.name,
        roomNumber: guest.roomNumber,
        statusResidence: guest.statusResidence,
        statusReview: guest.statusReview,
        accessStatus: guest.accessStatus,
      },
      reviewLinks: {
        google: this.config.get('reviewLinks.google'),
        yandex: this.config.get('reviewLinks.yandex'),
        twoGis: this.config.get('reviewLinks.twoGis'),
      },
    };
  }
}
