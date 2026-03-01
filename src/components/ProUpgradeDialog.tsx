import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crown, Camera, BarChart3, FileSpreadsheet, ExternalLink, Loader2 } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { cn } from '@/lib/utils';

interface ProUpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProUpgradeDialog({ open, onOpenChange }: ProUpgradeDialogProps) {
  const { startCheckout, checkoutLoading, checkoutFallbackUrl, clearCheckoutFallback } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');

  const handleCheckout = async () => {
    await startCheckout(selectedPlan);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) clearCheckoutFallback();
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto rounded-2xl p-0 gap-0">
        {/* Hero */}
        <div className="bg-gradient-to-br from-primary/15 to-primary/5 p-6 pb-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Crown className="h-6 w-6 text-primary" />
              Upgrade to Pro
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mt-2">
            Unlock the full power of your RO tracker.
          </p>
        </div>

        <div className="p-6 space-y-5">
          {/* 3 Bullet Features */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Camera className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold">OCR Scanning & Templates</p>
                <p className="text-xs text-muted-foreground">Snap a photo → auto-fill RO lines</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <BarChart3 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold">Closeouts & Period Comparison</p>
                <p className="text-xs text-muted-foreground">Freeze pay periods, compare side-by-side</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FileSpreadsheet className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold">Full Spreadsheet & Exports</p>
                <p className="text-xs text-muted-foreground">Payroll CSV, Audit CSV, XLSX with any date range</p>
              </div>
            </div>
          </div>

          {/* Plan Toggle */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSelectedPlan('monthly')}
              className={cn(
                'rounded-xl border-2 p-3 text-left transition-all',
                selectedPlan === 'monthly'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-muted-foreground/30'
              )}
            >
              <p className="text-xs font-medium text-muted-foreground">Monthly</p>
              <p className="text-lg font-bold">$8.99<span className="text-xs font-normal text-muted-foreground">/mo</span></p>
            </button>
            <button
              onClick={() => setSelectedPlan('yearly')}
              className={cn(
                'rounded-xl border-2 p-3 text-left transition-all relative',
                selectedPlan === 'yearly'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-muted-foreground/30'
              )}
            >
              <span className="absolute -top-2.5 right-3 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                Save 26%
              </span>
              <p className="text-xs font-medium text-muted-foreground">Yearly</p>
              <p className="text-lg font-bold">$79.99<span className="text-xs font-normal text-muted-foreground">/yr</span></p>
              <p className="text-[11px] text-muted-foreground">~$6.67/mo</p>
            </button>
          </div>

          {/* CTA */}
          {checkoutFallbackUrl ? (
            <a
              href={checkoutFallbackUrl}
              className="flex items-center justify-center w-full py-4 text-base font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <ExternalLink className="h-5 w-5 mr-2" />
              Tap here to open checkout
            </a>
          ) : (
            <Button
              onClick={handleCheckout}
              disabled={checkoutLoading}
              className="w-full py-6 text-base font-semibold rounded-xl"
            >
              {checkoutLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Opening checkout…
                </>
              ) : (
                <>
                  <Crown className="h-5 w-5 mr-2" />
                  Start 7-Day Free Trial
                </>
              )}
            </Button>
          )}
          <p className="text-[11px] text-center text-muted-foreground">
            7-day free trial, then {selectedPlan === 'monthly' ? '$8.99/month' : '$79.99/year'}. Cancel anytime.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
