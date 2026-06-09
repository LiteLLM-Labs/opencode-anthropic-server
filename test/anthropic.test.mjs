import assert from "node:assert/strict";
import test from "node:test";

import { translateOpencodeEvent } from "../src/anthropic.mjs";

const ctx = { sessionId: "ses_123", model: "claude-sonnet-4-6" };

test("message deltas still translate to agent.message", () => {
  assert.deepEqual(
    translateOpencodeEvent(
      {
        type: "message.part.delta",
        properties: {
          sessionID: "ses_123",
          delta: { text: "hello" },
        },
      },
      ctx,
    ),
    {
      event: "agent.message",
      data: {
        content: [{ type: "text", text: "hello" }],
        model: "claude-sonnet-4-6",
      },
    },
  );
});

test("reasoning part deltas translate to agent.thinking", () => {
  assert.deepEqual(
    translateOpencodeEvent(
      {
        type: "message.part.delta",
        properties: {
          sessionID: "ses_123",
          part: { type: "reasoning" },
          delta: { text: "I should inspect the code." },
        },
      },
      ctx,
    ),
    {
      event: "agent.thinking",
      data: {
        thinking: "I should inspect the code.",
        content: [{ type: "thinking", text: "I should inspect the code." }],
        model: "claude-sonnet-4-6",
      },
    },
  );
});

test("thinking delta events translate to agent.thinking", () => {
  assert.deepEqual(
    translateOpencodeEvent(
      {
        type: "thinking_delta",
        properties: {
          sessionID: "ses_123",
          delta: { thinking: "Need a minimal patch." },
        },
      },
      ctx,
    ),
    {
      event: "agent.thinking",
      data: {
        thinking: "Need a minimal patch.",
        content: [{ type: "thinking", text: "Need a minimal patch." }],
        model: "claude-sonnet-4-6",
      },
    },
  );
});

test("reasoning delta strings translate to agent.thinking", () => {
  assert.deepEqual(
    translateOpencodeEvent(
      {
        type: "reasoning-delta",
        properties: {
          sessionID: "ses_123",
          delta: "Try the narrow fix first.",
        },
      },
      ctx,
    ),
    {
      event: "agent.thinking",
      data: {
        thinking: "Try the narrow fix first.",
        content: [{ type: "thinking", text: "Try the narrow fix first." }],
        model: "claude-sonnet-4-6",
      },
    },
  );
});

test("events for another session are dropped", () => {
  assert.equal(
    translateOpencodeEvent(
      {
        type: "thinking_delta",
        properties: {
          sessionID: "ses_other",
          delta: { thinking: "not this session" },
        },
      },
      ctx,
    ),
    null,
  );
});
