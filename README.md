# Zhihu Multiverse (观点对撞机)

Turn Zhihu answers into an interactive force-directed graph of viewpoints.

## Quick Start

```bash
# Install and run frontend
cd web
npm install
npm run generate:demo
npm run dev

# Build static export
npm run build
# Output in web/out/
```

## Pipeline (local dev only)

```bash
cd pipeline
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Set `ZHIHU_BEARER` and `DEEPSEEK_API_KEY` env vars (or create `pipeline/.env`).
See [pipeline/README.md](pipeline/README.md) for LLM model options and configuration details.

### Copy pipeline output to frontend

```bash
cd web
node scripts/copy-from-pipeline.mjs
npm run build
```

## Architecture

- `web/` — Next.js static export (Vercel), AntV G6 graph, Zod schemas
- `pipeline/` — FastAPI (local), Zhihu search client, LLM graph builder
- `web/public/data/` — Committed demo fixtures, no runtime API calls
