import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { Notification } from '../models/Notification.ts';

export async function getNotifications(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!._id;
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(30);
    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    return res.status(200).json({ success: true, notifications, unreadCount });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function markNotificationAsRead(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!._id;
    const { id } = req.params;

    const notif = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true },
      { new: true }
    );

    return res.status(200).json({ success: true, notification: notif });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function markAllNotificationsAsRead(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!._id;
    await Notification.updateMany({ userId, isRead: false }, { isRead: true });
    return res.status(200).json({ success: true, message: 'All notifications marked as read.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
