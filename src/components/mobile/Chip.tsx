import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChipProps {
  label: string;
  selected?: boolean;
  onSelect?: () => void;
  onRemove?: () => void;
  className?: string;
}

export function Chip({ 
  label, 
  selected = false, 
  onSelect, 
  onRemove,
  className 
}: ChipProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'chip touch-feedback',
        selected && 'chip-selected',
        className
      )}
    >
      <span>{label}</span>
      {onRemove && selected && (
        <X 
          className="h-4 w-4 ml-1" 
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        />
      )}
    </button>
  );
}

interface ChipGroupProps {
  chips: { id: string; label: string }[];
  selectedIds: string[];
  onSelect: (id: string) => void;
  className?: string;
}

export function ChipGroup({ chips, selectedIds, onSelect, className }: ChipGroupProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {chips.map((chip) => (
        <Chip
          key={chip.id}
          label={chip.label}
          selected={selectedIds.includes(chip.id)}
          onSelect={() => onSelect(chip.id)}
        />
      ))}
    </div>
  );
}
