import React from 'react';
import { cn } from '@/utils/cn';
import { DocumentStatus, WorkspaceRole, SubscriptionPlanId } from '@/types';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  status?: DocumentStatus;
  role?: WorkspaceRole;
  plan?: SubscriptionPlanId;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant,
  status,
  role,
  plan,
  size = 'md',
  className,
}) => {
  let computedVariant = variant || 'default';
  let label = children;

  if (status) {
    switch (status) {
      case 'indexed':
        computedVariant = 'success';
        label = label || 'Indexed';
        break;
      case 'uploading':
      case 'uploaded':
      case 'queued':
        computedVariant = 'info';
        label = label || (status.charAt(0).toUpperCase() + status.slice(1));
        break;
      case 'extracting':
      case 'chunking':
      case 'embedding':
        computedVariant = 'warning';
        label = label || (status.charAt(0).toUpperCase() + status.slice(1));
        break;
      case 'failed':
        computedVariant = 'danger';
        label = label || 'Failed';
        break;
    }
  } else if (role) {
    switch (role) {
      case 'owner':
        computedVariant = 'purple';
        label = label || 'Owner';
        break;
      case 'admin':
        computedVariant = 'info';
        label = label || 'Admin';
        break;
      case 'editor':
        computedVariant = 'success';
        label = label || 'Editor';
        break;
      case 'viewer':
        computedVariant = 'default';
        label = label || 'Viewer';
        break;
    }
  } else if (plan) {
    switch (plan) {
      case 'free':
        computedVariant = 'default';
        label = label || 'Free';
        break;
      case 'pro':
        computedVariant = 'purple';
        label = label || 'Pro';
        break;
      case 'business':
        computedVariant = 'success';
        label = label || 'Business';
        break;
    }
  }

  const variantStyles = {
    default: 'bg-[#F0F2F7] dark:bg-[#1E2330] text-[#777D8A] dark:text-[#9BA1B0] border-[#E2E5EE] dark:border-[#2A3144]',
    success: 'bg-[#ECFDF5] dark:bg-[#064E3B]/30 text-[#16A36A] dark:text-[#34D399] border-[#A7F3D0] dark:border-[#065F46]',
    warning: 'bg-[#FFFBEB] dark:bg-[#78350F]/30 text-[#D97706] dark:text-[#FBBF24] border-[#FDE68A] dark:border-[#92400E]',
    danger: 'bg-[#FEF2F2] dark:bg-[#7F1D1D]/30 text-[#E05252] dark:text-[#F87171] border-[#FECACA] dark:border-[#991B1B]',
    info: 'bg-[#EFF6FF] dark:bg-[#1E3A8A]/30 text-[#2563EB] dark:text-[#60A5FA] border-[#BFDBFE] dark:border-[#1E40AF]',
    purple: 'bg-[#F0EDFF] dark:bg-[#312E81]/30 text-[#6857E8] dark:text-[#A78BFA] border-[#DDD6FE] dark:border-[#4C1D95]',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 rounded-md font-medium tracking-wide',
    md: 'text-xs px-2.5 py-1 rounded-lg font-medium tracking-wide',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 border leading-none transition-colors select-none font-medium',
        variantStyles[computedVariant],
        sizes[size],
        className
      )}
    >
      {label}
    </span>
  );
};

