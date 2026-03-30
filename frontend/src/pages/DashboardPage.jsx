import { useMemo } from 'react';
import { useApp, checkinStreak } from '../context/AppContext';
import Topbar from '../components/Topbar';

function formatShortDate(isoDate) {
  if (!isoDate) return '—';
  const d = new Date(`${isoDate}T12:00:00`);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function DashboardPage() {
  const { goals, plan, checkins } = useApp();
  const completed = plan.filter((p) => p.done).length;

  const chartRows = useMemo(() => [...checkins].slice(0, 7).reverse(), [checkins]);
  const latestRow = checkins[0];
  const streak = useMemo(() => checkinStreak(checkins), [checkins]);

  const latest = latestRow
    ? {
      sleep: Number(latestRow.sleep_hours) || 0,
      energy: Number(latestRow.energy_level) || 0,
    }
    : null;

  const energyData = chartRows.map((c) => Number(c.energy_level) || 0);
  const sleepData = chartRows.map((c) => Number(c.sleep_hours) || 0);
  const maxE = Math.max(1, ...energyData, 1);
  const maxS = Math.max(1, ...sleepData, 1);

  const activeGoals = goals.filter((g) => g.status !== 'completed');

  return (
    <>
      <Topbar />
      <div className="page-scroll">

        <div className="stat-grid" style={{ marginBottom: 20 }}>
          <div className="stat-card">
            <div className="stat-label">Sleep last night</div>
            {latest ? (
              <>
                <div>
                  <span className="stat-value">{latest.sleep}</span>
                  <span className="stat-unit">hrs</span>
                </div>
                <div className={`stat-change ${latest.sleep >= 7.5 ? 'up' : 'down'}`}>
                  {latest.sleep >= 7.5 ? '↑ Above goal' : '↓ Below goal'}
                </div>
              </>
            ) : (
              <>
                <div><span className="stat-value">—</span></div>
                <div className="stat-change neutral">Log a check-in</div>
              </>
            )}
          </div>
          <div className="stat-card">
            <div className="stat-label">Energy today</div>
            {latest ? (
              <>
                <div>
                  <span className="stat-value">{latest.energy}</span>
                  <span className="stat-unit">/10</span>
                </div>
                <div className={`stat-change ${latest.energy >= 7 ? 'up' : latest.energy >= 5 ? 'neutral' : 'down'}`}>
                  {latest.energy >= 7 ? '↑ Feeling good' : latest.energy >= 5 ? '→ Moderate' : '↓ Low energy'}
                </div>
              </>
            ) : (
              <>
                <div><span className="stat-value">—</span></div>
                <div className="stat-change neutral">No data yet</div>
              </>
            )}
          </div>
          <div className="stat-card">
            <div className="stat-label">Plan progress</div>
            <div>
              <span className="stat-value">{completed}</span>
              <span className="stat-unit">
                /
                {plan.length}
              </span>
            </div>
            <div className="stat-change neutral">
              {plan.length ? `${Math.round((completed / plan.length) * 100)}% complete` : '—'}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Streak</div>
            <div>
              <span className="stat-value">{streak || '—'}</span>
              <span className="stat-unit">days</span>
            </div>
            <div className="stat-change neutral">Days with a check-in</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>

          <div className="card">
            <div className="card-title">Energy — recent</div>
            {chartRows.length ? (
              <div className="mini-bar-chart">
                {energyData.map((val, i) => (
                  <div className="mini-bar-col" key={chartRows[i].id ?? i}>
                    <div
                      className={`mini-bar${i === energyData.length - 1 ? ' highlight' : ''}`}
                      style={{ height: `${(val / maxE) * 68}px` }}
                    />
                    <div className="mini-bar-label">{formatShortDate(chartRows[i].date)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 13, color: 'var(--text-light)', padding: '20px 0' }}>
                Check-ins will appear here after you log them.
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-title">Sleep — recent</div>
            {chartRows.length ? (
              <div className="mini-bar-chart">
                {sleepData.map((val, i) => (
                  <div className="mini-bar-col" key={`s-${chartRows[i].id ?? i}`}>
                    <div
                      className={`mini-bar${i === sleepData.length - 1 ? ' highlight' : ''}`}
                      style={{ height: `${(val / maxS) * 68}px`, background: 'var(--lavender)' }}
                    />
                    <div className="mini-bar-label">{formatShortDate(chartRows[i].date)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 13, color: 'var(--text-light)', padding: '20px 0' }}>
                No sleep data yet.
              </div>
            )}
          </div>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-title">Active goals</div>
          {activeGoals.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {activeGoals.map((goal) => (
                <div key={goal.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'baseline' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-dark)' }}>{goal.title}</span>
                      <span className={`tag tag-${goal.tag || 'habit'}`}>{goal.tag || 'habit'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-light)' }}>
                        {goal.target_date || goal.targetDate || 'Ongoing'}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-dark)' }}>
                        {goal.progress ?? 0}
                        %
                      </span>
                    </div>
                  </div>
                  <div className="progress-bar-bg">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${goal.progress ?? 0}%`,
                        background: goal.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: 'var(--text-light)' }}>No active goals — add some on the Goals tab.</div>
          )}
        </div>

        <div className="card">
          <div className="card-title">Today&apos;s plan</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {plan.map((item, i) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 0',
                  borderBottom: i < plan.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: item.done ? 'var(--sage)' : 'var(--border-mid)',
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: 13.5,
                    color: item.done ? 'var(--text-light)' : 'var(--text-dark)',
                    textDecoration: item.done ? 'line-through' : 'none',
                    flex: 1,
                  }}
                >
                  {item.text}
                </span>
                <span className={`tag tag-${item.tag}`}>{item.tag}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}
