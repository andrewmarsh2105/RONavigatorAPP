import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Check, ChevronRight, LogOut, Shield, Star, Loader2 } from 'lucide-react';
import { BottomSheet } from '@/components/mobile/BottomSheet';
import { cn } from '@/lib/utils';
import type { SaveSettingResult } from '@/hooks/useUserSettings';

interface AccountSheetProps {
  isOpen: boolean;
  onClose: () => void;
  avatarInitial: string;
  displayName: string;
  shopName: string;
  email: string | undefined;
  isPro: boolean;
  subscriptionEnd: string | null | undefined;
  daysUntilEnd: number | null;
  isNearExpiry: boolean;
  hasBillingIssue: boolean;
  isAdmin: boolean;
  updateSetting: (key: 'displayName' | 'shopName', value: string) => Promise<SaveSettingResult>;
  openPortal: () => void;
  setShowUpgradeDialog: (v: boolean) => void;
  signOut: () => void;
}

type FieldStatus = 'idle' | 'saving' | 'saved' | 'error';

export function AccountSheet({
  isOpen,
  onClose,
  avatarInitial,
  displayName,
  shopName,
  email,
  isPro,
  subscriptionEnd,
  daysUntilEnd,
  isNearExpiry,
  hasBillingIssue,
  isAdmin,
  updateSetting,
  openPortal,
  setShowUpgradeDialog,
  signOut,
}: AccountSheetProps) {
  const navigate = useNavigate();
  const [localDisplayName, setLocalDisplayName] = useState(displayName);
  const [localShopName, setLocalShopName] = useState(shopName);
  const [nameStatus, setNameStatus] = useState<FieldStatus>('idle');
  const [shopStatus, setShopStatus] = useState<FieldStatus>('idle');
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLocalDisplayName(displayName);
      setLocalShopName(shopName);
      setNameStatus('idle');
      setShopStatus('idle');
    }
  }, [isOpen, displayName, shopName]);

  useEffect(() => {
    return () => {
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      if (shopTimerRef.current) clearTimeout(shopTimerRef.current);
    };
  }, []);

  const handleSave = useCallback(async (field: 'displayName' | 'shopName', value: string) => {
    const setStatus = field === 'displayName' ? setNameStatus : setShopStatus;
    const timerRef = field === 'displayName' ? savedTimerRef : shopTimerRef;

    setStatus('saving');
    const result = await updateSetting(field, value);

    if (result.status === 'failed') {
      setStatus('error');
      return;
    }

    setStatus('saved');
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setStatus('idle'), 2500);
  }, [updateSetting]);

  const handleBlur = useCallback((field: 'displayName' | 'shopName') => {
    const value = field === 'displayName' ? localDisplayName.trim() : localShopName.trim();
    const original = field === 'displayName' ? displayName : shopName;
    if (value !== original) {
      handleSave(field, value);
    }
  }, [localDisplayName, localShopName, displayName, shopName, handleSave]);

  const displayNameDirty = localDisplayName.trim() !== displayName;
  const shopNameDirty = localShopName.trim() !== shopName;

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Account">
      <div className="p-4 space-y-5">

        {/* Identity header */}
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 text-primary-foreground text-lg font-bold select-none bg-primary">
            {avatarInitial}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-semibold truncate">
              {displayName || <span className="text-muted-foreground font-normal italic text-[12px]">No name set</span>}
            </div>
            <div className="text-[12px] text-muted-foreground/70 truncate">{email}</div>
          </div>
        </div>

        {/* Profile fields */}
        <div className="space-y-1">
          <h4 className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wide px-0.5">Profile</h4>
          <div
            className="bg-card border border-border/60 overflow-hidden divide-y divide-border/40"
            style={{ borderRadius: 'var(--radius)' }}
          >
            <InlineField
              label="Your name"
              value={localDisplayName}
              onChange={setLocalDisplayName}
              onBlur={() => handleBlur('displayName')}
              onSave={() => handleSave('displayName', localDisplayName.trim())}
              isDirty={displayNameDirty}
              status={nameStatus}
              placeholder="e.g. Mike"
            />
            <InlineField
              label="Shop name"
              value={localShopName}
              onChange={setLocalShopName}
              onBlur={() => handleBlur('shopName')}
              onSave={() => handleSave('shopName', localShopName.trim())}
              isDirty={shopNameDirty}
              status={shopStatus}
              placeholder="e.g. Smith's Auto"
            />
          </div>
        </div>

        {/* Plan */}
        <div className="space-y-1">
          <h4 className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wide px-0.5">Plan</h4>
          <div
            className="bg-card border border-border/60 overflow-hidden"
            style={{ borderRadius: 'var(--radius)' }}
          >
            <button
              onClick={() => {
                onClose();
                if (isPro) openPortal();
                else setShowUpgradeDialog(true);
              }}
              className="w-full px-4 py-3 flex items-center justify-between tap-target active:bg-muted/40 transition-colors"
            >
              <span className="text-[13px] font-medium">Subscription</span>
              <div className="flex items-center gap-2">
                <span className={cn(
                  'text-[12px] font-semibold',
                  isPro ? 'text-primary' : 'text-muted-foreground'
                )}>
                  {isPro ? 'Pro' : 'Free'}
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
              </div>
            </button>
            {subscriptionEnd && isPro && !isNearExpiry && (
              <div className="px-4 pb-3 -mt-1">
                <p className="text-[11px] text-muted-foreground/60">Renews {new Date(subscriptionEnd).toLocaleDateString()}</p>
              </div>
            )}
            {isNearExpiry && daysUntilEnd !== null && (
              <div className="mx-4 mb-3 flex items-start gap-2 bg-amber-500/8 border border-amber-500/20 rounded-md px-3 py-2">
                <Star className="h-3.5 w-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-800 leading-snug">
                  Trial ends in <strong>{daysUntilEnd} {daysUntilEnd === 1 ? 'day' : 'days'}</strong> — add a payment method to keep Pro.
                </p>
              </div>
            )}
            {hasBillingIssue && (
              <div className="mx-4 mb-3 flex items-start gap-2 bg-destructive/8 border border-destructive/20 rounded-md px-3 py-2">
                <AlertTriangle className="h-3.5 w-3.5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-destructive leading-snug">
                  We couldn't renew your subscription.{' '}
                  <button onClick={() => { onClose(); openPortal(); }} className="font-semibold underline underline-offset-2">
                    Fix payment
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div
          className="bg-card border border-border/60 overflow-hidden divide-y divide-border/40"
          style={{ borderRadius: 'var(--radius)' }}
        >
          {isAdmin && (
            <button
              onClick={() => { onClose(); navigate('/admin'); }}
              className="w-full px-4 py-3 flex items-center gap-3 tap-target active:bg-muted/40 transition-colors text-primary"
            >
              <Shield className="h-4 w-4" />
              <span className="text-[13px] font-medium flex-1 text-left">Admin Panel</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
            </button>
          )}
          <button
            onClick={signOut}
            className="w-full px-4 py-3 flex items-center gap-3 tap-target active:bg-muted/40 transition-colors text-destructive"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-[13px] font-medium">Sign Out</span>
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}

/* ── Inline editable field with auto-save ── */
function InlineField({
  label,
  value,
  onChange,
  onBlur,
  onSave,
  isDirty,
  status,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  onSave: () => void;
  isDirty: boolean;
  status: FieldStatus;
  placeholder: string;
}) {
  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wide">{label}</label>
        <FieldFeedback status={status} isDirty={isDirty} onSave={onSave} />
      </div>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={onBlur}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onSave(); (e.target as HTMLInputElement).blur(); } }}
        placeholder={placeholder}
        className={cn(
          'w-full h-9 px-3 text-[13px] bg-muted/40 rounded-md border transition-all',
          'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40',
          isDirty ? 'border-primary/30' : 'border-transparent',
          status === 'error' && 'border-destructive/40 ring-1 ring-destructive/20',
        )}
      />
      {status === 'error' && <p className="text-[10px] text-destructive mt-1">Failed to save. Tap to retry.</p>}
    </div>
  );
}

function FieldFeedback({ status, isDirty, onSave }: { status: FieldStatus; isDirty: boolean; onSave: () => void }) {
  if (status === 'saving') {
    return (
      <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
        <Loader2 className="h-3 w-3 animate-spin" /> Saving…
      </span>
    );
  }
  if (status === 'saved') {
    return (
      <span className="text-[10px] text-green-600 flex items-center gap-1 font-medium">
        <Check className="h-3 w-3" /> Saved
      </span>
    );
  }
  if (status === 'error') {
    return (
      <button onClick={onSave} className="text-[10px] text-destructive font-semibold">
        Retry
      </button>
    );
  }
  if (isDirty) {
    return <span className="text-[10px] text-primary/50 font-medium">Unsaved</span>;
  }
  return null;
}
