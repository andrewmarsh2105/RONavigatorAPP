/**
 * Tests for useUserSettings — specifically the save model, fallback logic,
 * and the fix for the || vs ?? bug that caused goal=0 to fall back to
 * stale localStorage values.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// ── Hoist mocks so vi.mock factories can reference them ────────────────────
const { mockUpsert, mockMaybeSingle } = vi.hoisted(() => {
  const mockMaybeSingle = vi.fn();
  const mockUpsert = vi.fn();
  return { mockUpsert, mockMaybeSingle };
});

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: mockMaybeSingle }) }),
      upsert: mockUpsert,
    }),
  },
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'user-abc', email: 'test@example.com' } }),
}));

// Import after mocks are defined
import { useUserSettings } from './useUserSettings';

// ── localStorage helpers ───────────────────────────────────────────────────
function setLS(key: string, value: string) {
  localStorage.setItem(key, value);
}

// ── DB row factory ─────────────────────────────────────────────────────────
function makeDbRow(overrides: Record<string, unknown> = {}) {
  return {
    user_id: 'user-abc',
    theme: 'light',
    show_scan_confidence: false,
    show_vehicle_chips: true,
    keyword_autofill: true,
    flag_inbox_date_range: 'this_week',
    flag_inbox_types: [],
    default_summary_range: 'week',
    default_template_id: null,
    week_start_day: 0,
    pay_period_type: 'week',
    pay_period_end_dates: null,
    hide_totals: false,
    spreadsheet_view_mode: 'payroll',
    spreadsheet_density: 'comfortable',
    spreadsheet_group_by: 'date',
    hours_goal_daily: null,
    hours_goal_weekly: null,
    hourly_rate: null,
    display_name: null,
    shop_name: null,
    ...overrides,
  };
}

describe('useUserSettings', () => {
  beforeEach(() => {
    localStorage.clear();
    mockMaybeSingle.mockReset();
    mockUpsert.mockReset();
    mockUpsert.mockResolvedValue({ error: null });
  });

  // ── Core fallback logic (the || vs ?? bug) ───────────────────────────────

  describe('fetchSettings — goal fallback logic', () => {
    it('uses DB value 0 for hoursGoalDaily — does NOT fall back to localStorage', async () => {
      setLS('ro-tracker-goal-daily', '8'); // stale localStorage value
      mockMaybeSingle.mockResolvedValue({ data: makeDbRow({ hours_goal_daily: 0 }) });

      const { result } = renderHook(() => useUserSettings());
      await act(async () => { await Promise.resolve(); });

      expect(result.current.settings.hoursGoalDaily).toBe(0);
    });

    it('uses localStorage fallback when DB column is null (migration not applied)', async () => {
      setLS('ro-tracker-goal-daily', '6');
      mockMaybeSingle.mockResolvedValue({ data: makeDbRow({ hours_goal_daily: null }) });

      const { result } = renderHook(() => useUserSettings());
      await act(async () => { await Promise.resolve(); });

      expect(result.current.settings.hoursGoalDaily).toBe(6);
    });

    it('uses DB value for hoursGoalWeekly even when 0', async () => {
      setLS('ro-tracker-goal-weekly', '40');
      mockMaybeSingle.mockResolvedValue({ data: makeDbRow({ hours_goal_weekly: 0 }) });

      const { result } = renderHook(() => useUserSettings());
      await act(async () => { await Promise.resolve(); });

      expect(result.current.settings.hoursGoalWeekly).toBe(0);
    });

    it('uses DB value for hourlyRate even when 0', async () => {
      setLS('ro-tracker-hourly-rate', '25');
      mockMaybeSingle.mockResolvedValue({ data: makeDbRow({ hourly_rate: 0 }) });

      const { result } = renderHook(() => useUserSettings());
      await act(async () => { await Promise.resolve(); });

      expect(result.current.settings.hourlyRate).toBe(0);
    });

    it('uses a real DB value for hoursGoalDaily when non-zero', async () => {
      setLS('ro-tracker-goal-daily', '5'); // localStorage has different value
      mockMaybeSingle.mockResolvedValue({ data: makeDbRow({ hours_goal_daily: 8 }) });

      const { result } = renderHook(() => useUserSettings());
      await act(async () => { await Promise.resolve(); });

      expect(result.current.settings.hoursGoalDaily).toBe(8);
    });
  });

  describe('fetchSettings — name fallback logic', () => {
    it('uses DB displayName even when empty string — does NOT fall back to localStorage', async () => {
      setLS('ro-tracker-display-name', 'OldName');
      mockMaybeSingle.mockResolvedValue({ data: makeDbRow({ display_name: '' }) });

      const { result } = renderHook(() => useUserSettings());
      await act(async () => { await Promise.resolve(); });

      expect(result.current.settings.displayName).toBe('');
    });

    it('uses localStorage fallback for displayName when DB column is null', async () => {
      setLS('ro-tracker-display-name', 'Mike');
      mockMaybeSingle.mockResolvedValue({ data: makeDbRow({ display_name: null }) });

      const { result } = renderHook(() => useUserSettings());
      await act(async () => { await Promise.resolve(); });

      expect(result.current.settings.displayName).toBe('Mike');
    });

    it('uses DB shopName even when empty string', async () => {
      setLS('ro-tracker-shop-name', 'OldShop');
      mockMaybeSingle.mockResolvedValue({ data: makeDbRow({ shop_name: '' }) });

      const { result } = renderHook(() => useUserSettings());
      await act(async () => { await Promise.resolve(); });

      expect(result.current.settings.shopName).toBe('');
    });

    it('uses localStorage fallback for shopName when DB column is null', async () => {
      setLS('ro-tracker-shop-name', "Smith's Auto");
      mockMaybeSingle.mockResolvedValue({ data: makeDbRow({ shop_name: null }) });

      const { result } = renderHook(() => useUserSettings());
      await act(async () => { await Promise.resolve(); });

      expect(result.current.settings.shopName).toBe("Smith's Auto");
    });
  });

  describe('fetchSettings — no DB row', () => {
    it('falls back entirely to localStorage when no row exists', async () => {
      setLS('ro-tracker-goal-daily', '7');
      setLS('ro-tracker-display-name', 'NoRow');
      mockMaybeSingle.mockResolvedValue({ data: null });

      const { result } = renderHook(() => useUserSettings());
      await act(async () => { await Promise.resolve(); });

      expect(result.current.settings.hoursGoalDaily).toBe(7);
      expect(result.current.settings.displayName).toBe('NoRow');
    });

    it('returns defaults when no DB row and no localStorage', async () => {
      mockMaybeSingle.mockResolvedValue({ data: null });

      const { result } = renderHook(() => useUserSettings());
      await act(async () => { await Promise.resolve(); });

      expect(result.current.settings.hoursGoalDaily).toBe(0);
      expect(result.current.settings.displayName).toBe('');
    });
  });

  // ── updateSetting — deduplication guard ───────────────────────────────────

  describe('updateSetting — no-op on identical value', () => {
    it('does not call upsert when value is unchanged', async () => {
      mockMaybeSingle.mockResolvedValue({ data: makeDbRow({ hours_goal_daily: 8 }) });
      const { result } = renderHook(() => useUserSettings());
      await act(async () => { await Promise.resolve(); });

      mockUpsert.mockClear();
      await act(async () => {
        await result.current.updateSetting('hoursGoalDaily', 8);
      });

      expect(mockUpsert).not.toHaveBeenCalled();
    });

    it('calls upsert when value changes', async () => {
      mockMaybeSingle.mockResolvedValue({ data: makeDbRow({ hours_goal_daily: 8 }) });
      const { result } = renderHook(() => useUserSettings());
      await act(async () => { await Promise.resolve(); });

      mockUpsert.mockClear();
      await act(async () => {
        await result.current.updateSetting('hoursGoalDaily', 10);
      });

      expect(mockUpsert).toHaveBeenCalledTimes(1);
    });
  });

  // ── updateSetting — localStorage persistence ───────────────────────────────

  describe('updateSetting — localStorage persistence', () => {
    it('persists hoursGoalDaily to localStorage on save', async () => {
      mockMaybeSingle.mockResolvedValue({ data: makeDbRow() });
      const { result } = renderHook(() => useUserSettings());
      await act(async () => { await Promise.resolve(); });

      await act(async () => {
        await result.current.updateSetting('hoursGoalDaily', 9);
      });

      expect(localStorage.getItem('ro-tracker-goal-daily')).toBe('9');
    });

    it('persists hourlyRate to localStorage on save', async () => {
      mockMaybeSingle.mockResolvedValue({ data: makeDbRow() });
      const { result } = renderHook(() => useUserSettings());
      await act(async () => { await Promise.resolve(); });

      await act(async () => {
        await result.current.updateSetting('hourlyRate', 22.5);
      });

      expect(localStorage.getItem('ro-tracker-hourly-rate')).toBe('22.5');
    });

    it('persists displayName to localStorage on save', async () => {
      mockMaybeSingle.mockResolvedValue({ data: makeDbRow() });
      const { result } = renderHook(() => useUserSettings());
      await act(async () => { await Promise.resolve(); });

      await act(async () => {
        await result.current.updateSetting('displayName', 'Mike');
      });

      expect(localStorage.getItem('ro-tracker-display-name')).toBe('Mike');
    });
  });

  // ── updateSetting — optimistic update ────────────────────────────────────

  describe('updateSetting — optimistic state update', () => {
    it('applies optimistic update immediately before Supabase resolves', async () => {
      // Slow upsert that never resolves during this test
      mockUpsert.mockReturnValue(new Promise(() => {}));
      mockMaybeSingle.mockResolvedValue({ data: makeDbRow({ hours_goal_daily: 5 }) });

      const { result } = renderHook(() => useUserSettings());
      await act(async () => { await Promise.resolve(); });

      act(() => {
        // Don't await — we want to check state before upsert resolves
        result.current.updateSetting('hoursGoalDaily', 10);
      });

      expect(result.current.settings.hoursGoalDaily).toBe(10);
    });

    it('rolls back on upsert error (non-column-missing error)', async () => {
      mockMaybeSingle.mockResolvedValue({ data: makeDbRow({ hours_goal_daily: 5 }) });
      const { result } = renderHook(() => useUserSettings());
      await act(async () => { await Promise.resolve(); });

      mockUpsert.mockResolvedValue({
        error: { message: 'network error', code: '500', details: '', hint: '' },
      });

      await act(async () => {
        await result.current.updateSetting('hoursGoalDaily', 10);
      });

      // Should roll back to 5
      expect(result.current.settings.hoursGoalDaily).toBe(5);
    });
  });

  // ── loaded flag ───────────────────────────────────────────────────────────

  describe('loaded flag', () => {
    it('starts as false and becomes true after fetch', async () => {
      mockMaybeSingle.mockResolvedValue({ data: null });
      const { result } = renderHook(() => useUserSettings());

      expect(result.current.loaded).toBe(false);

      await act(async () => { await Promise.resolve(); });

      expect(result.current.loaded).toBe(true);
    });
  });
});
