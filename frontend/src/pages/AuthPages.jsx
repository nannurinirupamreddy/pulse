import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

export function LoginPage({ onGoSignup, onBackToMarketing }) {
  const { signInWithGoogle, signInWithEmail } = useAuth();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleEmail = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signInWithEmail(email, password);
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        {onBackToMarketing && (
          <button
            type="button"
            className="btn btn-ghost"
            style={{ marginBottom: 12, padding: 0, fontSize: 13, color: 'var(--text-mid)' }}
            onClick={onBackToMarketing}
          >
            ← Back to home
          </button>
        )}
        <div className="auth-logo">Pulse ✦</div>
        <div className="auth-sub">Welcome back. Your coach has been waiting.</div>

        <button type="button" className="auth-google-btn" onClick={signInWithGoogle}>
          <GoogleIcon />
          Continue with Google
        </button>

        <div className="auth-divider">or</div>

        <form onSubmit={handleEmail}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 7 }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
              <a href="#" style={{ fontSize: 12, color: 'var(--peach-dark)', textDecoration: 'none' }}>
                Forgot?
              </a>
            </div>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
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
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: 14, borderRadius: 12 }}
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?{' '}
          <a href="#" onClick={e => { e.preventDefault(); onGoSignup(); }}>Sign up</a>
        </div>
      </div>
    </div>
  );
}

export function SignupPage({ onGoLogin, onBackToMarketing }) {
  const { signInWithGoogle, signUpWithEmail } = useAuth();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [sent,     setSent]     = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signUpWithEmail(email, password);
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="auth-wrap">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>✉️</div>
          <div className="auth-logo" style={{ marginBottom: 8 }}>Check your email</div>
          <div className="auth-sub">
            We sent a confirmation link to <strong>{email}</strong>.
            Click it to activate your account.
          </div>
          <button
            className="btn btn-ghost"
            style={{ marginTop: 20 }}
            onClick={() => setSent(false)}
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        {onBackToMarketing && (
          <button
            type="button"
            className="btn btn-ghost"
            style={{ marginBottom: 12, padding: 0, fontSize: 13, color: 'var(--text-mid)' }}
            onClick={onBackToMarketing}
          >
            ← Back to home
          </button>
        )}
        <div className="auth-logo">Pulse ✦</div>
        <div className="auth-sub">Start your health journey. Free, no credit card.</div>

        <button type="button" className="auth-google-btn" onClick={signInWithGoogle}>
          <GoogleIcon />
          Continue with Google
        </button>

        <div className="auth-divider">or</div>

        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label">
              Password <span className="form-label-sub">min 8 characters</span>
            </label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              minLength={8}
              required
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
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: 14, borderRadius: 12 }}
            disabled={loading}
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <a href="#" onClick={e => { e.preventDefault(); onGoLogin(); }}>Sign in</a>
        </div>
      </div>
    </div>
  );
}