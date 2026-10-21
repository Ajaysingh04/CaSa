/**
 * Central Order Lifecycle & State Machine Service
 * Enforces valid status transitions, role authorization, status history logging,
 * and multi-vendor shipment aggregations.
 */

const ORDER_STATUSES = {
  PENDING_PAYMENT: 'Pending',
  CONFIRMED: 'Confirmed',
  PROCESSING: 'Processing',
  PACKED: 'Packed',
  READY_FOR_PICKUP: 'Ready for pickup',
  PICKED_UP: 'Picked up',
  IN_TRANSIT: 'In transit',
  SHIPPED: 'Shipped',
  OUT_FOR_DELIVERY: 'Out for delivery',
  DELIVERED: 'Delivered',
  DELIVERY_FAILED: 'Delivery Attempt Failed',
  RTO_INITIATED: 'RTO - Return to Hub',
  RTO_COMPLETED: 'RTO Completed',
  CANCELLATION_REQUESTED: 'Cancellation requested',
  CANCELLED: 'Cancelled',
  RETURN_REQUESTED: 'Return requested',
  RETURN_APPROVED: 'Return approved',
  RETURN_PICKED_UP: 'Return picked up',
  RETURN_RECEIVED: 'Return received',
  REFUND_PENDING: 'Refund pending',
  REFUNDED: 'Refunded'
};

const VALID_TRANSITIONS = {
  'Pending': ['Confirmed', 'Cancelled'],
  'Confirmed': ['Processing', 'Packed', 'Cancellation requested', 'Cancelled'],
  'Processing': ['Packed', 'Ready for pickup', 'Shipped', 'Cancellation requested', 'Cancelled'],
  'Packed': ['Ready for pickup', 'Picked up', 'Shipped', 'Cancelled'],
  'Ready for pickup': ['Picked up', 'Shipped', 'Cancelled'],
  'Picked up': ['Shipped', 'In transit'],
  'Shipped': ['In transit', 'Out for delivery', 'Delivery Attempt Failed', 'RTO - Return to Hub'],
  'In transit': ['Out for delivery', 'Delivery Attempt Failed', 'RTO - Return to Hub'],
  'Out for delivery': ['Delivered', 'Delivery Attempt Failed', 'RTO - Return to Hub'],
  'Delivery Attempt Failed': ['Out for delivery', 'RTO - Return to Hub', 'Cancelled'],
  'RTO - Return to Hub': ['RTO Completed', 'Refund pending', 'Refunded'],
  'RTO Completed': ['Refund pending', 'Refunded'],
  'Delivered': ['Return requested', 'Refund pending'],
  'Return requested': ['Return approved', 'Delivered'],
  'Return approved': ['Return picked up', 'Refund pending'],
  'Return picked up': ['Return received'],
  'Return received': ['Refund pending', 'Refunded'],
  'Refund pending': ['Refunded'],
  'Cancellation requested': ['Cancelled', 'Confirmed'],
  'Cancelled': [],
  'Refunded': []
};

/**
 * Validates if transition from currentStatus to targetStatus is permitted by the state machine
 */
function canTransition(currentStatus, targetStatus) {
  if (currentStatus === targetStatus) return true;
  const allowed = VALID_TRANSITIONS[currentStatus];
  return Array.isArray(allowed) && allowed.includes(targetStatus);
}

/**
 * Validates if actor role has authorization to trigger the target status
 */
function isAuthorizedForTransition(role, targetStatus) {
  if (role === 'admin') return true; // Admin has supervisory authority
  if (role === 'user') {
    return ['Cancelled', 'Cancellation requested', 'Return requested'].includes(targetStatus);
  }
  if (role === 'vendor') {
    return ['Processing', 'Packed', 'Ready for pickup', 'Shipped'].includes(targetStatus);
  }
  if (role === 'delivery') {
    return [
      'Picked up',
      'Shipped',
      'In transit',
      'Out for delivery',
      'Delivered',
      'Delivery Attempt Failed',
      'RTO - Return to Hub'
    ].includes(targetStatus);
  }
  return false;
}

/**
 * Central method to apply a status transition to an order document
 */
function applyStatusTransition(order, targetStatus, actorName = 'System', actorRole = 'system', note = '', reason = '') {
  if (!canTransition(order.orderStatus, targetStatus) && actorRole !== 'admin') {
    throw new Error(`Invalid status transition from '${order.orderStatus}' to '${targetStatus}'.`);
  }

  if (!isAuthorizedForTransition(actorRole, targetStatus)) {
    throw new Error(`Role '${actorRole}' is not authorized to set order status to '${targetStatus}'.`);
  }

  const previousStatus = order.orderStatus;
  order.orderStatus = targetStatus;

  // Set timestamps for key milestones
  const now = new Date();
  if (targetStatus === 'Delivered') {
    order.deliveredAt = now;
    if (order.paymentMethod === 'cod') {
      order.paymentStatus = 'paid';
      order.paymentDetails = { paidAt: now };
    }
  } else if (targetStatus === 'Picked up' || targetStatus === 'Shipped') {
    if (!order.pickupConfirmedAt) {
      order.pickupConfirmedAt = now;
    }
  } else if (targetStatus === 'Cancelled') {
    order.cancellationReason = reason || note || 'Order cancelled';
  } else if (targetStatus === 'Delivery Attempt Failed') {
    order.failedAttemptReason = reason || note || 'Customer unreachable / premises locked';
    order.reattemptDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
  } else if (targetStatus === 'Return requested') {
    order.returnReason = reason || note || 'Return requested by customer';
    order.refundStatus = 'initiated';
  } else if (targetStatus === 'Refunded') {
    order.refundStatus = 'refunded';
    order.paymentStatus = 'refunded';
  }

  // Record audit history entry
  order.statusHistory = order.statusHistory || [];
  order.statusHistory.push({
    fromStatus: previousStatus,
    status: targetStatus,
    timestamp: now,
    note: note || `Status updated to ${targetStatus}`,
    updatedBy: `${actorName} (${actorRole})`,
    reason: reason || ''
  });

  return order;
}

/**
 * Handles multi-vendor / partial shipments.
 * When individual item shipment statuses are updated, computes the root order status.
 */
function recalculateMultiVendorOrderStatus(order) {
  if (!order.items || order.items.length === 0) return order.orderStatus;

  const statuses = order.items.map(i => i.shipmentStatus || 'Confirmed');

  // If all items delivered -> root order is Delivered
  if (statuses.every(s => s === 'Delivered')) {
    return 'Delivered';
  }

  // If all items cancelled -> root order is Cancelled
  if (statuses.every(s => s === 'Cancelled')) {
    return 'Cancelled';
  }

  // If any item is Out for delivery
  if (statuses.some(s => s === 'Out for delivery')) {
    return 'Out for delivery';
  }

  // If any item is Shipped or In transit
  if (statuses.some(s => ['Shipped', 'In transit', 'Picked up'].includes(s))) {
    return 'Shipped';
  }

  // If any item is Packed
  if (statuses.some(s => ['Packed', 'Ready for pickup'].includes(s))) {
    return 'Packed';
  }

  // If any item is Processing
  if (statuses.some(s => s === 'Processing')) {
    return 'Processing';
  }

  return order.orderStatus;
}

module.exports = {
  ORDER_STATUSES,
  VALID_TRANSITIONS,
  canTransition,
  isAuthorizedForTransition,
  applyStatusTransition,
  recalculateMultiVendorOrderStatus
};
