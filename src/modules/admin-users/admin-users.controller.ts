import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AdminUsersService } from './admin-users.service';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { AdminJwtGuard } from '../../common/guards/admin-jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminRole } from '../../common/enums';
import { IsBoolean, IsEnum } from 'class-validator';

class SetActiveDto {
  @IsBoolean()
  active: boolean;
}

class SetRoleDto {
  @IsEnum(AdminRole)
  role: AdminRole;
}

// Staff account management — super-admin only (PLAN.md "Роли персонала").
@Controller('admin/staff')
@UseGuards(AdminJwtGuard, RolesGuard)
@Roles(AdminRole.SUPER_ADMIN)
export class AdminUsersController {
  constructor(private readonly service: AdminUsersService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  create(@Body() dto: CreateAdminUserDto) {
    return this.service.create(dto);
  }

  @Patch(':id/active')
  setActive(@Param('id') id: string, @Body() dto: SetActiveDto) {
    return this.service.setActive(id, dto.active);
  }

  @Patch(':id/role')
  setRole(@Param('id') id: string, @Body() dto: SetRoleDto) {
    return this.service.updateRole(id, dto.role);
  }
}
