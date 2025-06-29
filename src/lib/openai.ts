export async function getOpenAIChatCompletion(message: string): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: message }],
      max_tokens: 256,
    }),
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content || 'Sorry, something went wrong.';
} 