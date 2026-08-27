import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { MenuService } from './menu.service';
import { GuestAccessGuard } from '../guests/guards/guest-access.guard';
import { GuestsService } from '../guests/guests.service';
import { CurrentGuest } from '../../common/decorators/current-guest.decorator';
import { DiscountStatus, MenuItemType } from '../../common/enums';

// Guest-facing menu (Options -> "Питание в номера" / "Напитки с бара").
@Controller('menu')
@UseGuards(GuestAccessGuard)
export class MenuController {
  constructor(
    private readonly menu: MenuService,
    private readonly guests: GuestsService,
  ) {}

  @Get()
  async findAll(@Query('type') type: MenuItemType | undefined, @CurrentGuest() user: { guestId: string }) {
    const guest = await this.guests.findById(user.guestId);
    return this.menu.findAllActive(type, guest.discountStatus === DiscountStatus.APPROVED);
  }
}
