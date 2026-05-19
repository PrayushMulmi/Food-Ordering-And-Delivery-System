export const BASKET_UPDATED_EVENT = 'basket:updated';

export function notifyBasketChanged() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(BASKET_UPDATED_EVENT));
}
