FROM node:24-trixie-slim
LABEL org.opencontainers.image.authors="github.com/houthacker"

EXPOSE 3000

WORKDIR /app
COPY . .

# Prepare the template .env file
RUN mv .docker/.env.template .env

# Change default shell to bash
RUN chsh -s /usr/bin/bash

# Install dependencies and build
RUN npm ci
RUN npm run build

# Override env file using --build-arg ENV_FILE=...
ARG ENV_FILE='/config/.env'
ARG NEXT_DIST_DIR='/app/dist'

# The environment file containing the actual, non-template env vars.
ENV ENV_FILE=${ENV_FILE}
ENV NEXT_DIST_DIR=${NEXT_DIST_DIR}

ENTRYPOINT [ "/app/scripts/entrypoint.sh" ]