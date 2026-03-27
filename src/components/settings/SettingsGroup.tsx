interface SettingsGroupProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function SettingsGroup({ title, description, children }: SettingsGroupProps) {
  return (
    <div className="space-y-1.5">
      <div className="px-1">
        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em]">
          {title}
        </h3>
        {description && (
          <p className="text-[11px] text-muted-foreground/70 mt-0.5">{description}</p>
        )}
      </div>
      <div className="bg-card border border-border/70 divide-y divide-border/50" style={{ borderRadius: 'var(--radius)' }}>
        {children}
      </div>
    </div>
  );
}
