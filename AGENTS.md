# Repository Guidelines

## Project Structure & Module Organization

- App lives in `toby/` (Next.js App Router, TypeScript, Tailwind).
- Key paths: `toby/app/` (routes, `layout.tsx`, `page.tsx`, `globals.css`, fonts), `toby/components/ui/` (reusable UI), `toby/lib/` (utilities like `utils.ts`).
- Config lives in `toby/next.config.mjs`, `toby/tailwind.config.ts`, `toby/tsconfig.json`.
- Import alias `@/*` maps to `toby/*`.

## Build, Test, and Development Commands

- `cd toby`
- `npm run dev` — start local dev server at `http://localhost:3000`.
- `npm run build` — create production build.
- `npm start` — serve the built app.
- `npm run lint` — run ESLint (`next/core-web-vitals`, TypeScript rules).

## Coding Style & Naming Conventions

- TypeScript strict mode is enabled; favor typed props and return types.
- Use 2‑space indentation; keep components small and pure.
- Filenames: kebab‑case (`button.tsx`, `dropdown-menu.tsx`). Component symbols: PascalCase.
- Utilities: camelCase; prefer the `cn()` helper in `toby/lib/utils.ts` for class merging.
- Tailwind for styling; co-locate styles with components and use variants where helpful.

## Testing Guidelines

- No test framework is configured yet. If adding tests:
  - Unit: Vitest + React Testing Library.
  - E2E: Playwright.
  - Naming: `*.test.ts` / `*.test.tsx`, co-located near source or under `toby/__tests__/`.
  - Aim for 70%+ statement coverage on new/changed code.

## Commit & Pull Request Guidelines

- Git history is minimal; adopt Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`…).
- PRs should include: clear description, linked issue, screenshots for UI changes, and manual test steps.
- Before opening a PR: `npm run lint && npm run build` from `toby/`.

## Security & Configuration Tips

- Do not commit secrets. Use `.env.local`; client‑exposed keys must start with `NEXT_PUBLIC_`.
- Keep dependencies up to date; prefer `npm ci` in CI for reproducible installs.

## Agent Notes & Scope

- This guide applies repo‑wide. If a deeper `AGENTS.md` exists, it takes precedence for its subtree.
- When proposing new tools or structure, align with Next.js App Router + Tailwind first.

## rules

- 日本語で応答してください。
