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

  function findExtraAngleOffset(fromNode, branches){
    const candidateOffsets = [-1.08, -0.78, -0.36, 0.36, 0.78, 1.08];
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
    payload.branches = branches;
    return payload;
  }

  function runVarietyBuildSpawnBranches(payload){
    if (!payload || !varietyState.active || zenMode) return payload;

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
      if (payload.tier === 'easy' || payload.tier === 'medium') payload.value += 8;
      else payload.value += 3;
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

  function drawRunMutatorBadge(){
    const active = varietyState.active;
    if (!active || state !== ST.PLAY) return;

    const w = Math.min(W * 0.72, 278);
    const h = 44;
    const x = 16;
    const y = 86;

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
    X.fillText(active.title, x + 12, y + 26);

    X.fillStyle = 'rgba(255,255,255,0.65)';
    X.font = '10px -apple-system, system-ui, sans-serif';
    X.fillText(active.desc, x + 12, y + 37);

    X.textAlign = 'right';
    X.fillStyle = active.color;
    X.font = 'bold 16px -apple-system, system-ui, sans-serif';
    X.fillText(String(Math.max(0, active.remainingCaptures)), x + w - 12, y + 22);

    X.fillStyle = 'rgba(255,255,255,0.48)';
    X.font = '10px -apple-system, system-ui, sans-serif';
    X.fillText('saltos', x + w - 12, y + 34);
    X.restore();
  }

  window.getCurrentRunMutator = getCurrentRunMutator;

  if (typeof registerOrbitaGameplayHook === 'function') {
    registerOrbitaGameplayHook('buildSpawnBranches', runVarietyBuildSpawnBranches);
    registerOrbitaGameplayHook('adjustCaptureRadius', runVarietyAdjustCaptureRadius);
    registerOrbitaGameplayHook('adjustComboWindow', runVarietyAdjustComboWindow);
    registerOrbitaGameplayHook('adjustOrbitSpeed', runVarietyAdjustOrbitSpeed);
    registerOrbitaGameplayHook('adjustGravityStrength', runVarietyAdjustGravityStrength);
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
