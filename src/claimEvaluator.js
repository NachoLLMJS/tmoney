const mentionPattern = /(?:\$?T[\s._-]*MONEY\b|TELEGRAM\s+MONEY)/i;

export function extractSubmissionText(message = {}) {
  return String(message.text || message.caption || '').trim();
}

function originParts(message) {
  const origin = message.forward_origin;
  if (!origin) return null;

  if (origin.type === 'channel') {
    return [origin.type, origin.chat?.id, origin.message_id ?? origin.date];
  }
  if (origin.type === 'chat') {
    return [origin.type, origin.sender_chat?.id, origin.date];
  }
  if (origin.type === 'user') {
    return [origin.type, origin.sender_user?.id, origin.date];
  }
  return [origin.type || 'hidden', origin.sender_user_name || 'anonymous', origin.date];
}

export function claimFingerprint(message) {
  const parts = originParts(message);
  if (!parts) return null;
  return parts.map((part) => String(part ?? 'unknown')).join(':');
}

export async function evaluateClaim(message, { aiReview } = {}) {
  if (!message?.forward_origin) return { ok: false, reason: 'not_forwarded' };

  const text = extractSubmissionText(message);
  if (mentionPattern.test(text)) {
    if (aiReview) {
      const review = await aiReview(text);
      if (review?.approved === false) return { ok: false, reason: 'ai_rejected' };
      return { ok: true, reason: 'accepted_ai', review };
    }
    return { ok: true, reason: 'accepted_keyword' };
  }

  return { ok: false, reason: 'missing_tmoneymatch' };
}
