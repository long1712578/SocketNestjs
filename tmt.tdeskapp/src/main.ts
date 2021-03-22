import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['192.168.1.173:9092'],
      },
      consumer: {
        groupId: 'Message',
      }
    }
  });
  await app.startAllMicroservicesAsync();
  await app.listen(3000);
}
bootstrap();
