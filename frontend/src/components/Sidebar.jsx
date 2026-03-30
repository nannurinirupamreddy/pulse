import { useApp, checkinStreak } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { getUserDisplayName, getUserInitial } from '../lib/userDisplay';

const NAV = [
  {
    section: 'Main',
    items: [
      { id: 'coach', label: 'Coach', icon: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/> },
      { id: 'dashboard', label: 'Dashboard', icon: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></> },
    ],
  },
  {
    section: 'Track',
    items: [
      { id: 'checkins', label: 'Check-ins', icon: <><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></> },
      { id: 'progress', label: 'Progress', icon: <path d="M18 20V10M12 20V4M6 20v-6"/> },
      { id: 'goals', label: 'Goals', icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/> },
    ],
  },
  {
    section: 'You',
    items: [
      { id: 'settings', label: 'Settings', icon: <><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></> },
    ],
  },
];

export default function Sidebar() {
  const { page, setPage, profile, checkins } = useApp();
  const { user } = useAuth();
  const displayName = getUserDisplayName(user, profile);
  const initial = getUserInitial(user, profile);
  const streak = checkinStreak(checkins);

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-name">Pulse</div>
        <div className="sidebar-logo-tag">your personal health coach</div>
      </div>

      <nav className="sidebar-nav">
        {NAV.map(({ section, items }) => (
          <div key={section}>
            <div className="nav-section-label">{section}</div>
            {items.map(({ id, label, icon }) => (
              <div
                key={id}
                className={`nav-item${page === id ? ' active' : ''}`}
                onClick={() => setPage(id)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round">
                  {icon}
                </svg>
                {label}
              </div>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div
          className="sidebar-avatar-row"
          onClick={() => setPage('settings')}
          onKeyDown={(e) => e.key === 'Enter' && setPage('settings')}
          role="button"
          tabIndex={0}
        >
          <div className="sidebar-avatar">{initial}</div>
          <div>
            <div className="sidebar-user-name">{displayName}</div>
            <div className="sidebar-streak">
              {streak > 0 ? `Day ${streak} streak 🔥` : 'Log check-ins for a streak'}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}