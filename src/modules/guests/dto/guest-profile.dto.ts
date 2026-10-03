import { IsString, Matches, MaxLength } from 'class-validator';

// Registration step 2: residence country + date of birth.
export class UpdateGuestProfileDto {
  // ISO 3166-1 alpha-2 (the guest app shows localized names for these codes).
  @IsString()
  @Matches(/^[A-Z]{2}$/, { message: 'Выберите страну из списка' })
  country: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Укажите дату рождения' })
  birthDate: string;
}

// Registration step 3: guest agreed to the house rules and signed.
export class AcceptRulesDto {
  // PNG exported from the signature pad. ~10–60 KB in practice; capped well above that.
  @IsString()
  @Matches(/^data:image\/png;base64,[A-Za-z0-9+/=]+$/, { message: 'Поставьте подпись' })
  @MaxLength(700_000)
  signature: string;
}
