# Crab Grabber — Restaurant Website + QR Waitlist + SMS

A production-ready starter plan + implementation outline for **Crab Grabber**:
- Public restaurant website (Home, Menu, Contact)
- **QR-code waitlist** page (customers join from their phone)
- **Admin dashboard** (staff controls queue + triggers SMS)
- Optional: SMS notifications via **Twilio**

---

## Demo Flow

### Customer
1. Scan QR at entrance → `https://crabgrabber.com/waitlist`
2. Enter name + party size + phone
3. Receive SMS when table is ready (optional)

### Staff (Admin)
1. Open `https://crabgrabber.com/admin`
2. View active waitlist
3. Mark party **Seated / No-show / Done**
4. Click **Notify** to send SMS

---

## Tech Stack

- **Frontend:** HTML + CSS + vanilla JS (fast, simple, mobile-first)
- **Backend:** Node.js + Express
- **Database:** SQLite (MVP) → PostgreSQL (upgrade later)
- **SMS:** Twilio (optional)
- **Deployment:** EC2 + Nginx + SSL (Let’s Encrypt)

---

## Repository Structure

```txt
crab-grabber/
├─ README.md
├─ package.json
├─ server/
│  ├─ server.mjs
│  ├─ db/
│  │  ├─ db.mjs
│  │  └─ schema.sql
│  ├─ routes/
│  │  ├─ waitlist.routes.mjs
│  │  └─ admin.routes.mjs
│  ├─ services/
│  │  └─ sms.service.mjs
│  └─ middleware/
│     └─ adminAuth.mjs
└─ public/
   ├─ index.html
   ├─ menu.html
   ├─ waitlist.html
   ├─ admin.html
   ├─ css/
   │  └─ styles.css
   └─ js/
      ├─ waitlist.js
      └─ admin.js
```

⸻

# Environment Variables

Create .env:
```text
# Server
PORT=3000
BASE_URL=https://crabgrabber.com

# Admin auth (simple MVP)
ADMIN_TOKEN=change_me_long_random_string

# Twilio (optional)
TWILIO_ENABLED=false
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=+1XXXXXXXXXX
```

⸻

# Quick Start (Local)
```text
npm install
npm run dev
# open http://localhost:3000
# waitlist at http://localhost:3000/waitlist
# admin at http://localhost:3000/admin
```

⸻

# API Overview

Public (customer)
	•	POST /api/waitlist/join — join waitlist
	•	GET  /api/waitlist/status/:id — check status (optional)

Admin (staff)
	•	GET  /api/admin/waitlist — list
	•	POST /api/admin/notify/:id — send SMS
	•	POST /api/admin/update/:id — change status (waiting/seated/done/no_show)

⸻

# Implementation (Starter Code)

1) package.json
```text
{
  "name": "crab-grabber",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "node --watch server/server.mjs",
    "start": "node server/server.mjs"
  },
  "dependencies": {
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "morgan": "^1.10.0",
    "sqlite3": "^5.1.7"
  }
}
```

If you enable Twilio later:
```text
npm i twilio
```

⸻

2) Database Schema — server/db/schema.sql
```text
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS waitlist (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  party_size INTEGER NOT NULL CHECK (party_size >= 1),
  status TEXT NOT NULL DEFAULT 'waiting',  -- waiting | notified | seated | done | no_show
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  note TEXT
);

CREATE INDEX IF NOT EXISTS idx_waitlist_status_created
ON waitlist(status, created_at);
```

⸻

3) DB Helper — server/db/db.mjs
```text
import sqlite3 from "sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, "waitlist.sqlite");
const SCHEMA_PATH = path.join(__dirname, "schema.sql");

export function openDb() {
  const db = new sqlite3.Database(DB_PATH);
  return db;
}

export function runMigrations(db) {
  const schema = fs.readFileSync(SCHEMA_PATH, "utf-8");
  db.exec(schema);
}

export function dbRun(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

export function dbGet(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

export function dbAll(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}
```

⸻

4) Admin Auth Middleware — server/middleware/adminAuth.mjs
```text
export function requireAdmin(req, res, next) {
  const token = req.headers["x-admin-token"];
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }
  next();
}
```

⸻

5) SMS Service — server/services/sms.service.mjs
```text
export async function sendSms({ to, message }) {
  const enabled = String(process.env.TWILIO_ENABLED).toLowerCase() === "true";
  if (!enabled) {
    // MVP: no-op
    return { ok: true, provider: "disabled", sid: null };
  }

  // Uncomment after: npm i twilio
  // import twilio from "twilio";
  // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  // const result = await client.messages.create({
  //   from: process.env.TWILIO_FROM_NUMBER,
  //   to,
  //   body: message,
  // });
  // return { ok: true, provider: "twilio", sid: result.sid };

  throw new Error("TWILIO_ENABLED=true but Twilio code not enabled yet.");
}
```

⸻

6) Waitlist Routes — server/routes/waitlist.routes.mjs
```text
import crypto from "node:crypto";
import { dbRun, dbGet } from "../db/db.mjs";

function now() {
  return Date.now();
}

export function mountWaitlistRoutes(app, db) {
  app.post("/api/waitlist/join", async (req, res) => {
    try {
      const { name, phone, partySize } = req.body ?? {};
      const trimmedName = String(name ?? "").trim();
      const size = Number(partySize);

      if (!trimmedName) return res.status(400).json({ ok: false, error: "Name required" });
      if (!Number.isInteger(size) || size < 1) {
        return res.status(400).json({ ok: false, error: "partySize must be >= 1" });
      }

      const id = crypto.randomUUID();
      const t = now();

      await dbRun(
        db,
        `INSERT INTO waitlist (id, name, phone, party_size, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'waiting', ?, ?)`,
        [id, trimmedName, phone ? String(phone).trim() : null, size, t, t]
      );

      return res.json({ ok: true, id, status: "waiting" });
    } catch (e) {
      return res.status(500).json({ ok: false, error: "Server error" });
    }
  });

  app.get("/api/waitlist/status/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const row = await dbGet(
        db,
        `SELECT id, name, party_size AS partySize, status, created_at AS createdAt, updated_at AS updatedAt
         FROM waitlist WHERE id = ?`,
        [id]
      );
      if (!row) return res.status(404).json({ ok: false, error: "Not found" });
      return res.json({ ok: true, ...row });
    } catch (e) {
      return res.status(500).json({ ok: false, error: "Server error" });
    }
  });
}
```

⸻

7) Admin Routes — server/routes/admin.routes.mjs
```text
import { requireAdmin } from "../middleware/adminAuth.mjs";
import { dbAll, dbGet, dbRun } from "../db/db.mjs";
import { sendSms } from "../services/sms.service.mjs";

function now() {
  return Date.now();
}

export function mountAdminRoutes(app, db) {
  app.get("/api/admin/waitlist", requireAdmin, async (req, res) => {
    try {
      const rows = await dbAll(
        db,
        `SELECT id, name, phone, party_size AS partySize, status, created_at AS createdAt, updated_at AS updatedAt, note
         FROM waitlist
         WHERE status IN ('waiting','notified','seated')
         ORDER BY created_at ASC`
      );
      res.json({ ok: true, rows });
    } catch (e) {
      res.status(500).json({ ok: false, error: "Server error" });
    }
  });

  app.post("/api/admin/update/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { status, note } = req.body ?? {};
      const allowed = new Set(["waiting", "notified", "seated", "done", "no_show"]);

      if (!allowed.has(String(status))) {
        return res.status(400).json({ ok: false, error: "Invalid status" });
      }

      await dbRun(
        db,
        `UPDATE waitlist SET status=?, note=?, updated_at=? WHERE id=?`,
        [String(status), note ? String(note) : null, now(), id]
      );

      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ ok: false, error: "Server error" });
    }
  });

  app.post("/api/admin/notify/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;

      const row = await dbGet(
        db,
        `SELECT id, name, phone, party_size AS partySize, status FROM waitlist WHERE id=?`,
        [id]
      );
      if (!row) return res.status(404).json({ ok: false, error: "Not found" });
      if (!row.phone) return res.status(400).json({ ok: false, error: "No phone on record" });

      const message = `Crab Grabber: Your table is ready. Please come to the front desk.`;
      const result = await sendSms({ to: row.phone, message });

      await dbRun(db, `UPDATE waitlist SET status='notified', updated_at=? WHERE id=?`, [now(), id]);

      res.json({ ok: true, sms: result });
    } catch (e) {
      res.status(500).json({ ok: false, error: "Server error" });
    }
  });
}
```

⸻

8) Server Entrypoint — server/server.mjs
```text
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
```

⸻

# Frontend (Minimal but “Nice”)

## public/css/styles.css
```css
:root{
  --bg:#0b1220;
  --card:#101a2e;
  --text:#e8eefc;
  --muted:#9fb0d0;
  --accent:#ff6b35;
  --accent2:#2dd4bf;
  --border:rgba(255,255,255,.10);
  --shadow: 0 12px 40px rgba(0,0,0,.35);
  --radius: 16px;
  --max: 980px;
  --font: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, "Apple Color Emoji","Segoe UI Emoji";
}

*{box-sizing:border-box}
html,body{height:100%}
body{
  margin:0;
  font-family:var(--font);
  color:var(--text);
  background: radial-gradient(1000px 600px at 20% 0%, rgba(45,212,191,.15), transparent 60%),
              radial-gradient(900px 500px at 80% 20%, rgba(255,107,53,.18), transparent 60%),
              var(--bg);
}

a{color:inherit;text-decoration:none}
.container{max-width:var(--max);margin:0 auto;padding:28px 18px}
.nav{
  display:flex;align-items:center;justify-content:space-between;
  padding:14px 18px;border:1px solid var(--border);border-radius:var(--radius);
  background:rgba(16,26,46,.65);backdrop-filter: blur(10px);
  box-shadow: var(--shadow);
}
.brand{display:flex;gap:10px;align-items:center;font-weight:800;letter-spacing:.4px}
.badge{
  padding:4px 10px;border-radius:999px;background:rgba(255,107,53,.15);
  border:1px solid rgba(255,107,53,.30);color:#ffd3c4;font-size:12px
}
.links{display:flex;gap:14px;font-weight:600;color:var(--muted)}
.links a{padding:8px 10px;border-radius:12px}
.links a:hover{background:rgba(255,255,255,.06)}

.hero{
  margin-top:18px;
  padding:28px 22px;border-radius:var(--radius);
  border:1px solid var(--border);
  background:linear-gradient(180deg, rgba(16,26,46,.75), rgba(16,26,46,.35));
  box-shadow: var(--shadow);
}
.hero h1{margin:0 0 10px;font-size:40px;letter-spacing:.2px}
.hero p{margin:0 0 18px;color:var(--muted);line-height:1.6}
.grid{display:grid;grid-template-columns:1fr;gap:14px;margin-top:18px}
@media (min-width: 860px){ .grid{grid-template-columns: 1.3fr .7fr} }

.card{
  padding:18px;border-radius:var(--radius);
  border:1px solid var(--border);
  background:rgba(16,26,46,.55);
  box-shadow: var(--shadow);
}
.card h2{margin:0 0 8px;font-size:18px}
.small{color:var(--muted);font-size:14px;line-height:1.5}

.btns{display:flex;gap:10px;flex-wrap:wrap}
.btn{
  appearance:none;border:1px solid var(--border);
  padding:11px 14px;border-radius:14px;
  background:rgba(255,255,255,.06);
  color:var(--text);font-weight:700;cursor:pointer
}
.btn.primary{
  background:rgba(255,107,53,.18);
  border:1px solid rgba(255,107,53,.40);
}
.btn.primary:hover{background:rgba(255,107,53,.28)}
.btn:hover{background:rgba(255,255,255,.10)}

.form{display:grid;gap:10px;margin-top:10px}
.input{
  width:100%;padding:12px 12px;border-radius:14px;
  border:1px solid var(--border);background:rgba(0,0,0,.20);
  color:var(--text);outline:none
}
.input::placeholder{color:rgba(159,176,208,.75)}
.row{display:grid;grid-template-columns:1fr;gap:10px}
@media(min-width:640px){ .row{grid-template-columns:1fr 1fr} }

.table{width:100%;border-collapse:collapse;margin-top:10px;overflow:hidden}
.table th,.table td{
  text-align:left;padding:10px;border-bottom:1px solid var(--border);
  color:var(--text);vertical-align:top
}
.table th{color:var(--muted);font-weight:700;font-size:13px}
.pill{
  display:inline-block;padding:4px 10px;border-radius:999px;font-size:12px;
  border:1px solid var(--border);color:var(--muted)
}
.pill.waiting{border-color:rgba(45,212,191,.35);color:#c8fff7;background:rgba(45,212,191,.08)}
.pill.notified{border-color:rgba(255,107,53,.45);color:#ffe2d6;background:rgba(255,107,53,.08)}
.pill.seated{border-color:rgba(148,163,184,.45);color:#e2e8f0;background:rgba(148,163,184,.08)}

.footer{margin-top:16px;color:var(--muted);font-size:13px}
```

⸻

## public/index.html
```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Crab Grabber</title>
  <link rel="stylesheet" href="/css/styles.css"/>
</head>
<body>
  <div class="container">
    <div class="nav">
      <div class="brand">
        <div>Crab Grabber</div>
        <span class="badge">Seafood • Cajun Boil</span>
      </div>
      <div class="links">
        <a href="/menu">Menu</a>
        <a href="/waitlist">Waitlist</a>
        <a href="#contact">Contact</a>
      </div>
    </div>

    <div class="hero">
      <h1>Fresh seafood, fast seating.</h1>
      <p>Scan the QR at the entrance or tap below to join the waitlist. We’ll text you when your table is ready.</p>
      <div class="btns">
        <a class="btn primary" href="/waitlist">Join Waitlist</a>
        <a class="btn" href="/menu">View Menu</a>
      </div>
    </div>

    <div class="grid">
      <div class="card">
        <h2>Hours</h2>
        <div class="small">
          Mon–Thu: 11:00 AM – 9:00 PM<br/>
          Fri–Sun: 11:00 AM – 10:00 PM
        </div>
      </div>
      <div class="card" id="contact">
        <h2>Location</h2>
        <div class="small">
          123 Harbor Ave, Your City, CA<br/>
          Phone: (555) 555-5555
        </div>
      </div>
    </div>

    <div class="footer">© Crab Grabber</div>
  </div>
</body>
</html>
```

⸻

## public/waitlist.html
```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Join Waitlist — Crab Grabber</title>
  <link rel="stylesheet" href="/css/styles.css"/>
</head>
<body>
  <div class="container">
    <div class="nav">
      <div class="brand">
        <div>Crab Grabber</div>
        <span class="badge">Waitlist</span>
      </div>
      <div class="links">
        <a href="/">Home</a>
        <a href="/menu">Menu</a>
      </div>
    </div>

    <div class="hero">
      <h1>Join the waitlist</h1>
      <p>Enter your details. We’ll notify you when your table is ready.</p>
    </div>

    <div class="card">
      <form class="form" id="waitlistForm">
        <input class="input" name="name" placeholder="Name" required />
        <div class="row">
          <input class="input" name="partySize" type="number" min="1" placeholder="Party size" required />
          <input class="input" name="phone" placeholder="Phone (optional for SMS)" />
        </div>
        <button class="btn primary" type="submit">Join Waitlist</button>
        <div class="small" id="result"></div>
      </form>
    </div>

    <div class="footer">Tip: Save this page if you want to check your status later.</div>
  </div>

  <script src="/js/waitlist.js"></script>
</body>
</html>
```

⸻

## public/js/waitlist.js
```js
const form = document.getElementById("waitlistForm");
const result = document.getElementById("result");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  result.textContent = "Submitting...";

  const data = Object.fromEntries(new FormData(form).entries());
  const payload = {
    name: data.name,
    phone: data.phone || null,
    partySize: Number(data.partySize),
  };

  const resp = await fetch("/api/waitlist/join", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await resp.json();
  if (!json.ok) {
    result.textContent = `Error: ${json.error || "Unknown"}`;
    return;
  }

  const statusUrl = `${location.origin}/api/waitlist/status/${json.id}`;
  result.innerHTML = `
    <div style="margin-top:6px">
      ✅ Joined. Your ID: <b>${json.id}</b><br/>
      Status endpoint: <code>${statusUrl}</code>
    </div>
  `;

  form.reset();
});
```

⸻

## public/admin.html
```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Admin — Crab Grabber</title>
  <link rel="stylesheet" href="/css/styles.css"/>
</head>
<body>
  <div class="container">
    <div class="nav">
      <div class="brand">
        <div>Crab Grabber</div>
        <span class="badge">Admin</span>
      </div>
      <div class="links">
        <a href="/">Home</a>
        <a href="/waitlist">Waitlist</a>
      </div>
    </div>

    <div class="hero">
      <h1>Waitlist Dashboard</h1>
      <p>Enter admin token to view and manage the queue.</p>
    </div>

    <div class="card">
      <div class="form">
        <input class="input" id="token" placeholder="Admin token (X-Admin-Token)" />
        <div class="btns">
          <button class="btn primary" id="refresh">Refresh</button>
        </div>
        <div class="small" id="msg"></div>
      </div>
    </div>

    <div class="card" style="margin-top:14px">
      <h2>Active Waitlist</h2>
      <table class="table" id="table">
        <thead>
          <tr>
            <th>Party</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
      <div class="small" id="empty"></div>
    </div>

    <div class="footer">Security note: MVP uses a shared admin token. Upgrade later to login.</div>
  </div>

  <script src="/js/admin.js"></script>
</body>
</html>
```

⸻

## public/js/admin.js
```js
const tokenEl = document.getElementById("token");
const refreshBtn = document.getElementById("refresh");
const msg = document.getElementById("msg");
const tbody = document.querySelector("#table tbody");
const empty = document.getElementById("empty");

function pill(status) {
  const cls = status === "waiting" ? "waiting" : status === "notified" ? "notified" : "seated";
  return `<span class="pill ${cls}">${status}</span>`;
}

async function api(path, opts = {}) {
  const token = tokenEl.value.trim();
  const headers = {
    "Content-Type": "application/json",
    ...(opts.headers || {}),
    "X-Admin-Token": token,
  };
  const resp = await fetch(path, { ...opts, headers });
  const json = await resp.json();
  if (!json.ok) throw new Error(json.error || "Request failed");
  return json;
}

function render(rows) {
  tbody.innerHTML = "";
  empty.textContent = rows.length ? "" : "No active parties.";

  for (const r of rows) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><b>${escapeHtml(r.name)}</b><br/><span class="small">Party: ${r.partySize}</span></td>
      <td>${r.phone ? escapeHtml(r.phone) : "<span class='small'>—</span>"}</td>
      <td>${pill(r.status)}</td>
      <td>
        <div class="btns">
          <button class="btn" data-act="seated" data-id="${r.id}">Seated</button>
          <button class="btn" data-act="done" data-id="${r.id}">Done</button>
          <button class="btn" data-act="no_show" data-id="${r.id}">No-show</button>
          <button class="btn primary" data-act="notify" data-id="${r.id}">Notify</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  }
}

async function refresh() {
  msg.textContent = "Loading...";
  try {
    const json = await api("/api/admin/waitlist");
    render(json.rows);
    msg.textContent = "Loaded.";
  } catch (e) {
    msg.textContent = `Error: ${e.message}`;
  }
}

tbody.addEventListener("click", async (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const id = btn.getAttribute("data-id");
  const act = btn.getAttribute("data-act");

  try {
    msg.textContent = "Working...";
    if (act === "notify") {
      await api(`/api/admin/notify/${id}`, { method: "POST" });
    } else {
      await api(`/api/admin/update/${id}`, {
        method: "POST",
        body: JSON.stringify({ status: act }),
      });
    }
    await refresh();
  } catch (err) {
    msg.textContent = `Error: ${err.message}`;
  }
});

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[c]));
}

refreshBtn.addEventListener("click", refresh);
```

⸻

## Nginx Deployment (EC2)

Example Nginx site config
```text
server {
  server_name crabgrabber.com;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```
After enabling SSL via Certbot, your QR should point to:

https://crabgrabber.com/waitlist


⸻

Next Steps (Recommended Order)
	1.	Replace placeholder address / hours / phone on index.html
	2.	Build real menu.html content (categories + items)
	3.	Enable Twilio (set TWILIO_ENABLED=true)
	4.	Add basic admin login (replace token auth)
	5.	Add “estimated wait time” and “position in line” (optional)

⸻

License

Private / internal use (edit as needed).

