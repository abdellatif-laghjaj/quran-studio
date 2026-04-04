# ── Build stage ──
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source
COPY . .

# Build Next.js
RUN npm run build

# ── Production stage ──
FROM node:22-alpine AS runner

WORKDIR /app

# Install FFmpeg with libass (HarfBuzz for Arabic shaping) + fontconfig
RUN apk add --no-cache \
    ffmpeg \
    fontconfig

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy built app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Register project fonts with fontconfig so libass can find them
RUN mkdir -p /usr/share/fonts/app && \
    cp /app/public/fonts/*.ttf /usr/share/fonts/app/ && \
    fc-cache -fv

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
