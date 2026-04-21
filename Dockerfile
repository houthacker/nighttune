FROM node:24-trixie-slim AS builder
LABEL org.opencontainers.image.authors="github.com/houthacker"

WORKDIR /app
COPY . .

# Prepare the template .env file
RUN mv .docker/.env.template .env

# Install dependencies and build
RUN npm ci
RUN npm run build

FROM node:24-trixie-slim AS runtime
LABEL org.opencontainers.image.authors="github.com/houthacker"

EXPOSE 3000

# Copy distribution build 
WORKDIR /app
COPY --from=builder --exclude=.github --exclude=.vscode --exclude=app \
    --exclude=examples --exclude=tests /app /app

# Change default shell to bash
RUN chsh -s /usr/bin/bash

# Override env file using --build-arg ENV_FILE=...
ARG ENV_FILE='/config/.env'
ARG NEXT_DIST_DIR='/app/dist'

# The environment file containing the actual, non-template env vars.
ENV ENV_FILE=${ENV_FILE}
ENV NEXT_DIST_DIR=${NEXT_DIST_DIR}

ENTRYPOINT [ "/app/scripts/entrypoint.sh" ]