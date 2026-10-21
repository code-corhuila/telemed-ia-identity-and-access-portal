# telemed-ia-identity-and-access-portal

> identity-and-access bounded context: web UI (remote)

Part of **TeleMed IA**, Grupo 2. Governance and documentation live in `telemed-ia-docs`.

Public pages used before having a session: sign-in (HU-02), patient registration (HU-01) and
password recovery (HU-03). They call `telemed-ia-identity-and-access-api` through the gateway.

## Technology

Angular 21 (standalone, zoneless, signals), Native Federation remote `identity`, Vitest.
Versions are pinned to the shell's (`telemed-ia-front`) because shared packages are
`singleton` + `strictVersion`.

## Integration with the shell

- Exposes `./routes` (`src/app/identity/identity.routes.ts`); the shell mounts it under `/auth`
  outside its `authGuard`.
- Uses only `shell/apiClient`, `shell/session` and `shell/apiError` (NORMA 5.4.1). Their types
  are declared in `src/shell-modules.d.ts`; unit tests resolve them to doubles in `src/testing/shell`.

## Running locally

```bash
npm ci
npm start          # http://localhost:4206 (needs the shell on :4200 for shell/* modules)
npm run test:ci    # unit tests (Vitest)
npm run build      # production bundle with remoteEntry.json
```

With Docker, on the `platform` network:

```bash
docker compose -f deploy/compose.yml up -d --build
```

## Branching

Three permanent branches. **None of them accepts a direct commit** — you enter through a child
branch and leave through a Pull Request.

```
develop  <--PR--  feat/... fix/... chore/...
qa       <--PR--  qa/...
main     <--PR--  release/...  hotfix/...
```

Promotion happens **by re-application** (`git cherry-pick -x`), never by merging one permanent
branch into another: `merge develop -> qa` and `merge qa -> main` do not exist in this model.

`main` requires **1 approval from `ariel5253`**. On `develop` and `qa` the team sets its own review
rule.

Full policy: `00-governance/branching-policy.md` in `library-docs`.
