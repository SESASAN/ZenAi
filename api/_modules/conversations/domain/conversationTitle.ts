export const DEFAULT_CONVERSATION_TITLE = "New chat";
const MAX_TITLE_LENGTH = 32;
const MAX_PREVIEW_LENGTH = 80;

function truncate(text: string, max: number) {
  const normalized = text.trim().replace(/\s+/g, " ");
  return normalized.length > max ? `${normalized.slice(0, max).trimEnd()}...` : normalized;
}

export function buildConversationTitle(firstUserMessage: string | undefined) {
  return truncate(firstUserMessage ?? "", MAX_TITLE_LENGTH) || DEFAULT_CONVERSATION_TITLE;
}

export function buildPreview(message: string | undefined) {
  return truncate(message ?? "", MAX_PREVIEW_LENGTH);
}
