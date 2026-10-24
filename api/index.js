// Vercel Serverless Function entry point.
// Environment variables (JWT_SECRET, CLIENT_ORIGIN, etc.) must be
// configured in the Vercel Dashboard → Settings → Environment Variables.
import { app } from '../server/dist/app.js'

export default app
