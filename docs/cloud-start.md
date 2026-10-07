# Cloud environment

The checkout is `/workspace/websiteIeltsAi`, tracking `thaituegia/websiteIeltsAi` on GitHub. Reuse this checkout for the requested work.

## Install

```sh
bash /workspace/websiteIeltsAi/scripts/cloud-setup.sh
```

This installs the lockfile with Node.js 24+, starts the official Docker MongoDB service for the default local URI, verifies its actual ping, creates indexes/seeds content idempotently, audits content, and builds the frontend. An existing `.env` is read; an external MongoDB URI is preserved. The script does not replace secrets or clear learner progress. The npm cache is under `/workspace/.npm-cache`.

Docker and Docker Compose must be available for local MongoDB. If they are unavailable, configure a real external MongoDB service through `MONGODB_URI`; do not replace it with another database. The Docker image is pinned in `compose.yaml`. Processes and images may need to be started/downloaded again on a new machine.

## Start

For default local MongoDB:

```sh
cd /workspace/websiteIeltsAi
npm run mongo:start
npm run dev
```

`npm run dev` runs API port 3001 and Vite port 5173. For an external MongoDB service, skip the local MongoDB command. The Vite proxy keeps cookie sessions and Origin checks on the same browser origin. Internal readiness is `GET /api/health` through Vite; it must report `status: ok` and `database: mongodb`, with the actual bank counts. Provider flags show configuration presence, not a successful live call.

There are two empty demo profiles in development and at most two additional real learner registrations. Cookie sessions, drafts, flashcards, attempts and private GridFS recordings are stored in MongoDB. Do not simulate personal results or clear the development database for startup checks.

## Validation

```sh
npm test
npm run audit:content
npm run build
npm run test:e2e
```

Tests use their own database namespaces and delete only those namespaces. Browser tests start their own API/Vite on ports 3003/5175 and use installed Chromium, or Playwright Chromium if the system browser is absent. Install a browser with `npx playwright install chromium` when needed.

## Providers and hosting

Core practice works without provider credentials. Optional OpenAI, ElevenLabs and Azure speech integrations are server-only; the variable names and expected behavior are in the root README and `.env.example`. Do not print secrets, expose them via `VITE_*`, or put them into Git. In cloud settings, use `IELTS_OPENAI_API_KEY`; the reserved `OPENAI_API_KEY` name is only a supported local alias.

Azure requires the actual selected region and that region's speech hostname in the cloud network policy. An external MongoDB service likewise needs its actual host/network access. No region, voice ID or connection credential is invented.

This environment supports development and testing. It does not provide a public preview URL; localhost inside the cloud workspace is not a link the user can open. Production needs Node hosting, HTTPS `APP_ORIGIN` and a protected MongoDB service. Express can serve the production frontend and API together. See the root README and Dockerfile.

Cloud configuration changes are drafts until the user reviews/saves settings and publishes the environment. Saving a draft does not restart processes or prove restoration on a fresh machine.
