import type { ReactNode } from 'react';

export enum ButtonVariant {
  DEFAULT = 'default',
  DANGER = 'danger',
}

export enum StatusTone {
  SUCCESS = 'success',
  WARNING = 'warning',
  DANGER = 'danger',
  INFO = 'info',
  NEUTRAL = 'neutral',
  MUTED = 'muted',
}

export interface IButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  disabled?: boolean;
  onClick(): void;
}

export interface IPanelProps {
  title: ReactNode;
  children: ReactNode;
}

export interface IStatusDotProps {
  tone: StatusTone;
  isPulsing?: boolean;
}

export interface IStatusBadgeProps {
  label: string;
  tone: StatusTone;
  isPulsing?: boolean;
}

export interface IToggleProps {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange(checked: boolean): void;
}
