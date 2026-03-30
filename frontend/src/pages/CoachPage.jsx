import { useState, useEffect, useRef } from 'react';
import api from '../lib/api';
import RightPanel from '../components/RightPanel';
import Topbar from '../components/Topbar';
import { useApp } from '../context/AppContext';

const CHIPS = [
  "How's my sleep trend?",
  "Am I on track for my goals?",
  "What should I focus on today?",
  "Adjust my plan",
];

const OPENER = {
  id: 'opener',
  role: 'coach',
  text: "Hey! Ready to check in? Tell me how you're feeling today — sleep, energy, anything on your mind.",
};

function mapHistoryRows(rows) {
  return rows.map((m, i) => ({
    id: `${m.created_at}-${i}`,
    role: m.role === 'coach' ? 'coach' : 'user',
    text: m.content,
  }));
}

export default function CoachPage() {
  const {
    coachSessionId,
    coachMessages,
    setCoachMessages,
    ensureCoachSession,
  } = useApp();

  const coachRef = useRef({ coachSessionId, coachMessages });
  coachRef.current = { coachSessionId, coachMessages };

  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState('');
  const [starting, setStarting] = useState(() => {
    const { coachSessionId: sid, coachMessages: msgs } = coachRef.current;
    return !(sid && msgs.length > 0);
  });
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const { coachSessionId: sid, coachMessages: msgs } = coachRef.current;

      if (sid && msgs.length > 0) {
        setStarting(false);
        try {
          const hist = await api.get(`/api/coach/history/${sid}`);
          if (cancelled) return;
          const rows = hist.data || [];
          if (rows.length) setCoachMessages(mapHistoryRows(rows));
        } catch {
          /* keep in-memory transcript */
        }
        return;
      }

      setError('');
      try {
        const id = await ensureCoachSession();
        if (cancelled) return;

        const hist = await api.get(`/api/coach/history/${id}`);
        if (cancelled) return;

        const rows = hist.data || [];
        if (rows.length) {
          setCoachMessages(mapHistoryRows(rows));
        } else {
          setCoachMessages([OPENER]);
        }
      } catch {
        if (!cancelled) {
          setError('Could not connect to your coach. Make sure the server is running.');
          setCoachMessages([OPENER]);
        }
      } finally {
        if (!cancelled) setStarting(false);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [ensureCoachSession, setCoachMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [coachMessages, typing]);

  const sendMessage = async (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed || typing) return;

    const sid = coachSessionId || await ensureCoachSession();
    if (!sid) return;

    setCoachMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: 'user', text: trimmed }]);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setTyping(true);
    setError('');

    try {
      const res = await api.post('/api/coach/message', {
        session_id: sid,
        message: trimmed,
      });
      setCoachMessages((prev) => [...prev, {
        id: `c-${Date.now()}`,
        role: 'coach',
        text: res.data.reply,
      }]);
    } catch (err) {
      setError('Something went wrong. Try again.');
    } finally {
      setTyping(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const autoResize = (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  if (starting) {
    return (
      <>
        <Topbar />
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-light)', fontSize: 14,
        }}
        >
          Connecting to your coach…
        </div>
      </>
    );
  }

  return (
    <>
      <Topbar />
      <div className="chat-layout">
        <div className="chat-main">
          <div className="chat-messages">
            <div className="chat-date-sep">Today</div>

            {coachMessages.map((msg) => (
              <div key={msg.id} className={`chat-msg${msg.role === 'user' ? ' user' : ''}`}>
                {msg.role === 'coach' && <div className="coach-icon">✦</div>}
                <div className={`chat-bubble ${msg.role}`}>
                  {msg.text.split('**').map((part, i) =>
                    i % 2 === 1
                      ? <strong key={i}>{part}</strong>
                      : part,
                  )}
                </div>
              </div>
            ))}

            {typing && (
              <div className="chat-msg">
                <div className="coach-icon">✦</div>
                <div className="chat-bubble coach">
                  <div className="typing-bubble">
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div style={{
                fontSize: 12, color: '#c0524e',
                padding: '8px 12px', background: '#FCEAEA',
                borderRadius: 8, alignSelf: 'center',
              }}
              >
                {error}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <div className="chat-chips">
            {CHIPS.map((chip) => (
              <div
                key={chip}
                className="chat-chip"
                onClick={() => sendMessage(chip)}
              >
                {chip}
              </div>
            ))}
          </div>

          <div className="chat-input-bar">
            <textarea
              ref={textareaRef}
              className="chat-textarea"
              rows={1}
              placeholder="Talk to your coach..."
              value={input}
              onChange={(e) => { setInput(e.target.value); autoResize(e); }}
              onKeyDown={handleKey}
            />
            <button
              type="button"
              className="chat-send-btn"
              onClick={() => sendMessage()}
              disabled={!input.trim() || typing}
            >
              <svg viewBox="0 0 24 24">
                <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
              </svg>
            </button>
          </div>
        </div>

        <RightPanel />
      </div>
    </>
  );
}
