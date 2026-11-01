import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  FileText, 
  FolderTree, 
  MessageSquare, 
  UserPlus, 
  Settings, 
  Filter,
  Clock
} from 'lucide-react';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import { formatDate } from '@/utils/formatters';

export const ActivityPage: React.FC = () => {
  const { activities, fetchActivities } = useWorkspaceStore();
  const [filterAction, setFilterAction] = useState<string>('all');

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const filtered = activities.filter(a => {
    if (filterAction === 'all') return true;
    return a.action.includes(filterAction);
  });

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#171923] dark:text-white tracking-tight">
            Workspace Activity & Audit Trail
          </h1>
          <p className="text-sm text-[#777D8A] dark:text-[#9BA1B0] mt-1">
            Complete chronology of document ingestions, AI research queries, and team actions.
          </p>
        </div>

        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="text-xs font-semibold bg-white dark:bg-[#161A23] rounded-xl border border-[#E9EAF0] dark:border-[#232838] px-3 py-2 text-[#171923] dark:text-[#E2E8F0] focus:outline-none focus:border-[#6857E8]"
        >
          <option value="all">All Activities ({activities.length})</option>
          <option value="document">Document Operations</option>
          <option value="chat">AI Queries</option>
          <option value="member">Team & Permissions</option>
        </select>
      </div>

      <div className="bg-white dark:bg-[#161A23] rounded-2xl border border-[#E9EAF0] dark:border-[#232838] p-6 shadow-xs">
        <div className="relative border-l-2 border-[#E9EAF0] dark:border-[#232838] ml-4 space-y-6">
          {filtered.map((item) => (
            <div key={item.id} className="relative pl-6 group">
              {/* Dot */}
              <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-white dark:bg-[#161A23] border-2 border-[#6857E8] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#6857E8]" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#171923] dark:text-white">
                    {item.userName}
                  </span>
                  <span className="text-[11px] text-[#777D8A]">
                    {formatDate(item.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-[#171923] dark:text-[#E2E8F0] mt-1 leading-relaxed">
                  {item.details}
                </p>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <p className="text-xs text-[#777D8A] py-8 pl-4">
              No matching activity events found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

