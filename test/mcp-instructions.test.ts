import { test } from "node:test";
import assert from "node:assert/strict";
import { INSTRUCTIONS } from "../src/mcp/server.ts";

// The hosted MCP server is the only upload path for agents with no shared
// filesystem, so the handshake instructions must teach every accepted file
// form and the transport limits — the agent can't discover docs/mcp.md.

test("instructions teach all remote file input forms", () => {
  assert.match(INSTRUCTIONS, /Uploading files/i);
  assert.match(INSTRUCTIONS, /https URL/i);
  assert.match(INSTRUCTIONS, /data:.*;name=/s, "must show the ;name= filename convention");
  assert.match(INSTRUCTIONS, /bare base64|raw base64/i);
});

test("instructions lead with the direct-upload flow", () => {
  assert.match(INSTRUCTIONS, /acculynx_request_upload/, "must name the mint tool");
  assert.match(INSTRUCTIONS, /--data-binary/, "must show the curl PUT shape");
  assert.match(INSTRUCTIONS, /409[\s\S]{0,120}(retry|used)/i, "must state 409 do-not-retry semantics");
});

test("instructions cover fileName and async 202 ingest", () => {
  assert.match(INSTRUCTIONS, /fileName/, "must mention the explicit fileName parameter");
  assert.match(INSTRUCTIONS, /202|asynchronous/i, "must warn that document ingest is async with no id returned");
});

test("instructions state the inline size ceiling and the URL fallback", () => {
  assert.match(INSTRUCTIONS, /4\.5\s?MB/i, "must mention the request-body cap");
  assert.match(INSTRUCTIONS, /3\s?MB/i, "must give the effective inline file ceiling");
  assert.match(INSTRUCTIONS, /local path.*(not|cannot|meaningless|unavailable)|no access to .*filesystem/is);
});
