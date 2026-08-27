import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { PlacesService } from './places.service';
import { GuestAccessGuard } from '../guests/guards/guest-access.guard';
import { PlaceCategory } from '../../common/enums';

// Guide-facing place listing/detail — requires an open guest access status.
@Controller('places')
@UseGuards(GuestAccessGuard)
export class PlacesController {
  constructor(private readonly places: PlacesService) {}

  @Get()
  findAll(@Query('category') category?: PlaceCategory) {
    return this.places.findAll({ category, onlyActive: true });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.places.findById(id);
  }
}
