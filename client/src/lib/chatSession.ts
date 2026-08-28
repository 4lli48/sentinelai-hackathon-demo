export function newChatSessionState() {
  return { messages: [] as Array<never>, question: "", retriesUsed: 0, copiedMessage: null as number | null };
}
