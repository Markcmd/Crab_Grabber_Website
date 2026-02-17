import "dotenv/config";
import express from "express";
import morgan from "morgan";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { openDb, runMigrations } from "./db/db.mjs";
import { mountWaitlistRoutes } from "./routes/waitlist.routes.mjs";
import { mountAdminRoutes } from "./routes/admin.routes.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const db = openDb();
runMigrations(db);

app.use(morgan("dev"));
app.use(express.json({ limit: "1mb" }));

// API
mountWaitlistRoutes(app, db);
mountAdminRoutes(app, db);

// Static site
const publicDir = path.join(__dirname, "..", "public");
app.use(express.static(publicDir));

app.get("/waitlist", (req, res) => res.sendFile(path.join(publicDir, "waitlist.html")));
app.get("/admin", (req, res) => res.sendFile(path.join(publicDir, "admin.html")));
app.get("/menu", (req, res) => res.sendFile(path.join(publicDir, "menu.html")));

// Health
app.get("/health", (req, res) => res.json({ ok: true }));

const port = Number(process.env.PORT || 3000);
app.listen(port, "0.0.0.0", () => {
  console.log(`Server listening on http://0.0.0.0:${port}`);
});