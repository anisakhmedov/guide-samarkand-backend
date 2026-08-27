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

  async findByGuest(guestId: string) {
    return this.model.find({ guestId: new Types.ObjectId(guestId) }).sort({ timestamp: 1 });
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
}
