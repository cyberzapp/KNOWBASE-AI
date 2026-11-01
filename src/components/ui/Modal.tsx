import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
  showCloseButton = true,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-[#0E1117]/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'relative w-full bg-white dark:bg-[#161A23] rounded-2xl border border-[#E9EAF0] dark:border-[#232838] shadow-2xl overflow-hidden z-10 my-8',
              maxWidths[maxWidth]
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {(title || showCloseButton) && (
              <div className="flex items-start justify-between p-5 border-b border-[#E9EAF0] dark:border-[#232838]">
                <div>
                  {title && <h3 className="text-lg font-bold text-[#171923] dark:text-white">{title}</h3>}
                  {description && <p className="text-xs text-[#777D8A] dark:text-[#9BA1B0] mt-1">{description}</p>}
                </div>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg text-[#777D8A] hover:text-[#171923] dark:hover:text-white hover:bg-[#F0F2F7] dark:hover:bg-[#232838] transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}
            <div className="p-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

