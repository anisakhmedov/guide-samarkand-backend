import { Controller, Get } from '@nestjs/common';
import { SettingsService } from './settings.service';

// Public (unauthenticated) — the discount percentage and hookah price aren't sensitive, and
// the guest app needs them on the Options pages before/without an active discount.
@Controller('settings')
export class SettingsPublicController {
  constructor(private readonly settings: SettingsService) {}

  @Get('discount')
  async discount() {
    return { discountPercent: await this.settings.discountPercent() };
  }

  @Get('hookah')
  async hookah() {
    const s = await this.settings.get();
    return { price: s.hookahPrice, available: s.hookahAvailable && s.hookahPrice > 0 };
  }
}
