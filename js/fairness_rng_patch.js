
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

  function clampValue(value, min, max){
    return Math.min(Math.max(value, min), max);
  }

  function getTierSpawnEdgePadding(tier, phase){
    const capturePad = typeof getCaptureR === 'function' ? getCaptureR(tier) : 48;
    const tierConfig = (typeof TIERS !== 'undefined' && TIERS && TIERS[tier]) ? TIERS[tier] : null;
    const nodePad = (typeof NODE_R === 'number' ? NODE_R : 12) * (tierConfig ? tierConfig.sizeMul : 1);
    const phasePad = phase >= 5 ? 8 : (phase >= 3 ? 4 : 0);
    return Math.max(capturePad + 12, nodePad + 20, 48) + phasePad;
  }

  function getMobileSpawnSafeBounds(fromNode, phase, tier){
    if (!isMobilePortraitGameplay() || !fromNode) return null;

    const anchor = getSpawnCameraAnchor();
    const edgePad = getTierSpawnEdgePadding(tier, phase);
    const sideInset = edgePad + Math.max(16, W * 0.02);
    const topHudInset =
      (phase <= 2 ? Math.max(68, H * 0.078) : Math.max(88, H * 0.10)) +
      ((typeof getCurrentRunMutator === 'function' && getCurrentRunMutator()) ? (phase <= 2 ? 34 : 46) : 0) +
      (((typeof testMode !== 'undefined' && testMode) || zenMode || phase > 1) ? (phase <= 2 ? 10 : 16) : 0);
    const bottomInset = edgePad + Math.max(18, H * 0.03);
    const centerBias = phase >= 2 ? Math.max(12, W * 0.02) : 0;
    const topEdgeFactor = phase <= 2 ? 0.48 : 1;

    return {
      left: fromNode.x - W * anchor.x + sideInset + centerBias,
      right: fromNode.x + W * (1 - anchor.x) - sideInset - centerBias,
      top: fromNode.y - H * anchor.y + topHudInset + edgePad * topEdgeFactor,
      bottom: fromNode.y + H * (1 - anchor.y) - bottomInset
    };
  }

  function isSpawnInsideMobileSafeZone(x, y, fromNode, phase, tier){
    const bounds = getMobileSpawnSafeBounds(fromNode, phase, tier);
    if (!bounds) return true;
    return x >= bounds.left && x <= bounds.right && y >= bounds.top && y <= bounds.bottom;
  }

  function clampSpawnToMobileSafeZone(x, y, fromNode, phase, tier){
    const bounds = getMobileSpawnSafeBounds(fromNode, phase, tier);
    if (!bounds) return { x, y };
    return {
      x: clampValue(x, bounds.left, bounds.right),
      y: clampValue(y, bounds.top, bounds.bottom)
    };
  }

  function getTierRiskRank(tier){
    switch (tier) {
      case 'easy': return 0;
      case 'medium': return 1;
      case 'hard': return 2;
      case 'gold': return 3;
      default: return 10;
    }
  }

  function getCanonicalBranchOffsets(orderedBranches){
    const mobilePortrait = isMobilePortraitGameplay();
    const count = Array.isArray(orderedBranches) ? orderedBranches.length : Number(orderedBranches) || 0;
    const tiers = Array.isArray(orderedBranches) ? orderedBranches.map(branch => branch && branch.tier) : [];

    if (count === 3 && tiers[0] === 'easy' && tiers[1] === 'medium' && tiers[2] === 'hard') {
      return mobilePortrait ? [-1.12, 0.80, 0.08] : [-1.00, 0.72, 0.04];
    }
    if (count === 3 && tiers[2] === 'gold') {
      return mobilePortrait ? [-1.14, 0.76, 0.02] : [-1.02, 0.68, 0];
    }
    if (count === 4 && tiers[0] === 'easy' && tiers[1] === 'medium' && tiers[2] === 'hard' && tiers[3] === 'gold') {
      return mobilePortrait ? [-1.22, -0.72, 0.80, 0.04] : [-1.10, -0.64, 0.72, 0.02];
    }

    if (count >= 4) {
      return mobilePortrait ? [-1.24, -0.40, 0.40, 1.24] : [-1.14, -0.34, 0.34, 1.14];
    }
    if (count === 3) {
      return mobilePortrait ? [-1.16, 0, 1.16] : [-1.04, 0, 1.04];
    }
    return mobilePortrait ? [-1.08, 1.08] : [-0.94, 0.94];
  }

  function getTierDistanceLayoutMul(tier, phase){
    const mobilePortrait = isMobilePortraitGameplay();
    const phasePressure = clampValue((phase - 1) / 5, 0, 1);
    const map = {
      easy: mobilePortrait ? 1.00 : 1.00,
      medium: mobilePortrait ? (1.04 + phasePressure * 0.03) : (1.03 + phasePressure * 0.02),
      hard: mobilePortrait ? (1.22 + phasePressure * 0.07) : (1.16 + phasePressure * 0.05),
      gold: mobilePortrait ? (1.30 + phasePressure * 0.08) : (1.22 + phasePressure * 0.06)
    };
    return map[tier] || 1;
  }

  function repositionCanonicalBranch(fromNode, branch, phase, targetOffset){
    if (!fromNode || !branch) return branch;

    const currentDistance = dist(fromNode.x, fromNode.y, branch.x, branch.y) || 220;
    const distanceTarget = currentDistance * getTierDistanceLayoutMul(branch.tier, phase);
    const angle = -Math.PI/2 + targetOffset;
    let nx = fromNode.x + Math.cos(angle) * distanceTarget;
    let ny = fromNode.y + Math.sin(angle) * distanceTarget;

    const adjusted = clampSpawnToMobileSafeZone(nx, ny, fromNode, phase, branch.tier);
    nx = adjusted.x;
    ny = adjusted.y;

    branch.x = nx;
    branch.y = ny;
    branch.baseX = nx;
    branch.baseY = ny;
    return branch;
  }

  function applyCanonicalPhaseLayout(fromNode, branches, phase){
    if (!fromNode || !Array.isArray(branches) || branches.length < 2) return branches;

    const ordered = branches
      .slice()
      .sort((a, b) => {
        const riskDiff = getTierRiskRank(a && a.tier) - getTierRiskRank(b && b.tier);
        if (riskDiff !== 0) return riskDiff;
        return (a && a.pts || 0) - (b && b.pts || 0);
      });
    const offsets = getCanonicalBranchOffsets(ordered);

    ordered.forEach((branch, idx) => {
      repositionCanonicalBranch(fromNode, branch, phase, offsets[idx] ?? 0);
    });

    return branches;
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

  function fairnessAdjustCaptureRadius(payload){
    const tier = payload && payload.tier;
    const base = {easy:64, medium:54, hard:44, gold:40};
    const floor = {easy:38, medium:36, hard:34, gold:32};
    let r = base[tier] || 52;
    if (zenMode) r += 15;

    const ev = (typeof getActiveEvent === 'function') ? getActiveEvent() : null;
    if (ev && ev.id === 'calm_orbit' && (tier === 'easy' || tier === 'medium')) r += 6;

    const phase = typeof getPhase === 'function' ? getPhase() : 1;
    if (!zenMode && tier === 'medium') {
      if (phase === 2) r -= isMobilePortraitGameplay() ? 8 : 6;
      else if (phase === 3) r -= 3;
    }
    if (!zenMode && phase >= 5 && (tier === 'hard' || tier === 'gold')) r += 2;

    const shrink = zenMode ? 0 : Math.min(score * 0.10, 8);
    payload.value = Math.max(r - shrink, floor[tier] || 34);
    return payload;
  }

  function fairnessAdjustOrbitSpeed(payload){
    payload.value = zenMode ? 2.2 : Math.min(3.0 + score * 0.042, 6.8);
    return payload;
  }

  function fairnessAdjustGravityStrength(payload){
    if (zenMode) payload.value = 30;
    else if (score < 30) payload.value = 0;
    else payload.value = Math.min((score - 30) * 1.2, 45);
    return payload;
  }

  function fairnessAdjustComboWindow(payload){
    const ev = (typeof getActiveEvent === 'function') ? getActiveEvent() : null;
    if (ev && ev.id === 'combo_fever') payload.value = 3.2;
    else if (score < 25) payload.value = 2.8;
    else if (score < 60) payload.value = 2.65;
    else payload.value = 2.5;
    return payload;
  }

  if (typeof registerOrbitaGameplayHook === 'function') {
    registerOrbitaGameplayHook('adjustCaptureRadius', fairnessAdjustCaptureRadius);
    registerOrbitaGameplayHook('adjustOrbitSpeed', fairnessAdjustOrbitSpeed);
    registerOrbitaGameplayHook('adjustGravityStrength', fairnessAdjustGravityStrength);
    registerOrbitaGameplayHook('adjustComboWindow', fairnessAdjustComboWindow);
  }

  function fairnessAdjustPlaceBranchConfig(config){
    const phase = getPhase();
    const mobilePortrait = isMobilePortraitGameplay();
    const phaseNeedsMobileTightening = mobilePortrait && phase >= 2;
    const crowdRelief = mobilePortrait ? clampValue((score - 22) / 42, 0, 1) : 0;
    const phaseTwoSpreadBoost = mobilePortrait && phase === 2 ? 1.08 : 1;
    const phaseSpreadBoost = mobilePortrait ? Math.max(0, phase - 1) * 0.05 : 0;
    const scoreSpreadBoost = mobilePortrait ? clampValue((score - 14) / 60, 0, 1) * 0.12 : 0;
    const difficultySpreadBoost = 1 + phaseSpreadBoost + scoreSpreadBoost;

    config.baseDist = (220 + Math.min(score * 1.6, 80)) * (phaseNeedsMobileTightening ? (0.93 + crowdRelief * 0.07) : 1) * phaseTwoSpreadBoost * difficultySpreadBoost;
    config.baseAngle = -Math.PI/2 + (config.angleOffset * (phaseNeedsMobileTightening ? 0.94 : 1));
    config.distJitterMin = -24;
    config.distJitterMax = 24;
    config.angleJitter = 0.16 * (phaseNeedsMobileTightening ? (0.94 - crowdRelief * 0.10) : 1);
    config.minSpacing = mobilePortrait ? (168 + crowdRelief * 18 + Math.max(0, phase - 1) * 8 + (phase === 2 ? 12 : 0)) : 158;
    config.maxAttempts = mobilePortrait ? 34 : 24;
    config.movingSpeedMin = 1.1;
    config.movingSpeedMax = 1.9;
    config.movingRadiusMin = 12;
    config.movingRadiusMax = 22;
    config.disappearTimerMin = 3.0;
    config.disappearTimerMax = 4.4;
    config.teleportTimerMin = 2.8;
    config.teleportTimerMax = 4.2;

    config.hardMoveChance = (!zenMode && phase >= 5 && config.tier === 'hard') ? 0.16 : 0;
    config.hardDisappearChance = (!zenMode && phase >= 5 && config.tier === 'hard') ? 0.10 : 0;
    config.hardTeleportChance = (!zenMode && phase >= 6 && config.tier === 'hard') ? 0.12 : 0;
    config.mediumMoveChance = (!zenMode && phase >= 6 && config.tier === 'medium') ? 0.08 : 0;

    if (phaseNeedsMobileTightening && config.fromNode) {
      config.isPositionValid = (x, y) => isSpawnInsideMobileSafeZone(x, y, config.fromNode, phase, config.tier);
      config.clampPosition = (x, y) => clampSpawnToMobileSafeZone(x, y, config.fromNode, phase, config.tier);
    } else {
      config.isPositionValid = null;
      config.clampPosition = null;
    }

    return config;
  }

  if (typeof registerOrbitaGameplayHook === 'function') {
    registerOrbitaGameplayHook('adjustPlaceBranchConfig', fairnessAdjustPlaceBranchConfig);
  }

  const _origSpawnBranches = typeof spawnBranches === 'function' ? spawnBranches : null;
    function fairnessBuildSpawnBranches(payload){
    const fromNode = payload.fromNode;
    const groupId = payload.groupId;
    const phase = payload.phase;
    const branches = [];

    if (phase <= 1) {
      branches.push(placeBranch(fromNode, 'easy', rand(-0.88,-0.52)));
      branches.push(placeBranch(fromNode, 'medium', rand(0.52,0.88)));
    } else if (phase <= 2) {
      branches.push(placeBranch(fromNode, 'easy', rand(-1.10,-0.70)));
      branches.push(placeBranch(fromNode, 'medium', rand(0.70,1.10)));
      if (score >= 14 && Math.random() < 0.14) {
        branches.push(placeBranch(fromNode, 'hard', rand(-0.08, 0.08)));
      }
    } else if (phase <= 3) {
      branches.push(placeBranch(fromNode, 'easy', rand(-1.08,-0.70)));
      branches.push(placeBranch(fromNode, 'medium', rand(-0.16,0.16)));
      branches.push(placeBranch(fromNode, 'hard', rand(0.70,1.08)));
    } else {
      const goldChance = phase >= 6 ? 0.26 : (phase === 5 ? 0.22 : 0.16);
      const forceGold = fairnessState.branchSetsSinceGold >= 3;

      branches.push(placeBranch(fromNode, 'easy', rand(-1.08,-0.70)));
      branches.push(placeBranch(fromNode, 'hard', rand(0.70,1.08)));

      if (forceGold || Math.random() < goldChance) {
        branches.push(placeBranch(fromNode, 'gold', rand(-0.14, 0.14)));
        fairnessState.branchSetsSinceGold = 0;
      } else {
        branches.push(placeBranch(fromNode, 'medium', rand(-0.14, 0.14)));
        fairnessState.branchSetsSinceGold += 1;
      }
    }

    limitBranchHazards(branches, phase);
    applyCanonicalPhaseLayout(fromNode, branches, phase);

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

    payload.branches = branches;
    payload.handled = true;
    return payload;
  }

  if (typeof registerOrbitaGameplayHook === 'function') {
    registerOrbitaGameplayHook('buildSpawnBranches', fairnessBuildSpawnBranches);
  }

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
    const cn = (typeof getSafeCurrentNode === 'function') ? getSafeCurrentNode() : nodes[ball.currentNode];
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
