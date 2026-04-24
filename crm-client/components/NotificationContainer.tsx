'use client';

import { useEffect } from 'react';
import { HiCheckCircle, HiXCircle, HiExclamation, HiInformationCircle, HiX } from 'react-icons/hi';
import { useNotification, Notification } from '@/contexts/NotificationContext';

const notificationStyles = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-500',
    text: 'text-green-800',
    icon: 'text-green-500',
    Icon: HiCheckCircle,
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-500',
    text: 'text-red-800',
    icon: 'text-red-500',
    Icon: HiXCircle,
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-500',
    text: 'text-yellow-800',
    icon: 'text-yellow-500',
    Icon: HiExclamation,
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-500',
    text: 'text-blue-800',
    icon: 'text-blue-500',
    Icon: HiInformationCircle,
  },
};

function NotificationItem({ notification }: { notification: Notification }) {
  const { removeNotification } = useNotification();
  const style = notificationStyles[notification.type];
  const Icon = style.Icon;

  useEffect(() => {
    if (notification.duration && notification.duration > 0) {
      const timer = setTimeout(() => {
        removeNotification(notification.id);
      }, notification.duration);

      return () => clearTimeout(timer);
    }
  }, [notification, removeNotification]);

  return (
    <div
      className={`${style.bg} ${style.border} border-l-4 rounded-lg shadow-lg p-4 mb-3 flex items-start gap-3 animate-slide-in-right max-w-md w-full`}
    >
      <Icon className={`h-6 w-6 ${style.icon} shrink-0 mt-0.5`} />
      <p className={`${style.text} flex-1 text-sm font-medium`}>{notification.message}</p>
      <button
        onClick={() => removeNotification(notification.id)}
        className={`${style.icon} hover:opacity-70 transition shrink-0`}
        aria-label="Fechar"
      >
        <HiX className="h-5 w-5" />
      </button>
    </div>
  );
}

export default function NotificationContainer() {
  const { notifications } = useNotification();

  return (
    <div className="fixed top-4 right-4 z-9999 flex flex-col items-end pointer-events-none">
      <div className="pointer-events-auto space-y-2">
        {notifications.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
      </div>
    </div>
  );
}
