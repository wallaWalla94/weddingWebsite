if (window.location.pathname.includes("admin")) {
  window.location.href = "/";
}

function getDashboardConfig() {
  const config = window.WEDDING_SUPABASE_CONFIG;
  if (!config?.url || !config?.anonKey) return null;

  return {
    url: config.url.replace(/\/$/, ""),
    anonKey: config.anonKey,
  };
}

const dashboardConfig = getDashboardConfig();
const supabaseAdmin =
  dashboardConfig &&
  window.supabase.createClient(dashboardConfig.url, dashboardConfig.anonKey);

let dashboardRows = [];

function formatAttendance(value) {
  if (value === true) return '<span class="yes">Attending</span>';
  if (value === false) return '<span class="no">Declined</span>';
  return '<span class="pending">Pending</span>';
}

function showAuthStatus(message = "") {
  const el = document.getElementById("authStatus");
  if (el) el.textContent = message;
}

function showDashboard(isVisible) {
  const loginSection = document.getElementById("loginSection");
  const dashboardSection = document.getElementById("dashboardSection");

  if (loginSection) loginSection.hidden = isVisible;
  if (dashboardSection) dashboardSection.hidden = !isVisible;
}

async function getAccessToken() {
  const { data, error } = await supabaseAdmin.auth.getSession();
  if (error) throw error;
  return data.session?.access_token || null;
}

async function getHeaders() {
  const token = await getAccessToken();
  if (!dashboardConfig || !token) {
    throw new Error("Not authenticated");
  }

  return {
    apikey: dashboardConfig.anonKey,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

async function fetchView(viewName, params = {}) {
  const headers = await getHeaders();

  const url = new URL(`${dashboardConfig.url}/rest/v1/${viewName}`);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const response = await fetch(url.toString(), { headers });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${viewName}`);
  }

  return response.json();
}

async function loadSummary() {
  const rows = await fetchView("rsvp_summary", { select: "*" });
  const summary = rows[0] || {};

  document.getElementById("totalInvited").textContent = summary.total_invited ?? 0;
  document.getElementById("totalAttending").textContent = summary.total_attending ?? 0;
  document.getElementById("totalDeclined").textContent = summary.total_declined ?? 0;
  document.getElementById("totalPending").textContent = summary.total_pending ?? 0;
}

async function loadDashboardRows() {
  dashboardRows = await fetchView("rsvp_dashboard", {
    select: "*",
    order: "household_name.asc,full_name.asc",
  });
  renderDashboardRows();
}

function renderDashboardRows() {
  const body = document.getElementById("dashboardBody");
  const search = document.getElementById("searchInput").value.trim().toLowerCase();
  const filter = document.getElementById("statusFilter").value;

  const filtered = dashboardRows.filter((row) => {
    const haystack = [
      row.household_name,
      row.full_name,
      row.contact,
      row.message,
      row.dietary_notes,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch = !search || haystack.includes(search);

    let matchesFilter = true;
    if (filter === "yes") matchesFilter = row.attending === true;
    if (filter === "no") matchesFilter = row.attending === false;
    if (filter === "pending") matchesFilter = row.attending == null;

    return matchesSearch && matchesFilter;
  });

  body.innerHTML = filtered
    .map(
      (row) => `
        <tr>
          <td>${row.household_name || ""}</td>
          <td>${row.full_name || ""}</td>
          <td>${formatAttendance(row.attending)}</td>
          <td>${row.dietary_notes || ""}</td>
          <td>${row.contact || ""}</td>
          <td>${row.message || ""}</td>
        </tr>
      `
    )
    .join("");
}

function exportCSV() {
  const headers = ["Household", "Guest", "Attending", "Dietary", "Contact", "Message"];

  const csv = [
    headers.join(","),
    ...dashboardRows.map((row) =>
      [
        row.household_name,
        row.full_name,
        row.attending === true ? "Attending" : row.attending === false ? "Declined" : "Pending",
        row.dietary_notes,
        row.contact,
        row.message,
      ]
        .map((value) => `"${(value ?? "").toString().replace(/"/g, '""')}"`)
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "rsvp-dashboard.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function refreshDashboard() {
  try {
    await Promise.all([loadSummary(), loadDashboardRows()]);
  } catch (error) {
    console.error(error);
    alert("Could not load the dashboard.");
  }
}

async function signInAdmin() {
  const email = document.getElementById("adminEmail")?.value.trim() || "";
  const password = document.getElementById("adminPassword")?.value || "";

  if (!email || !password) {
    showAuthStatus("Enter your email and password.");
    return;
  }

  showAuthStatus("Signing in...");

  const { error } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    showAuthStatus("Login failed.");
    return;
  }

  showAuthStatus("");
  showDashboard(true);
  await refreshDashboard();
}

async function signOutAdmin() {
  await supabaseAdmin.auth.signOut();
  showDashboard(false);
  showAuthStatus("");
}

async function initializeAdminPage() {
  if (!supabaseAdmin) {
    showAuthStatus("Missing Supabase config.");
    return;
  }

  const { data, error } = await supabaseAdmin.auth.getSession();
  if (error) {
    console.error(error);
    showDashboard(false);
    return;
  }

  if (data.session) {
    showDashboard(true);
    await refreshDashboard();
  } else {
    showDashboard(false);
  }

  supabaseAdmin.auth.onAuthStateChange(async (_event, session) => {
    if (session) {
      showDashboard(true);
    } else {
      showDashboard(false);
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("loginBtn")?.addEventListener("click", signInAdmin);
  document.getElementById("logoutBtn")?.addEventListener("click", signOutAdmin);
  document.getElementById("searchInput")?.addEventListener("input", renderDashboardRows);
  document.getElementById("statusFilter")?.addEventListener("change", renderDashboardRows);
  document.getElementById("refreshBtn")?.addEventListener("click", refreshDashboard);
  document.getElementById("exportBtn")?.addEventListener("click", exportCSV);

  await initializeAdminPage();
});
