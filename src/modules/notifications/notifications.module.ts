import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsAdminController } from './notifications-admin.controller';
import { ChatModule } from '../chat/chat.module';
import { ServiceRequestsModule } from '../service-requests/service-requests.module';
import { GuestsModule } from '../guests/guests.module';

@Module({
  imports: [ChatModule, ServiceRequestsModule, GuestsModule],
  controllers: [NotificationsController, NotificationsAdminController],
})
export class NotificationsModule {}
