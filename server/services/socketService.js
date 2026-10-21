let Server = null;
try {
  const socketModule = require('socket.io');
  Server = socketModule.Server || socketModule;
} catch (e) {
  // Gracefully fallback in environments without socket.io (e.g. serverless functions)
}
const jwt = require('jsonwebtoken');

let io = null;

/**
 * Initialize Socket.IO with HTTP Server
 */
const initSocket = (httpServer) => {
  if (!Server || !httpServer) return null;
  const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    process.env.CLIENT_URL
  ].filter(Boolean);

  try {
    io = new Server(httpServer, {
    cors: {
      origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          callback(null, true); // Permissive for local dev & production
        }
      },
      credentials: true,
      methods: ['GET', 'POST']
    },
    pingTimeout: 60000
  });

  // Authentication Middleware for WebSocket Connections
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(' ')[1];

      if (token) {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || 'casa_super_secret_jwt_key_2026_dev_secure'
        );
        socket.user = decoded;
      }
      // Allow unauthenticated connection for public tracking pages, but tag as guest
      return next();
    } catch (err) {
      console.warn('Socket authentication warning (continuing as guest):', err.message);
      return next();
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;

    if (user && user.id) {
      // Join user's private channel
      socket.join(`user_${user.id}`);

      // Join role channel
      if (user.role) {
        socket.join(`role_${user.role}`);
        if (user.role === 'vendor') {
          socket.join(`role_vendor_${user.id}`);
        }
      }
    }

    // Join specific order room for real-time milestone updates
    socket.on('join_order', (orderId) => {
      if (orderId) {
        socket.join(`order_${orderId}`);
      }
    });

    // Leave order room
    socket.on('leave_order', (orderId) => {
      if (orderId) {
        socket.leave(`order_${orderId}`);
      }
    });

    socket.on('disconnect', () => {
      // Disconnection cleanup handled automatically by Socket.io
    });
  });
  } catch (err) {
    console.warn('[Socket.IO Initialization Warning]:', err.message);
  }

  return io;
};

/**
 * Get Socket.IO instance
 */
const getIO = () => {
  return io;
};

/**
 * Emit real-time notification to user
 */
const emitNotification = (notification) => {
  if (!io) return;
  try {
    if (notification.recipient) {
      io.to(`user_${notification.recipient}`).emit('notification', notification);
    }
    if (notification.recipientRole) {
      io.to(`role_${notification.recipientRole}`).emit('role_notification', notification);
    }
  } catch (err) {
    console.error('Socket notification emit error:', err.message);
  }
};

/**
 * Emit New Order Alert to Admin & Vendors
 */
const emitNewOrder = (order) => {
  if (!io) return;
  try {
    io.to('role_admin').emit('new_order', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      totalPrice: order.totalPrice,
      createdAt: order.createdAt
    });

    // Notify respective vendors for items in order
    if (order.items && order.items.length > 0) {
      const vendorIds = new Set(order.items.map(item => item.vendor?.toString()).filter(Boolean));
      vendorIds.forEach(vendorId => {
        io.to(`role_vendor_${vendorId}`).emit('vendor_new_order', {
          orderId: order._id,
          orderNumber: order.orderNumber,
          createdAt: order.createdAt
        });
      });
    }
  } catch (err) {
    console.error('Socket new_order emit error:', err.message);
  }
};

/**
 * Emit Order Lifecycle Status Update
 */
const emitOrderStatusUpdate = (order) => {
  if (!io) return;
  try {
    const payload = {
      orderId: order._id,
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      updatedAt: new Date()
    };

    // Emit to customer
    if (order.user) {
      io.to(`user_${order.user}`).emit('order_status_update', payload);
    }
    // Emit to order room (tracking page)
    io.to(`order_${order._id}`).emit('order_status_update', payload);
    // Emit to admin channel
    io.to('role_admin').emit('admin_order_update', payload);
  } catch (err) {
    console.error('Socket order_status_update emit error:', err.message);
  }
};

/**
 * Emit Delivery Task Assignment
 */
const emitDeliveryTaskAssigned = (order, partnerId) => {
  if (!io) return;
  try {
    const payload = {
      orderId: order._id,
      orderNumber: order.orderNumber,
      shippingAddress: order.shippingAddress,
      totalPrice: order.totalPrice,
      paymentMethod: order.paymentMethod,
      orderStatus: order.orderStatus
    };

    if (partnerId) {
      io.to(`user_${partnerId}`).emit('delivery_task_assigned', payload);
    }
    io.to('role_delivery').emit('delivery_pool_update', payload);
  } catch (err) {
    console.error('Socket delivery_task_assigned emit error:', err.message);
  }
};

/**
 * Emit Truthful Delivery Milestone Scan
 */
const emitDeliveryMilestone = (order, milestone) => {
  if (!io) return;
  try {
    const payload = {
      orderId: order._id,
      orderNumber: order.orderNumber,
      status: milestone.status,
      note: milestone.note,
      location: milestone.location || 'Central Transit Hub',
      timestamp: new Date()
    };

    if (order.user) {
      io.to(`user_${order.user}`).emit('delivery_milestone', payload);
    }
    io.to(`order_${order._id}`).emit('delivery_milestone', payload);
  } catch (err) {
    console.error('Socket delivery_milestone emit error:', err.message);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitNotification,
  emitNewOrder,
  emitOrderStatusUpdate,
  emitDeliveryTaskAssigned,
  emitDeliveryMilestone
};
