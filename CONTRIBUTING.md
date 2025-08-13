# Contributing to JSONBlade

Thanks for your interest in contributing! This monorepo contains the core engine and the Monaco Editor plugin. Please follow the steps below to get started.

## Prerequisites

- Node.js >= 18
- pnpm >= 8

## Repository layout

- `packages/jsonblade`: core engine (stable)
- `packages/monaco-jsonblade`: Monaco Editor language support (stable)
- `apps/web`: demo playground (WIP)

## Setup

```bash
pnpm install
```

## Build & test

Core engine:

```bash
pnpm -C packages/jsonblade build
pnpm -C packages/jsonblade test
```

Monaco plugin:

```bash
pnpm -C packages/monaco-jsonblade build
pnpm -C packages/monaco-jsonblade test
```

Type checks / lint:

```bash
pnpm -C packages/jsonblade lint
pnpm -C packages/monaco-jsonblade check-types
```

## Development workflow

1. Create a feature branch
   - `feat/*` for features, `fix/*` for bug fixes, `docs/*` for documentation
   - Example: `git checkout -b feat/async-functions-docs`
2. Make changes with tests
3. Run all tests (core + monaco)
4. Open a Pull Request to `master`

We follow Conventional Commits for commit messages:

- `feat(core): add X`
- `fix(monaco): correct Y`
- `docs(readme): update overview`

## Pull Request Checklist

- [ ] Tests pass locally for modified packages
- [ ] Types/lint pass
- [ ] Documentation updated (README or package docs)
- [ ] PR description explains the change and rationale

## Adding filters or functions (core)

- Prefer adding tests under `packages/jsonblade/src/__tests__`
- Keep filter names concise and predictable
- Avoid side effects; filters should be pure (idempotent for same input)

## Monaco rules and validation

- Tokenizer changes: `packages/monaco-jsonblade/src/tokenizer.ts`
- Completion changes: `packages/monaco-jsonblade/src/completion-provider.ts`
- Validation changes: `packages/monaco-jsonblade/src/validation.ts`
- Add tests in `packages/monaco-jsonblade/src/__tests__`

## Reporting issues

- Use the Bug Report template
- Include minimal repro template and data if applicable
- Provide OS/Node/pnpm versions and package versions

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## Security

If you discover a vulnerability, please follow our [Security Policy](SECURITY.md).
