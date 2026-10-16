import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { SupportRequest } from '../models/SupportRequest.ts';
import { User } from '../models/User.ts';
import { Notification } from '../models/Notification.ts';

export async function createSupportRequest(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!._id;
    const { subject, category, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Subject and message are required.',
      });
    }

    const ticket = await SupportRequest.create({
      userId,
      subject: subject.trim(),
      category: category || 'contract_inquiry',
      message: message.trim(),
      status: 'open',
    });

    // Notify admins
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await Notification.create({
        userId: admin._id,
        title: `New Support Ticket: ${subject}`,
        message: `User ${req.user!.name} (${req.user!.role}) opened a support ticket.`,
        type: 'system',
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Support request submitted. AGRIYA support team will assist you promptly.',
      ticket,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getMySupportRequests(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!._id;
    const tickets = await SupportRequest.find({ userId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, tickets });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
