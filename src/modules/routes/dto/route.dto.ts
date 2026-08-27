import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsBoolean, IsEnum, IsMongoId, IsOptional, IsString, ValidateNested } from 'class-validator';
import { RouteDuration, RouteTheme, TransportType } from '../../../common/enums';

class RoutePointInputDto {
  @IsMongoId()
  placeId: string;

  @IsOptional()
  @IsString()
  comment?: string;
}

export class CreateAdminRouteDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsEnum(RouteTheme)
  theme?: RouteTheme;

  @IsEnum(RouteDuration)
  durationEstimate: RouteDuration;

  @IsEnum(TransportType)
  transportType: TransportType;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => RoutePointInputDto)
  points: RoutePointInputDto[];

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}

export class UpdateAdminRouteDto extends CreateAdminRouteDto {}

export class BuildGuestRouteDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsMongoId({ each: true })
  placeIds: string[];

  @IsEnum(TransportType)
  transportType: TransportType;

  @IsOptional()
  @IsString()
  title?: string;
}
