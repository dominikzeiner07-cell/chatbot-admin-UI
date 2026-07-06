/* ----------------------------------------------
   Backend Base (overrideable via localStorage + URL param)
   - Default: http://localhost:5051
   - URL param: ?backend_base=https://api.example.com   (saved to localStorage)
   - localStorage key: admin_ui_backend_base
---------------------------------------------- */
const DEFAULT_BACKEND_BASE = "https://chatbot-backend-iqma.onrender.com";
const BACKEND_BASE_KEY = "admin_ui_backend_base";
const ADMIN_THEME_KEY = "admin_ui_theme";

function normalizeBaseUrl(u) {
  let s = String(u || "").trim();
  if (!s) return "";
  // strip trailing slashes
  s = s.replace(/\/+$/, "");
  return s;
}
function isHttpUrlStr(u) {
  try {
    const url = new URL(String(u || ""));
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
function getStoredBackendBase() {
  try { return localStorage.getItem(BACKEND_BASE_KEY) || ""; } catch { return ""; }
}
function setStoredBackendBase(base) {
  try { localStorage.setItem(BACKEND_BASE_KEY, base); } catch {}
}

function getStoredTheme() {
  try { return localStorage.getItem(ADMIN_THEME_KEY) || ""; } catch { return ""; }
}

function setStoredTheme(theme) {
  try { localStorage.setItem(ADMIN_THEME_KEY, theme); } catch {}
}

function resolveInitialTheme() {
  const stored = getStoredTheme();
  if (stored === "dark" || stored === "light") return stored;

  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch {
    return "light";
  }
}

function applyTheme(theme) {
  const body = document.body;
  const next = theme === "dark" ? "dark" : "light";

  if (body) {
    body.setAttribute("data-theme", next);
  }

  const btn = document.getElementById("theme-toggle");
  if (btn) {
    btn.textContent = next === "dark" ? "Light Mode" : "Dark Mode";
  }
}

function toggleTheme() {
  const current = document.body.getAttribute("data-theme") === "dark" ? "dark" : "light";
  const next = current === "dark" ? "light" : "dark";
  setStoredTheme(next);
  applyTheme(next);
}

function initThemeToggle() {
  applyTheme(resolveInitialTheme());

  const btn = document.getElementById("theme-toggle");
  if (!btn) return;

  btn.addEventListener("click", () => {
    toggleTheme();
  });
}

const BACKEND_BASE = (() => {
  // 1) localStorage override (dev use)
  const stored = normalizeBaseUrl(getStoredBackendBase());
  if (stored && isHttpUrlStr(stored)) return stored;

  // 2) fallback
  return normalizeBaseUrl(DEFAULT_BACKEND_BASE);
})();

// Optional: if widget.js is served by your backend, this is convenient for dev.
// If you host widget.js on a CDN, change this constant (or keep placeholder in snippet).
const WIDGET_SCRIPT_URL = "https://dominikzeiner07-cell.github.io/chatbot-widget/widget.js";
// Basis-URL zu deinem Backend
const INGEST_URL   = `${BACKEND_BASE}/ingest`;
const CRAWL_URL    = `${BACKEND_BASE}/crawl`;
const DOMAIN_URL   = `${BACKEND_BASE}/crawl-domain`;
const PURGE_URL    = `${BACKEND_BASE}/purge`;

// Customer Management
const ADMIN_CUSTOMERS_URL = `${BACKEND_BASE}/admin/customers`;
const ADMIN_CUSTOMER_URL  = (id) => `${BACKEND_BASE}/admin/customers/${encodeURIComponent(id)}`;
const ADMIN_CUSTOMER_STORAGE_URL = (id) => `${BACKEND_BASE}/admin/customers/${encodeURIComponent(id)}/storage`;
const ADMIN_CUSTOMER_MONTHLY_USAGE_URL = (id) =>
  `${BACKEND_BASE}/admin/customers/${encodeURIComponent(id)}/monthly-usage`;

// Widget-Key regenerate endpoint candidates
const WIDGET_REGEN_ENDPOINTS = (id) => ([
  `${BACKEND_BASE}/admin/customers/${encodeURIComponent(id)}/widget-key`,
  `${BACKEND_BASE}/admin/customers/${encodeURIComponent(id)}/regenerate-widget-key`,
]);

// Stats endpoints candidates
const STATS_ENDPOINT_CANDIDATES = [
  `${BACKEND_BASE}/admin/stats`,
  `${BACKEND_BASE}/admin/interaction-stats`,
  `${BACKEND_BASE}/stats`,
];

// Daily stats endpoints candidates
const DAILY_STATS_ENDPOINT_CANDIDATES = [
  `${BACKEND_BASE}/admin/stats/daily`,
  `${BACKEND_BASE}/admin/stats-daily`,
  `${BACKEND_BASE}/stats/daily`,
];

// Antworten (Interaktionen) endpoints candidates
const ANSWERS_ENDPOINT_CANDIDATES = [
  `${BACKEND_BASE}/admin/answers`,
  `${BACKEND_BASE}/admin/interactions`,
  `${BACKEND_BASE}/admin/interactions/recent`,
  `${BACKEND_BASE}/admin/answers/recent`,
  `${BACKEND_BASE}/answers`,
];

// Stripe Checkout endpoints candidates (per-customer)
const CHECKOUT_URL_ENDPOINTS = (id) => ([
  `${BACKEND_BASE}/admin/customers/${encodeURIComponent(id)}/checkout-url`, // bevorzugt
  `${BACKEND_BASE}/admin/customers/${encodeURIComponent(id)}/checkout`,
  `${BACKEND_BASE}/admin/checkout/${encodeURIComponent(id)}`,
]);

/* ----------------------------------------------
   Widget Customize / Avatar / Settings endpoints
   (Backend in server.js: PATCH /admin/customers/:id/widget-settings
                          POST  /admin/customers/:id/avatar  (JSON data_url)
                          DELETE /admin/customers/:id/avatar
---------------------------------------------- */
const WIDGET_SETTINGS_SAVE_ENDPOINTS = (id) => ([
  `${BACKEND_BASE}/admin/customers/${encodeURIComponent(id)}/widget-settings`, // primary
  `${BACKEND_BASE}/admin/customers/${encodeURIComponent(id)}`,                // fallback (payload: {widget_settings})
]);

const WIDGET_AVATAR_UPLOAD_ENDPOINTS = (id) => ([
  `${BACKEND_BASE}/admin/customers/${encodeURIComponent(id)}/avatar`,         // primary
  `${BACKEND_BASE}/admin/customers/${encodeURIComponent(id)}/widget-avatar`,  // legacy candidates
  `${BACKEND_BASE}/admin/widget/avatar`,
  `${BACKEND_BASE}/admin/widget/avatar/upload`,
]);

const WIDGET_AVATAR_DELETE_ENDPOINTS = (id) => ([
  `${BACKEND_BASE}/admin/customers/${encodeURIComponent(id)}/avatar`,         // primary
  `${BACKEND_BASE}/admin/customers/${encodeURIComponent(id)}/widget-avatar`,  // legacy candidates
  `${BACKEND_BASE}/admin/widget/avatar`,
]);

/* ----------------------------------------------
   Admin-Token Handling (UI + localStorage + Fallback)
---------------------------------------------- */
const ADMIN_TOKEN_KEY = "admin_ui_token";

function getStoredToken() {
  try { return localStorage.getItem(ADMIN_TOKEN_KEY) || ""; } catch { return ""; }
}
function setStoredToken(token) {
  try { localStorage.setItem(ADMIN_TOKEN_KEY, token); } catch {}
}
function clearStoredToken() {
  try { localStorage.removeItem(ADMIN_TOKEN_KEY); } catch {}
}

function ensureToken() {
  const input = document.getElementById("admin-token-input");
  if (input && input.value.trim()) {
    const t = input.value.trim();
    setStoredToken(t);
    return t;
  }

  let t = getStoredToken();
  if (t) return t.trim();

  t = window.prompt("Bitte Admin-Token eingeben:") || "";
  if (t.trim()) setStoredToken(t.trim());
  return t.trim();
}

async function fetchWithAdmin(url, { method = "GET", payload } = {}) {
  let token = ensureToken();
  if (!token) {
    return {
      _noFetch: true,
      ok: false,
      status: 0,
      json: async () => ({ error: "Kein Admin-Token gesetzt." })
    };
  }

  const headers = { "X-Admin-Token": token };
  if (payload) headers["Content-Type"] = "application/json";

  let res = await fetch(url, {
    method,
    headers,
    ...(payload ? { body: JSON.stringify(payload) } : {})
  });

  if (res.status === 401) {
    clearStoredToken();
    const ui = document.getElementById("admin-token-input");
    if (ui) ui.value = "";
    token = ensureToken();
    if (!token) return res;

    const headers2 = { "X-Admin-Token": token };
    if (payload) headers2["Content-Type"] = "application/json";

    res = await fetch(url, {
      method,
      headers: headers2,
      ...(payload ? { body: JSON.stringify(payload) } : {})
    });
  }

  return res;
}

const postJSONWithAdmin   = (url, payload) => fetchWithAdmin(url, { method: "POST", payload });
const patchJSONWithAdmin  = (url, payload) => fetchWithAdmin(url, { method: "PATCH", payload });
const getJSONWithAdmin    = (url)         => fetchWithAdmin(url, { method: "GET" });
const deleteJSONWithAdmin = (url, payload)=> fetchWithAdmin(url, { method: "DELETE", payload });

/* ----------------------------------------------
   Helpers
---------------------------------------------- */
function setStatus(el, text, type) {
  if (!el) return;
  el.textContent = text;
  el.className = `status ${type}`;
}

function disableForm(form, disabled) {
  if (!form) return;
  const fields = form.querySelectorAll("input, textarea, select, button");
  fields.forEach((f) => (f.disabled = disabled));
}

function isHttpUrl(u) {
  try {
    const url = new URL(u);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function guessCategoryFromContent(text) {
  const l = (text || "").toLowerCase();
  if (
    l.includes("impressum") ||
    l.includes("datenschutz") ||
    l.includes("privacy policy") ||
    l.includes("agb") ||
    l.includes("allgemeine geschäftsbedingungen") ||
    l.includes("widerruf")
  ) return "legal";
  return "general";
}

async function hashContent(str) {
  const enc = new TextEncoder().encode(str);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  const arr = Array.from(new Uint8Array(buf));
  return arr.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function loadRecentHashes(customerId) {
  try {
    const raw = localStorage.getItem(`admin_upload_hash:${customerId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecentHashes(customerId, hashes) {
  try {
    localStorage.setItem(
      `admin_upload_hash:${customerId}`,
      JSON.stringify(hashes.slice(-50))
    );
  } catch {}
}

// Normalize a single domain/entry to a clean host
function normalizeDomainEntry(line) {
  let s = String(line || "").trim();
  if (!s) return "";

  s = s.replace(/^["']|["']$/g, "");

  try {
    if (s.startsWith("http://") || s.startsWith("https://")) {
      const u = new URL(s);
      s = u.hostname;
    }
  } catch {}

  s = s.split("/")[0];
  s = s.trim().toLowerCase();
  s = s.replace(/^www\./, "");
  s = s.replace(/\.+$/, "");

  if (s !== "localhost" && !s.includes(".")) return "";
  return s;
}

function parseAllowedDomainsTextarea(value) {
  const lines = String(value || "")
    .split("\n")
    .map((s) => normalizeDomainEntry(s))
    .filter(Boolean);

  return Array.from(new Set(lines));
}

function fillAllCustomerIdInputs(customerId) {
  const ids = [
    "customer_id",
    "crawl_customer_id",
    "dom_customer_id",
    "purge_customer_id",
    "custdel_customer_id",
  ];
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = customerId;
  });
}

function safeNumberOrNull(v) {
  if (v === "" || v === null || typeof v === "undefined") return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return n;
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.top = "-1000px";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      return true;
    } catch {
      return false;
    }
  }
}

function jsStringLiteral(value) {
  return JSON.stringify(String(value || ""))
    .replace(/</g, "\\u003C")
    .replace(/>/g, "\\u003E")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

function buildWidgetSnippet({ widgetKey }) {
  // WIDGET_SCRIPT_URL is a hardcoded constant — not user input, not from localStorage or URL params.
  return `<!-- Chatbot Widget -->
<script>
  window.CHATBOT_WIDGET_KEY = ${jsStringLiteral(widgetKey)};
  window.CHATBOT_API_BASE = ${jsStringLiteral(BACKEND_BASE)};
</script>
<script src="${WIDGET_SCRIPT_URL}" defer></script>`;
}

function formatTimeMaybe(ts) {
  if (!ts) return "";
  try {
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return String(ts);
    return d.toLocaleString("de-AT");
  } catch {
    return String(ts);
  }
}

function getStorageUi(scope) {
  if (scope === "customer") {
    return {
      card: document.getElementById("cust_storage_card"),
      line: document.getElementById("cust_storage_line"),
      hint: document.getElementById("cust_storage_hint"),
    };
  }

  if (scope === "upload") {
    return {
      card: document.getElementById("upload_storage_card"),
      line: document.getElementById("upload_storage_line"),
      hint: document.getElementById("upload_storage_hint"),
    };
  }

  return { card: null, line: null, hint: null };
}

function getMonthlyUsageUi(scope) {
  if (scope === "customer") {
    return {
      card: document.getElementById("cust_monthly_usage_card"),
      line: document.getElementById("cust_monthly_usage_line"),
      hint: document.getElementById("cust_monthly_usage_hint"),
    };
  }

  if (scope === "stats") {
    return {
      card: document.getElementById("stats_monthly_usage_card"),
      line: document.getElementById("stats_monthly_usage_line"),
      hint: document.getElementById("stats_monthly_usage_hint"),
    };
  }

  return { card: null, line: null, hint: null };
}

function renderStorageBox(scope, storage, tone = "info", message = "") {
  const ui = getStorageUi(scope);
  if (!ui.line || !ui.hint) return;

  const card = ui.card;
  if (card) {
    card.classList.remove("tone-info", "tone-success", "tone-error");
    card.classList.add(`tone-${tone}`);
  }

  if (!storage || typeof storage !== "object") {
    ui.line.textContent = "–";
    ui.hint.textContent = message || "Noch nicht geladen.";
    return;
  }

  const limit = storage.limit;
  const current = Number(storage.current ?? 0);
  const remaining =
    typeof storage.remaining !== "undefined"
      ? storage.remaining
      : (limit == null ? null : Math.max(0, limit - current));

  ui.line.textContent =
    limit == null
      ? `${current} Chunks`
      : `${current} / ${limit} Chunks`;

  const parts = [];
  if (storage.plan) parts.push(`Plan: ${storage.plan}`);
  if (remaining != null) parts.push(`Verbleibend: ${remaining}`);
  if (Number.isFinite(storage.incoming)) parts.push(`Neuer Upload: ${storage.incoming}`);
  if (Number.isFinite(storage.projected)) parts.push(`Nach Upload: ${storage.projected}`);

  ui.hint.textContent = message || parts.join(" · ") || "Speicherstand geladen.";
}

function renderMonthlyUsageBox(scope, usage, tone = "info", message = "") {
  const ui = getMonthlyUsageUi(scope);
  if (!ui.line || !ui.hint) return;

  const card = ui.card;
  if (card) {
    card.classList.remove("tone-info", "tone-success", "tone-error");
    card.classList.add(`tone-${tone}`);
  }

  if (!usage || typeof usage !== "object") {
    ui.line.textContent = "–";
    ui.hint.textContent = message || "Noch nicht geladen.";
    return;
  }

  const used = Number(usage.used ?? 0);
  const limit = usage.limit;

  ui.line.textContent =
    limit == null
      ? `${used} / ∞ Nachrichten`
      : `${used} / ${limit} Nachrichten`;

  const parts = [];
  if (usage.plan) parts.push(`Plan: ${usage.plan}`);

  if (limit == null) {
    parts.push("Kein Monatslimit gesetzt");
  } else {
    parts.push(`Verbleibend: ${Math.max(0, Number(usage.remaining ?? (limit - used)))}`);
  }

  if (usage.month_start) {
    try {
      const d = new Date(usage.month_start);
      if (!Number.isNaN(d.getTime())) {
        parts.push(
          `Monat ab ${d.toLocaleDateString("de-AT", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}`
        );
      }
    } catch {}
  }

  ui.hint.textContent = message || parts.join(" · ") || "Monatsnutzung geladen.";
}

async function fetchCustomerStorage(customerId) {
  if (!customerId) return { ok: false, error: "missing_customer_id" };

  const res = await getJSONWithAdmin(ADMIN_CUSTOMER_STORAGE_URL(customerId));
  if (res._noFetch) return { ok: false, error: "Kein Admin-Token gesetzt." };

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return {
      ok: false,
      error: data?.error || `HTTP ${res.status}`,
    };
  }

  return {
    ok: true,
    storage: data?.storage || data,
  };
}

async function fetchCustomerMonthlyUsage(customerId) {
  if (!customerId) return { ok: false, error: "missing_customer_id" };

  const res = await getJSONWithAdmin(ADMIN_CUSTOMER_MONTHLY_USAGE_URL(customerId));
  if (res._noFetch) return { ok: false, error: "Kein Admin-Token gesetzt." };

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return {
      ok: false,
      error: data?.error || `HTTP ${res.status}`,
    };
  }

  return {
    ok: true,
    usage: data?.monthly_usage || data,
  };
}

async function loadStorageIntoScope(scope, customerId) {
  if (!customerId) {
    renderStorageBox(scope, null, "info", "Kein Customer ausgewählt.");
    return;
  }

  renderStorageBox(scope, null, "info", "Lade Speicherstand …");

  const r = await fetchCustomerStorage(customerId);
  if (!r.ok) {
    renderStorageBox(scope, null, "error", r.error || "Konnte Speicherstand nicht laden.");
    return;
  }

  const storage = r.storage || {};
  const current = Number(storage.current ?? 0);
  const limit = storage.limit;

  let tone = "success";

  if (limit != null) {
    const ratio = limit > 0 ? current / limit : 1;

    if (ratio >= 1) tone = "error";
    else if (ratio >= 0.8) tone = "info";
  }

  renderStorageBox(scope, storage, tone);
}

async function loadMonthlyUsageIntoScope(scope, customerId) {
  if (!customerId) {
    renderMonthlyUsageBox(scope, null, "info", "Kein Customer ausgewählt.");
    return;
  }

  renderMonthlyUsageBox(scope, null, "info", "Lade Monatsnutzung …");

  const r = await fetchCustomerMonthlyUsage(customerId);
  if (!r.ok) {
    renderMonthlyUsageBox(scope, null, "error", r.error || "Konnte Monatsnutzung nicht laden.");
    return;
  }

  const usage = r.usage || {};
  const used = Number(usage.used ?? 0);
  const limit = usage.limit;

  let tone = "success";
  if (limit != null) {
    const ratio = limit > 0 ? used / limit : 1;
    if (ratio >= 1) tone = "error";
    else if (ratio >= 0.8) tone = "info";
  }

  renderMonthlyUsageBox(scope, usage, tone);
}

async function syncStoragePanels(customerId) {
  if (!customerId) {
    renderStorageBox("customer", null, "info", "Kein Customer ausgewählt.");
    renderStorageBox("upload", null, "info", "Kein Customer ausgewählt.");
    return;
  }

  await Promise.all([
    loadStorageIntoScope("customer", customerId),
    loadStorageIntoScope("upload", customerId),
  ]);
}

async function syncMonthlyUsagePanels(customerId) {
  if (!customerId) {
    renderMonthlyUsageBox("customer", null, "info", "Kein Customer ausgewählt.");
    renderMonthlyUsageBox("stats", null, "info", "Kein Customer ausgewählt.");
    return;
  }

  await Promise.all([
    loadMonthlyUsageIntoScope("customer", customerId),
    loadMonthlyUsageIntoScope("stats", customerId),
  ]);
}

/* ----------------------------------------------
   Widget helpers (DUAL kompatibel: alte + neue IDs)
---------------------------------------------- */
const DEFAULT_WIDGET_SETTINGS = {
  bot_name: "Support",
  user_label: "",
  greeting_text: "Ich bin hier, falls du Hilfe benötigst!",
  first_message: "Hallo! Wie kann ich helfen?",
  header_color: "#000000",
  accent_color: "#000000",
  text_color_mode: "auto",
  theme_mode: "light",
  avatar_url: "",

  // NEW: Legal links
  privacy_url: "",
  imprint_url: "",
  terms_url: ""
};

function clampHexColor(s, fallback) {
  const v = String(s || "").trim();
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v.toLowerCase();
  return fallback;
}

function hexToRgb(hex) {
  const h = String(hex || "").replace("#", "");
  if (h.length !== 6) return null;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  if (![r, g, b].every(Number.isFinite)) return null;
  return { r, g, b };
}

function pickReadableTextColor(bgHex) {
  const rgb = hexToRgb(bgHex);
  if (!rgb) return "#ffffff";
  const srgb = [rgb.r, rgb.g, rgb.b].map((v) => v / 255);
  const lin = srgb.map((v) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  const L = 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
  return L > 0.55 ? "#000000" : "#ffffff";
}

function firstExistingEl(ids) {
  for (const id of ids) {
    const el = document.getElementById(id);
    if (el) return el;
  }
  return null;
}

function readValueFromAny(ids) {
  const el = firstExistingEl(ids);
  return el ? (el.value ?? "") : "";
}

function writeValueToAny(ids, value) {
  const el = firstExistingEl(ids);
  if (el) el.value = String(value ?? "");
}

function setTextToAny(ids, value) {
  const el = firstExistingEl(ids);
  if (el) el.textContent = String(value ?? "");
}

/* ----------------------------------------------
   NEW: Color preview helpers (swatch + hex next to <input type="color">)
   - Works with either injected UI or pre-existing HTML elements
---------------------------------------------- */
function isHex6(s) {
  return /^#[0-9a-fA-F]{6}$/.test(String(s || "").trim());
}

function findSiblingColorUi(inputEl) {
  if (!inputEl) return { swatch: null, hex: null };

  // Prefer deterministic IDs if available
  if (inputEl.id) {
    const sw = document.getElementById(`${inputEl.id}_swatch`);
    const hx = document.getElementById(`${inputEl.id}_hex`);
    if (sw || hx) return { swatch: sw || null, hex: hx || null };
  }

  const parent = inputEl.parentElement;
  if (!parent) return { swatch: null, hex: null };

  const swatch = parent.querySelector(".color-swatch") || null;
  const hex = parent.querySelector("input.color-hex") || null;
  return { swatch, hex };
}

function ensureColorPreviewUIForInput(inputEl) {
  if (!inputEl) return null;

  // If UI already wired, just return refs
  if (inputEl.dataset.colorUiInited === "1") {
    const { swatch, hex } = findSiblingColorUi(inputEl);
    return { input: inputEl, swatch, hex };
  }

  // If HTML already has the extra elements next to the input, don’t restructure; just wire.
  const existing = findSiblingColorUi(inputEl);
  const hasExistingUi = Boolean(existing.swatch || existing.hex);

  if (!hasExistingUi) {
    // Inject UI (no HTML changes needed)
    const parent = inputEl.parentElement;
    if (!parent) return null;

    // If already inside a row wrapper, don’t double wrap
    const alreadyRow = parent.classList?.contains("color-picker-row");

    if (!alreadyRow) {
      const row = document.createElement("div");
      row.className = "color-picker-row";

      // Create swatch
      const swatch = document.createElement("span");
      swatch.className = "color-swatch";
      if (inputEl.id) swatch.id = `${inputEl.id}_swatch`;

      // Create hex input
      const hex = document.createElement("input");
      hex.type = "text";
      hex.inputMode = "text";
      hex.autocapitalize = "off";
      hex.spellcheck = false;
      hex.className = "color-hex";
      if (inputEl.id) hex.id = `${inputEl.id}_hex`;
      hex.placeholder = "#000000";
      hex.setAttribute("aria-label", "Hex Farbe");

      // Replace input with row wrapper, then re-attach inside
      parent.replaceChild(row, inputEl);
      row.appendChild(inputEl);
      row.appendChild(swatch);
      row.appendChild(hex);
    }
  }

  // Wire syncing
  const { swatch, hex } = findSiblingColorUi(inputEl);

  const syncFromColorInput = () => {
    const v = clampHexColor(inputEl.value, "#000000");
    inputEl.value = v;
    if (swatch) swatch.style.background = v;
    if (hex) hex.value = v;
  };

  const syncFromHexInput = () => {
    if (!hex) return;
    const raw = String(hex.value || "").trim();
    if (!raw) return;
    if (!isHex6(raw)) return;
    const v = raw.toLowerCase();
    inputEl.value = v;
    if (swatch) swatch.style.background = v;
  };

  inputEl.addEventListener("input", syncFromColorInput);
  inputEl.addEventListener("change", syncFromColorInput);

  if (hex) {
    hex.addEventListener("input", syncFromHexInput);
    hex.addEventListener("blur", () => {
      const raw = String(hex.value || "").trim();
      if (!raw) {
        syncFromColorInput();
        return;
      }
      if (!isHex6(raw)) {
        syncFromColorInput();
        return;
      }
      hex.value = raw.toLowerCase();
      syncFromHexInput();
    });
  }

  inputEl.dataset.colorUiInited = "1";

  // Initial sync
  syncFromColorInput();

  return { input: inputEl, swatch, hex };
}

function ensureWidgetColorUIs() {
  // support both new + legacy IDs
  const headerEl = firstExistingEl(["widget_header_color", "widget_header_bg"]);
  const accentEl = firstExistingEl(["widget_accent_color", "widget_accent"]);
  ensureColorPreviewUIForInput(headerEl);
  ensureColorPreviewUIForInput(accentEl);
}

function readWidgetSettingsFromCustomer(cust) {
  const raw = cust?.widget_settings || cust?.widget_config || cust?.widget_theme || null;
  const s = { ...DEFAULT_WIDGET_SETTINGS };

  const pick = (obj, keys) => {
    for (const k of keys) {
      if (typeof obj?.[k] !== "undefined" && obj?.[k] !== null) return obj[k];
    }
    return undefined;
  };

  if (raw && typeof raw === "object") {
    s.bot_name = String(pick(raw, ["bot_name", "botName", "bot_name_display", "name"]) ?? s.bot_name);
    s.user_label = String(pick(raw, ["user_label", "userLabel"]) ?? s.user_label);
    s.greeting_text = String(pick(raw, ["greeting_text", "launcherText", "launcher_text"]) ?? s.greeting_text);
    s.first_message = String(pick(raw, ["first_message", "botGreeting", "bot_greeting", "greeting"]) ?? s.first_message);

    s.header_color = clampHexColor(String(pick(raw, ["header_color", "headerBg", "header_bg"]) ?? s.header_color), s.header_color);
    s.accent_color = clampHexColor(String(pick(raw, ["accent_color", "accent", "accent_color"]) ?? s.accent_color), s.accent_color);

    const mode = String(pick(raw, ["text_color_mode", "textColorMode"]) ?? s.text_color_mode).toLowerCase();
    s.text_color_mode = (mode === "light" || mode === "dark" || mode === "auto") ? mode : "auto";

    const themeMode = String(pick(raw, ["theme_mode", "themeMode"]) ?? s.theme_mode).toLowerCase();
    s.theme_mode = themeMode === "dark" ? "dark" : "light";

    s.avatar_url = String(pick(raw, ["avatar_url", "botAvatarUrl", "bot_avatar_url", "botAvatarUrl"]) ?? "");
    // NEW: Legal links
s.privacy_url = String(pick(raw, ["privacy_url", "privacyUrl", "privacy_policy_url", "privacyPolicyUrl", "datenschutz_url"]) ?? "");
s.imprint_url = String(pick(raw, ["imprint_url", "imprintUrl", "impressum_url"]) ?? "");
s.terms_url = String(pick(raw, ["terms_url", "termsUrl", "agb_url", "conditions_url"]) ?? "");
  } else {
    if (cust?.bot_name) s.bot_name = String(cust.bot_name);
    if (cust?.user_label) s.user_label = String(cust.user_label);
    if (cust?.greeting_text) s.greeting_text = String(cust.greeting_text);
    if (cust?.first_message) s.first_message = String(cust.first_message);

    if (cust?.widget_header_bg) s.header_color = clampHexColor(cust.widget_header_bg, s.header_color);
    if (cust?.widget_accent) s.accent_color = clampHexColor(cust.widget_accent, s.accent_color);

    if (cust?.widget_header_color) s.header_color = clampHexColor(cust.widget_header_color, s.header_color);
    if (cust?.widget_accent_color) s.accent_color = clampHexColor(cust.widget_accent_color, s.accent_color);

    if (cust?.text_color_mode) {
      const mode = String(cust.text_color_mode).toLowerCase();
      s.text_color_mode = (mode === "light" || mode === "dark" || mode === "auto") ? mode : "auto";
    }

    if (cust?.theme_mode) {
    const themeMode = String(cust.theme_mode).toLowerCase();
     s.theme_mode = themeMode === "dark" ? "dark" : "light";
    }

    if (cust?.bot_avatar_url) s.avatar_url = String(cust.bot_avatar_url);
    if (cust?.avatar_url) s.avatar_url = String(cust.avatar_url);
    // NEW: Legal links (fallback legacy on customer root)
if (cust?.privacy_url) s.privacy_url = String(cust.privacy_url);
if (cust?.imprint_url) s.imprint_url = String(cust.imprint_url);
if (cust?.terms_url) s.terms_url = String(cust.terms_url);
  }

  // Root-Felder (Customer) sollen IMMER gewinnen (wir speichern privacy_url am Root)
if (typeof cust?.privacy_url !== "undefined" && cust?.privacy_url !== null) {
  s.privacy_url = String(cust.privacy_url);
}
if (typeof cust?.imprint_url !== "undefined" && cust?.imprint_url !== null) {
  s.imprint_url = String(cust.imprint_url);
}
if (typeof cust?.terms_url !== "undefined" && cust?.terms_url !== null) {
  s.terms_url = String(cust.terms_url);
}
s.bot_name = s.bot_name.trim() || DEFAULT_WIDGET_SETTINGS.bot_name;
s.user_label = s.user_label.trim();
s.greeting_text = s.greeting_text.trim() || DEFAULT_WIDGET_SETTINGS.greeting_text;
s.first_message = s.first_message.trim() || DEFAULT_WIDGET_SETTINGS.first_message;
s.theme_mode = String(s.theme_mode || "light").toLowerCase() === "dark" ? "dark" : "light";

// NEW: Legal links trims
s.privacy_url = String(s.privacy_url || "").trim();
s.imprint_url = String(s.imprint_url || "").trim();
s.terms_url = String(s.terms_url || "").trim();

return s;
}

function writeWidgetSettingsToForm(settings) {
  writeValueToAny(["widget_bot_name"], settings.bot_name);
  writeValueToAny(["widget_user_label"], settings.user_label);

  writeValueToAny(["widget_greeting_text", "widget_launcher_text"], settings.greeting_text);
  writeValueToAny(["widget_first_message", "widget_bot_greeting"], settings.first_message);

  writeValueToAny(["widget_header_color", "widget_header_bg"], settings.header_color);
  writeValueToAny(["widget_accent_color", "widget_accent"], settings.accent_color);

writeValueToAny(["widget_text_color_mode"], settings.text_color_mode);
writeValueToAny(["widget_theme_mode"], settings.theme_mode || "light");

// NEW: Legal links
writeValueToAny(["widget_privacy_url"], settings.privacy_url || "");


  // Ensure color UI exists + synced
  ensureWidgetColorUIs();

  const img = document.getElementById("widget_avatar_preview");
  const fb = document.getElementById("widget_avatar_preview_fallback");
  const url = String(settings.avatar_url || "").trim();

  if (img) {
    if (url) {
      img.src = url;
      img.style.display = "block";
      if (fb) fb.style.display = "none";
    } else {
      img.removeAttribute("src");
      img.style.display = "none";
      if (fb) fb.style.display = "block";
    }
  }

  const headerPrev = document.getElementById("widget_header_preview");
  if (headerPrev) {
    headerPrev.style.background = settings.header_color;
    headerPrev.style.color = pickReadableTextColor(settings.header_color);
  }
  const accentPrev = document.getElementById("widget_accent_preview");
  if (accentPrev) {
    accentPrev.style.background = settings.accent_color;
    accentPrev.style.color = pickReadableTextColor(settings.accent_color);
  }

  setTextToAny(["widget_raw"], JSON.stringify(settings, null, 2));
}

function readWidgetSettingsFromForm() {
  // Ensure color UI exists + synced
  ensureWidgetColorUIs();

  const header = clampHexColor(
    readValueFromAny(["widget_header_color", "widget_header_bg"]),
    DEFAULT_WIDGET_SETTINGS.header_color
  );
  const accent = clampHexColor(
    readValueFromAny(["widget_accent_color", "widget_accent"]),
    DEFAULT_WIDGET_SETTINGS.accent_color
  );

  const modeRaw = String(readValueFromAny(["widget_text_color_mode"]) || "auto").toLowerCase();
  const text_color_mode = (modeRaw === "light" || modeRaw === "dark" || modeRaw === "auto") ? modeRaw : "auto";
  const themeModeRaw = String(readValueFromAny(["widget_theme_mode"]) || "light").toLowerCase();
  const theme_mode = themeModeRaw === "dark" ? "dark" : "light";

  const img = document.getElementById("widget_avatar_preview");
  const avatar_url = String(img?.getAttribute("src") || "").trim();

  const s = {
  bot_name: String(readValueFromAny(["widget_bot_name"])).trim() || DEFAULT_WIDGET_SETTINGS.bot_name,
  user_label: String(readValueFromAny(["widget_user_label"])).trim(),
  greeting_text: String(readValueFromAny(["widget_greeting_text", "widget_launcher_text"])).trim() || DEFAULT_WIDGET_SETTINGS.greeting_text,
  first_message: String(readValueFromAny(["widget_first_message", "widget_bot_greeting"])).trim() || DEFAULT_WIDGET_SETTINGS.first_message,
  header_color: header,
  accent_color: accent,
  text_color_mode,
  theme_mode,
  avatar_url,

  // NEW: Legal links
  privacy_url: String(readValueFromAny(["widget_privacy_url"])).trim(),

};
  // legacy mirror nur für Raw/Preview (Backend ignoriert unknown keys sowieso)
  s.botName = s.bot_name;
  s.launcherText = s.greeting_text;
  s.botGreeting = s.first_message;
  s.headerBg = s.header_color;
  s.accent = s.accent_color;
  s.botAvatarUrl = s.avatar_url;

  s.headerText = pickReadableTextColor(header);

  setTextToAny(["widget_raw"], JSON.stringify(s, null, 2));
  return s;
}

function pickCanonicalWidgetSettings(settings) {
  const s = settings && typeof settings === "object" ? settings : {};
return {
  bot_name: String(s.bot_name ?? "").trim(),
  user_label: String(s.user_label ?? "").trim(),
  greeting_text: String(s.greeting_text ?? "").trim(),
  first_message: String(s.first_message ?? "").trim(),
  header_color: String(s.header_color ?? "").trim(),
  accent_color: String(s.accent_color ?? "").trim(),
  text_color_mode: String(s.text_color_mode ?? "auto").trim().toLowerCase(),
  theme_mode: String(s.theme_mode ?? "light").trim().toLowerCase() === "dark" ? "dark" : "light",
  avatar_url: String(s.avatar_url ?? "").trim() || null,
  // NEW: Legal links
  privacy_url: String(s.privacy_url ?? "").trim() || null,
  imprint_url: String(s.imprint_url ?? "").trim() || null,
  terms_url: String(s.terms_url ?? "").trim() || null,

  // avatar_path wird vom Backend verwaltet
};
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("file_read_failed"));
    reader.onload = () => resolve(String(reader.result || ""));
    reader.readAsDataURL(file);
  });
}

async function uploadWidgetAvatar({ customerId, file }) {
  const statusEl = document.getElementById("widget_status");
  if (!customerId) {
    setStatus(statusEl, "Kein Customer ausgewählt.", "error");
    return { ok: false };
  }
  if (!file) {
    setStatus(statusEl, "Bitte zuerst eine Datei wählen.", "error");
    return { ok: false };
  }

  // Schnelle Client-Safety: nur Bild
  if (!String(file.type || "").startsWith("image/")) {
    setStatus(statusEl, "Bitte eine Bilddatei (png/jpg/webp) wählen.", "error");
    return { ok: false };
  }

  setStatus(statusEl, "Lade Avatar hoch …", "info");

  let dataUrl = "";
  try {
    dataUrl = await readFileAsDataURL(file);
  } catch {
    setStatus(statusEl, "Konnte Datei nicht lesen.", "error");
    return { ok: false };
  }

  for (const url of WIDGET_AVATAR_UPLOAD_ENDPOINTS(customerId)) {
    try {
      // Backend erwartet JSON { data_url: "data:image/png;base64,..." }
      const res = await postJSONWithAdmin(url, { data_url: dataUrl });
      if (res._noFetch) {
        setStatus(statusEl, "Kein Admin-Token gesetzt.", "error");
        return { ok: false };
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok) continue;

      const avatarUrl =
        data?.avatar_url ||
        data?.url ||
        data?.customer?.widget_settings?.avatar_url ||
        data?.widget_settings?.avatar_url ||
        "";

      if (!avatarUrl) {
        setStatus(statusEl, "Upload ok, aber keine avatar_url zurückbekommen.", "error");
        return { ok: false };
      }

      setStatus(statusEl, "Avatar hochgeladen.", "success");
      return { ok: true, url: String(avatarUrl), widget_settings: data?.widget_settings || data?.customer?.widget_settings || null };
    } catch {
      // try next
    }
  }

  setStatus(statusEl, "Avatar-Upload Endpoint fehlt oder Fehler (prüfe server.js + Route).", "error");
  return { ok: false };
}

async function deleteWidgetAvatar({ customerId }) {
  const statusEl = document.getElementById("widget_status");
  if (!customerId) {
    setStatus(statusEl, "Kein Customer ausgewählt.", "error");
    return { ok: false };
  }

  setStatus(statusEl, "Entferne Avatar …", "info");

  for (const url of WIDGET_AVATAR_DELETE_ENDPOINTS(customerId)) {
    try {
      const res = await deleteJSONWithAdmin(url, {}); // backend: DELETE /admin/customers/:id/avatar
      if (res._noFetch) {
        setStatus(statusEl, "Kein Admin-Token gesetzt.", "error");
        return { ok: false };
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) continue;

      setStatus(statusEl, "Avatar entfernt.", "success");
      return { ok: true, widget_settings: data?.widget_settings || data?.customer?.widget_settings || null };
    } catch {}
  }

  setStatus(statusEl, "Konnte Avatar nicht entfernen (Endpoint fehlt oder Fehler).", "error");
  return { ok: false };
}

function pickLegalLinksFromSettings(settings) {
  const privacy = String(settings?.privacy_url ?? "").trim();

  // Optional: wenn nicht gesetzt -> null, damit DB sauber bleibt
  return {
    privacy_url: privacy || null,
  };
}

function stripLegalLinks(settings) {
  const s = { ...(settings || {}) };
  delete s.privacy_url;
  return s;
}

async function saveCustomerLegalLinks(customerId, legalLinks) {
  // PATCH /admin/customers/:id  (Root-Felder)
  return patchJSONWithAdmin(ADMIN_CUSTOMER_URL(customerId), legalLinks);
}

async function saveWidgetSettingsForCustomer(customerId) {
  const statusEl = document.getElementById("widget_status");
  if (!customerId) {
    setStatus(statusEl, "Kein Customer ausgewählt.", "error");
    return;
  }

const settingsRaw = readWidgetSettingsFromForm();
const settings = pickCanonicalWidgetSettings(settingsRaw);

// Legal-Links separat als Customer-Root speichern
const legalLinks = pickLegalLinksFromSettings(settings);

// Und aus widget_settings payload rausnehmen (optional, aber sauber)
const settingsWithoutLegal = stripLegalLinks(settings);

  setStatus(statusEl, "Speichere Widget-Settings …", "info");

  // 1) primary: PATCH /admin/customers/:id/widget-settings (body = settings)
  // 2) fallback: PATCH /admin/customers/:id (body = { widget_settings: settings })
  const attempts = [
  { url: WIDGET_SETTINGS_SAVE_ENDPOINTS(customerId)[0], payload: settingsWithoutLegal, mode: "direct" },
  { url: WIDGET_SETTINGS_SAVE_ENDPOINTS(customerId)[1], payload: { widget_settings: settingsWithoutLegal }, mode: "wrapped" },
];

  let saveOk = false;
  let lastWsFromResponse = null;

  for (const a of attempts) {
    try {
      const res = await patchJSONWithAdmin(a.url, a.payload);
      if (res._noFetch) {
        setStatus(statusEl, "Kein Admin-Token gesetzt.", "error");
        return;
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok) continue;

      // unterschiedliche Response-Formate abfangen
      const ws =
        data?.widget_settings ||
        data?.customer?.widget_settings ||
        data?.customer?.settings ||
        data?.settings ||
        null;

      lastWsFromResponse = ws;

      // Cache updaten, falls Customer kommt
      const updatedCustomer = data?.customer || null;
      if (updatedCustomer?.id) {
        cacheUpsert(updatedCustomer);
      } else {
        // minimal: cache widget_settings reinpatchen, wenn customer im cache existiert
        const idx = customersCache.findIndex((c) => c.id === customerId);
        if (idx !== -1 && ws) {
          customersCache[idx] = { ...customersCache[idx], widget_settings: ws };
        }
      }

      saveOk = true;
      break;
    } catch {
      // try next
    }
  }
// Jetzt Legal-Links separat speichern (Customer Root)
try {
  const resLegal = await saveCustomerLegalLinks(customerId, legalLinks);
  if (resLegal._noFetch) {
    setStatus(statusEl, "Kein Admin-Token gesetzt (Legal-Links).", "error");
    return;
  }
  const dataLegal = await resLegal.json().catch(() => ({}));
  if (!resLegal.ok) {
    setStatus(statusEl, dataLegal?.error || `Fehler beim Speichern der Legal-Links (HTTP ${resLegal.status}).`, "error");
    return;
  }

  const updatedCustomer = dataLegal?.customer || dataLegal;
  if (updatedCustomer?.id) cacheUpsert(updatedCustomer);
} catch {
  setStatus(statusEl, "Fehler beim Speichern der Legal-Links (Netzwerk).", "error");
  return;
}
  if (!saveOk) {
    setStatus(statusEl, "Fehler beim Speichern (Endpoints / Admin-Token prüfen).", "error");
    return;
  }

  // Ab hier: Der wichtige Teil.
  // Nach erfolgreichem Save IMMER frisch vom Backend laden und exakt diesen Stand ins Formular schreiben.
  setStatus(statusEl, "Gespeichert. Lade finalen Stand vom Backend …", "info");

  const fresh = await fetchCustomerFull(customerId);
  if (fresh.ok && fresh.customer) {
    cacheUpsert(fresh.customer);

    // Widget-Tab Inputs (falls vorhanden) ebenfalls aktualisieren
    writeValueToAny(["widget_customer_id"], fresh.customer?.id || customerId);
    writeValueToAny(["widget_widget_key"], fresh.customer?.widget_key || "");

    // Form aus dem echten Customer-Objekt befüllen
    const wsMerged = readWidgetSettingsFromCustomer(fresh.customer);
    writeWidgetSettingsToForm(wsMerged);

    // Snippet Preview aktualisieren
    setWidgetSnippetPreview(fresh.customer?.widget_key || "");

    setStatus(statusEl, "Widget-Settings gespeichert (Backend-Stand geladen).", "success");
    return;
  }

  // Fallback, falls GET nicht klappt: wenigstens Response-WS ins Formular schreiben
  if (lastWsFromResponse && typeof lastWsFromResponse === "object") {
    const wsMerged = readWidgetSettingsFromCustomer({ widget_settings: lastWsFromResponse });
    writeWidgetSettingsToForm(wsMerged);
  }

  setStatus(statusEl, "Widget-Settings gespeichert (Reload fehlgeschlagen, Fallback verwendet).", "success");
}

function getSelectedCustomerId() {
  const sel = document.getElementById("cust_select");
  const id = sel?.value || "";
  return id || "";
}

function cacheUpsert(customer) {
  if (!customer?.id) return;
  const idx = customersCache.findIndex((c) => c.id === customer.id);
  if (idx === -1) customersCache.push(customer);
  else customersCache[idx] = { ...customersCache[idx], ...customer };
}

/* ----------------------------------------------
   Model hints (Plan Defaults)
---------------------------------------------- */
const PLAN_DEFAULT_MODEL = {
  standard: "gpt-4.1-mini",
  pro: "gpt-4.1",
};

const PLAN_DEFAULT_STORAGE_LIMIT = {
  standard: 1500,
  pro: 5000,
};

const PLAN_DEFAULT_MONTHLY_LIMIT = {
  standard: 1500,
  pro: 1500,
};

function getPlanDefaultMonthlyLimit(plan) {
  const p = String(plan || "").trim().toLowerCase();
  if (Object.prototype.hasOwnProperty.call(PLAN_DEFAULT_MONTHLY_LIMIT, p)) {
    return PLAN_DEFAULT_MONTHLY_LIMIT[p];
  }
  return PLAN_DEFAULT_MONTHLY_LIMIT.standard;
}

function updateMonthlyLimitHint({ planElId, monthlyElId, hintElId }) {
  const planEl = document.getElementById(planElId);
  const monthlyEl = document.getElementById(monthlyElId);
  const hintEl = document.getElementById(hintElId);

  if (!hintEl) return;

  const plan = (planEl?.value || "").trim().toLowerCase();
  const planDefault = getPlanDefaultMonthlyLimit(plan || "standard");
  const overrideRaw = (monthlyEl?.value || "").trim();
  const override = overrideRaw ? Number(overrideRaw) : null;
  const effective = Number.isFinite(override) ? override : planDefault;

  if (monthlyEl) {
    monthlyEl.placeholder = `leer = Plan-Default (${planDefault} Nachrichten)`;
  }

  if (!plan) {
    hintEl.textContent = "Plan auswählen, um das Default-Monatslimit zu sehen.";
    return;
  }

  hintEl.textContent = `Plan-Default: ${planDefault} Nachrichten · Effektiv verwendet: ${effective} Nachrichten`;
}

function getPlanDefaultStorageLimit(plan) {
  const p = String(plan || "").trim().toLowerCase();
  if (Object.prototype.hasOwnProperty.call(PLAN_DEFAULT_STORAGE_LIMIT, p)) {
    return PLAN_DEFAULT_STORAGE_LIMIT[p];
  }
  return PLAN_DEFAULT_STORAGE_LIMIT.standard;
}

function updateStorageLimitHint({ planElId, storageElId, hintElId }) {
  const planEl = document.getElementById(planElId);
  const storageEl = document.getElementById(storageElId);
  const hintEl = document.getElementById(hintElId);

  if (!hintEl) return;

  const plan = (planEl?.value || "").trim().toLowerCase();
  const planDefault = getPlanDefaultStorageLimit(plan || "standard");
  const overrideRaw = (storageEl?.value || "").trim();
  const override = overrideRaw ? Number(overrideRaw) : null;
  const effective = Number.isFinite(override) ? override : planDefault;

  if (storageEl) {
    storageEl.placeholder = `leer = Plan-Default (${planDefault} Chunks)`;
  }

  if (!plan) {
    hintEl.textContent = "Plan auswählen, um das Default-Speicherlimit zu sehen.";
    return;
  }

  hintEl.textContent = `Plan-Default: ${planDefault} Chunks · Effektiv verwendet: ${effective} Chunks`;
}

function getPlanDefaultModel(plan) {
  const p = String(plan || "").trim().toLowerCase();
  return PLAN_DEFAULT_MODEL[p] || "";
}

function updateModelHint({ planElId, modelElId, hintElId }) {
  const planEl = document.getElementById(planElId);
  const modelEl = document.getElementById(modelElId);
  const hintEl = document.getElementById(hintElId);

  if (!hintEl) return;

  const plan = (planEl?.value || "").trim().toLowerCase();
  const planDefault = getPlanDefaultModel(plan);
  const override = (modelEl?.value || "").trim();
  const effective = override || planDefault || "—";

  if (modelEl) {
    modelEl.placeholder = planDefault
      ? `Optionaler Override (Plan-Default: ${planDefault})`
      : "Optionaler Override (Plan auswählen für Default)";
  }

  if (!plan) {
    hintEl.textContent = "Plan auswählen, um das Default-Modell zu sehen.";
    return;
  }

  hintEl.textContent = `Plan-Default: ${planDefault || "—"} · Effektiv verwendet: ${effective}`;
}

/* ----------------------------------------------
   Customers Cache + Pickers
---------------------------------------------- */
let customersCache = [];

function customerSortKey(c) {
  return String(c?.name || c?.id || "").trim();
}
function sortCustomersInPlace(list) {
  list.sort((a, b) =>
    customerSortKey(a).localeCompare(customerSortKey(b), "de", { sensitivity: "base" })
  );
}
function filterCustomers(list, query) {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return list;
  return list.filter((c) => {
    const hay = `${c?.name || ""} ${c?.id || ""}`.toLowerCase();
    return hay.includes(q);
  });
}

function renderCustomerOptionsIntoSelect(selectEl, list, selectedId) {
  if (!selectEl) return;

  selectEl.innerHTML = `<option value="">– auswählen –</option>`;

  for (const c of list) {
    const label = (c.name ? `${c.name} — ` : "") + c.id;
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = label;
    selectEl.appendChild(opt);
  }

  if (selectedId && list.some((c) => c.id === selectedId)) {
    selectEl.value = selectedId;
  } else {
    selectEl.value = "";
  }
}

/* ---- External pickers (Upload/Crawl/Domain/Purge) ---- */
const EXTRA_CUSTOMER_PICKERS = [
  { searchId: "pick_upload_search", selectId: "pick_upload_select", targetInputId: "customer_id" },
  { searchId: "pick_crawl_search", selectId: "pick_crawl_select", targetInputId: "crawl_customer_id" },
  { searchId: "pick_domain_search", selectId: "pick_domain_select", targetInputId: "dom_customer_id" },
  { searchId: "pick_purge_search", selectId: "pick_purge_select", targetInputId: "purge_customer_id" },
];

function refreshOneExtraPicker({ searchEl, selectEl, targetInputEl }) {
  if (!selectEl) return;

  const query = (searchEl?.value || "").trim();
  const currentId = (targetInputEl?.value || "").trim() || (selectEl.value || "");

  const filtered = filterCustomers(customersCache, query);
  renderCustomerOptionsIntoSelect(selectEl, filtered, currentId);
}

function refreshAllExtraPickers() {
  for (const cfg of EXTRA_CUSTOMER_PICKERS) {
    const searchEl = document.getElementById(cfg.searchId);
    const selectEl = document.getElementById(cfg.selectId);
    const targetInputEl = document.getElementById(cfg.targetInputId);
    if (!selectEl) continue;
    refreshOneExtraPicker({ searchEl, selectEl, targetInputEl });
  }
}

function wireExtraPickers() {
  for (const cfg of EXTRA_CUSTOMER_PICKERS) {
    const searchEl = document.getElementById(cfg.searchId);
    const selectEl = document.getElementById(cfg.selectId);
    const targetInputEl = document.getElementById(cfg.targetInputId);
    if (!selectEl) continue;

    if (searchEl) {
      searchEl.addEventListener("input", () => {
        refreshOneExtraPicker({ searchEl, selectEl, targetInputEl });
      });

      searchEl.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          searchEl.value = "";
          refreshOneExtraPicker({ searchEl, selectEl, targetInputEl });
        }
      });
    }

    selectEl.addEventListener("change", () => {
      const id = (selectEl.value || "").trim();
      if (targetInputEl) {
        targetInputEl.value = id;
        targetInputEl.dispatchEvent(new Event("input", { bubbles: true }));
      }

      if (searchEl && searchEl.value) {
        searchEl.value = "";
        refreshOneExtraPicker({ searchEl, selectEl, targetInputEl });
        if (id) selectEl.value = id;
      }
    });

    if (targetInputEl) {
      targetInputEl.addEventListener("input", () => {
        const typed = (targetInputEl.value || "").trim();
        if (!typed) {
          selectEl.value = "";
          return;
        }

        const exists = customersCache.some((c) => c.id === typed);
        if (!exists) return;

        if (searchEl && searchEl.value) searchEl.value = "";
        refreshOneExtraPicker({ searchEl, selectEl, targetInputEl });
        selectEl.value = typed;
      });
    }
  }
}

/* ---- Stats picker ---- */
function refreshStatsPicker({ keepSelection = true } = {}) {
  const searchEl = document.getElementById("stats_pick_search");
  const selectEl = document.getElementById("stats_pick_select");
  if (!selectEl) return;

  const query = (searchEl?.value || "").trim();
  const currentSelected = keepSelection ? (selectEl.value || "") : "";

  const filtered = filterCustomers(customersCache, query);
  renderCustomerOptionsIntoSelect(selectEl, filtered, currentSelected);
}

function wireStatsPicker() {
  const searchEl = document.getElementById("stats_pick_search");
  const selectEl = document.getElementById("stats_pick_select");
  const btnUseCurrent = document.getElementById("stats_pick_use_current");

  if (searchEl) {
    searchEl.addEventListener("input", () => refreshStatsPicker({ keepSelection: true }));
    searchEl.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        searchEl.value = "";
        refreshStatsPicker({ keepSelection: true });
      }
    });
  }

  if (btnUseCurrent) {
    btnUseCurrent.addEventListener("click", () => {
      const fromCustomers = getSelectedCustomerId();
      if (!fromCustomers || !selectEl) return;
      if (searchEl) searchEl.value = "";
      refreshStatsPicker({ keepSelection: true });
      selectEl.value = fromCustomers;
      loadMonthlyUsageIntoScope("stats", fromCustomers);
    });
  }
}

function getStatsSelectedCustomerId() {
  const statsSel = document.getElementById("stats_pick_select");
  const idFromStats = (statsSel?.value || "").trim();
  if (idFromStats) return idFromStats;

  const idFromCustomers = getSelectedCustomerId();
  return (idFromCustomers || "").trim();
}

/* ---- Antworten picker ---- */
function refreshAnswersPicker({ keepSelection = true } = {}) {
  const searchEl = document.getElementById("answers_pick_search");
  const selectEl = document.getElementById("answers_pick_select");
  if (!selectEl) return;

  const query = (searchEl?.value || "").trim();
  const currentSelected = keepSelection ? (selectEl.value || "") : "";

  const filtered = filterCustomers(customersCache, query);
  renderCustomerOptionsIntoSelect(selectEl, filtered, currentSelected);
}

function wireAnswersPicker() {
  const searchEl = document.getElementById("answers_pick_search");
  const selectEl = document.getElementById("answers_pick_select");
  const btnUseCurrent = document.getElementById("answers_pick_use_current");

  if (searchEl) {
    searchEl.addEventListener("input", () => refreshAnswersPicker({ keepSelection: true }));
    searchEl.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        searchEl.value = "";
        refreshAnswersPicker({ keepSelection: true });
      }
    });
  }

  if (btnUseCurrent) {
    btnUseCurrent.addEventListener("click", () => {
      const fromCustomers = getSelectedCustomerId();
      if (!fromCustomers || !selectEl) return;
      if (searchEl) searchEl.value = "";
      refreshAnswersPicker({ keepSelection: true });
      selectEl.value = fromCustomers;
    });
  }
}

function getAnswersSelectedCustomerId() {
  const sel = document.getElementById("answers_pick_select");
  const idFromAnswers = (sel?.value || "").trim();
  if (idFromAnswers) return idFromAnswers;

  const idFromCustomers = getSelectedCustomerId();
  return (idFromCustomers || "").trim();
}

/* ---- Widget picker (optional, nur wenn IDs existieren) ---- */
function refreshWidgetPicker({ keepSelection = true } = {}) {
  const searchEl = document.getElementById("widget_pick_search");
  const selectEl = document.getElementById("widget_pick_select");
  if (!selectEl) return;

  const query = (searchEl?.value || "").trim();
  const currentSelected = keepSelection ? (selectEl.value || "") : "";

  const filtered = filterCustomers(customersCache, query);
  renderCustomerOptionsIntoSelect(selectEl, filtered, currentSelected);
}

function wireWidgetPicker() {
  const searchEl = document.getElementById("widget_pick_search");
  const selectEl = document.getElementById("widget_pick_select");
  const btnUseCurrent = document.getElementById("widget_pick_use_current");
  if (!selectEl && !btnUseCurrent && !searchEl) return;

  if (searchEl) {
    searchEl.addEventListener("input", () => refreshWidgetPicker({ keepSelection: true }));
    searchEl.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        searchEl.value = "";
        refreshWidgetPicker({ keepSelection: true });
      }
    });
  }

  if (btnUseCurrent) {
    btnUseCurrent.addEventListener("click", () => {
      const fromCustomers = getSelectedCustomerId();
      if (!fromCustomers || !selectEl) return;
      if (searchEl) searchEl.value = "";
      refreshWidgetPicker({ keepSelection: true });
      selectEl.value = fromCustomers;
      selectEl.dispatchEvent(new Event("change"));
    });
  }
}

function getWidgetSelectedCustomerId() {
  const sel = document.getElementById("widget_pick_select");
  const idFromWidget = (sel?.value || "").trim();
  if (idFromWidget) return idFromWidget;
  return (getSelectedCustomerId() || "").trim();
}

/* ---- Customers tab select rendering ---- */
function renderCustomerSelectOptions({ list, selectedId }) {
  const selectEl = document.getElementById("cust_select");
  if (!selectEl) return;
  renderCustomerOptionsIntoSelect(selectEl, list, selectedId);
}

/* ----------------------------------------------
   NEW: Widget Snippet UI helpers (Widget-Tab)
---------------------------------------------- */
function setWidgetSnippetPreview(widgetKey) {
  const prev = document.getElementById("widget_snippet_preview");
  const st = document.getElementById("widget_snippet_status");
  if (!prev) return;

  const wk = String(widgetKey || "").trim();
  if (!wk) {
    prev.textContent = "";
    if (st) setStatus(st, "Kein widget_key geladen (Customer auswählen).", "info");
    return;
  }

  const snippet = buildWidgetSnippet({ widgetKey: wk });
  prev.textContent = snippet;
  if (st) setStatus(st, "Snippet bereit.", "success");
}

function getWidgetKeyFromWidgetTab() {
  const wkInput = document.getElementById("widget_widget_key");
  const wk = (wkInput?.value || "").trim();
  if (wk) return wk;

  // fallback: falls jemand im Customers-Tab selektiert hat und Widget-Tab noch nicht geladen wurde
  const custWk = (document.getElementById("cust_widget_key")?.value || "").trim();
  return custWk;
}

function renderCustomerIntoEditor(c) {
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = (val ?? "") === null ? "" : String(val ?? "");
  };

  set("cust_id", c?.id ?? "");
  set("cust_name", c?.name ?? "");
  set("cust_plan", c?.plan ?? "");
  set("cust_model", c?.model ?? "");
  set("cust_widget_key", c?.widget_key ?? "");
  set("cust_monthly_limit", c?.monthly_message_limit ?? "");
  set("cust_ask_rpm_limit", c?.ask_rpm_limit ?? "");
  set("cust_storage_chunk_limit", c?.storage_chunk_limit ?? "");

  const allowed = Array.isArray(c?.allowed_domains) ? c.allowed_domains : [];
  set("cust_allowed_domains", allowed.join("\n"));

  set("cust_system_prompt", c?.system_prompt ?? "");

  // Support-Fallback-Kontaktdaten
  set("cust_support_email", c?.support_email ?? "");
  set("cust_support_phone", c?.support_phone ?? "");
  set("cust_support_notes", c?.support_notes ?? "");

  // NEU: Subscription-Felder aus Supabase/Backend anzeigen
  const subStatus = c?.subscription_status ?? "";
  // je nach Backend-Property-Namen, wir sind tolerant:
  const cpeRaw =
    c?.subscription_current_period_end ??
    c?.current_period_end ??
    null;
  const cpeFormatted = cpeRaw ? formatTimeMaybe(cpeRaw) : "";

  set("cust_subscription_status", subStatus);
  set("cust_subscription_current_period_end", cpeFormatted);

  // (Legacy) Customers-Tab Vorschau (falls Element noch existiert)
  const prev = document.getElementById("cust_snippet_preview");
  if (prev) {
    const wk = (c?.widget_key || "").trim();
    prev.textContent = wk ? buildWidgetSnippet({ widgetKey: wk }) : "";
  }

updateModelHint({
  planElId: "cust_plan",
  modelElId: "cust_model",
  hintElId: "cust_model_hint",
});

updateStorageLimitHint({
  planElId: "cust_plan",
  storageElId: "cust_storage_chunk_limit",
  hintElId: "cust_storage_limit_hint",
});

updateMonthlyLimitHint({
  planElId: "cust_plan",
  monthlyElId: "cust_monthly_limit",
  hintElId: "cust_monthly_limit_hint",
});

    updateMonthlyLimitHint({
    planElId: "cust_plan",
    monthlyElId: "cust_monthly_limit",
    hintElId: "cust_monthly_limit_hint",
  });

  // Widget panel (falls vorhanden): syncen
  const panelWidget = document.getElementById("panel-widget");
  if (panelWidget && c?.id) {
    const ws = readWidgetSettingsFromCustomer(c);
    writeWidgetSettingsToForm(ws);

    writeValueToAny(["widget_customer_id"], c.id);
    writeValueToAny(["widget_widget_key"], c.widget_key || "");

    // NEW: Widget-Tab Snippet Preview mitziehen
    setWidgetSnippetPreview(c.widget_key || "");
  }
}

async function fetchCustomerFull(id) {
  const res = await getJSONWithAdmin(ADMIN_CUSTOMER_URL(id));
  if (res._noFetch) return { ok: false, error: "Kein Admin-Token gesetzt." };
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: data?.error || `HTTP ${res.status}` };
  const cust = data.customer || data;
  return { ok: true, customer: cust };
}

async function ensureSelectedCustomerFull() {
  const id = getSelectedCustomerId();
  if (!id) return null;

  const cached = customersCache.find((c) => c.id === id) || null;

  if (cached && (cached.widget_key || cached.plan || cached.system_prompt || Array.isArray(cached.allowed_domains))) {
    return cached;
  }

  const r = await fetchCustomerFull(id);
  if (!r.ok) return cached;
  cacheUpsert(r.customer);
  return r.customer;
}

function refreshCustomerSelectFromCache({ keepSelection = true } = {}) {
  const statusEl = document.getElementById("cust_load_status");
  const searchEl = document.getElementById("cust_search");
  const selectEl = document.getElementById("cust_select");
  if (!selectEl) return;

  const selectedId = keepSelection ? getSelectedCustomerId() : "";
  const query = (searchEl?.value || "").trim();

  const filtered = filterCustomers(customersCache, query);
  renderCustomerSelectOptions({ list: filtered, selectedId });

  if (statusEl) {
    statusEl.textContent = query
      ? `Filter aktiv: ${filtered.length} / ${customersCache.length}`
      : `OK: ${customersCache.length} Customer geladen.`;
    statusEl.className = "status success";
  }

  if (!selectEl.value) {
    renderCustomerIntoEditor({});
  }

  refreshAllExtraPickers();
  refreshStatsPicker({ keepSelection: true });
  refreshAnswersPicker({ keepSelection: true });
  refreshWidgetPicker({ keepSelection: true });
}

async function loadCustomersList({ keepSelection = true } = {}) {
  const statusEl = document.getElementById("cust_load_status");
  const selectEl = document.getElementById("cust_select");
  if (!selectEl) return;

  setStatus(statusEl, "Lade Customers …", "info");

  try {
    const res = await getJSONWithAdmin(ADMIN_CUSTOMERS_URL);
    if (res._noFetch) {
      setStatus(statusEl, "Kein Admin-Token gesetzt.", "error");
      return;
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setStatus(statusEl, data?.error || `Fehler beim Laden (HTTP ${res.status}).`, "error");
      return;
    }

    const list = Array.isArray(data) ? data : (data.customers || []);
    customersCache = Array.isArray(list) ? list : [];

    sortCustomersInPlace(customersCache);

    const prevSelected = keepSelection ? getSelectedCustomerId() : "";
    const searchEl = document.getElementById("cust_search");
    const query = (searchEl?.value || "").trim();
    const filtered = filterCustomers(customersCache, query);

    renderCustomerSelectOptions({ list: filtered, selectedId: prevSelected });

    setStatus(
      statusEl,
      query ? `OK: ${filtered.length} / ${customersCache.length} (gefiltert).` : `OK: ${customersCache.length} Customer geladen.`,
      "success"
    );

    refreshAllExtraPickers();
    refreshStatsPicker({ keepSelection: true });
    refreshAnswersPicker({ keepSelection: true });
    refreshWidgetPicker({ keepSelection: true });

    if (selectEl.value) {
  const full = await ensureSelectedCustomerFull();
  renderCustomerIntoEditor(full || {});
  await syncStoragePanels(selectEl.value);
  await syncMonthlyUsagePanels(selectEl.value);
} else {
  renderCustomerIntoEditor({});
  renderStorageBox("customer", null, "info", "Kein Customer ausgewählt.");
  renderStorageBox("upload", null, "info", "Kein Customer ausgewählt.");
  renderMonthlyUsageBox("customer", null, "info", "Kein Customer ausgewählt.");
  renderMonthlyUsageBox("stats", null, "info", "Kein Customer ausgewählt.");
  updateModelHint({ planElId: "cust_plan", modelElId: "cust_model", hintElId: "cust_model_hint" });
}
  } catch {
    setStatus(statusEl, "Keine Verbindung zum Backend oder Endpoint fehlt.", "error");
  }
}

async function saveSelectedCustomer() {
  const statusEl = document.getElementById("cust_edit_status");
  const id = document.getElementById("cust_id")?.value?.trim();
  if (!id) {
    setStatus(statusEl, "Kein Customer ausgewählt.", "error");
    return;
  }

  const payload = {
    name: (document.getElementById("cust_name")?.value ?? "").trim() || null,
    plan: (document.getElementById("cust_plan")?.value ?? "").trim() || null,
    model: (document.getElementById("cust_model")?.value ?? "").trim() || null,
    system_prompt: (document.getElementById("cust_system_prompt")?.value ?? "").trim() || null,
    allowed_domains: parseAllowedDomainsTextarea(document.getElementById("cust_allowed_domains")?.value ?? ""),
    monthly_message_limit: safeNumberOrNull(document.getElementById("cust_monthly_limit")?.value),
    storage_chunk_limit: safeNumberOrNull(document.getElementById("cust_storage_chunk_limit")?.value),
    ask_rpm_limit: safeNumberOrNull(document.getElementById("cust_ask_rpm_limit")?.value),
    support_email: (document.getElementById("cust_support_email")?.value ?? "").trim() || null,
    support_phone: (document.getElementById("cust_support_phone")?.value ?? "").trim() || null,
    support_notes: (document.getElementById("cust_support_notes")?.value ?? "").trim() || null,
  };

  setStatus(statusEl, "Speichere …", "info");

  try {
    const res = await patchJSONWithAdmin(ADMIN_CUSTOMER_URL(id), payload);
    if (res._noFetch) {
      setStatus(statusEl, "Kein Admin-Token gesetzt.", "error");
      return;
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setStatus(statusEl, data?.error || `Fehler beim Speichern (HTTP ${res.status}).`, "error");
      return;
    }

    const updated = data.customer || data;
    cacheUpsert(updated);

    setStatus(statusEl, "Gespeichert.", "success");

   await loadCustomersList({ keepSelection: true });
const full = await ensureSelectedCustomerFull();
renderCustomerIntoEditor(full || updated || {});
await syncStoragePanels(id);
await syncMonthlyUsagePanels(id);
  } catch {
    setStatus(statusEl, "Keine Verbindung zum Backend oder Endpoint fehlt.", "error");
  }
}

async function createCustomer() {
  const statusEl = document.getElementById("cust_create_status");
  const formEl = document.getElementById("cust_create_form");

  const payload = {
    name: (document.getElementById("create_name")?.value ?? "").trim() || null,
    plan: (document.getElementById("create_plan")?.value ?? "standard").trim(),
    model: (document.getElementById("create_model")?.value ?? "").trim() || null,
    system_prompt: (document.getElementById("create_system_prompt")?.value ?? "").trim() || null,
    allowed_domains: parseAllowedDomainsTextarea(document.getElementById("create_allowed_domains")?.value ?? ""),
    monthly_message_limit: safeNumberOrNull(document.getElementById("create_monthly_limit")?.value),
    storage_chunk_limit: safeNumberOrNull(document.getElementById("create_storage_chunk_limit")?.value),
    ask_rpm_limit: safeNumberOrNull(document.getElementById("create_ask_rpm")?.value),
    support_email: (document.getElementById("create_support_email")?.value ?? "").trim() || null,
    support_phone: (document.getElementById("create_support_phone")?.value ?? "").trim() || null,
    support_notes: (document.getElementById("create_support_notes")?.value ?? "").trim() || null,
  };

  setStatus(statusEl, "Erstelle Customer …", "info");
  disableForm(formEl, true);

  try {
    const res = await postJSONWithAdmin(ADMIN_CUSTOMERS_URL, payload);
    if (res._noFetch) {
      setStatus(statusEl, "Kein Admin-Token gesetzt.", "error");
      return;
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setStatus(statusEl, data?.error || `Fehler beim Erstellen (HTTP ${res.status}).`, "error");
      return;
    }

    const created = data.customer || data;
    if (!created?.id) {
      setStatus(statusEl, "Customer erstellt, aber keine ID zurückbekommen (Backend Response prüfen).", "error");
      return;
    }

    cacheUpsert(created);
    setStatus(statusEl, "Customer erstellt.", "success");

    await loadCustomersList({ keepSelection: false });

    const sel = document.getElementById("cust_select");
    if (sel) sel.value = created.id;

const full = await ensureSelectedCustomerFull();
renderCustomerIntoEditor(full || created);

fillAllCustomerIdInputs(created.id);
refreshAllExtraPickers();
refreshStatsPicker({ keepSelection: true });
refreshAnswersPicker({ keepSelection: true });
refreshWidgetPicker({ keepSelection: true });

await syncStoragePanels(created.id);
await syncMonthlyUsagePanels(created.id);
  } catch {
    setStatus(statusEl, "Keine Verbindung zum Backend oder Endpoint fehlt.", "error");
  } finally {
    disableForm(formEl, false);
  }
}

function clearCreateForm() {
  const ids = [
    "create_name",
    "create_model",
    "create_ask_rpm",
    "create_monthly_limit",
    "create_storage_chunk_limit",
    "create_allowed_domains",
    "create_system_prompt",
    "create_support_email",
    "create_support_phone",
    "create_support_notes",
  ];

  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  const plan = document.getElementById("create_plan");
  if (plan) plan.value = "standard";

  updateModelHint({
    planElId: "create_plan",
    modelElId: "create_model",
    hintElId: "create_model_hint",
  });

  updateStorageLimitHint({
    planElId: "create_plan",
    storageElId: "create_storage_chunk_limit",
    hintElId: "create_storage_limit_hint",
  });

    updateMonthlyLimitHint({
    planElId: "create_plan",
    monthlyElId: "create_monthly_limit",
    hintElId: "create_monthly_limit_hint",
  });
}

async function regenerateWidgetKey() {
  const statusEl = document.getElementById("cust_edit_status");
  const id = document.getElementById("cust_id")?.value?.trim();
  if (!id) {
    setStatus(statusEl, "Kein Customer ausgewählt.", "error");
    return;
  }

  const ok = window.confirm("Widget-Key wirklich neu generieren? Der alte Key funktioniert dann nicht mehr.");
  if (!ok) return;

  setStatus(statusEl, "Generiere neuen Widget-Key …", "info");

  for (const url of WIDGET_REGEN_ENDPOINTS(id)) {
    try {
      const res = await postJSONWithAdmin(url, {});
      if (res._noFetch) {
        setStatus(statusEl, "Kein Admin-Token gesetzt.", "error");
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) continue;

      const updated = data.customer || data;
      cacheUpsert(updated);

      renderCustomerIntoEditor(updated);

      setStatus(statusEl, "Widget-Key aktualisiert.", "success");
      await loadCustomersList({ keepSelection: true });

      // NEW: wenn Widget-Tab sichtbar ist, Snippet Preview aktualisieren
      setWidgetSnippetPreview(updated?.widget_key || "");

      return;
    } catch {}
  }

  setStatus(statusEl, "Konnte Widget-Key nicht regenerieren (Endpoint fehlt?).", "error");
}

async function createCheckoutForSelectedCustomer() {
  const idInput = document.getElementById("cust_id");
  const statusEl = document.getElementById("cust_edit_status");
  const urlInput = document.getElementById("cust_checkout_url");
  const planEl   = document.getElementById("cust_plan");

  const id = idInput?.value?.trim();
  if (!id) {
    setStatus(statusEl, "Kein Customer ausgewählt.", "error");
    return;
  }

  const plan = (planEl?.value || "").trim();
  if (!plan) {
    setStatus(statusEl, "Plan ist leer – bitte zuerst einen Plan wählen und speichern.", "error");
    return;
  }

  setStatus(statusEl, "Erzeuge Checkout-Session …", "info");
  if (urlInput) urlInput.value = "";

  // Für später könnten wir hier success_url / cancel_url mitsenden,
  // vorerst lassen wir das Backend Defaults verwenden.
  const payload = {};

  for (const url of CHECKOUT_URL_ENDPOINTS(id)) {
    try {
      const res = await postJSONWithAdmin(url, payload);
      if (res._noFetch) {
        setStatus(statusEl, "Kein Admin-Token gesetzt.", "error");
        return;
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        // Nächsten Endpoint-Kandidaten probieren
        continue;
      }

      const checkoutUrl =
        data.url ||
        data.checkout_url ||
        data.checkoutUrl ||
        (data.session && (data.session.url || data.session.checkout_url)) ||
        "";

      if (!checkoutUrl) {
        setStatus(statusEl, "Backend-Response ohne URL – bitte Endpoint prüfen.", "error");
        return;
      }

      if (urlInput) urlInput.value = checkoutUrl;

      // Optional: Customer frisch laden (falls Backend z.B. stripe_customer_id gesetzt hat)
      try {
        const fresh = await fetchCustomerFull(id);
        if (fresh.ok && fresh.customer) {
          cacheUpsert(fresh.customer);
          renderCustomerIntoEditor(fresh.customer);
        }
      } catch {
        // nicht kritisch
      }

      setStatus(
        statusEl,
        "Checkout-URL erzeugt. Du kannst den Link jetzt kopieren und an den Kunden schicken.",
        "success"
      );
      return;
    } catch {
      // nächster Kandidat
    }
  }

  setStatus(statusEl, "Konnte keinen Checkout-Endpoint erreichen (server.js-Route prüfen).", "error");
}

async function copyCheckoutUrlToClipboard() {
  const statusEl = document.getElementById("cust_edit_status");
  const urlInput = document.getElementById("cust_checkout_url");
  const url = (urlInput?.value || "").trim();

  if (!url) {
    setStatus(statusEl, "Kein Checkout-Link vorhanden – erst erzeugen.", "error");
    return;
  }

  const ok = await copyToClipboard(url);
  setStatus(
    statusEl,
    ok ? "Checkout-Link kopiert." : "Konnte Link nicht kopieren.",
    ok ? "success" : "error"
  );
}

/* ----------------------------------------------
   Stats (Totals + Daily)
---------------------------------------------- */
async function loadStats({ customerIdOrNull, days }) {
  const statusEl = document.getElementById("stats_status");
  const rawEl = document.getElementById("stats_raw");
  const totalEl = document.getElementById("stat_total");
  const allowedEl = document.getElementById("stat_allowed");
  const blockedEl = document.getElementById("stat_blocked");
  const fallbacksEl = document.getElementById("stat_fallbacks");

  setStatus(statusEl, "Lade Totals …", "info");
  if (rawEl) rawEl.textContent = "";

  const query = new URLSearchParams();
  query.set("days", String(days || 7));
  if (customerIdOrNull) query.set("customer_id", customerIdOrNull);

  for (const base of STATS_ENDPOINT_CANDIDATES) {
    const url = `${base}?${query.toString()}`;

    try {
      const res = await getJSONWithAdmin(url);
      if (res._noFetch) {
        setStatus(statusEl, "Kein Admin-Token gesetzt.", "error");
        return { ok: false };
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) continue;

      const totals = data?.totals || {};
      if (totalEl) totalEl.textContent = String(totals.total ?? "–");
      if (allowedEl) allowedEl.textContent = String(totals.allowed ?? "–");
      if (blockedEl) blockedEl.textContent = String(totals.blocked ?? "–");
      if (fallbacksEl) fallbacksEl.textContent = String(totals.fallbacks ?? "–");
      if (rawEl) rawEl.textContent = JSON.stringify(data, null, 2);

      setStatus(statusEl, `OK (via ${base})`, "success");
      return { ok: true };
    } catch {}
  }

  setStatus(statusEl, "Konnte Totals nicht laden (Endpoint fehlt oder Fehler).", "error");
  return { ok: false };
}

function renderDailyTable(daysArr) {
  const body = document.getElementById("daily_body");
  if (!body) return;

  const rows = Array.isArray(daysArr) ? daysArr : [];

  if (!rows.length) {
    body.innerHTML = `<tr><td colspan="5" style="color:#6b7280;">Keine Daten.</td></tr>`;
    return;
  }

  body.innerHTML = "";
  for (const r of rows) {
    const date = r?.date ?? "";
    const total = Number(r?.total ?? 0);
    const allowed = Number(r?.allowed ?? 0);
    const blocked = Number(r?.blocked ?? 0);
    const fallbacks = Number(r?.fallbacks ?? 0);

    const tr = document.createElement("tr");

    const tdDate = document.createElement("td");
    tdDate.textContent = String(date);

    const tdTotal = document.createElement("td");
    tdTotal.textContent = String(total);
    tdTotal.style.textAlign = "right";

    const tdAllowed = document.createElement("td");
    tdAllowed.textContent = String(allowed);
    tdAllowed.style.textAlign = "right";

    const tdBlocked = document.createElement("td");
    tdBlocked.textContent = String(blocked);
    tdBlocked.style.textAlign = "right";

    const tdFallbacks = document.createElement("td");
    tdFallbacks.textContent = String(fallbacks);
    tdFallbacks.style.textAlign = "right";

    tr.appendChild(tdDate);
    tr.appendChild(tdTotal);
    tr.appendChild(tdAllowed);
    tr.appendChild(tdBlocked);
    tr.appendChild(tdFallbacks);

    body.appendChild(tr);
  }
}

async function loadDailyStats({ customerIdOrNull, days }) {
  const statusEl = document.getElementById("daily_status");
  const rawEl = document.getElementById("daily_raw");

  setStatus(statusEl, "Lade Daily …", "info");
  if (rawEl) rawEl.textContent = "";

  renderDailyTable([]);

  const query = new URLSearchParams();
  query.set("days", String(days || 7));
  if (customerIdOrNull) query.set("customer_id", customerIdOrNull);

  for (const base of DAILY_STATS_ENDPOINT_CANDIDATES) {
    const url = `${base}?${query.toString()}`;

    try {
      const res = await getJSONWithAdmin(url);
      if (res._noFetch) {
        setStatus(statusEl, "Kein Admin-Token gesetzt.", "error");
        return { ok: false };
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) continue;

      const rows = data?.days || [];
      renderDailyTable(rows);

      if (rawEl) rawEl.textContent = JSON.stringify(data, null, 2);
      setStatus(statusEl, `OK (via ${base})`, "success");
      return { ok: true };
    } catch {}
  }

  setStatus(statusEl, "Konnte Daily nicht laden (Endpoint fehlt oder Fehler).", "error");
  return { ok: false };
}

async function loadTotalsAndDaily({ customerIdOrNull, days }) {
  await loadStats({ customerIdOrNull, days });
  await loadDailyStats({ customerIdOrNull, days });
}

/* ----------------------------------------------
   Antworten (Interaktionen)
---------------------------------------------- */
function renderAnswersTable(items) {
  const body = document.getElementById("answers_body");
  if (!body) return;

  const rows = Array.isArray(items) ? items : [];

  if (!rows.length) {
    body.innerHTML = `<tr><td colspan="5" style="color:#6b7280;">Keine Daten.</td></tr>`;
    return;
  }

  body.innerHTML = "";

  for (const r of rows) {
    const time = r?.created_at ?? r?.timestamp ?? r?.ts ?? r?.time ?? r?.inserted_at ?? "";
    const customer = r?.customer_id ?? r?.customerId ?? r?.customer?.id ?? r?.customer ?? "";
    const question = r?.question ?? r?.prompt ?? r?.user_message ?? r?.input ?? r?.query ?? "";
    const answer = r?.answer ?? r?.assistant_message ?? r?.output ?? r?.response ?? "";

    let status = r?.status ?? "";
    const allowedFlag = (typeof r?.allowed === "boolean") ? r.allowed : null;
    const blockedFlag = (typeof r?.blocked === "boolean") ? r.blocked : null;
    const fallbackReason = r?.fallback_reason ? String(r.fallback_reason) : null;

    if (!status) {
      if (blockedFlag === true) status = "blocked";
      else if (allowedFlag === true) status = "allowed";
      else if (allowedFlag === false) status = "blocked";
      else status = "—";
    }

    // Support-Fallback sichtbar machen (z.B. "fallback: low_similarity")
    if (fallbackReason) {
      status = status === "blocked"
        ? `blocked (${fallbackReason})`
        : `fallback: ${fallbackReason}`;
    }

    const tr = document.createElement("tr");

    const tdTime = document.createElement("td");
    tdTime.textContent = formatTimeMaybe(time);

    const tdCust = document.createElement("td");
    tdCust.textContent = String(customer);

    const tdQ = document.createElement("td");
    tdQ.textContent = String(question);
    tdQ.style.whiteSpace = "normal";
    tdQ.style.minWidth = "260px";

    const tdA = document.createElement("td");
    tdA.textContent = String(answer);
    tdA.style.whiteSpace = "normal";
    tdA.style.minWidth = "260px";

    const tdS = document.createElement("td");
    tdS.textContent = String(status);
    tdS.style.textAlign = "right";

    tr.appendChild(tdTime);
    tr.appendChild(tdCust);
    tr.appendChild(tdQ);
    tr.appendChild(tdA);
    tr.appendChild(tdS);

    body.appendChild(tr);
  }
}

async function loadAnswers({ customerIdOrNull, days, limit, textQuery }) {
  const statusEl = document.getElementById("answers_status");
  const rawEl = document.getElementById("answers_raw");

  setStatus(statusEl, "Lade Antworten …", "info");
  if (rawEl) rawEl.textContent = "";

  renderAnswersTable([]);

  const panel = document.getElementById("panel-answers");

  const q = new URLSearchParams();
  q.set("days", String(days || 7));
  q.set("limit", String(limit || 50));
  if (customerIdOrNull) q.set("customer_id", customerIdOrNull);

  const tq = String(textQuery || "").trim();
  if (tq) {
    q.set("q", tq);
    q.set("query", tq);
    q.set("search", tq);
  }

  disableForm(panel, true);

  try {
    for (const base of ANSWERS_ENDPOINT_CANDIDATES) {
      const url = `${base}?${q.toString()}`;

      try {
        const res = await getJSONWithAdmin(url);
        if (res._noFetch) {
          setStatus(statusEl, "Kein Admin-Token gesetzt.", "error");
          return { ok: false };
        }

        const data = await res.json().catch(() => ({}));
        if (!res.ok) continue;

        const items =
          (Array.isArray(data) ? data : null) ||
          data?.answers ||
          data?.interactions ||
          data?.items ||
          data?.rows ||
          [];

        renderAnswersTable(items);

        if (rawEl) rawEl.textContent = JSON.stringify(data, null, 2);
        setStatus(statusEl, `OK (via ${base})`, "success");
        return { ok: true };
      } catch {}
    }

    setStatus(statusEl, "Konnte Antworten nicht laden (Endpoint fehlt oder Fehler).", "error");
    return { ok: false };
  } finally {
    disableForm(panel, false);
  }
}

/* ----------------------------------------------
   Widget Customizer wiring (DUAL kompatibel)
---------------------------------------------- */
function wireWidgetCustomizer() {
  const panel = document.getElementById("panel-widget");
  if (!panel) return;

  const statusEl = document.getElementById("widget_status");
  const loadStatusEl = document.getElementById("widget_load_status");

  const pickSel = document.getElementById("widget_pick_select");

  const btnUseCurrentOld = document.getElementById("widget_use_current_customer");
  const btnLoadFromSelectedOld = document.getElementById("widget_load_from_selected");

  const btnSave = document.getElementById("widget_save");
  const btnReset = document.getElementById("widget_reset_defaults");

  const btnUpload = document.getElementById("widget_avatar_upload");
  const btnClearAvatar = document.getElementById("widget_avatar_clear");
  const fileEl = document.getElementById("widget_avatar_file");

  // NEW: widget snippet UI (Widget-Tab)
  const btnCopySnippet = document.getElementById("widget_copy_snippet");
  const snippetStatusEl = document.getElementById("widget_snippet_status");
  const snippetPrevEl = document.getElementById("widget_snippet_preview");

  // Ensure the color UIs exist once panel is wired
  ensureWidgetColorUIs();

  const loadCustomerIntoWidgetForm = async (customerId) => {
    if (!customerId) {
      setStatus(loadStatusEl || statusEl, "Kein Customer ausgewählt.", "error");
      if (snippetPrevEl) snippetPrevEl.textContent = "";
      if (snippetStatusEl) setStatus(snippetStatusEl, "Kein Customer ausgewählt.", "info");
      return;
    }

    setStatus(loadStatusEl || statusEl, "Lade Widget-Settings …", "info");
    const r = await fetchCustomerFull(customerId);
    if (!r.ok) {
      setStatus(loadStatusEl || statusEl, r.error || "Konnte Customer nicht laden.", "error");
      if (snippetPrevEl) snippetPrevEl.textContent = "";
      if (snippetStatusEl) setStatus(snippetStatusEl, "Snippet nicht verfügbar.", "error");
      return;
    }

    cacheUpsert(r.customer);

    writeValueToAny(["widget_customer_id"], r.customer?.id || customerId);
    writeValueToAny(["widget_widget_key"], r.customer?.widget_key || "");

    const ws = readWidgetSettingsFromCustomer(r.customer);
    writeWidgetSettingsToForm(ws);

    // make sure previews/hex are synced after writing
    ensureWidgetColorUIs();

    // NEW: Snippet Preview aktualisieren
    setWidgetSnippetPreview(r.customer?.widget_key || "");

    setStatus(loadStatusEl || statusEl, "Widget-Settings geladen.", "success");
  };

  if (pickSel) {
    pickSel.addEventListener("change", async () => {
      const id = getWidgetSelectedCustomerId();
      await loadCustomerIntoWidgetForm(id);
    });
  }

  if (btnUseCurrentOld) {
    btnUseCurrentOld.addEventListener("click", async () => {
      const id = getSelectedCustomerId();
      if (!id) {
        setStatus(statusEl, "Bitte im Customers-Tab einen Customer auswählen.", "error");
        return;
      }
      await loadCustomerIntoWidgetForm(id);
    });
  }
  if (btnLoadFromSelectedOld) {
    btnLoadFromSelectedOld.addEventListener("click", async () => {
      const id = getSelectedCustomerId();
      if (!id) {
        setStatus(statusEl, "Bitte im Customers-Tab einen Customer auswählen.", "error");
        return;
      }
      await loadCustomerIntoWidgetForm(id);
    });
  }

  // NEW: Snippet kopieren im Widget-Tab
  if (btnCopySnippet) {
    btnCopySnippet.addEventListener("click", async () => {
      const wk = getWidgetKeyFromWidgetTab();
      if (!wk) {
        if (snippetStatusEl) setStatus(snippetStatusEl, "Kein widget_key vorhanden (Customer auswählen).", "error");
        return;
      }
      const snippet = buildWidgetSnippet({ widgetKey: wk });
      const ok = await copyToClipboard(snippet);
      if (snippetPrevEl) snippetPrevEl.textContent = snippet;
      if (snippetStatusEl) setStatus(snippetStatusEl, ok ? "Snippet kopiert." : "Konnte nicht kopieren.", ok ? "success" : "error");
    });
  }

  const hookInputs = [
  "widget_bot_name",
  "widget_user_label",
  "widget_greeting_text",
  "widget_launcher_text",
  "widget_first_message",
  "widget_bot_greeting",
  "widget_header_color",
  "widget_header_bg",
  "widget_accent_color",
  "widget_accent",
  "widget_text_color_mode",
  "widget_theme_mode",
  "widget_privacy_url",

];
  for (const id of hookInputs) {
    const el = document.getElementById(id);
    if (!el) continue;
    el.addEventListener("input", () => {
      // keep color UI in sync
      ensureWidgetColorUIs();
      const s = readWidgetSettingsFromForm();
      setTextToAny(["widget_raw"], JSON.stringify(s, null, 2));
    });
  }

  if (btnReset) {
    btnReset.addEventListener("click", () => {
      writeWidgetSettingsToForm({ ...DEFAULT_WIDGET_SETTINGS });
      ensureWidgetColorUIs();
      setStatus(statusEl, "Defaults gesetzt (noch nicht gespeichert).", "info");
    });
  }

  if (btnSave) {
    btnSave.addEventListener("click", async () => {
      const id = getWidgetSelectedCustomerId();
      if (!id) {
        setStatus(statusEl, "Kein Customer ausgewählt.", "error");
        return;
      }
      await saveWidgetSettingsForCustomer(id);
      ensureWidgetColorUIs();
    });
  }

  if (btnUpload) {
    btnUpload.addEventListener("click", async () => {
      const id = getWidgetSelectedCustomerId();
      const file = fileEl?.files?.[0] || null;

      const up = await uploadWidgetAvatar({ customerId: id, file });
      if (!up.ok) return;

      const img = document.getElementById("widget_avatar_preview");
      const fb = document.getElementById("widget_avatar_preview_fallback");
      if (img) {
        img.src = up.url;
        img.style.display = "block";
      }
      if (fb) fb.style.display = "none";

      // Backend hat widget_settings evtl. schon aktualisiert -> UI aktualisieren
      if (up.widget_settings && typeof up.widget_settings === "object") {
        const ws = readWidgetSettingsFromCustomer({ widget_settings: up.widget_settings });
        writeWidgetSettingsToForm(ws);
      }

      // Sicher speichern (z.B. wenn du im Form noch andere Änderungen hast)
      await saveWidgetSettingsForCustomer(id);
      ensureWidgetColorUIs();
    });
  }

  if (btnClearAvatar) {
    btnClearAvatar.addEventListener("click", async () => {
      const id = getWidgetSelectedCustomerId();

      if (!id) {
        setStatus(statusEl, "Kein Customer ausgewählt.", "error");
        return;
      }

      const ok = window.confirm("Avatar wirklich entfernen?");
      if (!ok) return;

      const del = await deleteWidgetAvatar({ customerId: id });
      if (!del.ok) return;

      const img = document.getElementById("widget_avatar_preview");
      const fb = document.getElementById("widget_avatar_preview_fallback");

      if (img) {
        img.removeAttribute("src");
        img.style.display = "none";
      }
      if (fb) fb.style.display = "block";
      if (fileEl) fileEl.value = "";

      if (del.widget_settings && typeof del.widget_settings === "object") {
        const ws = readWidgetSettingsFromCustomer({ widget_settings: del.widget_settings });
        writeWidgetSettingsToForm(ws);
      } else {
        // Fallback: nur UI leeren + speichern
        await saveWidgetSettingsForCustomer(id);
      }

      ensureWidgetColorUIs();
    });
  }

  const initialId = getWidgetSelectedCustomerId();
  if (initialId) {
    loadCustomerIntoWidgetForm(initialId).catch(() => {});
  } else {
    writeWidgetSettingsToForm({ ...DEFAULT_WIDGET_SETTINGS });
    ensureWidgetColorUIs();
    // NEW: Snippet UI leeren
    setWidgetSnippetPreview("");
  }
}

/* ----------------------------------------------
   Init
---------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  initThemeToggle();

  // Clean up legacy URL params that are no longer read or stored
  try {
    const u = new URL(location.href);
    const stale = ["admin_token", "backend_base", "api_base", "backend"];
    if (stale.some(p => u.searchParams.has(p))) {
      stale.forEach(p => u.searchParams.delete(p));
      window.history.replaceState({}, "", u.toString());
    }
  } catch {}

  // Admin-Token UI wiring
  const tokenInput = document.getElementById("admin-token-input");
  const saveBtn    = document.getElementById("save-admin-token");
  const clearBtn   = document.getElementById("clear-admin-token");
  const hintEl     = document.getElementById("admin-token-hint");

  if (tokenInput) {
    tokenInput.value = getStoredToken();
    if (hintEl) hintEl.textContent = tokenInput.value ? "Token geladen (lokal gespeichert)" : "Noch kein Token gespeichert";

    if (saveBtn) {
      saveBtn.addEventListener("click", () => {
        const t = (tokenInput.value || "").trim();
        if (!t) { if (hintEl) hintEl.textContent = "Bitte zuerst ein Token eingeben."; return; }
        setStoredToken(t);
        if (hintEl) hintEl.textContent = "Token gespeichert.";
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        clearStoredToken();
        tokenInput.value = "";
        if (hintEl) hintEl.textContent = "Token gelöscht.";
      });
    }

    tokenInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && saveBtn) { e.preventDefault(); saveBtn.click(); }
    });
  }

  // Wire pickers early
  wireExtraPickers();
  wireStatsPicker();
  wireAnswersPicker();
  wireWidgetPicker();

const uploadCustomerInput = document.getElementById("customer_id");
const uploadCustomerSelect = document.getElementById("pick_upload_select");

if (uploadCustomerSelect) {
  uploadCustomerSelect.addEventListener("change", async () => {
    const id = (uploadCustomerSelect.value || "").trim();
    if (!id) {
      renderStorageBox("upload", null, "info", "Kein Customer ausgewählt.");
      return;
    }
    await loadStorageIntoScope("upload", id);
  });
}

if (uploadCustomerInput) {
  uploadCustomerInput.addEventListener("change", async () => {
    const id = (uploadCustomerInput.value || "").trim();
    if (!id) {
      renderStorageBox("upload", null, "info", "Kein Customer ausgewählt.");
      return;
    }
    await loadStorageIntoScope("upload", id);
  });
}

  /* -------------------------
     Customers wiring
  ------------------------- */
  const custRefresh = document.getElementById("cust_refresh");
  const custSelect = document.getElementById("cust_select");
  const custSearch = document.getElementById("cust_search");
  const custApply = document.getElementById("cust_apply_to_forms");
  const custSave = document.getElementById("cust_save");
  const custCopySnippet = document.getElementById("cust_copy_snippet"); // legacy (may be removed in HTML)
  const custRegen = document.getElementById("cust_regen_widget_key");

  // NEW: Checkout-Buttons
  const custCheckoutBtn = document.getElementById("cust_checkout_btn");
  const custCheckoutCopy = document.getElementById("cust_checkout_copy");

  const custCreateBtn = document.getElementById("cust_create_btn");
  const custCreateClear = document.getElementById("cust_create_clear");

  if (custRefresh) custRefresh.addEventListener("click", () => loadCustomersList({ keepSelection: true }));

  if (custSearch) {
    custSearch.addEventListener("input", () => refreshCustomerSelectFromCache({ keepSelection: true }));
    custSearch.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        custSearch.value = "";
        refreshCustomerSelectFromCache({ keepSelection: true });
      }
    });
  }

if (custSelect) {
  custSelect.addEventListener("change", async () => {
    const id = getSelectedCustomerId();
    if (!id) {
      renderCustomerIntoEditor({});
      renderStorageBox("customer", null, "info", "Kein Customer ausgewählt.");
      renderMonthlyUsageBox("customer", null, "info", "Kein Customer ausgewählt.");
      renderMonthlyUsageBox("stats", null, "info", "Kein Customer ausgewählt.");
      return;
    }
    const full = await ensureSelectedCustomerFull();
    renderCustomerIntoEditor(full || {});
    await syncStoragePanels(id);
    await syncMonthlyUsagePanels(id);
  });
}

  if (custApply) {
    custApply.addEventListener("click", () => {
      const id = getSelectedCustomerId();
      if (!id) return;
      fillAllCustomerIdInputs(id);
      refreshAllExtraPickers();
      refreshStatsPicker({ keepSelection: true });
      refreshAnswersPicker({ keepSelection: true });
      refreshWidgetPicker({ keepSelection: true });

      const widgetSel = document.getElementById("widget_pick_select");
      if (widgetSel) {
        widgetSel.value = id;
        widgetSel.dispatchEvent(new Event("change"));
      }
    });
  }

  if (custSave) custSave.addEventListener("click", saveSelectedCustomer);

    if (custCheckoutBtn) {
    custCheckoutBtn.addEventListener("click", createCheckoutForSelectedCustomer);
  }
  if (custCheckoutCopy) {
    custCheckoutCopy.addEventListener("click", copyCheckoutUrlToClipboard);
  }

  if (custCreateBtn) custCreateBtn.addEventListener("click", createCustomer);
  if (custCreateClear) custCreateClear.addEventListener("click", () => {
    clearCreateForm();
    const st = document.getElementById("cust_create_status");
    setStatus(st, "", "info");
  });

  if (custRegen) custRegen.addEventListener("click", regenerateWidgetKey);

  // Legacy: falls du den Button noch irgendwo hast (harmlos, wenn nicht vorhanden)
  if (custCopySnippet) {
    custCopySnippet.addEventListener("click", async () => {
      const statusEl = document.getElementById("cust_edit_status");

      const wk = (document.getElementById("cust_widget_key")?.value || "").trim();
      if (!wk) {
        setStatus(statusEl, "Kein widget_key vorhanden (Customer auswählen oder Key generieren).", "error");
        return;
      }

      const snippet = buildWidgetSnippet({ widgetKey: wk });
      const ok = await copyToClipboard(snippet);

      const prev = document.getElementById("cust_snippet_preview");
      if (prev) prev.textContent = snippet;

      setStatus(statusEl, ok ? "Snippet kopiert." : "Konnte nicht kopieren.", ok ? "success" : "error");
    });
  }

  // Model hints wiring (Create + Edit)
  const createPlanEl = document.getElementById("create_plan");
  const createModelEl = document.getElementById("create_model");
  const createStorageEl = document.getElementById("create_storage_chunk_limit");
  const createMonthlyEl = document.getElementById("create_monthly_limit");

  if (createPlanEl) createPlanEl.addEventListener("change", () => {
    updateModelHint({
      planElId: "create_plan",
      modelElId: "create_model",
      hintElId: "create_model_hint",
    });

    updateStorageLimitHint({
      planElId: "create_plan",
      storageElId: "create_storage_chunk_limit",
      hintElId: "create_storage_limit_hint",
    });

   updateMonthlyLimitHint({
      planElId: "create_plan",
      monthlyElId: "create_monthly_limit",
     hintElId: "create_monthly_limit_hint",
     });
  });

  if (createModelEl) createModelEl.addEventListener("input", () =>
    updateModelHint({
      planElId: "create_plan",
      modelElId: "create_model",
      hintElId: "create_model_hint",
    })
  );

  if (createStorageEl) createStorageEl.addEventListener("input", () =>
    updateStorageLimitHint({
      planElId: "create_plan",
      storageElId: "create_storage_chunk_limit",
      hintElId: "create_storage_limit_hint",
    })
  );

  if (createMonthlyEl) createMonthlyEl.addEventListener("input", () =>
    updateMonthlyLimitHint({
      planElId: "create_plan",
      monthlyElId: "create_monthly_limit",
      hintElId: "create_monthly_limit_hint",
  })
);

  const editPlanEl = document.getElementById("cust_plan");
  const editModelEl = document.getElementById("cust_model");
  const editStorageEl = document.getElementById("cust_storage_chunk_limit");
  const editMonthlyEl = document.getElementById("cust_monthly_limit");

 if (editPlanEl) editPlanEl.addEventListener("change", () => {
  updateModelHint({
    planElId: "cust_plan",
    modelElId: "cust_model",
    hintElId: "cust_model_hint",
  });

  updateStorageLimitHint({
    planElId: "cust_plan",
    storageElId: "cust_storage_chunk_limit",
    hintElId: "cust_storage_limit_hint",
  });

  updateMonthlyLimitHint({
    planElId: "cust_plan",
    monthlyElId: "cust_monthly_limit",
    hintElId: "cust_monthly_limit_hint",
  });
});

  if (editModelEl) editModelEl.addEventListener("input", () =>
    updateModelHint({
      planElId: "cust_plan",
      modelElId: "cust_model",
      hintElId: "cust_model_hint",
    })
  );

  if (editStorageEl) editStorageEl.addEventListener("input", () =>
    updateStorageLimitHint({
      planElId: "cust_plan",
      storageElId: "cust_storage_chunk_limit",
      hintElId: "cust_storage_limit_hint",
    })
  );

  if (editMonthlyEl) editMonthlyEl.addEventListener("input", () =>
  updateMonthlyLimitHint({
    planElId: "cust_plan",
    monthlyElId: "cust_monthly_limit",
    hintElId: "cust_monthly_limit_hint",
  })
);

  updateModelHint({
    planElId: "create_plan",
    modelElId: "create_model",
    hintElId: "create_model_hint",
  });

  updateModelHint({
    planElId: "cust_plan",
    modelElId: "cust_model",
    hintElId: "cust_model_hint",
  });

  updateStorageLimitHint({
    planElId: "create_plan",
    storageElId: "create_storage_chunk_limit",
    hintElId: "create_storage_limit_hint",
  });

  updateStorageLimitHint({
    planElId: "cust_plan",
    storageElId: "cust_storage_chunk_limit",
    hintElId: "cust_storage_limit_hint",
  });

  updateMonthlyLimitHint({
    planElId: "create_plan",
    monthlyElId: "create_monthly_limit",
    hintElId: "create_monthly_limit_hint",
  });

  updateMonthlyLimitHint({
    planElId: "cust_plan",
    monthlyElId: "cust_monthly_limit",
    hintElId: "cust_monthly_limit_hint",
  });

  // Auto-load customers once
  loadCustomersList({ keepSelection: true });


  /* -------------------------
     Stats wiring
  ------------------------- */
  const statsDays = document.getElementById("stats_days");
  const btnAll = document.getElementById("stats_all");
  const btnSelected = document.getElementById("stats_selected");

  if (btnAll) {
    btnAll.addEventListener("click", () => {
      const days = Number(statsDays?.value || 7);
      loadTotalsAndDaily({ customerIdOrNull: null, days });
    });
  }

  if (btnSelected) {
    btnSelected.addEventListener("click", () => {
      const days = Number(statsDays?.value || 7);
      const id = getStatsSelectedCustomerId();

      const totalsStatusEl = document.getElementById("stats_status");
      const dailyStatusEl = document.getElementById("daily_status");

      if (!id) {
        setStatus(totalsStatusEl, "Kein Customer ausgewählt (Stats Tab Picker oder Customers Tab auswählen).", "error");
        setStatus(dailyStatusEl, "Kein Customer ausgewählt.", "error");
        return;
      }

      loadTotalsAndDaily({ customerIdOrNull: id, days });
loadMonthlyUsageIntoScope("stats", id);
    });
  }

  /* -------------------------
     Antworten wiring
  ------------------------- */
  const answersDays = document.getElementById("answers_days");
  const answersLimit = document.getElementById("answers_limit");
  const answersQuery = document.getElementById("answers_query");
  const answersBtnAll = document.getElementById("answers_load_all");
  const answersBtnSelected = document.getElementById("answers_load_selected");

  if (answersBtnAll) {
    answersBtnAll.addEventListener("click", () => {
      const days = Number(answersDays?.value || 7);
      const limit = Number(answersLimit?.value || 50);
      const q = (answersQuery?.value || "").trim();
      loadAnswers({ customerIdOrNull: null, days, limit, textQuery: q });
    });
  }

  if (answersBtnSelected) {
    answersBtnSelected.addEventListener("click", () => {
      const days = Number(answersDays?.value || 7);
      const limit = Number(answersLimit?.value || 50);
      const q = (answersQuery?.value || "").trim();

      const id = getAnswersSelectedCustomerId();
      const st = document.getElementById("answers_status");

      if (!id) {
        setStatus(st, "Kein Customer ausgewählt (Antworten-Picker oder Customers-Tab Auswahl).", "error");
        return;
      }

      loadAnswers({ customerIdOrNull: id, days, limit, textQuery: q });
    });
  }

  /* ----------------------------------------------
     1) MANUELLER UPLOAD (/ingest)
  ---------------------------------------------- */
  const form = document.getElementById("upload-form");
  const statusEl = document.getElementById("status");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const customerId  = document.getElementById("customer_id").value.trim();
      const content     = document.getElementById("content").value.trim();
      const metadataRaw = document.getElementById("metadata").value.trim();

      if (!customerId || !content) {
        setStatus(statusEl, "customer_id und content sind Pflicht.", "error");
        return;
      }

      let contentHash = "";
      try {
        contentHash = await hashContent(content);
        const recent = loadRecentHashes(customerId);
        if (recent.includes(contentHash)) {
          const proceed = window.confirm("Hinweis: Identischer Inhalt wurde vor Kurzem schon hochgeladen. Trotzdem erneut speichern?");
          if (!proceed) return;
        }
      } catch {}

      let metadata = null;
      if (metadataRaw !== "") {
        try { metadata = JSON.parse(metadataRaw); }
        catch { setStatus(statusEl, "Metadata ist kein gültiges JSON.", "error"); return; }
      }

      if (!metadata || (metadata && typeof metadata.category === "undefined")) {
        const cat = guessCategoryFromContent(content);
        metadata = { ...(metadata || {}), category: cat };
      }

      setStatus(statusEl, "Sende …", "info");
      disableForm(form, true);

      try {
        const res = await postJSONWithAdmin(INGEST_URL, {
          customer_id: customerId,
          content,
          metadata,
        });

        if (res._noFetch) { setStatus(statusEl, "Kein Admin-Token gesetzt.", "error"); return; }

        const data = await res.json().catch(() => ({}));

if (!res.ok) {
  if (res.status === 409 && data?.error === "STORAGE_LIMIT_REACHED") {
    renderStorageBox(
      "upload",
      data?.storage || null,
      "error",
      "Speicherlimit erreicht. Dieser Upload wurde nicht gespeichert."
    );

    const selectedCustomerId = getSelectedCustomerId();
    if (selectedCustomerId && selectedCustomerId === customerId) {
      renderStorageBox(
        "customer",
        data?.storage || null,
        "error",
        "Speicherlimit erreicht. Dieser Upload wurde nicht gespeichert."
      );
    }

    setStatus(statusEl, "Speicherlimit erreicht.", "error");
    return;
  }

  setStatus(statusEl, data?.error || `Fehler beim Hochladen. (HTTP ${res.status})`, "error");
  return;
}

        if (contentHash) {
          const recent = loadRecentHashes(customerId);
          recent.push(contentHash);
          saveRecentHashes(customerId, recent);
        }

        if (data?.storage) {
  renderStorageBox("upload", data.storage, "success");

  const selectedCustomerId = getSelectedCustomerId();
  if (selectedCustomerId && selectedCustomerId === customerId) {
    renderStorageBox("customer", data.storage, "success");
  }
}

setStatus(statusEl, data?.message || "Gespeichert.", "success");
      } catch {
        setStatus(statusEl, "Keine Verbindung zum Backend (läuft es?).", "error");
      } finally {
        disableForm(form, false);
      }
    });
  }

  /* ----------------------------------------------
     2) CRAWL FORM (/crawl)
  ---------------------------------------------- */
  const crawlForm = document.getElementById("crawl-form");
  const crawlStatusEl = document.getElementById("crawl-status");

  if (crawlForm) {
    crawlForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const crawlCustomerId = document.getElementById("crawl_customer_id").value.trim();
      const crawlUrl = document.getElementById("crawl_url").value.trim();

      if (!crawlCustomerId || !crawlUrl) {
        setStatus(crawlStatusEl, "customer_id und URL sind Pflicht.", "error");
        return;
      }
      if (!isHttpUrl(crawlUrl)) {
        setStatus(crawlStatusEl, "Bitte eine gültige http(s)-URL angeben.", "error");
        return;
      }

      setStatus(crawlStatusEl, "Crawle …", "info");
      disableForm(crawlForm, true);

      try {
        const res = await postJSONWithAdmin(CRAWL_URL, {
          customer_id: crawlCustomerId,
          url: crawlUrl,
          metadata: { requested_by: "admin-ui" },
        });

        if (res._noFetch) { setStatus(crawlStatusEl, "Kein Admin-Token gesetzt.", "error"); return; }

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setStatus(crawlStatusEl, data?.error || `Fehler (${res.status}) beim Crawlen.`, "error");
          return;
        }

        setStatus(crawlStatusEl, data?.message || `Fertig. Gespeicherte Chunks: ${data?.chunks ?? "?"}`, "success");
      } catch {
        setStatus(crawlStatusEl, "Keine Verbindung zum Backend (läuft es?).", "error");
      } finally {
        disableForm(crawlForm, false);
      }
    });
  }

  /* ----------------------------------------------
     3) DOMAIN-CRAWL FORM (/crawl-domain)
  ---------------------------------------------- */
  const domainForm = document.getElementById("domain-form");
  const domainStatusEl = document.getElementById("domain-status");

  if (domainForm) {
    domainForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const customerId  = document.getElementById("dom_customer_id").value.trim();
      const startUrl    = document.getElementById("dom_start_url").value.trim();
      const maxPages    = Number(document.getElementById("dom_max_pages").value);
      const maxDepth    = Number(document.getElementById("dom_max_depth").value);
      const delayMs     = Number(document.getElementById("dom_delay_ms").value);
      const sameOrigin  = document.getElementById("dom_same_origin").checked;
      const respectBots = document.getElementById("dom_respect_robots").checked;

      if (!customerId || !startUrl) {
        setStatus(domainStatusEl, "customer_id und Start-URL sind Pflicht.", "error");
        return;
      }
      if (!isHttpUrl(startUrl)) {
        setStatus(domainStatusEl, "Bitte eine gültige http(s)-Start-URL angeben.", "error");
        return;
      }

      const payload = {
        customer_id: customerId,
        start_url: startUrl,
        max_pages: Number.isFinite(maxPages) ? Math.max(1, Math.min(maxPages, 250)) : 40,
        max_depth: Number.isFinite(maxDepth) ? Math.max(1, Math.min(maxDepth, 6)) : 2,
        same_origin: Boolean(sameOrigin),
        respect_robots: Boolean(respectBots),
        delay_ms: Number.isFinite(delayMs) ? Math.max(0, Math.min(delayMs, 5000)) : 300,
        metadata: { requested_by: "admin-ui" }
      };

      setStatus(domainStatusEl, `Starte Domain-Crawl … (max ${payload.max_pages} Seiten, Tiefe ${payload.max_depth})`, "info");
      disableForm(domainForm, true);

      try {
        const res = await postJSONWithAdmin(DOMAIN_URL, payload);

        if (res._noFetch) { setStatus(domainStatusEl, "Kein Admin-Token gesetzt.", "error"); return; }

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setStatus(domainStatusEl, data?.error || `Fehler (${res.status}) beim Domain-Crawlen.`, "error");
          return;
        }

        const s = data?.stats || {};
        const skipped = s.skipped || {};
        const summary =
          `Domain-Crawl fertig. ` +
          `Seiten besucht: ${s.pagesVisited ?? "?"}, ` +
          `Seiten gespeichert: ${s.pagesSaved ?? "?"}, ` +
          `Chunks: ${s.chunksSaved ?? "?"}. ` +
          `(übersprungen – nonHTML: ${skipped.nonHtml ?? 0}, robots: ${skipped.robots ?? 0}, ` +
          `offOrigin: ${skipped.offOrigin ?? 0}, leer: ${skipped.empty ?? 0}, dup: ${skipped.dup ?? 0})`;

        setStatus(domainStatusEl, summary, "success");
        domainStatusEl.scrollIntoView({ behavior: "smooth", block: "center" });
      } catch {
        setStatus(domainStatusEl, "Keine Verbindung zum Backend (läuft es?).", "error");
      } finally {
        disableForm(domainForm, false);
      }
    });
  }

  /* ----------------------------------------------
     4) PURGE FORM (/purge)
  ---------------------------------------------- */
  const purgeForm = document.getElementById("purge-form");
  const purgeStatusEl = document.getElementById("purge-status");

  if (purgeForm) {
    const btnDry = document.getElementById("purge_btn_dry");
    const btnGo  = document.getElementById("purge_btn_go");

    const runPurge = async ({ dryRun }) => {
      const customerId = document.getElementById("purge_customer_id").value.trim();
      const prefix     = document.getElementById("purge_prefix").value.trim();
      const allChecked = document.getElementById("purge_all").checked;

      if (!customerId) {
        setStatus(purgeStatusEl, "customer_id ist Pflicht.", "error");
        return;
      }

      const noPrefix = !prefix;
      if (!dryRun && noPrefix && !allChecked) {
        setStatus(purgeStatusEl, "Ohne Prefix bitte „Alles löschen“ bestätigen.", "error");
        return;
      }

      const body = {
        customer_id: customerId,
        ...(prefix ? { source_starts_with: prefix } : {}),
        ...(dryRun ? { dry_run: true } : {}),
        ...(noPrefix && !dryRun ? { confirm_all_sources: true } : {})
      };

      if (!dryRun) {
        const label = prefix
          ? `Prefix: ${prefix}`
          : "ALLE Dokumente für diesen Customer (kein Prefix gesetzt)";
        const confirmed = window.confirm(
          `Wirklich löschen?\n\nCustomer: ${customerId}\n${label}\n\nDieser Vorgang kann nicht rückgängig gemacht werden.`
        );
        if (!confirmed) return;
      }

      setStatus(purgeStatusEl, dryRun ? "Prüfe (Dry-Run) …" : "Lösche …", "info");
      disableForm(purgeForm, true);

      try {
        const res = await deleteJSONWithAdmin(PURGE_URL, body);

        if (res._noFetch) { setStatus(purgeStatusEl, "Kein Admin-Token gesetzt.", "error"); return; }

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setStatus(purgeStatusEl, data?.error || `Fehler (${res.status}) beim Purge.`, "error");
          return;
        }

        if (dryRun) {
          setStatus(purgeStatusEl, `Dry-Run: würde ${data?.to_delete ?? 0} Dokument(e) löschen.`, "success");
        } else {
          setStatus(purgeStatusEl, `Gelöscht: ${data?.deleted ?? 0} Dokument(e).`, "success");
        }
      } catch {
        setStatus(purgeStatusEl, "Keine Verbindung zum Backend (läuft es?).", "error");
      } finally {
        disableForm(purgeForm, false);
      }
    };

    if (btnDry) btnDry.addEventListener("click", () => runPurge({ dryRun: true }));
    if (btnGo)  btnGo .addEventListener("click", () => runPurge({ dryRun: false }));
  }

  /* ----------------------------------------------
     5) CUSTOMER DELETE (Danger)  DELETE /admin/customers/:id
  ---------------------------------------------- */
  const custDelForm = document.getElementById("customer-delete-form");
  const custDelStatusEl = document.getElementById("custdel_status");

  if (custDelForm) {
    const btnDry = document.getElementById("custdel_btn_dry");
    const btnGo  = document.getElementById("custdel_btn_go");

    const runCustomerDelete = async ({ dryRun }) => {
      const customerId = (document.getElementById("custdel_customer_id")?.value || "").trim();
      const delDocs = Boolean(document.getElementById("custdel_docs")?.checked);
      const delInts = Boolean(document.getElementById("custdel_interactions")?.checked);
      const confirmed = Boolean(document.getElementById("custdel_confirm")?.checked);

      if (!customerId) {
        setStatus(custDelStatusEl, "customer_id ist Pflicht.", "error");
        return;
      }

      if (!dryRun && !confirmed) {
        setStatus(custDelStatusEl, "Bitte Bestätigung anhaken: „Customer wirklich löschen“.", "error");
        return;
      }

      if (!dryRun) {
        const ok = window.confirm(`Customer wirklich löschen?\n\nID: ${customerId}\n\nDas kann nicht rückgängig gemacht werden.`);
        if (!ok) return;
      }

      const body = {
        ...(dryRun ? { dry_run: true } : { confirm_delete: true }),
        delete_documents: delDocs,
        delete_interactions: delInts,
      };

      setStatus(custDelStatusEl, dryRun ? "Dry-Run … (Counts)" : "Lösche Customer …", "info");
      disableForm(custDelForm, true);

      try {
        const res = await deleteJSONWithAdmin(ADMIN_CUSTOMER_URL(customerId), body);
        if (res._noFetch) {
          setStatus(custDelStatusEl, "Kein Admin-Token gesetzt.", "error");
          return;
        }

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setStatus(custDelStatusEl, data?.error || `Fehler (${res.status}) beim Customer-Delete.`, "error");
          return;
        }

        if (dryRun) {
          const w = data?.would_delete || {};
          setStatus(
            custDelStatusEl,
            `Dry-Run: würde löschen – documents: ${w.documents ?? 0}, interactions: ${w.interactions ?? 0}, customer_row: ${w.customer_row ?? 1}`,
            "success"
          );
          return;
        }

        const d = data?.deleted || {};
        setStatus(
          custDelStatusEl,
          `Gelöscht – documents: ${d.documents ?? 0}, interactions: ${d.interactions ?? 0}, customer_row: ${d.customer_row ?? 1}`,
          "success"
        );

        await loadCustomersList({ keepSelection: false });
        refreshAllExtraPickers();
        refreshStatsPicker({ keepSelection: true });
        refreshAnswersPicker({ keepSelection: true });
        refreshWidgetPicker({ keepSelection: true });

        const idEl = document.getElementById("purge_customer_id");
        if (idEl) idEl.value = "";
        const sel = document.getElementById("pick_purge_select");
        if (sel) sel.value = "";

        const confirmEl = document.getElementById("custdel_confirm");
        if (confirmEl) confirmEl.checked = false;

        // NEW: widget snippet UI leeren
        setWidgetSnippetPreview("");
      } catch {
        setStatus(custDelStatusEl, "Keine Verbindung zum Backend (läuft es?).", "error");
      } finally {
        disableForm(custDelForm, false);
      }
    };

    if (btnDry) btnDry.addEventListener("click", () => runCustomerDelete({ dryRun: true }));
    if (btnGo)  btnGo .addEventListener("click", () => runCustomerDelete({ dryRun: false }));
  }

  // M3: keep custdel_customer_id in sync with purge_customer_id so the delete target is always visible
  const purgeIdEl = document.getElementById("purge_customer_id");
  const custDelIdEl = document.getElementById("custdel_customer_id");
  if (purgeIdEl && custDelIdEl) {
    const syncCustDelId = () => { custDelIdEl.value = purgeIdEl.value; };
    purgeIdEl.addEventListener("input", syncCustDelId);
    purgeIdEl.addEventListener("change", syncCustDelId);
    syncCustDelId();
  }

  // Widget panel wiring
  wireWidgetCustomizer();
});