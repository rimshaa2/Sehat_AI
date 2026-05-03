const { Notification, User } = require("../models");

// Helper to get dbUser
const getAuthenticatedDbUser = async (req) => {
  if (req.dbUser) return req.dbUser;
  if (!req.user?.uid) return null;
  return User.findOne({ where: { firebase_uid: req.user.uid } });
};

// Get all notifications for the authenticated user
exports.getUserNotifications = async (req, res) => {
  try {
    const dbUser = await getAuthenticatedDbUser(req);
    if (!dbUser) return res.status(401).json({ error: "Unauthorized user" });
    
    const userId = dbUser.id;

    const notifications = await Notification.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });

    res.json(notifications);
  } catch (error) {
    console.error("Fetch Notifications Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Mark a notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const dbUser = await getAuthenticatedDbUser(req);
    if (!dbUser) return res.status(401).json({ error: "Unauthorized user" });
    
    const userId = dbUser.id;

    const notification = await Notification.findOne({
      where: { id, userId },
    });

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const dbUser = await getAuthenticatedDbUser(req);
    if (!dbUser) return res.status(401).json({ error: "Unauthorized user" });
    
    const userId = dbUser.id;

    await Notification.update(
      { isRead: true },
      { where: { userId, isRead: false } }
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
