from pathlib import Path
p=Path('/mnt/data/sf81_work')

# HTML changes
f=p/'index.html'; s=f.read_text()
s=s.replace('''<header id="appTopbar" class="topbar hidden">\n      <div class="brand-block">\n        <img class="brand-mark" src="assets/football-mark.svg" alt="" aria-hidden="true">\n        <div>\n          <h1>Sunday Football</h1>\n          <p id="saveStatus">Sauvegarde locale activée</p>\n        </div>\n      </div>\n      <div class="topbar-actions">\n        <button id="homeDashboardBtn" class="secondary admin-only">🏠 Accueil</button>\n        <button id="topRegistrationBtn" class="secondary admin-only">📝 Inscriptions</button>\n        <button id="manageTeamsBtn" class="secondary admin-only">👥 Équipes & joueurs</button>\n        <button id="newTournamentBtn" class="secondary admin-only">＋ Nouveau tournoi</button>\n        <button id="currentTournamentTopBtn" class="secondary admin-only top-current-tournament">🏟️ Tournoi en cours</button>\n      </div>\n    </header>''','''<header id="appTopbar" class="topbar hidden">\n      <div class="brand-block">\n        <img class="brand-mark" src="assets/football-mark.svg" alt="" aria-hidden="true">\n        <div>\n          <h1>Sunday Football</h1>\n          <p id="saveStatus">Sauvegarde locale activée</p>\n        </div>\n      </div>\n    </header>''')
# Add back button + compact header in admin pages
s=s.replace('''<div class="topbar-inline">\n          <div>\n            <h2>📝 Inscriptions du dimanche</h2>\n            <p class="muted small">Ouvre les inscriptions, consulte la liste et prépare les équipes avant de créer le tournoi.</p>\n          </div>\n          <button id="registrationAdminBackBtn" class="secondary">← Retour</button>\n        </div>''','''<div class="topbar-inline admin-page-heading">\n          <div class="admin-page-title-wrap"><button id="registrationAdminBackBtn" class="icon-back" type="button" aria-label="Retour">←</button><div><h2>📝 Inscriptions du dimanche</h2><p class="muted small">Ouvre les inscriptions, consulte la liste et prépare les équipes avant de créer le tournoi.</p></div></div>\n        </div>''')
s=s.replace('''<div class="topbar-inline">\n          <div>\n            <h2>👥 Équipes & joueurs</h2>\n            <p class="muted small">Modifie les joueurs du tournoi actuel sans créer un nouveau tournoi.</p>\n          </div>\n          <button id="closeManageTeamsBtn" class="secondary">🏠 Retour dashboard</button>\n        </div>''','''<div class="topbar-inline admin-page-heading">\n          <div class="admin-page-title-wrap"><button id="closeManageTeamsBtn" class="icon-back" type="button" aria-label="Retour">←</button><div><h2>👥 Équipes & joueurs</h2><p class="muted small">Modifie les joueurs du tournoi actuel sans créer un nouveau tournoi.</p></div></div>\n        </div>''')
# Setup back
s=s.replace('''<section id="setupScreen" class="screen hidden">\n      <div class="card setup-card">\n        <div class="setup-visual">''','''<section id="setupScreen" class="screen hidden">\n      <div class="card setup-card">\n        <div class="admin-page-back-row"><button id="setupBackBtn" class="icon-back" type="button" aria-label="Retour">←</button><span class="muted small">Nouveau tournoi</span></div>\n        <div class="setup-visual">''')
# Game back row
s=s.replace('''<section id="gameScreen" class="screen hidden">\n      <div id="resumeBanner"''','''<section id="gameScreen" class="screen hidden">\n      <div class="admin-page-back-row"><button id="gameBackBtn" class="icon-back" type="button" aria-label="Retour">←</button><span class="muted small">Tournoi en cours</span></div>\n      <div id="resumeBanner"''')
f.write_text(s)

# JS replace mobile live renderer
f=p/'app.js'; s=f.read_text()
start=s.index('  function renderMobileLivePages(root){')
end=s.index('\n  async function enterLiveMode()', start)
new=r'''  function renderMobileLivePages(root){
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
'''
s=s[:start]+new+s[end:]
# Add robust notification setup and subscription error handling
s=s.replace('''  async function enableNotifications(){\n    if(!(\"Notification\" in window)){showToast(\"Les notifications ne sont pas prises en charge par ce navigateur.\");return false;}\n    const p=Notification.permission===\"granted\"?\"granted\":await Notification.requestPermission();''','''  async function enableNotifications(){\n    if(!window.isSecureContext){showToast("⚠️ Les notifications nécessitent HTTPS.");return false;}\n    if(!(\"Notification\" in window)){showToast(\"Les notifications ne sont pas prises en charge par ce navigateur.\");return false;}\n    try { if(\"serviceWorker\" in navigator) await navigator.serviceWorker.ready; } catch {}\n    const p=Notification.permission===\"granted\"?\"granted\":await Notification.requestPermission();''')
s=s.replace('''      }).subscribe();\n  }\n  function stopTournamentNotifications(){''','''      }).subscribe(status=>{\n        if(status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") console.warn("Tournament notification realtime:",status);\n      });\n  }\n  function stopTournamentNotifications(){''',1)
# Admin nav: use dashboard pages and add back handlers
insert='''\n  document.getElementById("setupBackBtn")?.addEventListener("click", showDashboard);\n  document.getElementById("gameBackBtn")?.addEventListener("click", showDashboard);\n'''
needle='''  document.getElementById("registrationAdminBackBtn")?.addEventListener("click", closeRegistrationAdmin);'''
s=s.replace(needle,needle+insert)
# Remove old top nav listeners safely (elements absent anyway), add current tournament bottom action works.
# Make closeManageTeams return dashboard already.
f.write_text(s)

# CSS append/override
f=p/'style.css'; s=f.read_text()
append=r'''

/* V8.1 — visual live match + unified admin mobile navigation */
.admin-page-heading{border:0!important;background:transparent!important;padding:2px 0 12px!important;}
.admin-page-title-wrap{display:flex;align-items:flex-start;gap:10px;min-width:0;}
.icon-back{width:38px;height:38px;flex:0 0 38px;border-radius:13px;border:1px solid #30445f;background:#102038;color:#e7f0fb;display:grid;place-items:center;font-size:20px;font-weight:900;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.18);}
.icon-back:active{transform:scale(.94);}
.admin-page-back-row{display:flex;align-items:center;gap:9px;margin:0 0 8px;padding:2px 1px;}

@media(max-width:700px){
  .topbar{padding:10px 4px!important;margin-bottom:7px!important;background:transparent!important;border:0!important;}
  .topbar .brand-block{padding:10px 12px;border:1px solid rgba(255,255,255,.08);border-radius:18px;background:rgba(17,23,38,.78);backdrop-filter:blur(16px);}
  .topbar-actions{display:none!important;}
  .admin-page-title-wrap h2{font-size:16px!important;line-height:1.2!important;}
  .admin-page-title-wrap p{font-size:9px!important;line-height:1.4!important;}
  .dashboard-card>.topbar-inline .secondary{display:none!important;}
  #dashboardPage .dashboard-actions{grid-template-columns:1fr!important;gap:9px!important;}
  #dashboardPage .dashboard-actions button{min-height:54px!important;border-radius:16px!important;font-size:13px!important;}
  #dashboardPage .dashboard-hero{border-radius:22px!important;min-height:185px!important;}
  #dashboardPage .dashboard-info{margin-top:12px!important;}
  #setupScreen .setup-card,#registrationAdminScreen .registration-admin-page,#manageTeamsPanel .manage-card,#gameScreen{border-radius:22px!important;}

  /* Live match: reference-style visual scoreboard */
  #liveScreen .mobile-live-pages{padding:0 2px 88px!important;}
  .mobile-live-hero-card{position:relative;overflow:hidden;border-radius:24px;border:1px solid #294a70;background:radial-gradient(circle at 50% -5%,rgba(78,161,255,.22),transparent 38%),linear-gradient(145deg,#071a30,#071321);padding:14px 12px 12px;box-shadow:0 18px 40px rgba(0,0,0,.28);}
  .mobile-live-hero-glow{position:absolute;inset:auto -30px -60px;height:130px;background:radial-gradient(circle,rgba(16,185,129,.14),transparent 65%);pointer-events:none;}
  .mobile-live-status-row{position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,.08);padding-bottom:11px;}
  .mobile-live-match-no{font-size:9px;color:#8ea3ba;font-weight:800;letter-spacing:.08em;}
  .mobile-live-faceoff{position:relative;z-index:1;display:grid;grid-template-columns:1fr 1.15fr 1fr;align-items:center;gap:5px;padding:17px 0 13px;}
  .mobile-live-team-side{display:flex;flex-direction:column;align-items:center;text-align:center;min-width:0;}
  .mobile-live-team-side strong{font-size:13px;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:3px;}
  .mobile-live-team-side small{font-size:8px;color:#7389a1;margin-top:2px;}
  .mobile-live-jersey-box{width:70px;height:76px;display:grid;place-items:center;border-radius:20px;background:linear-gradient(145deg,rgba(17,31,51,.95),rgba(7,15,28,.96));border:1px solid color-mix(in srgb,var(--team-color) 40%,#294a70);box-shadow:0 12px 25px rgba(0,0,0,.28);}
  .mobile-live-main-jersey{width:60px!important;height:65px!important;object-fit:contain;filter:drop-shadow(0 8px 9px rgba(0,0,0,.35));}
  .mobile-live-score-center{display:flex;flex-direction:column;align-items:center;text-align:center;min-width:0;}
  .mobile-live-score{font-size:31px;font-weight:900;letter-spacing:.05em;color:#fff;white-space:nowrap;line-height:1.1;}
  .mobile-live-score span{color:#46556b;font-size:18px;margin:0 2px;}
  .mobile-live-timer{margin-top:8px;padding:8px 12px;border-radius:13px;background:#050b14;border:1px solid #2b405b;color:#fff;font-family:Orbitron,monospace;font-size:19px;font-weight:900;letter-spacing:.06em;box-shadow:inset 0 0 15px rgba(0,0,0,.35);}
  .mobile-live-score-center>span{font-size:8px;color:#8398af;margin-top:6px;white-space:nowrap;}
  .mobile-live-progress{height:4px;background:#0b1423;border-radius:99px;overflow:hidden;border:1px solid #1e324a;}
  .mobile-live-progress span{display:block;height:100%;background:linear-gradient(90deg,#3b82f6,#10b981);border-radius:99px;box-shadow:0 0 10px rgba(59,130,246,.55);}
  .mobile-live-stats-row{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin:9px 0;}
  .mobile-live-stats-row>div{padding:10px 5px;text-align:center;border:1px solid #263a55;border-radius:15px;background:linear-gradient(145deg,#101d31,#0c1728);}
  .mobile-live-stats-row strong{display:block;font-size:13px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .mobile-live-stats-row small{display:block;font-size:8px;color:#7f93ab;margin-top:2px;}
  .mobile-live-section{padding:12px!important;border-radius:20px!important;margin-bottom:9px!important;background:linear-gradient(145deg,rgba(17,28,46,.94),rgba(10,18,31,.96))!important;border:1px solid rgba(255,255,255,.08)!important;}
  .mobile-section-heading{display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,.07);padding-bottom:9px;margin-bottom:8px;font-size:11px;font-weight:900;color:#f8fafc;}
  .mobile-section-heading i{color:#10b981;margin-right:6px;}
  .mobile-section-heading small{font-size:8px;color:#7f93ab;font-weight:700;}
  .mobile-live-scorer-row{display:flex;align-items:center;gap:9px;padding:9px;border:1px solid #263a55;background:#0b1423;border-radius:13px;margin:6px 0;}
  .mobile-live-scorer-icon{width:27px;height:27px;border-radius:9px;background:rgba(16,185,129,.12);display:grid;place-items:center;font-size:12px;flex:0 0 auto;}
  .mobile-live-scorer-main{min-width:0;display:flex;flex-direction:column;gap:2px;flex:1;}
  .mobile-live-scorer-main strong{font-size:10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  .mobile-live-scorer-main small{font-size:8px;}
  .mobile-live-scorer-minute{font:800 10px Orbitron,monospace;color:#c5d1df;background:#050b14;border:1px solid #22364f;border-radius:8px;padding:5px 7px;}
  .mobile-live-empty{padding:12px;text-align:center;color:#70849c;font-size:9px;border:1px dashed #29415e;border-radius:12px;}
  .mobile-live-next-row{display:flex;align-items:center;gap:9px;padding:10px;border-radius:14px;background:#0b1423;border:1px solid #263a55;min-width:0;}
  .mobile-next-number{width:22px;height:22px;border-radius:8px;background:#172238;color:#9fb1c6;display:grid;place-items:center;font-size:9px;font-weight:900;flex:0 0 auto;}
  .mobile-next-jersey{width:42px!important;height:46px!important;object-fit:contain;flex:0 0 auto;}
  .mobile-live-next-row>div:last-child{min-width:0;display:flex;flex-direction:column;gap:2px;}
  .mobile-live-next-row strong{font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  .mobile-live-next-row small{font-size:8px;color:#778ba3;}
  .mobile-live-team-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
  .mobile-live-team-card{margin:0!important;min-width:0;padding:11px 7px!important;border-radius:19px!important;}
  .mobile-team-big-jersey{width:84px!important;height:90px!important;}
  .mobile-team-player-list{grid-template-columns:1fr!important;max-height:155px;overflow:auto;}

  /* Admin pages: consistent touch targets */
  #registrationAdminScreen button,#manageTeamsPanel button,#setupScreen button,#gameScreen button{min-height:42px;}
  #registrationAdminScreen input,#registrationAdminScreen select,#manageTeamsPanel input,#manageTeamsPanel select,#setupScreen input,#setupScreen select{min-height:42px;}
}
'''
f.write_text(s+append)

# bump SW cache and README
f=p/'sw.js'; s=f.read_text().replace("sunday-football-v8-0","sunday-football-v8-1"); f.write_text(s)

# README
f=p/'README.md'; s=f.read_text(); s += '''\n\n## V8.1 — Mobile UI/UX\n- Refonte visuelle de la page Live Match mobile : scoreboard, maillots, chrono, buteurs, prochaine équipe et statistiques.\n- Navigation admin simplifiée : actions principales uniquement dans la barre basse mobile.\n- Ajout d'une flèche Retour dans les pages admin internes, sans déconnexion de l'application.\n- L'ordre manuel des équipes reste prioritaire pour le premier match.\n- Notifications : demande de permission sécurisée HTTPS, attente du Service Worker et bouton de test. Les notifications Realtime restent dépendantes de la connexion Supabase Realtime.\n- Cache PWA version V8.1.\n'''; f.write_text(s)
