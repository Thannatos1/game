
(function(){
  const _origDrawMenuUI = typeof drawMenuUI === 'function' ? drawMenuUI : null;
  const _origDrawMenuScrollChrome = typeof drawMenuScrollChrome === 'function' ? drawMenuScrollChrome : null;

  function stageFor(screen){
    switch(screen){
      case 'skins':
        return { x:(W-560)/2, y:H*0.105, w:560, h:H*0.86, accent:'#c084fc', subtitle:'Coleção de pilotos e raridades', hint:'Toque em uma skin para equipar.', topChipY:H*0.088 };
      case 'backgrounds':
        return { x:(W-390)/2, y:H*0.07, w:390, h:H*0.88, accent:'#70a1ff', subtitle:'Ambientes cósmicos desbloqueáveis', hint:'Toque em um fundo para equipar.', topChipY:H*0.042 };
      case 'stats':
        return { x:(W-620)/2, y:H*0.10, w:620, h:H*0.84, accent:'#ffd32a', subtitle:'Seu desempenho, progresso e marcos', hint:'Use esta tela para acompanhar sua evolução.', topChipY:H*0.09 };
      case 'settings':
        return { x:(W-380)/2, y:H*0.10, w:380, h:H*0.84, accent:'#a0a0c0', subtitle:'Conta, áudio, instalação e preferências', hint:'Tudo o que muda o app fica aqui.', topChipY:H*0.09 };
      case 'ranking':
        return { x:14, y:H*0.105, w:W-28, h:H*0.84, accent:'#ff6b9d', subtitle:'Posição atual, rival imediato e metas', hint:'Jogue mais uma para subir.', topChipY:H*0.095 };
      case 'career':
        return { x:(W-760)/2, y:H*0.10, w:760, h:H*0.84, accent:'#ffd32a', subtitle:'XP, títulos e metas de longo prazo', hint:'Progressão sem afetar a justiça competitiva.', topChipY:H*0.09 };
      default:
        return null;
    }
  }

  function shouldUseRefinedShell(){
    return !!stageFor(menuScreen);
  }

  function drawStage(meta){
    X.save();
    const g = X.createLinearGradient(meta.x, meta.y, meta.x, meta.y + meta.h);
    g.addColorStop(0, 'rgba(4,7,24,0.42)');
    g.addColorStop(0.55, 'rgba(3,5,18,0.18)');
    g.addColorStop(1, 'rgba(2,4,15,0.38)');
    X.fillStyle = g;
    roundRect(meta.x, meta.y, meta.w, meta.h, 18); X.fill();

    X.strokeStyle = 'rgba(255,255,255,0.08)';
    X.lineWidth = 1;
    roundRect(meta.x, meta.y, meta.w, meta.h, 18); X.stroke();

    X.globalAlpha = 0.68;
    X.strokeStyle = meta.accent;
    X.lineWidth = 1.2;
    X.beginPath();
    X.moveTo(meta.x + 18, meta.y + 12);
    X.lineTo(meta.x + meta.w - 18, meta.y + 12);
    X.stroke();
    X.globalAlpha = 1;
    X.restore();
  }

  function drawSubChip(meta){
    const chipW = Math.min(meta.w * 0.58, 320);
    const chipH = 24;
    const x = meta.x + (meta.w - chipW) / 2;
    const y = meta.topChipY;
    X.save();
    X.fillStyle = 'rgba(0,0,0,0.55)';
    roundRect(x, y, chipW, chipH, 12); X.fill();
    X.strokeStyle = meta.accent;
    X.lineWidth = 1.2;
    roundRect(x, y, chipW, chipH, 12); X.stroke();
    X.fillStyle = '#fff';
    X.font = '11px -apple-system, system-ui, sans-serif';
    X.textAlign = 'center';
    X.textBaseline = 'middle';
    X.fillText(meta.subtitle, x + chipW/2, y + chipH/2 + 0.5);
    X.restore();
  }

  function drawHintChip(meta){
    if(menuScreen === 'ranking') return;
    const chipW = Math.min(meta.w * 0.62, 340);
    const chipH = 24;
    const x = meta.x + (meta.w - chipW) / 2;
    const y = meta.y + meta.h - 30;
    X.save();
    X.fillStyle = 'rgba(0,0,0,0.54)';
    roundRect(x, y, chipW, chipH, 12); X.fill();
    X.strokeStyle = 'rgba(255,255,255,0.08)';
    X.lineWidth = 1;
    roundRect(x, y, chipW, chipH, 12); X.stroke();
    X.fillStyle = meta.accent;
    X.font = '10px -apple-system, system-ui, sans-serif';
    X.textAlign = 'center';
    X.textBaseline = 'middle';
    X.fillText(meta.hint, x + chipW/2, y + chipH/2 + 0.5);
    X.restore();
  }

  function refineSkins(){
    if (typeof menuBtnAreas === 'undefined') return;
    const meta = stageFor('skins');
    const cardW = 70, cardH = 70, gapX = 12, gapY = 38;
    const titleLeft = meta.x + 24;
    const gridLeft = meta.x + 40;
    const top = meta.y + 46;

    // just reserve better composition guide; actual drawing remains from base render
    // we overlay soft bands to visually group rows and avoid huge dead space
    X.save();
    X.globalAlpha = 0.12;
    for(let i=0;i<4;i++){
      const y = top + i*(cardH + gapY) - 12;
      X.fillStyle = 'rgba(255,255,255,0.03)';
      roundRect(meta.x + 18, y, meta.w - 36, cardH + 28, 12); X.fill();
    }
    X.restore();
  }

  function refineBackgrounds(){
    const meta = stageFor('backgrounds');
    // mask bottom overflow so cards don't visually leak outside the stage
    X.save();
    X.fillStyle = 'rgba(2,4,15,0.94)';
    X.fillRect(0, meta.y + meta.h - 14, W, H - (meta.y + meta.h - 14));
    X.restore();
  }

  function refineStats(){
    const meta = stageFor('stats');
    // bring achievements area visually into the card
    const achY = meta.y + 320;
    X.save();
    X.globalAlpha = 0.15;
    X.fillStyle = 'rgba(255,255,255,0.03)';
    roundRect(meta.x + 90, achY, meta.w - 180, 122, 14); X.fill();
    X.restore();
  }

  function refineCareer(){
    const meta = stageFor('career');

    // hard mask side areas so the old overly-wide career content stops feeling split
    X.save();
    X.fillStyle = 'rgba(2,4,15,0.96)';
    X.fillRect(0, meta.y + 1, meta.x - 8, meta.h - 2);
    X.fillRect(meta.x + meta.w + 8, meta.y + 1, W - (meta.x + meta.w + 8), meta.h - 2);
    X.restore();

    // interior guide panes to make it feel intentional
    X.save();
    X.globalAlpha = 0.10;
    X.fillStyle = 'rgba(255,255,255,0.03)';
    roundRect(meta.x + 16, meta.y + 18, meta.w - 32, 86, 12); X.fill();
    roundRect(meta.x + 16, meta.y + 116, meta.w - 32, 122, 12); X.fill();
    roundRect(meta.x + 16, meta.y + 250, meta.w - 32, 112, 12); X.fill();
    roundRect(meta.x + 16, meta.y + 374, meta.w - 32, 88, 12); X.fill();
    X.restore();
  }

  if (_origDrawMenuUI) {
    drawMenuUI = function(){
      const meta = stageFor(menuScreen);
      if (meta) {
        drawStage(meta);
      }

      _origDrawMenuUI.apply(this, arguments);

      if (meta) {
        drawSubChip(meta);
        drawHintChip(meta);

        if (menuScreen === 'skins') refineSkins();
        if (menuScreen === 'backgrounds') refineBackgrounds();
        if (menuScreen === 'stats') refineStats();
        if (menuScreen === 'career') refineCareer();
      }
    };
  }

  // widen scroll viewport for these refined screens
  const _origGetMenuScrollViewport = typeof getMenuScrollViewport === 'function' ? getMenuScrollViewport : null;
  getMenuScrollViewport = function(){
    if (menuScreen === 'backgrounds') return { top:H*0.07, bottom:H*0.92 };
    if (menuScreen === 'career') return { top:H*0.10, bottom:H*0.94 };
    if (_origGetMenuScrollViewport) return _origGetMenuScrollViewport();
    return null;
  };
})();
