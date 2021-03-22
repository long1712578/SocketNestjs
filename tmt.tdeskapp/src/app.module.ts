import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { MessagesGateway } from './messages.gateway';
import { UserOnlineModule } from './user-online/user-online.module';

@Module({
  imports: [ConfigModule.forRoot(), UserOnlineModule],
  controllers: [AppController],
  providers: [MessagesGateway],
})
export class AppModule {}
