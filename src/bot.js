import { config } from './config.js';
import { bilingual } from './messages.js';
import { claimFingerprint, evaluateClaim, extractSubmissionText } from './claimEvaluator.js';
import { createClaimStore } from './claimStore.js';
import { createAiReviewer } from './openaiReview.js';
import { pathToFileURL } from 'node:url';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function createTelegramClient(token) {
  const baseUrl = `https://api.telegram.org/bot${token}`;
  return async function call(method, payload = {}) {
    const response = await fetch(`${baseUrl}/${method}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok || !data.ok) {
      throw new Error(`Telegram ${method} failed: ${data.description || response.status}`);
    }
    return data.result;
  };
}

function publicOrigin(origin = {}) {
  return {
    type: origin.type || 'unknown',
    date: origin.date || null,
    sourceMessageId: origin.message_id || null,
    sourceChatId: origin.chat?.id || origin.sender_chat?.id || null,
    sourceChatUsername: origin.chat?.username || origin.sender_chat?.username || null,
    sourceChatTitle: origin.chat?.title || origin.sender_chat?.title || null,
    senderUserId: origin.sender_user?.id || null,
    senderUsername: origin.sender_user?.username || null,
    hiddenSenderName: origin.sender_user_name || null
  };
}

export function createMessageHandler({ telegram, store, aiReview }) {
  return async function handleMessage(message) {
    const chatId = message.chat?.id;
    if (!chatId) return;

    const command = String(message.text || '').trim().split(/\s+/)[0].toLowerCase();
    if (command === '/start' || command === '/help') {
      await telegram('sendMessage', { chat_id: chatId, text: bilingual('start') });
      return;
    }

    await telegram('sendMessage', { chat_id: chatId, text: bilingual('checking') });
    const result = await evaluateClaim(message, { aiReview });

    if (!result.ok) {
      const key = result.reason === 'not_forwarded' ? 'notForwarded' : 'missingMention';
      await telegram('sendMessage', { chat_id: chatId, text: bilingual(key) });
      return;
    }

    const fingerprint = claimFingerprint(message);
    const saved = await store.add({
      fingerprint,
      status: 'pending_review',
      submittedAt: new Date().toISOString(),
      userId: message.from?.id || null,
      username: message.from?.username || null,
      firstName: message.from?.first_name || null,
      chatId,
      text: extractSubmissionText(message).slice(0, 3500),
      origin: publicOrigin(message.forward_origin),
      automatedReview: result.review || { approved: true, note: result.reason }
    });

    await telegram('sendMessage', {
      chat_id: chatId,
      text: bilingual(saved.created ? 'accepted' : 'duplicate')
    });
  };
}

export async function startBot(overrides = {}) {
  const settings = { ...config(), ...overrides };
  if (!settings.botToken) throw new Error('TELEGRAM_BOT_TOKEN is missing');

  const telegram = overrides.telegram || createTelegramClient(settings.botToken);
  const store = overrides.store || createClaimStore(settings.claimsFile);
  const rawAiReview = overrides.aiReview ?? createAiReviewer({
    apiKey: settings.openaiApiKey,
    model: settings.openaiModel
  });
  const aiReview = rawAiReview
    ? async (text) => {
        try {
          return await rawAiReview(text);
        } catch (error) {
          console.warn(`OpenAI review unavailable; keyword validation used (${error.name || 'error'})`);
          return null;
        }
      }
    : null;
  const handleMessage = createMessageHandler({ telegram, store, aiReview });
  const me = await telegram('getMe');
  console.log(`TMONEY bot ready: @${me.username}`);

  let offset = 0;
  while (true) {
    try {
      const updates = await telegram('getUpdates', {
        offset,
        timeout: 25,
        allowed_updates: ['message']
      });
      for (const update of updates) {
        offset = update.update_id + 1;
        if (!update.message) continue;
        try {
          await handleMessage(update.message);
        } catch (error) {
          console.error(`Claim handling failed: ${error.message}`);
          if (update.message.chat?.id) {
            await telegram('sendMessage', {
              chat_id: update.message.chat.id,
              text: bilingual('error')
            }).catch(() => undefined);
          }
        }
      }
    } catch (error) {
      console.error(`Telegram polling failed: ${error.message}`);
      await delay(3000);
    }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startBot().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
