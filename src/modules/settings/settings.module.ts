import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HotelSettings, HotelSettingsSchema } from './schemas/hotel-settings.schema';
import { SettingsService } from './settings.service';
import { SettingsAdminController } from './settings-admin.controller';
import { SettingsPublicController } from './settings.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: HotelSettings.name, schema: HotelSettingsSchema }])],
  controllers: [SettingsAdminController, SettingsPublicController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
