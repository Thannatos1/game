
(function(){
  const _origDrawMenuUI = typeof drawMenuUI === 'function' ? drawMenuUI : null;
  const _origGetMenuScrollViewport = typeof getMenuScrollViewport === 'function' ? getMenuScrollViewport : null;

  function isPhone(){
    return W <= 480;
  }

  function getSafeBottomPad(){
    return isPhone() ? 96 : 24;
  }

  function countUnlockedSkins(){
    try { return unlockedSkins ? unlockedSkins.size : 0; } catch(e){ return 0; }
  }

  function countTotalSkins(){
    try { return Object.keys(SKINS || {}).length; } catch(e){ return 0; }
  }

  function countUnlockedBgs(){
    try { return unlockedBgs ? unlockedBgs.size : 0; } catch(e){ return 0; }
  }

  function countTotalBgs(){
    try { return Object.keys(BACKGROUNDS || {}).length; } catch(e){ return 0; }
  }

  function stageFor(screen){
    const phone = isPhone();
    switch(screen){
      case 'skins': {
        const x = 12;
        const y = phone ? 84 : H * 0.105;
        const w = phone ? (W - 24) : 430;
        const h = H - y - getSafeBottomPad();
        return { x, y, w, h, accent:'#c084fc', subtitle:'Coleção de pilotos e raridades', hint:'Toque em uma skin para equipar.', topChipY:y-16 };
      }
      case 'backgrounds': {
        const x = phone ? 10 : (W - 390) / 2;
        const y = phone ? 76 : H * 0.07;
        const w = phone ? (W - 20) : 390;
        const h = H - y - getSafeBottomPad();
        return { x, y, w, h, accent:'#70a1ff', subtitle:'Ambientes cósmicos desbloqueáveis', hint:'Toque em um fundo para equipar.', topChipY:y-18 };
      }
      case 'stats': {
        const x = phone ? 10 : (W - 620) / 2;
        const y = phone ? 86 : H * 0.10;
        const w = phone ? (W - 20) : 620;
        const h = H - y - getSafeBottomPad();
        return { x, y, w, h, accent:'#ffd32a', subtitle:'Seu desempenho, progresso e marcos', hint:'Use esta tela para acompanhar sua evolução.', topChipY:y-14 };
      }
      case 'settings': {
        const w = phone ? (W - 24) : 380;
        const x = (W - w) / 2;
        const y = phone ? 84 : H * 0.10;
        const h = H - y - getSafeBottomPad();
        return { x, y, w, h, accent:'#a0a0c0', subtitle:'Conta, áudio, instalação e preferências', hint:'Tudo o que muda o app fica aqui.', topChipY:y-14 };
      }
      case 'ranking': {
        const x = 10;
        const y = phone ? 96 : H * 0.105;
        const w = W - 20;
        const h = H - y - getSafeBottomPad();
        return { x, y, w, h, accent:'#ff6b9d', subtitle:'Posição atual, rival imediato e metas', hint:'Jogue mais uma para subir.', topChipY:y-16 };
      }
      case 'career': {
        const x = phone ? 10 : Math.max(10, (W - 760) / 2);
        const y = phone ? 84 : H * 0.10;
        const w = phone ? (W - 20) : Math.min(760, W - 20);
        const h = H - y - getSafeBottomPad();
        return { x, y, w, h, accent:'#ffd32a', subtitle:'XP, títulos e metas de longo prazo', hint:'Progressão sem afetar a justiça competitiva.', topChipY:y-14 };
      }
      default:
        return null;
    }
  }

  function drawStage(meta){
    X.save();
    const g = X.createLinearGradient(meta.x, meta.y, meta.x, meta.y + meta.h);
    g.addColorStop(0, 'rgba(4,7,24,0.42)');
    g.addColorStop(0.55, 'rgba(3,5,18,0.18)');
    g.addColorStop(1, 'rgba(2,4,15,0.38)');
    X.fillStyle = g;
    roundRect(meta.x, meta.y, meta.w, meta.h, isPhone() ? 14 : 18); X.fill();

    X.strokeStyle = 'rgba(255,255,255,0.08)';
    X.lineWidth = 1;
    roundRect(meta.x, meta.y, meta.w, meta.h, isPhone() ? 14 : 18); X.stroke();

    X.globalAlpha = 0.68;
    X.strokeStyle = meta.accent;
    X.lineWidth = 1.2;
    X.beginPath();
    X.moveTo(meta.x + 16, meta.y + 12);
    X.lineTo(meta.x + meta.w - 16, meta.y + 12);
    X.stroke();
    X.globalAlpha = 1;
    X.restore();
  }

  function shouldHideSubChip(){
    return isPhone() && (menuScreen === 'skins' || menuScreen === 'backgrounds' || menuScreen === 'ranking');
  }

  function drawSubChip(meta){
    if (shouldHideSubChip()) return;
    const chipW = Math.min(meta.w * (isPhone() ? 0.78 : 0.72), isPhone() ? 280 : 320);
    const chipH = isPhone() ? 20 : 24;
    const x = meta.x + (meta.w - chipW) / 2;
    const y = meta.topChipY;
    X.save();
    X.fillStyle = 'rgba(0,0,0,0.55)';
    roundRect(x, y, chipW, chipH, 12); X.fill();
    X.strokeStyle = meta.accent;
    X.lineWidth = 1.1;
    roundRect(x, y, chipW, chipH, 12); X.stroke();
    X.fillStyle = '#fff';
    X.font = (isPhone() ? '10px' : '11px') + ' -apple-system, system-ui, sans-serif';
    X.textAlign = 'center';
    X.textBaseline = 'middle';
    X.fillText(meta.subtitle, x + chipW/2, y + chipH/2 + 0.5);
    X.restore();
  }

  function drawHintChip(meta){
    if(menuScreen === 'ranking') return;
    const chipW = Math.min(meta.w * (isPhone() ? 0.82 : 0.78), 340);
    const chipH = isPhone() ? 22 : 24;
    const x = meta.x + (meta.w - chipW) / 2;
    const y = Math.min(meta.y + meta.h - chipH - 8, H - getSafeBottomPad() + 4 - chipH);
    X.save();
    X.fillStyle = 'rgba(0,0,0,0.58)';
    roundRect(x, y, chipW, chipH, 12); X.fill();
    X.strokeStyle = 'rgba(255,255,255,0.08)';
    X.lineWidth = 1;
    roundRect(x, y, chipW, chipH, 12); X.stroke();
    X.fillStyle = meta.accent;
    X.font = (isPhone() ? '9px' : '10px') + ' -apple-system, system-ui, sans-serif';
    X.textAlign = 'center';
    X.textBaseline = 'middle';
    X.fillText(meta.hint, x + chipW/2, y + chipH/2 + 0.5);
    X.restore();
  }

  function getCompactHeader(){
    switch(menuScreen){
      case 'skins':
        return { title:'SKINS', sub: countUnlockedSkins() + ' / ' + countTotalSkins() + ' DESBLOQUEADAS', accent:'#c084fc' };
      case 'backgrounds':
        return { title:'FUNDOS', sub: countUnlockedBgs() + ' / ' + countTotalBgs() + ' DESBLOQUEADOS', accent:'#70a1ff' };
      case 'ranking':
        return { title:'RANKING', sub:'competitivo', accent:'#ff6b9d' };
      case 'stats':
        return { title:'ESTATÍSTICAS', sub:'desempenho', accent:'#ffd32a' };
      case 'career':
        return { title:'CARREIRA', sub:'progressão', accent:'#ffd32a' };
      case 'settings':
        return { title:'CONFIG', sub:'preferências', accent:'#a0a0c0' };
      default:
        return null;
    }
  }

  function drawCompactHeaderMaskAndText(){
    if (!isPhone()) return;
    const h = getCompactHeader();
    if (!h) return;

    const boxX = 88;
    const boxW = Math.max(150, W - 176);
    const boxY = 8;
    const boxH = 58;

    X.save();
    X.fillStyle = 'rgba(2,4,15,0.96)';
    roundRect(boxX, boxY, boxW, boxH, 14); X.fill();

    X.textAlign = 'center';
    X.textBaseline = 'middle';
    X.fillStyle = '#e8e8ff';
    X.font = (menuScreen === 'ranking' ? 'bold 17px' : 'bold 18px') + ' -apple-system, system-ui, sans-serif';
    X.fillText(h.title, boxX + boxW/2, boxY + 23);

    X.fillStyle = 'rgba(255,255,255,0.62)';
    X.font = '10px -apple-system, system-ui, sans-serif';
    X.fillText(h.sub, boxX + boxW/2, boxY + 42);
    X.restore();
  }

  function refineStats(){
    const meta = stageFor('stats');
    if (!meta) return;
    const achY = meta.y + (isPhone() ? 286 : 320);
    X.save();
    X.globalAlpha = 0.15;
    X.fillStyle = 'rgba(255,255,255,0.03)';
    roundRect(meta.x + (isPhone() ? 28 : 90), achY, meta.w - (isPhone() ? 56 : 180), isPhone() ? 116 : 122, 14); X.fill();
    X.restore();
  }

  function refineCareer(){
    const meta = stageFor('career');
    if (!meta) return;
    X.save();
    X.globalAlpha = 0.10;
    X.fillStyle = 'rgba(255,255,255,0.03)';
    roundRect(meta.x + 10, meta.y + 16, meta.w - 20, isPhone() ? 70 : 86, 12); X.fill();
    roundRect(meta.x + 10, meta.y + (isPhone() ? 96 : 116), meta.w - 20, isPhone() ? 122 : 122, 12); X.fill();
    roundRect(meta.x + 10, meta.y + (isPhone() ? 228 : 250), meta.w - 20, isPhone() ? 104 : 112, 12); X.fill();
    roundRect(meta.x + 10, meta.y + (isPhone() ? 344 : 374), meta.w - 20, isPhone() ? 74 : 88, 12); X.fill();
    X.restore();
  }

  if (_origDrawMenuUI) {
    drawMenuUI = function(){
      const meta = stageFor(menuScreen);
      if (meta) drawStage(meta);

      _origDrawMenuUI.apply(this, arguments);

      if (meta) {
        drawCompactHeaderMaskAndText();
        drawSubChip(meta);
        drawHintChip(meta);

        if (menuScreen === 'stats') refineStats();
        if (menuScreen === 'career') refineCareer();
      }
    };
  }

  getMenuScrollViewport = function(){
    if (menuScreen === 'backgrounds') return { top:isPhone()?72:H*0.07, bottom:H-getSafeBottomPad()+8 };
    if (menuScreen === 'career') return { top:isPhone()?84:H*0.10, bottom:H-getSafeBottomPad()+6 };
    if (_origGetMenuScrollViewport) return _origGetMenuScrollViewport();
    return null;
  };
})();
