import { Injectable, Inject, CACHE_MANAGER } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class UserOnlineService {
    constructor(
        @Inject(CACHE_MANAGER) private readonly cache: Cache,
    ) {}
    
    get(key) {
       this.cache.get(key);
    }
    
    set(key, value) {
        this.cache.set(key, value);
    }
}
