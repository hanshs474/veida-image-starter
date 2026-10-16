# AI Image Generator starter (Veida AI)

A one-page text-to-image app you can deploy in a minute: a prompt box, three aspect ratios, and the
finished picture. One file of server code, no dependencies, Node 18+.

Images come from the [Veida AI](https://veida.ai/?utm_source=github&utm_medium=starter) HTTP API, an unlimited free AI image generator.

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fhanshs474%2Fveida-image-starter)
[![Deploy on Zeabur](https://zeabur.com/button.svg)](https://zeabur.com/templates/S5IDWW)

Or run the prebuilt image: `docker run -p 3000:3000 san8888/veida-image-starter` (amd64 and arm64).

## Run it

```bash
node server.js          # http://localhost:3000
```

It works with nothing configured: without a key every generation is one free run on Veida AI's
anonymous tier, about seven a day per server IP.

| Variable | What it does |
|---|---|
| `VEIDA_API_KEY` | Runs on your own Veida AI account instead of the free tier. Create one at [veida.ai/settings/apikeys](https://veida.ai/settings/apikeys?utm_source=github&utm_medium=starter). |
| `VEIDA_MODEL` | Model to run with a key. Default `veida-image-v1`; others include `gpt-image-2` and `gpt-image-2-5`. Plans are on the [pricing page](https://veida.ai/pricing?utm_source=github&utm_medium=starter). |
| `PORT` | Port to listen on. Default `3000`. |

## How it works

- On Vercel the same two routes are serverless functions in `api/`; elsewhere `server.js` serves them.
- `POST /api/generate` submits the prompt and returns a task id.
- `GET /api/status?id=` polls it until the image is ready (usually under a minute).
- The free tier gives one run per client id, so the page mints a fresh id for each generation and
  polls with that same id.
- Running out of free runs comes back as HTTP 200 with `data.wall: true`, not as an error status;
  the server turns that into a readable message.

API reference: [veida.readthedocs.io](https://veida.readthedocs.io/). Need prompts that already work?
The [AI image prompt library](https://veida.ai/image/prompts?utm_source=github&utm_medium=starter) has hundreds, each one ready to run.

## License

MIT
