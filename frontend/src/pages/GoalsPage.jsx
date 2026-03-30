import { useState, useEffect } from 'react';
import api from '../lib/api';
import { useApp, normalizeGoal } from '../context/AppContext';

const TAG_OPTIONS = ['workout', 'habit', 'sleep', 'nutrition'];
const COLOR_OPTIONS = [
  { label: 'Peach',    value: 'var(--peach-dark)' },
  { label: 'Sage',     value: 'var(--sage)' },
  { label: 'Lavender', value: 'var(--lavender)' },
  { label: 'Amber',    value: '#F2C45A' },
];

function GoalCard({ goal, onDelete, onPatch, showProgressControls }) {
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(goal.progress ?? 0);

  useEffect(() => {
    setProgress(goal.progress ?? 0);
  }, [goal.progress]);

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete(goal.id);
  };

  const pushProgress = async (value) => {
    const v = Math.min(100, Math.max(0, Math.round(value)));
    setProgress(v);
    setSaving(true);
    try {
      await onPatch(goal.id, { progress: v });
    } finally {
      setSaving(false);
    }
  };

  const markComplete = async () => {
    setSaving(true);
    try {
      await onPatch(goal.id, { progress: 100, status: 'completed' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="goal-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
        <div className="goal-card-title">{goal.title}</div>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-light)', fontSize: 18, lineHeight: 1,
            padding: '0 2px', opacity: deleting ? 0.4 : 1,
          }}
        >
          ×
        </button>
      </div>

      {(goal.description || goal.desc) && (
        <div className="goal-card-desc">{goal.description || goal.desc}</div>
      )}

      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, alignItems: 'baseline' }}>
          <span style={{ fontSize: 12, color: 'var(--text-mid)' }}>Progress</span>
          <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-dark)' }}>
            {progress}
            %
            {saving ? ' …' : ''}
          </span>
        </div>
        <div className="progress-bar-bg">
          <div
            className="progress-bar-fill"
            style={{ width: `${progress}%`, background: goal.color || 'var(--peach-dark)' }}
          />
        </div>
        {showProgressControls && (
          <>
            <input
              type="range"
              min={0}
              max={100}
              value={progress}
              disabled={saving}
              onChange={(e) => setProgress(Number(e.target.value))}
              onMouseUp={(e) => pushProgress(Number(e.currentTarget.value))}
              onTouchEnd={(e) => pushProgress(Number(e.currentTarget.value))}
              style={{ width: '100%', marginTop: 10, accentColor: 'var(--peach-dark)' }}
            />
            <button
              type="button"
              className="btn btn-ghost"
              style={{ width: '100%', marginTop: 8, fontSize: 12, padding: '8px' }}
              disabled={saving}
              onClick={markComplete}
            >
              Mark complete
            </button>
          </>
        )}
      </div>

      <div className="goal-card-footer">
        <div className="goal-card-date">
          {goal.target_date ? `🎯 ${goal.target_date}` : '↻ Ongoing'}
        </div>
        <span className={`tag tag-${goal.tag || 'habit'}`}>{goal.tag || 'habit'}</span>
      </div>
    </div>
  );
}

function AddGoalModal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    title: '', desc: '', targetDate: '',
    tag: 'habit', color: 'var(--peach-dark)',
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  const setField = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleAdd = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    setError('');
    try {
      await onAdd(form);
      onClose();
    } catch (err) {
      setError('Failed to save goal. Try again.');
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(44,36,32,0.25)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, padding: 24,
    }}>
      <div style={{
        background: 'var(--warm-white)', border: '1px solid var(--border)',
        borderRadius: 18, padding: '32px 36px', width: '100%', maxWidth: 440,
      }}>
        <div style={{
          fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 300,
          color: 'var(--text-dark)', marginBottom: 20,
        }}>
          Add new goal
        </div>

        <div className="form-group">
          <label className="form-label">Goal title</label>
          <input
            className="form-input"
            placeholder="e.g. Run a 5K"
            value={form.title}
            onChange={e => setField('title', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Description <span className="form-label-sub">optional</span>
          </label>
          <input
            className="form-input"
            placeholder="What does success look like?"
            value={form.desc}
            onChange={e => setField('desc', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Target date <span className="form-label-sub">optional</span>
          </label>
          <input
            className="form-input"
            type="date"
            value={form.targetDate}
            onChange={e => setField('targetDate', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Category</label>
          <div className="select-pills">
            {TAG_OPTIONS.map(t => (
              <div
                key={t}
                className={`select-pill${form.tag === t ? ' selected' : ''}`}
                onClick={() => setField('tag', t)}
              >
                {t}
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Color</label>
          <div style={{ display: 'flex', gap: 10 }}>
            {COLOR_OPTIONS.map(c => (
              <div
                key={c.value}
                onClick={() => setField('color', c.value)}
                style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: c.value, cursor: 'pointer',
                  border: form.color === c.value
                    ? '2.5px solid var(--text-dark)'
                    : '2px solid transparent',
                  transition: 'border 0.12s',
                }}
              />
            ))}
          </div>
        </div>

        {error && (
          <div style={{
            fontSize: 12, color: '#c0524e', marginBottom: 14,
            padding: '8px 12px', background: '#FCEAEA', borderRadius: 8,
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            style={{ flex: 1, opacity: saving ? 0.6 : 1 }}
            onClick={handleAdd}
            disabled={saving || !form.title.trim()}
          >
            {saving ? 'Saving…' : 'Add goal'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GoalsPage() {
  const { refreshAppData } = useApp();
  const [goals,     setGoals]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error,     setError]     = useState('');

  useEffect(() => {
    api.get('/api/goals')
      .then(res => setGoals((res.data || []).map(normalizeGoal)))
      .catch(() => setError('Failed to load goals.'))
      .finally(() => setLoading(false));
  }, []);

  const addGoal = async (form) => {
    const res = await api.post('/api/goals', {
      title:       form.title.trim(),
      description: form.desc || null,
      target_date: form.targetDate || null,
      tag:         form.tag,
    });
    const g = normalizeGoal({ ...res.data, color: form.color });
    setGoals(prev => [g, ...prev]);
    refreshAppData();
  };

  const deleteGoal = async (id) => {
    await api.delete(`/api/goals/${id}`);
    setGoals(prev => prev.filter(g => g.id !== id));
    refreshAppData();
  };

  const patchGoal = async (id, body) => {
    const res = await api.patch(`/api/goals/${id}`, body);
    const normalized = normalizeGoal(res.data);
    setGoals(prev => prev.map(g => (g.id === id ? { ...normalized, color: g.color } : g)));
    refreshAppData();
  };

  const active    = goals.filter(g => g.status !== 'completed');
  const completed = goals.filter(g => g.status === 'completed');

  if (loading) {
    return (
      <div className="page-scroll">
        <div style={{ color: 'var(--text-light)', fontSize: 14, marginTop: 40, textAlign: 'center' }}>
          Loading goals…
        </div>
      </div>
    );
  }

  return (
    <div className="page-scroll">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="page-title">Goals</div>
          <div className="page-subtitle">
            {active.length} active · {completed.length} completed
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add goal
        </button>
      </div>

      {error && (
        <div style={{
          fontSize: 13, color: '#c0524e', marginBottom: 16,
          padding: '10px 14px', background: '#FCEAEA', borderRadius: 10,
        }}>
          {error}
        </div>
      )}

      {active.length > 0 && (
        <>
          <div style={{
            fontSize: 11, color: 'var(--text-light)', textTransform: 'uppercase',
            letterSpacing: '0.08em', fontWeight: 500, marginBottom: 12,
          }}>
            Active
          </div>
          <div className="goals-grid" style={{ marginBottom: 28 }}>
            {active.map(g => (
              <GoalCard
                key={g.id}
                goal={g}
                onDelete={deleteGoal}
                onPatch={patchGoal}
                showProgressControls
              />
            ))}
          </div>
        </>
      )}

      {completed.length > 0 && (
        <>
          <div style={{
            fontSize: 11, color: 'var(--text-light)', textTransform: 'uppercase',
            letterSpacing: '0.08em', fontWeight: 500, marginBottom: 12,
          }}>
            Completed
          </div>
          <div className="goals-grid">
            {completed.map(g => (
              <GoalCard key={g.id} goal={g} onDelete={deleteGoal} onPatch={patchGoal} />
            ))}
          </div>
        </>
      )}

      {goals.length === 0 && !error && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-light)' }}>
          <div style={{ fontSize: 36, marginBottom: 14 }}>🎯</div>
          <div style={{ fontSize: 15, color: 'var(--text-mid)', marginBottom: 6 }}>No goals yet</div>
          <div style={{ fontSize: 13, marginBottom: 20 }}>Add your first goal to get started</div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Add your first goal
          </button>
        </div>
      )}

      {showModal && (
        <AddGoalModal
          onClose={() => setShowModal(false)}
          onAdd={addGoal}
        />
      )}
    </div>
  );
}