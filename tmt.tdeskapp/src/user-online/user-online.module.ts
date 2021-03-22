import { CacheModule, Module } from '@nestjs/common';
import { UserOnlineService } from './user-online.service';
import * as redisStore from 'cache-manager-redis-store';


@Module({
  providers: [UserOnlineService],
  imports: [
    CacheModule.register({
        store: redisStore,
        host: 'localhost',
        port: 6379
    }),
  ],
  exports: [UserOnlineService]
})
export class UserOnlineModule {}
