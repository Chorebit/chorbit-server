import { resolvers } from '../index';

describe('Query._health', () => {
  it('returns "ok"', () => {
    const result = resolvers.Query._health();
    expect(result).toBe('ok');
  });
});
