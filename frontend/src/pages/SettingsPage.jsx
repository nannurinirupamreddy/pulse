import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import api from '../lib/api';

const FITNESS_LEVELS = ['beginner', 'intermediate', 'advanced'];
const FOCUS_AREAS    = ['gym', 'running', 'sleep', 'nutrition', 'mental health', 'habits'];
const TONE_OPTIONS   = [
  { value: 'friendly',   label: '😊 Friendly',   desc: 'Warm and encouraging' },
  { value: 'tough',      label: '💪 Tough love',  desc: 'Direct and no-nonsense' },
  { value: 'analytical', label: '📊 Analytical',  desc: 'Data-focused and precise' },
];

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { refreshAppData } = useApp();
  const [profile, setProfile] = useState({
    name:           '',
    age:            '',
    fitness_level:  'intermediate',
    focus_areas:    [],
    preferred_tone: 'friendly',
  });
  const [loading, setLoading]   = useState(true);
  const [saving,  setSaving]    = useState(false);
  const [saved,   setSaved]     = useState(false);
  const [error,   setError]     = useState('');
  const [memory,  setMemory]    = useState(null);

  useEffect(() => {
    api.get('/api/profile/memory')
      .then((res) => setMemory(res.data))
      .catch(() => setMemory(null));
  }, []);

  useEffect(() => {
    api.get('/api/profile')
      .then(res => {
        if (res.data) setProfile(res.data);
      })
      .catch(() => setError('Failed to load profile.'))
      .finally(() => setLoading(false));
  }, []);

  const set = (k, v) => setProfile(prev => ({ ...prev, [k]: v }));

  const toggleFocus = (area) => {
    const cur = profile.focus_areas || [];
    set('focus_areas', cur.includes(area)
      ? cur.filter(a => a !== area)
      : [...cur, area]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await api.patch('/api/profile', {
        name:           profile.name,
        age:            profile.age ? parseInt(profile.age) : null,
        fitness_level:  profile.fitness_level,
        focus_areas:    profile.focus_areas,
        preferred_tone: profile.preferred_tone,
      });
      await refreshAppData();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError('Failed to save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-scroll">
        <div style={{ color: 'var(--text-light)', fontSize: 14, marginTop: 40, textAlign: 'center' }}>
          Loading…
        </div>
      </div>
    );
  }

  return (
    <div className="page-scroll" style={{ maxWidth: 640 }}>
      <div className="page-header">
        <div className="page-title">Settings</div>
        <div className="page-subtitle">Your profile helps the coach personalise every conversation.</div>
      </div>

      {/* Profile */}
      <div className="settings-section">
        <div className="settings-section-title">Profile</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Name</label>
            <input
              className="form-input"
              value={profile.name || ''}
              onChange={e => set('name', e.target.value)}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Email</label>
            <input
              className="form-input"
              value={user?.email || ''}
              disabled
              style={{ opacity: 0.6, cursor: 'not-allowed' }}
            />
          </div>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Age</label>
          <input
            className="form-input"
            type="number"
            value={profile.age || ''}
            style={{ maxWidth: 120 }}
            onChange={e => set('age', e.target.value)}
          />
        </div>
      </div>

      {/* Fitness level */}
      <div className="settings-section">
        <div className="settings-section-title">Fitness level</div>
        <div className="select-pills">
          {FITNESS_LEVELS.map(level => (
            <div
              key={level}
              className={`select-pill${profile.fitness_level === level ? ' selected' : ''}`}
              onClick={() => set('fitness_level', level)}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </div>
          ))}
        </div>
      </div>

      {/* Focus areas */}
      <div className="settings-section">
        <div className="settings-section-title">Focus areas</div>
        <div style={{ fontSize: 13, color: 'var(--text-mid)', marginBottom: 12 }}>
          Pick all that apply — your coach will prioritise these.
        </div>
        <div className="select-pills">
          {FOCUS_AREAS.map(area => (
            <div
              key={area}
              className={`select-pill${(profile.focus_areas || []).includes(area) ? ' selected' : ''}`}
              onClick={() => toggleFocus(area)}
            >
              {area.charAt(0).toUpperCase() + area.slice(1)}
            </div>
          ))}
        </div>
      </div>

      {/* Coaching tone */}
      <div className="settings-section">
        <div className="settings-section-title">Coaching tone</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {TONE_OPTIONS.map(opt => (
            <div
              key={opt.value}
              onClick={() => set('preferred_tone', opt.value)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px', borderRadius: 12, cursor: 'pointer',
                border: `1px solid ${profile.preferred_tone === opt.value ? 'var(--peach)' : 'var(--border)'}`,
                background: profile.preferred_tone === opt.value ? 'var(--peach-light)' : 'var(--warm-white)',
                transition: 'all 0.12s',
              }}
            >
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-dark)' }}>{opt.label}</div>
                <div style={{ fontSize: 12, color: 'var(--text-mid)', marginTop: 2 }}>{opt.desc}</div>
              </div>
              <div style={{
                width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                border: `2px solid ${profile.preferred_tone === opt.value ? 'var(--peach-dark)' : 'var(--text-light)'}`,
                background: profile.preferred_tone === opt.value ? 'var(--peach-dark)' : 'transparent',
                transition: 'all 0.15s',
              }} />
            </div>
          ))}
        </div>
      </div>

      {/* Coach memory (read-only) */}
      <div className="settings-section">
        <div className="settings-section-title">What your coach remembers</div>
        <div style={{ fontSize: 13, color: 'var(--text-mid)', marginBottom: 12, lineHeight: 1.55 }}>
          Pulled from your conversations. It updates when you finish a coach session.
        </div>
        {memory?.summary ? (
          <div style={{
            background: 'var(--cream)',
            borderRadius: 12,
            padding: '14px 16px',
            fontSize: 13.5,
            lineHeight: 1.55,
            color: 'var(--text-dark)',
            border: '1px solid var(--border)',
          }}
          >
            {memory.summary}
          </div>
        ) : (
          <div style={{ fontSize: 13, color: 'var(--text-light)' }}>
            No memory stored yet — chat with your coach to build context.
          </div>
        )}
        {Array.isArray(memory?.known_patterns) && memory.known_patterns.length > 0 && (
          <ul style={{ marginTop: 14, paddingLeft: 18, fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.6 }}>
            {memory.known_patterns.map((p, i) => (
              <li key={i}>{typeof p === 'string' ? p : JSON.stringify(p)}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Account */}
      <div className="settings-section">
        <div className="settings-section-title">Account</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn"
            style={{ background: '#FCEAEA', color: '#c0524e', border: 'none', fontSize: 13 }}
            onClick={signOut}
          >
            Sign out
          </button>
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

      <button
        className="btn btn-primary"
        style={{ width: '100%', padding: '12px', fontSize: 14, borderRadius: 12 }}
        onClick={handleSave}
        disabled={saving}
      >
        {saved ? '✓ Saved!' : saving ? 'Saving…' : 'Save changes'}
      </button>
    </div>
  );
}