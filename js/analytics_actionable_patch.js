
(function(){
  if (window.__orbitaAnalyticsActionableInstalled) return;
  window.__orbitaAnalyticsActionableInstalled = true;

  const SCORE_MILESTONES = [5, 10, 25, 50, 80, 120, 160, 200, 250, 300];
  let runMetrics = null;
  let lastTrackedScreen = null;
  let screenPollStarted = false;

  function nowMs(){
    return (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
  }

  function num(v, fallback=0){
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }

  function currentPhase(){
    try { return typeof getPhase === 'function' ? num(getPhase(), 1) : 1; }
    catch (e) { return 1; }
  }

  function currentScreen(){
    try {
      if (typeof state === 'undefined' || typeof ST === 'undefined') return 'unknown';
      if (state === ST.MENU) return String(typeof menuScreen !== 'undefined' ? menuScreen : 'menu');
      if (state === ST.PLAY) return 'play';
      if (state === ST.PAUSE) return 'pause';
      if (state === ST.DEAD) return 'dead';
      return 'unknown';
    } catch (e) {
      return 'unknown';
    }
  }

  function makeRunMetrics(source){
    return {
      client_run_id: (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : ('run_' + Date.now() + '_' + Math.random().toString(16).slice(2)),
      source: String(source || 'unknown'),
      mode: (typeof zenMode !== 'undefined' && zenMode) ? 'zen' : 'normal',
      started_at_ms: nowMs(),
      captures: 0,
      captures_easy: 0,
      captures_medium: 0,
      captures_hard: 0,
      captures_gold: 0,
      gold_captures: 0,
      powerups_collected: 0,
      powerup_shield: 0,
      powerup_slowmo: 0,
      powerup_magnet: 0,
      best_combo_run: 0,
      phase_max: 1,
      pause_count: 0,
      first_release_done: false,
      last_score_milestone: 0,
      death_reason: 'unknown'
    };
  }

  function ensureRunMetrics(source){
    if (!runMetrics) runMetrics = makeRunMetrics(source);
    return runMetrics;
  }

  function resetRunMetrics(source){
    runMetrics = makeRunMetrics(source);
    return runMetrics;
  }

  function runDurationSeconds(){
    if (!runMetrics) return 0;
    return Math.max(0, (nowMs() - num(runMetrics.started_at_ms, nowMs())) / 1000);
  }

  function basePayload(extra){
    const m = ensureRunMetrics();
    const payload = {
      client_run_id: m.client_run_id,
      mode: (typeof zenMode !== 'undefined' && zenMode) ? 'zen' : (m.mode || 'normal'),
      source: m.source || 'unknown',
      score: num(typeof score !== 'undefined' ? score : 0),
      phase: currentPhase(),
      duration_seconds: Number(runDurationSeconds().toFixed(2)),
      captures: num(m.captures),
      captures_easy: num(m.captures_easy),
      captures_medium: num(m.captures_medium),
      captures_hard: num(m.captures_hard),
      captures_gold: num(m.captures_gold),
      gold_captures: num(m.gold_captures),
      powerups_collected: num(m.powerups_collected),
      powerup_shield: num(m.powerup_shield),
      powerup_slowmo: num(m.powerup_slowmo),
      powerup_magnet: num(m.powerup_magnet),
      best_combo_run: Math.max(num(m.best_combo_run), num(typeof maxCombo !== 'undefined' ? maxCombo : 0), num(typeof combo !== 'undefined' ? combo : 0)),
      pause_count: num(m.pause_count),
      tutorial_step: num(typeof tutorialStep !== 'undefined' ? tutorialStep : 0),
      selected_skin: (typeof selectedSkin !== 'undefined' ? selectedSkin : null),
      selected_bg: (typeof selectedBg !== 'undefined' ? selectedBg : null),
      online: (typeof networkOnline !== 'undefined' ? !!networkOnline : null)
    };
    return Object.assign(payload, extra || {});
  }

  function safeTrack(eventName, payload, opts){
    try {
      if (typeof trackEvent === 'function') trackEvent(eventName, basePayload(payload), opts || {});
    } catch (e) {}
  }

  function startScreenPolling(){
    if (screenPollStarted) return;
    screenPollStarted = true;
    setInterval(() => {
      const screen = currentScreen();
      if (screen !== lastTrackedScreen) {
        lastTrackedScreen = screen;
        try {
          if (typeof trackEvent === 'function') {
            trackEvent('screen_view', {
              screen,
              has_session: (typeof currentUser !== 'undefined' && !!currentUser),
              has_nickname: (typeof playerName !== 'undefined' && !!playerName),
              rankings_loading: (typeof rankingsLoading !== 'undefined' ? !!rankingsLoading : null)
            });
          }
        } catch (e) {}
      }
    }, 700);
  }

  function estimateDeathReason(){
    try {
      if (typeof activeShield !== 'undefined' && activeShield) return 'shield_trigger';
      if (typeof asteroids !== 'undefined' && Array.isArray(asteroids)) {
        for (const a of asteroids) {
          if (a && typeof a.x === 'number' && typeof a.y === 'number' && typeof a.r === 'number') {
            const d = Math.hypot((num(typeof ball !== 'undefined' ? ball.x : 0) - a.x), (num(typeof ball !== 'undefined' ? ball.y : 0) - a.y));
            if (d < a.r + num(typeof BALL_R !== 'undefined' ? BALL_R : 10) + 3) return 'asteroid';
          }
        }
      }
      if (typeof nodes !== 'undefined' && Array.isArray(nodes) && typeof ball !== 'undefined') {
        const currentNode = nodes[num(ball.currentNode, 0)];
        let anyReachable = false;
        for (const n of nodes) {
          if (!n || n.captured || !n.visible) continue;
          if (!currentNode) { anyReachable = true; break; }
          const dOrigin = Math.hypot(currentNode.x - n.x, currentNode.y - n.y);
          const dBall = Math.hypot(num(ball.x) - n.x, num(ball.y) - n.y);
          if (dBall < dOrigin + (((typeof zenMode !== 'undefined' && zenMode) ? 500 : 200))) {
            anyReachable = true;
            break;
          }
        }
        if (!anyReachable) return 'missed_targets';
      }
      return 'unknown';
    } catch (e) {
      return 'unknown';
    }
  }

  function trackScoreMilestonesIfNeeded(){
    const m = ensureRunMetrics();
    const currentScore = num(typeof score !== 'undefined' ? score : 0);
    for (const milestone of SCORE_MILESTONES) {
      if (currentScore >= milestone && num(m.last_score_milestone) < milestone) {
        m.last_score_milestone = milestone;
        safeTrack('score_milestone', { milestone });
      }
    }
  }

  startScreenPolling();

  if (typeof startRun === 'function') {
    const _startRun = startRun;
    window.startRun = function(useZen, source='unknown'){
      resetRunMetrics(source);
      const result = _startRun.apply(this, arguments);
      if (runMetrics) {
        runMetrics.mode = (typeof zenMode !== 'undefined' && zenMode) ? 'zen' : 'normal';
        runMetrics.phase_max = currentPhase();
      }
      return result;
    };
  }

  if (typeof release === 'function') {
    const _release = release;
    window.release = function(){
      const shouldTrack = (typeof state !== 'undefined' && typeof ST !== 'undefined' && state === ST.PLAY && typeof ball !== 'undefined' && !!ball.orbiting);
      const result = _release.apply(this, arguments);
      const m = ensureRunMetrics();
      if (shouldTrack && !m.first_release_done) {
        m.first_release_done = true;
        safeTrack('first_release', {}, { urgent: true });
      }
      return result;
    };
  }

  if (typeof capture === 'function') {
    const _capture = capture;
    window.capture = function(nodeIdx){
      let tier = 'unknown';
      let prePhase = currentPhase();
      try {
        if (typeof nodes !== 'undefined' && nodes[nodeIdx]) tier = String(nodes[nodeIdx].tier || 'unknown');
      } catch (e) {}
      const result = _capture.apply(this, arguments);
      const m = ensureRunMetrics();
      m.captures += 1;
      if (tier === 'easy') m.captures_easy += 1;
      else if (tier === 'medium') m.captures_medium += 1;
      else if (tier === 'hard') m.captures_hard += 1;
      else if (tier === 'gold') { m.captures_gold += 1; m.gold_captures += 1; }
      m.best_combo_run = Math.max(num(m.best_combo_run), num(typeof combo !== 'undefined' ? combo : 0), num(typeof maxCombo !== 'undefined' ? maxCombo : 0));
      const phaseNow = currentPhase();
      m.phase_max = Math.max(num(m.phase_max, 1), phaseNow);
      if (tier === 'gold') {
        safeTrack('gold_capture', { tier, gained: num(typeof score !== 'undefined' ? score : 0) }, { urgent: true });
      }
      if (phaseNow > prePhase) {
        safeTrack('phase_reached', {
          phase_reached: phaseNow,
          phase_name: (typeof PHASE_NAMES !== 'undefined' && PHASE_NAMES[phaseNow]) ? PHASE_NAMES[phaseNow] : ''
        }, { urgent: true });
      }
      trackScoreMilestonesIfNeeded();
      return result;
    };
  }

  if (typeof collectPowerup === 'function') {
    const _collectPowerup = collectPowerup;
    window.collectPowerup = function(p){
      const result = _collectPowerup.apply(this, arguments);
      const m = ensureRunMetrics();
      const type = p && p.type ? String(p.type) : 'unknown';
      m.powerups_collected += 1;
      if (type === 'shield') m.powerup_shield += 1;
      else if (type === 'slowmo') m.powerup_slowmo += 1;
      else if (type === 'magnet') m.powerup_magnet += 1;
      safeTrack('powerup_collected', { type });
      return result;
    };
  }

  if (typeof handleTap === 'function') {
    const _handleTap = handleTap;
    window.handleTap = function(x, y){
      try {
        if (typeof state !== 'undefined' && typeof ST !== 'undefined' && state === ST.PLAY && typeof isPauseBtnTap === 'function' && isPauseBtnTap(x, y)) {
          const m = ensureRunMetrics();
          m.pause_count += 1;
          safeTrack('pause_opened', {});
        }
      } catch (e) {}
      return _handleTap.apply(this, arguments);
    };
  }

  if (typeof document !== 'undefined' && document.addEventListener) {
    document.addEventListener('visibilitychange', () => {
      try {
        if (document.hidden && typeof state !== 'undefined' && typeof ST !== 'undefined' && state === ST.PLAY) {
          const m = ensureRunMetrics();
          m.pause_count += 1;
          safeTrack('pause_opened', { auto: true, reason: 'visibility_hidden' });
        }
      } catch (e) {}
    });
  }

  if (typeof die === 'function') {
    const _die = die;
    window.die = function(){
      if (typeof state !== 'undefined' && typeof ST !== 'undefined' && state !== ST.PLAY) {
        return _die.apply(this, arguments);
      }

      const shieldBefore = (typeof activeShield !== 'undefined' && !!activeShield);
      const bestBefore = num(typeof best !== 'undefined' ? best : 0);
      const scoreBefore = num(typeof score !== 'undefined' ? score : 0);
      const phaseBefore = currentPhase();
      const reason = estimateDeathReason();
      const m = ensureRunMetrics();
      m.best_combo_run = Math.max(num(m.best_combo_run), num(typeof combo !== 'undefined' ? combo : 0), num(typeof maxCombo !== 'undefined' ? maxCombo : 0));
      m.phase_max = Math.max(num(m.phase_max, 1), phaseBefore);
      m.death_reason = reason;

      if (shieldBefore) {
        safeTrack('shield_saved', { trigger_reason: reason });
      }

      const result = _die.apply(this, arguments);

      if (!shieldBefore) {
        safeTrack('game_over', {
          death_reason: reason,
          final_score: scoreBefore,
          final_phase: phaseBefore,
          new_record: scoreBefore > bestBefore,
          total_games_after: num(typeof totalGames !== 'undefined' ? totalGames : 0)
        }, { urgent: true });

        if (scoreBefore > bestBefore) {
          safeTrack('new_record', {
            previous_best: bestBefore,
            new_best: scoreBefore
          }, { urgent: true });
        }

        runMetrics = null;
      }
      return result;
    };
  }

  if (typeof loadRankings === 'function') {
    const _loadRankings = loadRankings;
    window.loadRankings = async function(){
      const started = nowMs();
      const result = await _loadRankings.apply(this, arguments);
      const durationMs = Math.round(nowMs() - started);
      try {
        if (typeof rankingsError !== 'undefined' && rankingsError) {
          if (typeof trackEvent === 'function') {
            trackEvent('ranking_load_failed', {
              error: String(rankingsError || 'unknown'),
              duration_ms: durationMs,
              online: (typeof networkOnline !== 'undefined' ? !!networkOnline : null)
            });
          }
        } else if (typeof trackEvent === 'function') {
          trackEvent('ranking_loaded', {
            rows: (typeof rankings !== 'undefined' && Array.isArray(rankings)) ? rankings.length : 0,
            user_in_top_50: (typeof userPosition !== 'undefined' ? userPosition >= 0 : null),
            duration_ms: durationMs
          });
        }
      } catch (e) {}
      return result;
    };
  }
})();
