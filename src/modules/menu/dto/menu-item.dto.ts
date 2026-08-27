import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { MenuItemType } from '../../../common/enums';

export class CreateMenuItemDto {
  @IsEnum(MenuItemType)
  type: MenuItemType;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsString()
  photo?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateMenuItemDto {
  @IsOptional()
  @IsEnum(MenuItemType)
  type?: MenuItemType;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  photo?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
