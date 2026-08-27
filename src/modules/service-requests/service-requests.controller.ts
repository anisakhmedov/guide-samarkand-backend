import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ServiceRequestsService } from './service-requests.service';
import { CreateServiceRequestDto } from './dto/service-request.dto';
import { GuestAccessGuard } from '../guests/guards/guest-access.guard';
import { CurrentGuest } from '../../common/decorators/current-guest.decorator';

// Guest-facing Options requests: food/drink orders, wake-up, cleaning, problem reports,
// room extension. All land in the admin "Запросы гостей" queue for staff to action.
@Controller('service-requests')
@UseGuards(GuestAccessGuard)
export class ServiceRequestsController {
  constructor(private readonly requests: ServiceRequestsService) {}

  @Post()
  create(@Body() dto: CreateServiceRequestDto, @CurrentGuest() user: { guestId: string }) {
    return this.requests.create(user.guestId, dto.type, dto.payload);
  }

  @Get('mine')
  findMine(@CurrentGuest() user: { guestId: string }) {
    return this.requests.findAllByGuest(user.guestId);
  }
}
