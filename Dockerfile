FROM node:24-alpine
LABEL org.opencontainers.image.authors="github.com/houthacker"

WORKDIR /nighttune
COPY . .
RUN npm run build

WORKDIR /nighttune
CMD ["/bin/sh", "-c", "npm start"]