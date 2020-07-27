import { DEFAULT_POLL_INTERVAL, MAX_POLL_INTERVAL, RouterPolling } from '../router-polling';

describe('Router polling config', () => {
  it('should convert configured interval to seconds', () => {
    const router = new RouterPolling(null, null, 30);
    expect(router.interval).toBe(30000);
  });

  it('should adjust mis-configured interval with default value', () => {
    const router = new RouterPolling(null, null, MAX_POLL_INTERVAL + 1);
    expect(router.interval).toBe(DEFAULT_POLL_INTERVAL);
  });

  it('should use default value when no interval is specified', () => {
    const router = new RouterPolling(null, null, null);
    expect(router.interval).toBe(DEFAULT_POLL_INTERVAL);
  });
});
