# SvelteKit (adapter-node) → a real Node server. The known NPC pages are
# prerendered at build time for speed; the server also handles dynamic requests
# and its own 404s (no per-site Caddyfile needed). Multi-stage so the runtime
# image carries only the built server.
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json .npmrc* ./
RUN npm ci

COPY . .
# `npm run build` runs prepare-data (pulls @geptyro/gw1-bestiary) then vite build.
# Raise the fd soft limit to the hard limit first: prerendering ~2.3k pages
# trips EMFILE under the Fly remote builder's default 1024.
RUN ulimit -n "$(ulimit -Hn)" && npm run build

# --- runtime image ------------------------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# adapter-node bundles the server into build/. server.js is a thin custom entry
# that wraps build/handler.js to set this site's own asset Cache-Control (keeps
# the gateway path-agnostic). package.json carries "type":"module" for the ESM.
COPY --from=builder /app/build ./build
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/package.json ./package.json

# The gateway terminates TLS and forwards over .flycast; this app is never public.
ENV HOST=0.0.0.0
ENV PORT=8080
EXPOSE 8080

USER node
CMD ["node", "server.js"]
