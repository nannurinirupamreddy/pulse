import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function AuthCallback() {
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      window.location.href = session ? '/' : '/';
    });
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--cream)',
      fontFamily: 'var(--font-sans)',
      color: 'var(--text-mid)',
      fontSize: 14,
    }}>
      Signing you in…
    </div>
  );
}