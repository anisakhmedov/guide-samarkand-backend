import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { ChatSender } from '../../common/enums';

interface SocketAuthData {
  role: 'guest' | 'admin';
  guestId?: string;
  adminId?: string;
}

// Real-time chat between a guest and hotel staff (PLAN.md "Чат с администратором").
@WebSocketGateway({ namespace: '/chat', cors: { origin: true, credentials: true } })
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly chat: ChatService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  handleConnection(socket: Socket) {
    const { token, role } = (socket.handshake.auth || {}) as { token?: string; role?: 'guest' | 'admin' };
    if (!token || !role) return this.reject(socket);

    try {
      const secret = role === 'guest' ? this.config.get<string>('guestJwtSecret') : this.config.get<string>('adminJwtSecret');
      const payload = this.jwt.verify(token, { secret });

      const auth: SocketAuthData = role === 'guest' ? { role, guestId: payload.guestId } : { role, adminId: payload.adminId };
      socket.data = auth;

      if (role === 'guest') {
        socket.join(`guest_${auth.guestId}`);
      } else {
        socket.join('admins');
      }
    } catch (err) {
      this.logger.warn(`Chat socket auth failed: ${err}`);
      this.reject(socket);
    }
  }

  private reject(socket: Socket) {
    socket.emit('error', { message: 'Unauthorized' });
    socket.disconnect(true);
  }

  // Admin opens a specific guest's conversation — join that room to get realtime updates.
  @SubscribeMessage('joinConversation')
  joinConversation(@ConnectedSocket() socket: Socket, @MessageBody() body: { guestId: string }) {
    const auth = socket.data as SocketAuthData;
    if (auth?.role === 'admin' && body?.guestId) {
      socket.join(`guest_${body.guestId}`);
    }
  }

  @SubscribeMessage('message')
  async handleMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: { text?: string; photo?: string; guestId?: string },
  ) {
    const auth = socket.data as SocketAuthData;
    if (!auth) return this.reject(socket);

    const sender = auth.role === 'guest' ? ChatSender.GUEST : ChatSender.ADMIN;
    const guestId = auth.role === 'guest' ? auth.guestId! : body.guestId!;
    if (!guestId || (!body.text && !body.photo)) return;

    const message = await this.chat.create(guestId, sender, body.text || '', body.photo);

    this.server.to(`guest_${guestId}`).to('admins').emit('message', message);
  }

  @SubscribeMessage('markRead')
  async handleMarkRead(@ConnectedSocket() socket: Socket, @MessageBody() body: { guestId: string }) {
    const auth = socket.data as SocketAuthData;
    if (!auth || !body?.guestId) return;

    // The reader marks the *other* side's messages as read.
    const fromSender = auth.role === 'guest' ? ChatSender.ADMIN : ChatSender.GUEST;
    await this.chat.markRead(body.guestId, fromSender);
    this.server.to(`guest_${body.guestId}`).to('admins').emit('readStatusChanged', { guestId: body.guestId, by: auth.role });
  }
}
