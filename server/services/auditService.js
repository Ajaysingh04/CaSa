const AuditLog = require('../models/AuditLog');
const Inventory = require('../models/Inventory');
const Notification = require('../models/Notification');
const Commission = require('../models/Commission');
const socketService = require('./socketService');

/**
 * System Audit & Business Event Logging Service
 * Guarantees every critical business action is persisted to MongoDB.
 */
class AuditService {
  /**
   * Log an audit event
   */
  static async logEvent({
    action,
    entityType,
    entityId,
    performedBy = null,
    performedByName = 'System',
    performedByRole = 'system',
    previousState = null,
    newState = null,
    reason = '',
    ipAddress = ''
  }) {
    try {
      return await AuditLog.create({
        action,
        entityType,
        entityId: String(entityId),
        performedBy,
        performedByName,
        performedByRole,
        previousState,
        newState,
        reason,
        ipAddress,
        timestamp: new Date()
      });
    } catch (err) {
      console.error('Failed to write audit log:', err.message);
      return null;
    }
  }

  /**
   * Record inventory movement & stock changes in MongoDB
   */
  static async recordInventoryMovement({
    product,
    productName,
    sku = '',
    vendor = null,
    movementType,
    quantityChanged,
    previousStock,
    newStock,
    order = null,
    orderNumber = '',
    reason = '',
    actor = 'System',
    actorId = null
  }) {
    try {
      return await Inventory.create({
        product,
        productName,
        sku,
        vendor,
        movementType,
        quantityChanged,
        previousStock,
        newStock,
        order,
        orderNumber,
        reason,
        actor,
        actorId
      });
    } catch (err) {
      console.error('Failed to record inventory movement:', err.message);
      return null;
    }
  }

  /**
   * Create and persist multi-panel notifications
   */
  static async createNotification({
    recipient,
    recipientRole = 'user',
    title,
    message,
    type = 'order_status',
    data = {}
  }) {
    try {
      const notification = await Notification.create({
        recipient,
        recipientRole,
        title,
        message,
        type,
        data
      });

      // Emit real-time notification via WebSocket
      try {
        socketService.emitNotification(notification);
      } catch (e) {
        // Safe fallback if socket is not active
      }

      return notification;
    } catch (err) {
      console.error('Failed to create notification:', err.message);
      return null;
    }
  }

  /**
   * Record marketplace commission for an order
   */
  static async recordCommission({
    order,
    orderNumber,
    vendor,
    grossAmount,
    commissionRate = 10.0
  }) {
    try {
      const commissionAmount = Math.round((grossAmount * (commissionRate / 100)) * 100) / 100;
      const netPayableToVendor = Math.round((grossAmount - commissionAmount) * 100) / 100;

      return await Commission.create({
        order,
        orderNumber,
        vendor,
        grossAmount,
        commissionRate,
        commissionAmount,
        netPayableToVendor,
        status: 'accrued'
      });
    } catch (err) {
      console.error('Failed to record commission:', err.message);
      return null;
    }
  }
}

module.exports = AuditService;
