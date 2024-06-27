import Bottleneck from 'bottleneck';

export const rateLimiter = new Bottleneck({
  reservoir: 100,
  reservoirRefreshAmount: 100,
  reservoirRefreshInterval: 60 * 1000,
  maxConcurrent: 5,
  minTime: 33,
  highWater: 300,
  strategy: Bottleneck.strategy.OVERFLOW,
  retryCount: 3,
  retryOptions: { backoffBase: 400 },
});