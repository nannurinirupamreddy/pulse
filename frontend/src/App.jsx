import { useState, useEffect } from 'react';
import './index.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import api from './lib/api';

import Sidebar from './components/Sidebar';
import CoachPage from './pages/CoachPage';
import DashboardPage from './pages/DashboardPage';
import CheckInsPage from './pages/CheckInsPage';
import ProgressPage from './pages/ProgressPage';
import GoalsPage from './pages/GoalsPage';
import SettingsPage from './pages/SettingsPage';
import OnboardingPage from './pages/OnboardingPage';
import AuthCallback from './pages/AuthCallback';
import LandingPage from './pages/LandingPage';
import { LoginPage, SignupPage } from './pages/AuthPages';

const PAGES = {
  coach: <CoachPage />,
  dashboard: <DashboardPage />,
  checkins: <CheckInsPage />,
  progress: <ProgressPage />,
  goals: <GoalsPage />,
  settings: <SettingsPage />,
};

function AppShell() {
  const { page } = useApp();
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        {PAGES[page] ?? <CoachPage />}
      </main>
    </div>
  );
}

function Loader({ message = 'Loading…' }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--cream)',
      fontFamily: 'var(--font-sans)',
      color: 'var(--text-light)',
      fontSize: 14,
    }}
    >
      {message}
    </div>
  );
}

function AppRouter() {
  const { user, loading } = useAuth();
  const [authView, setAuthView] = useState('login');
  const [hasProfile, setHasProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [preAuthScreen, setPreAuthScreen] = useState(() => {
    const p = window.location.pathname;
    if (p === '/' || p === '') return 'landing';
    if (p === '/signup') return 'auth';
    return 'auth';
  });

  useEffect(() => {
    if (!user) {
      setHasProfile(null);
      return;
    }
    if (loading) return;

    const cacheKey = user.id ? `pulse_has_profile_${user.id}` : null;
    const cachedOk = cacheKey && sessionStorage.getItem(cacheKey) === '1';

    if (cachedOk) {
      setHasProfile(true);
      setProfileLoading(false);
      api.get('/api/profile')
        .then((res) => {
          const ok = !!res.data;
          setHasProfile(ok);
          if (cacheKey) {
            if (ok) sessionStorage.setItem(cacheKey, '1');
            else sessionStorage.removeItem(cacheKey);
          }
        })
        .catch(() => {
          setHasProfile(false);
          if (cacheKey) sessionStorage.removeItem(cacheKey);
        });
      return;
    }

    setProfileLoading(true);
    api.get('/api/profile')
      .then((res) => {
        const ok = !!res.data;
        setHasProfile(ok);
        if (cacheKey) {
          if (ok) sessionStorage.setItem(cacheKey, '1');
          else sessionStorage.removeItem(cacheKey);
        }
      })
      .catch(() => setHasProfile(false))
      .finally(() => setProfileLoading(false));
  }, [user, loading]);

  if (window.location.pathname === '/auth/callback') {
    return <AuthCallback />;
  }

  if (loading) return <Loader />;

  if (!user && preAuthScreen === 'landing') {
    return (
      <LandingPage
        onSignIn={() => setPreAuthScreen('auth')}
        onSignUp={() => {
          setPreAuthScreen('auth');
          setAuthView('signup');
        }}
      />
    );
  }

  if (!user) {
    return authView === 'login'
      ? (
        <LoginPage
          onGoSignup={() => setAuthView('signup')}
          onBackToMarketing={() => setPreAuthScreen('landing')}
        />
      )
      : (
        <SignupPage
          onGoLogin={() => setAuthView('login')}
          onBackToMarketing={() => setPreAuthScreen('landing')}
        />
      );
  }

  if (hasProfile === null || profileLoading) {
    return <Loader message="Setting things up…" />;
  }

  if (!hasProfile) {
    return (
      <OnboardingPage
        onComplete={() => {
          if (user?.id) sessionStorage.setItem(`pulse_has_profile_${user.id}`, '1');
          setHasProfile(true);
        }}
      />
    );
  }

  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
