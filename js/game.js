import { ST, BALL_R, NODE_R, ORBIT_R_MIN, ORBIT_R_MAX, TIERS, SKINS, BACKGROUNDS } from './data.js';

export function createGame(canvas, services) {
  const X = canvas.getContext('2d');
  let dpr = 1;
  let W = 0;
  let H = 0;

  const state = {
    mode: ST.MENU,
    menuScreen: 'main',
    score: 0,
    best: 0,
    totalGames: 0,
    selectedSkin: 'default',
    selectedBg: 'space',
    unlockedSkins: ['default'],
    unlockedBgs: ['space'],
    muted: false,
    musicVol: 0.5,
    sfxVol: 0.8,
    vibrationOn: true,
    phaseMsg: '',
    phaseMsgT: 0,
    shakeT: 0,
    shakeA: 0,
    flashA: 0,
    menuT: 0,
    deathT: 0,
    combo: 0,
    comboTimer: 0,
    lastCaptureTime: 0,
    newRec: false,
    showResetConfirm: false,
    currentUser: null,
    playerName: '',
    rankings: [],
    rankingsLoading: false,
    rankingsError: '',
    authLoading: true,
  };

  const cam = { x: 0, y: 0, tx: 0, ty: 0, zoom: 1, tz: 1 };
  const ball = { x: 0, y: 0, vx: 0, vy: 0, angle: 0, orbiting: true, currentNode: 0, orbitRadius: 44, orbitDir: 1, trail: [], glow: 0, squash: 1, speed: 0 };
  let nodes = [];
  let stars = [];
  let particles = [];
  let menuBtnAreas = [];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 3);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    X.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function rand(a, b) { return a + Math.random() * (b - a); }
  function clamp(v, mn, mx) { return Math.max(mn, Math.min(mx, v)); }
  function dist(x1, y1, x2, y2) { return Math.hypot(x2 - x1, y2 - y1); }

  function loadData() {
    try {
      const saved = JSON.parse(localStorage.getItem('orbita_save') || '{}');
      state.best = saved.best || 0;
      state.totalGames = saved.totalGames || 0;
      state.muted = !!saved.muted;
      state.selectedSkin = saved.selectedSkin || 'default';
      state.selectedBg = saved.selectedBg || 'space';
      state.unlockedSkins = saved.unlockedSkins || ['default'];
      state.unlockedBgs = saved.unlockedBgs || ['space'];
      state.musicVol = saved.musicVol ?? 0.5;
      state.sfxVol = saved.sfxVol ?? 0.8;
      state.vibrationOn = saved.vibrationOn ?? true;
    } catch (e) {
      console.error(e);
    }
  }

  function saveData() {
    localStorage.setItem('orbita_save', JSON.stringify({
      best: state.best,
      totalGames: state.totalGames,
      muted: state.muted,
      selectedSkin: state.selectedSkin,
      selectedBg: state.selectedBg,
      unlockedSkins: state.unlockedSkins,
      unlockedBgs: state.unlockedBgs,
      musicVol: state.musicVol,
      sfxVol: state.sfxVol,
      vibrationOn: state.vibrationOn,
    }));
  }

  function initStars() {
    stars = [];
    for (let i = 0; i < 120; i++) {
      stars.push({ x: rand(-W, W * 2), y: rand(-H, H * 2), size: rand(0.5, 2), alpha: rand(0.1, 0.5), twinkle: rand(1, 4), phase: rand(0, Math.PI * 2) });
    }
  }

  function getPhase() {
    const s = state.score;
    if (s < 10) return 1;
    if (s < 25) return 2;
    if (s < 40) return 3;
    if (s < 60) return 4;
    if (s < 100) return 5;
    return 6;
  }

  function getCaptureR(tier) {
    const base = { easy: 62, medium: 50, hard: 38, gold: 34 };
    return Math.max((base[tier] || 50) - Math.min(state.score * 0.15, 12), 28);
  }

  function getOrbitSpeed() { return 3 + state.score * 0.05; }

  function initNodes() {
    nodes = [{ x: W / 2, y: H / 2, tier: 'medium', pts: 0, label: '', nodeR: NODE_R, captureR: 55, pulse: 0, captured: true, visible: true, branchGroup: -1 }];
    spawnBranches(nodes[0], 0);
  }

  function placeBranch(fromNode, tier, angleOffset) {
    const t = TIERS[tier];
    const baseDist = 220 + Math.min(state.score * 2, 100);
    const angle = -Math.PI / 2 + angleOffset + rand(-0.25, 0.25);
    const distance = baseDist * t.distMul + rand(-40, 40);
    const x = fromNode.x + Math.cos(angle) * distance;
    const y = fromNode.y + Math.sin(angle) * distance;
    return {
      x, y, tier, pts: t.pts, label: t.label, nodeR: NODE_R * t.sizeMul, captureR: getCaptureR(tier), pulse: rand(0, Math.PI * 2), captured: false, visible: true, branchGroup: -1,
    };
  }

  function spawnBranches(fromNode, groupId) {
    const phase = getPhase();
    const branches = [];
    branches.push(placeBranch(fromNode, 'easy', rand(-1.0, -0.4)));
    branches.push(placeBranch(fromNode, phase >= 3 ? 'hard' : 'medium', rand(0.4, 1.0)));
    if (phase >= 3) branches.push(placeBranch(fromNode, Math.random() < 0.25 ? 'gold' : 'medium', rand(-0.2, 0.2)));
    branches.forEach((b) => { b.branchGroup = groupId; nodes.push(b); });
  }

  function reset() {
    state.score = 0;
    state.newRec = false;
    state.deathT = 0;
    state.combo = 0;
    state.comboTimer = 0;
    state.lastCaptureTime = 0;
    particles = [];
    initNodes();
    ball.currentNode = 0;
    ball.orbiting = true;
    ball.angle = 0;
    ball.orbitRadius = 44;
    ball.orbitDir = 1;
    ball.vx = 0;
    ball.vy = 0;
    ball.trail = [];
    const n = nodes[0];
    ball.x = n.x + Math.cos(ball.angle) * ball.orbitRadius;
    ball.y = n.y + Math.sin(ball.angle) * ball.orbitRadius;
    cam.x = n.x - W / 2;
    cam.y = n.y - H / 2;
    cam.tx = cam.x;
    cam.ty = cam.y;
  }

  function beginPlay() {
    reset();
    state.mode = ST.PLAY;
  }

  function release() {
    if (!ball.orbiting) return;
    const tang = ball.angle + (ball.orbitDir * Math.PI / 2);
    const speed = getOrbitSpeed() * ball.orbitRadius * 2.2;
    ball.vx = Math.cos(tang) * speed;
    ball.vy = Math.sin(tang) * speed;
    ball.orbiting = false;
  }

  function emit(x, y, n, color) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = 30 + Math.random() * 120;
      particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, decay: 1.5, size: 1.5 + Math.random() * 3, color });
    }
  }

  function capture(nodeIdx) {
    const n = nodes[nodeIdx];
    n.captured = true;
    ball.currentNode = nodeIdx;
    ball.orbiting = true;
    ball.angle = Math.atan2(ball.y - n.y, ball.x - n.x);
    ball.orbitRadius = clamp(dist(ball.x, ball.y, n.x, n.y), ORBIT_R_MIN, ORBIT_R_MAX);
    ball.orbitDir = Math.random() < 0.5 ? 1 : -1;

    const now = performance.now() / 1000;
    state.combo = now - state.lastCaptureTime < 2.5 && state.lastCaptureTime > 0 ? state.combo + 1 : 1;
    state.lastCaptureTime = now;
    state.comboTimer = 2;

    const comboMul = state.combo >= 5 ? 2 : state.combo >= 3 ? 1.5 : 1;
    state.score += Math.ceil((n.pts || 1) * comboMul);
    emit(n.x, n.y, 12, TIERS[n.tier]?.color.main || '#fff');

    const grp = n.branchGroup;
    nodes = nodes.filter((item, idx) => idx === nodeIdx || item.branchGroup !== grp || item.captured);
    spawnBranches(n, (grp >= 0 ? grp : 0) + 1);
  }

  async function die() {
    if (state.mode !== ST.PLAY) return;
    state.mode = ST.DEAD;
    state.totalGames += 1; // corrigido: conta somente ao fim da partida
    state.deathT = 0;
    if (state.score > state.best) {
      state.best = state.score;
      state.newRec = true;
      if (state.currentUser && state.playerName && state.score >= 5) {
        try {
          await services.submitScore({ userId: state.currentUser.id, playerName: state.playerName, score: state.score, skin: state.selectedSkin });
        } catch (e) {
          console.error(e);
        }
      }
    }
    saveData();
  }

  function update(dt) {
    state.menuT += dt;
    if (state.comboTimer > 0) {
      state.comboTimer -= dt;
      if (state.comboTimer <= 0) state.combo = 0;
    }
    for (const p of particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.life -= p.decay * dt;
    }
    particles = particles.filter((p) => p.life > 0);

    if (state.mode === ST.DEAD) {
      state.deathT += dt;
      return;
    }
    if (state.mode !== ST.PLAY) return;

    if (ball.orbiting) {
      const n = nodes[ball.currentNode];
      ball.angle += ball.orbitDir * getOrbitSpeed() * dt;
      ball.x = n.x + Math.cos(ball.angle) * ball.orbitRadius;
      ball.y = n.y + Math.sin(ball.angle) * ball.orbitRadius;
    } else {
      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (n.captured || !n.visible) continue;
        if (dist(ball.x, ball.y, n.x, n.y) < n.captureR) {
          capture(i);
          return;
        }
      }
      let anyReachable = false;
      const cn = nodes[ball.currentNode];
      for (const n of nodes) {
        if (n.captured || !n.visible) continue;
        const dOrigin = dist(cn.x, cn.y, n.x, n.y);
        const dBall = dist(ball.x, ball.y, n.x, n.y);
        if (dBall < dOrigin + 200) { anyReachable = true; break; }
      }
      if (!anyReachable) die();
    }

    ball.trail.push({ x: ball.x, y: ball.y, a: 1 });
    if (ball.trail.length > 25) ball.trail.shift();
    for (const t of ball.trail) t.a -= 3.5 * dt;
    ball.trail = ball.trail.filter((t) => t.a > 0);
    cam.tx = (ball.orbiting ? nodes[ball.currentNode].x : ball.x) - W / 2;
    cam.ty = (ball.orbiting ? nodes[ball.currentNode].y : ball.y) - H / 2;
    cam.x += (cam.tx - cam.x) * 4 * dt;
    cam.y += (cam.ty - cam.y) * 4 * dt;
  }

  function roundRect(x, y, w, h, r) {
    X.beginPath();
    X.moveTo(x + r, y);
    X.lineTo(x + w - r, y);
    X.quadraticCurveTo(x + w, y, x + w, y + r);
    X.lineTo(x + w, y + h - r);
    X.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    X.lineTo(x + r, y + h);
    X.quadraticCurveTo(x, y + h, x, y + h - r);
    X.lineTo(x, y + r);
    X.quadraticCurveTo(x, y, x + r, y);
    X.closePath();
  }

  function drawAccessory(type, skin, r) {
    X.save();
    switch (type) {
      case 'tophat':
        X.fillStyle = '#1a1a1a'; X.fillRect(-7, -15, 14, 3); X.fillRect(-5, -23, 10, 8); X.fillStyle = '#ff0000'; X.fillRect(-5, -17, 10, 1.5); break;
      case 'glasses':
        X.strokeStyle = '#1a1a2e'; X.lineWidth = 1.5; X.beginPath(); X.arc(-3.5, -1, 3.5, 0, Math.PI * 2); X.stroke(); X.beginPath(); X.arc(3.5, -1, 3.5, 0, Math.PI * 2); X.stroke(); break;
      case 'cap':
        X.fillStyle = '#ff4757'; X.beginPath(); X.arc(0, -3, 9, Math.PI, 0); X.fill(); X.fillRect(2, -4, 12, 2); break;
      case 'crown':
      case 'royalCrown':
        X.fillStyle = '#ffd700'; X.beginPath(); X.moveTo(-8, -8); X.lineTo(-8, -13); X.lineTo(-5, -10); X.lineTo(-2, -15); X.lineTo(0, -10); X.lineTo(2, -15); X.lineTo(5, -10); X.lineTo(8, -13); X.lineTo(8, -8); X.closePath(); X.fill(); break;
      case 'flames':
        X.fillStyle = '#ff4500';
        for (let i = 0; i < 5; i++) {
          const a = -Math.PI / 2 + (i - 2) * 0.4;
          const len = 8 + Math.sin(state.menuT * 8 + i) * 3;
          X.beginPath();
          X.moveTo(Math.cos(a - 0.15) * r, Math.sin(a - 0.15) * r);
          X.quadraticCurveTo(Math.cos(a) * (r + len * 0.5), Math.sin(a) * (r + len * 0.5), Math.cos(a) * (r + len), Math.sin(a) * (r + len));
          X.quadraticCurveTo(Math.cos(a) * (r + len * 0.5), Math.sin(a) * (r + len * 0.5), Math.cos(a + 0.15) * r, Math.sin(a + 0.15) * r);
          X.closePath(); X.fill();
        }
        break;
      case 'iceShards':
        X.fillStyle = '#80ffff';
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2; const x1 = Math.cos(a) * r; const y1 = Math.sin(a) * r;
          X.beginPath(); X.moveTo(x1 - 2, y1); X.lineTo(Math.cos(a) * (r + 6), Math.sin(a) * (r + 6)); X.lineTo(x1 + 2, y1); X.closePath(); X.fill();
        }
        break;
      case 'helmet':
        X.fillStyle = '#a0a0c0'; X.beginPath(); X.arc(0, -4, r + 2, Math.PI, Math.PI * 2); X.lineTo(r + 2, 3); X.lineTo(-r - 2, 3); X.closePath(); X.fill(); break;
      case 'skull':
        X.fillStyle = '#f0f0f0'; X.beginPath(); X.arc(0, -2, r - 1, 0, Math.PI * 2); X.fill(); break;
      case 'horns':
        X.fillStyle = '#1a0000'; X.beginPath(); X.moveTo(-6, -6); X.quadraticCurveTo(-12, -12, -9, -16); X.quadraticCurveTo(-7, -14, -4, -7); X.closePath(); X.fill(); X.beginPath(); X.moveTo(6, -6); X.quadraticCurveTo(12, -12, 9, -16); X.quadraticCurveTo(7, -14, 4, -7); X.closePath(); X.fill(); break;
      case 'galaxy':
        for (let i = 0; i < 12; i++) {
          const a = state.menuT * 1.5 + (i / 12) * Math.PI * 2;
          const d = r + 3 + Math.sin(state.menuT * 3 + i) * 2;
          X.fillStyle = i % 3 === 0 ? '#ffffff' : (i % 3 === 1 ? '#a0a0ff' : '#ff80ff');
          X.beginPath(); X.arc(Math.cos(a) * d, Math.sin(a) * d, 1.5, 0, Math.PI * 2); X.fill();
        }
        break;
    }
    X.restore();
  }

  function drawBallAt(bx, by, skinKey) {
    const skin = SKINS[skinKey] || SKINS.default;
    const r = BALL_R;
    X.save();
    X.translate(bx, by);
    const bg = X.createRadialGradient(-2, -2, 0, 0, 0, r);
    bg.addColorStop(0, '#ffffff'); bg.addColorStop(0.4, skin.color); bg.addColorStop(1, skin.color2);
    X.fillStyle = bg; X.beginPath(); X.arc(0, 0, r, 0, Math.PI * 2); X.fill();
    X.fillStyle = '#1a1a2e'; X.beginPath(); X.arc(-3.5, -1, 2, 0, Math.PI * 2); X.fill(); X.beginPath(); X.arc(3.5, -1, 2, 0, Math.PI * 2); X.fill();
    if (skin.accessory) drawAccessory(skin.accessory, skin, r);
    X.restore();
  }

  function drawBackground() {
    const bg = BACKGROUNDS[state.selectedBg] || BACKGROUNDS.space;
    if (bg.type === 'nebula') {
      X.fillStyle = '#0a0518'; X.fillRect(0, 0, W, H);
      const g = X.createRadialGradient(W * 0.3, H * 0.4, 0, W * 0.3, H * 0.4, W * 0.6);
      g.addColorStop(0, 'rgba(150,50,200,0.3)'); g.addColorStop(1, 'rgba(150,50,200,0)');
      X.fillStyle = g; X.fillRect(0, 0, W, H);
      return;
    }
    X.fillStyle = '#05050f'; X.fillRect(0, 0, W, H);
  }

  function drawWorld() {
    for (const s of stars) {
      const sx = s.x - cam.x, sy = s.y - cam.y;
      if (sx < -30 || sx > W + 30 || sy < -30 || sy > H + 30) continue;
      X.globalAlpha = s.alpha * (0.6 + 0.4 * Math.sin(state.menuT * s.twinkle + s.phase));
      X.fillStyle = '#d4c5ff'; X.beginPath(); X.arc(sx, sy, s.size, 0, Math.PI * 2); X.fill();
    }
    X.globalAlpha = 1;

    for (const n of nodes) {
      const nx = n.x - cam.x, ny = n.y - cam.y;
      const col = TIERS[n.tier]?.color || TIERS.medium.color;
      if (!n.captured) {
        X.globalAlpha = 0.06; X.fillStyle = col.main; X.beginPath(); X.arc(nx, ny, n.captureR, 0, Math.PI * 2); X.fill(); X.globalAlpha = 1;
      }
      const r = n.nodeR + Math.sin(n.pulse + state.menuT * 2) * 2;
      X.fillStyle = n.captured ? 'rgba(60,60,80,0.35)' : col.main;
      X.beginPath(); X.arc(nx, ny, r, 0, Math.PI * 2); X.fill();
      if (!n.captured && n.label) { X.fillStyle = '#fff'; X.font = 'bold 11px sans-serif'; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText(n.label, nx, ny); }
    }

    for (const t of ball.trail) {
      X.globalAlpha = t.a * 0.35; X.fillStyle = '#fff'; X.beginPath(); X.arc(t.x - cam.x, t.y - cam.y, BALL_R * t.a * 0.5, 0, Math.PI * 2); X.fill();
    }
    X.globalAlpha = 1;
    drawBallAt(ball.x - cam.x, ball.y - cam.y, state.selectedSkin);

    for (const p of particles) {
      X.globalAlpha = Math.max(0, p.life); X.fillStyle = p.color; X.beginPath(); X.arc(p.x - cam.x, p.y - cam.y, p.size * Math.max(0.2, p.life), 0, Math.PI * 2); X.fill();
    }
    X.globalAlpha = 1;
  }

  function drawButton(x, y, w, h, label, color, action) {
    X.fillStyle = 'rgba(0,0,0,0.65)'; roundRect(x, y, w, h, 12); X.fill();
    X.strokeStyle = color; X.lineWidth = 2; roundRect(x, y, w, h, 12); X.stroke();
    X.fillStyle = color; X.font = 'bold 18px sans-serif'; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText(label, x + w / 2, y + h / 2);
    menuBtnAreas.push({ x, y, w, h, action });
  }

  function drawMenu() {
    X.textAlign = 'center'; X.textBaseline = 'middle';
    X.fillStyle = '#e0e0ff'; X.font = 'bold 56px sans-serif'; X.fillText('ÓRBITA', W / 2, H * 0.18);
    drawBallAt(W / 2, H * 0.34 + Math.sin(state.menuT * 2) * 8, state.selectedSkin);
    const btnW = Math.min(W * 0.72, 280); const btnH = 44; const x = (W - btnW) / 2; let y = H * 0.46;
    drawButton(x, y, btnW, btnH, 'JOGAR', '#00f5d4', beginPlay); y += 54;
    drawButton(x, y, btnW, btnH, 'RANKING', '#ff6b9d', async () => { state.menuScreen = 'ranking'; state.rankingsLoading = true; try { state.rankings = await services.loadRankings(); state.rankingsError = ''; } catch (e) { state.rankingsError = 'Erro ao carregar'; } state.rankingsLoading = false; }); y += 54;
    drawButton(x, y, btnW, btnH, 'CONFIGURAÇÕES', '#a0a0c0', () => { state.menuScreen = 'settings'; });
    X.fillStyle = 'rgba(255,255,255,0.45)'; X.font = '14px sans-serif'; X.fillText('RECORDE: ' + state.best, W / 2, H * 0.92);
  }

  function drawSettings() {
    X.fillStyle = '#e0e0ff'; X.font = 'bold 28px sans-serif'; X.textAlign = 'center'; X.fillText('CONFIGURAÇÕES', W / 2, H * 0.08);
    drawButton(20, H * 0.04, 84, 34, 'VOLTAR', '#fff', () => { state.menuScreen = 'main'; state.showResetConfirm = false; });
    const x = (W - Math.min(W * 0.8, 300)) / 2; const w = Math.min(W * 0.8, 300); let y = H * 0.24;
    drawButton(x, y, w, 40, state.muted ? 'ATIVAR SOM' : 'MUTAR', '#70a1ff', () => { state.muted = !state.muted; saveData(); }); y += 56;
    drawButton(x, y, w, 40, 'RESETAR PROGRESSO', '#ffa502', () => { state.showResetConfirm = true; });
    if (state.showResetConfirm) {
      X.fillStyle = 'rgba(0,0,0,0.75)'; X.fillRect(0, 0, W, H);
      const cw = Math.min(W * 0.82, 320), ch = 180, cx = (W - cw) / 2, cy = (H - ch) / 2;
      X.fillStyle = 'rgba(15,10,25,0.96)'; roundRect(cx, cy, cw, ch, 16); X.fill(); X.strokeStyle = '#ffa502'; X.lineWidth = 2; roundRect(cx, cy, cw, ch, 16); X.stroke();
      X.fillStyle = '#fff'; X.font = 'bold 20px sans-serif'; X.fillText('Resetar progresso local?', W / 2, cy + 42);
      X.fillStyle = 'rgba(255,255,255,0.7)'; X.font = '12px sans-serif'; X.fillText('Skins, fundos e recordes locais serão apagados.', W / 2, cy + 72);
      drawButton(cx + 16, cy + 116, (cw - 48) / 2, 40, 'CANCELAR', '#aaa', () => { state.showResetConfirm = false; });
      drawButton(cx + 32 + (cw - 48) / 2, cy + 116, (cw - 48) / 2, 40, 'RESETAR', '#ffa502', () => {
        localStorage.removeItem('orbita_save');
        state.best = 0; state.totalGames = 0; state.selectedSkin = 'default'; state.selectedBg = 'space'; state.unlockedSkins = ['default']; state.unlockedBgs = ['space'];
        state.showResetConfirm = false; saveData();
      });
    }
  }

  function drawRanking() {
    X.fillStyle = '#e0e0ff'; X.font = 'bold 28px sans-serif'; X.textAlign = 'center'; X.fillText('RANKING GLOBAL', W / 2, H * 0.08);
    drawButton(20, H * 0.04, 84, 34, 'VOLTAR', '#fff', () => { state.menuScreen = 'main'; });
    if (state.rankingsLoading) { X.fillStyle = '#fff'; X.fillText('Carregando...', W / 2, H * 0.5); return; }
    if (state.rankingsError) { X.fillStyle = '#ff6b6b'; X.fillText(state.rankingsError, W / 2, H * 0.5); return; }
    const startY = H * 0.16; const rowH = 42;
    state.rankings.slice(0, 10).forEach((r, i) => {
      const y = startY + i * rowH;
      X.fillStyle = 'rgba(0,0,0,0.55)'; roundRect(15, y, W - 30, rowH - 4, 8); X.fill();
      X.strokeStyle = i === 0 ? '#ffd32a' : 'rgba(255,255,255,0.15)'; X.lineWidth = 1.5; roundRect(15, y, W - 30, rowH - 4, 8); X.stroke();
      X.fillStyle = '#fff'; X.font = 'bold 14px sans-serif'; X.textAlign = 'left'; X.fillText(`#${i + 1}  ${r.name}`, 28, y + rowH / 2 - 2);
      X.textAlign = 'right'; X.fillText(String(r.score), W - 28, y + rowH / 2 - 2);
    });
  }

  function drawDead() {
    X.fillStyle = 'rgba(0,0,0,0.7)'; X.fillRect(0, 0, W, H);
    X.fillStyle = '#ff6b6b'; X.font = 'bold 36px sans-serif'; X.textAlign = 'center'; X.fillText('PERDIDO NO ESPAÇO', W / 2, H * 0.18);
    X.fillStyle = '#fff'; X.font = 'bold 56px sans-serif'; X.fillText(String(state.score), W / 2, H * 0.42);
    X.font = '14px sans-serif'; X.fillStyle = 'rgba(255,255,255,0.5)'; X.fillText('RECORDE: ' + state.best, W / 2, H * 0.5);
    const btnW = Math.min(W * 0.72, 280); const x = (W - btnW) / 2;
    drawButton(x, H * 0.68, btnW, 44, 'JOGAR DE NOVO', '#00f5d4', beginPlay);
    drawButton(x, H * 0.75, btnW, 44, 'MENU', '#ff6b9d', () => { state.menuScreen = 'main'; state.mode = ST.MENU; });
  }

  function drawPlayUI() {
    X.fillStyle = '#fff'; X.font = 'bold 50px sans-serif'; X.textAlign = 'center'; X.fillText(String(state.score), W / 2, 56);
    X.fillStyle = 'rgba(255,255,255,0.35)'; X.font = '12px sans-serif'; X.fillText('FASE ' + getPhase(), W / 2, 92);
  }

  function draw() {
    menuBtnAreas = [];
    drawBackground();
    X.save();
    if (state.mode !== ST.MENU) drawWorld();
    X.restore();
    if (state.mode === ST.MENU) {
      if (state.menuScreen === 'main') drawMenu();
      else if (state.menuScreen === 'settings') drawSettings();
      else if (state.menuScreen === 'ranking') drawRanking();
    } else if (state.mode === ST.PLAY) {
      drawPlayUI();
    } else if (state.mode === ST.DEAD) {
      drawDead();
    }
  }

  function handleTap(x, y) {
    for (const b of menuBtnAreas) {
      if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) return b.action();
    }
    if (state.mode === ST.PLAY) release();
  }

  async function initAuth() {
    try {
      const session = await services.getSession();
      if (session?.user) {
        state.currentUser = session.user;
        const profile = await services.loadProfile(session.user.id);
        state.playerName = profile?.name || '';
      }
    } catch (e) {
      console.error(e);
    }
    state.authLoading = false;
  }

  function loop(ts) {
    if (!loop.last) loop.last = ts;
    const dt = Math.min((ts - loop.last) / 1000, 0.05);
    loop.last = ts;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  function mount() {
    loadData();
    resize();
    initStars();
    reset();
    initAuth();
    requestAnimationFrame(loop);
  }

  return { state, resize, mount, handleTap };
}
