
(function(){
  const CAREER_STORAGE_KEY = 'orbita_save';
  const CAREER_DEFAULT = {
    totalXp: 0,
    level: 1,
    xpIntoLevel: 0,
    selectedTitle: 'cadete',
    unlockedTitles: ['cadete'],
    lastSeenMissionsCompleted: 0,
    lastSeenAchievementsCount: 0,
    lastRunSummary: null
  };

  const CAREER_TITLES = {
    cadete:      {name:'Cadete Orbital', icon:'🛰', desc:'Todo piloto começa aqui.'},
    navegador:   {name:'Navegador Estelar', icon:'🧭', desc:'Alcance nível 3.', req:()=> careerMeta.level >= 3},
    ritmista:    {name:'Ritmista do Vácuo', icon:'🎵', desc:'Faça combo x8.', req:()=> bestComboEver >= 8},
    garimpeiro:  {name:'Garimpeiro Solar', icon:'⛏', desc:'Capture 15 nós dourados.', req:()=> totalGoldCaptured >= 15},
    sobrevivente:{name:'Sobrevivente do Caos', icon:'🛡', desc:'Chegue à fase 6.', req:()=> highestPhase >= 6},
    executor:    {name:'Executor Orbital', icon:'⚔', desc:'Alcance 120 pontos.', req:()=> best >= 120},
    consagrado:  {name:'Consagrado do Ciclo', icon:'📜', desc:'Complete 10 missões diárias.', req:()=> missionsCompletedTotal >= 10},
    lenda:       {name:'Lenda de Órbita', icon:'👑', desc:'Nível 12, 200 pontos, 25 dourados e 15 missões.', req:()=> careerMeta.level >= 12 && best >= 200 && totalGoldCaptured >= 25 && missionsCompletedTotal >= 15},
  };

  let careerMeta = { ...CAREER_DEFAULT };
  let careerRun = { captures:0, golds:0, awarded:false };

  function getCareerLevelNeed(level){
    level = Math.max(1, Number(level||1));
    return 40 + (level-1)*25;
  }

  function clone(v){ return JSON.parse(JSON.stringify(v)); }

  function normalizeCareerMeta(raw){
    const out = { ...CAREER_DEFAULT, ...(raw || {}) };
    if (!Array.isArray(out.unlockedTitles) || !out.unlockedTitles.length) out.unlockedTitles = ['cadete'];
    if (!CAREER_TITLES[out.selectedTitle]) out.selectedTitle = out.unlockedTitles[0] || 'cadete';
    out.totalXp = Number(out.totalXp || 0) || 0;
    out.level = Math.max(1, Number(out.level || 1) || 1);
    out.xpIntoLevel = Math.max(0, Number(out.xpIntoLevel || 0) || 0);
    out.lastSeenMissionsCompleted = Math.max(0, Number(out.lastSeenMissionsCompleted || 0) || 0);
    out.lastSeenAchievementsCount = Math.max(0, Number(out.lastSeenAchievementsCount || 0) || 0);
    out.lastRunSummary = out.lastRunSummary || null;
    return out;
  }

  function loadCareerMeta(){
    try {
      const raw = localStorage.getItem(CAREER_STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      careerMeta = normalizeCareerMeta(data.careerMeta || {});
    } catch(e) {
      careerMeta = normalizeCareerMeta({});
    }
    refreshCareerTitles();
  }

  function persistCareerMeta(){
    try {
      const raw = localStorage.getItem(CAREER_STORAGE_KEY);
      const data = raw ? JSON.parse(raw) : {};
      data.careerMeta = careerMeta;
      localStorage.setItem(CAREER_STORAGE_KEY, JSON.stringify(data));
    } catch(e) {}
  }

  const _origSaveData = typeof saveData === 'function' ? saveData : null;
  if (_origSaveData) {
    saveData = function(){
      const result = _origSaveData.apply(this, arguments);
      persistCareerMeta();
      return result;
    };
  }

  function refreshCareerTitles(){
    const newTitles = [];
    for (const key of Object.keys(CAREER_TITLES)) {
      const title = CAREER_TITLES[key];
      const ok = !title.req || title.req();
      if (ok && !careerMeta.unlockedTitles.includes(key)) {
        careerMeta.unlockedTitles.push(key);
        newTitles.push(key);
      }
    }
    if (!careerMeta.selectedTitle || !careerMeta.unlockedTitles.includes(careerMeta.selectedTitle)) {
      careerMeta.selectedTitle = careerMeta.unlockedTitles[careerMeta.unlockedTitles.length - 1] || 'cadete';
    }
    return newTitles;
  }

  function getMasteryTracks(){
    return [
      {
        key:'survival',
        label:'Sobrevivência',
        color:'#7bed9f',
        value: highestPhase,
        level: Math.min(10, Math.floor(highestPhase / 1)),
        next: Math.min(10, Math.floor(highestPhase / 1) + 1),
        progress: Math.min(1, (highestPhase % 1) || 1)
      },
      {
        key:'combo',
        label:'Combo',
        color:'#ff6b9d',
        value: bestComboEver,
        level: Math.min(10, Math.floor(bestComboEver / 2)),
        next: Math.floor(bestComboEver / 2) + 1,
        progress: Math.min(1, (bestComboEver % 2) / 2)
      },
      {
        key:'gold',
        label:'Dourado',
        color:'#ffd32a',
        value: totalGoldCaptured,
        level: Math.min(10, Math.floor(totalGoldCaptured / 5)),
        next: Math.floor(totalGoldCaptured / 5) + 1,
        progress: Math.min(1, (totalGoldCaptured % 5) / 5)
      },
      {
        key:'missions',
        label:'Missões',
        color:'#70a1ff',
        value: missionsCompletedTotal,
        level: Math.min(10, Math.floor(missionsCompletedTotal / 3)),
        next: Math.floor(missionsCompletedTotal / 3) + 1,
        progress: Math.min(1, (missionsCompletedTotal % 3) / 3)
      }
    ];
  }

  function getLongGoals(){
    return [
      {label:'Nível 5', value: careerMeta.level, target:5, color:'#00f5d4'},
      {label:'Missões 10', value: missionsCompletedTotal, target:10, color:'#70a1ff'},
      {label:'Dourados 25', value: totalGoldCaptured, target:25, color:'#ffd32a'},
      {label:'Recorde 200', value: best, target:200, color:'#ff6b9d'},
      {label:'Partidas 50', value: totalGames, target:50, color:'#c084fc'},
    ];
  }

  function getNextLockedTitle(){
    for (const key of Object.keys(CAREER_TITLES)) {
      if (!careerMeta.unlockedTitles.includes(key)) return { key, ...CAREER_TITLES[key] };
    }
    return null;
  }

  function cycleCareerTitle(){
    const list = careerMeta.unlockedTitles || ['cadete'];
    if (!list.length) return;
    const idx = Math.max(0, list.indexOf(careerMeta.selectedTitle));
    careerMeta.selectedTitle = list[(idx + 1) % list.length];
    persistCareerMeta();
    if (typeof saveData === 'function') saveData();
  }

  function awardCareerFromRun(){
    if (careerRun.awarded) return;
    careerRun.awarded = true;
  }

  function finalizeCareerRun(){
    if (careerRun.awarded) return;
    careerRun.awarded = true;

    const missionDelta = Math.max(0, missionsCompletedTotal - careerMeta.lastSeenMissionsCompleted);
    const achDelta = Math.max(0, achievements.length - careerMeta.lastSeenAchievementsCount);
    const phase = Math.max(1, typeof getPhase === 'function' ? Number(getPhase()) || 1 : 1);
    const scoreNow = Math.max(0, Number(score || 0) || 0);
    const comboNow = Math.max(1, Number(maxCombo || 0) || 0);

    let gained = 6;
    gained += Math.min(24, Math.floor(scoreNow * 0.45));
    gained += Math.min(12, (phase - 1) * 3);
    gained += Math.min(12, careerRun.golds * 3);
    if (newRec) gained += 10;
    gained += Math.min(10, Math.max(0, comboNow - 1));
    gained += missionDelta * 8;
    gained += achDelta * 6;

    careerMeta.totalXp += gained;
    careerMeta.lastSeenMissionsCompleted = missionsCompletedTotal;
    careerMeta.lastSeenAchievementsCount = achievements.length;

    let leveled = 0;
    while (careerMeta.xpIntoLevel + gained >= getCareerLevelNeed(careerMeta.level)) {
      const need = getCareerLevelNeed(careerMeta.level);
      const missing = need - careerMeta.xpIntoLevel;
      gained -= missing;
      careerMeta.level += 1;
      careerMeta.xpIntoLevel = 0;
      leveled += 1;
    }
    careerMeta.xpIntoLevel += gained;

    const newTitles = refreshCareerTitles();
    careerMeta.lastRunSummary = {
      xp: Math.round((6 + Math.min(24, Math.floor(scoreNow * 0.45)) + Math.min(12, (phase - 1) * 3) + Math.min(12, careerRun.golds * 3) + (newRec ? 10 : 0) + Math.min(10, Math.max(0, comboNow - 1)) + missionDelta * 8 + achDelta * 6)),
      leveled,
      newTitles: newTitles.slice(),
      score: scoreNow,
      phase,
      golds: careerRun.golds
    };

    persistCareerMeta();
    if (typeof saveData === 'function') saveData();
  }

  function resetCareerRunMetrics(){
    careerRun = { captures:0, golds:0, awarded:false };
  }

  // Load once
  loadCareerMeta();

  // patch reset
  if (typeof reset === 'function') {
    const _origReset = reset;
    reset = function(){
      resetCareerRunMetrics();
      return _origReset.apply(this, arguments);
    };
  }

  // patch capture
  if (typeof capture === 'function') {
    const _origCapture = capture;
    capture = function(nodeIdx){
      const node = (typeof nodes !== 'undefined' && nodes && nodes[nodeIdx]) ? nodes[nodeIdx] : null;
      const result = _origCapture.apply(this, arguments);
      careerRun.captures += 1;
      if (node && node.tier === 'gold') careerRun.golds += 1;
      return result;
    };
  }

  // patch die
  if (typeof die === 'function') {
    const _origDie = die;
    die = function(){
      const wasPlay = (typeof state !== 'undefined' && state === ST.PLAY);
      const result = _origDie.apply(this, arguments);
      if (wasPlay) finalizeCareerRun();
      return result;
    };
  }

  function drawCareerMetaButton(){
    if (!(state === ST.MENU && menuScreen === 'main')) return;
    const w = 148, h = 34;
    const x = 14, y = H - 54;
    X.globalAlpha = 0.82;
    const g = X.createLinearGradient(x, y, x, y+h);
    g.addColorStop(0, 'rgba(0,0,0,0.52)');
    g.addColorStop(1, 'rgba(0,0,0,0.76)');
    X.fillStyle = g;
    roundRect(x, y, w, h, 10); X.fill();
    X.strokeStyle = '#ffd32a';
    X.lineWidth = 1.5;
    roundRect(x, y, w, h, 10); X.stroke();
    X.globalAlpha = 1;
    X.fillStyle = '#ffd32a';
    X.font = 'bold 13px -apple-system, system-ui, sans-serif';
    X.textAlign='center'; X.textBaseline='middle';
    X.fillText('✦ CARREIRA', x + w/2, y + h/2);
    menuBtnAreas.push({ x, y, w, h, action:()=>{ menuScreen = 'career'; } });
  }

  function drawGoalBar(x,y,w,h,progress,color){
    X.fillStyle='rgba(255,255,255,0.10)';
    roundRect(x,y,w,h,4); X.fill();
    if (progress > 0) {
      X.fillStyle=color;
      roundRect(x,y,Math.max(8, w*progress),h,4); X.fill();
    }
  }

  function drawCareerMenu(){
    X.textAlign='center'; X.textBaseline='middle';
    const layout = (typeof getMenuHeaderLayout === 'function')
      ? getMenuHeaderLayout()
      : { titleY: Math.max(66, H*0.082), contentStartY: Math.max(118, H*0.15) };

    X.fillStyle='#e0e0ff'; X.font='bold 30px -apple-system, system-ui, sans-serif';
    X.shadowColor='#ffd32a'; X.shadowBlur=16;
    X.fillText('CARREIRA', W/2, layout.titleY);
    X.shadowBlur=0;

    drawBackBtn();

    const padX = 16;
    const cardW = W - padX*2;
    let y = layout.contentStartY;

    // summary card
    X.fillStyle='rgba(0,0,0,0.60)';
    roundRect(padX,y,cardW,78,12); X.fill();
    X.strokeStyle='rgba(255,210,60,0.45)';
    X.lineWidth=1.2;
    roundRect(padX,y,cardW,78,12); X.stroke();

    const title = CAREER_TITLES[careerMeta.selectedTitle] || CAREER_TITLES.cadete;
    const need = getCareerLevelNeed(careerMeta.level);
    const xpProg = Math.max(0, Math.min(1, careerMeta.xpIntoLevel / need));

    X.textAlign='left';
    X.fillStyle='rgba(255,255,255,0.55)';
    X.font='10px -apple-system, system-ui, sans-serif';
    X.fillText('TÍTULO ATUAL', padX+12, y+16);
    X.fillStyle='#ffd32a';
    X.font='bold 16px -apple-system, system-ui, sans-serif';
    X.fillText(title.icon + ' ' + title.name.toUpperCase(), padX+12, y+38);
    X.fillStyle='rgba(255,255,255,0.42)';
    X.font='10px -apple-system, system-ui, sans-serif';
    X.fillText('Toque para trocar entre títulos desbloqueados', padX+12, y+56);

    X.textAlign='right';
    X.fillStyle='#fff';
    X.font='bold 24px -apple-system, system-ui, sans-serif';
    X.fillText('LV ' + careerMeta.level, padX+cardW-12, y+28);
    X.fillStyle='rgba(255,255,255,0.55)';
    X.font='10px -apple-system, system-ui, sans-serif';
    X.fillText(careerMeta.xpIntoLevel + ' / ' + need + ' XP', padX+cardW-12, y+48);

    drawGoalBar(padX+12, y+62, cardW-24, 8, xpProg, '#ffd32a');

    menuBtnAreas.push({ x:padX, y, w:cardW, h:78, action:()=>{ cycleCareerTitle(); } });

    y += 90;

    // mastery 2x2
    const tracks = getMasteryTracks();
    const cellW = (cardW - 10) / 2;
    const cellH = 56;
    tracks.forEach((t, i) => {
      const cx = padX + (i%2) * (cellW + 10);
      const cy = y + Math.floor(i/2) * (cellH + 10);

      X.fillStyle='rgba(0,0,0,0.54)';
      roundRect(cx,cy,cellW,cellH,10); X.fill();
      X.strokeStyle=t.color; X.lineWidth=1;
      roundRect(cx,cy,cellW,cellH,10); X.stroke();

      X.textAlign='left';
      X.fillStyle=t.color;
      X.font='bold 10px -apple-system, system-ui, sans-serif';
      X.fillText(t.label.toUpperCase(), cx+10, cy+14);
      X.fillStyle='#fff';
      X.font='bold 18px -apple-system, system-ui, sans-serif';
      X.fillText('NÍVEL ' + t.level, cx+10, cy+34);

      X.textAlign='right';
      X.fillStyle='rgba(255,255,255,0.55)';
      X.font='10px -apple-system, system-ui, sans-serif';
      X.fillText(String(t.value), cx+cellW-10, cy+16);

      drawGoalBar(cx+10, cy+42, cellW-20, 6, t.progress, t.color);
    });

    y += 2*(cellH + 10) + 6;

    // long goals
    const goals = getLongGoals();
    X.fillStyle='rgba(0,0,0,0.54)';
    roundRect(padX,y,cardW,118,12); X.fill();
    X.strokeStyle='rgba(255,255,255,0.10)'; X.lineWidth=1;
    roundRect(padX,y,cardW,118,12); X.stroke();
    X.textAlign='left';
    X.fillStyle='#00f5d4';
    X.font='bold 12px -apple-system, system-ui, sans-serif';
    X.fillText('META DE LONGO PRAZO', padX+12, y+16);

    goals.forEach((g, idx) => {
      const gy = y + 32 + idx*16;
      const prog = Math.max(0, Math.min(1, (Number(g.value)||0) / g.target));
      X.fillStyle='rgba(255,255,255,0.68)';
      X.font='10px -apple-system, system-ui, sans-serif';
      X.fillText(g.label, padX+12, gy);
      X.textAlign='right';
      X.fillText(Math.min(Number(g.value)||0, g.target) + ' / ' + g.target, padX+cardW-12, gy);
      X.textAlign='left';
      drawGoalBar(padX+92, gy-5, cardW-104, 5, prog, g.color);
    });

    y += 130;

    // next title + last run summary
    const nextTitle = getNextLockedTitle();
    X.fillStyle='rgba(0,0,0,0.54)';
    roundRect(padX,y,cardW,82,12); X.fill();
    X.strokeStyle='rgba(255,255,255,0.10)'; X.lineWidth=1;
    roundRect(padX,y,cardW,82,12); X.stroke();

    X.textAlign='left';
    X.fillStyle='#ff6b9d';
    X.font='bold 12px -apple-system, system-ui, sans-serif';
    X.fillText('PRÓXIMO MARCO', padX+12, y+16);

    X.fillStyle='#fff';
    X.font='bold 14px -apple-system, system-ui, sans-serif';
    if (nextTitle) {
      X.fillText(nextTitle.icon + ' ' + nextTitle.name, padX+12, y+36);
      X.fillStyle='rgba(255,255,255,0.58)';
      X.font='10px -apple-system, system-ui, sans-serif';
      X.fillText(nextTitle.desc, padX+12, y+52);
    } else {
      X.fillText('👑 Você desbloqueou todos os títulos.', padX+12, y+38);
    }

    const last = careerMeta.lastRunSummary;
    X.textAlign='right';
    X.fillStyle='rgba(255,255,255,0.55)';
    X.font='10px -apple-system, system-ui, sans-serif';
    X.fillText('ÚLTIMA RUN', padX+cardW-12, y+16);
    X.fillStyle='#ffd32a';
    X.font='bold 16px -apple-system, system-ui, sans-serif';
    X.fillText(last ? ('+' + (last.xp || 0) + ' XP') : '--', padX+cardW-12, y+38);
    X.fillStyle='rgba(255,255,255,0.46)';
    X.font='10px -apple-system, system-ui, sans-serif';
    X.fillText(last && last.leveled ? ('+ ' + last.leveled + ' nível') : 'sem nível novo', padX+cardW-12, y+56);
  }

  // Extend menu routing
  const _origDrawMenuUI = typeof drawMenuUI === 'function' ? drawMenuUI : null;
  if (_origDrawMenuUI) {
    drawMenuUI = function(){
      menuBtnAreas = [];
      if (menuScreen === 'career') {
        drawCareerMenu();
        return;
      }
      _origDrawMenuUI.apply(this, arguments);
      if (menuScreen === 'main') {
        drawCareerMetaButton();
      }
    };
  }

  window.getCareerMeta = ()=>careerMeta;
})();
