import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { IsString, MinLength } from 'class-validator';
import { AdminUsersService } from '../admin-users/admin-users.service';

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

    const payload = { adminId: admin._id.toString(), name: admin.name, role: admin.role };
    const token = this.jwt.sign(payload, {
      secret: this.config.get<string>('adminJwtSecret'),
      expiresIn: this.config.get<string>('adminJwtExpiresIn'),
    });

    return { token, admin: payload };
  }
}
