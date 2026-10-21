const express = require('express');
const router = express.Router();
const {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getMyNotifications);
router.put('/read-all', markAllNotificationsRead);
router.put('/:id/read', markNotificationRead);

module.exports = router;
