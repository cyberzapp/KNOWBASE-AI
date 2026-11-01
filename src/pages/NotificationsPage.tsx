import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  CheckCheck, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/utils/formatters';

export const NotificationsPage: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    notifications, 
    fetchNotifications, 
    markNotificationRead, 
    markAllNotificationsRead 
  } = useWorkspaceStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchNotifications(user.id);
    }
  }, [user, fetchNotifications]);

  const icons = {
    info: <Info className="w-5 h-5 text-[#6857E8] shrink-0" />,
    success: <CheckCircle2 className="w-5 h-5 text-[#16A36A] shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-[#E9A23B] shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-[#E05252] shrink-0" />,
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6 text-left">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#171923] dark:text-white tracking-tight">
            Notifications
          </h1>
          <p className="text-sm text-[#777D8A] dark:text-[#9BA1B0] mt-1">
            System updates, document indexing statuses, and team activity notices.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          leftIcon={<CheckCheck className="w-4 h-4" />}
          onClick={markAllNotificationsRead}
        >
          Mark all as read
        </Button>
      </div>

      <div className="bg-white dark:bg-[#161A23] rounded-2xl border border-[#E9EAF0] dark:border-[#232838] divide-y divide-[#E9EAF0] dark:divide-[#232838] overflow-hidden shadow-xs">
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => {
              markNotificationRead(n.id);
              if (n.link) navigate(n.link);
            }}
            className={`p-4 flex items-start gap-4 transition-colors cursor-pointer ${
              !n.isRead 
                ? 'bg-[#F0EDFF]/30 dark:bg-[#201C3E]/40' 
                : 'hover:bg-[#F8F9FC] dark:hover:bg-[#1C202C]'
            }`}
          >
            {icons[n.type]}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-[#171923] dark:text-white">
                  {n.title}
                </p>
                <span className="text-[10px] text-[#777D8A]">
                  {formatDate(n.createdAt)}
                </span>
              </div>
              <p className="text-xs text-[#777D8A] dark:text-[#9BA1B0] mt-1 leading-relaxed">
                {n.message}
              </p>
            </div>
            {!n.isRead && (
              <span className="w-2 h-2 rounded-full bg-[#6857E8] mt-1 shrink-0" />
            )}
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="py-16 text-center text-[#777D8A]">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-30 text-[#6857E8]" />
            <p className="text-xs font-medium">You are all caught up</p>
          </div>
        )}
      </div>
    </div>
  );
};

