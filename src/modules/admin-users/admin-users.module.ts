import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminUser, AdminUserSchema } from './schemas/admin-user.schema';
import { AdminUsersService } from './admin-users.service';
import { AdminUsersController } from './admin-users.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: AdminUser.name, schema: AdminUserSchema }])],
  providers: [AdminUsersService],
  controllers: [AdminUsersController],
  exports: [AdminUsersService],
})
export class AdminUsersModule {}
