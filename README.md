# BMI Checker: Deployment Demo

- `frontend/`  HTML, CSS, JS (deploy to Cloudflare Pages)
- `backend/`   Python API (deploy to Cloudflare Workers)

## 1. Run it locally

Requirements: Python, Node.js, and uv (https://docs.astral.sh/uv/#installation)

Backend:
    cd backend
    uv run pywrangler dev          # API on http://localhost:8787

Frontend (new terminal):
    cd frontend
    python -m http.server 8000     # open http://localhost:8000

## 2. Deploy the backend (Worker)

    cd backend
    npx wrangler login
    uv run pywrangler deploy

Copy the URL it prints (https://bmi-api.<your-subdomain>.workers.dev).

## 3. Point the frontend at the API

In `frontend/script.js`, change:
    const API_URL = "http://localhost:8787";
to your Worker URL (no trailing slash).

## 4. Deploy the frontend (Pages) with Git (CI/CD)

1. Push this whole folder to a GitHub repo.
2. Cloudflare dashboard > Workers & Pages > Create > Pages > Connect to Git.
3. Pick the repo. Build command: (leave empty). Output directory: frontend
4. Save and Deploy. Every `git push` now redeploys automatically.

## Test the API directly

    curl -X POST https://YOUR-WORKER-URL/api/bmi \
      -H "Content-Type: application/json" \
      -d '{"weight_kg": 60, "height_cm": 165}'
