const form = document.querySelector("#trip-form");
const submitButton = document.querySelector("#submit-btn");
const emptyState = document.querySelector("#empty-state");
const loading = document.querySelector("#loading");
const errorBox = document.querySelector("#error");
const planBox = document.querySelector("#plan");

function showState(state) {
  emptyState.classList.toggle("hidden", state !== "empty");
  loading.classList.toggle("hidden", state !== "loading");
  errorBox.classList.toggle("hidden", state !== "error");
  planBox.classList.toggle("hidden", state !== "plan");
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function listItems(items = []) {
  if (!Array.isArray(items) || items.length === 0) return "<li>Verify details before booking.</li>";
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function renderPlan(plan) {
  const days = Array.isArray(plan.dailyPlan) ? plan.dailyPlan : [];

  planBox.innerHTML = `
    <section class="summary">
      <h2>Trip overview</h2>
      <p>${escapeHtml(plan.summary || "Here is your generated travel plan.")}</p>
      <ul class="tags">${listItems(plan.bestFor)}</ul>
    </section>

    <section>
      <h2>Day-by-day plan</h2>
      <div class="day-grid">
        ${days
          .map(
            (day, index) => `
              <article class="day-card">
                <h3>Day ${escapeHtml(day.day || index + 1)}: ${escapeHtml(day.title || "Explore")}</h3>
                <div class="slot"><strong>Morning</strong><span>${escapeHtml(day.morning)}</span></div>
                <div class="slot"><strong>Afternoon</strong><span>${escapeHtml(day.afternoon)}</span></div>
                <div class="slot"><strong>Evening</strong><span>${escapeHtml(day.evening)}</span></div>
                <div class="slot"><strong>Food</strong><span>${escapeHtml(day.food)}</span></div>
                <div class="slot"><strong>Local tip</strong><span>${escapeHtml(day.localTip)}</span></div>
              </article>
            `,
          )
          .join("")}
      </div>
    </section>

    <section class="sections">
      <div class="mini-section">
        <h3>Packing</h3>
        <ul>${listItems(plan.packing)}</ul>
      </div>
      <div class="mini-section">
        <h3>Budget notes</h3>
        <ul>${listItems(plan.budgetNotes)}</ul>
      </div>
      <div class="mini-section">
        <h3>Safety notes</h3>
        <ul>${listItems(plan.safetyNotes)}</ul>
      </div>
    </section>
  `;
}

function tripPayload(formData) {
  return {
    destination: formData.get("destination"),
    startDate: formData.get("startDate"),
    days: Number(formData.get("days")),
    travelers: Number(formData.get("travelers")),
    budget: formData.get("budget"),
    pace: formData.get("pace"),
    interests: formData.getAll("interests"),
    notes: formData.get("notes"),
  };
}

async function readApiResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  const preview = text.replace(/\s+/g, " ").trim().slice(0, 120);
  throw new Error(
    `The backend did not return JSON. Make sure the Node server is running and the site is not hosted as static-only GitHub Pages.${preview ? ` Response: ${preview}` : ""}`,
  );
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  submitButton.disabled = true;
  showState("loading");

  try {
    const response = await fetch("/api/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tripPayload(new FormData(form))),
    });

    const data = await readApiResponse(response);
    if (!response.ok) throw new Error(data.error || "Could not generate the plan.");

    renderPlan(data.plan);
    showState("plan");
  } catch (error) {
    errorBox.textContent = error.message;
    showState("error");
  } finally {
    submitButton.disabled = false;
  }
});
