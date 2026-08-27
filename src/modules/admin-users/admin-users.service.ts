import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { AdminUser, AdminUserDocument } from './schemas/admin-user.schema';
import { AdminRole } from '../../common/enums';

@Injectable()
export class AdminUsersService {
  constructor(@InjectModel(AdminUser.name) private model: Model<AdminUserDocument>) {}

  async findByLogin(login: string) {
    return this.model.findOne({ login: login.trim().toLowerCase() });
  }

  async findById(id: string) {
    const admin = await this.model.findById(id);
    if (!admin) throw new NotFoundException('Admin not found');
    return admin;
  }

  async findAll() {
    return this.model.find().select('-passwordHash').sort({ createdAt: -1 });
  }

  async create(data: { name: string; login: string; password: string; role: AdminRole }) {
    const existing = await this.findByLogin(data.login);
    if (existing) throw new ConflictException('Login already in use');
    const passwordHash = await bcrypt.hash(data.password, 10);
    return this.model.create({
      name: data.name,
      login: data.login.trim().toLowerCase(),
      passwordHash,
      role: data.role,
    });
  }

  async setActive(id: string, active: boolean) {
    const admin = await this.findById(id);
    admin.active = active;
    await admin.save();
    return admin;
  }

  async updateRole(id: string, role: AdminRole) {
    const admin = await this.findById(id);
    admin.role = role;
    await admin.save();
    return admin;
  }

  async validatePassword(admin: AdminUserDocument, password: string) {
    return bcrypt.compare(password, admin.passwordHash);
  }
}
