(function(){
  const varietyState = {
    active: null,
    lastMutatorId: '',
    nextTriggerScore: 14,
    activations: 0
  };

  const MUTATORS = {
    resonance_field: {
      id: 'resonance_field',
      label: 'RESSONANCIA',
      title: 'Ressonancia Orbital',
      desc: 'Janelas melhores para manter combo.',
      color: '#00f5d4',
      icon: '~~',
      durationCaptures: 3
    },
    forked_paths: {
      id: 'forked_paths',
      label: 'ROTAS',
      title: 'Rotas Dobradas',
      desc: 'Mais uma rota aparece em cada decisao.',
      color: '#70a1ff',
      icon: '><',
      durationCaptures: 3
    },
    treasure_surge: {
      id: 'treasure_surge',
      label: 'OURO',
      title: 'Surto de Ouro',
      desc: 'Mais chance de rota valiosa por alguns saltos.',
      color: '#ffd32a',
      icon: '$$',
      durationCaptures: 2
    },
    gravity_swell: {
      id: 'gravity_swell',
      label: 'PRESSAO',
      title: 'Swell Gravitacional',
      desc: 'Mais velocidade e mais pressao na rota.',
      color: '#ff9f43',
      icon: '!!',
      durationCaptures: 2
    }
  };

  function cloneMutator(def){
    return {
      id: def.id,
      label: def.label,
      title: def.title,
      desc: def.desc,
      color: def.color,
      icon: def.icon,
      durationCaptures: def.durationCaptures,
      remainingCaptures: def.durationCaptures,
      activatedAtScore: Number(score || 0) || 0,
      activatedAtPhase: typeof getPhase === 'function' ? Number(getPhase()) || 1 : 1
    };
  }

  function resetRunVarietyState(){
    varietyState.active = null;
    varietyState.lastMutatorId = '';
    varietyState.nextTriggerScore = 14;
    varietyState.activations = 0;
  }

  function isVarietyEnabled(){
    try {
      return state === ST.PLAY && !zenMode;
    } catch (e) {
      return false;
    }
  }

  function getMutatorPool(){
    const phase = typeof getPhase === 'function' ? Number(getPhase()) || 1 : 1;
    const s = Number(score || 0) || 0;
    const pool = ['resonance_field', 'forked_paths'];

    if (s >= 18 || phase >= 3) pool.push('treasure_surge');
    if (s >= 38 || phase >= 5) pool.push('gravity_swell');

    return pool.filter(id => id !== varietyState.lastMutatorId);
  }

  function chooseNextMutator(){
    const pool = getMutatorPool();
    if (!pool.length) return null;
    return pool[Math.floor(Math.random() * pool.length)] || null;
  }

  function activateRunMutator(mutatorId){
    const def = MUTATORS[mutatorId];
    if (!def) return null;

    varietyState.active = cloneMutator(def);
    varietyState.lastMutatorId = def.id;
    varietyState.activations += 1;
    varietyState.nextTriggerScore += 18 + Math.min(varietyState.activations, 3) * 2;

    phaseMsg = def.title.toUpperCase();
    phaseMsgT = 2.3;
    flashA = Math.max(flashA || 0, 0.15);
    shakeT = Math.max(shakeT || 0, 0.10);
    shakeA = Math.max(shakeA || 0, 4);

    if (typeof trackEvent === 'function') {
      trackEvent('run_mutator_activated', {
        mutator_id: def.id,
        score: Number(score || 0) || 0,
        phase: typeof getPhase === 'function' ? Number(getPhase()) || 1 : 1
      });
    }

    return varietyState.active;
  }

  function clearRunMutator(reason){
    if (!varietyState.active) return;

    if (typeof trackEvent === 'function') {
      trackEvent('run_mutator_finished', {
        mutator_id: varietyState.active.id,
        score: Number(score || 0) || 0,
        reason: reason || 'expired'
      });
    }

    varietyState.active = null;
  }

  function maybeActivateRunMutator(){
    if (!isVarietyEnabled()) return null;
    if (varietyState.active) return varietyState.active;
    if ((Number(score || 0) || 0) < varietyState.nextTriggerScore) return null;

    const nextId = chooseNextMutator();
    if (!nextId) return null;
    return activateRunMutator(nextId);
  }

  function advanceRunMutator(){
    if (!varietyState.active) return;
    varietyState.active.remainingCaptures -= 1;
    if (varietyState.active.remainingCaptures <= 0) {
      clearRunMutator('captures_done');
    }
  }

  function getCurrentRunMutator(){
    return varietyState.active;
  }

  function isMobilePortraitVariety(){
    try {
      return H > W && Math.min(W, H) <= 900;
    } catch (e) {
      return false;
    }
  }

  function getAngleOffsetForNode(fromNode, node){
    if (!fromNode || !node) return 0;
    return Math.atan2(node.y - fromNode.y, node.x - fromNode.x) + (Math.PI / 2);
  }

  function sanitizeExtraBranch(branch){
    if (!branch) return branch;
    branch.moving = false;
    branch.disappearing = false;
    branch.teleporting = false;
    branch.visible = true;
    branch.disappearTimer = 0;
    branch.teleportTimer = 0;
    branch.captureR += 2;
    return branch;
  }

  function clampNumber(value, min, max){
    return Math.min(Math.max(value, min), max);
  }

  function getResonanceOffsets(count, mobilePortrait){
    if (count >= 4) {
      return mobilePortrait ? [-1.18, -0.40, 0.40, 1.18] : [-1.08, -0.34, 0.34, 1.08];
    }
    if (count === 3) {
      return mobilePortrait ? [-1.04, 0, 1.04] : [-0.96, 0, 0.96];
    }
    return mobilePortrait ? [-0.96, 0.96] : [-0.88, 0.88];
  }

  function getTreasureOffsets(count, mobilePortrait){
    if (count >= 4) {
      return mobilePortrait ? [-1.20, -0.46, 0.46, 1.20] : [-1.10, -0.40, 0.40, 1.10];
    }
    if (count === 3) {
      return mobilePortrait ? [-1.10, 0, 1.10] : [-1.00, 0, 1.00];
    }
    return mobilePortrait ? [-1.02, 0.84] : [-0.94, 0.78];
  }

  function getVarietySafeBounds(fromNode){
    if (!fromNode || !isMobilePortraitVariety()) return null;

    const anchor = typeof getGameplayCameraAnchor === 'function'
      ? (getGameplayCameraAnchor(false) || { x:0.5, y:0.5 })
      : { x:0.5, y:0.5 };
    const statusInset = ((typeof testMode !== 'undefined' && testMode) || zenMode || (typeof getPhase === 'function' && Number(getPhase()) > 1)) ? 18 : 0;
    const mutatorInset = varietyState.active ? 48 : 0;

    return {
      left: fromNode.x - W * anchor.x + 62,
      right: fromNode.x + W * (1 - anchor.x) - 62,
      top: fromNode.y - H * anchor.y + 114 + statusInset + mutatorInset,
      bottom: fromNode.y + H * (1 - anchor.y) - 64
    };
  }

  function repositionBranch(fromNode, branch, targetOffset, distanceMul){
    if (!fromNode || !branch) return branch;

    const distanceNow = dist(fromNode.x, fromNode.y, branch.x, branch.y) || 220;
    const distanceTarget = distanceNow * distanceMul;
    const angle = -Math.PI/2 + targetOffset;
    let nx = fromNode.x + Math.cos(angle) * distanceTarget;
    let ny = fromNode.y + Math.sin(angle) * distanceTarget;

    const bounds = getVarietySafeBounds(fromNode);
    if (bounds) {
      nx = clampNumber(nx, bounds.left, bounds.right);
      ny = clampNumber(ny, bounds.top, bounds.bottom);
    }

    branch.x = nx;
    branch.y = ny;
    branch.baseX = nx;
    branch.baseY = ny;
    return branch;
  }

  function findExtraAngleOffset(fromNode, branches){
    const mobilePortrait = isMobilePortraitVariety();
    const candidateOffsets = branches.length >= 3
      ? (mobilePortrait
        ? [-1.30, -1.04, 1.04, 1.30]
        : [-1.20, -0.96, 0.96, 1.20])
      : (mobilePortrait
        ? [-1.18, -0.92, -0.48, 0.48, 0.92, 1.18]
        : [-1.08, -0.78, -0.36, 0.36, 0.78, 1.08]);
    let bestOffset = candidateOffsets[0];
    let bestGap = -1;

    for (const candidate of candidateOffsets) {
      let minGap = Infinity;
      for (const branch of branches) {
        const offset = getAngleOffsetForNode(fromNode, branch);
        const gap = Math.abs(candidate - offset);
        if (gap < minGap) minGap = gap;
      }
      if (minGap > bestGap) {
        bestGap = minGap;
        bestOffset = candidate;
      }
    }

    return bestOffset;
  }

  function applyForkedPaths(payload){
    const branches = Array.isArray(payload.branches) ? payload.branches : [];
    if (!payload.fromNode || branches.length >= 4) return payload;

    const offset = findExtraAngleOffset(payload.fromNode, branches);
    const tier = payload.phase >= 4 ? 'medium' : 'easy';
    const extra = sanitizeExtraBranch(placeBranch(payload.fromNode, tier, offset));

    if (extra) branches.push(extra);
    payload.branches = branches;
    return payload;
  }

  function applyTreasureSurge(payload){
    const branches = Array.isArray(payload.branches) ? payload.branches : [];
    if (!payload.fromNode || !branches.length) return payload;

    const hasGold = branches.some(branch => branch && branch.tier === 'gold');
    if (hasGold) {
      branches.forEach(branch => {
        if (branch && branch.tier === 'gold') {
          branch.captureR += 3;
          branch.pulse += 0.6;
        }
      });
      payload.branches = branches;
      return payload;
    }

    let replaceIdx = -1;
    for (let i = 0; i < branches.length; i++) {
      if (branches[i] && branches[i].tier === 'medium') {
        replaceIdx = i;
        break;
      }
    }
    if (replaceIdx < 0) {
      for (let i = 0; i < branches.length; i++) {
        if (branches[i] && branches[i].tier === 'hard') {
          replaceIdx = i;
          break;
        }
      }
    }
    if (replaceIdx < 0) return payload;

    const offset = getAngleOffsetForNode(payload.fromNode, branches[replaceIdx]);
    branches[replaceIdx] = sanitizeExtraBranch(placeBranch(payload.fromNode, 'gold', offset));

    const mobilePortrait = isMobilePortraitVariety();
    const ordered = branches
      .slice()
      .sort((a, b) => getAngleOffsetForNode(payload.fromNode, a) - getAngleOffsetForNode(payload.fromNode, b));
    const goldIdx = ordered.findIndex(branch => branch && branch.tier === 'gold');
    const arranged = (goldIdx >= 0 && ordered.length === 3)
      ? [ordered.filter((_, idx) => idx !== goldIdx)[0], ordered[goldIdx], ordered.filter((_, idx) => idx !== goldIdx)[1]]
      : ordered;
    const offsets = getTreasureOffsets(arranged.length, mobilePortrait);

    arranged.forEach((branch, idx) => {
      const distanceMul = branch.tier === 'gold'
        ? (mobilePortrait ? 1.12 : 1.08)
        : (branch.tier === 'hard' ? 1.08 : 1.04);
      repositionBranch(payload.fromNode, branch, offsets[idx] ?? 0, distanceMul);
      if (branch.tier === 'gold') {
        branch.captureR += 2;
        branch.pulse += 0.4;
      }
    });

    payload.branches = branches;
    return payload;
  }

  function applyResonanceField(payload){
    const branches = Array.isArray(payload.branches) ? payload.branches : [];
    if (!payload.fromNode || branches.length < 2) return payload;

    const mobilePortrait = isMobilePortraitVariety();
    const ordered = branches
      .slice()
      .sort((a, b) => getAngleOffsetForNode(payload.fromNode, a) - getAngleOffsetForNode(payload.fromNode, b));
    const offsets = getResonanceOffsets(ordered.length, mobilePortrait);

    ordered.forEach((branch, idx) => {
      const tierDistanceMul = branch.tier === 'hard' || branch.tier === 'gold'
        ? 1.10
        : (branch.tier === 'medium' ? 1.07 : 1.04);
      repositionBranch(payload.fromNode, branch, offsets[idx] ?? 0, mobilePortrait ? tierDistanceMul * 1.04 : tierDistanceMul);
    });

    payload.branches = branches;
    return payload;
  }

  function runVarietyBuildSpawnBranches(payload){
    if (!payload || !varietyState.active || zenMode) return payload;

    if (varietyState.active.id === 'resonance_field') {
      return applyResonanceField(payload);
    }
    if (varietyState.active.id === 'forked_paths') {
      return applyForkedPaths(payload);
    }
    if (varietyState.active.id === 'treasure_surge') {
      return applyTreasureSurge(payload);
    }
    return payload;
  }

  function runVarietyAdjustCaptureRadius(payload){
    if (!payload || !varietyState.active) return payload;

    if (varietyState.active.id === 'resonance_field') {
      const phase = typeof getPhase === 'function' ? Number(getPhase()) || 1 : 1;
      if (payload.tier === 'easy') payload.value += 6;
      else if (payload.tier === 'medium') {
        if (phase >= 5) payload.value += 4;
        else if (phase >= 3) payload.value += 2;
      } else payload.value += 2;
    } else if (varietyState.active.id === 'treasure_surge' && payload.tier === 'gold') {
      payload.value += 6;
    }

    return payload;
  }

  function runVarietyAdjustComboWindow(payload){
    if (!payload || !varietyState.active) return payload;

    if (varietyState.active.id === 'resonance_field') payload.value += 0.45;
    else if (varietyState.active.id === 'gravity_swell') payload.value = Math.max(2.1, payload.value - 0.12);

    return payload;
  }

  function runVarietyAdjustOrbitSpeed(payload){
    if (!payload || !varietyState.active) return payload;
    if (varietyState.active.id === 'gravity_swell') payload.value += 0.45;
    return payload;
  }

  function runVarietyAdjustGravityStrength(payload){
    if (!payload || !varietyState.active) return payload;
    if (varietyState.active.id === 'gravity_swell') payload.value += 14;
    return payload;
  }

  function runVarietyAdjustPlaceBranchConfig(config){
    if (!config || !varietyState.active) return config;
    const mobilePortrait = isMobilePortraitVariety();
    const phase = typeof getPhase === 'function' ? Number(getPhase()) || 1 : 1;
    const scorePressure = clamp((Number(score) - 18) / 60, 0, 1);

    if (varietyState.active.id === 'resonance_field') {
      const spreadBoost = mobilePortrait ? (1.10 + scorePressure * 0.08 + Math.max(0, phase - 2) * 0.025) : 1.05;
      config.baseDist *= spreadBoost;
      config.minSpacing += mobilePortrait ? 20 : 10;
      config.angleJitter *= mobilePortrait ? 0.76 : 0.86;
      return config;
    }

    if (varietyState.active.id !== 'forked_paths') return config;

    const spreadBoost = mobilePortrait ? (1.16 + scorePressure * 0.10 + Math.max(0, phase - 2) * 0.03) : 1.08;

    config.baseDist *= spreadBoost;
    config.minSpacing += mobilePortrait ? 26 : 14;
    config.angleJitter *= mobilePortrait ? 0.72 : 0.82;
    return config;
  }

  function drawRunMutatorBadge(){
    const active = varietyState.active;
    if (!active || state !== ST.PLAY) return;

    const w = Math.min(W * 0.68, 268);
    const h = 40;
    const x = 16;
    const hasTopStatus = !!testMode || !!zenMode || (typeof getPhase === 'function' && Number(getPhase()) > 1);
    const y = hasTopStatus ? 102 : 82;

    X.save();
    X.globalAlpha = 0.92;
    const bg = X.createLinearGradient(x, y, x, y + h);
    bg.addColorStop(0, 'rgba(0,0,0,0.68)');
    bg.addColorStop(1, 'rgba(0,0,0,0.88)');
    X.fillStyle = bg;
    roundRect(x, y, w, h, 10);
    X.fill();

    X.strokeStyle = active.color;
    X.lineWidth = 1.5;
    roundRect(x, y, w, h, 10);
    X.stroke();

    X.textAlign = 'left';
    X.textBaseline = 'middle';
    X.fillStyle = active.color;
    X.font = 'bold 10px -apple-system, system-ui, sans-serif';
    X.fillText(active.label + '  ' + active.icon, x + 12, y + 12);

    X.fillStyle = '#ffffff';
    X.font = 'bold 12px -apple-system, system-ui, sans-serif';
    X.fillText(active.title, x + 12, y + 24);

    X.fillStyle = 'rgba(255,255,255,0.65)';
    X.font = '9px -apple-system, system-ui, sans-serif';
    X.fillText(active.desc, x + 12, y + 34);

    X.textAlign = 'right';
    X.fillStyle = active.color;
    X.font = 'bold 16px -apple-system, system-ui, sans-serif';
    X.fillText(String(Math.max(0, active.remainingCaptures)), x + w - 12, y + 20);

    X.fillStyle = 'rgba(255,255,255,0.48)';
    X.font = '10px -apple-system, system-ui, sans-serif';
    X.fillText('saltos', x + w - 12, y + 31);
    X.restore();
  }

  window.getCurrentRunMutator = getCurrentRunMutator;

  if (typeof registerOrbitaGameplayHook === 'function') {
    registerOrbitaGameplayHook('buildSpawnBranches', runVarietyBuildSpawnBranches);
    registerOrbitaGameplayHook('adjustCaptureRadius', runVarietyAdjustCaptureRadius);
    registerOrbitaGameplayHook('adjustComboWindow', runVarietyAdjustComboWindow);
    registerOrbitaGameplayHook('adjustOrbitSpeed', runVarietyAdjustOrbitSpeed);
    registerOrbitaGameplayHook('adjustGravityStrength', runVarietyAdjustGravityStrength);
    registerOrbitaGameplayHook('adjustPlaceBranchConfig', runVarietyAdjustPlaceBranchConfig);
  }

  if (typeof reset === 'function') {
    const _origReset = reset;
    window.reset = function(){
      resetRunVarietyState();
      return _origReset.apply(this, arguments);
    };
  }

  if (typeof capture === 'function') {
    const _origCapture = capture;
    window.capture = function(nodeIdx){
      const result = _origCapture.apply(this, arguments);
      if (varietyState.active) advanceRunMutator();
      maybeActivateRunMutator();
      return result;
    };
  }

  if (typeof die === 'function') {
    const _origDie = die;
    window.die = function(){
      const result = _origDie.apply(this, arguments);
      if (state === ST.DEAD) clearRunMutator('death');
      return result;
    };
  }

  if (typeof window.drawPlayUIModule === 'function') {
    const _origDrawPlayUIModule = window.drawPlayUIModule;
    window.drawPlayUIModule = function(){
      const result = _origDrawPlayUIModule.apply(this, arguments);
      drawRunMutatorBadge();
      return result;
    };
  }
})();
