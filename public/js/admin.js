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