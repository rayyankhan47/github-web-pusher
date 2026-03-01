# GitHub Web Pusher

Browser extension scaffold for capturing code from webpages and pushing commits to GitHub.

## Current status
- Project scaffolding is initialized (TypeScript + Vite + React UI shells).
- Manifest and extension permissions are implemented in the next checklist step.

## Local setup
1. Install dependencies:
   - `npm install`
2. Build the extension:
   - `npm run build`
3. Open your browser extension page:
   - Chrome: `chrome://extensions`
4. Enable **Developer mode**.
5. Click **Load unpacked** and select the generated `dist` folder.

## Available scripts
- `npm run dev` - watch mode build
- `npm run build` - production build
- `npm run typecheck` - TypeScript checks
- `npm run lint` - ESLint checks (no warnings allowed)
- `npm run format` - apply Prettier formatting
- `npm run format:check` - verify Prettier formatting
