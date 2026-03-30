const { supabase } = require('./supabase');
const { chat }  = require('./gemini');
const { buildMemoryUpdatePrompt } = require('./prompts');

// Read coach memory for a user
async function getMemory(userId) {
  const { data } = await supabase
    .from('coach_memory')
    .select('*')
    .eq('user_id', userId)
    .single();
  return data;
}

// Get today's check-in for a user
async function getTodayCheckin(userId) {
  const today = new Date().toISOString().split('T')[0];
  const { data } = await supabase
    .from('checkins')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ?? null;
}

// Get last N messages from current session
async function getRecentMessages(sessionId, limit = 10) {
  const { data } = await supabase
    .from('messages')
    .select('role, content')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(limit);
  return (data || []).reverse();
}

// Update coach memory after a session ends
async function updateMemory(userId, sessionId) {
  try {
    const [existingMemory, messages] = await Promise.all([
      getMemory(userId),
      getRecentMessages(sessionId, 20),
    ]);

    if (!messages.length) return;

    const conversationText = messages
      .map(m => `${m.role === 'coach' ? 'Coach' : 'User'}: ${m.content}`)
      .join('\n');

    const prompt = buildMemoryUpdatePrompt(conversationText, existingMemory);
    const raw    = await chat('', [], prompt);

    let parsed;
    try {
      parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
    } catch {
      return; // don't crash if Gemini returns malformed JSON
    }

    await supabase
      .from('coach_memory')
      .upsert({
        user_id:        userId,
        summary:        parsed.summary        || existingMemory?.summary || '',
        known_patterns: parsed.known_patterns || existingMemory?.known_patterns || [],
        injuries:       parsed.injuries       || existingMemory?.injuries || [],
        preferences:    parsed.preferences    || existingMemory?.preferences || {},
        last_updated:   new Date().toISOString(),
      }, { onConflict: 'user_id' });
  } catch (err) {
    console.error('Memory update failed:', err.message);
  }
}

module.exports = { getMemory, getTodayCheckin, getRecentMessages, updateMemory };