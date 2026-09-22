
// V6.2 — Admin player list editor
function addPlayerToTeam(teamId) {
    if (!isAdminMode()) return;
    const name = prompt("Prénom du joueur :");
    if (!name || !name.trim()) return;
    const team = state.teams.find(t => t.id === teamId);
    if (!team) return;
    team.players = Array.isArray(team.players) ? team.players : [];
    team.players.push({
        id: "p_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8),
        name: name.trim(),
        goals: 0
    });
    saveState();
    render();
}

function removePlayerFromTeam(teamId, playerId) {
    if (!isAdminMode()) return;
    const team = state.teams.find(t => t.id === teamId);
    if (!team || !Array.isArray(team.players)) return;
    team.players = team.players.filter(p => p.id !== playerId);
    saveState();
    render();
}

function editTeamPlayers(teamId) {
    if (!isAdminMode()) return;
    const team = state.teams.find(t => t.id === teamId);
    if (!team) return;
    const players = Array.isArray(team.players) ? team.players : [];
    const lines = players.length
        ? players.map((p, i) => `${i + 1}. ${p.name}`).join("\n")
        : "(aucun joueur)";
    alert(`Joueurs de ${team.name}:\n\n${lines}\n\nUtilise les boutons Ajouter/Supprimer dans la configuration de l'équipe.`);
}

(() => {
  "use strict";

  const STORAGE_KEY = "sundayFootballTournamentV1";
  const $ = (id) => document.getElementById(id);

  const els = {
    setupScreen: $("setupScreen"),
    gameScreen: $("gameScreen"),
    teamCount: $("teamCount"),
    addTeamBtn: $("addTeamBtn"),
    removeTeamBtn: $("removeTeamBtn"),
    matchMinutes: $("matchMinutes"),
    teamForm: $("teamForm"),
    startTournamentBtn: $("startTournamentBtn"),
    newTournamentBtn: $("newTournamentBtn"),
    openRegistrationAdminBtn: $("openRegistrationAdminBtn"),
    manageTeamsBtn: $("manageTeamsBtn"),
    drawPlayersBtn: $("drawPlayersBtn"),
    registrationAdminScreen: $("registrationAdminScreen"),
    registrationAdminContent: $("registrationAdminContent"),
    registrationScreen: $("registrationScreen"),
    registrationStatus: $("registrationStatus"),
    registrationFormBox: $("registrationFormBox"),
    registrationClosedBox: $("registrationClosedBox"),
    registrationName: $("registrationName"),
    registerPlayerBtn: $("registerPlayerBtn"),
    registrationCount: $("registrationCount"),
    publicRegistrationList: $("publicRegistrationList"),
    manageTeamsPanel: $("manageTeamsPanel"),
    manageTeamsContent: $("manageTeamsContent"),
    closeManageTeamsBtn: $("closeManageTeamsBtn"),
    saveTeamPlayersBtn: $("saveTeamPlayersBtn"),
    saveStatus: $("saveStatus"),
    resumeBanner: $("resumeBanner"),
    resumeText: $("resumeText"),
    continueBtn: $("continueBtn"),
    preMatchCard: $("preMatchCard"),
    activeMatchCard: $("activeMatchCard"),
    preTeamA: $("preTeamA"),
    preTeamB: $("preTeamB"),
    preMatchInfo: $("preMatchInfo"),
    startMatchBtn: $("startMatchBtn"),
    matchNumber: $("matchNumber"),
    timer: $("timer"),
    leaderPoints: $("leaderPoints"),
    teamAName: $("teamAName"),
    teamBName: $("teamBName"),
    scoreA: $("scoreA"),
    scoreB: $("scoreB"),
    goalABtn: $("goalABtn"),
    goalBBtn: $("goalBBtn"),
    winABtn: $("winABtn"),
    winBBtn: $("winBBtn"),
    drawBtn: $("drawBtn"),
    queueList: $("queueList"),
    rankingList: $("rankingList"),
    historyList: $("historyList"),
    exportBtn: $("exportBtn"),
    importInput: $("importInput"),
    finalScreen: $("finalScreen"),
    finalContent: $("finalContent"),
    dashboardScreen: $("dashboardScreen"),
    dashboardContent: $("dashboardContent"),
    appTopbar: $("appTopbar"),
    dashboardPage: $("dashboardPage"),
    dashboardRegistrationBtn: $("dashboardRegistrationBtn"),
    dashboardNewTournamentBtn: $("dashboardNewTournamentBtn"),
    dashboardTeamsBtn: $("dashboardTeamsBtn"),
    dashboardCurrentTournamentBtn: $("dashboardCurrentTournamentBtn"),
    dashboardTournamentInfo: $("dashboardTournamentInfo"),
    homeDashboardBtn: $("homeDashboardBtn"),
    toast: $("toast")
  };

  let state = null;
  let timerId = null;

  const defaultNames = ["Rouge", "Vert", "Jaune", "Bleu", "Orange", "Violet", "Noir", "Blanc"];
  const defaultColors = ["#ef4444", "#22c55e", "#eab308", "#3b82f6", "#f97316", "#a855f7", "#111827", "#f8fafc"];
  const teamColorChoices = [
    ["#ef4444", "Rouge"], ["#22c55e", "Vert"], ["#eab308", "Jaune"], ["#3b82f6", "Bleu"],
    ["#f97316", "Orange"], ["#a855f7", "Violet"], ["#111827", "Noir"], ["#f8fafc", "Blanc"]
  ];
  function teamColorOptions(selected) {
    const safe = teamColorChoices.some(([value]) => value === selected) ? selected : defaultColors[0];
    return teamColorChoices.map(([value, label]) => `<option value="${value}" ${value === safe ? "selected" : ""}>${label}</option>`).join("");
  }
  function getTeamColor(team, index = 0) {
    const color = team?.color;
    return teamColorChoices.some(([value]) => value === color) ? color : defaultColors[index % defaultColors.length];
  }
  function vibrate(pattern = [80]) {
    try {
      if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") navigator.vibrate(pattern);
    } catch {}
  }
  function showMatchAnnouncement(teamIds, label = "Entre") {
    const box = document.getElementById("matchAnnouncement");
    if (!box || !state?.teams) return;
    const ids = (Array.isArray(teamIds) ? teamIds : [teamIds]).filter(id => state.teams[id]);
    if (!ids.length) return;
    box.innerHTML = ids.map(id => {
      const team = state.teams[id];
      return `<div class="match-announcement-line"><span>⚽</span><strong style="color:${getTeamColor(team, id)}">Équipe « ${escapeHtml(team.name)} » ${label}</strong></div>`;
    }).join("");
    box.classList.remove("hidden");
    clearTimeout(showMatchAnnouncement.timeout);
    showMatchAnnouncement.timeout = setTimeout(() => box.classList.add("hidden"), 5000);
  }
  function migrateTeamColors() {
    if (!state?.teams) return;
    state.teams.forEach((team, index) => {
      if (!team.color || !teamColorChoices.some(([value]) => value === team.color)) team.color = defaultColors[index % defaultColors.length];
    });
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function showToast(message) {
    els.toast.textContent = message;
    els.toast.classList.add("show");
    clearTimeout(showToast.timeout);
    showToast.timeout = setTimeout(() => els.toast.classList.remove("show"), 2200);
  }

  function formatTime(seconds) {
    const safe = Math.max(0, Math.floor(Number(seconds) || 0));
    return String(Math.floor(safe / 60)).padStart(2, "0") + ":" + String(safe % 60).padStart(2, "0");
  }

  function getSetupDraft() {
    const draft = [];
    if (!els.teamForm) return draft;
    els.teamForm.querySelectorAll(".team-entry").forEach((entry, index) => {
      const get = (field) => entry.querySelector(`[data-field="${field}"]`)?.value || "";
      draft[index] = { name: get("name"), color: get("color"), captain: get("captain"), players: get("players") };
    });
    return draft;
  }

  
// V6.2 — timer pause/resume support
function pauseMatchTimer() {
    if (accessMode !== "admin") { showToast("🔒 Action réservée à l’administrateur."); return; }
    if (!state || !state.active || !state.matchStarted || state.timerPaused) return;
    state.timerPaused = true;
    stopTimer();
    saveState();
    renderGame();
}

function resumeMatchTimer() {
    if (accessMode !== "admin") { showToast("🔒 Action réservée à l’administrateur."); return; }
    if (!state || !state.active || !state.matchStarted || !state.timerPaused) return;
    state.timerPaused = false;
    saveState();
    startTimer();
    renderGame();
}

function renderTeamForm(draft = null) {
    const count = Math.max(2, Math.min(4, Number(els.teamCount.value) || 4));
    els.teamCount.value = String(count);
    const previous = draft || getSetupDraft();
    els.teamForm.innerHTML = "";
    for (let i = 0; i < count; i++) {
      const saved = previous[i] || {};
      const entry = document.createElement("div");
      entry.className = "team-entry";
      entry.innerHTML = `
        <div class="team-entry-head">
          <h3>Équipe ${i + 1}</h3>
          ${count > 2 ? `<button type="button" class="remove-team-inline" data-remove-team="${i}" aria-label="Supprimer cette équipe">✕</button>` : ""}
        </div>
        <div class="grid">
          <label>Nom
            <input data-field="name" data-index="${i}" value="${escapeHtml(saved.name || defaultNames[i] || "Équipe " + (i + 1))}" maxlength="40">
          </label>
          <label>Couleur
            <select data-field="color" data-index="${i}">
              ${teamColorOptions(saved.color || defaultColors[i] || defaultColors[0])}
            </select>
          </label>
          <label>Capitaine
            <input data-field="captain" data-index="${i}" value="${escapeHtml(saved.captain || "")}" placeholder="Nom du capitaine" maxlength="60">
          </label>
          <label>Joueurs
            <input data-field="players" data-index="${i}" value="${escapeHtml(saved.players || "")}" placeholder="Ex. Ali, Yassine, Karim" maxlength="300">
          </label>
          <div class="player-editor" data-player-editor="${i}">
            <div class="player-editor-title">👥 Joueurs</div>
            <div class="player-editor-list" data-player-list="${i}"></div>
            <button type="button" class="secondary player-add-btn" data-add-player="${i}">＋ Ajouter un joueur</button>
          </div>
          <label>Image / logo
            <input data-field="image" data-index="${i}" type="file" accept="image/*">
          </label>
        </div>
      `;
      els.teamForm.appendChild(entry);
      renderSetupPlayerEditor(entry, i);
    }

    els.teamForm.querySelectorAll("[data-remove-team]").forEach(btn => {
      btn.addEventListener("click", () => {
        const index = Number(btn.dataset.removeTeam);
        const current = getSetupDraft();
        current.splice(index, 1);
        els.teamCount.value = String(Math.max(3, Number(els.teamCount.value) - 1));
        renderTeamForm(current);
      });
    });
  }

  function setupPlayerNames(entry) {
    const input = entry?.querySelector('[data-field="players"]');
    if (!input) return [];
    return input.value.split(",").map(v => v.trim()).filter(Boolean);
  }

  function renderSetupPlayerEditor(entry, index) {
    const list = entry?.querySelector(`[data-player-list="${index}"]`);
    if (!list) return;
    const names = setupPlayerNames(entry);
    list.innerHTML = names.length
      ? names.map((name, pIndex) => `<span class="player-chip">${escapeHtml(name)}<button type="button" class="player-remove-btn" data-remove-player="${index}" data-player-index="${pIndex}">×</button></span>`).join("")
      : `<span class="muted small">Aucun joueur</span>`;
    els.teamForm.querySelectorAll("[data-add-player]").forEach(btn => {
      btn.addEventListener("click", () => {
        const entry = btn.closest(".team-entry");
        const input = entry?.querySelector('[data-field="players"]');
        if (!input) return;
        const name = prompt("Prénom du joueur :");
        if (!name || !name.trim()) return;
        const names = setupPlayerNames(entry);
        names.push(name.trim());
        input.value = names.join(", ");
        renderSetupPlayerEditor(entry, Number(input.dataset.index));
      });
    });

    els.teamForm.querySelectorAll("[data-remove-player]").forEach(btn => {
      btn.addEventListener("click", () => {
        const entry = btn.closest(".team-entry");
        const input = entry?.querySelector('[data-field="players"]');
        if (!input) return;
        const names = setupPlayerNames(entry);
        const pIndex = Number(btn.dataset.playerIndex);
        if (pIndex >= 0 && pIndex < names.length) names.splice(pIndex, 1);
        input.value = names.join(", ");
        renderSetupPlayerEditor(entry, Number(input.dataset.index));
      });
    });

  }

  function addSetupTeam() {
    if (accessMode !== "admin") { showToast("🔒 Action réservée à l’administrateur."); return; }
    if (Number(els.teamCount.value) >= 4) {
      showToast("Maximum 4 équipes.");
      return;
    }
    const draft = getSetupDraft();
    els.teamCount.value = String(Number(els.teamCount.value) + 1);
    renderTeamForm(draft);
  }

  function removeSetupTeam() {
    if (accessMode !== "admin") { showToast("🔒 Action réservée à l’administrateur."); return; }
    if (Number(els.teamCount.value) <= 2) {
      showToast("Minimum 2 équipes.");
      return;
    }
    const draft = getSetupDraft();
    draft.pop();
    els.teamCount.value = String(Number(els.teamCount.value) - 1);
    renderTeamForm(draft);
  }

  function createEmptyState(teams, minutes) {
    return {
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      settings: { matchMinutes: minutes },
      teams,
      queue: [],
      active: null,
      matchNumber: 0,
      scoreA: 0,
      scoreB: 0,
      scorersA: [],
      scorersB: [],
      secondsLeft: minutes * 60,
      history: [],
      finals: null,
      matchStarted: false,
      timerPaused: false,
      phase: "league",
      phaseMatch: null,
      phaseMatchStarted: false,
      phaseSecondsLeft: 0,
      phaseTimerId: null,
      semifinalResults: [],
      finalResult: null,
      tournamentWinnerId: null,
      registrationOpen: false
    };
  }

  const SF_TABLE = "tournaments";
  const SF_ROW_ID = "current";
  const REG_SETTINGS_TABLE = "registration_settings";
  const REG_TABLE = "player_registrations";
  const REG_ROW_ID = "current";
  let supabaseClient = null;
  let onlineSyncTimer = null;
  let realtimeChannel = null;
  let accessMode = null;
  let liveTimerId = null;

  function onlineConfigured() {
    return !!(window.SF_SUPABASE &&
      window.SF_SUPABASE.url &&
      window.SF_SUPABASE.anonKey &&
      !window.SF_SUPABASE.url.includes("PASTE_YOUR") &&
      !window.SF_SUPABASE.anonKey.includes("PASTE_YOUR"));
  }

  function initSupabase() {
    if (!onlineConfigured() || !window.supabase?.createClient) return null;
    try {
      supabaseClient = window.supabase.createClient(window.SF_SUPABASE.url, window.SF_SUPABASE.anonKey);
      return supabaseClient;
    } catch (error) {
      console.error("Supabase init error", error);
      return null;
    }
  }

  async function remoteRead() {
    if (!supabaseClient) return null;
    const { data, error } = await supabaseClient.from(SF_TABLE).select("state,updated_at").eq("id", SF_ROW_ID).maybeSingle();
    if (error) { console.error(error); return null; }
    return data?.state || null;
  }

  async function remoteWrite() {
    if (!supabaseClient || !state || accessMode !== "admin") return;
    const { data: sessionData } = await supabaseClient.auth.getSession();
    if (!sessionData?.session) return;
    const { error } = await supabaseClient.from(SF_TABLE).upsert({
      id: SF_ROW_ID,
      state: JSON.parse(JSON.stringify(state)),
      updated_at: new Date().toISOString()
    }, { onConflict: "id" });
    if (error) console.error("Supabase write error", error);
  }

  function scheduleRemoteWrite(immediate = false) {
    if (!supabaseClient || accessMode !== "admin" || !state) return;
    if (immediate) {
      clearTimeout(onlineSyncTimer);
      onlineSyncTimer = null;
      remoteWrite();
      return;
    }
    clearTimeout(onlineSyncTimer);
    onlineSyncTimer = setTimeout(() => { onlineSyncTimer = null; remoteWrite(); }, 1500);
  }

  async function remoteDelete() {
    if (!supabaseClient || accessMode !== "admin") return;
    const { error } = await supabaseClient.from(SF_TABLE).delete().eq("id", SF_ROW_ID);
    if (error) console.error("Supabase delete error", error);
  }

  async function readRegistrationSettings() {
    if (!supabaseClient) return { is_open: false };
    const { data, error } = await supabaseClient
      .from(REG_SETTINGS_TABLE)
      .select("id,is_open,updated_at")
      .eq("id", REG_ROW_ID)
      .maybeSingle();
    if (error) { console.error("Registration settings read error", error); return { is_open: false }; }
    return data || { is_open: false };
  }

  async function ensureAdminSession() {
    if (!supabaseClient) initSupabase();
    if (!supabaseClient) return false;
    const { data, error } = await supabaseClient.auth.getSession();
    if (error) { console.error("Admin session error", error); return false; }
    return !!data?.session;
  }

  async function writeRegistrationSettings(isOpen) {
    if (accessMode !== "admin") return false;
    if (!(await ensureAdminSession())) {
      showToast("🔐 Session administrateur expirée. Reconnecte-toi.");
      return false;
    }

    // Direct UPDATE protected by Supabase RLS. This avoids relying on a custom RPC
    // that may not yet exist in an older online/local database.
    const { error } = await supabaseClient
      .from(REG_SETTINGS_TABLE)
      .update({ is_open: !!isOpen, updated_at: new Date().toISOString() })
      .eq("id", REG_ROW_ID);

    if (!error) return true;

    // If the row does not exist, create it as a last resort.
    if (/no rows|0 rows|not found/i.test(String(error.message || ""))) {
      const { error: insertError } = await supabaseClient
        .from(REG_SETTINGS_TABLE)
        .insert({ id: REG_ROW_ID, is_open: !!isOpen, updated_at: new Date().toISOString() });
      if (!insertError) return true;
    }

    console.error("Registration settings write error", error);
    showToast(`Erreur Supabase: ${error.message || "modification impossible"}`);
    return false;
  }

  async function readRegistrations() {
    if (!supabaseClient) return [];
    const { data, error } = await supabaseClient
      .from(REG_TABLE)
      .select("id,name,created_at")
      .eq("event_id", REG_ROW_ID)
      .order("created_at", { ascending: true });
    if (error) { console.error("Registrations read error", error); return []; }
    return Array.isArray(data) ? data : [];
  }

  function registrationNames(rows) {
    return (rows || []).map(r => String(r?.name || "").trim()).filter(Boolean);
  }

  function renderRegistrationList(rows, target = els.publicRegistrationList) {
    if (!target) return;
    const list = Array.isArray(rows) ? rows : [];
    if (els.registrationCount) els.registrationCount.textContent = `${list.length} inscrit${list.length > 1 ? "s" : ""}`;
    if (!list.length) {
      target.innerHTML = `<div class="muted small">Aucun joueur inscrit pour le moment.</div>`;
      return;
    }
    target.innerHTML = list.map((r, i) => `
      <div class="registration-item">
        <span><strong>${i + 1}.</strong> ${escapeHtml(r.name)}</span>
        ${accessMode === "admin" ? `<button type="button" class="danger-small" data-delete-registration="${escapeHtml(r.id)}">✕</button>` : ""}
      </div>`).join("");

  }

  async function renderRegistrationAdmin() {
    if (accessMode !== "admin" || !els.registrationAdminContent) return;
    const settings = await readRegistrationSettings();
    const rows = await readRegistrations();
    const autoPlan = registrationTeamPlan(rows.length);
    const defaultTeams = autoPlan.valid ? autoPlan.teamCount : (rows.length >= 10 ? Math.min(4, Math.floor(rows.length / 5)) : 2);
    const defaultPlayers = autoPlan.valid ? Math.min(7, Math.max(5, Math.floor(rows.length / Math.max(1, autoPlan.teamCount)))) : 5;
    els.registrationAdminContent.innerHTML = `
      <div class="registration-admin-card registration-admin-page-card">
        <div class="registration-admin-head">
          <div>
            <strong>📝 Gestion des inscriptions</strong>
            <p class="muted small">Maximum 4 équipes · 5 à 7 joueurs par équipe · maximum 28 inscrits.</p>
          </div>
          <span class="registration-status ${settings.is_open ? "open" : "closed"}">${settings.is_open ? "🟢 Ouvertes" : "🔴 Fermées"}</span>
        </div>

        <div class="registration-admin-actions registration-admin-actions-main">
          <button id="toggleRegistrationBtn" class="${settings.is_open ? "secondary" : "primary"}">${settings.is_open ? "🔒 Fermer les inscriptions" : "📝 Ouvrir les inscriptions"}</button>
          <button id="clearRegistrationsBtn" class="secondary">🧹 Vider la liste</button>
        </div>

        <div class="registration-plan-box">
          <div class="section-title">⚙️ Organisation des équipes</div>
          <div class="grid two">
            <label>Nombre d'équipes
              <select id="registrationTeamCount">
                <option value="2" ${defaultTeams===2?'selected':''}>2 équipes</option>
                <option value="3" ${defaultTeams===3?'selected':''}>3 équipes</option>
                <option value="4" ${defaultTeams===4?'selected':''}>4 équipes</option>
              </select>
            </label>
            <label>Joueurs par équipe
              <select id="registrationPlayersPerTeam">
                <option value="5" ${defaultPlayers===5?'selected':''}>5 joueurs</option>
                <option value="6" ${defaultPlayers===6?'selected':''}>6 joueurs</option>
                <option value="7" ${defaultPlayers===7?'selected':''}>7 joueurs</option>
              </select>
            </label>
          </div>
          <p id="registrationPlanInfo" class="muted small"></p>
          <button id="applyRegistrationPlanBtn" class="secondary full">👥 Utiliser cette configuration</button>
        </div>

        <div class="section-title registration-list-title">👥 Joueurs inscrits <span class="badges">${rows.length}/28</span></div>
        <div id="adminRegistrationList"></div>
        <p class="muted small">La liste se ferme automatiquement à 28 inscrits.</p>
      </div>`;

    const listTarget = document.getElementById("adminRegistrationList");
    renderRegistrationList(rows, listTarget);

    const updatePlanInfo = () => {
      const { teamCount, playersPerTeam } = getRegistrationPlan();
      const min = teamCount * 5, max = teamCount * 7;
      const info = document.getElementById("registrationPlanInfo");
      if (!info) return;
      const err = validateRegistrationPlan(rows.length, teamCount, playersPerTeam);
      info.textContent = err ? `⚠️ ${err}` : `✓ ${rows.length} inscrits : ${teamCount} équipes de ${playersPerTeam} joueurs (capacité ${min}–${max}).`;
    };
    document.getElementById("registrationTeamCount")?.addEventListener("change", updatePlanInfo);
    document.getElementById("registrationPlayersPerTeam")?.addEventListener("change", updatePlanInfo);
    updatePlanInfo();

    document.getElementById("applyRegistrationPlanBtn")?.addEventListener("click", applyRegistrationTeamPlan);
    document.getElementById("createTeamsFromRegistrationsBtn")?.addEventListener("click", () => {
      if (accessMode !== "admin") return;
      closeRegistrationAdmin();
      showSetup();
      renderTeamForm();
      showToast("⚽ Page de création des équipes ouverte.");
    });
    document.getElementById("toggleRegistrationBtn")?.addEventListener("click", async () => {
      const next = !settings.is_open;
      if (next && rows.length >= 28) { showToast("La liste est complète (28 joueurs maximum)."); return; }
      const ok = await writeRegistrationSettings(next);
      if (!ok) return;
      await renderRegistrationAdmin();
      showToast(next ? "📝 Inscriptions ouvertes aux visiteurs." : "🔒 Inscriptions fermées.");
    });
    document.getElementById("clearRegistrationsBtn")?.addEventListener("click", async () => {
      if (!rows.length) { showToast("La liste est déjà vide."); return; }
      if (!confirm(`Supprimer les ${rows.length} inscriptions ?`)) return;
      if (!(await ensureAdminSession())) { showToast("🔐 Session administrateur expirée. Reconnecte-toi."); return; }
      let result = await supabaseClient.from(REG_TABLE).delete().eq("event_id", REG_ROW_ID);
      if (!result.error) {
        const settingsResult = await supabaseClient
          .from(REG_SETTINGS_TABLE)
          .update({ is_open: false, updated_at: new Date().toISOString() })
          .eq("id", REG_ROW_ID);
        if (settingsResult.error) result = settingsResult;
      }
      if (result.error) {
        console.error(result.error);
        showToast(`Erreur Supabase: ${result.error.message || "impossible de vider la liste"}`);
        return;
      }
      await renderRegistrationAdmin();
      showToast("✓ Liste des inscrits vidée.");
    });

    els.registrationAdminContent.querySelectorAll("[data-delete-registration]").forEach(btn => {
      btn.addEventListener("click", async () => {
        if (!(await ensureAdminSession())) { showToast("🔐 Session administrateur expirée. Reconnecte-toi."); return; }
        const id = btn.dataset.deleteRegistration;
        let result = await supabaseClient
          .from(REG_TABLE)
          .delete()
          .eq("id", id)
          .eq("event_id", REG_ROW_ID);
        if (result.error) {
          console.error(result.error);
          showToast(`Erreur Supabase: ${result.error.message || "impossible de supprimer le joueur"}`);
          return;
        }
        await renderRegistrationAdmin();
        showToast("Joueur supprimé de la liste.");
      });
    });
  }

  async function openRegistrationAdmin() {
    if (accessMode !== "admin") { showToast("🔒 Gestion réservée à l’administrateur."); return; }
    hideAllMainPages();
    els.appTopbar?.classList.remove("hidden");
    els.registrationAdminScreen?.classList.remove("hidden");
    await renderRegistrationAdmin();
    subscribeRegistrationRealtime();
  }

  function closeRegistrationAdmin() {
    if (accessMode === "admin") showDashboard();
    else showAccess();
  }

  async function enterRegistrationMode() {
    accessMode = "registration";
    stopTimer();
    if (liveTimerId) { clearInterval(liveTimerId); liveTimerId = null; }
    document.getElementById("accessScreen")?.classList.add("hidden");
    document.getElementById("adminLoginBox")?.classList.add("hidden");
    els.setupScreen.classList.add("hidden");
    els.gameScreen.classList.add("hidden");
    document.getElementById("liveScreen")?.classList.add("hidden");
    els.registrationScreen?.classList.remove("hidden");
    if (!supabaseClient) initSupabase();
    const settings = await readRegistrationSettings();
    const open = !!settings.is_open;
    els.registrationStatus.textContent = open
      ? "🟢 Les inscriptions sont ouvertes. Inscris-toi pour dimanche."
      : "🔴 Les inscriptions sont fermées pour le moment.";
    els.registrationFormBox?.classList.toggle("hidden", !open);
    els.registrationClosedBox?.classList.toggle("hidden", open);
    const rows = open ? await readRegistrations() : [];
    renderRegistrationList(rows);
    subscribeRegistrationRealtime();
  }

  async function submitRegistration() {
    const name = String(els.registrationName?.value || "").trim().replace(/\s+/g, " ");
    if (!name) { showToast("Entre ton nom ou prénom."); return; }
    if (name.length < 2) { showToast("Le nom est trop court."); return; }
    if (!supabaseClient) initSupabase();
    const settings = await readRegistrationSettings();
    if (!settings.is_open) {
      showToast("Les inscriptions sont fermées.");
      await enterRegistrationMode();
      return;
    }
    const rows = await readRegistrations();
    if (rows.length >= 28) {
      await writeRegistrationSettings(false);
      showToast("La liste est complète : 28 joueurs maximum.");
      await enterRegistrationMode();
      return;
    }
    const exists = rows.some(r => String(r.name || "").trim().toLocaleLowerCase() === name.toLocaleLowerCase());
    if (exists) { showToast("Ce nom est déjà inscrit."); return; }
    const { error } = await supabaseClient.from(REG_TABLE).insert({ event_id: REG_ROW_ID, name });
    if (error) { console.error(error); showToast("Impossible de valider l'inscription."); return; }
    els.registrationName.value = "";
    await enterRegistrationMode();
    showToast("✓ Inscription enregistrée.");
  }

  function registrationTeamPlan(count) {
    const n = Number(count) || 0;
    if (n < 10) return { valid: false, message: "Il faut au moins 10 joueurs pour créer une équipe de 2 équipes (minimum 5 par équipe)." };
    const teamCount = Math.min(4, Math.floor(n / 5));
    if (teamCount < 2) return { valid: false, message: "Minimum 2 équipes et 5 joueurs par équipe." };
    const base = Math.floor(n / teamCount);
    const extra = n % teamCount;
    if (base > 7) return { valid: false, message: "Maximum 7 joueurs par équipe." };
    const sizes = Array.from({ length: teamCount }, (_, i) => base + (i < extra ? 1 : 0));
    return { valid: sizes.every(v => v >= 5 && v <= 7), teamCount, sizes };
  }

  function getRegistrationPlan() {
    const teamCount = Number(document.getElementById("registrationTeamCount")?.value || 0);
    const playersPerTeam = Number(document.getElementById("registrationPlayersPerTeam")?.value || 0);
    return { teamCount, playersPerTeam };
  }

  function validateRegistrationPlan(total, teamCount, playersPerTeam) {
    if (![2,3,4].includes(teamCount)) return "Choisis entre 2 et 4 équipes.";
    if (![5,6,7].includes(playersPerTeam)) return "Choisis entre 5 et 7 joueurs par équipe.";
    const min = teamCount * 5;
    const max = teamCount * 7;
    if (total < min) return `Il faut au moins ${min} joueurs pour ${teamCount} équipes.`;
    if (total > max) return `Il y a trop de joueurs pour ${teamCount} équipes : maximum ${max}.`;
    return "";
  }

  async function drawRegisteredPlayers() {
    if (accessMode !== "admin" || !state) { showToast("🔒 Action réservée à l’administrateur."); return; }
    if (state.history?.length || state.matchStarted || state.matchNumber > 1) {
      showToast("Le tirage est disponible avant le début du premier match.");
      return;
    }
    const rows = await readRegistrations();
    const names = registrationNames(rows);
    if (!names.length) { showToast("Aucun joueur inscrit."); return; }
    const plan = getRegistrationPlan();
    const planError = validateRegistrationPlan(names.length, plan.teamCount, plan.playersPerTeam);
    if (planError) { showToast(planError); return; }
    if (!state.teams?.length || state.teams.length !== plan.teamCount) {
      showToast(`Le tournoi doit avoir ${plan.teamCount} équipes. Crée/reconfigure le tournoi avant le tirage.`);
      return;
    }
    if (!confirm(`Répartir aléatoirement ${names.length} joueurs dans ${plan.teamCount} équipes ?\n\nRépartition cible : ${plan.playersPerTeam} joueurs/équipe (avec équilibrage si nécessaire).`)) return;

    const shuffled = shuffleArray([...names]);
    state.teams.forEach(team => { team.players = []; });
    shuffled.forEach((name, index) => {
      const teamIndex = index % plan.teamCount;
      state.teams[teamIndex].players.push(name);
    });
    saveState();
    renderGame();
    renderManageTeams();
    showToast(`🎲 Tirage terminé : ${names.length} joueurs répartis en ${plan.teamCount} équipes.`);
  }

  async function applyRegistrationTeamPlan() {
    if (accessMode !== "admin") return;
    const rows = await readRegistrations();
    const total = rows.length;
    const { teamCount, playersPerTeam } = getRegistrationPlan();
    const error = validateRegistrationPlan(total, teamCount, playersPerTeam);
    if (error) { showToast(error); return; }
    if (state?.history?.length || state?.matchStarted || state?.matchNumber > 1) {
      showToast("La configuration des équipes se fait avant le premier match.");
      return;
    }
    if (!state || !Array.isArray(state.teams)) {
      showToast("Crée d'abord un tournoi avec le nombre d'équipes choisi.");
      return;
    }
    if (state.teams.length !== teamCount) {
      showToast(`Le tournoi actuel contient ${state.teams.length} équipes. Il faut ${teamCount}.`);
      return;
    }
    showToast(`✓ Configuration validée : ${teamCount} équipes, ${playersPerTeam} joueurs/équipe.`);
  }

  function subscribeRegistrationRealtime() {
    if (!supabaseClient || window._sfRegistrationChannel) return;
    window._sfRegistrationChannel = supabaseClient.channel("sunday-football-registrations")
      .on("postgres_changes", { event: "*", schema: "public", table: REG_TABLE, filter: "event_id=eq.current" }, async () => {
        if (accessMode === "registration") await enterRegistrationMode();
        if (accessMode === "admin" && !els.registrationAdminScreen?.classList.contains("hidden")) await renderRegistrationAdmin();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: REG_SETTINGS_TABLE, filter: "id=eq.current" }, async () => {
        if (accessMode === "registration") await enterRegistrationMode();
        if (accessMode === "admin" && !els.registrationAdminScreen?.classList.contains("hidden")) await renderRegistrationAdmin();
      })
      .subscribe();
  }

  function subscribeRealtime() {
    if (!supabaseClient || realtimeChannel) return;
    realtimeChannel = supabaseClient.channel("sunday-football-live")
      .on("postgres_changes", { event: "*", schema: "public", table: SF_TABLE, filter: "id=eq.current" }, payload => {
        if (accessMode !== "live") return;
        const incoming = payload.new?.state;
        if (!incoming) return;
        state = incoming;
        renderLive();
      })
      .subscribe(status => {
        const el = document.getElementById("liveConnection");
        if (el) el.textContent = status === "SUBSCRIBED" ? "🟢 En direct" : "Connexion live : " + status;
      });
  }

  function showAccess() {
    stopTimer();
    if (liveTimerId) { clearInterval(liveTimerId); liveTimerId = null; }
    document.getElementById("accessScreen")?.classList.remove("hidden");
    els.appTopbar?.classList.add("hidden");
    els.setupScreen.classList.add("hidden");
    els.gameScreen.classList.add("hidden");
    document.getElementById("liveScreen")?.classList.add("hidden");
    document.getElementById("registrationScreen")?.classList.add("hidden");
    els.registrationAdminScreen?.classList.add("hidden");
    document.getElementById("adminLoginBox")?.classList.add("hidden");
  }

  function renderLive() {
    const root = document.getElementById("liveContent");
    if (!root) return;
    if (!state || !Array.isArray(state.teams)) {
      root.innerHTML = `<div class="card"><h3>Aucun tournoi en cours</h3><p class="muted">L'administrateur n'a pas encore démarré le tournoi.</p></div>`;
      return;
    }
    const team = id => state.teams[id];
    let matchHtml = `<div class="card live-card"><span class="live-status">${state.phase === "league" ? "PHASE DE CLASSEMENT" : state.phase === "complete" ? "TOURNOI TERMINÉ" : "PHASE FINALE"}</span>`;
    if (state.phaseMatch && state.phase !== "league" && state.phase !== "complete") {
      const m=state.phaseMatch, a=team(m.a), b=team(m.b);
      const phaseName=state.phase === "playoff" ? "MATCH ÉLIMINATOIRE" : state.phase === "semifinal" ? "DEMI-FINALE" : "FINALE";
      matchHtml += `<div class="live-team-head"><div class="muted small">${phaseName}</div></div><div class="live-time" id="liveTimer">${formatTime(state.phaseSecondsLeft)}</div><div class="live-score"><div class="live-team"><strong style="color:${getTeamColor(a, m.a)}">${escapeHtml(a?.name || "—")}</strong><div class="score">${m.scoreA}</div><div class="live-scorers">⚽ ${scorerSummary(m.scorersA)}</div></div><div>VS</div><div class="live-team"><strong style="color:${getTeamColor(b, m.b)}">${escapeHtml(b?.name || "—")}</strong><div class="score">${m.scoreB}</div><div class="live-scorers">⚽ ${scorerSummary(m.scorersB)}</div></div></div><p class="muted">${state.phaseMatchStarted ? "🟢 Match en cours" : "⏸️ Match préparé — en attente du démarrage"}</p>`;
    } else if (state.active) {
      const a=team(state.active.a), b=team(state.active.b);
      matchHtml += `<div class="live-team-head"><div class="muted small">MATCH #${state.matchNumber}</div></div><div class="live-time" id="liveTimer">${formatTime(state.secondsLeft)}</div><div class="live-score"><div class="live-team"><strong style="color:${getTeamColor(a, state.active.a)}">${escapeHtml(a?.name || "—")}</strong><div class="score">${state.scoreA}</div><div class="live-scorers">⚽ ${scorerSummary(state.scorersA)}</div></div><div>VS</div><div class="live-team"><strong style="color:${getTeamColor(b, state.active.b)}">${escapeHtml(b?.name || "—")}</strong><div class="score">${state.scoreB}</div><div class="live-scorers">⚽ ${scorerSummary(state.scorersB)}</div></div></div>`;
      matchHtml += `<p class="muted">${state.matchStarted ? "🟢 Match en cours" : "⏸️ Match préparé — en attente du démarrage"}</p>`;
    } else if (state.tournamentWinnerId !== null) {
      const w=team(state.tournamentWinnerId);
      matchHtml += `<div class="final-dashboard"><div class="trophy">🏆</div><h3>${escapeHtml(w?.name || "Champion")}</h3><p>Champion du tournoi</p></div>`;
    } else {
      matchHtml += `<h3>Pas de match en cours</h3>`;
    }
    matchHtml += `</div>`;

    const ranking = sortedTeams().map((t,i)=>`<div class="rank-item"><strong>${i+1}. ${escapeHtml(t.name)}</strong><span class="badges">${t.points} pts · ${t.wins}V · ${t.draws}N · ${t.losses}D</span></div>`).join("");
    const scorers = getScorerRanking().map(([name,goals],i)=>`<div class="rank-item"><strong>${i+1}. ${escapeHtml(name)}</strong><span class="badges">${goals} but${goals>1?"s":""}</span></div>`).join("");
    const queue = (state.queue||[]).map((id,i)=>`<div class="rank-item"><strong>${i+1}. ${escapeHtml(team(id)?.name||"—")}</strong></div>`).join("");
    root.innerHTML = matchHtml + `<div class="grid two"><div class="card live-card"><div class="section-title">🏆 Classement</div>${ranking || `<p class="muted">Aucun classement.</p>`}</div><div class="card live-card"><div class="section-title">⚽ Buteurs</div>${scorers || `<p class="muted">Aucun buteur.</p>`}</div></div><div class="card live-card"><div class="section-title">📋 Prochaines équipes</div><div class="live-list">${queue || `<p class="muted">Aucune équipe en attente.</p>`}</div></div><div class="card live-card"><div class="section-title">📜 Matchs terminés</div>${(state.history||[]).slice().reverse().map(h=>`<div class="history-item"><strong>#${h.number}</strong><span>${escapeHtml(h.text)}</span></div>`).join("") || `<p class="muted">Aucun match terminé.</p>`}</div>`;
    if (liveTimerId) clearInterval(liveTimerId);
    if (state.active?.matchStarted) {
      let remaining = Number(state.secondsLeft)||0;
      liveTimerId=setInterval(()=>{ remaining=Math.max(0,remaining-1); const t=document.getElementById("liveTimer"); if(t)t.textContent=formatTime(remaining); },1000);
    }
  }

  async function enterLiveMode() {
    accessMode="live";
    stopTimer();
    document.getElementById("accessScreen")?.classList.add("hidden");
    document.getElementById("adminLoginBox")?.classList.add("hidden");
    els.setupScreen.classList.add("hidden");
    els.gameScreen.classList.add("hidden");
    document.getElementById("liveScreen")?.classList.remove("hidden");
    if (!supabaseClient) initSupabase();
    const remote=await remoteRead();
    state=remote;
    renderLive();
    subscribeRealtime();
  }

  async function enterAdminMode() {
    const box=document.getElementById("adminLoginBox");
    const password=document.getElementById("adminPassword")?.value || "";
    const msg=document.getElementById("loginMessage");
    if (!supabaseClient) initSupabase();
    if (!supabaseClient) { msg.textContent="Configure Supabase dans supabase-config.js avant de te connecter."; return; }
    if (!window.SF_SUPABASE?.adminEmail) { msg.textContent="Ajoute l'email administrateur dans supabase-config.js."; return; }
    if (!password) { msg.textContent="Entre le code administrateur."; return; }
    const { error }=await supabaseClient.auth.signInWithPassword({ email:window.SF_SUPABASE.adminEmail, password });
    if (error) { msg.textContent="Code incorrect ou compte administrateur non configuré."; return; }
    accessMode="admin";
    document.getElementById("accessScreen")?.classList.add("hidden");
    els.openRegistrationAdminBtn?.classList.remove("hidden");
    const remote=await remoteRead();
    if (remote) {
      state=remote;
      migrateTeamColors();
    } else {
      const local=loadState();
      if(local){state=local;migrateTeamColors();}
    }
    showDashboard();
    showToast("Mode administrateur activé.");
  }

  function saveState() {
    if (!state) return;
    state.updatedAt = new Date().toISOString();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      els.saveStatus.textContent = accessMode === "admin" ? "✓ Sauvegardé automatiquement + online" : "✓ Sauvegardé automatiquement";
      scheduleRemoteWrite();
    } catch (error) {
      els.saveStatus.textContent = "⚠️ Sauvegarde locale indisponible";
      showToast("Impossible de sauvegarder localement.");
    }
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.teams)) return null;
      if (!Array.isArray(parsed.scorersA)) parsed.scorersA = [];
      if (!Array.isArray(parsed.scorersB)) parsed.scorersB = [];
      if (parsed.phaseMatch) {
        if (!Array.isArray(parsed.phaseMatch.scorersA)) parsed.phaseMatch.scorersA=[];
        if (!Array.isArray(parsed.phaseMatch.scorersB)) parsed.phaseMatch.scorersB=[];
      }
      return parsed;
    } catch {
      return null;
    }
  }

  function clearState() {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }

  function stopTimer() {
    if (timerId !== null) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  function startTimer() {
    stopTimer();
    if (!state || !state.active || !state.matchStarted || state.timerPaused) return;
    timerId = setInterval(() => {
      if (!state || !state.active || state.timerPaused) return;
      state.secondsLeft = Math.max(0, state.secondsLeft - 1);
      renderGame();
      saveState();
      if (state.secondsLeft % 5 === 0) scheduleRemoteWrite(true);

      if (state.secondsLeft === 0) {
        stopTimer();
        if (state.scoreA === 0 && state.scoreB === 0) {
          finishDraw();
        } else {
          // According to the requested rule, the normal draw case is 0-0.
          // If goals were scored but nobody reached 2, the organizer decides.
          showToast("Temps écoulé : choisis le gagnant.");
        }
      }
    }, 1000);
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function startFirstMatch() {
    shuffleArray(state.queue);
    const firstA = state.queue.shift();
    const firstB = state.queue.shift();
    if (firstA === undefined || firstB === undefined) {
      showToast("Pas assez d'équipes.");
      return;
    }
    state.active = { a: firstA, b: firstB };
    state.matchNumber = 1;
    state.scoreA = 0;
    state.scoreB = 0;
    state.scorersA = [];
    state.scorersB = [];
    state.secondsLeft = state.settings.matchMinutes * 60;
    state.matchStarted = false;
    saveState();
    showGame();
    renderGame();
    showMatchAnnouncement([firstA, firstB], "Entrent");
    // Intentionally paused: organizer must tap "Commencer le match".
  }

  function startNextMatchFromWinner(winnerId, loserId) {
    state.queue.push(loserId);
    const nextId = state.queue.shift();

    if (nextId === undefined) {
      state.active = null;
      state.matchStarted = false;
      stopTimer();
      saveState();
      renderGame();
      showToast("Plus d'équipe disponible.");
      return;
    }

    state.active = { a: winnerId, b: nextId };
    state.matchNumber += 1;
    state.scoreA = 0;
    state.scoreB = 0;
    state.scorersA = [];
    state.scorersB = [];
    state.secondsLeft = state.settings.matchMinutes * 60;
    state.matchStarted = false;
    saveState();
    renderGame();
    showMatchAnnouncement([nextId], "Entre");
    // Pause between matches. Timer starts only after explicit tap.
  }

  function finishWinner(side) {
    if (accessMode !== "admin") { showToast("🔒 Action réservée à l’administrateur."); return; }
    if (!state?.active || !state.matchStarted) return;

    stopTimer();

    const winnerId = side === "A" ? state.active.a : state.active.b;
    const loserId = side === "A" ? state.active.b : state.active.a;
    const winner = state.teams[winnerId];
    const loser = state.teams[loserId];

    winner.wins += 1;
    winner.points += 3;
    loser.losses += 1;

    winner.goalsFor += state.scoreA;
    winner.goalsAgainst += state.scoreB;
    loser.goalsFor += state.scoreB;
    loser.goalsAgainst += state.scoreA;

    state.history.push({
      number: state.matchNumber,
      teamAId: state.active.a,
      teamBId: state.active.b,
      type: "win",
      text: `${winner.name} gagne ${state.scoreA}-${state.scoreB} contre ${loser.name}. ${winner.name} reste sur le terrain.`,
      scorersA: [...(state.scorersA || [])],
      scorersB: [...(state.scorersB || [])]
    });

    saveState();
    vibrate([180, 80, 180, 80, 350]);
    startNextMatchFromWinner(winnerId, loserId);
  }

  function finishDraw() {
    if (accessMode !== "admin") { showToast("🔒 Action réservée à l’administrateur."); return; }
    if (!state?.active || !state.matchStarted) return;

    stopTimer();

    const aId = state.active.a;
    const bId = state.active.b;
    const a = state.teams[aId];
    const b = state.teams[bId];

    a.draws += 1;
    b.draws += 1;
    a.points += 1;
    b.points += 1;

    a.goalsFor += state.scoreA;
    a.goalsAgainst += state.scoreB;
    b.goalsFor += state.scoreB;
    b.goalsAgainst += state.scoreA;

    state.history.push({
      number: state.matchNumber,
      teamAId: state.active.a,
      teamBId: state.active.b,
      type: "draw",
      text: `Égalité ${a.name} ${state.scoreA}-${state.scoreB} ${b.name}. Les deux sortent.`,
      scorersA: [...(state.scorersA || [])],
      scorersB: [...(state.scorersB || [])]
    });

    // Both teams go to the end of the queue.
    state.queue.push(aId, bId);

    const nextA = state.queue.shift();
    const nextB = state.queue.shift();

    if (nextA === undefined || nextB === undefined) {
      state.active = null;
      saveState();
      renderGame();
      showToast("Égalité enregistrée. Il faut deux équipes disponibles.");
      return;
    }

    state.active = { a: nextA, b: nextB };
    state.matchNumber += 1;
    state.scoreA = 0;
    state.scoreB = 0;
    state.scorersA = [];
    state.scorersB = [];
    state.secondsLeft = state.settings.matchMinutes * 60;
    state.matchStarted = false;

    saveState();
    vibrate([180, 80, 180, 80, 350]);
    renderGame();
    showMatchAnnouncement([nextA, nextB], "Entrent");
    // Pause between matches. Timer starts only after explicit tap.
  }

  function startCurrentMatch() {
    if (accessMode !== "admin") { showToast("🔒 Action réservée à l’administrateur."); return; }
    if (!state?.active || state.matchStarted) return;
    state.matchStarted = true;
    state.secondsLeft = state.settings.matchMinutes * 60;
    saveState();
    scheduleRemoteWrite(true);
    renderGame();
    startTimer();
    showToast("Match commencé !");
  }

  function ensureScorerState() {
    if (!state) return;
    if (!Array.isArray(state.scorersA)) state.scorersA = [];
    if (!Array.isArray(state.scorersB)) state.scorersB = [];
  }

  function addGoal(side, scorerName = "") {
    if (accessMode !== "admin") { showToast("🔒 Action réservée à l’administrateur."); return; }
    if (!state?.active || !state.matchStarted) return;

    ensureScorerState();

    if (side === "A") {
      state.scoreA += 1;
      state.scorersA.push(scorerName || "Buteur non renseigné");
    } else if (side === "B") {
      state.scoreB += 1;
      state.scorersB.push(scorerName || "Buteur non renseigné");
    } else {
      return;
    }

    // Vibration à chaque but sur téléphone.
    vibrate([60, 35, 60]);

    // Sauvegarde immédiate après chaque but / buteur.
    saveState();
    scheduleRemoteWrite(true);
    renderGame();

    // Le premier à 2 buts gagne automatiquement.
    if (state.scoreA >= 2) {
      finishWinner("A");
      return;
    }

    if (state.scoreB >= 2) {
      finishWinner("B");
      return;
    }
  }

  function scorerSummary(names) {
    if (!Array.isArray(names) || !names.length) return "Aucun buteur";
    const counts = new Map();
    names.forEach(name => counts.set(name, (counts.get(name) || 0) + 1));
    return [...counts.entries()].map(([name, count]) =>
      `${escapeHtml(name)}${count > 1 ? ` ×${count}` : ""}`
    ).join(" · ");
  }

  function playerButtonsHtml(team, side, phase = false) {
    const players = Array.isArray(team?.players) ? team.players : [];
    if (!players.length) {
      return `<div class="players-empty">Aucun joueur renseigné</div>`;
    }

    return `<div class="scorer-area">
      <div class="scorer-label">Buteur :</div>
      <div class="player-buttons">
        ${players.map((player, index) => `
          <button type="button" class="player-btn" data-${phase ? "pplayer" : "player"}side="${side}" data-${phase ? "pplayer" : "player"}name="${escapeHtml(player)}">${escapeHtml(player)}</button>
        `).join("")}
      </div>
    </div>`;
  }

  function sortedTeams() {
    return [...state.teams].sort((a, b) =>
      b.points - a.points ||
      b.wins - a.wins ||
      a.losses - b.losses ||
      a.name.localeCompare(b.name)
    );
  }

  function getScorerRanking() {
    const counts = new Map();
    const add = (name) => {
      const clean = String(name || "").trim();
      if (!clean || clean === "Buteur non renseigné") return;
      counts.set(clean, (counts.get(clean) || 0) + 1);
    };

    (state.history || []).forEach(h => {
      (h.scorersA || []).forEach(add);
      (h.scorersB || []).forEach(add);
    });
    (state.scorersA || []).forEach(add);
    (state.scorersB || []).forEach(add);
    (state.phaseMatch?.scorersA || []).forEach(add);
    (state.phaseMatch?.scorersB || []).forEach(add);
    (state.semifinalResults || []).forEach(r => {
      (r.scorersA || []).forEach(add);
      (r.scorersB || []).forEach(add);
    });
    if (state.finals?.playoff) {
      (state.finals.playoff.scorersA || []).forEach(add);
      (state.finals.playoff.scorersB || []).forEach(add);
    }
    if (state.finalResult) {
      (state.finalResult.scorersA || []).forEach(add);
      (state.finalResult.scorersB || []).forEach(add);
    }

    return [...counts.entries()].sort((a,b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }

  function renderGame() {
    if (!state) return;
    migrateTeamColors();

    els.matchNumber.textContent = state.active ? "#" + state.matchNumber : "—";
    els.timer.textContent = formatTime(state.secondsLeft);

    if (state.active) {
      const preA = state.teams[state.active.a];
      const preB = state.teams[state.active.b];
      els.preTeamA.textContent = preA?.name || "—";
      els.preTeamB.textContent = preB?.name || "—";
      els.preTeamA.style.color = preA ? getTeamColor(preA, state.active.a) : "";
      els.preTeamB.style.color = preB ? getTeamColor(preB, state.active.b) : "";
      els.preMatchCard.classList.toggle("hidden", !!state.matchStarted);
      els.activeMatchCard.classList.toggle("hidden", !state.matchStarted);
      els.startMatchBtn.disabled = !!state.matchStarted;
      els.startMatchBtn.textContent = state.matchStarted ? "Match en cours" : "▶️ Commencer le match";
      els.preMatchInfo.textContent = state.matchStarted
        ? "Le chrono est lancé."
        : `Durée : ${state.settings.matchMinutes} minutes. Le chrono démarrera après le bouton.`;
      const pauseBtn = document.getElementById("pauseMatchBtn");
      const resumeBtn = document.getElementById("resumeMatchBtn");
      if (pauseBtn) {
        pauseBtn.classList.toggle("hidden", !state.matchStarted || !!state.timerPaused);
        pauseBtn.disabled = accessMode !== "admin";
      }
      if (resumeBtn) {
        resumeBtn.classList.toggle("hidden", !state.matchStarted || !state.timerPaused);
        resumeBtn.disabled = accessMode !== "admin";
      }
      if (state.matchStarted && state.timerPaused) els.preMatchInfo.textContent = "⏸️ Chrono en pause.";
    } else {
      els.preMatchCard.classList.add("hidden");
      els.activeMatchCard.classList.add("hidden");
    }

    if (state.active) {
      const a = state.teams[state.active.a];
      const b = state.teams[state.active.b];

      els.teamAName.textContent = a.name;
      els.teamBName.textContent = b.name;
      els.teamAName.style.color = getTeamColor(a, state.active.a);
      els.teamBName.style.color = getTeamColor(b, state.active.b);
      els.scoreA.textContent = state.scoreA;
      els.scoreB.textContent = state.scoreB;
      ensureScorerState();
      const playersA = document.getElementById("playersA");
      const playersB = document.getElementById("playersB");
      if (playersA) playersA.innerHTML = playerButtonsHtml(a,"A",false);
      if (playersB) playersB.innerHTML = playerButtonsHtml(b,"B",false);
      const scorersAEl = document.getElementById("scorersA");
      const scorersBEl = document.getElementById("scorersB");
      if (scorersAEl) scorersAEl.innerHTML = `⚽ ${scorerSummary(state.scorersA)}`;
      if (scorersBEl) scorersBEl.innerHTML = `⚽ ${scorerSummary(state.scorersB)}`;
      els.leaderPoints.textContent = sortedTeams()[0]?.points ?? 0;
      els.drawBtn.textContent = `🤝 Égalité — 0-0 après ${state.settings.matchMinutes} min`;
    } else {
      els.teamAName.textContent = "—";
      els.teamBName.textContent = "—";
      els.teamAName.style.color = "";
      els.teamBName.style.color = "";
      els.scoreA.textContent = "0";
      els.scoreB.textContent = "0";
      els.leaderPoints.textContent = sortedTeams()[0]?.points ?? 0;
      els.drawBtn.textContent = `🤝 Égalité — 0-0 après ${state.settings.matchMinutes} min`;
    }

    els.queueList.innerHTML = state.queue.length
      ? state.queue.map((id, index) => {
          const t = state.teams[id];
          return `<div class="queue-item">
            <div class="row-left"><span class="queue-num">${index + 1}</span><strong>${escapeHtml(t.name)}</strong></div>
            <span class="badges">${t.points} pts</span>
          </div>`;
        }).join("")
      : `<div class="muted">Aucune équipe en attente.</div>`;

    els.rankingList.innerHTML = sortedTeams().map((t, i) =>
      `<div class="rank-item">
        <div class="row-left"><strong>${i + 1}. ${escapeHtml(t.name)}</strong></div>
        <span class="badges">${t.points} pts · ${t.wins}V · ${t.draws}N · ${t.losses}D</span>
      </div>`
    ).join("");

    const scorerRankingList = document.getElementById("scorerRankingList");
    if (scorerRankingList) {
      const scorers = getScorerRanking();
      scorerRankingList.innerHTML = scorers.length
        ? scorers.map(([name, goals], i) => `<div class="rank-item"><strong>${i + 1}. ${escapeHtml(name)}</strong><span class="badges">${goals} but${goals > 1 ? "s" : ""}</span></div>`).join("")
        : `<div class="muted">Aucun but enregistré.</div>`;
    }

    els.historyList.innerHTML = state.history.length
      ? state.history.slice().reverse().map(h => {
          const aScorers = Array.isArray(h.scorersA) && h.scorersA.length ? scorerSummary(h.scorersA) : "";
          const bScorers = Array.isArray(h.scorersB) && h.scorersB.length ? scorerSummary(h.scorersB) : "";
          const scorerLine = (aScorers || bScorers)
            ? `<div class="history-scorers">⚽ ${aScorers || "—"} ${bScorers ? ` | ${bScorers}` : ""}</div>`
            : "";
          return `<div class="history-item"><strong>#${h.number}</strong><div><span>${escapeHtml(h.text)}</span>${scorerLine}</div></div>`;
        }).join("")
      : `<div class="muted">Aucun match terminé.</div>`;

    renderFinals();
  }


  function renderManageTeams() {
    if (!state || accessMode !== "admin" || !els.manageTeamsContent) return;

    els.manageTeamsContent.innerHTML = state.teams.map((team, teamIndex) => {
      const players = Array.isArray(team.players) ? team.players : [];
      return `
        <div class="manage-team-card" data-manage-team="${teamIndex}" style="--team-color:${getTeamColor(team, teamIndex)}">
          <div class="manage-team-head">
            <div class="manage-team-title">
              <span class="team-color-dot" style="background:${getTeamColor(team, teamIndex)}"></span>
              <strong style="color:${getTeamColor(team, teamIndex)}">Équipe ${escapeHtml(team.name)}</strong>
              <span class="badges">${players.length} joueur${players.length > 1 ? "s" : ""}</span>
            </div>
            <label class="manage-team-name">
              <span>Nom</span>
              <input class="manage-team-name-input" data-team-name="${teamIndex}" value="${escapeHtml(team.name)}" maxlength="40">
            </label>
            <label class="manage-team-name">
              <span>Couleur</span>
              <select class="manage-team-color-select" data-team-color="${teamIndex}">
                ${teamColorOptions(getTeamColor(team, teamIndex))}
              </select>
            </label>
          </div>

          <div class="manage-player-list" data-manage-player-list="${teamIndex}">
            ${players.length ? players.map((player, playerIndex) => `
              <div class="manage-player-row">
                <span class="player-number">${playerIndex + 1}</span>
                <input class="manage-player-input" data-player-name="${teamIndex}:${playerIndex}" value="${escapeHtml(player)}" maxlength="60">
                <button type="button" class="danger-small icon-delete" data-delete-player="${teamIndex}:${playerIndex}" title="Supprimer ${escapeHtml(player)}" aria-label="Supprimer ${escapeHtml(player)}">🗑️</button>
              </div>
            `).join("") : `<div class="muted small empty-player-list">Aucun joueur dans cette équipe.</div>`}
          </div>

          <div class="manage-add-player-row">
            <input class="manage-new-player-input" data-new-player="${teamIndex}" maxlength="60" placeholder="Nom du nouveau joueur">
            <button type="button" class="secondary manage-add-player" data-add-manage-player="${teamIndex}">＋ Ajouter</button>
          </div>
        </div>
      `;
    }).join("");

    els.manageTeamsContent.querySelectorAll("[data-add-manage-player]").forEach(btn => {
      btn.addEventListener("click", () => {
        const teamIndex = Number(btn.dataset.addManagePlayer);
        const input = els.manageTeamsContent.querySelector(`[data-new-player="${teamIndex}"]`);
        const name = input?.value.trim();
        if (!name || !state?.teams?.[teamIndex]) return;
        if (!Array.isArray(state.teams[teamIndex].players)) state.teams[teamIndex].players = [];
        if (state.teams[teamIndex].players.length >= 7) {
          showToast("⚠️ Maximum 7 joueurs par équipe.");
          return;
        }
        state.teams[teamIndex].players.push(name);
        renderManageTeams();
        showToast(`✓ ${name} ajouté à ${state.teams[teamIndex].name}.`);
      });
    });

    els.manageTeamsContent.querySelectorAll("[data-new-player]").forEach(input => {
      input.addEventListener("keydown", event => {
        if (event.key === "Enter") {
          event.preventDefault();
          input.closest(".manage-add-player-row")?.querySelector("[data-add-manage-player]")?.click();
        }
      });
    });

    els.manageTeamsContent.querySelectorAll("[data-delete-player]").forEach(btn => {
      btn.addEventListener("click", () => {
        const [teamIndexRaw, playerIndexRaw] = btn.dataset.deletePlayer.split(":");
        const teamIndex = Number(teamIndexRaw);
        const playerIndex = Number(playerIndexRaw);
        const team = state?.teams?.[teamIndex];
        if (!team || !Array.isArray(team.players)) return;
        const player = team.players[playerIndex];
        if (!confirm(`Supprimer ${player || "ce joueur"} de ${team.name} ?`)) return;
        team.players.splice(playerIndex, 1);
        renderManageTeams();
      });
    });
  }

  function saveManagedTeams() {
    if (accessMode !== "admin" || !state) {
      showToast("🔒 Action réservée à l’administrateur.");
      return;
    }

    els.manageTeamsContent.querySelectorAll("[data-team-name]").forEach(input => {
      const index = Number(input.dataset.teamName);
      if (state.teams[index]) {
        const name = input.value.trim();
        if (name) state.teams[index].name = name;
      }
    });
    els.manageTeamsContent.querySelectorAll("[data-team-color]").forEach(select => {
      const index = Number(select.dataset.teamColor);
      if (state.teams[index]) state.teams[index].color = getTeamColor({color: select.value}, index);
    });

    state.teams.forEach((team, teamIndex) => {
      if (!Array.isArray(team.players)) team.players = [];
      const rows = [...els.manageTeamsContent.querySelectorAll(`[data-player-name^="${teamIndex}:"]`)];
      team.players = rows
        .map(input => input.value.trim())
        .filter(Boolean);
    });

    saveState();
    renderGame();
    renderManageTeams();
    showToast("✓ Équipes et joueurs enregistrés.");
  }

  function openManageTeams() {
    showTeamManagementPage();
  }

  function closeManageTeams() {
    if (accessMode === "admin") showDashboard();
    else showAccess();
  }


  function hideAllMainPages() {
    stopTimer();
    els.setupScreen?.classList.add("hidden");
    els.gameScreen?.classList.add("hidden");
    els.registrationAdminScreen?.classList.add("hidden");
    els.registrationScreen?.classList.add("hidden");
    els.dashboardPage?.classList.add("hidden");
    els.manageTeamsPanel?.classList.add("hidden");
    document.getElementById("liveScreen")?.classList.add("hidden");
  }

  function renderAdminDashboard() {
    if (!els.dashboardTournamentInfo) return;
    if (!state) {
      els.dashboardTournamentInfo.innerHTML =
        `<div class="card-mini"><strong>Aucun tournoi en cours.</strong><p class="muted small">Tu peux ouvrir les inscriptions ou créer un nouveau tournoi.</p></div>`;
      return;
    }
    const a = state.active ? state.teams[state.active.a]?.name : "";
    const b = state.active ? state.teams[state.active.b]?.name : "";
    els.dashboardTournamentInfo.innerHTML =
      `<div class="card-mini"><strong>🏟️ Tournoi actuel</strong><p class="muted small">${
        state.phase === "complete" ? "Tournoi terminé" :
        state.active ? `Match #${state.matchNumber} — ${escapeHtml(a || "—")} vs ${escapeHtml(b || "—")}` :
        "Tournoi préparé"
      }</p></div>`;
  }

  function showDashboard() {
    if (accessMode !== "admin") { showAccess(); return; }
    hideAllMainPages();
    els.appTopbar?.classList.remove("hidden");
    els.dashboardPage?.classList.remove("hidden");
    renderAdminDashboard();
  }

  function showTeamManagementPage() {
    if (accessMode !== "admin") { showToast("🔒 Gestion réservée à l’administrateur."); return; }
    hideAllMainPages();
    els.appTopbar?.classList.remove("hidden");
    els.manageTeamsPanel?.classList.remove("hidden");
    renderManageTeams();
  }

  function showGame() {
    hideAllMainPages();
    els.appTopbar?.classList.remove("hidden");
    els.gameScreen.classList.remove("hidden");
    els.resumeBanner.classList.add("hidden");
    if (els.manageTeamsBtn) els.manageTeamsBtn.classList.toggle("hidden", accessMode !== "admin");
    if (els.newTournamentBtn) els.newTournamentBtn.classList.toggle("hidden", accessMode !== "admin");
  }

  function showSetup() {
    stopTimer();
    hideAllMainPages();
    els.appTopbar?.classList.remove("hidden");
    els.setupScreen.classList.remove("hidden");
    els.openRegistrationAdminBtn?.classList.toggle("hidden", accessMode !== "admin");
  }


  function teamImageHtml(team, cls="team-logo") {
    return team?.image
      ? `<img class="${cls}" src="${escapeHtml(team.image)}" alt="Image de ${escapeHtml(team.name)}">`
      : `<div class="${cls} placeholder">⚽</div>`;
  }

  function phaseDurationSeconds() {
    if (state.phase==="playoff") return 300;
    if (state.phase==="semifinal") return 420;
    if (state.phase==="final") return 600;
    return 0;
  }

  function phaseGoalLimit() {
    return state.phase==="final" ? 3 : 2;
  }

  function phaseLabel() {
    if (state.phase==="playoff") return "MATCH ÉLIMINATOIRE";
    if (state.phase==="semifinal") return "DEMI-FINALE";
    return "FINALE";
  }

  function stopPhaseTimer() {
    if (state?.phaseTimerId) clearInterval(state.phaseTimerId);
    if (state) state.phaseTimerId=null;
  }

  function preparePhaseMatch(phase,a,b,label) {
    stopPhaseTimer();
    state.phase=phase;
    state.phaseMatch={a,b,label,scoreA:0,scoreB:0,scorersA:[],scorersB:[]};
    state.phaseMatchStarted=false;
    state.phaseSecondsLeft=phaseDurationSeconds();
    saveState();
    renderFinals();
  }

  function startPhaseMatch() {
    if (accessMode !== "admin") { showToast("🔒 Action réservée à l’administrateur."); return; }
    if (!state?.phaseMatch || state.phaseMatchStarted) return;
    state.phaseMatchStarted=true;
    state.phaseSecondsLeft=phaseDurationSeconds();
    saveState();
    renderFinals();
    state.phaseTimerId=setInterval(()=>{
      if (!state?.phaseMatchStarted) return;
      state.phaseSecondsLeft=Math.max(0,state.phaseSecondsLeft-1);
      renderFinals(); saveState();
      if (state.phaseSecondsLeft % 5 === 0) scheduleRemoteWrite(true);
      if (state.phaseSecondsLeft===0) {
        stopPhaseTimer();
        showToast("Temps écoulé : choisis le vainqueur.");
      }
    },1000);
  }

  function resumePhaseTimer() {
    if (!state?.phaseMatch || !state.phaseMatchStarted) return;
    stopPhaseTimer();
    state.phaseTimerId=setInterval(()=>{
      if (!state?.phaseMatchStarted) return;
      state.phaseSecondsLeft=Math.max(0,state.phaseSecondsLeft-1);
      renderFinals(); saveState();
      if (state.phaseSecondsLeft % 5 === 0) scheduleRemoteWrite(true);
      if (state.phaseSecondsLeft===0) {
        stopPhaseTimer();
        showToast("Temps écoulé : choisis le vainqueur.");
      }
    },1000);
  }

  function addPhaseGoal(side, scorerName = "") {
    if (!state?.phaseMatch || !state.phaseMatchStarted) return;
    if (!Array.isArray(state.phaseMatch.scorersA)) state.phaseMatch.scorersA=[];
    if (!Array.isArray(state.phaseMatch.scorersB)) state.phaseMatch.scorersB=[];

    if (side==="A") {
      state.phaseMatch.scoreA++;
      state.phaseMatch.scorersA.push(scorerName || "Buteur non renseigné");
    } else if (side==="B") {
      state.phaseMatch.scoreB++;
      state.phaseMatch.scorersB.push(scorerName || "Buteur non renseigné");
    } else {
      return;
    }

    vibrate([60, 35, 60]);
    saveState();
    renderFinals();
    const limit=phaseGoalLimit();
    if (state.phaseMatch.scoreA>=limit) finishPhaseMatch("A");
    else if (state.phaseMatch.scoreB>=limit) finishPhaseMatch("B");
  }

  function finishPhaseMatch(side) {
    if (!state?.phaseMatch || !state.phaseMatchStarted) return;
    const m=state.phaseMatch;
    const winnerId=side==="A"?m.a:m.b;
    const loserId=side==="A"?m.b:m.a;
    vibrate([180, 80, 180, 80, 350]);
    stopPhaseTimer();

    if (state.phase==="playoff") {
      const r=sortedTeams();
      state.finals={top4:[r[0].id,r[1].id,r[2].id,winnerId],playoff:{winnerId,loserId,scoreA:m.scoreA,scoreB:m.scoreB,scorersA:[...(m.scorersA||[])],scorersB:[...(m.scorersB||[])]}};
      state.semifinalResults=[];
      preparePhaseMatch("semifinal",r[0].id,winnerId,"Demi-finale 1");
      return;
    }

    if (state.phase==="semifinal") {
      state.semifinalResults=state.semifinalResults||[];
      state.semifinalResults.push({winnerId,loserId,scoreA:m.scoreA,scoreB:m.scoreB,label:m.label,scorersA:[...(m.scorersA||[])],scorersB:[...(m.scorersB||[])]});
      if (state.semifinalResults.length===1) {
        const top4=state.finals.top4;
        preparePhaseMatch("semifinal",top4[1],top4[2],"Demi-finale 2");
      } else {
        const f1=state.semifinalResults[0].winnerId;
        const f2=state.semifinalResults[1].winnerId;
        preparePhaseMatch("final",f1,f2,"Finale");
      }
      return;
    }

    if (state.phase==="final") {
      state.finalResult={winnerId,loserId,scoreA:m.scoreA,scoreB:m.scoreB,scorersA:[...(m.scorersA||[])],scorersB:[...(m.scorersB||[])]};
      state.tournamentWinnerId=winnerId;
      state.phase="complete";
      state.phaseMatch=null;
      state.phaseMatchStarted=false;
      state.phaseSecondsLeft=0;
      saveState(); renderFinals();
      showToast(`🏆 ${state.teams[winnerId].name} est champion !`);
    }
  }

  function launchSemifinals() {
    const r=sortedTeams();
    if (r.length<4) { showToast("Il faut au moins 4 équipes pour les demi-finales."); return; }
    if (r.length>=5 && r[3].points===r[4].points) {
      state.finals={top4:[r[0].id,r[1].id,r[2].id,null],playoff:{fourthId:r[3].id,fifthId:r[4].id}};
      preparePhaseMatch("playoff",r[3].id,r[4].id,"Match éliminatoire pour la 4e place");
      return;
    }
    state.finals={top4:r.slice(0,4).map(t=>t.id)};
    state.semifinalResults=[];
    preparePhaseMatch("semifinal",r[0].id,r[3].id,"Demi-finale 1");
  }

  function phaseMatchHtml() {
    if (!state.phaseMatch) return "";
    const a=state.teams[state.phaseMatch.a], b=state.teams[state.phaseMatch.b];
    const dur=state.phase==="playoff"?"5 min":state.phase==="semifinal"?"7 min":"10 min";
    const goals=state.phase==="final"?3:2;
    const scorersA = state.phaseMatch.scorersA || [];
    const scorersB = state.phaseMatch.scorersB || [];
    return `<div class="phase-card">
      <div class="phase-title">${phaseLabel()}</div>
      <div class="phase-sub">${escapeHtml(state.phaseMatch.label)} · ${dur} · ${goals} buts</div>
      <div class="teams">
        <div class="team-side">
          ${teamImageHtml(a)}
          <div class="team-name">${escapeHtml(a.name)}</div>
          <div class="score">${state.phaseMatch.scoreA}</div>
          ${state.phaseMatchStarted ? `<button class="goal" data-pgoal="A">⚽ But</button>${playerButtonsHtml(a,"A",true)}<div class="scorer-list">⚽ ${scorerSummary(scorersA)}</div>` : ""}
        </div>
        <div class="versus">VS</div>
        <div class="team-side">
          ${teamImageHtml(b)}
          <div class="team-name">${escapeHtml(b.name)}</div>
          <div class="score">${state.phaseMatch.scoreB}</div>
          ${state.phaseMatchStarted ? `<button class="goal" data-pgoal="B">⚽ But</button>${playerButtonsHtml(b,"B",true)}<div class="scorer-list">⚽ ${scorerSummary(scorersB)}</div>` : ""}
        </div>
      </div>
      <div class="stat"><span>Temps</span><strong>${formatTime(state.phaseSecondsLeft)}</strong></div>
      ${!state.phaseMatchStarted
        ? `<button id="startPhaseMatchBtn" class="primary full">▶️ Commencer ${phaseLabel().toLowerCase()}</button>`
        : `<div class="action-grid"><button class="win" data-pwin="A">🏆 ${escapeHtml(a.name)} gagne</button><button class="win" data-pwin="B">🏆 ${escapeHtml(b.name)} gagne</button></div>`}
      <p class="hint">Le chrono démarre seulement après le bouton. Cliquer sur le nom d'un joueur enregistre directement son but.</p>
    </div>`;
  }

  function renderFinals() {
    if (!state || state.teams.length<4) return;
    els.finalScreen.classList.remove("hidden");
    let html=`<div class="phase-card"><div class="phase-title">📊 Classement</div>
      <div class="phase-sub">3 pts victoire · 1 pt égalité · 0 pt défaite</div>
      ${sortedTeams().map((t,i)=>`<div class="rank-item"><strong>${i+1}. ${escapeHtml(t.name)}</strong><span class="badges">${t.points} pts · ${t.wins}V · ${t.draws}N · ${t.losses}D</span></div>`).join("")}
    </div>`;

    if (state.phase==="league") {
      if (state.teams.length >= 4) {
        html+=`<div class="phase-card"><div class="phase-title">🏁 Phase finale</div>
          <p class="muted">Quand la phase de classement est terminée, appuie ici.</p>
          <button id="goSemifinalsBtn" class="primary full">🏆 Passer aux demi-finales</button></div>`;
      } else {
        html+=`<div class="phase-card"><div class="phase-title">ℹ️ Tournoi à 3 équipes</div>
          <p class="muted">Le mode 3 équipes fonctionne normalement pour les matchs de classement. Les demi-finales nécessitent au moins 4 équipes.</p></div>`;
      }
    } else if (state.phaseMatch) {
      html+=phaseMatchHtml();
    }

    if (state.semifinalResults?.length) {
      html+=`<div class="phase-card"><div class="phase-title">Demi-finales</div>
        ${state.semifinalResults.map(r=>`<div class="history-item"><strong>${escapeHtml(r.label)}</strong><span>🏆 ${escapeHtml(state.teams[r.winnerId].name)} · ${r.scoreA}-${r.scoreB}</span></div>`).join("")}
      </div>`;
    }

    if (state.finalResult) {
      const w=state.teams[state.finalResult.winnerId];
      html+=`<div class="phase-card final-dashboard"><div class="trophy">🏆</div><div class="phase-title">CHAMPION</div>${teamImageHtml(w,"winner-logo")}<div class="winner-name">${escapeHtml(w.name)}</div><p>Champion du tournoi</p></div>`;
    }

    els.finalContent.innerHTML=html;
    const go=document.getElementById("goSemifinalsBtn");
    if(go) go.addEventListener("click",launchSemifinals);
    const startBtn=document.getElementById("startPhaseMatchBtn");
    if(startBtn) startBtn.addEventListener("click",startPhaseMatch);
    els.finalContent.querySelectorAll("[data-pgoal]").forEach(b=>b.addEventListener("click",()=>addPhaseGoal(b.dataset.pgoal)));
    els.finalContent.querySelectorAll("[data-pplayerside]").forEach(b=>b.addEventListener("click",()=>addPhaseGoal(b.dataset.pplayerside,b.dataset.pplayername)));
    els.finalContent.querySelectorAll("[data-pwin]").forEach(b=>b.addEventListener("click",()=>finishPhaseMatch(b.dataset.pwin)));

    els.dashboardScreen.classList.remove("hidden");
    let d=`<div class="phase-card">`;
    if(state.tournamentWinnerId!==null){
      const w=state.teams[state.tournamentWinnerId];
      d+=`<div class="final-dashboard"><div class="trophy">🏆</div>${teamImageHtml(w,"winner-logo")}<div class="winner-name">${escapeHtml(w.name)}</div><p>Champion du tournoi</p></div>`;
    } else if(state.finals?.top4){
      d+=`<div class="phase-title">Top 4 / qualification</div>${state.finals.top4.map((id,i)=>id===null?`<div class="rank-item"><strong>${i+1}. À déterminer</strong></div>`:`<div class="rank-item"><strong>${i+1}. ${escapeHtml(state.teams[id].name)}</strong><span class="badges">${state.teams[id].points} pts</span></div>`).join("")}`;
    } else {
      d+=`<div class="phase-title">📱 Dashboard</div><p class="muted">Le dashboard final apparaîtra ici.</p>`;
    }
    d+=`</div>`;
    els.dashboardContent.innerHTML=d;
  }

  async function readImageAsDataUrl(file) {
    if (!file) return "";
    if (!file.type.startsWith("image/")) return "";
    if (file.size > 2000000) {
      showToast("Image trop grande (maximum 2 Mo).");
      return "";
    }
    return await new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
    });
  }

  async function collectTeams() {
    const count = Number(els.teamCount.value);
    const teams = [];
    for (let i=0;i<count;i++) {
      const nameInput=els.teamForm.querySelector(`[data-field="name"][data-index="${i}"]`);
      const colorInput=els.teamForm.querySelector(`[data-field="color"][data-index="${i}"]`);
      const captainInput=els.teamForm.querySelector(`[data-field="captain"][data-index="${i}"]`);
      const playersInput=els.teamForm.querySelector(`[data-field="players"][data-index="${i}"]`);
      const imageInput=els.teamForm.querySelector(`[data-field="image"][data-index="${i}"]`);
      const name=(nameInput?.value||"").trim() || `Équipe ${i+1}`;
      const color=getTeamColor({color:(colorInput?.value||"").trim()}, i);
      const captain=(captainInput?.value||"").trim();
      const players=(playersInput?.value||"").split(",").map(v=>v.trim()).filter(Boolean);
      const image=await readImageAsDataUrl(imageInput?.files?.[0]);
      teams.push({id:i,name,color,captain,players,image,wins:0,draws:0,losses:0,points:0,goalsFor:0,goalsAgainst:0});
    }
    return teams;
  }

  async function beginTournament() {
    if (accessMode !== "admin") { showToast("🔒 Seul l'administrateur peut créer un tournoi."); return; }
    const teams = await collectTeams();
    const minutes = Math.max(1, Math.min(30, Number(els.matchMinutes.value) || 5));

    state = createEmptyState(teams, minutes);
    state.queue = teams.map((_, index) => index);

    startFirstMatch();
    showToast("Tournoi créé et sauvegardé.");
  }

  function resumeExisting() {
    const saved = loadState();
    if (!saved || !saved.active) return false;

    state = saved;
    showGame();
    renderGame();
    if (state.matchStarted && !state.timerPaused) startTimer();
    return true;
  }

  function offerResume() {
    const saved = loadState();
    if (!saved) return;

    const active = saved.active;
    if (!active) return;

    const a = saved.teams[active.a]?.name || "Équipe A";
    const b = saved.teams[active.b]?.name || "Équipe B";

    els.resumeText.textContent = `Match #${saved.matchNumber} : ${a} ${saved.scoreA}-${saved.scoreB} ${b}.`;
    els.resumeBanner.classList.remove("hidden");
  }

  function exportTournament() {
    if (!state) {
      showToast("Aucun tournoi actif.");
      return;
    }

    const payload = JSON.stringify(state, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `Sunday_Football_${date}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast("Copie de sauvegarde exportée.");
  }

  function validateImportedState(data) {
    return data &&
      data.version === 1 &&
      Array.isArray(data.teams) &&
      data.teams.length >= 4 &&
      Array.isArray(data.queue) &&
      typeof data.settings?.matchMinutes === "number";
  }

  async function importTournament(event) {
    if (accessMode !== "admin") {
      showToast("🔒 Import réservé à l'administrateur.");
      if (event?.target) event.target.value = "";
      return;
    }
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const imported = JSON.parse(text);

      if (!validateImportedState(imported)) {
        throw new Error("Format invalide");
      }

      state = imported;
      saveState();
      showGame();
      renderGame();
      if (state.active) startTimer();
      showToast("Tournoi restauré.");
    } catch {
      showToast("Fichier de sauvegarde invalide.");
    } finally {
      event.target.value = "";
    }
  }

  function newTournament() {
    if (accessMode !== "admin") { showToast("🔒 Seul l'administrateur peut créer un nouveau tournoi."); return; }
    const ok = confirm("Commencer un nouveau tournoi ? Le tournoi actuel est déjà sauvegardé automatiquement sur ce téléphone. L'export reste disponible comme copie de secours.");
    if (!ok) return;

    clearState();
    state = null;
    remoteDelete();
    stopTimer();
    els.resumeBanner.classList.add("hidden");
    showSetup();
    renderTeamForm();
    showToast("Nouveau tournoi.");
  }

  els.teamCount.addEventListener("change", () => renderTeamForm());
  els.addTeamBtn?.addEventListener("click", addSetupTeam);
  els.removeTeamBtn?.addEventListener("click", removeSetupTeam);
  els.startTournamentBtn.addEventListener("click", beginTournament);
  els.newTournamentBtn.addEventListener("click", newTournament);
  els.homeDashboardBtn?.addEventListener("click", showDashboard);
  els.topRegistrationBtn?.addEventListener("click", openRegistrationAdmin);
  els.dashboardRegistrationBtn?.addEventListener("click", openRegistrationAdmin);
  els.dashboardNewTournamentBtn?.addEventListener("click", () => { showSetup(); renderTeamForm(); });
  els.dashboardTeamsBtn?.addEventListener("click", showTeamManagementPage);
  els.dashboardCurrentTournamentBtn?.addEventListener("click", () => {
    if (!state) { showToast("Aucun tournoi en cours."); return; }
    showGame();
    renderGame();
    if (state.matchStarted && !state.timerPaused) startTimer();
  });
  els.dashboardLogoutBtn?.addEventListener("click", () => {
    accessMode = "none";
    showAccess();
  });
  els.continueBtn.addEventListener("click", () => {
    if (accessMode !== "admin") { showToast("🔒 Action réservée à l'administrateur."); return; }
    const saved = loadState();
    if (!saved) return;
    state = saved;
    showGame();
    renderGame();
    if (state.matchStarted && !state.timerPaused) startTimer();
  });

  els.startMatchBtn.addEventListener("click", startCurrentMatch);
  els.manageTeamsBtn?.addEventListener("click", openManageTeams);
  els.openRegistrationAdminBtn?.addEventListener("click", openRegistrationAdmin);
  document.getElementById("registrationAdminBackBtn")?.addEventListener("click", closeRegistrationAdmin);
  els.drawPlayersBtn?.addEventListener("click", drawRegisteredPlayers);
  els.closeManageTeamsBtn?.addEventListener("click", closeManageTeams);
  els.saveTeamPlayersBtn?.addEventListener("click", saveManagedTeams);
  document.getElementById("pauseMatchBtn")?.addEventListener("click", pauseMatchTimer);
  document.getElementById("resumeMatchBtn")?.addEventListener("click", resumeMatchTimer);
  els.goalABtn.addEventListener("click", () => addGoal("A"));
  els.goalBBtn.addEventListener("click", () => addGoal("B"));
  els.activeMatchCard.addEventListener("click", (event) => {
    const button = event.target.closest("[data-playerside]");
    if (!button) return;
    addGoal(button.dataset.playerside, button.dataset.playername);
  });
  els.winABtn.addEventListener("click", () => finishWinner("A"));
  els.winBBtn.addEventListener("click", () => finishWinner("B"));
  els.drawBtn.addEventListener("click", finishDraw);
  els.exportBtn.addEventListener("click", exportTournament);
  els.importInput.addEventListener("change", importTournament);

  initSupabase();
  document.getElementById("adminAccessBtn")?.addEventListener("click", () => document.getElementById("adminLoginBox")?.classList.remove("hidden"));
  document.getElementById("adminLoginBtn")?.addEventListener("click", enterAdminMode);
  document.getElementById("adminPassword")?.addEventListener("keydown", e => { if(e.key === "Enter") enterAdminMode(); });
  document.getElementById("backAccessBtn")?.addEventListener("click", () => document.getElementById("adminLoginBox")?.classList.add("hidden"));
  document.getElementById("liveAccessBtn")?.addEventListener("click", enterLiveMode);
  document.getElementById("registerAccessBtn")?.addEventListener("click", enterRegistrationMode);
  document.getElementById("registerPlayerBtn")?.addEventListener("click", submitRegistration);
  document.getElementById("registrationBackBtn")?.addEventListener("click", showAccess);
  els.registrationName?.addEventListener("keydown", e => { if(e.key === "Enter") submitRegistration(); });
  document.getElementById("liveBackBtn")?.addEventListener("click", showAccess);

  renderTeamForm();

  const existing = loadState();
  // The public entry screen is shown first. Local/online tournament state is loaded after Admin or Live is selected.
})();

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden" && state) saveState();
  });

  window.addEventListener("beforeunload", () => {
    if (state) saveState();
  });
