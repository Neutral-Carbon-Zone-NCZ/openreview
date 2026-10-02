# Changelog

## Unreleased

### Fixed

- `commitAndPush` failed on every run that changed files: the sandbox clones the PR branch as a detached HEAD, so `git push origin <branch>` had no local ref ("src refspec does not match any"). Now pushes `HEAD:refs/heads/<branch>`, and skips the commit when nothing is staged so retries after a failed push still push.
- Agent token stop condition (200k) never fired and step logs printed `[object Object]`: DurableAgent passes raw v3 usage (`{ total }` objects), not numbers. `countTokens` in `run-agent.ts` handles both.

### Added

- Vercel Sandbox works outside Vercel (e.g. Railway): set `VERCEL_TOKEN`, `VERCEL_TEAM_ID` and `VERCEL_PROJECT_ID` and every `Sandbox.create`/`Sandbox.get` call passes them explicitly (`lib/sandbox.ts`). Unset → SDK keeps using Vercel OIDC.
- OpenRouter support for AI models. Set `OPENROUTER_API_KEY` to route agent model calls through OpenRouter (`@openrouter/ai-sdk-provider@2.9.1`, the AI SDK v6 line) instead of Vercel AI Gateway.
- `AI_MODEL` env var to override the model id (default `anthropic/claude-sonnet-4.6`) for either provider.
- `lib/model.ts`: `resolveModel` workflow step that picks the provider at runtime; `lib/agent.ts` now passes it to `DurableAgent` instead of a hardcoded gateway string.
