import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsRowProps {
  label: string;
  description?: string;
  /** Muted text shown to the left of the chevron (navigation rows only) */
  currentValue?: string;
  /** @deprecated use currentValue instead */
  value?: string;
  onClick?: () => void;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  disabled?: boolean;
}

export function SettingsRow({ label, description, currentValue, value, onClick, toggle, toggleValue, onToggle, disabled }: SettingsRowProps) {
  const displayValue = currentValue ?? value;
  return (
    <button
      onClick={toggle ? () => !disabled && onToggle?.(!toggleValue) : onClick}
      disabled={disabled && !toggle}
      className={cn(
        'w-full px-4 py-3 flex items-center justify-between gap-4 tap-target quiet-transition hover:bg-muted/30',
        disabled && 'opacity-50'
      )}
    >
      <div className="text-left flex-1 min-w-0">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {description && (
          <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{description}</p>
        )}
      </div>
      {toggle ? (
        <div
          className={cn(
            'w-11 h-6 rounded-full relative transition-colors flex-shrink-0',
            toggleValue ? 'bg-primary' : 'bg-muted border border-border/70'
          )}
        >
          <div
            className={cn(
              'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform',
              toggleValue ? 'translate-x-[22px]' : 'translate-x-0.5'
            )}
          />
        </div>
      ) : (
        <div className="flex items-center gap-2 text-muted-foreground flex-shrink-0">
          {displayValue && <span className="text-sm">{displayValue}</span>}
          <ChevronRight className="h-4 w-4" />
        </div>
      )}
    </button>
  );
}
