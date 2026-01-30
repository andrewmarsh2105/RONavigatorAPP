import { ReactNode } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingActionButtonProps {
  onClick: () => void;
  icon?: ReactNode;
  label?: string;
  className?: string;
}

export function FloatingActionButton({ 
  onClick, 
  icon = <Plus className="h-6 w-6" />, 
  label,
  className 
}: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        label ? 'fab-extended' : 'fab',
        'touch-feedback active:scale-95 transition-transform',
        className
      )}
    >
      {icon}
      {label && <span>{label}</span>}
    </button>
  );
}
