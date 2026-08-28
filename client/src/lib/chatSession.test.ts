import { describe, expect, it } from "vitest";
import { newChatSessionState } from "./chatSession";

describe("newChatSessionState", () => {
  it("starts a local chat session without retaining messages or retry state", () => {
    expect(newChatSessionState()).toEqual({ messages: [], question: "", retriesUsed: 0, copiedMessage: null });
  });
});
