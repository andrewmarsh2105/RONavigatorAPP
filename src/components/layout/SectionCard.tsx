import { cn } from "@/lib/utils";

interface SectionCardProps {
  title?: string;
  description?: string;
  rightSlot?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export function SectionCard({
  title,
  description,
  rightSlot,
  children,
  className,
  contentClassName,
}: SectionCardProps) {
  return (
    <div className={cn("surface-panel overflow-hidden", className)}>
      {(title || rightSlot) && (
        <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-border/50 bg-muted/20">
          <div>
            {title && (
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>
            )}
          </div>
          {rightSlot}
        </div>
      )}
      <div className={cn("px-4 py-3", contentClassName)}>{children}</div>
    </div>
  );
}
