import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

const FITNESS_LEVELS = ['beginner', 'intermediate', 'advanced'];
const FOCUS_AREAS    = ['gym', 'running', 'sleep', 'nutrition', 'mental health', 'habits'];
const TONE_OPTIONS   = [
  { value: 'friendly',   label: '😊 Friendly',   desc: 'Warm and encouraging' },
  { value: 'tough',      label: '💪 Tough love',  desc: 'Direct and no-nonsense' },
  { value: 'analytical', label: '📊 Analytical',  desc: 'Data-focused and precise' },
];

const STEPS = ['About you', 'Your focus', 'Coach style', 'First goal'];

export default function OnboardingPage({ onComplete }) {
  const { createProfile } = useAuth();
  const [step,    setStep]    = useState(0);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');
  const [data,    setData]    = useState({
    name:          '',
    age:           '',
    fitnessLevel:  'intermediate',
    focusAreas:    [],
    preferredTone: 'friendly',
    firstGoal:     '',
  });

  const set = (k, v) => setData(prev => ({ ...prev, [k]: v }));

  const toggleFocus = (area) => {
    const cur = data.focusAreas;
    set('focusAreas', cur.includes(area)
      ? cur.filter(a => a !== area)
      : [...cur, area]
    );
  };

  const canNext = () => {
    if (step === 0) return data.name.trim() && data.age;
    if (step === 1) return data.focusAreas.length > 0;
    if (step === 2) return !!data.preferredTone;
    return true;
  };

  const handleComplete = async () => {
    setSaving(true);
    setError('');
    try {
      await createProfile({
        name:           data.name.trim(),
        age:            parseInt(data.age),
        fitness_level:  data.fitnessLevel,
        focus_areas:    data.focusAreas,
        preferred_tone: data.preferredTone,
      });

      if (data.firstGoal.trim()) {
        await api.post('/api/goals', {
          title: data.firstGoal.trim(),
          tag:   'habit',
        });
      }

      onComplete?.();
    } catch (err) {
      setError('Something went wrong saving your profile. Please try again.');
      setSaving(false);
    }
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else handleComplete();
  };

  return (
    <div className="onboarding-wrap">
      <div className="onboarding-card">
        <div style={{
          fontFamily: 'var(--font-serif)', fontSize: 22,
          fontWeight: 300, color: 'var(--text-dark)', marginBottom: 28,
        }}>
          Pulse ✦
        </div>

        <div className="onboarding-step">
          STEP {step + 1} OF {STEPS.length} — {STEPS[step].toUpperCase()}
        </div>

        {/* Step 0 — About you */}
        {step === 0 && (
          <>
            <div className="onboarding-title">Let's get to know you</div>
            <div className="onboarding-sub">
              Your coach needs context to give you genuinely useful advice — not generic tips.
            </div>
            <div className="form-group">
              <label className="form-label">What should your coach call you?</label>
              <input
                className="form-input"
                placeholder="Your name"
                value={data.name}
                onChange={e => set('name', e.target.value)}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Age</label>
              <input
                className="form-input"
                type="number"
                placeholder="e.g. 20"
                style={{ maxWidth: 120 }}
                value={data.age}
                onChange={e => set('age', e.target.value)}
              />
            </div>
          </>
        )}

        {/* Step 1 — Focus areas */}
        {step === 1 && (
          <>
            <div className="onboarding-title">What are you working on?</div>
            <div className="onboarding-sub">
              Pick everything that matters. Your coach will weave all of these into their advice.
            </div>
            <div className="select-pills" style={{ marginBottom: 20 }}>
              {FOCUS_AREAS.map(area => (
                <div
                  key={area}
                  className={`select-pill${data.focusAreas.includes(area) ? ' selected' : ''}`}
                  onClick={() => toggleFocus(area)}
                >
                  {area.charAt(0).toUpperCase() + area.slice(1)}
                </div>
              ))}
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Fitness level</label>
              <div className="select-pills">
                {FITNESS_LEVELS.map(level => (
                  <div
                    key={level}
                    className={`select-pill${data.fitnessLevel === level ? ' selected' : ''}`}
                    onClick={() => set('fitnessLevel', level)}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Step 2 — Coaching tone */}
        {step === 2 && (
          <>
            <div className="onboarding-title">How should your coach talk to you?</div>
            <div className="onboarding-sub">
              Everyone responds differently. Pick what actually works for you — you can always change this later.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {TONE_OPTIONS.map(opt => (
                <div
                  key={opt.value}
                  onClick={() => set('preferredTone', opt.value)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
                    border: `1px solid ${data.preferredTone === opt.value ? 'var(--peach)' : 'var(--border)'}`,
                    background: data.preferredTone === opt.value ? 'var(--peach-light)' : 'var(--warm-white)',
                    transition: 'all 0.12s',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-dark)' }}>{opt.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-mid)', marginTop: 2 }}>{opt.desc}</div>
                  </div>
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                    border: `2px solid ${data.preferredTone === opt.value ? 'var(--peach-dark)' : 'var(--text-light)'}`,
                    background: data.preferredTone === opt.value ? 'var(--peach-dark)' : 'transparent',
                  }} />
                </div>
              ))}
            </div>
          </>
        )}

        {/* Step 3 — First goal */}
        {step === 3 && (
          <>
            <div className="onboarding-title">What's your first goal?</div>
            <div className="onboarding-sub">
              Be specific — "run a 5K by June" beats "get fit".
            </div>
            <div className="form-group">
              <label className="form-label">My goal is to…</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="e.g. Run a 5K without stopping by June 1st"
                value={data.firstGoal}
                onChange={e => set('firstGoal', e.target.value)}
              />
            </div>
            <div style={{
              padding: '12px 14px', borderRadius: 12,
              background: 'var(--sage-light)', fontSize: 13,
              color: 'var(--sage-dark)', lineHeight: 1.5,
            }}>
              ✓ Your coach will track this goal and check in on your progress automatically.
            </div>
          </>
        )}

        {error && (
          <div style={{
            marginTop: 14, fontSize: 12, color: '#c0524e',
            padding: '8px 12px', background: '#FCEAEA', borderRadius: 8,
          }}>
            {error}
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 28 }}>
          <div className="onboarding-dots">
            {STEPS.map((_, i) => (
              <div key={i} className={`onboarding-dot${i === step ? ' active' : ''}`} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {step > 0 && (
              <button className="btn btn-ghost" onClick={() => setStep(s => s - 1)}>
                Back
              </button>
            )}
            <button
              className="btn btn-primary"
              onClick={next}
              disabled={!canNext() || saving}
              style={{ opacity: canNext() && !saving ? 1 : 0.45, cursor: canNext() && !saving ? 'pointer' : 'not-allowed' }}
            >
              {saving ? 'Saving…' : step === STEPS.length - 1 ? 'Meet your coach →' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}