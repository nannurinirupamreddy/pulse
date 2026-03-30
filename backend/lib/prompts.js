function buildSystemPrompt({ profile, goals, memory, todayCheckin }) {
    const focusAreas = profile?.focus_areas?.join(', ') || 'general health';
    const tone = profile?.preferred_tone || 'friendly';
  
    const toneInstructions = {
      friendly:   'Be warm, encouraging and supportive. Celebrate small wins. Use the user\'s name occasionally.',
      tough:      'Be direct and no-nonsense. Don\'t sugarcoat. Hold them accountable firmly but fairly.',
      analytical: 'Be data-driven and precise. Reference specific numbers and patterns. Keep emotion minimal.',
    };
  
    const activeGoals = goals
      ?.filter(g => g.status === 'active')
      .map(g => `- "${g.title}" (${g.progress}% complete${g.target_date ? `, target: ${g.target_date}` : ''})`)
      .join('\n') || 'No active goals set yet.';
  
    const memoryContext = memory?.summary
      ? `\nWhat you know about this person:\n${memory.summary}`
      : '';
  
    const patterns = memory?.known_patterns?.length
      ? `\nKnown patterns:\n${memory.known_patterns.map(p => `- ${p}`).join('\n')}`
      : '';
  
    const injuries = memory?.injuries?.length
      ? `\nInjuries/limitations to respect:\n${memory.injuries.map(i => `- ${i}`).join('\n')}`
      : '';
  
    const checkinContext = todayCheckin
      ? `\nToday's check-in data:
  - Sleep: ${todayCheckin.sleep_hours}h
  - Energy: ${todayCheckin.energy_level}/10
  - Stress: ${todayCheckin.stress_level}/10
  - Soreness: ${todayCheckin.soreness_level}/10
  ${todayCheckin.notes ? `- Notes: ${todayCheckin.notes}` : ''}`
      : "\nNo check-in logged yet today — you can ask how they're feeling.";
  
    return `You are Pulse, a personal AI health coach. You are not a generic chatbot — you are this specific person's coach who knows their history, goals, and patterns.
  
  About the person you're coaching:
  - Name: ${profile?.name || 'there'}
  - Age: ${profile?.age || 'unknown'}
  - Fitness level: ${profile?.fitness_level || 'intermediate'}
  - Focus areas: ${focusAreas}
  
  Coaching style: ${toneInstructions[tone] || toneInstructions.friendly}
  
  Their active goals:
  ${activeGoals}
  ${memoryContext}${patterns}${injuries}
  ${checkinContext}
  
  Your rules:
  - Keep responses concise — 2 to 4 sentences unless they ask for a detailed plan
  - Always be specific, never generic. Reference their actual data and goals by name
  - If they mention skipping a workout or struggling, acknowledge it without judgment then redirect
  - When you adapt their plan, explain why briefly
  - You remember everything from past conversations via your memory context above
  - Never say you're an AI or that you can't do something — just coach them
  - If today's energy or sleep is low, proactively adjust recommendations before they ask`;
  }
  
  function buildMemoryUpdatePrompt(conversationText, existingMemory) {
    return `You are updating a health coach's memory file about a client after a conversation.
  
  Existing memory summary:
  ${existingMemory?.summary || 'None yet.'}
  
  Known patterns: ${JSON.stringify(existingMemory?.known_patterns || [])}
  Injuries: ${JSON.stringify(existingMemory?.injuries || [])}
  
  Recent conversation:
  ${conversationText}
  
  Update the memory by extracting:
  1. Any new patterns you noticed (e.g. "skips workouts when stressed", "low energy on Mondays")
  2. Any injuries or physical limitations mentioned
  3. Any personal preferences revealed
  4. A concise updated summary of who this person is and what they're working on
  
  Respond ONLY with valid JSON in this exact format, no markdown:
  {
    "summary": "updated summary here",
    "known_patterns": ["pattern 1", "pattern 2"],
    "injuries": ["injury 1"],
    "preferences": {"key": "value"}
  }`;
  }
  
  module.exports = { buildSystemPrompt, buildMemoryUpdatePrompt };