import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ChatMessage, ChatMessageDocument } from './schemas/chat-message.schema';
import { ChatSender } from '../../common/enums';

@Injectable()
export class ChatService {
  constructor(@InjectModel(ChatMessage.name) private model: Model<ChatMessageDocument>) {}

  async create(guestId: string, sender: ChatSender, text: string, photo?: string) {
    return this.model.create({ guestId: new Types.ObjectId(guestId), sender, text, photo });
  }

  /** Full history, or only messages newer than `after` (ISO date) for cheap incremental polling. */
  async findByGuest(guestId: string, after?: string) {
    const query: Record<string, unknown> = { guestId: new Types.ObjectId(guestId) };
    const since = after ? new Date(after) : null;
    if (since && !isNaN(+since)) query.timestamp = { $gt: since };
    return this.model.find(query).sort({ timestamp: 1 }).lean();
  }

  /** Admin dashboard conversation list: one row per guest with last message + unread-from-guest count. */
  async listConversations() {
    return this.model.aggregate([
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: '$guestId',
          lastMessage: { $first: '$text' },
          lastSender: { $first: '$sender' },
          lastTimestamp: { $first: '$timestamp' },
          unreadFromGuest: {
            $sum: { $cond: [{ $and: [{ $eq: ['$sender', ChatSender.GUEST] }, { $eq: ['$readStatus', false] }] }, 1, 0] },
          },
        },
      },
      { $sort: { lastTimestamp: -1 } },
      {
        $lookup: {
          from: 'guests',
          localField: '_id',
          foreignField: '_id',
          as: 'guest',
        },
      },
      { $unwind: '$guest' },
      {
        $project: {
          guestId: '$_id',
          guestName: '$guest.name',
          guestRoom: '$guest.roomNumber',
          lastMessage: 1,
          lastSender: 1,
          lastTimestamp: 1,
          unreadFromGuest: 1,
        },
      },
    ]);
  }

  /** Marks messages from `fromSender` in this conversation as read (called by the *other* side). */
  async markRead(guestId: string, fromSender: ChatSender) {
    await this.model.updateMany(
      { guestId: new Types.ObjectId(guestId), sender: fromSender, readStatus: false },
      { $set: { readStatus: true } },
    );
  }

  /**
   * Notification badge count: unread messages sent by `fromSender`. Admin passes just
   * GUEST (unread across every conversation); a guest passes ADMIN + their own guestId.
   */
  countUnread(fromSender: ChatSender, guestId?: string) {
    const query: Record<string, unknown> = { sender: fromSender, readStatus: false };
    if (guestId) query.guestId = new Types.ObjectId(guestId);
    return this.model.countDocuments(query);
  }
}
