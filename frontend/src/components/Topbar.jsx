import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { getUserDisplayName } from '../lib/userDisplay';

const greetings = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const formatDate = () => new Date().toLocaleDateString('en-US', {
  weekday: 'long', month: 'long', day: 'numeric',
});

export default function Topbar() {
  const { setPage, profile } = useApp();
  const { user } = useAuth();
  const name = getUserDisplayName(user, profile);

  return (
    <div className="topbar">
      <div>
        <div className="topbar-greeting">{greetings()}, {name}</div>
        <div className="topbar-date">{formatDate()}</div>
      </div>
      <div className="topbar-actions">
        <button className="btn btn-sage" onClick={() => setPage('checkins')}>
          <span className="dot-indicator" />
          Morning check-in
        </button>
      </div>
    </div>
  );
}