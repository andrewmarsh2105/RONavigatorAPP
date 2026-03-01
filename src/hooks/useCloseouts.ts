import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { PayPeriodReport } from '@/hooks/usePayPeriodReport';

export interface CloseoutSnapshot {
  id: string;
  periodStart: string;
  periodEnd: string;
  closedAt: string;
  totals: {
    totalHours: number;
    customerPayHours: number;
    warrantyHours: number;
    internalHours: number;
    flaggedCount: number;
    tbdCount: number;
    totalROs: number;
    totalLines: number;
  };
  breakdowns: {
    byDay: Array<{ date: string; totalHours: number; roCount: number }>;
    byAdvisor: Array<{ advisor: string; totalHours: number; roCount: number; warrantyHours: number; customerPayHours: number; internalHours: number }>;
    byLaborType: Array<{ laborType: string; label: string; totalHours: number; lineCount: number }>;
    byLaborRef: Array<{ referenceId: string; referenceName: string; totalHours: number; lineCount: number }>;
  };
  roIds: string[];
}

export function useCloseouts() {
  const { user } = useAuth();
  const [closeouts, setCloseouts] = useState<CloseoutSnapshot[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCloseouts = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('pay_period_closeouts')
      .select('*')
      .eq('user_id', user.id)
      .order('period_end', { ascending: false });

    if (!error && data) {
      setCloseouts(data.map((row: any) => ({
        id: row.id,
        periodStart: row.period_start,
        periodEnd: row.period_end,
        closedAt: row.closed_at,
        totals: row.totals as CloseoutSnapshot['totals'],
        breakdowns: row.breakdowns as CloseoutSnapshot['breakdowns'],
        roIds: row.ro_ids || [],
      })));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchCloseouts(); }, [fetchCloseouts]);

  const closeOutPeriod = useCallback(async (report: PayPeriodReport): Promise<boolean> => {
    if (!user) return false;

    // Build totals
    const cpHours = report.byLaborType.find(l => l.laborType === 'customer-pay')?.totalHours || 0;
    const wHours = report.byLaborType.find(l => l.laborType === 'warranty')?.totalHours || 0;
    const iHours = report.byLaborType.find(l => l.laborType === 'internal')?.totalHours || 0;

    const totals = {
      totalHours: report.totalHours,
      customerPayHours: cpHours,
      warrantyHours: wHours,
      internalHours: iHours,
      flaggedCount: report.flaggedCount,
      tbdCount: report.tbdLineCount,
      totalROs: report.totalROs,
      totalLines: report.totalLines,
    };

    const breakdowns = {
      byDay: report.byDay.map(d => ({ date: d.date, totalHours: d.totalHours, roCount: d.roCount })),
      byAdvisor: report.byAdvisor,
      byLaborType: report.byLaborType,
      byLaborRef: report.byLaborRef,
    };

    const roIds = report.rosInRange.map(r => r.id);

    const { error } = await supabase.from('pay_period_closeouts').insert({
      user_id: user.id,
      period_start: report.startDate,
      period_end: report.endDate,
      totals,
      breakdowns,
      ro_ids: roIds,
    } as any);

    if (error) {
      console.error('Closeout insert error:', error);
      return false;
    }

    await fetchCloseouts();
    return true;
  }, [user, fetchCloseouts]);

  const deleteCloseout = useCallback(async (id: string) => {
    await supabase.from('pay_period_closeouts').delete().eq('id', id);
    setCloseouts(prev => prev.filter(c => c.id !== id));
  }, []);

  const isCurrentPeriodClosed = useCallback((start: string, end: string) => {
    return closeouts.some(c => c.periodStart === start && c.periodEnd === end);
  }, [closeouts]);

  const getCloseoutForPeriod = useCallback((start: string, end: string) => {
    return closeouts.find(c => c.periodStart === start && c.periodEnd === end) || null;
  }, [closeouts]);

  return { closeouts, loading, closeOutPeriod, deleteCloseout, isCurrentPeriodClosed, getCloseoutForPeriod };
}
