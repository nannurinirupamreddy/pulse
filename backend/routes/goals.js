const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');

async function getUser(req, res) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) { res.status(401).json({ error: 'No token' }); return null; }
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) { res.status(401).json({ error: 'Invalid token' }); return null; }
    return user;
}

router.post('/', async (req, res) => {
    const user = await getUser(req, res);
    if (!user) return;
    try {
        const { title, description, target_date, tag } = req.body;
        const { data, error } = await supabase.from('goals').insert({
            user_id: user.id,
            title: title,
            description: description,
            target_date: target_date,
            tag: tag,
            status: 'active',
            progress: 0,
        }).select().single();
        if (error) throw error;
        return res.status(201).json(data);
    }
    catch (error) {
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
});

router.get('/', async (req, res) => {
    const user = await getUser(req, res);
    if (!user) return;
    try {
        const { data, error } = await supabase.from('goals').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        if (error) throw error;
        return res.status(200).json(data);
    }
    catch (error) {
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
});

router.patch('/:id', async (req, res) => {
    const user = await getUser(req, res);
    if (!user) return;
    try {
        const fields = ['title', 'description', 'target_date', 'tag', 'status', 'progress'];
        const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => fields.includes(key)));

        if (!Object.keys(updates).length) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }

        const { data, error } = await supabase.from('goals').update(updates).eq('id', req.params.id).eq('user_id', user.id).select().single();
        if (error) throw error;
        if (!data) {
            return res.status(404).json({ error: 'Goal not found' });
        }
        return res.status(200).json(data);

    }
    catch (error) {
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
});

router.delete('/:id', async (req, res) => {
    const user = await getUser(req, res);
    if (!user) return;
    try {
        const { data, error } = await supabase.from('goals').delete().eq('id', req.params.id).eq('user_id', user.id);
        if (error) throw error;
        if (!data) {
            return res.status(404).json({ error: 'Goal not found' });
        }
        return res.status(200).json({ "message": "Goal deleted successfully" });
    }
    catch (error) {
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
});

module.exports = router;