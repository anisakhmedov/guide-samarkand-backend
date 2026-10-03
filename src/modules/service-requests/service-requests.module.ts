import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServiceRequest, ServiceRequestSchema } from './schemas/service-request.schema';
import { ServiceRequestsService } from './service-requests.service';
import { ServiceRequestsController } from './service-requests.controller';
import { ServiceRequestsAdminController } from './service-requests-admin.controller';
import { GuestsModule } from '../guests/guests.module';
import { MenuModule } from '../menu/menu.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: ServiceRequest.name, schema: ServiceRequestSchema }]), GuestsModule, MenuModule, SettingsModule],
  controllers: [ServiceRequestsController, ServiceRequestsAdminController],
  providers: [ServiceRequestsService],
  exports: [ServiceRequestsService],
})
export class ServiceRequestsModule {}
