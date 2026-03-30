const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: {
    temperature: 0.85,
    maxOutputTokens: 1024,
  },
});

async function chat(systemPrompt, history, userMessage) {
  const formattedHistory = history.map(msg => ({
    role: msg.role === 'coach' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));

  const chatSession = model.startChat({
    history: [
      // Inject system prompt as the first user/model exchange
      { role: 'user',  parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: "Understood. I'm ready to coach." }] },
      ...formattedHistory,
    ],
  });

  const result = await chatSession.sendMessage(userMessage);
  return result.response.text();
}

module.exports = { chat };