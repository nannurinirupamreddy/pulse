import { useApp } from '../context/AppContext';
import { useState } from 'react';

export default function RightPanel() {
  const { plan, togglePlanItem, goals, weekEnergy, addPlanItem, editPlanItem, removePlanItem } = useApp();
  const [newText, setNewText] = useState('');
  const [editingId, setEditingId] = useState(-1);
  const [editingText, setEditingText] = useState('');

  return (
    <aside className="right-panel">

      <div className="panel-section">
        <div className="panel-title">Today&apos;s plan</div>

        {plan.map((item) => (
          <div className="plan-item" key={item.id} style={{ alignItems: 'center' }}>
            <div
              className={`plan-check${item.done ? ' done' : ''}`}
              onClick={() => togglePlanItem(item.id)}
              onKeyDown={(e) => e.key === 'Enter' && togglePlanItem(item.id)}
              role="button"
              tabIndex={0}
            />

            {editingId === item.id ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', width: '100%' }}>
                <input value={editingText} onChange={(e) => setEditingText(e.target.value)} style={{ flex: 1 }} />
                <button onClick={() => { editPlanItem(item.id, { text: editingText.trim() || item.text }); setEditingId(-1); setEditingText(''); }} className="p-btn-primary" style={{ padding: '4px 8px' }}>Save</button>
                <button onClick={() => { setEditingId(-1); setEditingText(''); }} className="p-btn-ghost" style={{ padding: '4px 8px' }}>Cancel</button>
              </div>
            ) : (
              <>
                <div style={{ flex: 1 }}>
                  <div className={`plan-text${item.done ? ' done' : ''}`}>{item.text}</div>
                  <span className={`tag tag-${item.tag}`} style={{ marginTop: 3, display: 'inline-block' }}>{item.tag}</span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => { setEditingId(item.id); setEditingText(item.text); }} className="p-btn-ghost" style={{ padding: '4px 8px' }}>Edit</button>
                  <button onClick={() => removePlanItem(item.id)} className="p-btn-ghost" style={{ padding: '4px 8px' }}>Remove</button>
                </div>
              </>
            )}
          </div>
        ))}

        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <input placeholder="Add today's note" value={newText} onChange={(e) => setNewText(e.target.value)} style={{ flex: 1 }} />
          <button onClick={() => { if (newText.trim()) { addPlanItem(newText.trim()); setNewText(''); } }} className="p-btn-primary">Add</button>
        </div>
      </div>

      <div className="panel-section">
        <div className="panel-title">Energy this week</div>
        <div className="mood-row">
          {weekEnergy.map((d, i) => (
            <div className="mood-col" key={d.day + String(i)}>
              <div
                className={`mood-bar${d.today ? ' today' : ''}`}
                style={{
                  height: d.value > 0 ? `${(d.value / 100) * 44}px` : '4px',
                  opacity: d.value === 0 ? 0.25 : 1,
                }}
              />
              <div className="mood-day">{d.day}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel-section">
        <div className="panel-title">Goals</div>
        {goals.filter((g) => g.status !== 'completed').slice(0, 3).map((goal) => (
          <div className="panel-goal" key={goal.id}>
            <div className="panel-goal-header">
              <div className="panel-goal-name">{goal.title}</div>
              <div className="panel-goal-pct">
                {goal.progress ?? 0}
                %
              </div>
            </div>
            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{ width: `${goal.progress ?? 0}%`, background: goal.color }}
              />
            </div>
            <div className="panel-goal-sub">{goal.target_date || goal.targetDate || 'Ongoing'}</div>
          </div>
        ))}
        {!goals.length && (
          <div style={{ fontSize: 12, color: 'var(--text-light)' }}>Add goals to track them here.</div>
        )}
      </div>

    </aside>
  );
}
