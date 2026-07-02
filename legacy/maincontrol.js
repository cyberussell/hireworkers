const TOKEN_KEY = "maincontrol_token";

const loginScreen = document.querySelector("#loginScreen");
const loginForm = document.querySelector("#loginForm");
const passwordInput = document.querySelector("#passwordInput");
const loginError = document.querySelector("#loginError");
const dashboard = document.querySelector("#dashboard");
const logoutButton = document.querySelector("#logoutButton");
const statsSection = document.querySelector("#statsSection");
const tabs = document.querySelectorAll(".admin-tab");
const panels = {
  jobs: document.querySelector("#jobsPanel"),
  intake: document.querySelector("#intakePanel"),
  seekers: document.querySelector("#seekersPanel"),
};
const jobsTable = document.querySelector("#jobsTable");
const intakeTable = document.querySelector("#intakeTable");
const seekersTable = document.querySelector("#seekersTable");
const jobStatusFilter = document.querySelector("#jobStatusFilter");

function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  sessionStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

async function adminFetch(path, options = {}) {
  const token = getToken();
  const response = await fetch(path, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (response.status === 401) {
    clearToken();
    showLogin();
    throw new Error("Session expired. Please log in again.");
  }
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `Request failed (${response.status})`);
  }
  return response;
}

function showLogin() {
  loginScreen.classList.remove("hidden");
  dashboard.classList.add("hidden");
}

function showDashboard() {
  loginScreen.classList.add("hidden");
  dashboard.classList.remove("hidden");
  loadStats();
  loadJobs();
}

async function checkSession() {
  const token = getToken();
  if (!token) {
    showLogin();
    return;
  }
  try {
    const response = await fetch("/api/admin/session", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (data.valid) {
      showDashboard();
    } else {
      clearToken();
      showLogin();
    }
  } catch (error) {
    showLogin();
  }
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginError.textContent = "";
  const password = passwordInput.value;
  try {
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await response.json();
    if (!response.ok) {
      loginError.textContent = data.error || "Login failed.";
      return;
    }
    setToken(data.token);
    passwordInput.value = "";
    showDashboard();
  } catch (error) {
    loginError.textContent = "Could not reach the server.";
  }
});

logoutButton.addEventListener("click", () => {
  const token = getToken();
  clearToken();
  showLogin();
  if (token) {
    fetch("/api/admin/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }
});

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.toggle("is-active", t === tab));
    Object.entries(panels).forEach(([key, panel]) => {
      panel.classList.toggle("hidden", key !== tab.dataset.tab);
    });
    if (tab.dataset.tab === "intake") loadIntake();
    if (tab.dataset.tab === "seekers") loadSeekers();
  });
});

async function loadStats() {
  try {
    const response = await adminFetch("/api/admin/stats");
    const stats = await response.json();
    statsSection.innerHTML = `
      <div class="admin-stat-card"><span>${stats.total_jobs}</span><label>Total Jobs</label></div>
      <div class="admin-stat-card"><span>${stats.published_jobs}</span><label>Published</label></div>
      <div class="admin-stat-card"><span>${stats.draft_jobs}</span><label>Draft</label></div>
      <div class="admin-stat-card"><span>${stats.rejected_jobs}</span><label>Rejected</label></div>
      <div class="admin-stat-card"><span>${stats.intake_sessions}</span><label>Intake Sessions</label></div>
      <div class="admin-stat-card"><span>${stats.seeker_profiles}</span><label>Seeker Profiles</label></div>
    `;
  } catch (error) {
    statsSection.innerHTML = `<p class="admin-error">${escapeHtml(error.message)}</p>`;
  }
}

async function loadJobs() {
  jobsTable.innerHTML = "<p>Loading…</p>";
  try {
    const status = jobStatusFilter.value;
    const query = status ? `status=eq.${status}` : "";
    const response = await adminFetch(`/api/admin/jobs${query ? `?${query}` : ""}`);
    const jobs = await response.json();
    if (!jobs.length) {
      jobsTable.innerHTML = "<p>No job posts found.</p>";
      return;
    }
    jobsTable.innerHTML = jobs.map(renderJobRow).join("");
    jobsTable.querySelectorAll("[data-action]").forEach((button) => {
      button.addEventListener("click", () => handleJobAction(button.dataset.id, button.dataset.action));
    });
  } catch (error) {
    jobsTable.innerHTML = `<p class="admin-error">${escapeHtml(error.message)}</p>`;
  }
}

function renderJobRow(job) {
  const contact = job.contact_email || job.contact_method || "—";
  return `
    <article class="admin-row">
      <div class="admin-row-main">
        <h3>${escapeHtml(job.title)} <span class="admin-badge status-${escapeHtml(job.status)}">${escapeHtml(job.status)}</span></h3>
        <p class="admin-row-sub">${escapeHtml(job.company_name)} · ${escapeHtml(contact)}</p>
        <p class="admin-row-desc">${escapeHtml(job.description)}</p>
        <p class="admin-row-meta">
          ${escapeHtml(job.work_setup || "—")} · ${escapeHtml(job.schedule_type || "—")} ·
          ${job.pay_min ?? "?"}-${job.pay_max ?? "?"} ${escapeHtml(job.currency || "")} ·
          ${formatDate(job.created_at)}
        </p>
      </div>
      <div class="admin-row-actions">
        <button type="button" data-action="publish" data-id="${job.id}">Publish</button>
        <button type="button" data-action="reject" data-id="${job.id}">Reject</button>
        <button type="button" data-action="delete" data-id="${job.id}" class="danger">Delete</button>
      </div>
    </article>
  `;
}

async function handleJobAction(id, action) {
  try {
    if (action === "delete") {
      if (!confirm("Delete this job post permanently?")) return;
      await adminFetch(`/api/admin/jobs/${id}`, { method: "DELETE" });
    } else if (action === "publish") {
      await adminFetch(`/api/admin/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "published" }),
      });
    } else if (action === "reject") {
      await adminFetch(`/api/admin/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
      });
    }
    loadJobs();
    loadStats();
  } catch (error) {
    alert(error.message);
  }
}

async function loadIntake() {
  intakeTable.innerHTML = "<p>Loading…</p>";
  try {
    const response = await adminFetch("/api/admin/intake");
    const sessions = await response.json();
    if (!sessions.length) {
      intakeTable.innerHTML = "<p>No intake sessions found.</p>";
      return;
    }
    intakeTable.innerHTML = sessions
      .map(
        (session) => `
      <article class="admin-row">
        <div class="admin-row-main">
          <h3>${escapeHtml(session.user_type)} <span class="admin-badge status-${escapeHtml(session.status)}">${escapeHtml(session.status)}</span></h3>
          <p class="admin-row-desc">${escapeHtml(session.raw_prompt)}</p>
          <p class="admin-row-meta">${formatDate(session.created_at)}</p>
        </div>
      </article>
    `
      )
      .join("");
  } catch (error) {
    intakeTable.innerHTML = `<p class="admin-error">${escapeHtml(error.message)}</p>`;
  }
}

async function loadSeekers() {
  seekersTable.innerHTML = "<p>Loading…</p>";
  try {
    const response = await adminFetch("/api/admin/seekers");
    const seekers = await response.json();
    if (!seekers.length) {
      seekersTable.innerHTML = "<p>No seeker profiles found.</p>";
      return;
    }
    seekersTable.innerHTML = seekers
      .map(
        (seeker) => `
      <article class="admin-row">
        <div class="admin-row-main">
          <h3>${escapeHtml(seeker.name || "Unnamed")}</h3>
          <p class="admin-row-sub">${(seeker.skills || []).map(escapeHtml).join(", ") || "No skills listed"}</p>
          <p class="admin-row-meta">${escapeHtml(seeker.preferred_work_setup || "—")} · ${formatDate(seeker.created_at)}</p>
        </div>
      </article>
    `
      )
      .join("");
  } catch (error) {
    seekersTable.innerHTML = `<p class="admin-error">${escapeHtml(error.message)}</p>`;
  }
}

jobStatusFilter.addEventListener("change", loadJobs);
document.querySelector("#refreshJobs").addEventListener("click", loadJobs);
document.querySelector("#refreshIntake").addEventListener("click", loadIntake);
document.querySelector("#refreshSeekers").addEventListener("click", loadSeekers);

checkSession();
