export const ORDER_STATUS = {
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    PREPARING: "Preparing",
    READY_FOR_DISPATCH: "Ready for Dispatch",
    OUT_FOR_DELIVERY: "Out for Delivery",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
    REFUNDED: "Refunded",
  };
  
  export const ORDER_FLOW = [
    ORDER_STATUS.PENDING,
    ORDER_STATUS.CONFIRMED,
    ORDER_STATUS.PREPARING,
    ORDER_STATUS.READY_FOR_DISPATCH,
    ORDER_STATUS.OUT_FOR_DELIVERY,
    ORDER_STATUS.DELIVERED,
  ];
  