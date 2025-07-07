export default {
  async fetch(request, env, ctx) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      const apiKey = env.OPENAI_API_KEY;
      const apiUrl = 'https://api.openai.com/v1/chat/completions';
      const userInput = await request.json();

      const requestBody = {
        model: 'gpt-3.5-turbo',
        messages: userInput.messages,
        max_tokens: 300,
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errText = await response.text();
        return new Response(JSON.stringify({
          error: "⚠️ Failed to fetch from OpenAI",
          status: response.status,
          details: errText
        }), { headers: corsHeaders });
      }

      const data = await response.json();

      return new Response(JSON.stringify(data), { headers: corsHeaders });

    } catch (err) {
      return new Response(JSON.stringify({
        error: "⚠️ Worker Exception",
        details: err.message
      }), { headers: corsHeaders });
    }
  }
};
