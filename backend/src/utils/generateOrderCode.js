import crypto from 'crypto';

const randomPart = (bytes = 5) => crypto.randomBytes(bytes).toString('hex').toUpperCase();

export const generateOrderCode = () => `ORD-${Date.now().toString(36).toUpperCase()}-${randomPart(3)}`;
export const generateRestaurantCode = (name = 'restaurant') => {
  const prefix = String(name || 'restaurant')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 12) || 'REST';
  return `${prefix}-${randomPart(4)}`;
};
