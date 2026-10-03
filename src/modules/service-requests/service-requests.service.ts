import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ServiceRequest, ServiceRequestDocument } from './schemas/service-request.schema';
import { DiscountStatus, ServiceRequestStatus, ServiceRequestType } from '../../common/enums';
import { MenuService } from '../menu/menu.service';
import { SettingsService } from '../settings/settings.service';
import { GuestsService } from '../guests/guests.service';

export interface ServiceRequestFilter {
  type?: ServiceRequestType;
  status?: ServiceRequestStatus;
  paid?: boolean;
}

const PAYMENT_METHODS = ['cash', 'card'];
const MAX_QTY = 50;
const LIST_LIMIT = 500;

function toQty(value: unknown): number {
  const n = Math.floor(Number(value));
  return Number.isFinite(n) ? Math.min(Math.max(n, 0), MAX_QTY) : 0;
}

@Injectable()
export class ServiceRequestsService {
  constructor(
    @InjectModel(ServiceRequest.name) private model: Model<ServiceRequestDocument>,
    private readonly menu: MenuService,
    private readonly settings: SettingsService,
    private readonly guests: GuestsService,
  ) {}

  async create(guestId: string, type: ServiceRequestType, payload: Record<string, unknown> = {}) {
    let total = 0;
    if (type === ServiceRequestType.FOOD_ORDER || type === ServiceRequestType.DRINK_ORDER) {
      ({ payload, total } = await this.priceMenuOrder(guestId, payload));
    } else if (type === ServiceRequestType.HOOKAH) {
      ({ payload, total } = await this.priceHookahOrder(payload));
    }
    return this.model.create({ guestId: new Types.ObjectId(guestId), type, payload, total });
  }

  /** Re-prices a room-service order from the live menu — the guest only chooses ids + quantities. */
  private async priceMenuOrder(guestId: string, payload: Record<string, unknown>) {
    const guest = await this.guests.findById(guestId);
    const menu = await this.menu.findAllActive(undefined, guest.discountStatus === DiscountStatus.APPROVED);
    const byId = new Map(menu.map((m) => [m._id, m]));
    const requested = Array.isArray(payload.items) ? (payload.items as Record<string, unknown>[]) : [];

    const items = requested
      .map((it) => {
        const menuItem = byId.get(String(it.menuItemId));
        const qty = toQty(it.qty);
        if (!menuItem || qty === 0) return null;
        return { menuItemId: menuItem._id, name: menuItem.name, qty, price: menuItem.discountedPrice, basePrice: menuItem.price };
      })
      .filter((it): it is NonNullable<typeof it> => it !== null);

    if (items.length === 0) throw new BadRequestException('Order has no available items');

    const total = items.reduce((sum, it) => sum + it.price * it.qty, 0);
    const fullPrice = items.reduce((sum, it) => sum + it.basePrice * it.qty, 0);
    return {
      total,
      payload: {
        items: items.map(({ basePrice, ...it }) => it),
        discount: fullPrice - total,
        paymentMethod: this.paymentMethod(payload.paymentMethod),
      },
    };
  }

  private async priceHookahOrder(payload: Record<string, unknown>) {
    const settings = await this.settings.get();
    if (!settings.hookahAvailable || settings.hookahPrice <= 0) {
      throw new BadRequestException('Hookah is not available right now');
    }
    const qty = toQty(payload.qty) || 1;
    return {
      total: settings.hookahPrice * qty,
      payload: {
        qty,
        price: settings.hookahPrice,
        time: typeof payload.time === 'string' ? payload.time : '',
        note: typeof payload.note === 'string' ? payload.note : '',
        paymentMethod: this.paymentMethod(payload.paymentMethod),
      },
    };
  }

  private paymentMethod(value: unknown) {
    return PAYMENT_METHODS.includes(String(value)) ? String(value) : 'cash';
  }

  findAllByGuest(guestId: string) {
    return this.model.find({ guestId: new Types.ObjectId(guestId) }).sort({ createdAt: -1 }).exec();
  }

  findAll(filter: ServiceRequestFilter) {
    const query: Record<string, unknown> = {};
    if (filter.type) query.type = filter.type;
    if (filter.status) query.status = filter.status;
    if (filter.paid !== undefined) query.paid = filter.paid;
    return this.model
      .find(query)
      .sort({ createdAt: -1 })
      .limit(LIST_LIMIT)
      .populate('guestId', 'name roomNumber phone')
      .lean()
      .exec();
  }

  async setStatus(id: string, status: ServiceRequestStatus) {
    const request = await this.model.findById(id);
    if (!request) throw new NotFoundException('Service request not found');
    request.status = status;
    // An admin-driven status change is exactly the event the guest's notification
    // badge should surface — mark it unseen again even if it was seen before.
    request.seenByGuest = false;
    await request.save();
    return request;
  }

  async setPaid(id: string, paid: boolean) {
    const request = await this.model.findById(id);
    if (!request) throw new NotFoundException('Service request not found');
    request.paid = paid;
    request.paidAt = paid ? new Date() : null;
    await request.save();
    return request;
  }

  async setComment(id: string, comment: string) {
    const request = await this.model.findById(id);
    if (!request) throw new NotFoundException('Service request not found');
    request.adminComment = comment;
    // A new/edited comment is worth resurfacing to the guest even if they'd already
    // seen this request (e.g. the comment was added after the status was set).
    request.seenByGuest = false;
    await request.save();
    return request;
  }

  /** Guest opened the Notifications page — clears their unread-request badge. */
  markSeenByGuest(guestId: string) {
    return this.model.updateMany(
      { guestId: new Types.ObjectId(guestId), seenByGuest: false },
      { $set: { seenByGuest: true } },
    );
  }

  countUnseenByGuest(guestId: string) {
    return this.model.countDocuments({ guestId: new Types.ObjectId(guestId), seenByGuest: false });
  }

  /** Admin-side notification badge: requests nobody has actioned yet. */
  countNew() {
    return this.model.countDocuments({ status: ServiceRequestStatus.NEW });
  }
}
