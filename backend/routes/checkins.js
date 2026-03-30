const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');

async function getUser(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    res.status(401).json({ error: 'No token' });
    return null;
  }
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    res.status(401).json({ error: 'Invalid token' });
    return null;
  }
  return user;
}

router.post('/', async (req, res) => {
  const user = await getUser(req, res);
  if (!user) return;

  try {
    const { type, sleep_hours, energy_level, stress_level, soreness_level, notes } = req.body;

    if (!type) return res.status(400).json({ error: 'type required (morning or evening)' });

    const { data, error } = await supabase.from('checkins').insert({
      user_id: user.id,
      type,
      sleep_hours,
      energy_level,
      stress_level,
      soreness_level,
      notes,
      date: new Date().toISOString().split('T')[0],
    }).select().single();

    if (error) throw error;
    return res.status(201).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

router.get('/', async (req, res) => {
  const user = await getUser(req, res);
  if (!user) return;

  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 14, 90);

    const { data, error } = await supabase
      .from('checkins')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

router.get('/today', async (req, res) => {
  const user = await getUser(req, res);
  if (!user) return;

  try {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('checkins')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return res.status(200).json(data ?? null);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

module.exports = router;
