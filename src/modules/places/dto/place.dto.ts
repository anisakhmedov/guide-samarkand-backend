import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { PlaceCategory } from '../../../common/enums';

class GeoPointDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}

export class CreatePlaceDto {
  @IsEnum(PlaceCategory)
  category: PlaceCategory;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString({ each: true })
  photos?: string[];

  @ValidateNested()
  @Type(() => GeoPointDto)
  location: GeoPointDto;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  workingHours?: string;

  @IsOptional()
  extraFields?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  recommendedByHotel?: boolean;
}

export class UpdatePlaceDto {
  @IsOptional()
  @IsEnum(PlaceCategory)
  category?: PlaceCategory;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString({ each: true })
  photos?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => GeoPointDto)
  location?: GeoPointDto;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  workingHours?: string;

  @IsOptional()
  extraFields?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  recommendedByHotel?: boolean;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
