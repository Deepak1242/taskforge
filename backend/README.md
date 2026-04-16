# Backend Deployment Notes

This backend is deployed on Vercel using a serverless handler.

## Vercel Entry

- `api/index.js` is the Vercel function entrypoint.
- It loads `src/app.js` and reuses a cached MongoDB connection.

## Required Environment Variables

Set these in Vercel project settings:

- `MONGO_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `ADMIN_INVITE_CODE`
- `NODE_ENV=production`

## Routing

- `vercel.json` rewrites all routes to `api/index.js`
- Expected paths:
  - `/`
  - `/health`
  - `/api/docs`
  - `/api/v1/*`

## Post-Deploy Checks

After deploy, verify:

1. `GET /` returns success JSON.
2. `GET /health` returns healthy status.
3. Auth and task routes under `/api/v1` respond correctly.
4. Frontend `.env` points to the deployed backend URL with `/api/v1` suffix.