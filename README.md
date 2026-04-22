# Nighttune

Nighttune is a successor of [AutotuneWeb](https://github.com/MarkMpn/AutotuneWeb).

## Introduction

Nighttune runs at <https://nighttune.app>. All user documentation is available at the Nighttune website, and therefore this README doesn't contain these docs.

## Features

- Run autotune on your Nightscout profile.
- Have the results mailed to you.
- Basal smoothing using [Savitzky-Golay](https://en.wikipedia.org/wiki/Savitzky%E2%80%93Golay_filter) filter.
- Force hourly basal recommendations for determining basal changes.

## Monitoring &amp; logging

Monitoring and logging is done using a self-hosted version of <https://openobserve.ai>. What is logged is described in the [Privacy Policy](./PRIVACY.md#data-not-relatable-to-you)

## Help

### Discord

Nighttune is present on Discord, use this invite to get there: <https://discord.gg/tjb4XuFxdV>.

### Issues

If you encounter an issue, please submit a ticket at <https://github.com/houthacker/nighttune/issues>.

### Last resort

If the above options didn't solve your problem, you can send an email describing your problem to `help at nighttune dot app`.

## Installing

The Nighttune frontend can be run by using Docker, or by installing manually, with Docker being the easiest
way to get up and running.

### Using Docker

To run the Nighttune frontend in a docker container, you should be comfortable using the unix
shell ahd the docker cli.

#### 1. Install Docker

To build the docker container, either [Docker Desktop](https://docs.docker.com/desktop/) or both
[Docker Engine](https://docs.docker.com/engine/install/) and [Docker Compose](https://docs.docker.com/compose/install/) are required, so make sure you have either option installed first.

##### Note on Windows

Running Nighttune on Windows has not been tested so please report any issues you might encounter.
Even if you're on Windows, you need access to bash. If you haven't yet, first install a tool
like [Git for Windows](https://git-scm.com/install/windows) which includes git and bash, or install
WSL which also includes git and bash, using PowerShell in administrator mode: `wsl --install`.

#### 2. Building and running

Ensure the prerequisites are running:

- `nighttune-backend` which can be found at <https://github.com/houthacker/nighttune-backend>.
- [optional] `capjs` which can be found at <https://capjs.js.org>. Set the env var `NEXT_PUBLIC_CAPTCHA_BASE_URL` to this url.
- [optional] an instance of `openobserve` for distributed logging. The installation instructions for openobserve are located at <https://openobserve.ai/docs/getting-started/>.

Checkout the repository:

```bash
git clone https://github.com/houthacker/nighttune.git

# Enter the repository root
cd nighttune
```

Then build the image, or pull it from the register.

```bash
# Prepare the .env file. The example env file contains more detailed preparation instructions.
cp examples/.env.example ~/nighttune-docker/config/.env.frontend

# Edit the env file to your needs
# ...

# Prepare the compose file. The example compose file contains more detailed 
# preparation instructions.
cp examples/compose.example.yaml ~/nighttune-docker/compose.frontend.yaml

# And then either build the image manually
docker buildx build -t nighttune:latest .

# Or, if so configured, pull the image directly from the registry and boot the container.
# In this case, please ensure the volume mounts exist at their expected paths.
docker compose -f ~/nighttune-docker/compose.frontend.yaml up -d

# The frontend should now be reachable at http://localhost:3000
```
