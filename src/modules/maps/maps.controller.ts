import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { MapsService } from './maps.service';
import { AdminJwtGuard } from '../../common/guards/admin-jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminRole } from '../../common/enums';

// Address search for the admin "Контент гайда" form (Nominatim geocoding, PLAN.md).
@Controller('admin/geocode')
@UseGuards(AdminJwtGuard, RolesGuard)
@Roles(AdminRole.SUPER_ADMIN, AdminRole.CONTENT_MANAGER)
export class MapsController {
  constructor(private readonly maps: MapsService) {}

  @Get()
  search(@Query('q') q: string) {
    if (!q || q.trim().length < 3) return [];
    return this.maps.geocode(q.trim());
  }
}
