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