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