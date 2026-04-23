export const generateOrderCode = () => {
    const now = Date.now().toString();
    const random = Math.floor(Math.random() * 9000 + 1000);
    return `ORD-${now.slice(-6)}-${random}`;
  };
  