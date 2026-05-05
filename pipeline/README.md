# Pipeline

FastAPI service for Zhihu search proxy and LLM graph builder.

## Quick Start

```bash
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Environment Variables

Supports both `export` and `.env` file. Create `pipeline/.env`:

```
ZHIHU_BEARER=xxx
DEEPSEEK_API_KEY=sk-xxx
```

Environment variables (`export`) take precedence over `.env` values.

## LLM Configuration

### Optional Models

| Provider | Model | Description |
|---|---|---|
| `deepseek` (default) | `deepseek-v4-flash` (default) | Fast, cost-efficient |
| `deepseek` | `deepseek-v4-pro` | Reasoning model with thinking |
| `openai` | `gpt-4o` | OpenAI flagship |
| `openai` | `gpt-4.1` | Latest OpenAI |

### Priority

```
LLM_MODEL env var  >  provider default
```

| Env Var | Default | Description |
|---|---|---|
| `LLM_PROVIDER` | `deepseek` | `deepseek` or `openai` |
| `LLM_MODEL` | `deepseek-v4-flash` | Override model per provider |
| `DEEPSEEK_API_KEY` | — | Required when `LLM_PROVIDER=deepseek` |
| `OPENAI_API_KEY` | — | Required when `LLM_PROVIDER=openai` |

### Examples

```bash
# Default: DeepSeek flash
DEEPSEEK_API_KEY=sk-xxx

# DeepSeek pro (reasoning)
LLM_MODEL=deepseek-v4-pro

# OpenAI
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-xxx
LLM_MODEL=gpt-4.1
```
