export { default } from '../../server/contact.mjs';
export const config = {
  path: '/api/contact',
  rateLimit: { windowLimit: 5, windowSize: 60, aggregateBy: ['ip', 'domain'], action: 'rate_limit' }
};
