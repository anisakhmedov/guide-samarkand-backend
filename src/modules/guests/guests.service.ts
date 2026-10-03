import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { v4 as uuid } from 'uuid';
import { Guest, GuestDocument } from './schemas/guest.schema';
import { AccessStatus, DiscountStatus, ResidenceStatus, ReviewStatus } from '../../common/enums';
import { GuestContactDto } from './dto/enter-gate.dto';

const LIST_LIMIT = 500;

const DISCOUNT_FOR_REVIEW: Record<ReviewStatus, DiscountStatus> = {
  [ReviewStatus.NOT_SENT]: DiscountStatus.NONE,
  [ReviewStatus.PENDING]: DiscountStatus.PENDING,
  [ReviewStatus.APPROVED]: DiscountStatus.APPROVED,
};
const REVIEW_FOR_DISCOUNT: Record<DiscountStatus, ReviewStatus> = {
  [DiscountStatus.NONE]: ReviewStatus.NOT_SENT,
  [DiscountStatus.PENDING]: ReviewStatus.PENDING,
  [DiscountStatus.APPROVED]: ReviewStatus.APPROVED,
};

export interface GuestFilter {
  residence?: ResidenceStatus;
  review?: ReviewStatus;
  access?: AccessStatus;
  discount?: DiscountStatus;
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
  async findOrCreateOnGate(
    name: string,
    roomNumber: string,
    phone: string,
    contacts: GuestContactDto[],
  ): Promise<GuestDocument> {
    const normalizedName = name.trim();
    const normalizedRoom = roomNumber.trim();
    const normalizedPhone = normalizePhone(phone);
    const normalizedContacts = normalizeContacts(contacts);

    let guest = await this.guestModel.findOne({
      name: new RegExp(`^${escapeRegex(normalizedName)}$`, 'i'),
      roomNumber: normalizedRoom,
    });

    const token = uuid();

    if (!guest) {
      guest = await this.guestModel.create({
        name: normalizedName,
        roomNumber: normalizedRoom,
        phone: normalizedPhone,
        contacts: normalizedContacts,
        deviceSessionToken: token,
        history: [{ action: 'created', at: new Date() }],
      });
    } else {
      guest.deviceSessionToken = token;
      // Re-entry: keep contact details fresh (guest may have entered a new number/username).
      guest.phone = normalizedPhone;
      guest.contacts = normalizedContacts as any;
      guest.history.push({ action: 'gate:re-entered', at: new Date() } as any);
      await guest.save();
    }

    return guest;
  }

  /** Guest card in the admin panel — the only place the rules signature is loaded. */
  async findForAdmin(id: string) {
    const guest = await this.guestModel.findById(id).select('+rulesSignature').lean();
    if (!guest) throw new NotFoundException('Guest not found');
    return guest;
  }

  async updateProfile(id: string, country: string, birthDate: string) {
    if (!isValidBirthDate(birthDate)) throw new BadRequestException('Некорректная дата рождения');
    const guest = await this.findById(id);
    guest.country = country;
    guest.birthDate = birthDate;
    guest.history.push({ action: 'profile:filled', at: new Date() } as any);
    await guest.save();
    return guest;
  }

  async acceptRules(id: string, signature: string) {
    const guest = await this.findById(id);
    guest.rulesSignature = signature;
    guest.rulesAcceptedAt = new Date();
    guest.history.push({ action: 'rules:accepted', at: new Date() } as any);
    await guest.save();
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
    if (filter.review === ReviewStatus.PENDING) {
      // Legacy guests may have only one of the two (review / discount) waiting for a check.
      query.$and = [{ $or: [{ statusReview: ReviewStatus.PENDING }, { discountStatus: DiscountStatus.PENDING }] }];
    } else if (filter.review) {
      query.statusReview = filter.review;
    }
    if (filter.access) query.accessStatus = filter.access;
    if (filter.discount) query.discountStatus = filter.discount;
    if (filter.search) {
      const re = new RegExp(escapeRegex(filter.search), 'i');
      query.$or = [{ name: re }, { roomNumber: re }, { phone: re }, { 'contacts.value': re }];
    }
    // List view: no action history (loaded per guest when the card is opened) and a hard cap,
    // so the polled list stays small as the guest base grows.
    return this.guestModel.find(query).select('-history').sort({ createdAt: -1 }).limit(LIST_LIMIT).lean().exec();
  }

  /** Admin bell: guest applications/reviews still waiting for a human decision. */
  async countPending() {
    // One round-trip to Atlas instead of two: the "latest activity" lookup runs alongside the counts.
    const [residence, review, discount, latest] = await Promise.all([
      this.guestModel.countDocuments({ statusResidence: ResidenceStatus.PENDING }),
      // Review and discount are one check now — count each waiting guest once.
      this.guestModel.countDocuments({ $or: [{ statusReview: ReviewStatus.PENDING }, { discountStatus: DiscountStatus.PENDING }] }),
      Promise.resolve(0),
      this.guestModel
        .findOne({
          $or: [
            { statusResidence: ResidenceStatus.PENDING },
            { statusReview: ReviewStatus.PENDING },
            { discountStatus: DiscountStatus.PENDING },
          ],
        })
        .sort({ updatedAt: -1 })
        .select({ updatedAt: 1 })
        .lean(),
    ]);
    return { residence, review, discount, lastActivityAt: latest?.updatedAt ?? null };
  }

  // The review is no longer a gate step (the app asks for it later), so confirming the stay is
  // what opens the guide; rejecting closes it. Access can still be toggled separately.
  async setResidenceStatus(id: string, status: ResidenceStatus, admin: { id: string; name: string }) {
    const guest = await this.updateWithHistory(id, { statusResidence: status }, `residence:${status}`, admin);
    const access =
      status === ResidenceStatus.APPROVED ? AccessStatus.OPEN : status === ResidenceStatus.REJECTED ? AccessStatus.CLOSED : null;
    if (access && guest.accessStatus !== access) {
      return this.updateWithHistory(id, { accessStatus: access }, `access:${access}`, admin);
    }
    return guest;
  }

  /**
   * Guests approved while the review was still mandatory may be stuck with access closed.
   * Open it for them on their next visit — unless staff closed it on purpose (logged as
   * `access:closed` in the history).
   */
  async openAccessIfOnlyBlockedByReview(guest: GuestDocument) {
    const closedByStaff = guest.history.some((h) => h.action === `access:${AccessStatus.CLOSED}`);
    if (guest.statusResidence !== ResidenceStatus.APPROVED || guest.accessStatus === AccessStatus.OPEN || closedByStaff) return guest;
    guest.accessStatus = AccessStatus.OPEN;
    guest.history.push({ action: 'access:open', byAdminName: 'авто (отзыв больше не обязателен)', at: new Date() } as any);
    await guest.save();
    return guest;
  }

  // One review = hotel review + menu discount: statusReview and discountStatus move together.
  async setReviewStatus(id: string, status: ReviewStatus, admin: { id: string; name: string }) {
    return this.updateWithHistory(id, { statusReview: status, discountStatus: DISCOUNT_FOR_REVIEW[status] }, `review:${status}`, admin);
  }

  async setAccessStatus(id: string, status: AccessStatus, admin: { id: string; name: string }) {
    return this.updateWithHistory(id, { accessStatus: status }, `access:${status}`, admin);
  }

  // Kept for API compatibility — mirrors setReviewStatus.
  async setDiscountStatus(id: string, status: DiscountStatus, admin: { id: string; name: string }) {
    return this.setReviewStatus(id, REVIEW_FOR_DISCOUNT[status], admin);
  }

  /**
   * Guest says they left a review (the in-app prompt or Options -> "Оставить отзыв" — both are
   * the same review now). Anything already approved stays approved.
   */
  async markReviewSubmitted(id: string) {
    const guest = await this.findById(id);
    if (guest.statusReview !== ReviewStatus.APPROVED) guest.statusReview = ReviewStatus.PENDING;
    if (guest.discountStatus !== DiscountStatus.APPROVED) guest.discountStatus = DiscountStatus.PENDING;
    guest.history.push({ action: 'review:submitted_by_guest', at: new Date() } as any);
    await guest.save();
    return guest;
  }

  markDiscountSubmitted(id: string) {
    return this.markReviewSubmitted(id);
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

function normalizePhone(phone: string) {
  const trimmed = phone.trim();
  const digits = trimmed.replace(/\D/g, '');
  return trimmed.startsWith('+') ? `+${digits}` : digits;
}

/** Strips "@" and profile-URL prefixes so admins always get a clean username; drops duplicates. */
function normalizeContacts(contacts: GuestContactDto[]) {
  const seen = new Set<string>();
  return (contacts ?? [])
    .map((c) => ({
      type: c.type,
      value: (c.value ?? '')
        .trim()
        .replace(/^https?:\/\/(www\.)?(t\.me|telegram\.me|instagram\.com)\//i, '')
        .replace(/^@/, '')
        .replace(/\/+$/, ''),
    }))
    .filter((c) => {
      if (seen.has(c.type)) return false;
      seen.add(c.type);
      return true;
    });
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Real calendar date, not in the future, not before 1900. */
function isValidBirthDate(value: string) {
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return false;
  return y >= 1900 && date.getTime() <= Date.now();
}

/** What the guest app gets about itself (gate screens, profile). */
export function toGuestMe(guest: GuestDocument) {
  return {
    id: guest._id,
    name: guest.name,
    roomNumber: guest.roomNumber,
    phone: guest.phone,
    contacts: guest.contacts,
    country: guest.country,
    birthDate: guest.birthDate,
    rulesAcceptedAt: guest.rulesAcceptedAt,
    statusResidence: guest.statusResidence,
    statusReview: guest.statusReview,
    accessStatus: guest.accessStatus,
    discountStatus: guest.discountStatus,
  };
}
