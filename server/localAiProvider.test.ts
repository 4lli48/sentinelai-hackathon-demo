import { describe, expect, it } from "vitest";
import { invokeLocalOllama } from "./localAiProvider";

describe("Local Ollama provider", () => {
  it("sends a local structured request and maps Ollama output to the project response shape", async () => {
    let request: RequestInit | undefined;
    const response = await invokeLocalOllama({
      maxTokens: 75,
      response_format: { type: "json_object" },
      messages: [{ role: "system", content: "Return JSON." }, { role: "user", content: "Analyse the transfer." }],
    }, {
      model: "qwen3:1.7b",
      url: "http://127.0.0.1:11434/api/chat",
      fetcher: async (_url, init) => {
        request = init;
        return new Response(JSON.stringify({ model: "qwen3:1.7b", message: { content: '{"decision":"Approve"}' }, prompt_eval_count: 12, eval_count: 8 }), { status: 200 });
      },
    });
    expect(JSON.parse(String(request?.body))).toMatchObject({ model: "qwen3:1.7b", stream: false, format: "json", options: { temperature: 0.2, num_predict: 1024 } });
    expect(response.choices[0]?.message.content).toBe('{"decision":"Approve"}');
    expect(response.usage).toMatchObject({ prompt_tokens: 12, completion_tokens: 8, total_tokens: 20 });
  });
});
