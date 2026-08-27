import { IsEnum, IsObject, IsOptional } from 'class-validator';
import { ServiceRequestStatus, ServiceRequestType } from '../../../common/enums';

export class CreateServiceRequestDto {
  @IsEnum(ServiceRequestType)
  type: ServiceRequestType;

  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;
}

export class UpdateServiceRequestStatusDto {
  @IsEnum(ServiceRequestStatus)
  status: ServiceRequestStatus;
}
