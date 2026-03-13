interface SettingsGroupProps {
  title: string;
  children: React.ReactNode;
}

export function SettingsGroup({ title, children }: SettingsGroupProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4">
        {title}
      </h3>
      <div className="card-mobile divide-y divide-border">
        {children}
      </div>
    </div>
  );
}
