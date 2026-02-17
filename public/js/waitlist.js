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