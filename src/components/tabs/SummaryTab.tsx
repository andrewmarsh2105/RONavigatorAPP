import { useState, useMemo } from 'react';
import { Download, Copy, Filter, ChevronRight } from 'lucide-react';
import { useRO } from '@/contexts/ROContext';
import { SegmentedControl } from '@/components/mobile/SegmentedControl';
import { BottomSheet } from '@/components/mobile/BottomSheet';
import { StatusPill } from '@/components/mobile/StatusPill';
import { Chip } from '@/components/mobile/Chip';
import type { DaySummary, AdvisorSummary } from '@/types/ro';
import { cn } from '@/lib/utils';

type ViewMode = 'day' | 'week' | 'month';

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getWeekRange(date: Date): { start: string; end: string } {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay() + 1); // Monday
  const end = new Date(start);
  end.setDate(end.getDate() + 6); // Sunday
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

function getMonthRange(date: Date): { start: string; end: string } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

interface DaySummaryCardProps {
  summary: DaySummary;
  isToday?: boolean;
}

function DaySummaryCard({ summary, isToday }: DaySummaryCardProps) {
  const date = new Date(summary.date);
  const dayName = dayNames[date.getDay()];
  const dayNum = date.getDate();

  return (
    <div className={cn(
      'card-mobile p-4 flex items-center gap-4',
      isToday && 'ring-2 ring-primary'
    )}>
      {/* Date column */}
      <div className="text-center w-12 flex-shrink-0">
        <div className="text-xs text-muted-foreground uppercase">{dayName}</div>
        <div className="text-2xl font-bold">{dayNum}</div>
      </div>

      {/* Stats */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{summary.totalHours.toFixed(1)}h</span>
          <span className="text-sm text-muted-foreground">{summary.roCount} ROs</span>
        </div>
        
        {/* Breakdown pills */}
        {summary.totalHours > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {summary.warrantyHours > 0 && (
              <StatusPill type="warranty" hours={summary.warrantyHours} size="sm" />
            )}
            {summary.customerPayHours > 0 && (
              <StatusPill type="customer-pay" hours={summary.customerPayHours} size="sm" />
            )}
            {summary.internalHours > 0 && (
              <StatusPill type="internal" hours={summary.internalHours} size="sm" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface TotalCardProps {
  label: string;
  totalHours: number;
  roCount: number;
  warrantyHours: number;
  customerPayHours: number;
  internalHours: number;
}

function TotalCard({ label, totalHours, roCount, warrantyHours, customerPayHours, internalHours }: TotalCardProps) {
  return (
    <div className="bg-primary text-primary-foreground rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-primary-foreground/80 font-medium">{label}</span>
        <span className="text-sm text-primary-foreground/70">{roCount} ROs</span>
      </div>
      <div className="text-4xl font-bold mb-3">
        {totalHours.toFixed(1)}h
      </div>
      <div className="flex flex-wrap gap-2">
        <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium">
          W: {warrantyHours.toFixed(1)}h
        </span>
        <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium">
          CP: {customerPayHours.toFixed(1)}h
        </span>
        <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium">
          Int: {internalHours.toFixed(1)}h
        </span>
      </div>
    </div>
  );
}

interface AdvisorCardProps {
  summary: AdvisorSummary;
  onSelect: () => void;
}

function AdvisorCard({ summary, onSelect }: AdvisorCardProps) {
  return (
    <button
      onClick={onSelect}
      className="card-mobile p-4 flex items-center justify-between w-full tap-target touch-feedback"
    >
      <div>
        <div className="font-semibold text-lg">{summary.advisor}</div>
        <div className="text-sm text-muted-foreground">{summary.roCount} ROs</div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold text-primary">{summary.totalHours.toFixed(1)}h</span>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </div>
    </button>
  );
}

export function SummaryTab() {
  const { getDaySummaries, getAdvisorSummaries, getWeekTotal } = useRO();
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [showFilters, setShowFilters] = useState(false);
  const [advisorFilter, setAdvisorFilter] = useState<string | null>(null);

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const dateRange = useMemo(() => {
    if (viewMode === 'day') {
      return { start: todayStr, end: todayStr };
    } else if (viewMode === 'week') {
      return getWeekRange(today);
    } else {
      return getMonthRange(today);
    }
  }, [viewMode, todayStr]);

  const daySummaries = useMemo(() => {
    return getDaySummaries(dateRange.start, dateRange.end);
  }, [getDaySummaries, dateRange]);

  const weekTotal = useMemo(() => {
    return getWeekTotal(dateRange.start, dateRange.end);
  }, [getWeekTotal, dateRange]);

  const advisorSummaries = useMemo(() => {
    return getAdvisorSummaries(dateRange.start, dateRange.end);
  }, [getAdvisorSummaries, dateRange]);

  const viewModeLabel = useMemo(() => {
    if (viewMode === 'day') return 'Today';
    if (viewMode === 'week') {
      const start = new Date(dateRange.start);
      const end = new Date(dateRange.end);
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }
    return today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [viewMode, dateRange, today]);

  const handleCopySummary = () => {
    let text = `${viewModeLabel}\n`;
    text += `Total: ${weekTotal.totalHours.toFixed(1)}h (${weekTotal.roCount} ROs)\n`;
    text += `Warranty: ${weekTotal.warrantyHours.toFixed(1)}h\n`;
    text += `Customer Pay: ${weekTotal.customerPayHours.toFixed(1)}h\n`;
    text += `Internal: ${weekTotal.internalHours.toFixed(1)}h`;
    navigator.clipboard.writeText(text);
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Total Hours', 'RO Count', 'Warranty', 'Customer Pay', 'Internal'];
    const rows = daySummaries.map(s => [
      s.date,
      s.totalHours.toFixed(1),
      s.roCount.toString(),
      s.warrantyHours.toFixed(1),
      s.customerPayHours.toFixed(1),
      s.internalHours.toFixed(1),
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ro-summary-${dateRange.start}-to-${dateRange.end}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm px-4 py-3 border-b border-border space-y-3">
        <SegmentedControl
          options={[
            { value: 'day' as ViewMode, label: 'Day' },
            { value: 'week' as ViewMode, label: 'Week' },
            { value: 'month' as ViewMode, label: 'Month' },
          ]}
          value={viewMode}
          onChange={(v) => setViewMode(v as ViewMode)}
        />
        <div className="flex items-center justify-between">
          <span className="font-semibold text-lg">{viewModeLabel}</span>
          <button
            onClick={() => setShowFilters(true)}
            className="p-2 tap-target touch-feedback"
          >
            <Filter className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
        {/* Total Card */}
        <TotalCard
          label={viewMode === 'day' ? "Today's Total" : viewMode === 'week' ? 'Week Total' : 'Month Total'}
          totalHours={weekTotal.totalHours}
          roCount={weekTotal.roCount}
          warrantyHours={weekTotal.warrantyHours}
          customerPayHours={weekTotal.customerPayHours}
          internalHours={weekTotal.internalHours}
        />

        {/* Day summaries */}
        {viewMode !== 'day' && (
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide px-1">
              Daily Breakdown
            </h3>
            {daySummaries.filter(s => s.totalHours > 0 || s.date === todayStr).map((summary) => (
              <DaySummaryCard
                key={summary.date}
                summary={summary}
                isToday={summary.date === todayStr}
              />
            ))}
          </div>
        )}

        {/* Advisor Summary */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide px-1">
            By Advisor
          </h3>
          {advisorSummaries.map((summary) => (
            <AdvisorCard
              key={summary.advisor}
              summary={summary}
              onSelect={() => setAdvisorFilter(summary.advisor)}
            />
          ))}
        </div>

        {/* Export Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-4">
          <button
            onClick={handleCopySummary}
            className="py-4 bg-secondary rounded-xl font-semibold tap-target touch-feedback flex items-center justify-center gap-2"
          >
            <Copy className="h-5 w-5" />
            Copy Summary
          </button>
          <button
            onClick={handleExportCSV}
            className="py-4 bg-secondary rounded-xl font-semibold tap-target touch-feedback flex items-center justify-center gap-2"
          >
            <Download className="h-5 w-5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filter Sheet */}
      <BottomSheet
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        title="Filters"
      >
        <div className="p-4 space-y-6">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-3">
              Advisor
            </label>
            <div className="flex flex-wrap gap-2">
              {advisorSummaries.map((s) => (
                <Chip
                  key={s.advisor}
                  label={s.advisor}
                  selected={advisorFilter === s.advisor}
                  onSelect={() => setAdvisorFilter(advisorFilter === s.advisor ? null : s.advisor)}
                />
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowFilters(false)}
            className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold tap-target touch-feedback"
          >
            Apply
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}
