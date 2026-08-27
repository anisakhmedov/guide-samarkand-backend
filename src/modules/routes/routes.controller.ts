import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { BuildGuestRouteDto } from './dto/route.dto';
import { GuestAccessGuard } from '../guests/guards/guest-access.guard';
import { CurrentGuest } from '../../common/decorators/current-guest.decorator';
import { RouteDuration, RouteTheme, TransportType } from '../../common/enums';

// Guide-facing routes: filterable list of ready-made routes + guest-built custom routes.
@Controller('routes')
@UseGuards(GuestAccessGuard)
export class RoutesController {
  constructor(private readonly routes: RoutesService) {}

  @Get()
  findAll(
    @Query('theme') theme?: RouteTheme,
    @Query('duration') durationEstimate?: RouteDuration,
    @Query('transport') transportType?: TransportType,
  ) {
    return this.routes.findAllPublished({ theme, durationEstimate, transportType });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.routes.findById(id);
  }

  @Post('custom')
  buildCustom(@Body() dto: BuildGuestRouteDto, @CurrentGuest() user: { guestId: string }) {
    return this.routes.buildGuestRoute(dto.placeIds, dto.transportType, user.guestId, dto.title);
  }
}
