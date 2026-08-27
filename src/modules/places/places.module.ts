import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Place, PlaceSchema } from './schemas/place.schema';
import { PlacesService } from './places.service';
import { PlacesController } from './places.controller';
import { PlacesAdminController } from './places-admin.controller';
import { GuestsModule } from '../guests/guests.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Place.name, schema: PlaceSchema }]), GuestsModule],
  providers: [PlacesService],
  controllers: [PlacesController, PlacesAdminController],
  exports: [PlacesService],
})
export class PlacesModule {}
