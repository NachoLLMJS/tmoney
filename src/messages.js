export const BOT_COPY = {
  start: {
    en: 'Welcome to the TMONEY tax-share desk. Forward the original Telegram post that talks about TMONEY or Telegram Money. Do not send a screenshot or a copied link.',
    zh: '欢迎来到 TMONEY 税费分享入口。请直接转发提到 TMONEY 或 Telegram Money 的原始 Telegram 帖子。请勿发送截图或复制的链接。'
  },
  checking: {
    en: 'Checking the forwarded post now…',
    zh: '正在检查你转发的帖子……'
  },
  notForwarded: {
    en: 'I need the original message forwarded to this chat so its Telegram origin can be checked.',
    zh: '请把原始消息直接转发到此聊天，这样才能检查它的 Telegram 来源。'
  },
  missingMention: {
    en: 'The forwarded post does not clearly talk about TMONEY yet. Publish a real TMONEY post, then forward the original message here.',
    zh: '转发的帖子目前没有明确提到 TMONEY。请先发布真实的 TMONEY 帖子，然后把原始消息转发到这里。'
  },
  accepted: {
    en: 'Everything looks correct. You should receive your share of the taxes soon. Your claim is now pending final review.',
    zh: '看起来一切正确。你应该很快会收到属于你的税费份额。你的申请现在正等待最终审核。'
  },
  duplicate: {
    en: 'This forwarded post has already been submitted. Its existing claim remains in the review queue.',
    zh: '这条转发帖子已经提交过。现有申请仍在审核队列中。'
  },
  error: {
    en: 'I could not finish the check. Please try forwarding the original post again in a moment.',
    zh: '暂时无法完成检查。请稍后再次转发原始帖子。'
  }
};

export function bilingual(key) {
  const message = BOT_COPY[key];
  if (!message) throw new Error(`Unknown bot copy key: ${key}`);
  return `EN: ${message.en}\n\n中文: ${message.zh}`;
}
