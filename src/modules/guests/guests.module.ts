import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Guest, GuestSchema } from './schemas/guest.schema';
import { GuestsService } from './guests.service';
import { GuestsController } from './guests.controller';
import { GuestSelfController } from './guest-self.controller';
import { GuestAccessGuard } from './guards/guest-access.guard';

@Module({
  imports: [MongooseModule.forFeature([{ name: Guest.name, schema: GuestSchema }])],
  providers: [GuestsService, GuestAccessGuard],
  controllers: [GuestsController, GuestSelfController],
  exports: [GuestsService, GuestAccessGuard],
})
export class GuestsModule {}
