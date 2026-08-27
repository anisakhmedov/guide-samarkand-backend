import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class EnterGateDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(80)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  roomNumber: string;
}
