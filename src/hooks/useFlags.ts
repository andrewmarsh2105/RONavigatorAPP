import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { ROFlag, FlagType } from '@/types/flags';

function dbToFlag(row: any): ROFlag {
  return {
    id: row.id,
    userId: row.user_id,
    roId: row.ro_id,
    roLineId: row.ro_line_id || null,
    flagType: row.flag_type as FlagType,
    note: row.note || null,
    createdAt: row.created_at,
    clearedAt: row.cleared_at || null,
  };
}

export function useFlags() {
  const { user } = useAuth();
  const [flags, setFlags] = useState<ROFlag[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFlags = useCallback(async () => {
    if (!user) { setFlags([]); setLoading(false); return; }
    try {
      const { data, error } = await supabase
        .from('ro_flags')
        .select('*')
        .is('cleared_at', null)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setFlags((data || []).map(dbToFlag));
    } catch (err: any) {
      console.error('Failed to fetch flags', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchFlags(); }, [fetchFlags]);

  const addFlag = useCallback(async (
    roId: string,
    flagType: FlagType,
    note?: string,
    roLineId?: string
  ) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('ro_flags')
      .insert({
        user_id: user.id,
        ro_id: roId,
        ro_line_id: roLineId || null,
        flag_type: flagType as any,
        note: note || null,
      })
      .select()
      .single();
    if (error) {
      toast.error(`Failed to add flag: ${error.message}`);
      return;
    }
    setFlags(prev => [dbToFlag(data), ...prev]);
    toast.success('Flag added');
  }, [user]);

  const clearFlag = useCallback(async (flagId: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('ro_flags')
      .update({ cleared_at: new Date().toISOString() })
      .eq('id', flagId);
    if (error) {
      toast.error(`Failed to clear flag: ${error.message}`);
      return;
    }
    setFlags(prev => prev.filter(f => f.id !== flagId));
    toast.success('Flag cleared');
  }, [user]);

  const getFlagsForRO = useCallback((roId: string) => {
    return flags.filter(f => f.roId === roId && !f.roLineId);
  }, [flags]);

  const getFlagsForLine = useCallback((lineId: string) => {
    return flags.filter(f => f.roLineId === lineId);
  }, [flags]);

  const activeCount = flags.length;

  return {
    flags,
    loading,
    addFlag,
    clearFlag,
    getFlagsForRO,
    getFlagsForLine,
    activeCount,
    refetch: fetchFlags,
  };
}
