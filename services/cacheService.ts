import NodeCache from 'node-cache';
import { config } from '../config/config';

class CacheService {
  private cache: NodeCache;

  constructor() {
    this.cache = new NodeCache({ stdTTL: config.defaultCacheTTL });
  }

  get<T>(key: string): T | undefined {
    return this.cache.get<T>(key);
  }

  set<T>(key: string, value: T, ttl: string | number = 0): void {
    this.cache.set(key, value, ttl);
  }
}

export const cacheService = new CacheService();