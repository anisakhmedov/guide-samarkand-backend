import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MenuItem, MenuItemSchema } from './schemas/menu-item.schema';
import { MenuService } from './menu.service';
import { MenuAdminController } from './menu-admin.controller';
import { MenuController } from './menu.controller';
import { SettingsModule } from '../settings/settings.module';
import { GuestsModule } from '../guests/guests.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: MenuItem.name, schema: MenuItemSchema }]), SettingsModule, GuestsModule],
  controllers: [MenuAdminController, MenuController],
  providers: [MenuService],
})
export class MenuModule {}
