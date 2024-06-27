import axios from 'axios';
import { cacheService } from './cacheService';
import { rateLimiter } from '../utils/rateLimiter';

export class DislikeService {
  private dailyRequestCount = 0;
  private readonly DAILY_LIMIT = 10000;

  constructor() {
    setInterval(() => {
      this.dailyRequestCount = 0;
    }, 24 * 60 * 60 * 1000);
  }

  async getDislikesForVideo(videoId: string): Promise<number> {
    const cacheKey = `dislikes_${videoId}`;
    const cachedDislikes = cacheService.get<number>(cacheKey);
    if (cachedDislikes !== undefined) {
      return cachedDislikes;
    }

    if (this.dailyRequestCount >= this.DAILY_LIMIT) {
      console.log('Daily limit reached for dislike API');
      return 0;
    }

    try {
      const response = await rateLimiter.schedule(async () => {
        this.dailyRequestCount++;
        return axios.get(`https://returnyoutubedislikeapi.com/Votes?videoId=${videoId}`);
      });

      const dislikes = response.data.dislikes;
      cacheService.set(cacheKey, dislikes);
      return dislikes;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        console.log(`Rate limit hit for video ${videoId}, retrying...`);
        throw error;
      }
      console.log(`Could not fetch dislikes for video ${videoId}: ${error}`);
      return 0;
    }
  }
}

export const dislikeService = new DislikeService();