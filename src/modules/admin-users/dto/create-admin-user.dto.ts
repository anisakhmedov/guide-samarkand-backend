import { IsEnum, IsString, MinLength } from 'class-validator';
import { AdminRole } from '../../../common/enums';

export class CreateAdminUserDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(3)
  login: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(AdminRole)
  role: AdminRole;
}
