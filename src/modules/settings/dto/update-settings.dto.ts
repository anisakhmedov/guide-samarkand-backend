import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';

// Every field optional so the admin Settings page can save any subset. Fields not listed
// here are stripped by the global ValidationPipe (whitelist: true).
export class UpdateSettingsDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  discountPercent?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  markupPercent?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  hookahPrice?: number;

  @IsOptional()
  @IsBoolean()
  hookahAvailable?: boolean;
}
