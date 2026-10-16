import React, { useEffect, useState } from 'react';
import { api, getErrorMessage } from '../services/api.ts';
import { NotificationItem } from '../types/index.ts';
import { Bell, CheckCheck, X, FileText, CheckCircle2, ShieldAlert, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const { setUnreadNotifications } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications);
        setUnreadNotifications(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleMarkAsRead = async (id: string, link?: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadNotifications((prev) => Math.max(0, prev - 1));
      if (link) {
        onClose();
        onNavigate(link);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadNotifications(0);
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'contract':
      case 'application':
        return <FileText className="w-4 h-4 text-emerald-700" />;
      case 'verification':
        return <CheckCircle2 className="w-4 h-4 text-sky-700" />;
      case 'payment':
        return <CreditCard className="w-4 h-4 text-amber-700" />;
      default:
        return <ShieldAlert className="w-4 h-4 text-neutral-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-900" />
            <h3 className="font-heading text-base font-bold text-neutral-900">Notifications</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-emerald-800 hover:text-emerald-950 font-medium flex items-center gap-1 hover:underline"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="max-h-[60vh] overflow-y-auto divide-y divide-neutral-100">
          {loading ? (
            <div className="p-8 text-center text-xs text-neutral-500">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <Bell className="w-8 h-8 text-neutral-300 mx-auto" />
              <p className="text-sm font-medium text-neutral-700">No notifications yet</p>
              <p className="text-xs text-neutral-500">
                You'll receive updates on contracts, applications, reviews, and settlements here.
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif._id}
                onClick={() => handleMarkAsRead(notif._id, notif.link)}
                className={`p-4 transition-colors cursor-pointer flex gap-3.5 ${
                  notif.isRead ? 'bg-white hover:bg-neutral-50' : 'bg-emerald-50/40 hover:bg-emerald-50/70'
                }`}
              >
                <div className="p-2 rounded-lg bg-neutral-100 shrink-0 self-start">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-xs font-semibold ${notif.isRead ? 'text-neutral-900' : 'text-emerald-950'}`}>
                      {notif.title}
                    </p>
                    <span className="text-[10px] text-neutral-400 tabular-nums shrink-0">
                      {new Date(notif.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 mt-1 leading-relaxed">{notif.message}</p>
                  {notif.link && (
                    <span className="inline-block mt-2 text-[11px] font-semibold text-emerald-800 hover:underline">
                      View details →
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-neutral-50 border-t border-neutral-100 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
