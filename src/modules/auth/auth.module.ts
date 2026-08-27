import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { GuestsModule } from '../guests/guests.module';
import { AdminUsersModule } from '../admin-users/admin-users.module';
import { GuestAuthController } from './guest-auth.controller';
import { AdminAuthController } from './admin-auth.controller';
import { GuestJwtStrategy } from '../../common/strategies/guest-jwt.strategy';
import { AdminJwtStrategy } from '../../common/strategies/admin-jwt.strategy';

@Module({
  imports: [PassportModule, JwtModule.register({}), GuestsModule, AdminUsersModule],
  controllers: [GuestAuthController, AdminAuthController],
  providers: [GuestJwtStrategy, AdminJwtStrategy],
})
export class AuthModule {}
