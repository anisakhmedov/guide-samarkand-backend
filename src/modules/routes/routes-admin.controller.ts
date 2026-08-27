import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { CreateAdminRouteDto, UpdateAdminRouteDto } from './dto/route.dto';
import { AdminJwtGuard } from '../../common/guards/admin-jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentAdmin } from '../../common/decorators/current-admin.decorator';
import { AdminRole } from '../../common/enums';
import { IsBoolean } from 'class-validator';

class SetPublishedDto {
  @IsBoolean()
  published: boolean;
}

// Route builder / "Конструктор маршрутов" (PLAN.md).
@Controller('admin/routes')
@UseGuards(AdminJwtGuard, RolesGuard)
@Roles(AdminRole.SUPER_ADMIN, AdminRole.RECEPTION)
export class RoutesAdminController {
  constructor(private readonly routes: RoutesService) {}

  @Get()
  findAll() {
    return this.routes.findAllForAdmin();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.routes.findById(id);
  }

  @Post()
  create(@Body() dto: CreateAdminRouteDto, @CurrentAdmin() admin: { adminId: string }) {
    return this.routes.createAdminRoute(dto, admin.adminId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAdminRouteDto) {
    return this.routes.updateAdminRoute(id, dto);
  }

  @Patch(':id/published')
  setPublished(@Param('id') id: string, @Body() dto: SetPublishedDto) {
    return this.routes.setPublished(id, dto.published);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.routes.remove(id);
  }
}
