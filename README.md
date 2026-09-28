# TMONEY Meme HQ

A hand-drawn meme landing page plus a bilingual Telegram claim bot.

## Configure

Create an environment file outside the repository and point `TMONEY_ENV_FILE` to its absolute path

Required for the bot:

- `TELEGRAM_BOT_TOKEN`: token from BotFather
- `TELEGRAM_BOT_USERNAME`: bot username without `@`
- `BOT_ENABLED=true`

Optional AI review:

- `OPENAI_API_KEY`
- `OPENAI_MODEL=gpt-4o-mini`

The OpenAI key is server-side only. The website receives only the public bot username.

## Run

```text
npm install
npm start
```

Open `http://127.0.0.1:4173`.

## Claim logic

1. The user forwards the original Telegram message to the bot.
2. The bot requires Telegram's `forward_origin` field.
3. The post must clearly mention TMONEY or Telegram Money.
4. If OpenAI is configured, a low-cost model performs an additional semantic review.
5. A unique forward-origin fingerprint prevents duplicate submissions.
6. Accepted claims are stored in `data/claims.json` as `pending_review`.

This prototype does not transfer tokens or taxes. Payment settlement must be added later with an explicit admin/on-chain approval flow.
