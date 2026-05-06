import { buildQuery, onlyPlaylistResults } from "./spotify.js";

const placeholders = [
  "Kanye",
  "Jamie XX",
  "Deki Alem",
  "Favourite",
  "CASisDEAD",
  "Capricorn",
  "Starburster",
  "Eusexua",
];

const form = document.querySelector("#search-form");
const termGrid = document.querySelector("[data-terms]");
const resultsSection = document.querySelector("#results");
const emptyState = document.querySelector("#empty-state");
const emptyStateMessage = emptyState?.querySelector("p");
const resultsGrid = document.querySelector("[data-results]");
const summaryEl = document.querySelector("[data-summary]");
const resultTemplate = document.querySelector("#result-template");
const settingsContainer = document.querySelector("[data-settings]");
const settingsToggle = document.querySelector("[data-settings-toggle]");
const settingsMenu = document.querySelector("[data-settings-menu]");
const excludeRadioInput = document.querySelector('[data-setting="exclude-radio"]');
const submitButton = form?.querySelector('button[type="submit"]');
const RESULT_LIMIT = 10;
const API_BASE = (document.body?.dataset.apiBase || "/api").replace(/\/$/, "");

const settings = {
  excludeRadio: false,
};

let lastResults = [];
let lastQuery = "";
let lastTotal = 0;
let menuOpen = false;
let activeSearchId = 0;

function renderInputs() {
  placeholders.forEach((placeholder, index) => {
    const input = document.createElement("input");
    input.type = "text";
    input.name = `term_${index + 1}`;
    input.placeholder = placeholder;
    input.maxLength = 80;
    input.autocomplete = "off";
    input.setAttribute("aria-label", `Search term ${index + 1}`);
    termGrid.appendChild(input);
  });
}

function setSearchPending(isPending) {
  form?.setAttribute("aria-busy", String(isPending));
  if (!submitButton) return;
  submitButton.disabled = isPending;
  submitButton.textContent = isPending ? "Searching" : "Search";
}

function showEmptyState(message) {
  if (!emptyState || !emptyStateMessage) return;
  emptyState.hidden = false;
  emptyStateMessage.textContent = message;
  if (resultsSection) {
    resultsSection.hidden = true;
  }
}

function applyFilters(results = []) {
  let filtered = Array.isArray(results) ? results.slice() : [];
  if (settings.excludeRadio) {
    filtered = filtered.filter((item) => {
      const title = (item?.title || "").toLowerCase();
      return !title.includes("radio");
    });
  }
  return filtered;
}

function refreshResultsView() {
  if (!lastResults.length) {
    if (!lastQuery) return;
    showEmptyState("No playlists found right now.");
    return;
  }

  const filtered = applyFilters(lastResults);
  if (!filtered.length) {
    showEmptyState("No playlists match the current filters.");
    return;
  }

  if (emptyState) {
    emptyState.hidden = true;
  }
  renderResults(filtered, lastQuery, settings.excludeRadio ? filtered.length : lastTotal);
}

async function handleSubmit(ev) {
  ev.preventDefault();
  const terms = Array.from(termGrid.querySelectorAll("input"))
    .map((input) => input.value.trim())
    .filter(Boolean);

  if (!terms.length) {
    showEmptyState("Please enter at least one term.");
    return;
  }

  if (emptyState) {
    emptyState.hidden = true;
  }
  if (resultsSection) {
    resultsSection.hidden = true;
  }

  const query = buildQuery(terms);
  const searchId = activeSearchId + 1;
  activeSearchId = searchId;
  setSearchPending(true);

  try {
    const { results, total } = await fetchPlaylists(query);
    if (searchId !== activeSearchId) return;

    lastResults = Array.isArray(results) ? results : [];
    lastQuery = query;
    lastTotal = Number.isFinite(total) ? total : lastResults.length;

    if (!lastResults.length) {
      showEmptyState("No playlists found right now.");
      return;
    }

    const filtered = applyFilters(lastResults);
    if (!filtered.length) {
      showEmptyState("No playlists match the current filters.");
      return;
    }

    if (emptyState) {
      emptyState.hidden = true;
    }

    renderResults(filtered, query, settings.excludeRadio ? filtered.length : lastTotal);
  } catch (error) {
    if (searchId !== activeSearchId) return;
    console.error(error);
    lastResults = [];
    lastQuery = query;
    lastTotal = 0;
    showEmptyState(error?.message || "Unable to fetch playlists right now.");
  } finally {
    if (searchId === activeSearchId) {
      setSearchPending(false);
    }
  }
}

async function fetchPlaylists(query) {
  const params = new URLSearchParams({ q: query, limit: String(RESULT_LIMIT) });
  const endpoint = `${API_BASE}/playlists?${params.toString()}`;
  const res = await fetch(endpoint, { headers: { Accept: "application/json" } });

  const json = await parseJsonResponse(res);
  if (!res.ok) throw new Error(json?.error || `Request failed: ${res.status}`);
  if (json?.error) throw new Error(json.error);

  const payload = Array.isArray(json?.results) ? json.results : Array.isArray(json) ? json : [];
  const normalised = onlyPlaylistResults(payload);
  const total = Number.isFinite(json?.total) ? json.total : normalised.length;
  return { results: normalised.slice(0, RESULT_LIMIT), total };
}

async function parseJsonResponse(res) {
  try {
    return await res.json();
  } catch (error) {
    return {};
  }
}

function renderResults(results, query, totalAvailable) {
  resultsGrid.innerHTML = "";
  results.forEach((item) => {
    const { title, url, snippet } = item;
    const node = resultTemplate.content.cloneNode(true);
    const anchor = node.querySelector(".result__link");
    const snippetEl = node.querySelector(".result__snippet");

    anchor.href = url;
    anchor.textContent = title || "Open playlist";
    snippetEl.textContent = snippet || "Spotify playlist";

    resultsGrid.appendChild(node);
  });

  const displayed = results.length;
  const total = totalAvailable ?? displayed;
  let summary;
  if (displayed >= RESULT_LIMIT) {
    summary = `Showing ${RESULT_LIMIT} results (max)`;
  } else if (total > displayed) {
    summary = `Showing ${displayed} of ${total} results`;
  } else {
    summary = `Showing ${displayed} result${displayed === 1 ? "" : "s"}`;
  }
  summaryEl.textContent = `${summary} for \`${query}\``;
  resultsSection.hidden = false;
}

if (excludeRadioInput) {
  excludeRadioInput.addEventListener("change", (event) => {
    const checked = Boolean(event.target?.checked);
    settings.excludeRadio = checked;
    if (lastResults.length || lastQuery) {
      refreshResultsView();
    }
  });
}

if (settingsToggle && settingsMenu && settingsContainer) {
  const setMenuOpen = (open) => {
    menuOpen = open;
    settingsToggle.setAttribute("aria-expanded", String(open));
    settingsMenu.hidden = !open;
  };

  setMenuOpen(false);

  settingsToggle.addEventListener("click", (event) => {
    event.preventDefault();
    setMenuOpen(!menuOpen);
  });

  document.addEventListener("click", (event) => {
    if (!menuOpen) return;
    if (!settingsContainer.contains(event.target)) {
      setMenuOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!menuOpen) return;
    if (event.key === "Escape") {
      setMenuOpen(false);
      settingsToggle.focus();
    }
  });
}

if (form && termGrid) {
  renderInputs();
  form.addEventListener("submit", handleSubmit);
}
