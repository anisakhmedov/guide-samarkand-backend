import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { GuestsService } from './guests.service';
import { UpdateAccessStatusDto, UpdateResidenceStatusDto, UpdateReviewStatusDto } from './dto/update-status.dto';
import { AdminJwtGuard } from '../../common/guards/admin-jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentAdmin } from '../../common/decorators/current-admin.decorator';
import { AccessStatus, AdminRole, ResidenceStatus, ReviewStatus } from '../../common/enums';

// Admin "Гости" section (PLAN.md "Админ-панель" -> "Гости"). Reception + super-admin.
@Controller('admin/guests')
@UseGuards(AdminJwtGuard, RolesGuard)
@Roles(AdminRole.SUPER_ADMIN, AdminRole.RECEPTION)
export class GuestsController {
  constructor(private readonly guests: GuestsService) {}

  @Get()
  findAll(
    @Query('residence') residence?: ResidenceStatus,
    @Query('review') review?: ReviewStatus,
    @Query('access') access?: AccessStatus,
    @Query('search') search?: string,
  ) {
    return this.guests.findAll({ residence, review, access, search });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.guests.findById(id);
  }

  @Patch(':id/residence')
  setResidence(
    @Param('id') id: string,
    @Body() dto: UpdateResidenceStatusDto,
    @CurrentAdmin() admin: { adminId: string; name: string },
  ) {
    return this.guests.setResidenceStatus(id, dto.status, { id: admin.adminId, name: admin.name });
  }

  @Patch(':id/review')
  setReview(
    @Param('id') id: string,
    @Body() dto: UpdateReviewStatusDto,
    @CurrentAdmin() admin: { adminId: string; name: string },
  ) {
    return this.guests.setReviewStatus(id, dto.status, { id: admin.adminId, name: admin.name });
  }

  @Patch(':id/access')
  setAccess(
    @Param('id') id: string,
    @Body() dto: UpdateAccessStatusDto,
    @CurrentAdmin() admin: { adminId: string; name: string },
  ) {
    return this.guests.setAccessStatus(id, dto.status, { id: admin.adminId, name: admin.name });
  }
}
