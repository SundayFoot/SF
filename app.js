
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
    registrationFeedback: $("registrationFeedback"),
    publicTeamsAccessBtn: $("publicTeamsAccessBtn"),
    publicTeamsScreen: $("publicTeamsScreen"),
    publicTeamsContent: $("publicTeamsContent"),
    publicTeamsBackBtn: $("publicTeamsBackBtn"),
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
    topRegistrationBtn: $("topRegistrationBtn"),
    dashboardLogoutBtn: $("dashboardLogoutBtn"),
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

  function teamJerseyAsset(team, index = 0) {
    const color = getTeamColor(team, index).toLowerCase();
    const map = {
      "#ef4444":"red", "#22c55e":"green", "#eab308":"yellow", "#3b82f6":"blue",
      "#f97316":"orange", "#a855f7":"purple", "#111827":"black", "#f8fafc":"white"
    };
    return `assets/jersey-${map[color] || "blue"}.svg`;
  }

  function teamJerseyHtml(team, index = 0, cls = "team-jersey") {
    return `<img class="${cls}" src="${teamJerseyAsset(team,index)}" alt="Maillot ${escapeHtml(team?.name || "équipe")}" loading="lazy">`;
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
    const teamNames=ids.map(id=>state.teams[id]?.name).filter(Boolean).join(" et ");
    const notificationBody = label.toLowerCase().startsWith("entr")
      ? `${teamNames} entre${ids.length>1?"nt":""} sur le terrain.`
      : `${teamNames} ${label.toLowerCase()}.`;
    notifyPhone("Sunday Football",notificationBody,"team-entry").catch(()=>{});
    if(accessMode==="admin"&&supabaseClient){
      supabaseClient.from("tournament_notifications").insert({event_id:"current",kind:"team_entry",title:"Sunday Football",body:notificationBody,team_ids:ids})
        .then(({error})=>{if(error)console.warn("Notification event:",error.message);});
    }
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
    const count = Math.max(2, Math.min(6, Number(els.teamCount.value) || 4));
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
    if (Number(els.teamCount.value) >= 6) {
      showToast("Maximum 6 équipes.");
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
      captains: [],
      registrationOpen: false
    };
  }

  const SF_TABLE = "tournaments";
  const SF_ROW_ID = "current";
  const REG_SETTINGS_TABLE = "registration_settings";
  const REG_TABLE = "player_registrations";
  const REG_ALLOWED_TABLE = "registration_allowed_players";
  const REG_ROW_ID = "current";
  let supabaseClient = null;
  let onlineSyncTimer = null;
  let realtimeChannel = null;
  let accessMode = null;
  let liveTimerId = null;
  const ADMIN_IDLE_TIMEOUT_MS = 30 * 60 * 1000;
  let adminIdleTimer = null;
  let adminActivityBound = false;
  let registrationStatusTimer = null;
  let tournamentNotificationChannel = null;
  let tournamentNotificationPollTimer = null;
  let tournamentNotificationLastId = null;
  const DEVICE_ID_KEY = "sf_registration_device_id_v1";
  const NOTIFY_PREF_KEY = "sf_notifications_enabled_v1";
  function getRegistrationDeviceId() {
    try { let id=localStorage.getItem(DEVICE_ID_KEY); if(!id){id=crypto?.randomUUID?crypto.randomUUID():"sf-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2); localStorage.setItem(DEVICE_ID_KEY,id);} return id; }
    catch { return "sf-session-"+Math.random().toString(36).slice(2); }
  }
  function notificationsEnabled(){ try{return localStorage.getItem(NOTIFY_PREF_KEY)==="1";}catch{return false;} }
  async function enableNotifications(){
    if(!window.isSecureContext){showToast("⚠️ Les notifications nécessitent HTTPS.");return false;}
    if(!("Notification" in window)){showToast("Les notifications ne sont pas prises en charge par ce navigateur.");return false;}
    try { if("serviceWorker" in navigator) await navigator.serviceWorker.ready; } catch {}
    const p=Notification.permission==="granted"?"granted":await Notification.requestPermission();
    if(p!=="granted"){showToast("Autorise les notifications dans les réglages du téléphone.");return false;}
    try{localStorage.setItem(NOTIFY_PREF_KEY,"1");}catch{}
    updateNotificationButtons();showToast("🔔 Notifications activées sur ce téléphone.");return true;
  }
  function disableNotifications(){try{localStorage.setItem(NOTIFY_PREF_KEY,"0");}catch{} updateNotificationButtons();showToast("🔕 Notifications désactivées sur ce téléphone.");}
  function updateNotificationButtons(){
    const on=notificationsEnabled()&&("Notification" in window)&&Notification.permission==="granted";
    document.querySelectorAll(".notification-toggle").forEach(b=>{b.textContent=on?"🔔":"🔕";b.title=on?"Désactiver les notifications":"Activer les notifications";b.setAttribute("aria-pressed",on?"true":"false");});
  }
  async function toggleNotifications(){const on=notificationsEnabled()&&("Notification" in window)&&Notification.permission==="granted";if(on)disableNotifications();else await enableNotifications();}
  async function notifyPhone(title,body,tag="sunday-football"){
    if(!notificationsEnabled()||!("Notification" in window)||Notification.permission!=="granted")return;
    try{if("serviceWorker" in navigator){const r=await navigator.serviceWorker.ready;if(r?.showNotification){await r.showNotification(title,{body,tag,icon:"assets/icon-192.png",badge:"assets/icon-192.png",vibrate:[120,60,120],renotify:true});return;}}}catch{}
    try{new Notification(title,{body,tag,icon:"assets/icon-192.png"});}catch{}
  }
  async function handleTournamentNotification(n){
    const ids=Array.isArray(n?.team_ids)?n.team_ids:[];
    const myRows=await readMyRegistrations();
    const myNames=new Set(myRows.filter(r=>r.status==="approved").map(r=>String(r.name||"").trim().toLocaleLowerCase()));
    const teamIds=ids.map(Number).filter(Number.isInteger);
    let shouldNotify=!teamIds.length;
    if(teamIds.length&&state?.teams){
      shouldNotify=teamIds.some(id=>(state.teams[id]?.players||[]).some(p=>myNames.has(playerDisplayName(p).toLocaleLowerCase())));
    }
    if(shouldNotify) await notifyPhone(String(n.title||"Sunday Football"),String(n.body||""),"tournament-event");
  }
  async function pollTournamentNotifications(){
    if(!supabaseClient||!notificationsEnabled()) return;
    try{
      const {data,error}=await supabaseClient.from("tournament_notifications").select("id,event_id,kind,title,body,team_ids,created_at").eq("event_id","current").order("created_at",{ascending:false}).limit(5);
      if(error||!Array.isArray(data)||!data.length) return;
      const rows=[...data].reverse();
      for(const n of rows){
        if(tournamentNotificationLastId===null){tournamentNotificationLastId=n.id;continue;}
        if(n.id===tournamentNotificationLastId) continue;
        await handleTournamentNotification(n);
        tournamentNotificationLastId=n.id;
      }
    }catch(error){console.warn("Tournament notification poll:",error?.message||error);}
  }
  async function subscribeTournamentNotifications(){
    if(!supabaseClient)return;
    if(!tournamentNotificationChannel){
      tournamentNotificationChannel=supabaseClient.channel("sf-tournament-notifications")
        .on("postgres_changes",{event:"INSERT",schema:"public",table:"tournament_notifications",filter:"event_id=eq.current"},async payload=>{
          const n=payload.new||{};
          tournamentNotificationLastId=n.id||tournamentNotificationLastId;
          await handleTournamentNotification(n);
        }).subscribe(status=>{
          if(status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") console.warn("Tournament notification realtime:",status);
        });
    }
    if(!tournamentNotificationPollTimer){
      tournamentNotificationLastId=null;
      await pollTournamentNotifications();
      tournamentNotificationPollTimer=setInterval(()=>pollTournamentNotifications(),8000);
    }
  }
  function stopTournamentNotifications(){
    if(tournamentNotificationChannel&&supabaseClient){try{supabaseClient.removeChannel(tournamentNotificationChannel);}catch{}}
    tournamentNotificationChannel=null;
    if(tournamentNotificationPollTimer){clearInterval(tournamentNotificationPollTimer);tournamentNotificationPollTimer=null;}
    tournamentNotificationLastId=null;
  }

  function startRegistrationStatusWatch(){clearInterval(registrationStatusTimer);if(accessMode!=="registration")return;registrationStatusTimer=setInterval(()=>{if(document.visibilityState==="visible")refreshMyRegistrationStatus(true).catch(()=>{});},20000);}
  function stopRegistrationStatusWatch(){clearInterval(registrationStatusTimer);registrationStatusTimer=null;}

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
    if (!supabaseClient) return { is_open: false, team_count: 6, players_per_team: 7 };
    const extended = await supabaseClient
      .from(REG_SETTINGS_TABLE)
      .select("id,is_open,team_count,players_per_team,priority_cities,updated_at")
      .eq("id", REG_ROW_ID)
      .maybeSingle();
    if (!extended.error) return extended.data || { is_open: false, team_count: 6, players_per_team: 7 };

    // Compatibility with an older database until the V7.8 migration is executed.
    const fallback = await supabaseClient
      .from(REG_SETTINGS_TABLE)
      .select("id,is_open,priority_cities,updated_at")
      .eq("id", REG_ROW_ID)
      .maybeSingle();
    if (fallback.error) { console.error("Registration settings read error", extended.error); return { is_open: false, team_count: 6, players_per_team: 7 }; }
    return { ...(fallback.data || {}), team_count: 6, players_per_team: 7 };
  }


  async function readPriorityCities() {
    if (!supabaseClient) return [];
    const { data, error } = await supabaseClient
      .from(REG_SETTINGS_TABLE)
      .select("priority_cities")
      .eq("id", REG_ROW_ID)
      .maybeSingle();
    if (error) { console.error("Priority cities read error", error); return []; }
    return Array.isArray(data?.priority_cities) ? data.priority_cities : [];
  }

  function cityMatchesPriority(city, priorityCities) {
    const c=String(city||"").trim().toLocaleLowerCase();
    return !!c && (priorityCities||[]).some(x=>String(x||"").trim().toLocaleLowerCase()===c);
  }

  async function savePriorityCities(cities) {
    if (accessMode !== "admin") return false;
    if (!(await ensureAdminSession())) return false;
    const clean=[...new Set((cities||[]).map(c=>String(c||"").trim()).filter(Boolean))];
    const { error }=await supabaseClient.from(REG_SETTINGS_TABLE)
      .update({priority_cities:clean,updated_at:new Date().toISOString()})
      .eq("id",REG_ROW_ID);
    if(error){showToast(`Erreur Supabase: ${error.message}`);return false;}
    return true;
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

  async function readAllowedPlayers() {
    if (!supabaseClient) return [];
    const { data, error } = await supabaseClient
      .from(REG_ALLOWED_TABLE)
      .select("id,event_id,name,city,priority,active,created_at")
      .eq("event_id", REG_ROW_ID)
      .eq("active", true)
      .order("priority", { ascending: false })
      .order("created_at", { ascending: true });
    if (error) { console.error("Allowed players read error", error); return []; }
    return Array.isArray(data) ? data : [];
  }

  async function readAllAllowedPlayersAdmin() {
    if (!supabaseClient || accessMode !== "admin") return [];
    const { data, error } = await supabaseClient
      .from(REG_ALLOWED_TABLE)
      .select("id,event_id,name,city,priority,active,created_at")
      .eq("event_id", REG_ROW_ID)
      .eq("active", true)
      .order("name", { ascending: true });
    if (error) { console.error("Allowed players admin read error", error); showToast(`Erreur Supabase: ${error.message}`); return []; }
    return Array.isArray(data) ? data : [];
  }

  function renderPublicAllowedPlayerSelect(players, selectedId = "") {
    const input = document.getElementById("registrationNameSearch");
    const hidden = els.registrationName;
    const results = document.getElementById("registrationNameResults");
    if (!input || !hidden || !results) return;

    const list = Array.isArray(players) ? players : [];
    let currentId = String(selectedId || "");
    hidden.value = currentId;
    const selected = list.find(p => String(p.id) === currentId);
    input.value = selected ? String(selected.name || "") : "";

    const paint = () => {
      const query = String(input.value || "").trim().toLocaleLowerCase();
      const filtered = query
        ? list.filter(p => String(p.name || "").toLocaleLowerCase().startsWith(query))
        : list;
      const limited = filtered;
      results.innerHTML = limited.length
        ? limited.map(p => `<button type="button" class="registration-name-option ${String(p.id) === currentId ? "selected" : ""}" data-registration-player-id="${escapeHtml(p.id)}"><strong>${escapeHtml(p.name)}</strong>${p.city ? `<span class="registration-city-label">📍 ${escapeHtml(p.city)}</span>` : ""}</button>`).join("")
        : `<div class="registration-name-empty">Aucun nom correspondant.</div>`;

      results.querySelectorAll("[data-registration-player-id]").forEach(btn => {
        btn.addEventListener("click", () => {
          const person = list.find(p => String(p.id) === String(btn.dataset.registrationPlayerId));
          if (!person) return;
          currentId = String(person.id);
          hidden.value = currentId;
          input.value = String(person.name || "");
          results.innerHTML = `<button type="button" class="registration-name-option selected">✓ ${escapeHtml(person.name)}</button>`;
          const selectedLabel = document.getElementById("registrationSelectedName");
          if (selectedLabel) {
            selectedLabel.textContent = `✓ Nom sélectionné : ${person.name}`;
            selectedLabel.classList.remove("hidden");
          }
          document.getElementById("registrationNoNameMessage")?.classList.add("hidden");
          if (els.registerPlayerBtn) els.registerPlayerBtn.disabled = false;
        });
      });
    };

    input.disabled = list.length === 0;
    if (els.registerPlayerBtn) els.registerPlayerBtn.disabled = list.length === 0 || !currentId;
    document.getElementById("registrationNoNameMessage")?.classList.toggle("hidden", list.length > 0);

    input.oninput = () => {
      currentId = "";
      hidden.value = "";
      document.getElementById("registrationSelectedName")?.classList.add("hidden");
      paint();
      if (els.registerPlayerBtn) els.registerPlayerBtn.disabled = true;
    };
    paint();
  }

  async function readRegistrations() {
    if (!supabaseClient) return [];
    const { data, error } = await supabaseClient
      .from(REG_TABLE)
      .select("id,name,city,status,priority,allowed_player_id,device_id,created_at")
      .eq("event_id", REG_ROW_ID)
      .order("created_at", { ascending: true });
    if (error) { console.error("Registrations read error", error); return []; }
    return Array.isArray(data) ? data : [];
  }

  async function readMyRegistrations(){
    if(!supabaseClient)return[];
    const deviceId=getRegistrationDeviceId();
    const rpc=await supabaseClient.rpc("get_my_registration_status",{p_event_id:REG_ROW_ID,p_device_id:deviceId});
    if(!rpc.error) return Array.isArray(rpc.data)?rpc.data:[];
    const {data,error}=await supabaseClient.from(REG_TABLE).select("id,name,city,status,priority,allowed_player_id,device_id,created_at").eq("event_id",REG_ROW_ID).eq("device_id",deviceId).order("created_at",{ascending:false});
    if(error){console.error("My registrations read error",error);return[];} return Array.isArray(data)?data:[];
  }
  async function refreshMyRegistrationStatus(announce=false){
    const target=document.getElementById("myRegistrationStatus"); if(!target||!supabaseClient)return;
    const rows=await readMyRegistrations();
    if(!rows.length){target.innerHTML='<span class="muted small">Aucune demande enregistrée sur ce téléphone.</span>';return;}
    let prev={};try{prev=JSON.parse(localStorage.getItem("sf_registration_status_cache")||"{}");}catch{}
    const next={};
    target.innerHTML=rows.map(r=>{const s=r.status||"pending";next[r.id]=s;const label=s==="approved"?"✅ Accepté":s==="rejected"?"❌ Refusé":"⏳ En attente";const cls=s==="approved"?"status-approved":s==="rejected"?"status-rejected":"status-pending";return `<div class="my-status-row ${cls}"><div><strong>${escapeHtml(r.name)}</strong>${r.city?` <span class="registration-city-label">📍 ${escapeHtml(r.city)}</span>`:""}</div><span>${label}</span></div>`;}).join("");
    if(announce)for(const r of rows)if(prev[r.id]&&prev[r.id]!==r.status){const msg=r.status==="approved"?"Ton inscription pour dimanche est confirmée.":r.status==="rejected"?"Ta demande d'inscription a été refusée.":"Le statut de ton inscription a changé.";await notifyPhone("Sunday Football",`${r.name} — ${msg}`,`registration-${r.id}`);}
    try{localStorage.setItem("sf_registration_status_cache",JSON.stringify(next));}catch{}
  }
  function registrationNames(rows) {
    return (rows || []).filter(r => (r?.status || "approved") === "approved").map(r => String(r?.name || "").trim()).filter(Boolean);
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
        <span><strong>${i + 1}.</strong> ${escapeHtml(r.name)}${r.city ? ` <span class="registration-city-label">📍 ${escapeHtml(r.city)}</span>` : ""}</span>
        ${accessMode === "admin" ? `<button type="button" class="danger-small" data-delete-registration="${escapeHtml(r.id)}">✕</button>` : ""}
      </div>`).join("");

  }

  async function renderRegistrationAdmin() {
    if (accessMode !== "admin" || !els.registrationAdminContent) return;
    const settings = await readRegistrationSettings();
    const rows = await readRegistrations();
    const allowedPlayers = await readAllAllowedPlayersAdmin();
    const pending = rows.filter(r => (r.status || "pending") === "pending");
    const approved = rows.filter(r => (r.status || "approved") === "approved");
    const rejected = rows.filter(r => (r.status || "pending") === "rejected");
    const priority = approved.filter(r => !!r.priority);
    const defaultTeams = [2,3,4,5,6].includes(Number(settings.team_count)) ? Number(settings.team_count) : 6;
    const defaultPlayers = [5,6,7].includes(Number(settings.players_per_team)) ? Number(settings.players_per_team) : 7;

    els.registrationAdminContent.innerHTML = `
      <div class="registration-admin-card registration-admin-page-card">
        <div class="registration-admin-head">
          <div>
            <strong>📝 Gestion des inscriptions</strong>
            <p class="muted small">Les joueurs prioritaires sont acceptés immédiatement. Les autres demandes restent en attente et sont traitées par l’administrateur dans l’ordre d’arrivée.</p>
          </div>
          <span class="registration-status ${settings.is_open ? "open" : "closed"}">${settings.is_open ? "🟢 Ouvertes" : "🔴 Fermées"}</span>
        </div>

        <div class="registration-admin-actions registration-admin-actions-main">
          <button id="toggleRegistrationBtn" class="${settings.is_open ? "secondary" : "primary"}">${settings.is_open ? "🔒 Fermer les demandes" : "📝 Ouvrir les demandes"}</button>
          <button id="clearRegistrationsBtn" class="secondary">🧹 Vider la liste</button>
        </div>

        <div class="registration-admin-add allowed-list-admin">
          <div class="section-title">📋 Liste des joueurs autorisés</div>
          <p class="muted small">Seuls les noms de cette liste peuvent envoyer une demande. L'administrateur contrôle entièrement cette liste.</p>
          <div class="registration-add-row">
            <input id="adminAddAllowedName" maxlength="60" placeholder="Nom / prénom autorisé">
            <input id="adminAddAllowedCity" maxlength="60" placeholder="Ville">
            <label class="priority-check"><input id="adminAddAllowedPriority" type="checkbox"> ⭐ Prioritaire</label>
            <button id="adminAddAllowedBtn" class="primary">＋ Ajouter à la liste</button>
          </div>
          <div class="allowed-list-toggle-row">
            <span class="muted small">${allowedPlayers.length} joueur${allowedPlayers.length>1?"s":""} autorisé${allowedPlayers.length>1?"s":""}</span>
            <button type="button" class="secondary small-btn" id="toggleAllowedListBtn">👁️ Afficher la liste</button>
          </div>
          <div class="allowed-player-admin-list allowed-list-collapsed" id="allowedPlayerAdminList">
            ${allowedPlayers.length ? allowedPlayers.map(p => `
              <div class="registration-admin-row allowed-row">
                <div class="allowed-admin-main">
                  <div class="allowed-person-display">
                    <strong>${escapeHtml(p.name)}</strong>${p.city ? `<span class="registration-city-label">📍 ${escapeHtml(p.city)}</span>` : ''}
                  </div>
                  ${p.priority ? '<span class="priority-badge">⭐ PRIORITAIRE</span>' : ''}
                </div>
                <div class="registration-row-actions">
                  <button type="button" class="secondary small-btn" data-edit-allowed-person="${escapeHtml(p.id)}" data-person-name="${escapeHtml(p.name)}" data-person-city="${escapeHtml(p.city||'')}">✏️ Modifier</button>
                  <button type="button" class="secondary small-btn" data-toggle-allowed-priority="${escapeHtml(p.id)}">${p.priority ? '☆ Retirer priorité' : '⭐ Prioritaire'}</button>
                  <button type="button" class="danger-small" data-delete-allowed="${escapeHtml(p.id)}">🗑️ Supprimer</button>
                </div>
              </div>`).join('') : `<div class="muted small">La liste autorisée est vide. Ajoute les personnes que vous connaissez avant d'ouvrir les inscriptions.</div>`}
          </div>
        </div>


        <div class="registration-section-block priority-city-admin">
          <div class="section-title">📍 Villes prioritaires</div>
          <p class="muted small">Choisis une ou plusieurs villes. Les personnes dont la ville correspond seront <strong>acceptées automatiquement</strong> lors de leur inscription. Cette règle est invisible pour les visiteurs.</p>
          <div class="priority-city-add">
            <input id="priorityCityInput" maxlength="60" placeholder="Exemple : Sens">
            <button id="addPriorityCityBtn" class="secondary">＋ Ajouter la ville</button>
          </div>
          <div id="priorityCityList" class="priority-city-list"></div>
        </div>

        <div class="registration-stats-grid">
          <div class="registration-stat"><strong>${approved.length}/${getRegistrationCapacity(settings)}</strong><span>joueurs approuvés</span></div>
          <div class="registration-stat pending"><strong>${pending.length}</strong><span>demandes en attente</span></div>
          <div class="registration-stat priority"><strong>${priority.length}</strong><span>prioritaires</span></div>
        </div>

        <div class="registration-admin-add">
          <div class="section-title">⭐ Ajouter directement un joueur connu</div>
          <div class="registration-add-row">
            <input id="adminAddRegistrationName" maxlength="60" placeholder="Nom / prénom">
            <input id="adminAddRegistrationCity" maxlength="60" placeholder="Ville">
            <label class="priority-check"><input id="adminAddRegistrationPriority" type="checkbox"> ⭐ Prioritaire</label>
            <button id="adminAddRegistrationBtn" class="primary">＋ Ajouter</button>
          </div>
          <p class="muted small">Un joueur ajouté ici est immédiatement approuvé. C'est pratique pour les personnes que vous connaissez déjà.</p>
        </div>

        <div class="registration-plan-box">
          <div class="section-title">⚙️ Organisation des équipes</div>
          <div class="grid two">
            <label>Nombre d'équipes
              <select id="registrationTeamCount">
                <option value="2" ${defaultTeams===2?'selected':''}>2 équipes</option>
                <option value="3" ${defaultTeams===3?'selected':''}>3 équipes</option>
                <option value="4" ${defaultTeams===4?'selected':''}>4 équipes</option>
                <option value="5" ${defaultTeams===5?'selected':''}>5 équipes</option>
                <option value="6" ${defaultTeams===6?'selected':''}>6 équipes</option>
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
          <button id="saveRegistrationPlanBtn" class="secondary full">💾 Enregistrer la configuration pour dimanche</button>
        </div>

        <div class="registration-section-block">
          <div class="section-title">⏳ Demandes à traiter <span class="badges">${pending.length}</span></div>
          <div id="pendingRegistrationList">
            ${pending.length ? pending.map((r, i) => `
              <div class="registration-admin-row pending-row">
                <div><strong>${escapeHtml(r.name)}</strong>${r.city ? `<div class="muted tiny">📍 ${escapeHtml(r.city)}</div>` : ""}<div class="muted tiny">Demande ${i + 1} · ${new Date(r.created_at).toLocaleString('fr-FR')}</div></div>
                <div class="registration-row-actions">
                  <button type="button" class="primary small-btn" data-approve-registration="${escapeHtml(r.id)}">✅ Accepter</button>
                  <button type="button" class="danger-small" data-reject-registration="${escapeHtml(r.id)}">✕ Refuser</button>
                </div>
              </div>`).join("") : `<div class="muted small">Aucune demande en attente.</div>`}
          </div>
        </div>

        <div class="registration-section-block">
          <div class="section-title">🟢 Joueurs approuvés <span class="badges">${approved.length}/${getRegistrationCapacity(settings)}</span></div>
          <div id="approvedRegistrationList">
            ${approved.length ? approved.map((r, i) => `
              <div class="registration-admin-row approved-row ${r.priority ? "priority-row" : ""}">
                <div><strong>${i + 1}. ${escapeHtml(r.name)}</strong>${r.city ? `<div class="muted tiny">📍 ${escapeHtml(r.city)}</div>` : ""}${r.priority ? '<span class="priority-badge">⭐ PRIORITAIRE</span>' : ''}</div>
                <div class="registration-row-actions">
                  <button type="button" class="secondary small-btn" data-toggle-priority="${escapeHtml(r.id)}">${r.priority ? "☆ Retirer priorité" : "⭐ Prioritaire"}</button>
                  <button type="button" class="danger-small" data-delete-registration="${escapeHtml(r.id)}">🗑️</button>
                </div>
              </div>`).join("") : `<div class="muted small">Aucun joueur approuvé.</div>`}
          </div>
        </div>

        ${rejected.length ? `<div class="registration-section-block"><div class="section-title">🚫 Refusées <span class="badges">${rejected.length}</span></div><div>${rejected.map(r => `<div class="registration-admin-row"><strong>${escapeHtml(r.name)}</strong><button type="button" class="secondary small-btn" data-reapprove-registration="${escapeHtml(r.id)}">↩ Réexaminer</button></div>`).join("")}</div></div>` : ""}

        <div class="registration-next-action">
          <button id="createTeamsFromRegistrationsBtn" class="primary full">👥 Préparer les équipes</button>
          <p class="muted small">Cette étape prépare les équipes. Ensuite, choisis un capitaine par équipe et lance le tirage au sort.</p>
        </div>
      </div>`;

    document.getElementById("toggleAllowedListBtn")?.addEventListener("click",()=>{
      const list=document.getElementById("allowedPlayerAdminList"),btn=document.getElementById("toggleAllowedListBtn");
      if(!list||!btn)return;const hidden=list.classList.toggle("allowed-list-collapsed");btn.textContent=hidden?"👁️ Afficher la liste":"🙈 Masquer la liste";
    });
    const updatePlanInfo = () => {
      const { teamCount, playersPerTeam } = getRegistrationPlan();
      const min = teamCount * 5, max = teamCount * 7;
      const info = document.getElementById("registrationPlanInfo");
      if (!info) return;
      const err = validateRegistrationPlan(approved.length, teamCount, playersPerTeam);
      info.textContent = err ? `⚠️ ${err}` : `✓ ${approved.length} approuvés : ${teamCount} équipes de ${playersPerTeam} joueurs (capacité ${min}–${max}).`;
    };
    document.getElementById("registrationTeamCount")?.addEventListener("change", updatePlanInfo);
    document.getElementById("registrationPlayersPerTeam")?.addEventListener("change", updatePlanInfo);
    updatePlanInfo();

    document.getElementById("saveRegistrationPlanBtn")?.addEventListener("click", async () => {
      const teamCount = Number(document.getElementById("registrationTeamCount")?.value || 0);
      const playersPerTeam = Number(document.getElementById("registrationPlayersPerTeam")?.value || 0);
      if (![2,3,4,5,6].includes(teamCount) || ![5,6,7].includes(playersPerTeam)) {
        showToast("Choisis un nombre d'équipes entre 2 et 6 et 5 à 7 joueurs par équipe.");
        return;
      }
      const capacity = teamCount * playersPerTeam;
      if (approved.length > capacity) {
        showToast(`Impossible : ${approved.length} joueurs sont déjà approuvés, alors que cette configuration prévoit ${capacity} joueurs.`);
        return;
      }
      if (!(await ensureAdminSession())) return;
      const { error } = await supabaseClient.from(REG_SETTINGS_TABLE).update({
        team_count: teamCount,
        players_per_team: playersPerTeam,
        updated_at: new Date().toISOString()
      }).eq("id", REG_ROW_ID);
      if (error) { showToast(`Erreur Supabase: ${error.message}`); return; }
      showToast(`✓ Dimanche : ${teamCount} équipes de ${playersPerTeam} joueurs (${capacity} places).`);
      await renderRegistrationAdmin();
    });

    const renderPriorityCitiesAdmin = async () => {
      const cities = await readPriorityCities();
      const box = document.getElementById("priorityCityList");
      if (!box) return;
      box.innerHTML = cities.length
        ? cities.map(city => `<span class="priority-city-chip">📍 ${escapeHtml(city)} <button type="button" data-remove-priority-city="${escapeHtml(city)}">×</button></span>`).join("")
        : `<span class="muted small">Aucune ville prioritaire.</span>`;
      box.querySelectorAll("[data-remove-priority-city]").forEach(btn => btn.addEventListener("click", async () => {
        const next=cities.filter(c=>c.toLocaleLowerCase()!==String(btn.dataset.removePriorityCity).toLocaleLowerCase());
        if (await savePriorityCities(next)) {
          await renderPriorityCitiesAdmin();
          await renderRegistrationAdmin();
          showToast("✓ Ville retirée des priorités.");
        }
      }));
    };
    await renderPriorityCitiesAdmin();

    document.getElementById("addPriorityCityBtn")?.addEventListener("click", async () => {
      const input=document.getElementById("priorityCityInput");
      const city=String(input?.value||"").trim().replace(/\s+/g," ");
      if (!city) { showToast("Saisis une ville."); return; }
      const cities=await readPriorityCities();
      if (!cities.some(c=>c.toLocaleLowerCase()===city.toLocaleLowerCase())) cities.push(city);
      if (await savePriorityCities(cities)) {
        // Apply the new city rule immediately to known people and their existing requests.
        const allowedAll=await readAllAllowedPlayersAdmin();
        for (const person of allowedAll) {
          if (String(person.city||"").trim().toLocaleLowerCase()===city.toLocaleLowerCase()) {
            await supabaseClient.from(REG_ALLOWED_TABLE).update({priority:true}).eq("id",person.id).eq("event_id",REG_ROW_ID);
          }
        }
        const { data: regs }=await supabaseClient.from(REG_TABLE).select("id,allowed_player_id,city,name,status").eq("event_id",REG_ROW_ID);
        for (const r of (regs||[])) {
          if (String(r.city||"").trim().toLocaleLowerCase()===city.toLocaleLowerCase() && r.status==="pending") {
            await supabaseClient.from(REG_TABLE).update({status:"approved",priority:true}).eq("id",r.id).eq("event_id",REG_ROW_ID);
          }
        }
        input.value="";
        await renderPriorityCitiesAdmin();
        await renderRegistrationAdmin();
        showToast(`✓ ${city} est maintenant prioritaire.`);
      }
    });

    document.getElementById("toggleRegistrationBtn")?.addEventListener("click", async () => {
      const next = !settings.is_open;
      if (next && approved.length >= getRegistrationCapacity(settings)) { showToast(`Les ${getRegistrationCapacity(settings)} places approuvées sont déjà complètes.`); return; }
      const ok = await writeRegistrationSettings(next);
      if (ok) { await renderRegistrationAdmin(); showToast(next ? "📝 Demandes ouvertes." : "🔒 Demandes fermées."); }
    });

    document.getElementById("clearRegistrationsBtn")?.addEventListener("click", async () => {
      if (!rows.length) { showToast("La liste est déjà vide."); return; }
      if (!confirm(`Supprimer toutes les demandes et inscriptions (${rows.length}) ?`)) return;
      if (!(await ensureAdminSession())) { showToast("🔐 Session administrateur expirée."); return; }
      const result = await supabaseClient.from(REG_TABLE).delete().eq("event_id", REG_ROW_ID);
      if (result.error) { showToast(`Erreur Supabase: ${result.error.message}`); return; }
      await renderRegistrationAdmin();
      showToast("✓ Liste vidée.");
    });

    document.getElementById("adminAddRegistrationBtn")?.addEventListener("click", async () => {
      if (!(await ensureAdminSession())) { showToast("🔐 Session administrateur expirée. Reconnecte-toi."); return; }
      const input = document.getElementById("adminAddRegistrationName");
      const name = String(input?.value || "").trim().replace(/\s+/g, " ");
      const isPriority = !!document.getElementById("adminAddRegistrationPriority")?.checked;
      const city = String(document.getElementById("adminAddRegistrationCity")?.value || "").trim();
      if (name.length < 2) { showToast("Entre un nom valide."); return; }
      if (approved.length >= getRegistrationCapacity(settings)) { showToast(`${getRegistrationCapacity(settings)} joueurs approuvés maximum.`); return; }
      const existingAllowed = allowedPlayers.find(p => p.active && String(p.name).trim().toLocaleLowerCase() === name.toLocaleLowerCase());
      let allowedId = existingAllowed?.id;
      if (!allowedId) {
        const { data: allowedRow, error: allowedError } = await supabaseClient
          .from(REG_ALLOWED_TABLE)
          .insert({ event_id: REG_ROW_ID, name, city, priority: isPriority || cityMatchesPriority(city, await readPriorityCities()), active: true })
          .select("id,name,priority,active")
          .single();
        if (allowedError) { showToast(`Erreur liste autorisée: ${allowedError.message}`); return; }
        allowedId = allowedRow.id;
      }
      const exists = rows.some(r => String(r.allowed_player_id || "") === String(allowedId) || String(r.name || "").trim().toLocaleLowerCase() === name.toLocaleLowerCase());
      if (exists) { showToast("Ce joueur est déjà dans les inscriptions."); return; }
      const { error } = await supabaseClient.from(REG_TABLE).insert({ event_id: REG_ROW_ID, allowed_player_id: allowedId, name, city, status: "approved", priority: isPriority || cityMatchesPriority(city, await readPriorityCities()) });
      if (error) { showToast(`Erreur Supabase: ${error.message}`); return; }
      await renderRegistrationAdmin();
      showToast(`✓ ${name} ajouté${isPriority ? " comme prioritaire" : ""}.`);
    });

    document.getElementById("adminAddAllowedBtn")?.addEventListener("click", async () => {
      const input = document.getElementById("adminAddAllowedName");
      const name = String(input?.value || "").trim().replace(/\s+/g, " ");
      const priorityValue = !!document.getElementById("adminAddAllowedPriority")?.checked;
      const city = String(document.getElementById("adminAddAllowedCity")?.value || "").trim();
      if (name.length < 2) { showToast("Entre un nom valide."); return; }
      const exists = allowedPlayers.some(p => String(p.name).trim().toLocaleLowerCase() === name.toLocaleLowerCase());
      if (exists) { showToast("Ce nom existe déjà dans la liste autorisée."); return; }
      const { error } = await supabaseClient.from(REG_ALLOWED_TABLE).insert({ event_id: REG_ROW_ID, name, city, priority: priorityValue || cityMatchesPriority(city, await readPriorityCities()), active: true });
      if (error) { showToast(`Erreur Supabase: ${error.message}`); return; }
      await renderRegistrationAdmin();
      showToast(`✓ ${name} ajouté à la liste autorisée.`);
    });

    els.registrationAdminContent.querySelectorAll("[data-edit-allowed-person]").forEach(btn => btn.addEventListener("click", async () => {
      const id = btn.dataset.editAllowedPerson;
      const currentName = btn.dataset.personName || "";
      const currentCity = btn.dataset.personCity || "";
      const name = prompt("Nom / prénom :", currentName);
      if (name === null) return;
      const cleanName = name.trim().replace(/\s+/g, " ");
      if (cleanName.length < 2) { showToast("Entre un nom valide."); return; }
      const city = prompt("Ville :", currentCity);
      if (city === null) return;
      const cleanCity = city.trim().replace(/\s+/g, " ");
      const cities = await readPriorityCities();
      const existing = await readAllAllowedPlayersAdmin();
      const duplicate = existing.find(p => String(p.id) !== String(id) && String(p.name).trim().toLocaleLowerCase() === cleanName.toLocaleLowerCase());
      if (duplicate) { showToast("Ce nom existe déjà dans la liste autorisée."); return; }
      const current = existing.find(p => String(p.id) === String(id));
      const priority = !!(current?.priority || cityMatchesPriority(cleanCity, cities));
      const { error } = await supabaseClient.from(REG_ALLOWED_TABLE).update({ name: cleanName, city: cleanCity, priority }).eq("id", id).eq("event_id", REG_ROW_ID);
      if (error) { showToast(`Erreur Supabase: ${error.message}`); return; }
      const regUpdate = { name: cleanName, city: cleanCity };
      if (priority) { regUpdate.priority = true; regUpdate.status = "approved"; }
      await supabaseClient.from(REG_TABLE).update(regUpdate).eq("allowed_player_id", id).eq("event_id", REG_ROW_ID).neq("status", "rejected");
      await renderRegistrationAdmin();
      showToast(`✓ ${cleanName} mis à jour.`);
    }));

    els.registrationAdminContent.querySelectorAll("[data-toggle-allowed-priority]").forEach(btn => btn.addEventListener("click", async () => {
      const row = allowedPlayers.find(p => p.id === btn.dataset.toggleAllowedPriority);
      if (!row) return;
      const { error } = await supabaseClient.from(REG_ALLOWED_TABLE).update({ priority: !row.priority }).eq("id", row.id).eq("event_id", REG_ROW_ID);
      if (error) { showToast(`Erreur Supabase: ${error.message}`); return; }
      await renderRegistrationAdmin();
    }));

    els.registrationAdminContent.querySelectorAll("[data-delete-allowed]").forEach(btn => btn.addEventListener("click", async () => {
      const row = allowedPlayers.find(p => p.id === btn.dataset.deleteAllowed);
      if (!row) return;
      if (!confirm(`Supprimer définitivement ${row.name} de la base de données ?\n\nSes éventuelles inscriptions seront également supprimées afin de pouvoir réajouter ce nom immédiatement.`)) return;
      const { error: regError } = await supabaseClient
        .from(REG_TABLE)
        .delete()
        .eq("event_id", REG_ROW_ID)
        .ilike("name", row.name);
      if (regError) { showToast(`Erreur suppression inscription: ${regError.message}`); return; }
      const { error } = await supabaseClient.from(REG_ALLOWED_TABLE).delete().eq("id", row.id).eq("event_id", REG_ROW_ID);
      if (error) { showToast(`Erreur suppression joueur: ${error.message}`); return; }
      await renderRegistrationAdmin();
      showToast(`✓ ${row.name} supprimé définitivement.`);
    }));

    els.registrationAdminContent.querySelectorAll("[data-approve-registration]").forEach(btn => btn.addEventListener("click", async () => {
      const row = rows.find(r => r.id === btn.dataset.approveRegistration);
      const allowed = row?.allowed_player_id ? allowedPlayers.find(p => p.id === row.allowed_player_id) : null;
      const { error } = await supabaseClient.from(REG_TABLE).update({ status: "approved", priority: !!allowed?.priority }).eq("id", btn.dataset.approveRegistration).eq("event_id", REG_ROW_ID);
      if (error) { showToast(`Erreur Supabase: ${error.message}`); return; }
      const current = await readRegistrations();
      if (current.filter(r => (r.status || "pending") === "approved").length >= getRegistrationCapacity(await readRegistrationSettings())) await writeRegistrationSettings(false);
      await renderRegistrationAdmin();
    }));

    els.registrationAdminContent.querySelectorAll("[data-reject-registration]").forEach(btn => btn.addEventListener("click", async () => {
      const { error } = await supabaseClient.from(REG_TABLE).update({ status: "rejected", priority: false }).eq("id", btn.dataset.rejectRegistration).eq("event_id", REG_ROW_ID);
      if (error) { showToast(`Erreur Supabase: ${error.message}`); return; }
      await renderRegistrationAdmin();
    }));

    els.registrationAdminContent.querySelectorAll("[data-reapprove-registration]").forEach(btn => btn.addEventListener("click", async () => {
      if (approved.length >= getRegistrationCapacity(settings)) { showToast(`${getRegistrationCapacity(settings)} joueurs approuvés maximum.`); return; }
      const { error } = await supabaseClient.from(REG_TABLE).update({ status: "pending" }).eq("id", btn.dataset.reapproveRegistration).eq("event_id", REG_ROW_ID);
      if (error) { showToast(`Erreur Supabase: ${error.message}`); return; }
      await renderRegistrationAdmin();
    }));

    els.registrationAdminContent.querySelectorAll("[data-toggle-priority]").forEach(btn => btn.addEventListener("click", async () => {
      const row = rows.find(r => r.id === btn.dataset.togglePriority);
      if (!row) return;
      const { error } = await supabaseClient.from(REG_TABLE).update({ priority: !row.priority }).eq("id", row.id).eq("event_id", REG_ROW_ID);
      if (error) { showToast(`Erreur Supabase: ${error.message}`); return; }
      await renderRegistrationAdmin();
    }));

    els.registrationAdminContent.querySelectorAll("[data-delete-registration]").forEach(btn => btn.addEventListener("click", async () => {
      const { error } = await supabaseClient.from(REG_TABLE).delete().eq("id", btn.dataset.deleteRegistration).eq("event_id", REG_ROW_ID);
      if (error) { showToast(`Erreur Supabase: ${error.message}`); return; }
      await renderRegistrationAdmin();
    }));

    document.getElementById("createTeamsFromRegistrationsBtn")?.addEventListener("click", prepareTeamsAndDrawFromRegistrations);
  }

  async function openRegistrationAdmin() {
    if (accessMode !== "admin") { showToast("🔒 Gestion réservée à l’administrateur."); return; }
    showOnly("registrationAdminScreen", true);
    await renderRegistrationAdmin();
    scheduleAdminIdleLogout();
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
    document.getElementById("publicMobileNav")?.classList.remove("hidden");
    if (!supabaseClient) initSupabase();
    const settings = await readRegistrationSettings();
    const remoteTournament = await remoteRead();
    if (remoteTournament) state = remoteTournament;
    const open = !!settings.is_open;
    const registrationCapacity = getRegistrationCapacity(settings);
    const registrationTeams = [2,3,4,5,6].includes(Number(settings.team_count)) ? Number(settings.team_count) : 6;
    els.registrationStatus.textContent = open
      ? `🟢 Les inscriptions sont ouvertes pour dimanche · ${registrationTeams} équipes · ${registrationCapacity} places maximum.`
      : "🔴 Les inscriptions sont fermées pour le moment.";
    els.registrationFormBox?.classList.toggle("hidden", !open);
    els.registrationClosedBox?.classList.toggle("hidden", open);
    const allowedPlayers = open ? await readAllowedPlayers() : [];
    if (els.registrationFeedback && !els.registrationFeedback.innerHTML.trim()) {
      els.registrationFeedback.classList.add("hidden");
    }
    renderPublicAllowedPlayerSelect(allowedPlayers);
    const rows = open ? await readRegistrations() : [];
    renderRegistrationList(rows);
    await refreshMyRegistrationStatus(false);
    startRegistrationStatusWatch();
    updateNotificationButtons();
    subscribeTournamentNotifications();
    subscribeRegistrationRealtime();
  }

  async function submitRegistration() {
    const allowedPlayerId = String(els.registrationName?.value || "").trim();
    const feedback = els.registrationFeedback;
    if (!allowedPlayerId) {
      showToast("Choisis ton nom dans la liste.");
      return;
    }
    if (!supabaseClient) initSupabase();

    const settings = await readRegistrationSettings();
    if (!settings.is_open) {
      showToast("Les inscriptions sont fermées.");
      await enterRegistrationMode();
      return;
    }

    const allowedPlayers = await readAllowedPlayers();
    const person = allowedPlayers.find(p => String(p.id) === allowedPlayerId);
    if (!person) {
      showToast("Ce nom n’est plus disponible. Actualise la liste.");
      await enterRegistrationMode();
      return;
    }

    const rows = await readRegistrations();
    const myRows=rows.filter(r=>String(r.device_id||"")===getRegistrationDeviceId()&&["approved","pending"].includes(r.status||"approved"));
    if(myRows.length>=2){showToast("📱 Ce téléphone a déjà atteint la limite de 2 inscriptions.");await refreshMyRegistrationStatus();return;}
    const activeRequests = rows.filter(r => ["approved", "pending"].includes(r.status || "approved"));
    const registrationCapacity = getRegistrationCapacity(settings);
    if (activeRequests.length >= registrationCapacity) {
      await writeRegistrationSettings(false);
      showToast(`La liste est complète : ${registrationCapacity} joueurs maximum.`);
      await enterRegistrationMode();
      return;
    }

    const exists = rows.some(r =>
      String(r.allowed_player_id || "") === allowedPlayerId ||
      String(r.name || "").trim().toLocaleLowerCase() === String(person.name || "").trim().toLocaleLowerCase()
    );
    if (exists) {
      const existing = rows.find(r =>
        String(r.allowed_player_id || "") === allowedPlayerId ||
        String(r.name || "").trim().toLocaleLowerCase() === String(person.name || "").trim().toLocaleLowerCase()
      );
      const alreadyAccepted = (existing?.status || "") === "approved";
      const message = alreadyAccepted
        ? "✅ Ton inscription est déjà confirmée."
        : "⏳ Ta demande est déjà enregistrée et attend la confirmation de l’administrateur.";
      if (feedback) {
        feedback.className = `registration-feedback ${alreadyAccepted ? "success" : "pending"}`;
        feedback.innerHTML = `<strong>${message}</strong>`;
      }
      showToast(message);
      return;
    }

    const { error } = await supabaseClient.from(REG_TABLE).insert({
      event_id: REG_ROW_ID,
      allowed_player_id: allowedPlayerId,
      name: person.name,
      city: person.city || "",
      status: person.priority ? "approved" : "pending",
      priority: !!person.priority,
      device_id: getRegistrationDeviceId()
    });

    if (error) {
      console.error("Registration insert error", error);
      showToast("Impossible de valider l'inscription. Réessaie dans un instant.");
      return;
    }

    const immediate = !!person.priority;
    if (feedback) {
      feedback.className = `registration-feedback ${immediate ? "success" : "pending"}`;
      feedback.innerHTML = immediate
        ? `<strong>✅ Inscription confirmée !</strong><p>Ton nom est prioritaire : ta participation pour dimanche est acceptée immédiatement.</p>`
        : `<strong>⏳ Demande envoyée — participation non encore confirmée.</strong><p>Ta demande est bien enregistrée. Elle sera traitée par l’administrateur dans l’ordre d’arrivée. Tu recevras la confirmation lorsque ta participation sera validée.</p>`;
    }

    els.registrationName.value = "";
    await enterRegistrationMode();
    // enterRegistrationMode refreshes the list but keeps the clear status message below.
    if (feedback) {
      feedback.className = `registration-feedback ${immediate ? "success" : "pending"}`;
      feedback.innerHTML = immediate
        ? `<strong>✅ Inscription confirmée !</strong><p>Ton nom est prioritaire : ta participation pour dimanche est acceptée immédiatement.</p>`
        : `<strong>⏳ Demande envoyée — participation non encore confirmée.</strong><p>Ta demande est bien enregistrée. Elle sera traitée par l’administrateur dans l’ordre d’arrivée. <strong>Je t’invite à revenir sur cette page dans quelques heures pour vérifier le statut de ta demande.</strong></p>`;
    }
    showToast(immediate ? "✅ Participation confirmée immédiatement." : "⏳ Demande envoyée — attente de confirmation.");
  }

  function registrationTeamPlan(count) {
    const n = Number(count) || 0;
    if (n < 10) return { valid: false, message: "Il faut au moins 10 joueurs pour créer une équipe de 2 équipes (minimum 5 par équipe)." };
    const teamCount = Math.min(6, Math.floor(n / 5));
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

  function getRegistrationCapacity(settings = null) {
    const teamCount = Number(settings?.team_count || 0);
    const playersPerTeam = Number(settings?.players_per_team || 0);
    if (![2,3,4,5,6].includes(teamCount) || ![5,6,7].includes(playersPerTeam)) return 42;
    return teamCount * playersPerTeam;
  }

  function validateRegistrationPlan(total, teamCount, playersPerTeam) {
    if (![2,3,4,5,6].includes(teamCount)) return "Choisis entre 2 et 6 équipes.";
    if (![5,6,7].includes(playersPerTeam)) return "Choisis entre 5 et 7 joueurs par équipe.";
    const min = teamCount * 5;
    const max = teamCount * 7;
    if (total < min) return `Il faut au moins ${min} joueurs pour ${teamCount} équipes.`;
    if (total > max) return `Il y a trop de joueurs pour ${teamCount} équipes : maximum ${max}.`;
    return "";
  }

  async function prepareTeamsAndDrawFromRegistrations() {
    if (accessMode !== "admin") { showToast("🔒 Action réservée à l’administrateur."); return; }
    const rows = await readRegistrations();
    const approvedRows = rows.filter(r => (r.status || "approved") === "approved");
    const names = approvedRows.map(r => String(r.name || "").trim()).filter(Boolean);
    const { teamCount, playersPerTeam } = getRegistrationPlan();
    const planError = validateRegistrationPlan(names.length, teamCount, playersPerTeam);
    if (planError) { showToast(planError); return; }

    if (state?.history?.length || state?.matchStarted || state?.matchNumber > 1) {
      showToast("Un tournoi est déjà commencé. Termine-le avant de refaire la préparation.");
      return;
    }

    const teams = Array.from({ length: teamCount }, (_, i) => ({
      id: "team_" + i, name: defaultNames[i] || `Équipe ${i + 1}`,
      color: defaultColors[i % defaultColors.length], captain: "", players: [], image: "",
      wins: 0, draws: 0, losses: 0, points: 0, goalsFor: 0, goalsAgainst: 0
    }));

    state = createEmptyState(teams, 5);
    state.queue = teams.map((_, i) => i);
    state.captains = [];
    saveState();
    migrateTeamColors();
    showTeamManagementPage();
    showToast(`✓ ${names.length} joueurs prêts. Choisis un capitaine par équipe, puis lance le tirage.`);
  }

  async function drawRegisteredPlayers() {
    if(accessMode!=="admin"||!state){showToast("🔒 Action réservée à l’administrateur.");return;}
    if(state.history?.length||state.matchStarted||state.matchNumber>1){showToast("Le tirage est disponible avant le début du premier match.");return;}

    const rows=await readRegistrations(),names=registrationNames(rows);
    if(!names.length){showToast("Aucun joueur inscrit.");return;}
    const plan=getRegistrationPlan(),planError=validateRegistrationPlan(names.length,plan.teamCount,plan.playersPerTeam);
    if(planError){showToast(planError);return;}
    if(!state.teams?.length||state.teams.length!==plan.teamCount){showToast(`Le tournoi doit avoir ${plan.teamCount} équipes.`);return;}

    const uiCaptains = state.teams.map((_,i)=>String(document.querySelector(`[data-captain-team="${i}"]`)?.value||"").trim());
    const captains = uiCaptains.every(Boolean) ? uiCaptains : state.teams.map((_,i)=>String(state.captains?.[i]||"").trim());
    if(captains.some(c=>!c)){showToast("🧢 Choisis un capitaine pour chaque équipe avant le tirage.");return;}
    state.captains = captains;
    if(new Set(captains.map(x=>x.toLocaleLowerCase())).size!==captains.length){showToast("⚠️ Chaque équipe doit avoir un capitaine différent.");return;}

    const approvedMap=new Map(names.map(n=>[n.toLocaleLowerCase(),n]));
    const captainNames=captains.map(c=>approvedMap.get(c.toLocaleLowerCase())||c);
    if(captainNames.some(c=>!approvedMap.has(c.toLocaleLowerCase()))){showToast("⚠️ Un capitaine choisi n’est plus dans les joueurs approuvés.");return;}
    if(!confirm(`Placer les ${captains.length} capitaines en premier, puis tirer au sort les ${Math.max(0,names.length-captains.length)} autres joueurs ?`))return;

    const remaining=names.filter(n=>!captainNames.some(c=>c.toLocaleLowerCase()===n.toLocaleLowerCase()));
    const shuffled=shuffleArray([...remaining]);
    const rosters=state.teams.map((_,i)=>[captainNames[i]]);
    let cursor=0;
    while(cursor<shuffled.length){
      let placed=false;
      for(let i=0;i<rosters.length;i++){
        if(rosters[i].length<plan.playersPerTeam&&cursor<shuffled.length){rosters[i].push(shuffled[cursor++]);placed=true;}
      }
      if(!placed)break;
    }
    while(cursor<shuffled.length){
      const target=rosters.map((p,i)=>({i,n:p.length})).sort((a,b)=>a.n-b.n)[0];
      if(!target||target.n>=7)break;
      rosters[target.i].push(shuffled[cursor++]);
    }
    state.teams.forEach((team,i)=>team.players=rosters[i]);
    state.captains=captainNames;
    saveState();renderGame();renderManageTeams();refreshCaptainSelection();
    showToast("🎲 Tirage terminé : capitaines placés en premier, puis joueurs répartis aléatoirement.");
  }

  async function applyRegistrationTeamPlan() {
    if (accessMode !== "admin") return;
    const rows = await readRegistrations();
    const total = rows.filter(r => (r.status || "approved") === "approved").length;
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
      .on("postgres_changes", { event: "*", schema: "public", table: REG_ALLOWED_TABLE, filter: "event_id=eq.current" }, async () => {
        if (accessMode === "registration") await enterRegistrationMode();
        if (accessMode === "admin" && !els.registrationAdminScreen?.classList.contains("hidden")) await renderRegistrationAdmin();
      })
      .subscribe();
  }

  function subscribeRealtime() {
    if (!supabaseClient || realtimeChannel) return;
    realtimeChannel = supabaseClient.channel("sunday-football-live")
      .on("postgres_changes", { event: "*", schema: "public", table: SF_TABLE, filter: "id=eq.current" }, payload => {
        if (accessMode !== "live" && accessMode !== "publicTeams") return;
        const incoming = payload.new?.state;
        if (!incoming) return;
        state = incoming;
        if (accessMode === "live") renderLive();
        else renderPublicTeams();
      })
      .subscribe(status => {
        const el = document.getElementById("liveConnection");
        if (el) el.textContent = status === "SUBSCRIBED" ? "🟢 En direct" : "Connexion live : " + status;
      });
  }

  function clearAdminIdleTimer() {
    if (adminIdleTimer) { clearTimeout(adminIdleTimer); adminIdleTimer = null; }
  }

  function scheduleAdminIdleLogout() {
    clearAdminIdleTimer();
    if (accessMode !== "admin") return;
    adminIdleTimer = setTimeout(async () => {
      adminIdleTimer = null;
      if (accessMode !== "admin") return;
      showToast("🔐 Session administrateur expirée après 30 min d’inactivité.");
      if (supabaseClient) {
        try { await supabaseClient.auth.signOut(); } catch (error) { console.error(error); }
      }
      accessMode = "none";
      showAccess();
    }, ADMIN_IDLE_TIMEOUT_MS);
  }

  function bindAdminActivity() {
    if (adminActivityBound) return;
    adminActivityBound = true;
    const activity = () => {
      if (accessMode === "admin") scheduleAdminIdleLogout();
    };
    ["pointerdown", "keydown", "touchstart", "click"].forEach(eventName => {
      document.addEventListener(eventName, activity, { passive: true });
    });
  }

  function showOnly(screenId, admin = false) {
    const ids = [
      "accessScreen", "registrationScreen", "publicTeamsScreen", "liveScreen", "dashboardPage",
      "setupScreen", "registrationAdminScreen", "gameScreen", "manageTeamsPanel", "finalScreen"
    ];
    ids.forEach(id => document.getElementById(id)?.classList.add("hidden"));
    els.appTopbar?.classList.toggle("hidden", !admin);
    document.getElementById("mobileBottomNav")?.classList.toggle("hidden", !admin);
    document.getElementById("publicMobileNav")?.classList.add("hidden");
    document.getElementById(screenId)?.classList.remove("hidden");
  }

  async function restoreAdminSession() {
    if (!supabaseClient) initSupabase();
    if (!supabaseClient) { showAccess(); return; }
    try {
      const { data } = await supabaseClient.auth.getSession();
      if (data?.session?.user?.email === window.SF_SUPABASE?.adminEmail) {
        accessMode = "admin";
        const remote = await remoteRead();
        if (remote) { state = remote; migrateTeamColors(); }
        else { const local = loadState(); if (local) { state = local; migrateTeamColors(); } }
        bindAdminActivity();
        scheduleAdminIdleLogout();
        showDashboard();
        return;
      }
    } catch (error) { console.error("Session restore error", error); }
    showAccess();
  }

  function showAccess() {
    stopTimer();
    stopRegistrationStatusWatch();
    stopTournamentNotifications();
    clearAdminIdleTimer();
    if (liveTimerId) { clearInterval(liveTimerId); liveTimerId = null; }
    accessMode = "none";
    document.getElementById("publicMobileNav")?.classList.add("hidden");
    showOnly("accessScreen", false);
    document.getElementById("adminLoginBox")?.classList.add("hidden");
    const msg = document.getElementById("loginMessage");
    if (msg) msg.textContent = "";
  }

  function playerDisplayName(player) {
    return typeof player === "string" ? player : String(player?.name || "").trim();
  }

  function renderPublicTeams() {
    const root = els.publicTeamsContent;
    if (!root) return;
    if (!state || !Array.isArray(state.teams) || !state.teams.length) {
      root.innerHTML = `<div class="card public-empty-card"><div class="public-empty-icon">👥</div><h3>Les équipes ne sont pas encore préparées</h3><p class="muted">L’administrateur préparera les équipes après la clôture des inscriptions.</p></div>`;
      return;
    }

    const cards = state.teams.map((team, index) => {
      const players = Array.isArray(team.players) ? team.players.map(playerDisplayName).filter(Boolean) : [];
      const color = getTeamColor(team, index);
      const readable = color.toLowerCase() === "#f8fafc" || color.toLowerCase() === "#eab308" ? "#111827" : "#fff";
      return `<article class="public-team-card" style="--team-color:${escapeHtml(color)};--team-ink:${readable}">
        <div class="public-team-header">
          <span class="team-color-dot" style="background:${escapeHtml(color)}"></span>
          <h3>${escapeHtml(team.name)}</h3>
          <span class="team-player-count">${players.length} joueur${players.length > 1 ? "s" : ""}</span>
        </div>
        <div class="public-team-jersey">${teamJerseyHtml(team,index)}</div>
        <div class="public-team-players">
          ${players.length
            ? players.map((name,i)=>`<div class="public-player-row"><span class="public-player-number">${i+1}</span><span>${escapeHtml(name)}</span></div>`).join("")
            : `<div class="muted small">Aucun joueur affecté pour le moment.</div>`}
        </div>
      </article>`;
    }).join("");

    root.innerHTML = `<div class="public-teams-board">${cards}</div>`;
  }

  async function enterPublicTeamsMode() {
    accessMode = "publicTeams";
    stopTimer();
    document.getElementById("publicMobileNav")?.classList.remove("hidden");
    if (liveTimerId) { clearInterval(liveTimerId); liveTimerId = null; }
    if (!supabaseClient) initSupabase();
    showOnly("publicTeamsScreen", false);
    const remote = await remoteRead();
    state = remote;
    renderPublicTeams();
    subscribeRealtime();
  }

  function renderLive() {
    const root = document.getElementById("liveContent");
    if (!root) return;
    if (!state || !Array.isArray(state.teams)) {
      root.innerHTML = `<div class="card"><h3>Aucun tournoi en cours</h3><p class="muted">L'administrateur n'a pas encore démarré le tournoi.</p></div>`;
      return;
    }
    const team = id => state.teams[id];
    let matchHtml = "";
    if (state.phase === "complete" || state.tournamentWinnerId !== null) {
      const w = team(state.tournamentWinnerId);
      matchHtml = `<div class="card live-card tournament-finished-card">
        <span class="live-status tournament-finished-status">TOURNOI TERMINÉ</span>
        <div class="final-dashboard">
          <div class="trophy">🏆</div>
          ${teamImageHtml(w,"winner-logo")}
          <div class="winner-name" style="color:${getTeamColor(w, state.tournamentWinnerId || 0)}">${escapeHtml(w?.name || "Champion")}</div>
          <p class="muted">Champion du tournoi</p>
        </div>
      </div>`;
    } else {
      matchHtml = `<div class="card live-card"><span class="live-status">${state.phase === "league" ? "PHASE DE CLASSEMENT" : "PHASE FINALE"}</span>`;
    }
    if (state.phase !== "complete" && state.tournamentWinnerId === null && state.phaseMatch && state.phase !== "league") {
      const m=state.phaseMatch, a=team(m.a), b=team(m.b);
      const phaseName=state.phase === "playoff" ? "MATCH ÉLIMINATOIRE" : state.phase === "semifinal" ? "DEMI-FINALE" : "FINALE";
      matchHtml += `<div class="live-team-head"><div class="muted small">${phaseName}</div></div><div class="live-time" id="liveTimer">${formatTime(state.phaseSecondsLeft)}</div><div class="live-score"><div class="live-team"><div class="live-jersey">${teamJerseyHtml(a,m.a)}</div><strong style="color:${getTeamColor(a, m.a)}">${escapeHtml(a?.name || "—")}</strong><div class="score">${m.scoreA}</div><div class="live-scorers">⚽ ${scorerSummary(m.scorersA)}</div></div><div class="live-vs">VS</div><div class="live-team"><div class="live-jersey">${teamJerseyHtml(b,m.b)}</div><strong style="color:${getTeamColor(b, m.b)}">${escapeHtml(b?.name || "—")}</strong><div class="score">${m.scoreB}</div><div class="live-scorers">⚽ ${scorerSummary(m.scorersB)}</div></div></div><p class="muted">${state.phaseMatchStarted ? "🟢 Match en cours" : "⏸️ Match préparé — en attente du démarrage"}</p>`;
    } else if (state.active) {
      const a=team(state.active.a), b=team(state.active.b);
      matchHtml += `<div class="live-team-head"><div class="muted small">MATCH #${state.matchNumber}</div></div><div class="live-time" id="liveTimer">${formatTime(state.secondsLeft)}</div><div class="live-score"><div class="live-team"><div class="live-jersey">${teamJerseyHtml(a,state.active.a)}</div><strong style="color:${getTeamColor(a, state.active.a)}">${escapeHtml(a?.name || "—")}</strong><div class="score">${state.scoreA}</div><div class="live-scorers">⚽ ${scorerSummary(state.scorersA)}</div></div><div class="live-vs">VS</div><div class="live-team"><div class="live-jersey">${teamJerseyHtml(b,state.active.b)}</div><strong style="color:${getTeamColor(b, state.active.b)}">${escapeHtml(b?.name || "—")}</strong><div class="score">${state.scoreB}</div><div class="live-scorers">⚽ ${scorerSummary(state.scorersB)}</div></div></div>`;
      matchHtml += `<p class="muted">${state.matchStarted ? "🟢 Match en cours" : "⏸️ Match préparé — en attente du démarrage"}</p>`;
    } else {
      matchHtml += `<h3>Pas de match en cours</h3>`;
    }
    if (state.phase !== "complete" && state.tournamentWinnerId === null) matchHtml += `</div>`;

    // Once the final is finished, the live page becomes a simple result page:
    // no stale match, no queue, no old timer.
    if (state.phase === "complete" || state.tournamentWinnerId !== null) {
      const final=state.finalResult, fa=final?team(final.winnerId):null, fb=final?team(final.loserId):null;
      const finalCard=final?`<div class="card live-card final-result-card"><div class="section-title">🏆 Résultat de la finale</div><div class="final-result-teams"><strong style="color:${getTeamColor(fa,final.winnerId)}">${escapeHtml(fa?.name||"—")}</strong><span class="final-result-score">${final.scoreA} - ${final.scoreB}</span><strong style="color:${getTeamColor(fb,final.loserId)}">${escapeHtml(fb?.name||"—")}</strong></div></div>`:"";
      const ranking=sortedTeams().map((t,i)=>`<div class="rank-item"><strong>${i+1}. ${escapeHtml(t.name)}</strong><span class="badges">${t.points} pts · ${t.wins}V · ${t.draws}N · ${t.losses}D</span></div>`).join("");
      const scorers=getScorerRanking().map(([name,goals],i)=>`<div class="rank-item"><strong>${i+1}. ${escapeHtml(name)}</strong><span class="badges">${goals} but${goals>1?"s":""}</span></div>`).join("");
      const teamTable=state.teams.map((t,i)=>`<div class="public-final-team"><div><span class="team-color-dot" style="background:${getTeamColor(t,i)}"></span><strong>${escapeHtml(t.name)}</strong></div><span class="badges">${Array.isArray(t.players)?t.players.length:0} joueurs</span></div>`).join("");
      root.innerHTML=matchHtml+finalCard+`<div class="grid two"><div class="card live-card"><div class="section-title">🏆 Classement final</div>${ranking}</div><div class="card live-card"><div class="section-title">⚽ Buteurs</div>${scorers||`<p class="muted">Aucun buteur.</p>`}</div></div><div class="card live-card"><div class="section-title">👥 Équipes</div>${teamTable}</div>`;
      renderMobileLivePages(root);
      if(liveTimerId){clearInterval(liveTimerId);liveTimerId=null;}
      return;
    }

    const ranking = sortedTeams().map((t,i)=>`<div class="rank-item public-rank-item" style="--team-color:${getTeamColor(t,i)}"><div class="row-left"><span class="rank-position">${i+1}</span>${teamJerseyHtml(t,i,"public-rank-jersey")}<strong style="color:${getTeamColor(t,i)}">${escapeHtml(t.name)}</strong></div><span class="badges">${t.points} pts · ${t.wins}V · ${t.draws}N · ${t.losses}D</span></div>`).join("");
    const scorers = getScorerRanking().map(([name,goals],i)=>`<div class="rank-item public-scorer-item"><div class="row-left"><span class="rank-position">${i+1}</span><span>⚽</span><strong>${escapeHtml(name)}</strong></div><span class="badges">${goals} but${goals>1?"s":""}</span></div>`).join("");
    const queue = (state.queue||[]).map((id,i)=>`<div class="rank-item public-rank-item" style="--team-color:${getTeamColor(team(id),id)}"><div class="row-left"><span class="rank-position">${i+1}</span>${teamJerseyHtml(team(id),id,"public-rank-jersey")}<strong style="color:${getTeamColor(team(id),id)}">${escapeHtml(team(id)?.name||"—")}</strong></div><span class="badges">À venir</span></div>`).join("");
    const teamCards = state.teams.map((t,i)=>`<div class="public-dashboard-team" style="--team-color:${getTeamColor(t,i)}">${teamJerseyHtml(t,i,"public-dashboard-jersey")}<strong>${escapeHtml(t.name)}</strong><span>${Array.isArray(t.players)?t.players.length:0} joueurs</span></div>`).join("");
    const currentMatchMarkup = matchHtml;
    root.innerHTML = `
      <div class="public-live-hero">
        <div class="public-live-hero-top"><div><span class="live-status live-now-pill">● EN DIRECT</span><h2>Sunday Football</h2><p>Suivez le tournoi en temps réel</p></div><div class="public-hero-ball">⚽</div></div>
        ${currentMatchMarkup}
      </div>
      <div class="public-dashboard-team-strip">${teamCards}</div>
      <div class="grid two public-dashboard-grid">
        <div class="card live-card public-dashboard-card"><div class="section-title">🏆 Classement</div>${ranking || `<p class="muted">Aucun classement.</p>`}</div>
        <div class="card live-card public-dashboard-card"><div class="section-title">⚽ Meilleurs buteurs</div>${scorers || `<p class="muted">Aucun buteur.</p>`}</div>
      </div>
      <div class="card live-card public-dashboard-card"><div class="section-title">📋 Prochaines équipes</div><div class="live-list">${queue || `<p class="muted">Aucune équipe en attente.</p>`}</div></div>
      <div class="card live-card public-dashboard-card"><div class="section-title">📜 Matchs terminés</div>${(state.history||[]).slice().reverse().map(h=>`<div class="history-item"><strong>#${h.number}</strong><span>${escapeHtml(h.text)}</span></div>`).join("") || `<p class="muted">Aucun match terminé.</p>`}</div>`;
    if (liveTimerId) clearInterval(liveTimerId);
    if (state.phase !== "complete" && state.tournamentWinnerId === null && state.active?.matchStarted) {
      let remaining = Number(state.secondsLeft)||0;
      liveTimerId=setInterval(()=>{ remaining=Math.max(0,remaining-1); const t=document.getElementById("liveTimer"); if(t)t.textContent=formatTime(remaining); },1000);
    }
    renderMobileLivePages(root);
  }

  function renderMobileLivePages(root){
    if(!root||!state?.teams)return;
    const team=id=>state.teams[id];
    const color=(t,i)=>getTeamColor(t,i);
    const active=state.active ? {a:team(state.active.a),b:team(state.active.b)} : null;
    const remaining=formatTime(state.phase!=="league"?state.phaseSecondsLeft:state.secondsLeft);
    const scorersA=Array.isArray(state.scorersA)?state.scorersA:[];
    const scorersB=Array.isArray(state.scorersB)?state.scorersB:[];
    const scorerRows=[
      ...scorersA.map(n=>({name:playerDisplayName(n),team:active?.a?.name||"Équipe A",side:"a"})),
      ...scorersB.map(n=>({name:playerDisplayName(n),team:active?.b?.name||"Équipe B",side:"b"}))
    ];
    const scorerHtml=scorerRows.length?scorerRows.map((x,i)=>`<div class="mobile-live-scorer-row"><div class="mobile-live-scorer-icon">⚽</div><div class="mobile-live-scorer-main"><strong>${escapeHtml(x.name)}</strong><small style="color:${color(x.side==='a'?active?.a:active?.b,0)}">${escapeHtml(x.team)}</small></div><span class="mobile-live-scorer-minute">${i+1}</span></div>`).join(""):`<div class="mobile-live-empty">Aucun buteur pour le moment.</div>`;
    const ranking=sortedTeams().map((t,i)=>`<div class="mobile-live-list-row"><span class="mobile-rank">${i+1}</span>${teamJerseyHtml(t,i,"mobile-live-jersey")}<div><strong style="color:${color(t,i)}">${escapeHtml(t.name)}</strong><small>${t.points} pts · ${t.wins}V · ${t.draws}N · ${t.losses}D</small></div></div>`).join("");
    const history=(state.history||[]).slice().reverse().map(h=>`<div class="mobile-live-history-row"><span>#${h.number}</span><div>${escapeHtml(h.text)}</div></div>`).join("");
    const queue=(state.queue||[]).map((id,i)=>`<div class="mobile-live-next-row"><span class="mobile-next-number">${i+1}</span>${teamJerseyHtml(team(id),id,"mobile-next-jersey")}<div><strong style="color:${color(team(id),id)}">${escapeHtml(team(id)?.name||"—")}</strong><small>${i===0?"Prochaine équipe à entrer":"Position "+(i+1)}</small></div></div>`).join("");
    const teams=state.teams.map((t,i)=>`<article class="mobile-live-team-card">${teamJerseyHtml(t,i,"mobile-team-big-jersey")}<strong style="color:${color(t,i)}">${escapeHtml(t.name)}</strong><span>${Array.isArray(t.players)?t.players.length:0} joueurs</span><div class="mobile-team-player-list">${(t.players||[]).map((p,j)=>`<div>${j+1}. ${escapeHtml(playerDisplayName(p))}</div>`).join("")||`<span class="muted">Aucun joueur</span>`}</div></article>`).join("");
    const matchTitle=active?`${escapeHtml(active.a?.name||"—")} <span>VS</span> ${escapeHtml(active.b?.name||"—")}`:"Pas de match en cours";
    const score=active?`${state.scoreA} <span>—</span> ${state.scoreB}`:"0 <span>—</span> 0";
    const status=state.matchStarted?"Match en cours":"Match préparé — en attente du démarrage";
    const current=`<div class="mobile-live-hero-card">
      <div class="mobile-live-hero-glow"></div>
      <div class="mobile-live-status-row"><span class="live-status live-now-pill">● EN DIRECT</span><span class="mobile-live-match-no">MATCH #${state.matchNumber||1}</span></div>
      <div class="mobile-live-faceoff">
        <div class="mobile-live-team-side"><div class="mobile-live-jersey-box" style="--team-color:${color(active?.a,0)}">${active?.a?teamJerseyHtml(active.a,state.active.a,"mobile-live-main-jersey"):"⚽"}</div><strong style="color:${color(active?.a,0)}">${escapeHtml(active?.a?.name||"—")}</strong><small>Équipe A</small></div>
        <div class="mobile-live-score-center"><div class="mobile-live-score">${score}</div><div class="mobile-live-timer">${remaining}</div><span>${status}</span></div>
        <div class="mobile-live-team-side"><div class="mobile-live-jersey-box" style="--team-color:${color(active?.b,1)}">${active?.b?teamJerseyHtml(active.b,state.active.b,"mobile-live-main-jersey"):"⚽"}</div><strong style="color:${color(active?.b,1)}">${escapeHtml(active?.b?.name||"—")}</strong><small>Équipe B</small></div>
      </div>
      <div class="mobile-live-progress"><span style="width:${Math.max(0,Math.min(100,((Number(state.settings?.matchMinutes||5)*60-(Number(state.secondsLeft)||0))/(Number(state.settings?.matchMinutes||5)*60))*100))}%"></span></div>
    </div>`;
    const mobile=`<div class="mobile-live-pages">
      <section class="mobile-live-page is-active" data-live-page="live">
        ${current}
        <div class="mobile-live-stats-row"><div><strong>${state.teams.length}</strong><small>équipes</small></div><div><strong>${state.history?.length||0}</strong><small>matchs finis</small></div><div><strong>${sortedTeams()[0]?.name||"—"}</strong><small>leader</small></div></div>
        <div class="card mobile-live-section"><div class="mobile-section-heading"><span><i class="fa-solid fa-futbol"></i> Buteurs du match</span><small>${scorerRows.length} but${scorerRows.length!==1?"s":""}</small></div>${scorerHtml}</div>
        <div class="card mobile-live-section"><div class="mobile-section-heading"><span><i class="fa-solid fa-forward-step"></i> Prochaine équipe</span><small>Rotation</small></div>${queue?queue.split("</div>").slice(0,1).join("")+"</div>":`<div class="mobile-live-empty">Aucune équipe en attente.</div>`}</div>
        <div class="card mobile-live-section notification-panel"><div class="mobile-section-heading"><span><i class="fa-solid fa-bell"></i> Notifications</span></div><button type="button" class="primary full mobile-notification-btn">${notificationsEnabled()?"🔔 Notifications activées":"🔔 Activer les notifications"}</button><button type="button" class="secondary full mobile-test-notification-btn">🔔 Tester une notification</button><p class="muted small">Les annonces de buts et de changements de matchs sont envoyées en temps réel lorsque les notifications sont autorisées.</p></div>
      </section>
      <section class="mobile-live-page" data-live-page="ranking"><div class="card mobile-live-section"><div class="mobile-section-heading"><span><i class="fa-solid fa-trophy"></i> Classement</span></div>${ranking||`<div class="mobile-live-empty">Aucun classement.</div>`}</div></section>
      <section class="mobile-live-page" data-live-page="history"><div class="card mobile-live-section"><div class="mobile-section-heading"><span><i class="fa-solid fa-clock-rotate-left"></i> Historique</span></div>${history||`<div class="mobile-live-empty">Aucun match terminé.</div>`}</div></section>
      <section class="mobile-live-page" data-live-page="field"><div class="card mobile-live-section"><div class="mobile-section-heading"><span><i class="fa-solid fa-futbol"></i> Prochaines équipes</span></div>${queue||`<div class="mobile-live-empty">Aucune équipe en attente.</div>`}</div></section>
      <section class="mobile-live-page" data-live-page="teams"><div class="mobile-live-team-grid">${teams}</div></section>
    </div>`;
    root.innerHTML=`<div class="live-desktop-layer">${root.innerHTML}</div>${mobile}`;
    document.querySelectorAll("#liveMobileBottomNav [data-live-view]").forEach(btn=>{
      btn.onclick=(event)=>{event.preventDefault();event.stopPropagation();root.querySelectorAll(".mobile-live-page").forEach(p=>p.classList.toggle("is-active",p.dataset.livePage===btn.dataset.liveView));document.querySelectorAll("#liveMobileBottomNav button").forEach(b=>b.classList.toggle("active",b===btn));window.scrollTo({top:0,behavior:"smooth"});};
    });
    root.querySelectorAll(".mobile-notification-btn").forEach(btn=>btn.onclick=toggleNotifications);
    root.querySelectorAll(".mobile-test-notification-btn").forEach(btn=>btn.onclick=async()=>{if(!(await enableNotifications()))return;await notifyPhone("Sunday Football","Test de notification réussi. ⚽","test-notification");showToast("🔔 Notification de test envoyée.");});
    updateNotificationButtons();
  }

  async function enterLiveMode() {
    stopRegistrationStatusWatch();
    accessMode="live";
    stopTimer();
    document.getElementById("publicMobileNav")?.classList.add("hidden");
    document.getElementById("adminLoginBox")?.classList.add("hidden");
    showOnly("liveScreen", false);
    if (!supabaseClient) initSupabase();
    const remote=await remoteRead();
    state=remote;
    renderLive();
    subscribeTournamentNotifications();
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
    bindAdminActivity();
    scheduleAdminIdleLogout();
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
    if (!state.manualFirstOrder) shuffleArray(state.queue);
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
    const winnerMessage=`Fin de match : ${winner.name} a gagné ${state.scoreA}-${state.scoreB} contre ${loser.name}. ${winner.name} reste sur le terrain.`;
    notifyPhone("Fin de match",winnerMessage,"match-result").catch(()=>{});
    if(supabaseClient){
      supabaseClient.from("tournament_notifications").insert({event_id:"current",kind:"match_result",title:"Fin de match",body:winnerMessage,team_ids:[winnerId,loserId]})
        .then(({error})=>{if(error)console.warn("Notification event:",error.message);});
    }
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

    const drawMessage=`Fin de match : égalité ${a.name} ${state.scoreA}-${state.scoreB} ${b.name}. Les deux équipes sortent.`;
    notifyPhone("Fin de match",drawMessage,"match-result").catch(()=>{});
    if(supabaseClient){
      supabaseClient.from("tournament_notifications").insert({event_id:"current",kind:"match_result",title:"Fin de match",body:drawMessage,team_ids:[aId,bId]})
        .then(({error})=>{if(error)console.warn("Notification event:",error.message);});
    }

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

    if (state.phase === "complete" || state.tournamentWinnerId !== null) {
      els.preMatchCard.classList.add("hidden");
      els.activeMatchCard.classList.add("hidden");
      document.querySelectorAll("#gameScreen .stats-grid").forEach(el => el.classList.add("hidden"));
    } else {
      document.querySelectorAll("#gameScreen .stats-grid").forEach(el => el.classList.remove("hidden"));
    }

    if (state.active && state.phase !== "complete" && state.tournamentWinnerId === null) {
      const preA = state.teams[state.active.a];
      const preB = state.teams[state.active.b];
      els.preTeamA.innerHTML = `${teamJerseyHtml(preA,state.active.a,"pre-team-jersey")}<span>${escapeHtml(preA?.name || "—")}</span>`;
      els.preTeamB.innerHTML = `${teamJerseyHtml(preB,state.active.b,"pre-team-jersey")}<span>${escapeHtml(preB?.name || "—")}</span>`;
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

      els.teamAName.innerHTML = `${teamJerseyHtml(a,state.active.a,"admin-match-jersey")}<span>${escapeHtml(a.name)}</span>`;
      els.teamBName.innerHTML = `${teamJerseyHtml(b,state.active.b,"admin-match-jersey")}<span>${escapeHtml(b.name)}</span>`;
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
      els.winABtn.textContent = `🏆 ${a?.name || "Équipe A"} gagne`;
      els.winBBtn.textContent = `🏆 ${b?.name || "Équipe B"} gagne`;
      els.goalABtn.textContent = `⚽ But — ${a?.name || "Équipe A"}`;
      els.goalBBtn.textContent = `⚽ But — ${b?.name || "Équipe B"}`;
      els.drawBtn.textContent = `🤝 Égalité — ${a?.name || "Équipe A"} / ${b?.name || "Équipe B"} — ${state.settings.matchMinutes} min`;
    } else {
      els.teamAName.innerHTML = `<span>—</span>`;
      els.teamBName.innerHTML = `<span>—</span>`;
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
          return `<div class="queue-item" style="--team-color:${escapeHtml(getTeamColor(t,id))}">
            <div class="row-left"><span class="queue-num">${index + 1}</span>${teamJerseyHtml(t,id,"queue-jersey")}<strong style="color:${getTeamColor(t,id)}">${escapeHtml(t.name)}</strong></div>
            <span class="badges">${t.points} pts</span>
          </div>`;
        }).join("")
      : `<div class="muted">Aucune équipe en attente.</div>`;

    els.rankingList.innerHTML = sortedTeams().map((t, i) =>
      `<div class="rank-item" style="--team-color:${escapeHtml(getTeamColor(t,i))}">
        <div class="row-left"><span class="rank-position">${i + 1}</span>${teamJerseyHtml(t,i,"rank-jersey")}<strong style="color:${getTeamColor(t,i)}">${escapeHtml(t.name)}</strong></div>
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


  async function getApprovedRegistrationNames() {
    try {
      const rows = await readRegistrations();
      return rows.filter(r => (r.status || "approved") === "approved")
        .map(r => String(r.name || "").trim()).filter(Boolean)
        .filter((name,i,arr)=>arr.findIndex(x=>x.toLocaleLowerCase()===name.toLocaleLowerCase())===i);
    } catch (error) {
      console.error("Captain list error", error);
      return [];
    }
  }

  function renderCaptainSelection(names = null) {
    const root=document.getElementById("captainsSelection");
    if(!root||!state?.teams)return;
    const options=Array.isArray(names)?names:Array.from(new Set(state.teams.flatMap(t=>Array.isArray(t.players)?t.players.map(playerDisplayName):[]).filter(Boolean)));
    const captains=Array.isArray(state.captains)?state.captains:[];
    root.innerHTML=`<div class="captain-grid">${state.teams.map((team,index)=>{
      const current=captains[index]||"";
      const opts=[`<option value="">— Choisir le capitaine —</option>`].concat(options.map(name=>`<option value="${escapeHtml(name)}" ${name===current?"selected":""}>${escapeHtml(name)}</option>`));
      return `<label class="captain-select-wrap"><span><span class="team-color-dot" style="background:${getTeamColor(team,index)}"></span> Capitaine — ${escapeHtml(team.name)}</span><select class="captain-select" data-captain-team="${index}">${opts.join("")}</select></label>`;
    }).join("")}</div>`;
  }

  async function refreshCaptainSelection() {
    const names=await getApprovedRegistrationNames();
    const all=Array.from(new Set([...names,...state.teams.flatMap(t=>Array.isArray(t.players)?t.players.map(playerDisplayName):[])].filter(Boolean)));
    renderCaptainSelection(all);
  }

  function renderManageTeams() {
    if (!state || accessMode !== "admin" || !els.manageTeamsContent) return;

    if ((!Array.isArray(state.queue) || state.queue.length === 0) && !state.active) {
      state.queue = state.teams.map((_, i) => i);
    }
    const order = state.queue.slice();

    const orderHtml = order.length ? order.map((id, pos) => {
      const team = state.teams[id];
      return `<div class="manage-order-row" style="--team-color:${getTeamColor(team,id)}">
        <span class="queue-num">${pos + 1}</span>
        ${teamJerseyHtml(team,id,"manage-order-jersey")}
        <strong style="color:${getTeamColor(team,id)}">${escapeHtml(team?.name || "—")}</strong>
        <div class="manage-order-actions">
          <button type="button" class="secondary icon-order" data-queue-up="${id}" ${pos===0?"disabled":""}>↑</button>
          <button type="button" class="secondary icon-order" data-queue-down="${id}" ${pos===order.length-1?"disabled":""}>↓</button>
        </div>
      </div>`;
    }).join("") : `<p class="muted small">Aucune équipe dans la file d'attente.</p>`;

    els.manageTeamsContent.innerHTML = `
      <div class="manage-control-card">
        <div class="section-title">➕ Ajouter une équipe</div>
        <p class="muted small">Tu peux ajouter une équipe sans créer un nouveau tournoi. Elle rejoindra la file d'attente.</p>
        <div class="manage-add-team-grid">
          <input id="manageNewTeamName" maxlength="40" placeholder="Nom de l'équipe">
          <select id="manageNewTeamColor">${teamColorOptions("Rouge")}</select>
          <input id="manageNewTeamPlayers" class="wide" maxlength="180" placeholder="5 à 7 joueurs, séparés par des virgules">
          <button type="button" class="primary" id="addManageTeamBtn">＋ Ajouter l'équipe</button>
        </div>
      </div>

      <div class="manage-control-card">
        <div class="section-title">📋 Ordre des prochaines équipes</div>
        <p class="muted small">Déplace les équipes avec ↑ ↓. L'ordre est conservé et utilisé pour les prochains matchs. Pour le premier match, le premier choix est respecté.</p>
        <div class="manage-order-list">${orderHtml}</div>
      </div>

      ${state.teams.map((team, teamIndex) => {
        const players = Array.isArray(team.players) ? team.players : [];
        return `
          <div class="manage-team-card" data-manage-team="${teamIndex}" style="--team-color:${getTeamColor(team, teamIndex)}">
            <div class="manage-team-head">
              <div class="manage-team-title">
                <span class="team-color-dot" style="background:${getTeamColor(team, teamIndex)}"></span>
                ${teamJerseyHtml(team,teamIndex,"manage-team-jersey")}
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
              <label class="manage-team-name manage-points-field">
                <span>Points</span>
                <input class="manage-points-input" type="number" min="0" step="1" data-team-points="${teamIndex}" value="${Number(team.points)||0}">
              </label>
            </div>

            <div class="manage-player-list" data-manage-player-list="${teamIndex}">
              ${players.length ? players.map((player, playerIndex) => `
                <div class="manage-player-row">
                  <span class="player-number">${playerIndex + 1}</span>
                  <input class="manage-player-input" data-player-name="${teamIndex}:${playerIndex}" value="${escapeHtml(player)}" maxlength="60">
                  <select class="manage-player-team-select" data-player-team="${teamIndex}:${playerIndex}" title="Déplacer le joueur">
                    ${state.teams.map((targetTeam,targetIndex)=>`<option value="${targetIndex}" ${targetIndex===teamIndex?"selected":""}>${escapeHtml(targetTeam.name)}</option>`).join("")}
                  </select>
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
      }).join("")}
    `;

    renderCaptainSelection();

    document.getElementById("addManageTeamBtn")?.addEventListener("click", () => {
      if (state.phase === "complete" || state.tournamentWinnerId !== null) {
        showToast("🏁 Le tournoi est terminé. Crée un nouveau tournoi pour ajouter une équipe.");
        return;
      }
      const nameInput=document.getElementById("manageNewTeamName");
      const colorInput=document.getElementById("manageNewTeamColor");
      const playersInput=document.getElementById("manageNewTeamPlayers");
      const name=(nameInput?.value||"").trim();
      const players=(playersInput?.value||"").split(",").map(v=>v.trim()).filter(Boolean);
      if (!name) { showToast("⚠️ Saisis le nom de l'équipe."); return; }
      if (players.length < 5 || players.length > 7) {
        showToast("⚠️ Une équipe doit avoir entre 5 et 7 joueurs.");
        return;
      }
      if (state.teams.some(t=>String(t.name||"").trim().toLocaleLowerCase()===name.toLocaleLowerCase())) {
        showToast("⚠️ Une équipe porte déjà ce nom.");
        return;
      }
      const newId = state.teams.reduce((max,t)=>Math.max(max,Number(t.id)||0),-1)+1;
      const newTeam={id:newId,name,color:colorInput?.value||"Rouge",captain:"",players,wins:0,draws:0,losses:0,points:0,goalsFor:0,goalsAgainst:0,image:""};
      state.teams.push(newTeam);
      if (!Array.isArray(state.queue)) state.queue=[];
      if (!state.active) state.queue=state.teams.map((_,i)=>i);
      else state.queue.push(state.teams.length-1);
      state.manualFirstOrder=true;
      saveState();
      renderManageTeams();
      renderGame();
      showToast(`✓ ${name} a été ajoutée à la file d'attente.`);
    });

    els.manageTeamsContent.querySelectorAll("[data-queue-up]").forEach(btn => btn.addEventListener("click", () => {
      const id=Number(btn.dataset.queueUp);
      const idx=state.queue.indexOf(id);
      if (idx>0) {
        [state.queue[idx-1],state.queue[idx]]=[state.queue[idx],state.queue[idx-1]];
        state.manualFirstOrder=true;
        saveState(); renderManageTeams(); renderGame();
      }
    }));
    els.manageTeamsContent.querySelectorAll("[data-queue-down]").forEach(btn => btn.addEventListener("click", () => {
      const id=Number(btn.dataset.queueDown);
      const idx=state.queue.indexOf(id);
      if (idx>=0 && idx<state.queue.length-1) {
        [state.queue[idx+1],state.queue[idx]]=[state.queue[idx],state.queue[idx+1]];
        state.manualFirstOrder=true;
        saveState(); renderManageTeams(); renderGame();
      }
    }));

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
    if(accessMode!=="admin"||!state){showToast("🔒 Action réservée à l’administrateur.");return;}
    els.manageTeamsContent.querySelectorAll("[data-team-name]").forEach(input=>{
      const i=Number(input.dataset.teamName); if(state.teams[i]){const n=input.value.trim();if(n)state.teams[i].name=n;}
    });
    els.manageTeamsContent.querySelectorAll("[data-team-color]").forEach(select=>{
      const i=Number(select.dataset.teamColor); if(state.teams[i])state.teams[i].color=getTeamColor({color:select.value},i);
    });
    els.manageTeamsContent.querySelectorAll("[data-team-points]").forEach(input=>{
      const i=Number(input.dataset.teamPoints);
      if(state.teams[i]) state.teams[i].points=Math.max(0,Number(input.value)||0);
    });

    const next=state.teams.map(()=>[]);
    for(const input of [...els.manageTeamsContent.querySelectorAll("[data-player-name]")]){
      const [origRaw,pidxRaw]=String(input.dataset.playerName).split(":");
      const orig=Number(origRaw),pidx=Number(pidxRaw);
      const target=Number(els.manageTeamsContent.querySelector(`[data-player-team="${orig}:${pidx}"]`)?.value??orig);
      const name=input.value.trim();
      if(name&&next[target])next[target].push(name);
    }
    const tooMany=next.findIndex(p=>p.length>7);
    if(tooMany>=0){showToast(`⚠️ Équipe ${state.teams[tooMany].name} dépasse 7 joueurs.`);return;}
    const tooFew=next.findIndex(p=>p.length<5);
    if(tooFew>=0){showToast(`⚠️ Équipe ${state.teams[tooFew].name} doit avoir au moins 5 joueurs.`);return;}
    state.teams.forEach((team,i)=>team.players=next[i]);

    const selected=state.teams.map((_,i)=>String(els.manageTeamsContent.querySelector(`[data-captain-team="${i}"]`)?.value||"").trim());
    const nonEmpty=selected.filter(Boolean);
    if(new Set(nonEmpty.map(x=>x.toLocaleLowerCase())).size!==nonEmpty.length){showToast("⚠️ Un même joueur ne peut pas être capitaine de plusieurs équipes.");return;}
    state.captains=selected;

    const firstTournamentLaunch = !state.active && !state.history?.length && Number(state.matchNumber || 0) === 0;
    if (firstTournamentLaunch && (!Array.isArray(state.queue) || state.queue.length === 0)) {
      state.queue = state.teams.map((_, i) => i);
    }
    state.manualFirstOrder = true;
    saveState();

    if (firstTournamentLaunch) {
      if (state.teams.length < 2) { showToast("⚠️ Il faut au moins 2 équipes."); return; }
      startFirstMatch();
      showToast("⚽ Tournoi créé. Le premier match est prêt — le chrono reste en pause.");
      return;
    }

    renderGame();renderManageTeams();refreshCaptainSelection();
    showToast("✓ Modifications enregistrées. Équipes, ordre, points et joueurs ont été mis à jour.");
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
      els.dashboardTournamentInfo.innerHTML = `
        <div class="dashboard-empty">
          <div class="dashboard-empty-icon">⚽</div>
          <strong>Aucun tournoi en cours</strong>
          <p>Ouvre les inscriptions ou crée un nouveau tournoi.</p>
        </div>`;
      return;
    }

    if (state.phase === "complete" || state.tournamentWinnerId !== null) {
      const winner = state.teams[state.tournamentWinnerId];
      const final = state.finalResult;
      const finalText = final
        ? `${state.teams[final.winnerId]?.name || "—"} ${final.scoreA} - ${final.scoreB} ${state.teams[final.loserId]?.name || "—"}`
        : "Finale terminée";
      els.dashboardTournamentInfo.innerHTML = `
        <div class="dashboard-live-summary dashboard-finished">
          <div class="dashboard-summary-top">
            <span class="live-pill">🏆 TOURNOI TERMINÉ</span>
            <span class="muted small">Résultats finaux</span>
          </div>
          <div class="dashboard-champion">
            ${teamJerseyHtml(winner,state.tournamentWinnerId,"dashboard-champion-jersey")}
            <div>
              <div class="muted small">CHAMPION</div>
              <h3 style="color:${getTeamColor(winner,state.tournamentWinnerId)}">${escapeHtml(winner?.name || "—")}</h3>
            </div>
          </div>
          <div class="dashboard-final-score"><span>🏆 Finale</span><strong>${escapeHtml(finalText)}</strong></div>
          <button class="secondary full" id="dashboardOpenTournamentBtn">🏟️ Voir le tournoi et le classement final</button>
        </div>`;
      document.getElementById("dashboardOpenTournamentBtn")?.addEventListener("click", showGame);
      return;
    }

    const teams = Array.isArray(state.teams) ? state.teams : [];
    const active = state.active;
    const a = active ? teams[active.a] : null;
    const b = active ? teams[active.b] : null;
    const totalPlayers = teams.reduce((n,t)=>n+(Array.isArray(t.players)?t.players.length:0),0);
    const top = sortedTeams()[0];

    els.dashboardTournamentInfo.innerHTML = `
      <div class="dashboard-live-summary">
        <div class="dashboard-summary-top">
          <div>
            <span class="live-pill">${state.matchStarted ? "● EN DIRECT" : "⏸ MATCH PRÉPARÉ"}</span>
            <h3>Tournoi actuel</h3>
            <p class="muted small">${state.matchStarted ? `Match #${state.matchNumber} en cours` : `Match #${state.matchNumber || 1} prêt à démarrer`}</p>
          </div>
          <div class="dashboard-mini-stat"><strong>${formatTime(state.secondsLeft)}</strong><span>chrono</span></div>
        </div>

        ${active ? `<div class="dashboard-match-preview">
          <div class="dashboard-match-team">
            ${teamJerseyHtml(a,active.a,"dashboard-match-jersey")}
            <strong style="color:${getTeamColor(a,active.a)}">${escapeHtml(a?.name||"—")}</strong>
          </div>
          <div class="dashboard-match-score"><strong>${state.scoreA}</strong><span>VS</span><strong>${state.scoreB}</strong></div>
          <div class="dashboard-match-team">
            ${teamJerseyHtml(b,active.b,"dashboard-match-jersey")}
            <strong style="color:${getTeamColor(b,active.b)}">${escapeHtml(b?.name||"—")}</strong>
          </div>
        </div>` : `<div class="dashboard-no-match">Le tournoi est prêt. Prépare le premier match.</div>`}

        <div class="dashboard-stat-grid">
          <div><strong>${teams.length}</strong><span>équipes</span></div>
          <div><strong>${totalPlayers}</strong><span>joueurs</span></div>
          <div><strong>${state.history?.length || 0}</strong><span>matchs finis</span></div>
          <div><strong>${top ? escapeHtml(top.name) : "—"}</strong><span>leader</span></div>
        </div>

        <div class="dashboard-team-strip">
          ${teams.map((t,i)=>`<div class="dashboard-team-mini" style="--team-color:${getTeamColor(t,i)}">
            ${teamJerseyHtml(t,i,"dashboard-team-jersey")}
            <span>${escapeHtml(t.name)}</span>
            <small>${Array.isArray(t.players)?t.players.length:0} joueurs</small>
          </div>`).join("")}
        </div>
      </div>`;
  }

  function showDashboard() {
    if (accessMode !== "admin") { showAccess(); return; }
    showOnly("dashboardPage", true);
    renderAdminDashboard();
    scheduleAdminIdleLogout();
  }

  function showTeamManagementPage() {
    if (accessMode !== "admin") { showAccess(); return; }
    showOnly("manageTeamsPanel", true);
    renderManageTeams();
    refreshCaptainSelection();
    scheduleAdminIdleLogout();
  }

  function showGame() {
    if (accessMode !== "admin") { showAccess(); return; }
    showOnly("gameScreen", true);
    els.resumeBanner.classList.add("hidden");
    if (els.manageTeamsBtn) els.manageTeamsBtn.classList.remove("hidden");
    if (els.newTournamentBtn) els.newTournamentBtn.classList.remove("hidden");
    renderGame();
    renderFinals();
    scheduleAdminIdleLogout();
  }

  function showSetup() {
    if (accessMode !== "admin") { showAccess(); return; }
    stopTimer();
    showOnly("setupScreen", true);
    els.openRegistrationAdminBtn?.classList.remove("hidden");
    scheduleAdminIdleLogout();
  }


  function teamImageHtml(team, cls="team-logo") {
    const index = state?.teams ? state.teams.indexOf(team) : 0;
    return team?.image
      ? `<img class="${cls}" src="${escapeHtml(team.image)}" alt="Image de ${escapeHtml(team.name)}">`
      : teamJerseyHtml(team, Math.max(0,index), cls);
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
      saveState(); renderGame(); renderFinals();
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

  function closeTournament() {
    if (accessMode !== "admin") {
      showToast("🔒 Action réservée à l’administrateur.");
      return;
    }
    if (!state?.finalResult) {
      showToast("La finale doit être terminée avant de clôturer le tournoi.");
      return;
    }
    const winner = state.teams[state.finalResult.winnerId];
    state.tournamentWinnerId = state.finalResult.winnerId;
    state.phase = "complete";
    state.phaseMatch = null;
    state.phaseMatchStarted = false;
    state.phaseSecondsLeft = 0;
    stopPhaseTimer();
    stopTimer();
    saveState();
    renderGame();
    renderFinals();
    renderAdminDashboard();
    showToast(`🏆 Tournoi clôturé — ${winner?.name || "champion"} est champion.`);
  }

  function renderFinals() {
    if (!state || state.teams.length < 4) {
      els.finalScreen?.classList.add("hidden");
      return;
    }

    els.finalScreen.classList.remove("hidden");
    let html = `<div class="phase-card">
      <div class="phase-title">📊 Classement</div>
      <div class="phase-sub">3 pts victoire · 1 pt égalité · 0 pt défaite</div>
      ${sortedTeams().map((t,i)=>`<div class="rank-item"><strong>${i+1}. ${escapeHtml(t.name)}</strong><span class="badges">${t.points} pts · ${t.wins}V · ${t.draws}N · ${t.losses}D</span></div>`).join("")}
    </div>`;

    if (state.phase === "league") {
      html += `<div class="phase-card"><div class="phase-title">🏁 Phase finale</div>
        <p class="muted">Quand la phase de classement est terminée, passe aux demi-finales.</p>
        <button id="goSemifinalsBtn" class="primary full">🏆 Passer aux demi-finales</button></div>`;
    } else if (state.phaseMatch) {
      html += phaseMatchHtml();
    }

    if (state.semifinalResults?.length) {
      html += `<div class="phase-card"><div class="phase-title">🥇 Demi-finales</div>
        ${state.semifinalResults.map(r=>`<div class="history-item"><strong>${escapeHtml(r.label)}</strong><span>🏆 ${escapeHtml(state.teams[r.winnerId].name)} · ${r.scoreA}-${r.scoreB}</span></div>`).join("")}
      </div>`;
    }

    if (state.finalResult) {
      const f=state.finalResult, w=state.teams[f.winnerId], l=state.teams[f.loserId];
      html += `<div class="phase-card final-dashboard admin-final-result">
        <div class="trophy">🏆</div>
        <div class="phase-title">FINALE — DERNIER MATCH</div>
        <div class="final-result-teams">
          <div><strong style="color:${getTeamColor(w,f.winnerId)}">${escapeHtml(w?.name||"—")}</strong></div>
          <div class="final-result-score">${f.scoreA} - ${f.scoreB}</div>
          <div><strong style="color:${getTeamColor(l,f.loserId)}">${escapeHtml(l?.name||"—")}</strong></div>
        </div>
        <div class="final-admin-winner">🏆 Champion : <strong style="color:${getTeamColor(w,f.winnerId)}">${escapeHtml(w?.name||"—")}</strong></div>
        ${teamImageHtml(w,"winner-logo")}
        <button id="closeTournamentBtn" class="primary full">🏁 Clôturer le tournoi</button>
      </div>`;
    }

    els.finalContent.innerHTML=html;
    const go=document.getElementById("goSemifinalsBtn");
    if(go) go.addEventListener("click",launchSemifinals);
    const closeTournamentBtn=document.getElementById("closeTournamentBtn");
    if(closeTournamentBtn) closeTournamentBtn.addEventListener("click",()=>{
      if(confirm("Clôturer définitivement le tournoi et afficher uniquement les résultats finaux ?")) closeTournament();
    });
    const startBtn=document.getElementById("startPhaseMatchBtn");
    if(startBtn) startBtn.addEventListener("click",startPhaseMatch);
    els.finalContent.querySelectorAll("[data-pgoal]").forEach(b=>b.addEventListener("click",()=>addPhaseGoal(b.dataset.pgoal)));
    els.finalContent.querySelectorAll("[data-pplayerside]").forEach(b=>b.addEventListener("click",()=>addPhaseGoal(b.dataset.pplayerside,b.dataset.pplayername)));
    els.finalContent.querySelectorAll("[data-pwin]").forEach(b=>b.addEventListener("click",()=>finishPhaseMatch(b.dataset.pwin)));
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
  els.newTournamentBtn?.addEventListener("click", newTournament);
  document.getElementById("currentTournamentTopBtn")?.addEventListener("click",()=>{if(state&&Array.isArray(state.teams)&&state.teams.length)showGame();else showToast("Aucun tournoi en cours.");});
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
  els.dashboardLogoutBtn?.addEventListener("click", async () => {
    try { if (supabaseClient) await supabaseClient.auth.signOut(); } catch (error) { console.error("Logout error", error); }
    accessMode = "none";
    showAccess();
    showToast("✓ Déconnexion effectuée.");
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
  document.getElementById("setupBackBtn")?.addEventListener("click", showDashboard);
  document.getElementById("gameBackBtn")?.addEventListener("click", showDashboard);

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
  if (supabaseClient) {
    supabaseClient.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") { clearAdminIdleTimer(); accessMode = "none"; showAccess(); }
    });
  }
  document.getElementById("adminAccessBtn")?.addEventListener("click", () => document.getElementById("adminLoginBox")?.classList.remove("hidden"));
  document.getElementById("adminLoginBtn")?.addEventListener("click", enterAdminMode);
  document.getElementById("adminPassword")?.addEventListener("keydown", e => { if(e.key === "Enter") enterAdminMode(); });
  document.getElementById("backAccessBtn")?.addEventListener("click", () => document.getElementById("adminLoginBox")?.classList.add("hidden"));
  document.getElementById("liveAccessBtn")?.addEventListener("click", enterLiveMode);
  document.getElementById("publicTeamsAccessBtn")?.addEventListener("click", enterPublicTeamsMode);
  document.getElementById("publicTeamsBackBtn")?.addEventListener("click", showAccess);
  document.getElementById("registerAccessBtn")?.addEventListener("click", enterRegistrationMode);
  document.getElementById("registerPlayerBtn")?.addEventListener("click", submitRegistration);
  document.getElementById("registrationBackBtn")?.addEventListener("click", showAccess);
  els.registrationName?.addEventListener("change", () => {});
  document.getElementById("liveBackBtn")?.addEventListener("click", showAccess);
  document.getElementById("liveNotificationsBtn")?.addEventListener("click",toggleNotifications);
  document.getElementById("registrationNotificationsBtn")?.addEventListener("click",toggleNotifications);
  document.querySelectorAll("[data-public-action]").forEach(btn => {
    btn.addEventListener("click", () => {
      const action = btn.dataset.publicAction;
      if (action === "home") return showAccess();
      if (action === "registration") return enterRegistrationMode();
      if (action === "live") return enterLiveMode();
      if (action === "teams") return enterPublicTeamsMode();
    });
  });

  const setMobileAdminNav = (action) => {
    document.querySelectorAll("#mobileBottomNav [data-mobile-action]").forEach(b => b.classList.toggle("is-active", b.dataset.mobileAction === action));
  };
  document.querySelectorAll("[data-mobile-action]").forEach(btn => {
    btn.addEventListener("click", () => {
      const action = btn.dataset.mobileAction;
      setMobileAdminNav(action);
      if (action === "home") return showDashboard();
      if (action === "registration") return openRegistrationAdmin();
      if (action === "current") {
        if (!state) return showToast("Aucun tournoi en cours.");
        showGame();
        renderGame();
        if (state.matchStarted && !state.timerPaused) startTimer();
        return;
      }
      if (action === "teams") return showTeamManagementPage();
      if (action === "new") {
        showSetup();
        renderTeamForm();
      }
    });
  });

  renderTeamForm();
  updateNotificationButtons();

  const existing = loadState();
  // Restore the Supabase admin session after refresh. The password is not requested again
  // while the authenticated session remains valid.
  restoreAdminSession();
  // PWA installation
  let deferredInstallPrompt = null;
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    document.querySelectorAll("[data-install-app]").forEach(btn => btn.classList.remove("hidden"));
  });
  document.querySelectorAll("[data-install-app]").forEach(btn => btn.addEventListener("click", async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      document.querySelectorAll("[data-install-app]").forEach(b => b.classList.add("hidden"));
      return;
    }
    alert("Sur iPhone/iPad : ouvre le menu Partager puis « Sur l’écran d’accueil ».\nSur Android/Chrome : menu ⋮ puis « Installer l’application » ou « Ajouter à l’écran d’accueil ».");
  }));
  window.addEventListener("appinstalled", () => {
    document.querySelectorAll("[data-install-app]").forEach(btn => btn.classList.add("hidden"));
    showToast("✓ Sunday Football est installé comme application.");
  });
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(err => console.warn("PWA SW:", err)));
  }

})();

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden" && state) saveState();
  });

  window.addEventListener("beforeunload", () => {
    if (state) saveState();
  });
