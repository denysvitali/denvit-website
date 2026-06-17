# denv.it

Sources for [denv.it](https://denv.it) — Denys Vitali's personal homepage and
sandbox for homepage-design proposals.

The site is a single-page React app that hosts a few "proposal" routes, each
its own take on what the front page could look like.

## Routes

| Route        | Source                            | What it is                                           |
| ------------ | --------------------------------- | ---------------------------------------------------- |
| `/`          | `src/App.jsx` (`HomePage`)        | Default landing page                                 |
| `/about`     | `src/App.jsx` (`AboutPage`)       | Short bio + link to the blog                         |
| `/android/privacy` | `src/App.jsx` (`PrivacyPage`) | Privacy policy for Google Play apps                  |
| `/terminal`  | `src/proposals/TerminalHome.jsx`  | Interactive terminal sandbox with a simulated shell  |
| `/departures`| `src/proposals/DepartureBoard.jsx`| Airport-departure-board style proposal               |
| `/git`       | `src/proposals/GitGraph.jsx`      | Animated git-graph proposal                          |
| `/card`      | `src/proposals/EmployeeBadge.jsx` | Liquid-glass employee badge proposal                 |

## Stack

- [React 19](https://react.dev) + [`@vitejs/plugin-react`](https://github.com/vitejs/vite-plugin-react)
- [Vite 8](https://vite.dev) for dev server + production builds
- [Lucide](https://lucide.dev) icons
- pnpm 10 as the package manager
- [Caddy 2](https://caddyserver.com) for serving the static build

## Development

```sh
pnpm install
pnpm dev      # vite dev server on http://localhost:5173
```

## Build

```sh
pnpm build    # vite build + scripts/copy-routes.mjs
```

The build output lands in `dist/`. `scripts/copy-routes.mjs` duplicates
`dist/index.html` to a few route-specific paths so deep links work when the
static site is served with SPA fallback.

## Run the built site

```sh
pnpm preview  # vite preview on http://localhost:4173
# or
pnpm demo     # vite preview bound to 0.0.0.0:8085
```

A `Dockerfile` is included for container builds — it produces a small Caddy
image that serves `dist/` with SPA fallback (`try_files {path} /index.html`).

## Project layout

```
src/
  App.jsx                  # router + HomePage / AboutPage / PrivacyPage
  main.jsx                 # React entry point
  styles.css               # shared site styles
  proposals/               # one folder per homepage proposal
    TerminalHome.jsx       # + terminal.css
    DepartureBoard.jsx     # + departures.css
    GitGraph.jsx           # + gitgraph.css
    EmployeeBadge.jsx      # + employee-badge.css
public/                    # static assets copied as-is into dist/
scripts/
  copy-routes.mjs          # post-build SPA fallback duplication
Dockerfile                 # multi-stage build -> Caddy image
Caddyfile                  # SPA-aware static file server
```

## Conventions

- One folder per proposal under `src/proposals/`, each owning its own CSS.
- Keep new proposals self-contained — JSX + a single companion stylesheet.
- Proposals are linked from the home page; the default landing lives in
  `src/App.jsx`.