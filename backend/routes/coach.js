const express   = require('express');
const router    = express.Router();
const { supabase } = require('../lib/supabase');
const { chat }  = require('../lib/gemini');
const { buildSystemPrompt } = require('../lib/prompts');
const { getMemory, getTodayCheckin, getRecentMessages, updateMemory } = require('../lib/memory');

// Verify Supabase session from Authorization header
async function getUser(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) { res.status(401).json({ error: 'No token' }); return null; }

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) { res.status(401).json({ error: 'Invalid token' }); return null; }
  return user;
}

// POST /api/coach/session — start or resume a session
router.post('/session', async (req, res) => {
  const user = await getUser(req, res);
  if (!user) return;

  try {
    const { type = 'chat' } = req.body;

    const { data: session, error } = await supabase
      .from('sessions')
      .insert({ user_id: user.id, type })
      .select()
      .single();

    if (error) throw error;
    res.json({ session_id: session.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/coach/message — send a message, get a coach reply
router.post('/message', async (req, res) => {
  const user = await getUser(req, res);
  if (!user) return;

  try {
    const { session_id, message } = req.body;
    if (!session_id || !message?.trim()) {
      return res.status(400).json({ error: 'session_id and message required' });
    }

    // Fetch everything the coach needs in parallel
    const [profile, goals, memory, todayCheckin, recentMessages] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single().then(r => r.data),
      supabase.from('goals').select('*').eq('user_id', user.id).eq('status', 'active').then(r => r.data),
      getMemory(user.id),
      getTodayCheckin(user.id),
      getRecentMessages(session_id, 10),
    ]);

    // Build the system prompt with full context
    const systemPrompt = buildSystemPrompt({ profile, goals, memory, todayCheckin });

    // Save user message
    await supabase.from('messages').insert({
      session_id,
      user_id: user.id,
      role: 'user',
      content: message.trim(),
    });

    // Call Gemini
    const reply = await chat(systemPrompt, recentMessages, message.trim());

    // Save coach reply
    await supabase.from('messages').insert({
      session_id,
      user_id: user.id,
      role: 'coach',
      content: reply,
    });

    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/coach/end-session — update memory when user leaves
router.post('/end-session', async (req, res) => {
  const user = await getUser(req, res);
  if (!user) return;

  try {
    const { session_id } = req.body;
    if (!session_id) return res.status(400).json({ error: 'session_id required' });

    // Run memory update in background — don't make the user wait
    updateMemory(user.id, session_id).catch(console.error);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/coach/history/:sessionId — load messages for a session
router.get('/history/:sessionId', async (req, res) => {
  const user = await getUser(req, res);
  if (!user) return;

  try {
    const { data, error } = await supabase
      .from('messages')
      .select('role, content, created_at')
      .eq('session_id', req.params.sessionId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;