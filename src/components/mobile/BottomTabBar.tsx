import { ClipboardList, BarChart3, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomTabBarProps {
  activeTab: 'ros' | 'summary' | 'settings';
  onTabChange: (tab: 'ros' | 'summary' | 'settings') => void;
}

const tabs = [
  { id: 'ros' as const, label: 'ROs', icon: ClipboardList },
  { id: 'summary' as const, label: 'Summary', icon: BarChart3 },
  { id: 'settings' as const, label: 'Settings', icon: Settings },
];

export function BottomTabBar({ activeTab, onTabChange }: BottomTabBarProps) {
  return (
    <nav className="tab-bar-pwa">
      <div className="flex h-full items-stretch px-2">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={cn(
                'tab-bar-item touch-feedback flex-1 gap-0.5',
                isActive ? 'tab-bar-item-active' : 'tab-bar-item-inactive'
              )}
            >
              {/* Active indicator dot above icon */}
              <div className={cn(
                'w-full flex justify-center pb-0.5',
              )}>
                <div className={cn(
                  'h-[2px] rounded-full quiet-transition',
                  isActive ? 'w-6 bg-primary' : 'w-0 bg-transparent'
                )} />
              </div>

              <div className={cn(
                'flex items-center justify-center rounded-xl transition-all duration-200 px-4 py-0.5',
                isActive ? 'bg-primary/10' : ''
              )}>
                <Icon
                  className="flex-shrink-0 h-[20px] w-[20px] transition-all duration-200"
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
              </div>
              <span className={cn(
                'text-[10px] font-semibold transition-all duration-200 leading-none',
                isActive ? 'opacity-100' : 'opacity-55'
              )}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
