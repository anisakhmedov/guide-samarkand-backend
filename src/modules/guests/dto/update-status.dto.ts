import { IsEnum } from 'class-validator';
import { AccessStatus, ResidenceStatus, ReviewStatus } from '../../../common/enums';

export class UpdateResidenceStatusDto {
  @IsEnum(ResidenceStatus)
  status: ResidenceStatus;
}

export class UpdateReviewStatusDto {
  @IsEnum(ReviewStatus)
  status: ReviewStatus;
}

export class UpdateAccessStatusDto {
  @IsEnum(AccessStatus)
  status: AccessStatus;
}
