import { useMemo, useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import api from '../lib/api';

function BarChart({ data, max, color, labels }) {
  return (
    <div className="mini-bar-chart" style={{ height: 90 }}>
      {data.map((val, i) => (
        <div className="mini-bar-col" key={`${labels[i]}-${i}`}>
          <div
            className="mini-bar"
            style={{
              height: `${(val / max) * 76}px`,
              background: color,
              opacity: i === data.length - 1 ? 1 : 0.45,
            }}
          />
          <div className="mini-bar-label">{labels[i]}</div>
        </div>
      ))}
    </div>
  );
}

function BarChartSimple({ data, max, color, labels }) {
  if (!data.length) {
    return (
      <div style={{ fontSize: 12, color: 'var(--text-light)', padding: '24px 0' }}>Not enough check-ins yet.</div>
    );
  }
  return <BarChart data={data} max={max} color={color} labels={labels} />;
}

function InsightChip({ text, type = 'neutral' }) {
  const colors = {
    good: { bg: 'var(--sage-light)', color: 'var(--sage-dark)' },
    warning: { bg: '#FFF3DC', color: '#9B7A1A' },
    neutral: { bg: 'var(--cream)', color: 'var(--text-mid)' },
    bad: { bg: '#FCEAEA', color: '#c0524e' },
  };
  const s = colors[type];
  return (
    <div style={{
      background: s.bg,
      color: s.color,
      borderRadius: 10,
      padding: '10px 14px',
      fontSize: 13,
      lineHeight: 1.5,
    }}
    >
      {text}
    </div>
  );
}

function formatShortDate(isoDate) {
  if (!isoDate) return '';
  const d = new Date(`${isoDate}T12:00:00`);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function ProgressPage() {
  const { checkins, goals } = useApp();
  const [memory, setMemory] = useState(null);

  useEffect(() => {
    api.get('/api/profile/memory')
      .then((res) => setMemory(res.data))
      .catch(() => setMemory(null));
  }, []);

  const recent = useMemo(() => [...checkins].slice(0, 14).reverse(), [checkins]);

  const stats = useMemo(() => {
    const rows = recent.filter((c) => c.energy_level != null);
    if (!rows.length) {
      return { avgSleep: null, avgEnergy: null, avgStress: null };
    }
    const n = rows.length;
    const avgSleep = rows.reduce((s, c) => s + (Number(c.sleep_hours) || 0), 0) / n;
    const avgEnergy = rows.reduce((s, c) => s + (Number(c.energy_level) || 0), 0) / n;
    const avgStress = rows.reduce((s, c) => s + (Number(c.stress_level) || 0), 0) / n;
    return {
      avgSleep: avgSleep.toFixed(1),
      avgEnergy: avgEnergy.toFixed(1),
      avgStress: avgStress.toFixed(1),
    };
  }, [recent]);

  const workoutGoals = goals.filter((g) => g.tag === 'workout');
  const workoutSessions = workoutGoals.length;

  const stressLabels = recent.map((c) => formatShortDate(c.date));
  const stressVals = recent.map((c) => Number(c.stress_level) || 0);
  const sleepVals = recent.map((c) => Number(c.sleep_hours) || 0);
  const energyVals = recent.map((c) => Number(c.energy_level) || 0);

  const patterns = Array.isArray(memory?.known_patterns) ? memory.known_patterns : [];
  const insightNodes = [];

  if (memory?.summary) {
    insightNodes.push(
      <InsightChip key="sum" type="neutral" text={memory.summary} />,
    );
  }
  patterns.slice(0, 3).forEach((p, i) => {
    insightNodes.push(
      <InsightChip key={`p-${i}`} type="good" text={typeof p === 'string' ? p : JSON.stringify(p)} />,
    );
  });
  if (!insightNodes.length) {
    insightNodes.push(
      <InsightChip
        key="default"
        type="neutral"
        text="Keep logging check-ins and chatting with your coach — personalised insights will show up here as patterns emerge."
      />,
    );
  }

  return (
    <div className="page-scroll">
      <div className="page-header">
        <div className="page-title">Progress</div>
        <div className="page-subtitle">Trends from your check-ins — the coach uses this for context.</div>
      </div>

      <div className="stat-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-label">Avg sleep (recent)</div>
          {stats.avgSleep != null ? (
            <>
              <div>
                <span className="stat-value">{stats.avgSleep}</span>
                <span className="stat-unit">hrs</span>
              </div>
              <div className={`stat-change ${Number(stats.avgSleep) >= 7.5 ? 'up' : 'down'}`}>
                {Number(stats.avgSleep) >= 7.5 ? '↑ On target' : '↓ Under goal'}
              </div>
            </>
          ) : (
            <div><span className="stat-value">—</span></div>
          )}
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg energy (recent)</div>
          {stats.avgEnergy != null ? (
            <>
              <div>
                <span className="stat-value">{stats.avgEnergy}</span>
                <span className="stat-unit">/10</span>
              </div>
              <div className={`stat-change ${Number(stats.avgEnergy) >= 7 ? 'up' : 'neutral'}`}>
                {Number(stats.avgEnergy) >= 7 ? '↑ Good baseline' : '→ Room to improve'}
              </div>
            </>
          ) : (
            <div><span className="stat-value">—</span></div>
          )}
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg stress (recent)</div>
          {stats.avgStress != null ? (
            <>
              <div>
                <span className="stat-value">{stats.avgStress}</span>
                <span className="stat-unit">/10</span>
              </div>
              <div className={`stat-change ${Number(stats.avgStress) <= 4 ? 'up' : Number(stats.avgStress) <= 6 ? 'neutral' : 'down'}`}>
                {Number(stats.avgStress) <= 4 ? '↑ Well managed' : Number(stats.avgStress) <= 6 ? '→ Moderate' : '↓ High'}
              </div>
            </>
          ) : (
            <div><span className="stat-value">—</span></div>
          )}
        </div>
        <div className="stat-card">
          <div className="stat-label">Workout goals</div>
          <div>
            <span className="stat-value">{workoutSessions}</span>
            <span className="stat-unit">tracked</span>
          </div>
          <div className="stat-change neutral">Tagged “workout” in Goals</div>
        </div>
      </div>

      <div className="progress-grid" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="card-title">Sleep — recent check-ins</div>
          <BarChartSimple
            data={sleepVals}
            max={9}
            color="var(--lavender)"
            labels={recent.map((c) => formatShortDate(c.date))}
          />
        </div>
        <div className="card">
          <div className="card-title">Energy — recent</div>
          <BarChartSimple
            data={energyVals}
            max={10}
            color="var(--peach-dark)"
            labels={recent.map((c) => formatShortDate(c.date))}
          />
        </div>
        <div className="card">
          <div className="card-title">Goals — progress snapshot</div>
          {(() => {
            const activeSnapshot = goals.filter((g) => g.status !== 'completed').slice(0, 6);
            return activeSnapshot.length ? (
              <BarChartSimple
                data={activeSnapshot.map((g) => Number(g.progress) || 0)}
                max={100}
                color="var(--sage)"
                labels={activeSnapshot.map((g) => (
                  g.title?.length > 10 ? `${g.title.slice(0, 10)}…` : (g.title || 'Goal')
                ))}
              />
            ) : (
              <div style={{ fontSize: 12, color: 'var(--text-light)', padding: '24px 0' }}>No active goals.</div>
            );
          })()}
        </div>
        <div className="card">
          <div className="card-title">Stress — recent</div>
          <BarChartSimple data={stressVals} max={10} color="#E8875A" labels={stressLabels} />
        </div>
      </div>

      <div className="card">
        <div className="card-title">Coach memory</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {insightNodes}
        </div>
      </div>

    </div>
  );
}
