import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { PlacesService } from './places.service';
import { CreatePlaceDto, UpdatePlaceDto } from './dto/place.dto';
import { AdminJwtGuard } from '../../common/guards/admin-jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminRole, PlaceCategory } from '../../common/enums';

// Admin "Контент гайда" CRUD (PLAN.md). Content managers + super-admin.
@Controller('admin/places')
@UseGuards(AdminJwtGuard, RolesGuard)
@Roles(AdminRole.SUPER_ADMIN, AdminRole.CONTENT_MANAGER)
export class PlacesAdminController {
  constructor(private readonly places: PlacesService) {}

  @Get()
  findAll(@Query('category') category?: PlaceCategory) {
    return this.places.findAll({ category });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.places.findById(id);
  }

  @Post()
  create(@Body() dto: CreatePlaceDto) {
    return this.places.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePlaceDto) {
    return this.places.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.places.remove(id);
  }
}
