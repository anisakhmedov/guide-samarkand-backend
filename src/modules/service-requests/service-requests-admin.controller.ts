import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ServiceRequestsService } from './service-requests.service';
import { UpdateServiceRequestCommentDto, UpdateServiceRequestPaidDto, UpdateServiceRequestStatusDto } from './dto/service-request.dto';
import { AdminJwtGuard } from '../../common/guards/admin-jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminRole, ServiceRequestStatus, ServiceRequestType } from '../../common/enums';

// Admin "Запросы гостей" queue — reception actions these day-to-day, super-admin has full access.
@Controller('admin/service-requests')
@UseGuards(AdminJwtGuard, RolesGuard)
@Roles(AdminRole.SUPER_ADMIN, AdminRole.RECEPTION)
export class ServiceRequestsAdminController {
  constructor(private readonly requests: ServiceRequestsService) {}

  @Get()
  findAll(
    @Query('type') type?: ServiceRequestType,
    @Query('status') status?: ServiceRequestStatus,
    @Query('paid') paid?: string,
  ) {
    return this.requests.findAll({ type, status, paid: paid === 'true' ? true : paid === 'false' ? false : undefined });
  }

  @Patch(':id/status')
  setStatus(@Param('id') id: string, @Body() dto: UpdateServiceRequestStatusDto) {
    return this.requests.setStatus(id, dto.status);
  }

  @Patch(':id/paid')
  setPaid(@Param('id') id: string, @Body() dto: UpdateServiceRequestPaidDto) {
    return this.requests.setPaid(id, dto.paid);
  }

  @Patch(':id/comment')
  setComment(@Param('id') id: string, @Body() dto: UpdateServiceRequestCommentDto) {
    return this.requests.setComment(id, dto.comment);
  }
}
