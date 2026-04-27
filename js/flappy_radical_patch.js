// ============================================================
// FLAPPY RADICAL PATCH
// Estilo Flappy Bird: simplicidade absoluta, dificuldade brutal
// desde o cano 1, reinicio instantaneo, "quase consegui",
// print como trofeu. Sem ranking, sem skins, sem fundos,
// sem carreira, sem missoes.
// Carregado por ultimo, sobrescreve hooks dos outros patches.
// ============================================================
(function(){
  'use strict';

  // ---------- 1. DIFICULDADE BRUTAL: fase 6 desde o cano 1 ----------
  // Sobrescreve getPhase global preservando comportamento do zen.
  if (typeof window.getPhase === 'function') {
    window.getPhase = function(){
      if (typeof zenMode !== 'undefined' && zenMode) return 1;
      return 6;
    };
  }

  // ---------- 2. SIMPLICIDADE: zera tutorial e desativa hibrido ----------
  // Hook de gameplay para ignorar qualquer ajuste assistido.
  if (typeof registerOrbitaGameplayHook === 'function') {
    // nao temos hook de "tutorial", mas anulamos passos no proximo update.
  }

  // Patch reset() para nunca habilitar tutorial nem assistencia.
  if (typeof window.reset === 'function') {
    const _origReset = window.reset;
    window.reset = function(){
      const r = _origReset.apply(this, arguments);
      if (typeof tutorialStep !== 'undefined') tutorialStep = 0;
      if (typeof tutorialT !== 'undefined') tutorialT = 0;
      return r;
    };
  }

  // ---------- 3. PULAR LOADING / IR DIRETO PRO MENU MINIMAL ----------
  // Se a tela inicial estiver em loading/login, vai pra main.
  function forceSimpleMenu(){
    if (typeof menuScreen !== 'undefined' && menuScreen !== 'main') {
      menuScreen = 'main';
    }
  }
  // Roda algumas vezes ate carregamentos terminarem.
  let _bootForce = 0;
  const _bootInterval = setInterval(()=>{
    forceSimpleMenu();
    _bootForce++;
    if (_bootForce > 30) clearInterval(_bootInterval);
  }, 100);

  // ---------- 4. MENU MINIMAL: titulo + recorde + "TOQUE PARA JOGAR" ----------
  // Substitui completamente o roteador do shell de menu para nao mostrar
  // skins, fundos, ranking, settings, login, etc.
  window.orbitaMenuShell_drawMenuUI = function(){
    if (typeof menuBtnAreas !== 'undefined') menuBtnAreas = [];

    // BG escuro estrelado ja vem do render principal. So overlay leve.
    X.textAlign = 'center';
    X.textBaseline = 'middle';

    // Titulo grande pulsante
    const titlePulse = 1 + Math.sin((typeof menuT==='number'?menuT:0) * 2.4) * 0.04;
    X.save();
    X.translate(W/2, H*0.32);
    X.scale(titlePulse, titlePulse);
    X.shadowColor = '#b0b0ff';
    X.shadowBlur = 32;
    X.fillStyle = '#ffffff';
    X.font = 'bold 64px -apple-system, system-ui, sans-serif';
    X.fillText('ÓRBITA', 0, 0);
    X.shadowBlur = 0;
    X.restore();

    // Subtitulo
    X.fillStyle = 'rgba(255,255,255,0.45)';
    X.font = '13px -apple-system, system-ui, sans-serif';
    X.fillText('Um toque. Solte. Nao erre.', W/2, H*0.32 + 48);

    // Recorde grande
    const bestVal = (typeof best === 'number') ? best : 0;
    X.fillStyle = 'rgba(255,255,255,0.55)';
    X.font = '12px -apple-system, system-ui, sans-serif';
    X.fillText('RECORDE', W/2, H*0.49);
    X.fillStyle = '#ffd32a';
    X.shadowColor = '#ffaa00';
    X.shadowBlur = 12;
    X.font = 'bold 56px -apple-system, system-ui, sans-serif';
    X.fillText(String(bestVal), W/2, H*0.555);
    X.shadowBlur = 0;

    // "TOQUE PARA JOGAR" piscando
    const blink = 0.55 + Math.sin((typeof menuT==='number'?menuT:0) * 4) * 0.35;
    X.globalAlpha = blink;
    X.fillStyle = '#00f5d4';
    X.shadowColor = '#00f5d4';
    X.shadowBlur = 14;
    X.font = 'bold 22px -apple-system, system-ui, sans-serif';
    X.fillText('▶  TOQUE PARA JOGAR  ◀', W/2, H*0.72);
    X.shadowBlur = 0;
    X.globalAlpha = 1;

    // Mute (canto superior direito) - mantido para acessibilidade
    X.globalAlpha = 0.55;
    X.fillStyle = '#fff';
    X.font = '20px sans-serif';
    X.textAlign = 'right';
    X.fillText((typeof muted!=='undefined' && muted) ? '🔇' : '🔊', W - 16, 26);
    X.globalAlpha = 1;

    // Botao gigante invisivel cobrindo a tela: tap em qualquer lugar joga.
    if (typeof menuBtnAreas !== 'undefined') {
      // Mute area no canto
      menuBtnAreas.push({
        x: W - 50, y: 4, w: 50, h: 44,
        action: function(){
          if (typeof toggleMute === 'function') toggleMute();
        }
      });
      // Tap-anywhere = play
      menuBtnAreas.push({
        x: 0, y: 50, w: W, h: H - 50,
        action: function(){
          if (typeof startRun === 'function') startRun(false, 'tap_anywhere');
        }
      });
    }
  };

  // Bloquear roteamento alternativo caso outros patches restaurem.
  window.orbitaMenuShell_drawMainMenu = window.orbitaMenuShell_drawMenuUI;

  // ---------- 5. PLAY UI MINIMAL: so score grande, sem fase/combo/missao ----------
  window.drawPlayUIModule = function(){
    X.textAlign = 'center';
    X.textBaseline = 'top';

    // Score gigante estilo Flappy
    X.fillStyle = 'rgba(0,0,0,0.35)';
    X.font = 'bold 64px -apple-system, system-ui, sans-serif';
    X.fillText(String(typeof score==='number'?score:0), W/2 + 3, 36);
    X.fillStyle = '#ffffff';
    X.shadowColor = '#000';
    X.shadowBlur = 8;
    X.fillText(String(typeof score==='number'?score:0), W/2, 34);
    X.shadowBlur = 0;

    // Pause btn
    if (typeof drawPauseBtn === 'function') drawPauseBtn();
  };

  // ---------- 6. DEATH SCREEN MINIMAL + REINICIO INSTANTANEO ----------
  // Threshold de "quase consegui" (em pontos).
  const NEAR_MISS_GAP = 3;
  // Tempo minimo antes de aceitar tap pra reiniciar (em segundos).
  const RETRY_DELAY = 0.18;

  // Buffer de screenshot pra share
  let lastShareBlob = null;
  let lastShareScore = -1;

  function tryShareScreenshot(scoreVal){
    try {
      const c = document.getElementById('c');
      if (!c || typeof c.toBlob !== 'function') return;
      c.toBlob(function(blob){
        if (!blob) return;
        lastShareBlob = blob;
        const file = new File([blob], 'orbita-' + scoreVal + '.png', { type: 'image/png' });
        const shareData = {
          title: 'Órbita',
          text: 'Fiz ' + scoreVal + ' pontos no Órbita. Supera ai!',
          files: [file]
        };
        if (navigator.canShare && navigator.canShare(shareData) && navigator.share) {
          navigator.share(shareData).catch(()=>{ downloadBlob(blob, scoreVal); });
        } else {
          downloadBlob(blob, scoreVal);
        }
      }, 'image/png');
    } catch(e) {}
  }

  function downloadBlob(blob, scoreVal){
    try {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'orbita-' + scoreVal + '.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(()=>URL.revokeObjectURL(url), 1500);
    } catch(e) {}
  }

  window.drawDeadUIModule = function(){
    if (typeof menuBtnAreas !== 'undefined') menuBtnAreas = [];

    const dt = (typeof deathT === 'number') ? deathT : 0;
    const oa = Math.min(dt * 3.0, 0.72);
    X.globalAlpha = oa;
    X.fillStyle = '#000';
    X.fillRect(-10, -10, W + 20, H + 20);
    X.globalAlpha = 1;

    if (dt < 0.10) return;

    const f = Math.min((dt - 0.10) * 4, 1);
    X.globalAlpha = f;
    X.textAlign = 'center';
    X.textBaseline = 'middle';

    // Titulo "MORREU"
    X.fillStyle = '#ff5a5a';
    X.shadowColor = '#ff0033';
    X.shadowBlur = 18;
    X.font = 'bold 56px -apple-system, system-ui, sans-serif';
    X.fillText('MORREU', W/2, H*0.22);
    X.shadowBlur = 0;

    // Card central
    const cardW = Math.min(W*0.78, 320);
    const cardH = 170;
    const cardX = (W - cardW)/2;
    const cardY = H*0.32;

    X.fillStyle = 'rgba(0,0,0,0.65)';
    if (typeof roundRect === 'function') {
      roundRect(cardX, cardY, cardW, cardH, 14); X.fill();
    } else {
      X.fillRect(cardX, cardY, cardW, cardH);
    }
    X.strokeStyle = 'rgba(255,255,255,0.18)';
    X.lineWidth = 1.5;
    if (typeof roundRect === 'function') {
      roundRect(cardX, cardY, cardW, cardH, 14); X.stroke();
    } else {
      X.strokeRect(cardX, cardY, cardW, cardH);
    }

    // Score
    X.fillStyle = 'rgba(255,255,255,0.55)';
    X.font = '12px -apple-system, system-ui, sans-serif';
    X.fillText('PONTOS', W/2, cardY + 22);
    X.fillStyle = '#fff';
    X.shadowColor = '#b0b0ff';
    X.shadowBlur = 10;
    X.font = 'bold 48px -apple-system, system-ui, sans-serif';
    X.fillText(String(typeof score==='number'?score:0), W/2, cardY + 56);
    X.shadowBlur = 0;

    // Recorde
    X.fillStyle = 'rgba(255,255,255,0.55)';
    X.font = '12px -apple-system, system-ui, sans-serif';
    X.fillText('RECORDE', W/2, cardY + 96);
    X.fillStyle = '#ffd32a';
    X.font = 'bold 28px -apple-system, system-ui, sans-serif';
    X.fillText(String(typeof best==='number'?best:0), W/2, cardY + 124);

    // Novo recorde
    if (typeof newRec !== 'undefined' && newRec) {
      const pulse = 0.7 + Math.sin((typeof menuT==='number'?menuT:0) * 5) * 0.3;
      X.globalAlpha = f * pulse;
      X.fillStyle = '#ffd32a';
      X.shadowColor = '#ff0';
      X.shadowBlur = 18;
      X.font = 'bold 22px -apple-system, system-ui, sans-serif';
      X.fillText('⭐ NOVO RECORDE! ⭐', W/2, H*0.62);
      X.shadowBlur = 0;
      X.globalAlpha = f;
    } else {
      // QUASE CONSEGUI - efeito cassino
      const sc = (typeof score==='number') ? score : 0;
      const bs = (typeof best==='number') ? best : 0;
      const gap = bs - sc;
      if (bs > 0 && gap > 0 && gap <= NEAR_MISS_GAP) {
        const pulse = 0.65 + Math.sin((typeof menuT==='number'?menuT:0) * 6) * 0.35;
        X.globalAlpha = f * pulse;
        X.fillStyle = '#ff6b9d';
        X.shadowColor = '#ff3377';
        X.shadowBlur = 16;
        X.font = 'bold 22px -apple-system, system-ui, sans-serif';
        const word = (gap === 1) ? 'PONTO' : 'PONTOS';
        X.fillText('FALTOU ' + gap + ' ' + word + '!', W/2, H*0.62);
        X.shadowBlur = 0;
        X.globalAlpha = f;
      }
    }

    // Botao PRINT
    if (dt > RETRY_DELAY) {
      const shareBtnSize = 56;
      const shareBtnX = W/2 - shareBtnSize/2;
      const shareBtnY = H*0.72;

      X.fillStyle = 'rgba(0,0,0,0.55)';
      X.beginPath();
      X.arc(shareBtnX + shareBtnSize/2, shareBtnY + shareBtnSize/2, shareBtnSize/2, 0, Math.PI*2);
      X.fill();
      X.strokeStyle = '#70a1ff';
      X.lineWidth = 2;
      X.shadowColor = '#70a1ff';
      X.shadowBlur = 10;
      X.beginPath();
      X.arc(shareBtnX + shareBtnSize/2, shareBtnY + shareBtnSize/2, shareBtnSize/2, 0, Math.PI*2);
      X.stroke();
      X.shadowBlur = 0;
      X.font = '26px sans-serif';
      X.fillStyle = '#fff';
      X.fillText('📸', shareBtnX + shareBtnSize/2, shareBtnY + shareBtnSize/2 + 1);

      X.fillStyle = 'rgba(255,255,255,0.55)';
      X.font = '11px -apple-system, system-ui, sans-serif';
      X.fillText('PRINT', W/2, shareBtnY + shareBtnSize + 14);

      // Hint reiniciar
      const hintBlink = 0.5 + Math.sin((typeof menuT==='number'?menuT:0) * 4) * 0.35;
      X.globalAlpha = f * hintBlink;
      X.fillStyle = '#00f5d4';
      X.font = 'bold 16px -apple-system, system-ui, sans-serif';
      X.fillText('TOQUE PARA JOGAR DE NOVO', W/2, H*0.86);
      X.globalAlpha = f;

      if (typeof menuBtnAreas !== 'undefined') {
        // Botao print (prioritario)
        menuBtnAreas.push({
          x: shareBtnX - 8, y: shareBtnY - 8,
          w: shareBtnSize + 16, h: shareBtnSize + 16,
          action: function(){
            const sc = (typeof score==='number') ? score : 0;
            if (lastShareScore !== sc) {
              lastShareScore = sc;
              tryShareScreenshot(sc);
            } else if (lastShareBlob) {
              // Reuse cached blob
              if (navigator.share) {
                const file = new File([lastShareBlob], 'orbita-'+sc+'.png', { type: 'image/png' });
                navigator.share({ title:'Órbita', text:'Fiz '+sc+' no Órbita.', files:[file] }).catch(()=>downloadBlob(lastShareBlob, sc));
              } else {
                downloadBlob(lastShareBlob, sc);
              }
            }
          }
        });
      }
    }

    X.globalAlpha = 1;
  };

  // ---------- 7. TAP NA TELA DE MORTE = REINICIA INSTANTANEO ----------
  // Sobrescreve handleTap (definido em game.js) para:
  //  - reiniciar com delay minimo
  //  - tap em qualquer lugar do menu inicial = play
  if (typeof window.handleTap === 'function') {
    const _origHandleTap = window.handleTap;
    window.handleTap = function(x, y){
      if (typeof initAudio === 'function') initAudio();

      // Mute btn comum a todos os estados
      if (typeof isMuteBtnTap === 'function' &&
          (state===ST.PLAY||state===ST.PAUSE||state===ST.MENU||state===ST.DEAD) &&
          isMuteBtnTap(x, y)) {
        if (typeof toggleMute === 'function') toggleMute();
        return;
      }

      // Pause durante play
      if (state===ST.PLAY && typeof isPauseBtnTap === 'function' && isPauseBtnTap(x, y)) {
        state = ST.PAUSE;
        if (typeof setMusicVolume === 'function') setMusicVolume(0.05);
        return;
      }

      // Pause screen continua usando botoes
      if (state === ST.PAUSE) {
        for (const b of menuBtnAreas) {
          if (x>=b.x && x<=b.x+b.w && y>=b.y && y<=b.y+b.h) { b.action(); return; }
        }
        return;
      }

      // Tela de morte: reinicio instantaneo
      if (state === ST.DEAD) {
        // Botao print primeiro
        for (const b of menuBtnAreas) {
          if (x>=b.x && x<=b.x+b.w && y>=b.y && y<=b.y+b.h) { b.action(); return; }
        }
        const dt = (typeof deathT === 'number') ? deathT : 0;
        if (dt > RETRY_DELAY && typeof quickRestartGame === 'function') {
          quickRestartGame('tap_dead');
        }
        return;
      }

      // Menu: tap em qualquer lugar joga (botoes injetados pelo nosso draw)
      if (state === ST.MENU) {
        for (const b of menuBtnAreas) {
          if (x>=b.x && x<=b.x+b.w && y>=b.y && y<=b.y+b.h) { b.action(x,y); return; }
        }
        // Fallback absoluto: se nada bateu, joga.
        if (typeof startRun === 'function') startRun(false, 'fallback_tap');
        return;
      }

      // Play
      if (state === ST.PLAY && typeof release === 'function') release();
    };
  }

  // ---------- 8. NEUTRALIZAR RANKING / UNLOCKS / MISSOES ----------
  // submitScore vira no-op pra remover sincronizacao com servidor.
  if (typeof window.submitScore === 'function') {
    window.submitScore = function(){ return Promise.resolve(null); };
  }

  // Apaga pendingUnlocks/pendingAchievements logo apos die() pra
  // garantir que nenhum banner de skin/missao apareca.
  if (typeof window.die === 'function') {
    const _origDie = window.die;
    window.die = function(){
      const r = _origDie.apply(this, arguments);
      try {
        if (typeof pendingUnlocks !== 'undefined') pendingUnlocks = [];
        if (typeof pendingAchievements !== 'undefined') pendingAchievements = [];
      } catch(e) {}
      return r;
    };
  }

  // ---------- 9. KEYBOARD: SPACE no menu/morte tambem reinicia ----------
  document.addEventListener('keydown', function(e){
    if (e.code !== 'Space' && e.key !== ' ') return;
    if (state === ST.MENU) {
      e.preventDefault();
      if (typeof startRun === 'function') startRun(false, 'kb_menu');
    } else if (state === ST.DEAD) {
      const dt = (typeof deathT === 'number') ? deathT : 0;
      if (dt > RETRY_DELAY && typeof quickRestartGame === 'function') {
        e.preventDefault();
        quickRestartGame('kb_retry');
      }
    }
  }, true);

})();
