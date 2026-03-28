interface SettingsGroupProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function SettingsGroup({ title, description, children }: SettingsGroupProps) {
  return (
    <div>
      <div className="px-4 pt-5 pb-2">
        <h3 className="text-[11px] font-bold text-foreground/55 uppercase tracking-[0.1em]">
          {title}
        </h3>
        {description && (
          <p className="text-[11px] text-muted-foreground/60 mt-0.5">{description}</p>
        )}
      </div>
      <div className="bg-card border-t border-b border-border/50 divide-y divide-border/40">
        {children}
      </div>
    </div>
  );
}
