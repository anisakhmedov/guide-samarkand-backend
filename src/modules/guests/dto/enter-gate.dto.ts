import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { ContactChannel, PHONE_BASED_CHANNELS } from '../../../common/enums';

export class GuestContactDto {
  @IsEnum(ContactChannel)
  type: ContactChannel;

  // Username / ID in the messenger. Required for everything except WhatsApp/Viber,
  // which work through the phone number.
  @ValidateIf((o: GuestContactDto) => !PHONE_BASED_CHANNELS.includes(o.type) || !!o.value)
  @IsString()
  @IsNotEmpty({ message: 'Укажите username для выбранного мессенджера' })
  @MaxLength(80)
  value?: string;
}

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

  // International format, digits with optional +, spaces, dashes, brackets.
  @IsString()
  @IsNotEmpty({ message: 'Укажите номер телефона' })
  @Matches(/^\+?[0-9\s\-()]{7,20}$/, { message: 'Некорректный номер телефона' })
  phone: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'Выберите хотя бы один способ связи' })
  @ArrayMaxSize(6)
  @ValidateNested({ each: true })
  @Type(() => GuestContactDto)
  contacts: GuestContactDto[];
}
