const express  = require('express');
const router   = express.Router();
const { supabase } = require('../lib/supabase');

async function getUser(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) { res.status(401).json({ error: 'No token' }); return null; }
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) { res.status(401).json({ error: 'Invalid token' }); return null; }
  return user;
}

// GET /api/profile
router.get('/', async (req, res) => {
  const user = await getUser(req, res);
  if (!user) return;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows, that's fine
    res.json(data || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/profile — create (called after onboarding)
router.post('/', async (req, res) => {
  const user = await getUser(req, res);
  if (!user) return;

  try {
    const { name, age, fitness_level, focus_areas, preferred_tone } = req.body;

    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id:             user.id,
        name:           name           || null,
        age:            age            || null,
        fitness_level:  fitness_level  || 'intermediate',
        focus_areas:    focus_areas    || [],
        preferred_tone: preferred_tone || 'friendly',
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/profile — update settings
router.patch('/', async (req, res) => {
  const user = await getUser(req, res);
  if (!user) return;

  try {
    const allowed = ['name', 'age', 'fitness_level', 'focus_areas', 'preferred_tone'];
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => allowed.includes(k))
    );

    if (!Object.keys(updates).length) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/profile/memory — coach's knowledge about the user
router.get('/memory', async (req, res) => {
  const user = await getUser(req, res);
  if (!user) return;

  try {
    const { data, error } = await supabase
      .from('coach_memory')
      .select('summary, known_patterns, last_updated')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    res.json(data || { summary: '', known_patterns: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;