import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServiceRequest, ServiceRequestSchema } from './schemas/service-request.schema';
import { ServiceRequestsService } from './service-requests.service';
import { ServiceRequestsController } from './service-requests.controller';
import { ServiceRequestsAdminController } from './service-requests-admin.controller';
import { GuestsModule } from '../guests/guests.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: ServiceRequest.name, schema: ServiceRequestSchema }]), GuestsModule],
  controllers: [ServiceRequestsController, ServiceRequestsAdminController],
  providers: [ServiceRequestsService],
})
export class ServiceRequestsModule {}
