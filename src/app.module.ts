import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import configuration from './config/configuration';

import { GuestsModule } from './modules/guests/guests.module';
import { AuthModule } from './modules/auth/auth.module';
import { AdminUsersModule } from './modules/admin-users/admin-users.module';
import { PlacesModule } from './modules/places/places.module';
import { MapsModule } from './modules/maps/maps.module';
import { RoutesModule } from './modules/routes/routes.module';
import { ChatModule } from './modules/chat/chat.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { UploadModule } from './modules/upload/upload.module';
import { SettingsModule } from './modules/settings/settings.module';
import { MenuModule } from './modules/menu/menu.module';
import { ServiceRequestsModule } from './modules/service-requests/service-requests.module';
import { WeatherModule } from './modules/weather/weather.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({ uri: config.get<string>('mongodbUri') }),
    }),
    GuestsModule,
    AuthModule,
    AdminUsersModule,
    PlacesModule,
    MapsModule,
    RoutesModule,
    ChatModule,
    FeedbackModule,
    UploadModule,
    SettingsModule,
    MenuModule,
    ServiceRequestsModule,
    WeatherModule,
  ],
})
export class AppModule {}
