import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateMenuItemDto, UpdateMenuItemDto } from './dto/menu-item.dto';
import { AdminJwtGuard } from '../../common/guards/admin-jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminRole, MenuItemType } from '../../common/enums';

// Admin "Меню room-service" CRUD (Options -> Food/Drinks pricing). Reception manages
// day-to-day pricing/availability; super-admin has full access.
@Controller('admin/menu')
@UseGuards(AdminJwtGuard, RolesGuard)
@Roles(AdminRole.SUPER_ADMIN, AdminRole.RECEPTION)
export class MenuAdminController {
  constructor(private readonly menu: MenuService) {}

  @Get()
  findAll(@Query('type') type?: MenuItemType) {
    return this.menu.findAll(type);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.menu.findById(id);
  }

  @Post()
  create(@Body() dto: CreateMenuItemDto) {
    return this.menu.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMenuItemDto) {
    return this.menu.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.menu.remove(id);
  }
}
