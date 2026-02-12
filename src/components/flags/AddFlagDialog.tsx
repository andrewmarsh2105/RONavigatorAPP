import { useState } from 'react';
import { Flag } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { FlagType } from '@/types/flags';
import { FLAG_TYPE_LABELS, FLAG_TYPE_COLORS, FLAG_TYPE_BG } from '@/types/flags';

interface AddFlagDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (flagType: FlagType, note?: string) => void;
  title?: string;
}

const FLAG_OPTIONS: FlagType[] = ['needs_time', 'questionable', 'waiting', 'advisor_question', 'other'];

export function AddFlagDialog({ open, onClose, onSubmit, title = 'Add Flag' }: AddFlagDialogProps) {
  const [selectedType, setSelectedType] = useState<FlagType>('needs_time');
  const [note, setNote] = useState('');

  const handleSubmit = () => {
    onSubmit(selectedType, note.trim() || undefined);
    setSelectedType('needs_time');
    setNote('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-4 w-4" />
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          {/* Flag Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Flag Type</label>
            <div className="grid grid-cols-2 gap-2">
              {FLAG_OPTIONS.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={cn(
                    'px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-all border',
                    selectedType === type
                      ? cn('border-primary ring-1 ring-primary', FLAG_TYPE_BG[type], FLAG_TYPE_COLORS[type])
                      : 'border-border hover:border-muted-foreground/30'
                  )}
                >
                  {FLAG_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Note */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Note <span className="text-xs opacity-60">(optional, max 80 chars)</span>
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 80))}
              placeholder="What's wrong?"
              className="w-full h-10 px-3 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <span className="text-[10px] text-muted-foreground">{note.length}/80</span>
          </div>
        </div>

        <DialogFooter className="flex-row gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="flex-1">
            Add Flag
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
