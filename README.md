# Passover Gift Portal

[cloudflarebutton]

A full-stack web application built on Cloudflare Workers, featuring a modern React frontend with Tailwind CSS and shadcn/ui components. This project demonstrates seamless integration of serverless APIs, Durable Objects for persistent state, and a responsive UI for managing Passover gift exchanges or similar collaborative features.

## Features

- **Full-Stack Cloudflare Deployment**: Single-command deployment to Cloudflare Pages with Workers for API handling.
- **Durable Objects**: Persistent storage for counters, lists (e.g., demo items for gifts), and stateful operations.
- **Modern React UI**: Built with Vite, React Router, TanStack Query, and shadcn/ui for a polished, accessible interface.
- **API-First Backend**: Hono-based routes with CORS, logging, and error handling. Extensible via `worker/userRoutes.ts`.
- **Responsive Design**: Tailwind CSS with dark mode, animations, and mobile-first layout.
- **State Management**: React Query for data fetching/caching, Zustand/Immer optional.
- **Developer Experience**: Hot reload, TypeScript, ESLint, error reporting, and theme toggling.
- **Demo Endpoints**: Health checks, counters, CRUD for demo items (easily adaptable for gifts/users).

## Tech Stack

| Category | Technologies |
|----------|--------------|
| **Backend** | Cloudflare Workers, Hono, Durable Objects |
| **Frontend** | React 18, Vite, React Router, TanStack Query |
| **UI/UX** | Tailwind CSS, shadcn/ui, Lucide Icons, Framer Motion, Sonner (Toasts) |
| **Data/State** | Durable Objects (SQLite-backed), React Query |
| **Dev Tools** | Bun, TypeScript, ESLint, Wrangler |
| **Utils** | Zod (validation), clsx/tailwind-merge, uuid |

## Quick Start

1. **Install Bun**: [bun.sh](https://bun.sh)
2. **Clone & Install**:
   ```bash
   git clone <your-repo-url>
   cd passover-gift-portal-bino7mxoqpq2t0dx2ndgi
   bun install
   ```
3. **Generate Types** (one-time):
   ```bash
   bun run cf-typegen
   ```
4. **Run Locally**:
   ```bash
   bun dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## Installation

- **Prerequisites**: Bun 1.0+, Node.js (for Wrangler), Cloudflare account.
- Run `bun install` to install all dependencies.
- Ensure Wrangler is installed: `bun add -g wrangler`.
- Update `wrangler.jsonc` with your Cloudflare account settings if needed.

## Development

- **Start Dev Server**: `bun dev` (frontend on :3000, Workers proxied).
- **Type Generation**: `bun run cf-typegen` after Worker changes.
- **Linting**: `bun lint`.
- **Build**: `bun run build` (produces `dist/` for deployment).
- **Preview**: `bun preview`.

**Extending the App**:
- Add frontend pages/routes in `src/pages/` and update `src/main.tsx`.
- Backend routes in `worker/userRoutes.ts` (don't edit `worker/index.ts`).
- Use shared types in `shared/types.ts`.
- Durable Object storage via `worker/durableObject.ts`.
- UI components in `src/components/ui/` (shadcn pre-installed).

**API Examples** (proxied at `/api/*`):
```bash
# Test
curl http://localhost:3000/api/test

# Demo data (Durable Object)
curl http://localhost:3000/api/demo

# Counter
curl http://localhost:3000/api/counter
curl -X POST http://localhost:3000/api/counter/increment
```

## Deployment

Deploy to Cloudflare with one command:

```bash
bun run deploy
```

This builds the frontend (`dist/`) and deploys the Worker via Wrangler. Assets are served as a SPA with API routes handled by the Worker.

**Manual Steps**:
1. Login: `wrangler login`
2. Deploy: `bun run build && wrangler deploy`
3. Custom Domain: Update `wrangler.jsonc` and run `wrangler deploy`.

[cloudflarebutton]

## Project Structure

```
├── src/                 # React frontend
│   ├── components/      # UI components (shadcn/ui + custom)
│   ├── pages/           # Route pages
│   ├── hooks/           # Custom hooks
│   └── lib/             # Utilities
├── worker/              # Cloudflare Worker backend
│   ├── userRoutes.ts    # Add your API routes here
│   └── durableObject.ts # Stateful storage
├── shared/              # Shared types/data
├── public/              # Static assets
└── ...                  # Configs (Vite, Tailwind, Wrangler, TS)
```

## Contributing

1. Fork & clone.
2. Create feature branch: `git checkout -b feature/xyz`.
3. Commit changes: `git commit -m "Add feature"`.
4. Push & PR.

## License

MIT License. See [LICENSE](LICENSE) for details.

## Support

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [shadcn/ui](https://ui.shadcn.com/)
- Issues: Open a GitHub issue.

Built with ❤️ for Cloudflare's edge platform.