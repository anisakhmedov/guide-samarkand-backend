import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { v4 as uuid } from 'uuid';
import { Guest, GuestDocument } from './schemas/guest.schema';
import { AccessStatus, ResidenceStatus, ReviewStatus } from '../../common/enums';

export interface GuestFilter {
  residence?: ResidenceStatus;
  review?: ReviewStatus;
  access?: AccessStatus;
  search?: string;
}

@Injectable()
export class GuestsService {
  constructor(@InjectModel(Guest.name) private guestModel: Model<GuestDocument>) {}

  /**
   * Gate step 2 (see PLAN.md "Полный флоу доступа"): find an existing guest by
   * name+room (case-insensitive) or create a new pending application.
   * Re-entry from a new device reuses the same guest record/statuses — an
   * admin can see it's a returning guest instead of a fresh application.
   */
  async findOrCreateOnGate(name: string, roomNumber: string): Promise<GuestDocument> {
    const normalizedName = name.trim();
    const normalizedRoom = roomNumber.trim();

    let guest = await this.guestModel.findOne({
      name: new RegExp(`^${escapeRegex(normalizedName)}$`, 'i'),
      roomNumber: normalizedRoom,
    });

    const token = uuid();

    if (!guest) {
      guest = await this.guestModel.create({
        name: normalizedName,
        roomNumber: normalizedRoom,
        deviceSessionToken: token,
        history: [{ action: 'created', at: new Date() }],
      });
    } else {
      guest.deviceSessionToken = token;
      await guest.save();
    }

    return guest;
  }

  async findById(id: string): Promise<GuestDocument> {
    const guest = await this.guestModel.findById(id);
    if (!guest) throw new NotFoundException('Guest not found');
    return guest;
  }

  async findAll(filter: GuestFilter) {
    const query: Record<string, unknown> = {};
    if (filter.residence) query.statusResidence = filter.residence;
    if (filter.review) query.statusReview = filter.review;
    if (filter.access) query.accessStatus = filter.access;
    if (filter.search) {
      const re = new RegExp(escapeRegex(filter.search), 'i');
      query.$or = [{ name: re }, { roomNumber: re }];
    }
    return this.guestModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async setResidenceStatus(id: string, status: ResidenceStatus, admin: { id: string; name: string }) {
    return this.updateWithHistory(id, { statusResidence: status }, `residence:${status}`, admin);
  }

  async setReviewStatus(id: string, status: ReviewStatus, admin: { id: string; name: string }) {
    return this.updateWithHistory(id, { statusReview: status }, `review:${status}`, admin);
  }

  async setAccessStatus(id: string, status: AccessStatus, admin: { id: string; name: string }) {
    return this.updateWithHistory(id, { accessStatus: status }, `access:${status}`, admin);
  }

  /** Guest self-service: mark that they submitted their review for admin verification. */
  async markReviewSubmitted(id: string) {
    const guest = await this.findById(id);
    guest.statusReview = ReviewStatus.PENDING;
    guest.history.push({ action: 'review:submitted_by_guest', at: new Date() } as any);
    await guest.save();
    return guest;
  }

  private async updateWithHistory(
    id: string,
    patch: Partial<Guest>,
    action: string,
    admin: { id: string; name: string },
  ) {
    const guest = await this.findById(id);
    Object.assign(guest, patch);
    guest.history.push({
      action,
      byAdminId: new Types.ObjectId(admin.id),
      byAdminName: admin.name,
      at: new Date(),
    } as any);
    await guest.save();
    return guest;
  }
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
