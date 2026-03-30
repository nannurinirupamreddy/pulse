import {
  createContext, useContext, useState, useEffect, useCallback, useMemo, useRef,
} from 'react';
import api from '../lib/api';

const AppContext = createContext(null);

const TAG_COLORS = {
  workout: 'var(--peach-dark)',
  habit: 'var(--sage)',
  sleep: 'var(--lavender)',
  nutrition: '#F2C45A',
};

export function normalizeGoal(g) {
  if (!g) return g;
  return {
    ...g,
    targetDate: g.target_date,
    desc: g.description,
    color: g.color || TAG_COLORS[g.tag] || 'var(--peach-dark)',
  };
}

export function buildWeekEnergy(checkins) {
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const byDate = {};
  for (const c of checkins || []) {
    const d = c.date;
    if (!d) continue;
    const e = Number(c.energy_level);
    if (!Number.isFinite(e)) continue;
    const prev = byDate[d];
    if (!prev || new Date(c.created_at) > new Date(prev.created_at)) {
      byDate[d] = { energy_level: e, created_at: c.created_at };
    }
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dow = today.getDay();
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);

  const result = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = d.toISOString().split('T')[0];
    const isToday = d.getTime() === today.getTime();
    const row = byDate[key];
    const value = row ? Math.min(100, Math.max(0, row.energy_level * 10)) : 0;
    result.push({ day: dayLabels[i], value, today: isToday });
  }
  return result;
}

export function checkinStreak(checkins) {
  if (!checkins?.length) return 0;
  const dates = new Set(checkins.map((c) => c.date).filter(Boolean));
  if (!dates.size) return 0;
  const sorted = [...dates].sort((a, b) => b.localeCompare(a));
  let streak = 0;
  const cur = new Date(`${sorted[0]}T12:00:00`);
  while (dates.has(cur.toISOString().split('T')[0])) {
    streak += 1;
    cur.setDate(cur.getDate() - 1);
  }
  return streak;
}

const defaultPlan = [
  { id: 1, text: 'Morning check-in', done: true, tag: 'habit' },
  { id: 2, text: '20 min walk', done: false, tag: 'workout' },
  { id: 3, text: 'Drink 2.5L water', done: false, tag: 'habit' },
  { id: 4, text: 'In bed by 10:30pm', done: false, tag: 'sleep' },
  { id: 5, text: 'Eat protein with lunch', done: false, tag: 'nutrition' },
];

const PLAN_STORAGE_KEY = 'pulse_app_plan_v1';

export function AppProvider({ children }) {
  const [plan, setPlan] = useState(() => {
    try {
      const raw = localStorage.getItem(PLAN_STORAGE_KEY);
      return raw ? JSON.parse(raw) : defaultPlan;
    } catch (e) {
      return defaultPlan;
    }
  });
  const [goals, setGoals] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [profile, setProfile] = useState(null);
  const [page, setPage] = useState('coach');
  const [dataLoading, setDataLoading] = useState(true);

  const [coachSessionId, setCoachSessionId] = useState(null);
  const [coachMessages, setCoachMessages] = useState([]);
  const coachCreatePromiseRef = useRef(null);
  const coachSessionIdRef = useRef(null);
  coachSessionIdRef.current = coachSessionId;

  const ensureCoachSession = useCallback(async () => {
    if (coachSessionIdRef.current) return coachSessionIdRef.current;
    if (!coachCreatePromiseRef.current) {
      coachCreatePromiseRef.current = api.post('/api/coach/session', { type: 'chat' })
        .then((res) => res.data.session_id);
    }
    const id = await coachCreatePromiseRef.current;
    setCoachSessionId(id);
    return id;
  }, []);

  const refreshAppData = useCallback(async () => {
    try {
      const [pRes, gRes, cRes] = await Promise.all([
        api.get('/api/profile'),
        api.get('/api/goals'),
        api.get('/api/checkins?limit=60'),
      ]);
      setProfile(pRes.data ?? null);
      setGoals((gRes.data || []).map(normalizeGoal));
      setCheckins(cRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAppData();
  }, [refreshAppData]);

  const weekEnergy = useMemo(() => buildWeekEnergy(checkins), [checkins]);

  const togglePlanItem = (id) => {
    setPlan((prev) => prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item)));
  };

  const addPlanItem = (text, tag = 'habit') => {
    const t = (text || '').trim();
    if (!t) return;
    const id = Date.now();
    setPlan((prev) => [...prev, { id, text: t, done: false, tag }]);
  };

  const editPlanItem = (id, updates) => {
    setPlan((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const removePlanItem = (id) => {
    setPlan((prev) => prev.filter((item) => item.id !== id));
  };

  useEffect(() => {
    try { localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(plan)); } catch (e) { /* ignore */ }
  }, [plan]);

  return (
    <AppContext.Provider value={{
      plan,
      togglePlanItem,
        addPlanItem,
        editPlanItem,
        removePlanItem,
      goals,
      checkins,
      profile,
      weekEnergy,
      dataLoading,
      refreshAppData,
      page,
      setPage,
      coachSessionId,
      setCoachSessionId,
      coachMessages,
      setCoachMessages,
      ensureCoachSession,
    }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
