# Changelog

## Unreleased

### Added

- OpenRouter support for AI models. Set `OPENROUTER_API_KEY` to route agent model calls through OpenRouter (`@openrouter/ai-sdk-provider@2.9.1`, the AI SDK v6 line) instead of Vercel AI Gateway.
- `AI_MODEL` env var to override the model id (default `anthropic/claude-sonnet-4.6`) for either provider.
- `lib/model.ts`: `resolveModel` workflow step that picks the provider at runtime; `lib/agent.ts` now passes it to `DurableAgent` instead of a hardcoded gateway string.
