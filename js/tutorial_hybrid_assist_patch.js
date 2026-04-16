(function(){
  const coachState = {
    runId: 0,
    releases: 0,
    captures: 0,
    goldCaptures: 0,
    hardCaptures: 0,
    firstCaptureAt: 0,
    lastReleaseAt: 0,
    lastCaptureAt: 0,
    lastReleaseSnapshot: null,
    deathTip: null
  };

  function nowSeconds(){
    try {
      return performance.now() / 1000;
    } catch (e) {
      return Date.now() / 1000;
    }
  }

  function shouldShowTutorialOverlay(){
    try {
      return !!(tutorialStep > 0 && totalGames < 1 && best < 4);
    } catch (e) {
      return false;
    }
  }

  function shouldShowHybridAssistGuides(){
    try {
      return !!(best < 8 && totalGames < 3);
    } catch (e) {
      return false;
    }
  }

  function shouldShowCoachHints(){
    try {
      return !zenMode && (totalGames < 6 || best < 25);
    } catch (e) {
      return false;
    }
  }

  function shouldShowDeathCoach(){
    try {
      return !zenMode && pendingUnlocks.length === 0 && (totalGames < 7 || best < 30);
    } catch (e) {
      return false;
    }
  }

  function getVisibleTargets(){
    const out = [];
    try {
      if (!Array.isArray(nodes)) return out;
      for (const node of nodes) {
        if (!node || node.captured || node.visible === false) continue;
        out.push(node);
      }
    } catch (e) {}
    return out;
  }

  function getAlignedTarget(){
    try {
      if (!ball || !ball.orbiting) return null;
      const tang = ball.angle + (ball.orbitDir * Math.PI / 2);
      const dx = Math.cos(tang);
      const dy = Math.sin(tang);
      let bestNode = null;
      let bestScore = Infinity;

      for (const node of getVisibleTargets()) {
        const ndx = node.x - ball.x;
        const ndy = node.y - ball.y;
        const d = Math.sqrt(ndx * ndx + ndy * ndy);
        if (d < 20) continue;
        const dot = (dx * ndx + dy * ndy) / d;
        if (dot <= 0.7) continue;
        const perpDist = Math.abs(dx * ndy - dy * ndx);
        if (perpDist < bestScore && d < 700) {
          bestScore = perpDist;
          bestNode = node;
        }
      }

      return bestNode;
    } catch (e) {
      return null;
    }
  }

  function getClosestOpenNode(){
    let bestNode = null;
    let bestGap = Infinity;
    try {
      for (const node of getVisibleTargets()) {
        const gap = dist(ball.x, ball.y, node.x, node.y) - Math.max(0, Number(node.captureR || 0));
        if (gap < bestGap) {
          bestGap = gap;
          bestNode = node;
        }
      }
    } catch (e) {}
    return { node: bestNode, gap: bestGap };
  }

  function asteroidWasLikelyTheProblem(){
    try {
      if (!Array.isArray(asteroids)) return false;
      for (const rock of asteroids) {
        if (!rock) continue;
        const limit = Math.max(14, Number(rock.r || 0) + BALL_R + 12);
        if (dist(ball.x, ball.y, rock.x, rock.y) <= limit) return true;
      }
    } catch (e) {}
    return false;
  }

  function snapshotRelease(){
    const visible = getVisibleTargets();
    const aligned = getAlignedTarget();
    const closest = getClosestOpenNode();
    return {
      time: nowSeconds(),
      score: Number(score || 0) || 0,
      combo: Number(combo || 0) || 0,
      phase: typeof getPhase === 'function' ? Number(getPhase()) || 1 : 1,
      alignedTier: aligned ? String(aligned.tier || '') : '',
      alignedGap: aligned ? Math.round(Math.max(0, dist(ball.x, ball.y, aligned.x, aligned.y) - Number(aligned.captureR || 0))) : null,
      nearestTier: closest.node ? String(closest.node.tier || '') : '',
      nearestGap: Number.isFinite(closest.gap) ? Math.round(Math.max(0, closest.gap)) : null,
      visibleEasy: visible.some(node => node.tier === 'easy'),
      visibleGold: visible.some(node => node.tier === 'gold'),
      visibleHard: visible.some(node => node.tier === 'hard')
    };
  }

  function makeTip(label, title, body, color){
    return {
      label,
      title,
      body,
      color: color || '#00f5d4'
    };
  }

  function getLiveCoachHint(){
    if (!shouldShowCoachHints()) return null;
    if (state !== ST.PLAY) return null;
    if (shouldShowTutorialOverlay()) return null;

    const phase = typeof getPhase === 'function' ? Number(getPhase()) || 1 : 1;
    const flightAge = coachState.lastReleaseAt > 0 ? nowSeconds() - coachState.lastReleaseAt : 0;
    const visible = getVisibleTargets();
    const goldVisible = visible.some(node => node.tier === 'gold');
    const hardVisible = visible.some(node => node.tier === 'hard');
    const aligned = getAlignedTarget();

    if (!ball.orbiting) {
      if (flightAge > 0.25 && flightAge < 1.4) {
        return makeTip(
          'LEITURA',
          'Segure a leitura da rota.',
          'Durante o voo, espere o encaixe. O pouso acontece sozinho.',
          '#00f5d4'
        );
      }
      return makeTip(
        'AJUSTE',
        'A proxima orbita corrige a mira.',
        'Use a linha pontilhada e solte um pouco antes do alvo escolhido.',
        '#ffd32a'
      );
    }

    if (coachState.captures === 0) {
      return makeTip(
        'MIRA',
        'Comece pelo alvo mais limpo.',
        'Nas primeiras runs, priorize verde e azul quando a linha ficar clara.',
        '#70a1ff'
      );
    }

    if (combo >= 2 && comboTimer > 0 && score < 40) {
      return makeTip(
        'COMBO',
        'Voce ja entrou no ritmo.',
        'Solte cedo no proximo alvo para manter o combo e subir a pontuacao.',
        '#00f5d4'
      );
    }

    if (phase >= 4) {
      return makeTip(
        'PERIGO',
        'A fase agora pune rota torta.',
        'Veja primeiro o caminho livre. Asteroide mata run melhor que score baixo.',
        '#ff9f43'
      );
    }

    if (goldVisible && score < 25) {
      return makeTip(
        'RISCO',
        'Dourado e premio alto com risco alto.',
        'Se a linha nao estiver limpa, continue vivo e deixe o ouro para depois.',
        '#ffd32a'
      );
    }

    if (hardVisible && score < 18) {
      return makeTip(
        'RITMO',
        'Nem todo alvo precisa ser heroico.',
        'Se o vermelho apertar demais, estabilize a run num alvo facil ou medio.',
        '#ff6b6b'
      );
    }

    if (aligned && (aligned.tier === 'easy' || aligned.tier === 'medium')) {
      return makeTip(
        'JANELA',
        'A linha ja esta boa.',
        'Quando a trilha apontar para um alvo limpo, solte sem hesitar demais.',
        '#d4c5ff'
      );
    }

    return makeTip(
      'MIRA',
      'Leia a linha pontilhada.',
      'Ela mostra a saida da orbita. Escolha o alvo antes de tocar.',
      '#d4c5ff'
    );
  }

  function buildDeathCoachTip(){
    const shot = coachState.lastReleaseSnapshot || {};
    const closest = getClosestOpenNode();
    const phase = typeof getPhase === 'function' ? Number(getPhase()) || 1 : 1;

    if ((coachState.captures <= 1 && Number(score || 0) <= 3) || coachState.releases <= 1) {
      return makeTip(
        'PRIMEIRA META',
        'Garanta o primeiro encaixe antes de acelerar.',
        'Use a linha pontilhada para pegar um alvo verde ou azul e construir ritmo.',
        '#70a1ff'
      );
    }

    if (asteroidWasLikelyTheProblem()) {
      return makeTip(
        'COLISAO',
        'A rota morreu no obstaculo.',
        'Nas fases altas, confirme o caminho limpo antes de perseguir o alvo valioso.',
        '#ff9f43'
      );
    }

    if (closest.node && closest.gap <= 18) {
      return makeTip(
        'QUASE',
        'Voce passou muito perto do circulo de captura.',
        'Na proxima, solte um instante antes e deixe a linha entrar mais cheia no alvo.',
        '#ffd32a'
      );
    }

    if ((shot.alignedTier === 'hard' || shot.alignedTier === 'gold') && shot.visibleEasy) {
      return makeTip(
        'DECISAO',
        'A run morreu no alvo mais arriscado.',
        'Quando houver rota facil disponivel, sobreviver costuma valer mais que forcar o vermelho ou o ouro.',
        '#ff6b6b'
      );
    }

    if (Number(maxCombo || 0) < 2 && Number(score || 0) >= 8) {
      return makeTip(
        'PONTOS',
        'Seu proximo salto de score vem do combo.',
        'Assim que capturar, ja pense no alvo seguinte para nao quebrar a cadeia.',
        '#00f5d4'
      );
    }

    if (phase >= 4) {
      return makeTip(
        'FASE',
        'A leitura precisa ficar mais fria daqui pra frente.',
        'Nas fases avancadas, olhe o trajeto inteiro antes de tocar e aceite um alvo mais seguro.',
        '#ff9f43'
      );
    }

    return makeTip(
      'AJUSTE',
      'A run pediu um toque mais cedo.',
      'Escolha o alvo antes da orbita fechar demais e solte com menos hesitacao.',
      '#d4c5ff'
    );
  }

  function drawCoachCard(hint, x, y, w, compact){
    if (!hint) return;

    const h = compact ? 52 : 64;
    X.save();
    X.globalAlpha = 0.9;
    const bg = X.createLinearGradient(x, y, x, y + h);
    bg.addColorStop(0, 'rgba(4,6,18,0.86)');
    bg.addColorStop(1, 'rgba(0,0,0,0.92)');
    X.fillStyle = bg;
    roundRect(x, y, w, h, 12);
    X.fill();

    X.strokeStyle = hint.color;
    X.lineWidth = 1.6;
    roundRect(x, y, w, h, 12);
    X.stroke();

    X.textAlign = 'left';
    X.textBaseline = 'middle';
    X.fillStyle = hint.color;
    X.font = 'bold 10px -apple-system, system-ui, sans-serif';
    X.fillText(hint.label, x + 12, y + 14);

    X.fillStyle = '#ffffff';
    X.font = compact ? 'bold 12px -apple-system, system-ui, sans-serif' : 'bold 13px -apple-system, system-ui, sans-serif';
    X.fillText(hint.title, x + 12, y + 31);

    X.fillStyle = 'rgba(255,255,255,0.72)';
    X.font = '10px -apple-system, system-ui, sans-serif';
    X.fillText(hint.body, x + 12, y + (compact ? 44 : 48));
    X.restore();
  }

  function drawLiveCoachHint(){
    const hint = getLiveCoachHint();
    if (!hint) return;
    const w = Math.min(W * 0.84, 340);
    const x = (W - w) / 2;
    const y = H - 74;
    drawCoachCard(hint, x, y, w, true);
  }

  function drawDeathCoachHint(){
    if (!shouldShowDeathCoach()) return;
    if (!coachState.deathTip) return;
    const w = Math.min(W * 0.9, 360);
    const x = (W - w) / 2;
    const y = 14;
    drawCoachCard(coachState.deathTip, x, y, w, false);
  }

  function resetCoachRun(){
    coachState.runId += 1;
    coachState.releases = 0;
    coachState.captures = 0;
    coachState.goldCaptures = 0;
    coachState.hardCaptures = 0;
    coachState.firstCaptureAt = 0;
    coachState.lastReleaseAt = 0;
    coachState.lastCaptureAt = 0;
    coachState.lastReleaseSnapshot = null;
    coachState.deathTip = null;
  }

  window.shouldShowTutorialOverlay = shouldShowTutorialOverlay;
  window.shouldShowHybridAssistGuides = shouldShowHybridAssistGuides;
  window.shouldShowAssistGuides = shouldShowHybridAssistGuides;
  window.getOnboardingCoachState = function(){ return coachState; };

  if (typeof reset === 'function') {
    const _origReset = reset;
    window.reset = function(){
      const result = _origReset.apply(this, arguments);
      resetCoachRun();
      try {
        tutorialStep = totalGames < 1 ? 1 : 0;
      } catch (e) {}
      return result;
    };
  }

  if (typeof release === 'function') {
    const _origRelease = release;
    window.release = function(){
      coachState.releases += 1;
      coachState.lastReleaseAt = nowSeconds();
      coachState.lastReleaseSnapshot = snapshotRelease();
      return _origRelease.apply(this, arguments);
    };
  }

  if (typeof capture === 'function') {
    const _origCapture = capture;
    window.capture = function(nodeIdx){
      const node = (Array.isArray(nodes) && nodes[nodeIdx]) ? nodes[nodeIdx] : null;
      const result = _origCapture.apply(this, arguments);
      coachState.captures += 1;
      coachState.lastCaptureAt = nowSeconds();
      if (!coachState.firstCaptureAt) coachState.firstCaptureAt = coachState.lastCaptureAt;
      if (node && node.tier === 'gold') coachState.goldCaptures += 1;
      if (node && node.tier === 'hard') coachState.hardCaptures += 1;
      return result;
    };
  }

  if (typeof die === 'function') {
    const _origDie = die;
    window.die = function(){
      if (state === ST.PLAY && !activeShield) {
        coachState.deathTip = buildDeathCoachTip();
      }
      return _origDie.apply(this, arguments);
    };
  }

  if (typeof drawTutorial === 'function') {
    const _origDrawTutorial = drawTutorial;
    window.drawTutorial = function(){
      if (!shouldShowTutorialOverlay()) return;
      return _origDrawTutorial.apply(this, arguments);
    };
  }

  if (typeof window.drawPlayUIModule === 'function') {
    const _origDrawPlayUIModule = window.drawPlayUIModule;
    window.drawPlayUIModule = function(){
      const result = _origDrawPlayUIModule.apply(this, arguments);
      drawLiveCoachHint();
      return result;
    };
  }

  if (typeof window.drawDeadUIModule === 'function') {
    const _origDrawDeadUIModule = window.drawDeadUIModule;
    window.drawDeadUIModule = function(){
      const result = _origDrawDeadUIModule.apply(this, arguments);
      drawDeathCoachHint();
      return result;
    };
  }
})();
