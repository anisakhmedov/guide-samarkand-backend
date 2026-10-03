import { Body, Controller, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { IsString, MinLength } from 'class-validator';
import { AdminUsersService } from '../admin-users/admin-users.service';
import { AdminJwtGuard } from '../../common/guards/admin-jwt.guard';
import { CurrentAdmin } from '../../common/decorators/current-admin.decorator';

class AdminLoginDto {
  @IsString()
  login: string;

  @IsString()
  @MinLength(1)
  password: string;
}

// Staff login: login + password (see PLAN.md "Технический стек" / "Роли персонала").
@Controller('auth/admin')
export class AdminAuthController {
  constructor(
    private readonly admins: AdminUsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  @Post('login')
  async login(@Body() dto: AdminLoginDto) {
    const admin = await this.admins.findByLogin(dto.login);
    if (!admin || !admin.active) throw new UnauthorizedException('Invalid credentials');

    const valid = await this.admins.validatePassword(admin, dto.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.issue(admin);
  }

  // Sliding session: the panel calls this periodically while open, so a reception shift
  // never gets silently logged out mid-work when the 12h token would expire. Re-reads the
  // staff record, so a blocked account stops being refreshed.
  @Post('refresh')
  @UseGuards(AdminJwtGuard)
  async refresh(@CurrentAdmin() current: { adminId: string }) {
    const admin = await this.admins.findById(current.adminId).catch(() => null);
    if (!admin || !admin.active) throw new UnauthorizedException('Account disabled');
    return this.issue(admin);
  }

  private issue(admin: { _id: unknown; name: string; role: string }) {
    const payload = { adminId: String(admin._id), name: admin.name, role: admin.role };
    const token = this.jwt.sign(payload, {
      secret: this.config.get<string>('adminJwtSecret'),
      expiresIn: this.config.get<string>('adminJwtExpiresIn'),
    });
    return { token, admin: payload };
  }
}
