import { Controller, Get } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MessagesGateway } from './messages.gateway';

@Controller()
export class AppController {

  constructor(private readonly messagesGateway: MessagesGateway) {}

  @MessagePattern('kafka') // Our topic name
  getMessage(@Payload() message) {
     console.log(message.value);
    message.value.listUserId.forEach((userId) => {
      console.log(userId);
      this.messagesGateway.server.to(userId).emit('chat',message.value);
    });
  }
}
