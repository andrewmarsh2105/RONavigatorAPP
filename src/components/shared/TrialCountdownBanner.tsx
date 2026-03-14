import { useState } from 'react';
import { Crown, X } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { ProUpgradeDialog } from '@/components/ProUpgradeDialog';

/**
 * Sticky banner shown when a Pro trial has 3 or fewer days remaining.
 * Dismissed per-session (re-shows on next load until the trial expires or user upgrades).
 */
export function TrialCountdownBanner() {
  const { isPro, daysUntilEnd } = useSubscription();
  const [dismissed, setDismissed] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  // Only show for active Pro (trial) users with ≤3 days left
  if (!isPro || daysUntilEnd === null || daysUntilEnd > 3 || dismissed) return null;

  const dayLabel = daysUntilEnd <= 0
    ? 'Trial ends today'
    : daysUntilEnd === 1
      ? '1 day left in your trial'
      : `${daysUntilEnd} days left in your trial`;

  return (
    <>
      <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border-b border-amber-500/20 text-amber-700 dark:text-amber-400">
        <Crown className="h-3.5 w-3.5 flex-shrink-0" />
        <p className="flex-1 text-xs font-medium leading-tight">
          {dayLabel} —{' '}
          <button
            className="underline underline-offset-2 font-semibold hover:text-amber-900 dark:hover:text-amber-300 transition-colors"
            onClick={() => setShowUpgrade(true)}
          >
            keep Pro access
          </button>
        </p>
        <button
          className="p-0.5 rounded hover:bg-amber-500/20 transition-colors"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss trial warning"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <ProUpgradeDialog open={showUpgrade} onOpenChange={setShowUpgrade} trigger="generic" />
    </>
  );
}
