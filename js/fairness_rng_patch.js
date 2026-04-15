
(function(){
  const fairnessState = {
    branchSetsSinceGold: 0,
    capturesSincePowerup: 0,
    firstPowerupGranted: false
  };

  function resetFairnessState(){
    fairnessState.branchSetsSinceGold = 0;
    fairnessState.capturesSincePowerup = 0;
    fairnessState.firstPowerupGranted = false;
  }

  function isHazardNode(n){
    return !!(n && (n.moving || n.disappearing || n.teleporting));
  }

  function limitBranchHazards(branches, phase){
    const maxHazards = phase >= 6 ? 2 : 1;
    let hazards = 0;
    for(const b of branches){
      if (b.tier === 'easy' || b.tier === 'gold') {
        b.moving = false;
        b.disappearing = false;
        b.teleporting = false;
      }
      if (b.tier === 'medium' && phase < 6) {
        b.moving = false;
        b.disappearing = false;
        b.teleporting = false;
      }
      if (isHazardNode(b)) {
        hazards += 1;
        if (hazards > maxHazards) {
          b.moving = false;
          b.disappearing = false;
          b.teleporting = false;
        } else {
          b.captureR += 4;
        }
      }
    }
  }


  function isMobilePortraitGameplay(){
    try {
      return H > W && Math.min(W, H) <= 900;
    } catch (e) {
      return false;
    }
  }

  function getSpawnCameraAnchor(){
    try {
      if (typeof getGameplayCameraAnchor === 'function') {
        return getGameplayCameraAnchor(false) || { x:0.5, y:0.5 };
      }
    } catch (e) {}
    return { x:0.5, y:0.5 };
  }

  function isSpawnInsideGameplayView(x, y, fromNode){
    if (!isMobilePortraitGameplay() || !fromNode) return true;

    const anchor = getSpawnCameraAnchor();
    const padX = Math.max(34, W * 0.08);
    const padTop = Math.max(84, H * 0.10);
    const padBottom = Math.max(48, H * 0.06);

    const left = fromNode.x - W * anchor.x + padX;
    const right = fromNode.x + W * (1 - anchor.x) - padX;
    const top = fromNode.y - H * anchor.y + padTop;
    const bottom = fromNode.y + H * (1 - anchor.y) - padBottom;

    return x >= left && x <= right && y >= top && y <= bottom;
  }

  function canPlaceAsteroid(ax, ay, fromNode, targetNode){
    if (!fromNode || !targetNode) return false;
    if (dist(ax, ay, fromNode.x, fromNode.y) < 42) return false;
    if (dist(ax, ay, targetNode.x, targetNode.y) < 42) return false;
    for (const a of asteroids) {
      if (dist(ax, ay, a.x, a.y) < 34) return false;
    }
    return true;
  }

  const _origGetCaptureR = typeof getCaptureR === 'function' ? getCaptureR : null;
  getCaptureR = function(tier){
    const base = {easy:64, medium:54, hard:44, gold:40};
    const floor = {easy:38, medium:36, hard:34, gold:32};
    let r = base[tier] || 52;
    if (zenMode) r += 15;

    const ev = (typeof getActiveEvent === 'function') ? getActiveEvent() : null;
    if (ev && ev.id === 'calm_orbit' && (tier === 'easy' || tier === 'medium')) r += 6;

    const phase = typeof getPhase === 'function' ? getPhase() : 1;
    if (!zenMode && phase >= 5 && (tier === 'hard' || tier === 'gold')) r += 2;

    const shrink = zenMode ? 0 : Math.min(score * 0.10, 8);
    return Math.max(r - shrink, floor[tier] || 34);
  };

  const _origGetOrbitSpeed = typeof getOrbitSpeed === 'function' ? getOrbitSpeed : null;
  getOrbitSpeed = function(){
    if (zenMode) return 2.2;
    return Math.min(3.0 + score * 0.042, 6.8);
  };

  const _origGetGravityStrength = typeof getGravityStrength === 'function' ? getGravityStrength : null;
  getGravityStrength = function(){
    if (zenMode) return 30;
    if (score < 30) return 0;
    return Math.min((score - 30) * 1.2, 45);
  };

  const _origGetComboWindow = typeof getComboWindow === 'function' ? getComboWindow : null;
  getComboWindow = function(){
    const ev = (typeof getActiveEvent === 'function') ? getActiveEvent() : null;
    if (ev && ev.id === 'combo_fever') return 3.2;
    if (score < 25) return 2.8;
    if (score < 60) return 2.65;
    return 2.5;
  };

  const _origPlaceBranch = typeof placeBranch === 'function' ? placeBranch : null;
  placeBranch = function(fromNode, tier, angleOffset){
    const t = TIERS[tier];
    const mobilePortrait = isMobilePortraitGameplay();
    const distScale = mobilePortrait ? 0.82 : 1;
    const angleScale = mobilePortrait ? 0.82 : 1;
    const baseDist = (220 + Math.min(score * 1.6, 80)) * distScale;
    const baseAngle = -Math.PI/2 + (angleOffset * angleScale);

    let nx, ny, attempts = 0, distance;
    do {
      distance = baseDist * t.distMul + rand(mobilePortrait ? -18 : -24, mobilePortrait ? 18 : 24);
      const angle = baseAngle + rand(-0.16, 0.16) * angleScale;
      nx = fromNode.x + Math.cos(angle) * distance;
      ny = fromNode.y + Math.sin(angle) * distance;
      attempts++;
    } while(attempts < 28 && (isTooClose(nx, ny, mobilePortrait ? 146 : 158) || !isSpawnInsideGameplayView(nx, ny, fromNode)));

    const phase = getPhase();
    let isMoving = false;
    let isDisappearing = false;
    let isTeleporting = false;

    if (!zenMode && tier === 'hard') {
      if (phase >= 5 && Math.random() < 0.16) isMoving = true;
      if (phase >= 5 && !isMoving && Math.random() < 0.10) isDisappearing = true;
      if (phase >= 6 && !isMoving && !isDisappearing && Math.random() < 0.12) isTeleporting = true;
    } else if (!zenMode && tier === 'medium' && phase >= 6) {
      if (Math.random() < 0.08) isMoving = true;
    }

    return {
      x:nx, y:ny, baseX:nx, baseY:ny,
      tier, pts:t.pts, label:t.label,
      colorIdx: tier,
      nodeR: NODE_R * t.sizeMul,
      captureR: getCaptureR(tier),
      pulse: rand(0,Math.PI*2),
      captured:false, passed:false,
      moving:isMoving,
      mSpeed:isMoving ? rand(1.1, 1.9) : 0,
      mAngle:rand(0,Math.PI*2),
      mRadius:isMoving ? rand(12, 22) : 0,
      disappearing:isDisappearing,
      disappearTimer:isDisappearing ? rand(3.0, 4.4) : 0,
      visible:true,
      teleporting:isTeleporting,
      teleportTimer:isTeleporting ? rand(2.8, 4.2) : 0,
      teleportFlash:0,
      branchGroup:-1,
    };
  };

  const _origSpawnBranches = typeof spawnBranches === 'function' ? spawnBranches : null;
  spawnBranches = function(fromNode, groupId){
    const phase = getPhase();
    const branches = [];

    if (phase <= 1) {
      branches.push(placeBranch(fromNode, 'easy', rand(-0.88,-0.52)));
      branches.push(placeBranch(fromNode, 'medium', rand(0.52,0.88)));
    } else if (phase <= 2) {
      branches.push(placeBranch(fromNode, 'easy', rand(-0.98,-0.55)));
      branches.push(placeBranch(fromNode, 'medium', rand(0.55,0.98)));
      if (score >= 12 && Math.random() < 0.18) {
        branches.push(placeBranch(fromNode, 'hard', rand(-0.16, 0.16)));
      }
    } else if (phase <= 3) {
      branches.push(placeBranch(fromNode, 'easy', rand(-1.0,-0.62)));
      branches.push(placeBranch(fromNode, 'medium', rand(-0.12,0.12)));
      branches.push(placeBranch(fromNode, 'hard', rand(0.62,1.0)));
    } else {
      const goldChance = phase >= 6 ? 0.26 : (phase === 5 ? 0.22 : 0.16);
      const forceGold = fairnessState.branchSetsSinceGold >= 3;

      branches.push(placeBranch(fromNode, 'easy', rand(-1.0,-0.64)));
      branches.push(placeBranch(fromNode, 'hard', rand(0.64,1.0)));

      if (forceGold || Math.random() < goldChance) {
        branches.push(placeBranch(fromNode, 'gold', rand(-0.10, 0.10)));
        fairnessState.branchSetsSinceGold = 0;
      } else {
        branches.push(placeBranch(fromNode, 'medium', rand(-0.10, 0.10)));
        fairnessState.branchSetsSinceGold += 1;
      }
    }

    limitBranchHazards(branches, phase);

    if (phase >= 4 && !zenMode && score >= 35) {
      let asteroidsAdded = 0;
      const maxAsteroids = phase >= 6 ? 2 : 1;

      for (const b of branches) {
        if (asteroidsAdded >= maxAsteroids) break;
        if (b.tier === 'easy' || b.tier === 'gold') continue;
        if (phase < 6 && b.tier === 'medium') continue;

        const chance = phase === 4 ? 0.12 : (phase === 5 ? 0.18 : 0.24);
        if (Math.random() >= chance) continue;

        const dx = b.x - fromNode.x;
        const dy = b.y - fromNode.y;
        const len = Math.sqrt(dx*dx + dy*dy) || 1;
        const mx = (fromNode.x + b.x) / 2;
        const my = (fromNode.y + b.y) / 2;
        const nx = -dy / len;
        const ny = dx / len;
        const side = Math.random() < 0.5 ? -1 : 1;
        const lateral = rand(28, 52) * side;
        const along = rand(-18, 18);

        const ax = mx + nx * lateral + (dx / len) * along;
        const ay = my + ny * lateral + (dy / len) * along;

        if (!canPlaceAsteroid(ax, ay, fromNode, b)) continue;

        asteroids.push({
          x: ax,
          y: ay,
          r: rand(9, 13),
          rot: rand(0, Math.PI * 2),
          rotSpd: rand(-1.2, 1.2),
          vertices: genAsteroidShape()
        });
        asteroidsAdded += 1;
      }
    }

    branches.forEach(b => {
      b.branchGroup = groupId;
      nodes.push(b);
    });
  };

  const _origChoosePowerupType = typeof choosePowerupType === 'function' ? choosePowerupType : null;
  choosePowerupType = function(){
    const phase = getPhase();

    if (!fairnessState.firstPowerupGranted) {
      return 'shield';
    }

    if (fairnessState.capturesSincePowerup >= 7) {
      return 'shield';
    }

    const r = Math.random();
    if (phase <= 3) {
      if (r < 0.48) return 'shield';
      if (r < 0.80) return 'slowmo';
      return 'magnet';
    }
    if (phase <= 5) {
      if (r < 0.40) return 'shield';
      if (r < 0.72) return 'slowmo';
      return 'magnet';
    }
    if (r < 0.34) return 'shield';
    if (r < 0.62) return 'slowmo';
    return 'magnet';
  };

  const _origSpawnPowerup = typeof spawnPowerup === 'function' ? spawnPowerup : null;
  spawnPowerup = function(){
    const cn = nodes[ball.currentNode];
    if (!cn) return;

    let target = null;
    for (let i = ball.currentNode + 1; i < nodes.length; i++) {
      if (!nodes[i].captured && nodes[i].visible) {
        target = nodes[i];
        break;
      }
    }
    if (!target) return;

    const dx = target.x - cn.x;
    const dy = target.y - cn.y;
    const len = Math.sqrt(dx*dx + dy*dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;

    const t = fairnessState.capturesSincePowerup >= 7 ? 0.58 : 0.52;
    const mx = cn.x + dx * t + nx * rand(-22, 22);
    const my = cn.y + dy * t + ny * rand(-22, 22);

    const type = choosePowerupType();

    powerups.push({
      x: mx, y: my, type, life: 14,
      pulse: rand(0, Math.PI * 2), bobY: 0,
      spawnT: 0,
    });
  };

  const _origCollectPowerup = typeof collectPowerup === 'function' ? collectPowerup : null;
  collectPowerup = function(p){
    fairnessState.capturesSincePowerup = 0;
    fairnessState.firstPowerupGranted = true;
    return _origCollectPowerup.apply(this, arguments);
  };

  const _origCapture = typeof capture === 'function' ? capture : null;
  capture = function(nodeIdx){
    const result = _origCapture.apply(this, arguments);
    fairnessState.capturesSincePowerup += 1;
    return result;
  };

  const _origReset = typeof reset === 'function' ? reset : null;
  reset = function(){
    resetFairnessState();
    return _origReset.apply(this, arguments);
  };

  console.log('[Orbita] fairness_rng_patch loaded');
})();
