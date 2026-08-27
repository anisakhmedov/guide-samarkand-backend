import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ChatMessage, ChatMessageSchema } from './schemas/chat-message.schema';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { ChatAdminController } from './chat-admin.controller';
import { GuestsModule } from '../guests/guests.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: ChatMessage.name, schema: ChatMessageSchema }]), JwtModule.register({}), GuestsModule],
  providers: [ChatService, ChatGateway],
  controllers: [ChatController, ChatAdminController],
  exports: [ChatService],
})
export class ChatModule {}
