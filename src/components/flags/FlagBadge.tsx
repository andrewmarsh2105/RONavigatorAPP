import { Flag, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ROFlag } from '@/types/flags';
import { FLAG_TYPE_LABELS, FLAG_TYPE_COLORS, FLAG_TYPE_BG } from '@/types/flags';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface FlagBadgeProps {
  flags: ROFlag[];
  onClear?: (flagId: string) => void;
  size?: 'sm' | 'md';
}

export function FlagBadge({ flags, onClear, size = 'sm' }: FlagBadgeProps) {
  if (flags.length === 0) return null;

  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          onClick={(e) => e.stopPropagation()}
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 transition-colors',
            FLAG_TYPE_BG[flags[0].flagType],
            FLAG_TYPE_COLORS[flags[0].flagType]
          )}
          title={`${flags.length} flag${flags.length > 1 ? 's' : ''}`}
        >
          <Flag className={iconSize} />
          {flags.length > 1 && (
            <span className="text-[10px] font-bold">{flags.length}</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-56 p-2 rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1.5">
          Flags
        </p>
        <div className="space-y-1">
          {flags.map((flag) => (
            <div key={flag.id} className={cn('flex items-start gap-2 px-2 py-1.5 rounded-lg', FLAG_TYPE_BG[flag.flagType])}>
              <Flag className={cn('h-3.5 w-3.5 mt-0.5 flex-shrink-0', FLAG_TYPE_COLORS[flag.flagType])} />
              <div className="flex-1 min-w-0">
                <p className={cn('text-xs font-medium', FLAG_TYPE_COLORS[flag.flagType])}>
                  {FLAG_TYPE_LABELS[flag.flagType]}
                </p>
                {flag.note && (
                  <p className="text-[11px] text-muted-foreground truncate">{flag.note}</p>
                )}
              </div>
              {onClear && (
                <button
                  onClick={(e) => { e.stopPropagation(); onClear(flag.id); }}
                  className="p-0.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                  title="Clear flag"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
