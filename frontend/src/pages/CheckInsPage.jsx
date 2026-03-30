import { useState, useEffect } from 'react';
import api from '../lib/api';
import { useApp } from '../context/AppContext';

const SLIDER_FIELDS = [
  { key: 'sleep',    label: 'Sleep',    leftLabel: '0h',       rightLabel: '10h',          min: 0, max: 10, step: 0.5, unit: 'hrs' },
  { key: 'energy',   label: 'Energy',   leftLabel: 'Drained',  rightLabel: 'Energised',    min: 1, max: 10, step: 1 },
  { key: 'stress',   label: 'Stress',   leftLabel: 'Calm',     rightLabel: 'Very stressed', min: 1, max: 10, step: 1 },
  { key: 'soreness', label: 'Soreness', leftLabel: 'None',     rightLabel: 'Very sore',    min: 1, max: 10, step: 1 },
];

const TYPE_OPTIONS = [
  { value: 'morning', label: '☀️  Morning' },
  { value: 'evening', label: '🌙  Evening' },
];

function SliderField({ field, value, onChange }) {
  return (
    <div className="form-group">
      <label className="form-label">
        {field.label}
        <span className="form-label-sub">{value}{field.unit || '/10'}</span>
      </label>
      <div className="slider-row">
        <span className="slider-label-left">{field.leftLabel}</span>
        <input
          type="range"
          className="form-slider"
          min={field.min}
          max={field.max}
          step={field.step}
          value={value}
          onChange={e => onChange(field.key, Number(e.target.value))}
        />
        <span className="slider-label-right">{field.rightLabel}</span>
      </div>
    </div>
  );
}

function valueColor(val, invert = false) {
  const good = invert ? val <= 4 : val >= 7;
  const bad  = invert ? val >= 7 : val <= 4;
  if (good) return 'var(--sage-dark)';
  if (bad)  return '#c0524e';
  return 'var(--text-dark)';
}

export default function CheckInsPage() {
  const { refreshAppData } = useApp();
  const [type,      setType]      = useState('morning');
  const [values,    setValues]    = useState({ sleep: 7, energy: 7, stress: 3, soreness: 2 });
  const [notes,     setNotes]     = useState('');
  const [history,   setHistory]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');

  useEffect(() => {
    api.get('/api/checkins?limit=10')
      .then(res => setHistory(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSlider = (key, val) => setValues(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await api.post('/api/checkins', {
        type,
        sleep_hours:    values.sleep,
        energy_level:   values.energy,
        stress_level:   values.stress,
        soreness_level: values.soreness,
        notes:          notes || null,
      });
      setHistory(prev => [res.data, ...prev]);
      setNotes('');
      refreshAppData();
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 2500);
    } catch (err) {
      setError('Failed to save check-in. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const avgOf = (key) => {
    if (!history.length) return '—';
    const vals = history.map(c => c[key]).filter(Boolean);
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '—';
  };

  return (
    <div className="page-scroll">
      <div className="page-header">
        <div className="page-title">Check-ins</div>
        <div className="page-subtitle">Log how you're feeling — your coach uses this to adapt your plan.</div>
      </div>

      <div className="checkin-grid">

        {/* Form */}
        <div className="card">
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {TYPE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                className={`select-pill${type === opt.value ? ' selected' : ''}`}
                onClick={() => setType(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {SLIDER_FIELDS
            .filter(f => !(type === 'evening' && f.key === 'sleep'))
            .map(field => (
              <SliderField
                key={field.key}
                field={field}
                value={values[field.key]}
                onChange={handleSlider}
              />
            ))
          }

          <div className="form-group">
            <label className="form-label">
              Notes <span className="form-label-sub">optional</span>
            </label>
            <textarea
              className="form-input"
              placeholder="Anything on your mind? Skipped a workout, stressful day, new PR…"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          {error && (
            <div style={{
              fontSize: 12, color: '#c0524e', marginBottom: 14,
              padding: '8px 12px', background: '#FCEAEA', borderRadius: 8,
            }}>
              {error}
            </div>
          )}

          <button
            className="btn btn-primary"
            style={{ width: '100%', padding: '11px', borderRadius: 10 }}
            onClick={handleSubmit}
            disabled={saving}
          >
            {submitted ? '✓ Logged!' : saving ? 'Saving…' : `Submit ${type} check-in`}
          </button>
        </div>

        {/* History + averages */}
        <div>
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="card-title">Recent check-ins</div>

            {loading ? (
              <div style={{ fontSize: 13, color: 'var(--text-light)', padding: '12px 0' }}>
                Loading…
              </div>
            ) : history.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--text-light)', padding: '12px 0' }}>
                No check-ins yet — submit your first one!
              </div>
            ) : (
              <div>
                {/* Header row */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '90px 1fr 1fr 1fr 1fr',
                  padding: '0 0 8px',
                  borderBottom: '1px solid var(--border)',
                }}>
                  {['Date', 'Sleep', 'Energy', 'Stress', 'Soreness'].map(h => (
                    <div key={h} style={{ fontSize: 10, color: 'var(--text-light)', textAlign: h === 'Date' ? 'left' : 'center', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {h}
                    </div>
                  ))}
                </div>

                {history.map((c, i) => (
                  <div key={c.id || i} style={{
                    display: 'grid', gridTemplateColumns: '90px 1fr 1fr 1fr 1fr',
                    padding: '10px 0',
                    borderBottom: i < history.length - 1 ? '1px solid var(--border)' : 'none',
                    alignItems: 'center',
                  }}>
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--text-mid)', fontWeight: 500 }}>
                        {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-light)', marginTop: 1 }}>{c.type}</div>
                    </div>
                    <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 500, color: valueColor(c.sleep_hours, false) }}>
                      {c.sleep_hours != null ? `${c.sleep_hours}h` : '—'}
                    </div>
                    <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 500, color: valueColor(c.energy_level) }}>
                      {c.energy_level ?? '—'}
                    </div>
                    <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 500, color: valueColor(c.stress_level, true) }}>
                      {c.stress_level ?? '—'}
                    </div>
                    <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 500, color: 'var(--text-dark)' }}>
                      {c.soreness_level ?? '—'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Averages */}
          <div className="card">
            <div className="card-title">Averages ({history.length} check-ins)</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Avg sleep',    val: avgOf('sleep_hours'),    unit: 'hrs', color: 'var(--lavender)' },
                { label: 'Avg energy',   val: avgOf('energy_level'),   unit: '/10', color: 'var(--peach-dark)' },
                { label: 'Avg stress',   val: avgOf('stress_level'),   unit: '/10', color: '#c0524e' },
                { label: 'Avg soreness', val: avgOf('soreness_level'), unit: '/10', color: 'var(--sage)' },
              ].map(stat => (
                <div key={stat.label} style={{ background: 'var(--cream)', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-light)', marginBottom: 4 }}>{stat.label}</div>
                  <div style={{ fontSize: 22, fontFamily: 'var(--font-serif)', fontWeight: 300, color: stat.color }}>
                    {stat.val}
                    <span style={{ fontSize: 12, color: 'var(--text-mid)', marginLeft: 2 }}>{stat.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}