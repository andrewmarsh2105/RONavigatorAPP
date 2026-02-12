import { useState } from 'react';
import { AlertTriangle, Flag, X } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { AddFlagDialog } from './AddFlagDialog';
import { cn } from '@/lib/utils';
import type { ReviewIssue } from '@/types/flags';
import type { FlagType } from '@/types/flags';

interface ReviewIndicatorProps {
  issues: ReviewIssue[];
  onConvertToFlag: (issue: ReviewIssue, flagType: FlagType, note?: string) => void;
  onDismiss?: (issue: ReviewIssue) => void;
  size?: 'sm' | 'md';
}

export function ReviewIndicator({ issues, onConvertToFlag, onDismiss, size = 'sm' }: ReviewIndicatorProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [convertingIssue, setConvertingIssue] = useState<ReviewIssue | null>(null);

  const activeIssues = issues.filter(i => !dismissed.has(`${i.type}-${i.roId}-${i.lineId || ''}`));

  if (activeIssues.length === 0) return null;

  const handleDismiss = (issue: ReviewIssue) => {
    const key = `${issue.type}-${issue.roId}-${issue.lineId || ''}`;
    setDismissed(prev => new Set(prev).add(key));
    onDismiss?.(issue);
  };

  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <button
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-0.5 text-yellow-500 hover:text-yellow-600 transition-colors"
            title="Needs review"
          >
            <AlertTriangle className={iconSize} />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-64 p-2 rounded-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1.5">
            Needs Review
          </p>
          <div className="space-y-1.5">
            {activeIssues.map((issue, i) => (
              <div key={i} className="px-2 py-2 bg-yellow-500/10 rounded-lg">
                <p className="text-xs font-medium text-yellow-600 mb-1.5">{issue.message}</p>
                <div className="flex gap-1.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDismiss(issue)}
                    className="h-7 text-[11px] text-muted-foreground"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Ignore
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setConvertingIssue(issue)}
                    className="h-7 text-[11px] text-orange-500"
                  >
                    <Flag className="h-3 w-3 mr-1" />
                    Flag it
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {convertingIssue && (
        <AddFlagDialog
          open={!!convertingIssue}
          onClose={() => setConvertingIssue(null)}
          onSubmit={(flagType, note) => {
            onConvertToFlag(convertingIssue, flagType, note);
            handleDismiss(convertingIssue);
            setConvertingIssue(null);
          }}
          title="Convert to Flag"
        />
      )}
    </>
  );
}
