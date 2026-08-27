import { Controller, Get } from '@nestjs/common';
import { SettingsService } from './settings.service';

// Public (unauthenticated) — the discount percentage isn't sensitive, and the guest app
// needs it on the Options "leave a review" / menu pages before/without an active discount.
@Controller('settings')
export class SettingsPublicController {
  constructor(private readonly settings: SettingsService) {}

  @Get('discount')
  async discount() {
    return { discountPercent: await this.settings.discountPercent() };
  }
}
