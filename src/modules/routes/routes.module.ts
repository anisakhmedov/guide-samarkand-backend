import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Route, RouteSchema } from './schemas/route.schema';
import { RoutesService } from './routes.service';
import { RoutesController } from './routes.controller';
import { RoutesAdminController } from './routes-admin.controller';
import { PlacesModule } from '../places/places.module';
import { MapsModule } from '../maps/maps.module';
import { GuestsModule } from '../guests/guests.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Route.name, schema: RouteSchema }]), PlacesModule, MapsModule, GuestsModule],
  providers: [RoutesService],
  controllers: [RoutesController, RoutesAdminController],
  exports: [RoutesService],
})
export class RoutesModule {}
