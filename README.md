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

Monitoring and logging is done using a self-hosted version of <https://openobserve.ai>. What is logged is decribed in
the [Privacy Policy](./PRIVACY.md#data-not-relateable-to-you)

## Help

### Discord

Nighttune is present on Discord, use this invite to get there: <https://discord.gg/tjb4XuFxdV>.

### Issues

If you encounter an issue, please submit a ticket at <https://github.com/houthacker/nighttune/issues>.

### Last resort

If the above options didn't solve your problem, you can send an email describing your problem to `help at nighttune dot app`.

## Self-hosting

To self-host Nighttune, you must also run your own instance of:

- `nighttune-backend` which can be found at <https://github.com/houthacker/nighttune-backend>.
- `capjs` which can be found at <https://capjs.js.org>. Set the env var `NEXT_PUBLIC_CAPTCHA_BASE_URL` to this url.

Optionally, you can run an instance of openobserve. If you don't want or need metrics, just don't run an instance of openobserve.
The installation instructions for openobserve are located at <https://openobserve.ai/docs/getting-started/>.

An example env file is located at <https://github.com/houthacker/nighttune/tree/main/examples/.env.example>. This file must be placed in the root of your
project and be named like `.env.<development|production>`.
