import { useState, useEffect, useMemo } from 'react';
import { Camera, X, UserPlus, ChevronRight, Hash, CalendarDays, User } from 'lucide-react';
import { haptics } from '@/lib/haptics';
import { BottomSheet } from '@/components/mobile/BottomSheet';
import { LineItemEditor, createEmptyLine } from '@/components/mobile/LineItemEditor';
import { DetailsCollapsible } from '@/components/shared/DetailsCollapsible';
import { ProUpgradeDialog } from '@/components/ProUpgradeDialog';
import { useRO } from '@/contexts/ROContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import type { LaborType, RepairOrder, ROLine, VehicleInfo } from '@/types/ro';
import { cn, localDateStr } from '@/lib/utils';
import { RO_MONTHLY_CAP } from '@/lib/proFeatures';
import { toast } from 'sonner';

interface QuickAddSheetProps {
  isOpen: boolean;
  onClose: () => void;
  editingRO?: RepairOrder;
  onScanPhoto: () => void;
}

export function QuickAddSheet({ isOpen, onClose, editingRO, onScanPhoto }: QuickAddSheetProps) {
  const { settings, addRO, updateRO, updateAdvisors, ros } = useRO();
  const { isPro } = useSubscription();
  const [showAdvisorList, setShowAdvisorList] = useState(false);
  const [showProUpgrade, setShowProUpgrade] = useState(false);
  const [advisorDraft, setAdvisorDraft] = useState('');
  const [showAdvisorCreate, setShowAdvisorCreate] = useState(false);

  // Form state
  const [roNumber, setRoNumber] = useState(editingRO?.roNumber || '');
  const [advisor, setAdvisor] = useState(editingRO?.advisor || '');
  const [laborType, setLaborType] = useState<LaborType>(editingRO?.laborType || 'customer-pay');
  const [roDate, setRoDate] = useState(editingRO?.date || localDateStr());
  const [notes, setNotes] = useState(editingRO?.notes || '');
  const [lines, setLines] = useState<ROLine[]>(() => {
    if (editingRO?.lines?.length) return editingRO.lines;
    if (editingRO?.isSimpleMode && (editingRO.paidHours > 0 || editingRO.workPerformed)) {
      return [{
        id: Date.now().toString(),
        lineNo: 1,
        description: editingRO.workPerformed,
        hoursPaid: editingRO.paidHours,
        laborType: editingRO.laborType,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }];
    }
    return [createEmptyLine(1)];
  });
  const [paidDate, setPaidDate] = useState(editingRO?.paidDate || '');
  const [customerName, setCustomerName] = useState(editingRO?.customerName || '');
  const [vehicle, setVehicle] = useState<VehicleInfo>(editingRO?.vehicle || {});
  const [mileage, setMileage] = useState(editingRO?.mileage || '');
  const [showDetailsOpen, setShowDetailsOpen] = useState(false);

  const monthlyROCount = useMemo(() => {
    const now = new Date();
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    return ros.filter(r => r.date && r.date >= monthStart).length;
  }, [ros]);
  const isAtCap = !isPro && !editingRO && monthlyROCount >= RO_MONTHLY_CAP;

  useEffect(() => {
    if (isOpen) {
      if (editingRO) {
        setRoNumber(editingRO.roNumber);
        setAdvisor(editingRO.advisor);
        setLaborType(editingRO.laborType);
        setRoDate(editingRO.date || localDateStr());
        setNotes(editingRO.notes || '');
        if (editingRO.lines?.length) {
          setLines(editingRO.lines);
        } else if (editingRO.isSimpleMode && (editingRO.paidHours > 0 || editingRO.workPerformed)) {
          setLines([{
            id: Date.now().toString(),
            lineNo: 1,
            description: editingRO.workPerformed,
            hoursPaid: editingRO.paidHours,
            laborType: editingRO.laborType,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }]);
        } else {
          setLines([createEmptyLine(1)]);
        }
        setPaidDate(editingRO.paidDate || '');
        setCustomerName(editingRO.customerName || '');
        setVehicle(editingRO.vehicle || {});
        setMileage(editingRO.mileage || '');
        setShowDetailsOpen(!!(editingRO.paidDate || editingRO.customerName || editingRO.mileage || editingRO.vehicle?.year || editingRO.vehicle?.make));
      } else {
        resetForm();
      }
    }
  }, [isOpen, editingRO]);

  const linesTotalHours = lines.filter(l => !l.isTbd).reduce((sum, line) => sum + line.hoursPaid, 0);

  const resetForm = () => {
    setRoNumber('');
    setAdvisor('');
    setLaborType('customer-pay');
    setRoDate(localDateStr());
    setNotes('');
    setLines([createEmptyLine(1)]);
    setPaidDate('');
    setCustomerName('');
    setVehicle({});
    setMileage('');
    setShowDetailsOpen(false);
  };

  const handleSave = async (addAnother: boolean = false) => {
    if (isAtCap) {
      setShowProUpgrade(true);
      return;
    }

    const computedWorkPerformed = lines.map(l => l.description).filter(Boolean).join('\n');
    const roData = {
      roNumber,
      advisor,
      customerName: customerName.trim() || undefined,
      vehicle: (vehicle.year || vehicle.make || vehicle.model) ? vehicle : undefined,
      mileage: mileage.trim() || undefined,
      paidDate: paidDate.trim() || null,
      paidHours: linesTotalHours,
      laborType,
      workPerformed: computedWorkPerformed,
      notes,
      date: roDate || localDateStr(),
      photos: editingRO?.photos,
      lines,
      isSimpleMode: false,
    };

    try {
      if (editingRO) {
        const success = await updateRO(editingRO.id, roData);
        if (!success) return;
        toast.success('RO updated');
      } else {
        const saved = await addRO(roData);
        if (!saved) return;
        toast.success('RO saved');
      }
      haptics.success();

      if (addAnother) {
        resetForm();
      } else {
        onClose();
        resetForm();
      }
    } catch (err: any) {
      toast.error(`Save failed: ${err?.message || 'Unknown error'}. Try again.`);
    }
  };

  const isValid = roNumber.trim() !== '';

  const saveAdvisorQuickly = async () => {
    const trimmed = advisorDraft.trim();
    if (!trimmed) return;

    const existing = settings.advisors.find(a => a.name.toLowerCase() === trimmed.toLowerCase());
    if (!existing) {
      await updateAdvisors([...settings.advisors, { id: Date.now().toString(), name: trimmed }]);
      toast.success(`Advisor "${trimmed}" added`);
    }

    setAdvisor(trimmed);
    setAdvisorDraft('');
    setShowAdvisorCreate(false);
  };

  const LABOR_TYPES = [
    {
      value: 'warranty' as LaborType,
      label: 'WRN',
      fullLabel: 'Warranty',
      dotColor: 'hsl(var(--status-warranty))',
      activeBg: 'hsl(var(--status-warranty-bg))',
      activeBorder: 'hsl(var(--status-warranty) / 0.4)',
    },
    {
      value: 'customer-pay' as LaborType,
      label: 'CP',
      fullLabel: 'Customer Pay',
      dotColor: 'hsl(var(--status-customer-pay))',
      activeBg: 'hsl(var(--status-customer-pay-bg))',
      activeBorder: 'hsl(var(--status-customer-pay) / 0.4)',
    },
    {
      value: 'internal' as LaborType,
      label: 'INT',
      fullLabel: 'Internal',
      dotColor: 'hsl(var(--status-internal))',
      activeBg: 'hsl(var(--status-internal-bg))',
      activeBorder: 'hsl(var(--status-internal) / 0.4)',
    },
  ];

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={editingRO ? 'Edit RO' : 'Quick Add'}
      fullScreen
    >
      <div className="flex flex-col h-full min-h-0">

        {/* ══════════════ Scan CTA — pinned above scroll ══════════════ */}
        {isPro && (
          <div className="px-4 pt-3 pb-1 flex-shrink-0">
            <button
              onClick={onScanPhoto}
              className="w-full px-4 py-3.5 rounded-xl flex items-center gap-3.5 tap-target touch-feedback bg-primary text-primary-foreground active:scale-[0.99] transition-transform"
              style={{ boxShadow: '0 4px 16px -4px hsl(var(--primary) / 0.5)' }}
            >
              <div className="w-9 h-9 rounded-lg bg-primary-foreground/15 flex items-center justify-center flex-shrink-0">
                <Camera className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <span className="text-sm font-bold leading-tight block">Scan RO Photo</span>
                <span className="text-[11px] opacity-60 leading-tight">Auto-fill from document</span>
              </div>
              <ChevronRight className="h-4 w-4 opacity-40 flex-shrink-0" />
            </button>
          </div>
        )}

        {/* ══════════════ Scrollable body ══════════════ */}
        <div className="flex-1 overflow-y-auto min-h-0 px-4 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+9rem)] space-y-3">

          {/* ── Section 1: RO Identity ── */}
          <div className="bg-card rounded-xl border border-border/60 overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
            {/* Inline fields: RO# + Date side by side */}
            <div className="p-3 flex gap-2.5">
              {/* RO Number */}
              <div className="flex-[3] min-w-0">
                <label className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/70 mb-1.5">
                  <Hash className="h-3 w-3" />
                  RO Number
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={roNumber}
                  onChange={(e) => setRoNumber(e.target.value.slice(0, 20))}
                  placeholder="Enter RO #"
                  maxLength={20}
                  className="w-full h-10 px-3 bg-muted/50 rounded-lg border border-border/50 text-base font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 placeholder:font-normal placeholder:text-muted-foreground/40 transition-all"
                />
              </div>
              {/* Date */}
              <div className="flex-[2] min-w-0">
                <label className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/70 mb-1.5">
                  <CalendarDays className="h-3 w-3" />
                  Date
                </label>
                <input
                  type="date"
                  value={roDate}
                  onChange={(e) => setRoDate(e.target.value)}
                  className="w-full h-10 px-2 bg-muted/50 rounded-lg border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
                />
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-border/30 mx-3" />

            {/* Advisor */}
            <div className="p-3">
              <label className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/70 mb-2">
                <User className="h-3 w-3" />
                Advisor
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[...settings.advisors].sort((a, b) => a.name.localeCompare(b.name)).slice(0, 8).map((adv) => (
                  <button
                    key={adv.id}
                    onClick={() => setAdvisor(advisor === adv.name ? '' : adv.name)}
                    className={cn(
                      'h-8 px-3 rounded-lg text-xs font-semibold transition-all border tap-target active:scale-[0.97]',
                      advisor === adv.name
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted/60 border-border/50 text-foreground hover:border-primary/30'
                    )}
                    style={advisor === adv.name ? { boxShadow: '0 2px 8px -2px hsl(var(--primary) / 0.3)' } : {}}
                  >
                    {adv.name}
                  </button>
                ))}
                {settings.advisors.length > 8 && (
                  <button
                    onClick={() => setShowAdvisorList(true)}
                    className="h-8 px-3 rounded-lg text-xs font-medium border border-border/50 bg-muted/40 text-muted-foreground tap-target"
                  >
                    More…
                  </button>
                )}
                <button
                  onClick={() => setShowAdvisorCreate((v) => !v)}
                  className={cn(
                    'h-8 px-3 rounded-lg text-xs font-semibold border transition-all inline-flex items-center gap-1 tap-target active:scale-[0.97]',
                    showAdvisorCreate
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-primary/30 text-primary bg-primary/5'
                  )}
                >
                  <UserPlus className="h-3 w-3" />
                  New
                </button>
              </div>

              {showAdvisorCreate && (
                <div className="flex items-center gap-2 mt-2 p-2 rounded-lg border border-border/60 bg-muted/30">
                  <input
                    type="text"
                    value={advisorDraft}
                    onChange={(e) => setAdvisorDraft(e.target.value)}
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        await saveAdvisorQuickly();
                      }
                    }}
                    placeholder="Advisor name"
                    className="flex-1 h-9 px-3 rounded-md bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    onClick={saveAdvisorQuickly}
                    className="h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm font-medium active:scale-[0.97]"
                    aria-label="Add advisor"
                  >
                    <UserPlus className="h-4 w-4" />
                  </button>
                </div>
              )}

              {advisor && ![...settings.advisors].sort((a, b) => a.name.localeCompare(b.name)).slice(0, 8).find(a => a.name === advisor) && (
                <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-primary/8 rounded-lg border border-primary/15">
                  <span className="font-semibold text-sm">{advisor}</span>
                  <button onClick={() => setAdvisor('')} className="ml-auto p-1 rounded hover:bg-primary/10">
                    <X className="h-3 w-3 text-muted-foreground" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── Section 2: Labor Type — compact inline pills ── */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/70 flex-shrink-0">
              Type
            </span>
            <div className="flex gap-1.5 flex-1">
              {LABOR_TYPES.map(({ value, label, fullLabel, dotColor, activeBg, activeBorder }) => {
                const isActive = laborType === value;
                return (
                  <button
                    key={value}
                    onClick={() => setLaborType(value)}
                    className={cn(
                      'flex-1 h-9 rounded-lg text-xs font-semibold border transition-all tap-target active:scale-[0.97] flex items-center justify-center gap-1.5',
                    )}
                    style={isActive
                      ? { backgroundColor: activeBg, borderColor: activeBorder, fontWeight: 700 }
                      : { backgroundColor: 'hsl(var(--muted) / 0.5)', borderColor: 'hsl(var(--border) / 0.5)' }
                    }
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: dotColor, opacity: isActive ? 1 : 0.5 }}
                    />
                    <span style={{ color: isActive ? dotColor : undefined }}
                      className={cn(!isActive && 'text-muted-foreground')}
                    >
                      {fullLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Section 3: Presets + Lines ── */}
          <LineItemEditor
            lines={lines}
            onLinesChange={setLines}
            presets={settings.presets}
            showLaborType={false}
          />

          {/* ── Section 4: Details ── */}
          <DetailsCollapsible
            vehicle={vehicle}
            onVehicleChange={setVehicle}
            customerName={customerName}
            onCustomerNameChange={setCustomerName}
            mileage={mileage}
            onMileageChange={setMileage}
            paidDate={paidDate}
            onPaidDateChange={setPaidDate}
            notes={notes}
            onNotesChange={setNotes}
            open={showDetailsOpen}
            onOpenChange={setShowDetailsOpen}
            layout="mobile"
          />
        </div>

        {/* ══════════════ Bottom Save Bar ══════════════ */}
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/85">
          <div className="px-4 py-3 safe-bottom flex items-center gap-3">
            {/* Live summary */}
            <div className="flex-1 min-w-0 flex items-baseline gap-2">
              <span className="text-base font-bold text-primary tabular-nums leading-none">
                {linesTotalHours.toFixed(1)}h
              </span>
              <span className="text-[11px] text-muted-foreground leading-none">
                {lines.length} {lines.length === 1 ? 'line' : 'lines'}
              </span>
            </div>

            {/* Actions */}
            <button
              onClick={() => handleSave(false)}
              disabled={!isValid}
              className={cn(
                'h-11 px-6 rounded-full font-semibold text-sm min-h-[44px] transition-all active:scale-[0.98]',
                isValid
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              )}
              style={isValid ? { boxShadow: '0 2px 10px -3px hsl(var(--primary) / 0.4)' } : {}}
            >
              Save
            </button>
            {!editingRO && (
              <button
                onClick={() => handleSave(true)}
                disabled={!isValid}
                className={cn(
                  'h-11 px-4 rounded-full font-medium text-sm border min-h-[44px] transition-all active:scale-[0.98]',
                  isValid
                    ? 'border-primary/40 text-primary hover:bg-primary/5'
                    : 'border-muted text-muted-foreground'
                )}
              >
                Save + Add
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Advisor List Sheet */}
      <BottomSheet
        isOpen={showAdvisorList}
        onClose={() => setShowAdvisorList(false)}
        title="Select Advisor"
      >
        <div className="p-4 space-y-2">
          {[...settings.advisors].sort((a, b) => a.name.localeCompare(b.name)).map((adv) => (
            <button
              key={adv.id}
              onClick={() => {
                setAdvisor(adv.name);
                setShowAdvisorList(false);
              }}
              className={cn(
                'w-full p-3.5 rounded-xl text-left font-medium tap-target touch-feedback text-sm',
                advisor === adv.name ? 'bg-primary text-primary-foreground' : 'bg-muted/60 border border-border/50'
              )}
            >
              {adv.name}
            </button>
          ))}

          <div className="pt-3">
            <input
              type="text"
              placeholder="Add new advisor..."
              className="w-full h-12 px-4 bg-muted/50 rounded-xl border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              onKeyDown={(e) => {
                const name = e.currentTarget.value.trim();
                if (e.key === 'Enter' && name) {
                  if (!settings.advisors.some(a => a.name.toLowerCase() === name.toLowerCase())) {
                    updateAdvisors([...settings.advisors, { id: Date.now().toString(), name }]);
                    toast.success(`Advisor "${name}" created`);
                  }
                  setAdvisor(name);
                  setShowAdvisorList(false);
                }
              }}
            />
            <p className="mt-1.5 text-[11px] text-muted-foreground px-1">Press Enter to save</p>
          </div>
        </div>
      </BottomSheet>

      <ProUpgradeDialog open={showProUpgrade} onOpenChange={setShowProUpgrade} trigger="ro-cap" />
    </BottomSheet>
  );
}
