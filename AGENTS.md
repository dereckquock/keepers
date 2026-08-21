# Keepers fantasy football app

## Essentials

- When reporting information to me and thinking/reasoning, be extremely concise
  and sacrifice grammar for the sake of concision. Remove all filler words. No
  'the' 'is' 'am', 'are'. Direct answer only. Use short 3-6 word sentences. Run
  tools first, show the result, then stop. Do not narrate. Example: Instead of
  'The solution is to use async, say 'Use async'
- NEVER commit secrets; `.env.local` contains local/dev keys.
- Validate with `pnpm lint`.
- NEVER run migrations or deploy edge functions, DB functions, or triggers
  locally—CI handles it.
- After migration changes, remind user to run `pnpm gen:types`.
- ALWAYS leave things better than when you found them—don't introduce or leave
  any tech debt.
- Use relevant MCPs when necessary. e.g. use Context7 to get the latest docs.

## React / State Conventions (enforce proactively)

- **Derive, don't store**: if a value can be computed from existing state or
  query data, compute it — never mirror it in a separate `useState`.
- **Effects are for external sync only**: `useEffect` is for subscriptions,
  timers, and external system sync — never for orchestrating app logic, saving
  data, or deriving state. If you find yourself writing a `useEffect` that sets
  state or calls a mutation, stop and find an action-driven or query-derived
  alternative.
- **Single source of truth**: use `useQuery` for server state; never copy query
  results into local `useState`.
- **When reviewing existing code** that violates these rules, flag it
  immediately rather than iterating on the bad pattern.
