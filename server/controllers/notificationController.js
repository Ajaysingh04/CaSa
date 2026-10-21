const Notification = require('../models/Notification');
const { getDBStatus } = require('../config/db');

// @desc    Get user's notifications with pagination & unread count
// @route   GET /api/notifications
// @access  Private
exports.getMyNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, unreadOnly } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (getDBStatus()) {
      const query = {
        $or: [
          { recipient: userId },
          { recipientRole: req.user.role }
        ]
      };

      if (unreadOnly === 'true') {
        query.isRead = false;
      }

      const total = await Notification.countDocuments(query);
      const unreadCount = await Notification.countDocuments({
        $or: [{ recipient: userId }, { recipientRole: req.user.role }],
        isRead: false
      });

      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum);

      return res.status(200).json({
        success: true,
        count: notifications.length,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1,
        unreadCount,
        data: notifications
      });
    } else {
      return res.status(200).json({
        success: true,
        count: 0,
        total: 0,
        page: 1,
        pages: 1,
        unreadCount: 0,
        data: []
      });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Mark single notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (getDBStatus()) {
      const notification = await Notification.findById(id);
      if (!notification) {
        return res.status(404).json({ success: false, message: 'Notification not found' });
      }

      // Protect against unauthorized object access
      if (
        notification.recipient &&
        notification.recipient.toString() !== userId.toString() &&
        req.user.role !== 'admin'
      ) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to modify this notification'
        });
      }

      notification.isRead = true;
      notification.readAt = new Date();
      await notification.save();

      return res.status(200).json({ success: true, data: notification });
    } else {
      return res.status(200).json({ success: true, message: 'Notification marked as read' });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Mark all user's notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllNotificationsRead = async (req, res, next) => {
  try {
    const userId = req.user._id;

    if (getDBStatus()) {
      await Notification.updateMany(
        { recipient: userId, isRead: false },
        { isRead: true, readAt: new Date() }
      );

      return res.status(200).json({
        success: true,
        message: 'All notifications marked as read'
      });
    } else {
      return res.status(200).json({
        success: true,
        message: 'All notifications marked as read'
      });
    }
  } catch (err) {
    next(err);
  }
};
