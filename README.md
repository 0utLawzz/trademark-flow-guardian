# Trademark Flow Guardian

## Overview

`trademark-flow-guardian` is a web application that helps protect and manage trademark workflows. It provides a modern UI built with Vite, React, and Tailwind (optional) and integrates with Supabase for backend data.

## Prerequisites

- **Node.js** (>=18) or **Bun** (recommended for faster installs)
- **Git** (for version control)
- **Supabase** CLI (optional, if you want to run the local Supabase stack)

## Installation

```bash
# Clone the repository
git clone https://github.com/0utLawzz/trademark-flow-guardian.git
cd trademark-flow-guardian

# Install dependencies (using Bun if available, otherwise npm)
# Bun (recommended)
bun install

# npm fallback
npm install
```

## Development

Run the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the port shown in the console).

## Building for Production

```bash
npm run build
```

The compiled assets will appear in the `dist/` folder.

## Deployment

Deploy the `dist/` folder to any static‑hosting provider (Vercel, Netlify, GitHub Pages, etc.). Ensure environment variables are set in the target environment.

## Git Workflow (see `docs/GIT_GUIDE.md` for details)

- Create a feature branch: `git checkout -b feature/your‑feature`
- Commit often: `git commit -m "feat: description"`
- Push changes: the repository includes a **post‑commit hook** that automatically pushes the current branch to GitHub after each commit.
- Open a Pull Request on GitHub.

## Client‑Group Dashboard

The application now includes a **Client‑Group** section where you can:

- Select a client group (data is fetched from Supabase).
- View all cases belonging to that group, with status, journal number, TM number, and assignment details.
- Assign a case to a user (Code, Name, City) via a modal.
- Filter by *Journal No*, *TM No*, or free‑text search.
- Print the case list or export it as a PDF (brand logo, address, contact & payment details are displayed in the report).

## Contributing

Please read the [Git Guide](docs/GIT_GUIDE.md) for contribution standards and commit‑message conventions.

## License

MIT License – see the `LICENSE` file for details.
