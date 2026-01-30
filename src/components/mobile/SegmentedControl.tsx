import { cn } from '@/lib/utils';

interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function SegmentedControl<T extends string>({ 
  options, 
  value, 
  onChange,
  className 
}: SegmentedControlProps<T>) {
  return (
    <div className={cn('segmented-control w-full', className)}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'segmented-control-item flex-1 text-center',
            value === option.value 
              ? 'segmented-control-item-active' 
              : 'segmented-control-item-inactive'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
