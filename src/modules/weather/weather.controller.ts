import { Controller, Get, UseGuards } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { GuestAccessGuard } from '../guests/guards/guest-access.guard';

// Guest-facing Options -> "Прогноз погоды".
@Controller('weather')
@UseGuards(GuestAccessGuard)
export class WeatherController {
  constructor(private readonly weather: WeatherService) {}

  @Get()
  get() {
    return this.weather.get();
  }
}
