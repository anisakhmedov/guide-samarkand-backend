import { Module } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { WeatherController } from './weather.controller';
import { GuestsModule } from '../guests/guests.module';

@Module({
  imports: [GuestsModule],
  controllers: [WeatherController],
  providers: [WeatherService],
})
export class WeatherModule {}
