import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsRowProps {
  label: string;
  description?: string;
  value?: string;
  onClick?: () => void;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
}

export function SettingsRow({ label, description, value, onClick, toggle, toggleValue, onToggle }: SettingsRowProps) {
  return (
    <button
      onClick={toggle ? () => onToggle?.(!toggleValue) : onClick}
      className="w-full p-4 flex items-center justify-between tap-target touch-feedback"
    >
      <div className="text-left">
        <span className="font-medium">{label}</span>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      {toggle ? (
        <div
          className={cn(
            'w-12 h-7 rounded-full relative transition-colors flex-shrink-0',
            toggleValue ? 'bg-primary' : 'bg-muted'
          )}
        >
          <div
            className={cn(
              'absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform',
              toggleValue ? 'translate-x-6' : 'translate-x-1'
            )}
          />
        </div>
      ) : (
        <div className="flex items-center gap-2 text-muted-foreground flex-shrink-0">
          {value && <span className="text-sm">{value}</span>}
          <ChevronRight className="h-5 w-5" />
        </div>
      )}
    </button>
  );
}
