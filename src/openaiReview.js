import OpenAI from 'openai';

export function createAiReviewer({ apiKey, model }) {
  if (!apiKey) return null;
  const client = new OpenAI({ apiKey });

  return async (text) => {
    const response = await client.responses.create({
      model,
      input: [
        {
          role: 'system',
          content: 'You review social posts for the TMONEY community. Approve only if the post genuinely discusses TMONEY or Telegram Money and is not just a meaningless keyword dump. Return strict JSON with approved (boolean) and note (short string).'
        },
        { role: 'user', content: text.slice(0, 3500) }
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'tmoney_claim_review',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              approved: { type: 'boolean' },
              note: { type: 'string' }
            },
            required: ['approved', 'note'],
            additionalProperties: false
          }
        }
      }
    });
    return JSON.parse(response.output_text);
  };
}
