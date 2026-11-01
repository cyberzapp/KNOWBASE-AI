import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (options: { title: string; description?: string; type?: ToastType; duration?: number }) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(({ title, description, type = 'info', duration = 4000 }: {
    title: string;
    description?: string;
    type?: ToastType;
    duration?: number;
  }) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const success = (title: string, description?: string) => toast({ title, description, type: 'success' });
  const error = (title: string, description?: string) => toast({ title, description, type: 'error' });
  const info = (title: string, description?: string) => toast({ title, description, type: 'info' });

  return (
    <ToastContext.Provider value={{ toast, success, error, info }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => {
            const icons = {
              success: <CheckCircle2 className="w-5 h-5 text-[#16A36A] shrink-0" />,
              error: <AlertCircle className="w-5 h-5 text-[#E05252] shrink-0" />,
              warning: <AlertTriangle className="w-5 h-5 text-[#E9A23B] shrink-0" />,
              info: <Info className="w-5 h-5 text-[#6857E8] shrink-0" />,
            };

            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                className={cn(
                  'pointer-events-auto flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-[#161A23] border border-[#E9EAF0] dark:border-[#232838] shadow-lg shadow-black/5 text-[#171923] dark:text-[#F0F2F5]'
                )}
              >
                {icons[t.type]}
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-semibold">{t.title}</p>
                  {t.description && (
                    <p className="text-xs text-[#777D8A] dark:text-[#9BA1B0] mt-0.5 leading-relaxed">
                      {t.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => removeToast(t.id)}
                  className="text-[#777D8A] hover:text-[#171923] dark:hover:text-white p-1 rounded-md transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

