
(function(){
  const _origIsMenuScreenScrollable = typeof isMenuScreenScrollable === 'function' ? isMenuScreenScrollable : null;
  const _origGetMenuScrollViewport = typeof getMenuScrollViewport === 'function' ? getMenuScrollViewport : null;
  const _origDrawMenuUI = typeof drawMenuUI === 'function' ? drawMenuUI : null;

  function getSecondaryMeta(){
    switch(menuScreen){
      case 'skins':
        return { subtitle:'Coleção de pilotos e raridades', hint:'Toque em uma skin para equipar.', accent:'#c084fc', stage:'wide' };
      case 'backgrounds':
        return { subtitle:'Ambientes cósmicos desbloqueáveis', hint:'Toque em um fundo para equipar.', accent:'#70a1ff', stage:'center' };
      case 'stats':
        return { subtitle:'Seu desempenho, progresso e marcos', hint:'Use esta tela para acompanhar sua evolução.', accent:'#ffd32a', stage:'medium' };
      case 'settings':
        return { subtitle:'Conta, áudio, instalação e preferências', hint:'Tudo o que muda o app fica aqui.', accent:'#a0a0c0', stage:'center' };
      case 'ranking':
        return { subtitle:'Posição atual, rival imediato e metas', hint:'Jogue mais uma para subir.', accent:'#ff6b9d', stage:'wide' };
      case 'career':
        return { subtitle:'XP, títulos e metas de longo prazo', hint:'Progressão sem afetar a justiça competitiva.', accent:'#ffd32a', stage:'center' };
      case 'login':
        return { subtitle:'Entre para salvar e disputar o ranking', hint:'Sua conta sincroniza nickname e recorde.', accent:'#00f5d4', stage:'center' };
      case 'nickname':
        return { subtitle:'Defina sua identidade competitiva', hint:'Seu apelido aparece no ranking global.', accent:'#00f5d4', stage:'center' };
      case 'changeNickname':
        return { subtitle:'Troque seu apelido atual', hint:'Mudanças afetam como você aparece no ranking.', accent:'#00f5d4', stage:'center' };
      case 'confirmDelete':
        return { subtitle:'Ação irreversível', hint:'Revise antes de apagar seus dados.', accent:'#ff4757', stage:'center' };
      case 'installHelp':
        return { subtitle:'Transforme o jogo em app', hint:'Instalar reduz fricção de retorno.', accent:'#7bed9f', stage:'center' };
      case 'debug':
        return { subtitle:'Ferramentas internas de validação', hint:'Use para testar sem quebrar o fluxo real.', accent:'#00f5d4', stage:'wide' };
      default:
        return null;
    }
  }

  function isPolishableSecondaryScreen(){
    return !!getSecondaryMeta();
  }

  function getStageRect(meta){
    const margin = 14;
    if(!meta) return { x:margin, y:H*0.11, w:W-margin*2, h:H*0.82 };
    let w;
    if(meta.stage === 'center'){
      w = Math.min(W*0.88, 380);
    } else if(meta.stage === 'medium'){
      w = Math.min(W*0.92, 700);
    } else {
      w = W - margin*2;
    }
    return {
      x: (W - w) / 2,
      y: H * 0.11,
      w,
      h: H * 0.82
    };
  }

  function drawSecondaryStage(meta){
    const rect = getStageRect(meta);
    X.save();

    const shadow = X.createRadialGradient(W/2, rect.y + rect.h*0.22, 0, W/2, rect.y + rect.h*0.22, Math.max(W, H)*0.7);
    shadow.addColorStop(0, 'rgba(90,120,255,0.10)');
    shadow.addColorStop(1, 'rgba(90,120,255,0)');
    X.fillStyle = shadow;
    X.fillRect(0, 0, W, H);

    const g = X.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
    g.addColorStop(0, 'rgba(4,7,24,0.46)');
    g.addColorStop(0.5, 'rgba(3,5,18,0.20)');
    g.addColorStop(1, 'rgba(2,4,15,0.42)');
    X.fillStyle = g;
    roundRect(rect.x, rect.y, rect.w, rect.h, 18);
    X.fill();

    X.globalAlpha = 0.9;
    X.strokeStyle = 'rgba(255,255,255,0.08)';
    X.lineWidth = 1;
    roundRect(rect.x, rect.y, rect.w, rect.h, 18);
    X.stroke();

    X.globalAlpha = 0.65;
    X.strokeStyle = meta.accent;
    X.lineWidth = 1.4;
    X.beginPath();
    X.moveTo(rect.x + 18, rect.y + 10);
    X.lineTo(rect.x + rect.w - 18, rect.y + 10);
    X.stroke();

    X.restore();
  }

  function drawSecondarySubheader(meta){
    const chipW = Math.min(W*0.68, 320);
    const chipH = 24;
    const x = (W - chipW) / 2;
    const y = H*0.095;

    X.save();
    X.globalAlpha = 0.88;
    const g = X.createLinearGradient(x, y, x, y + chipH);
    g.addColorStop(0, 'rgba(0,0,0,0.58)');
    g.addColorStop(1, 'rgba(0,0,0,0.34)');
    X.fillStyle = g;
    roundRect(x, y, chipW, chipH, 12);
    X.fill();

    X.strokeStyle = meta.accent;
    X.lineWidth = 1.2;
    roundRect(x, y, chipW, chipH, 12);
    X.stroke();

    X.fillStyle = '#ffffff';
    X.font = '11px -apple-system, system-ui, sans-serif';
    X.textAlign = 'center';
    X.textBaseline = 'middle';
    X.fillText(meta.subtitle, x + chipW/2, y + chipH/2 + 0.5);
    X.restore();
  }

  function drawSecondaryFooter(meta){
    if(menuScreen === 'ranking') return;
    const chipW = Math.min(W*0.72, 330);
    const chipH = 24;
    const x = (W - chipW) / 2;
    const y = H - 32;

    X.save();
    X.globalAlpha = 0.64;
    X.fillStyle = 'rgba(0,0,0,0.54)';
    roundRect(x, y, chipW, chipH, 12);
    X.fill();
    X.strokeStyle = 'rgba(255,255,255,0.10)';
    X.lineWidth = 1;
    roundRect(x, y, chipW, chipH, 12);
    X.stroke();

    X.fillStyle = meta.accent;
    X.font = '10px -apple-system, system-ui, sans-serif';
    X.textAlign = 'center';
    X.textBaseline = 'middle';
    X.fillText(meta.hint, x + chipW/2, y + chipH/2 + 0.5);
    X.restore();
  }

  function drawEdgeFocusVignette(){
    X.save();
    const left = X.createLinearGradient(0,0,60,0);
    left.addColorStop(0,'rgba(2,4,18,0.42)');
    left.addColorStop(1,'rgba(2,4,18,0)');
    X.fillStyle = left;
    X.fillRect(0,0,60,H);

    const right = X.createLinearGradient(W-60,0,W,0);
    right.addColorStop(0,'rgba(2,4,18,0)');
    right.addColorStop(1,'rgba(2,4,18,0.42)');
    X.fillStyle = right;
    X.fillRect(W-60,0,60,H);
    X.restore();
  }

  isMenuScreenScrollable = function(){
    const baseScrollable = _origIsMenuScreenScrollable ? _origIsMenuScreenScrollable() : false;
    return baseScrollable || menuScreen === 'stats' || menuScreen === 'settings' || menuScreen === 'career' || menuScreen === 'ranking';
  };

  getMenuScrollViewport = function(){
    if(_origGetMenuScrollViewport){
      const vp = _origGetMenuScrollViewport();
      if(vp) return vp;
    }
    if(menuScreen === 'stats' || menuScreen === 'settings' || menuScreen === 'career' || menuScreen === 'ranking'){
      return { top:H*0.125, bottom:H-18 };
    }
    return null;
  };

  if(_origDrawMenuUI){
    drawMenuUI = function(){
      const meta = getSecondaryMeta();
      if(meta){
        drawSecondaryStage(meta);
        drawEdgeFocusVignette();
      }

      _origDrawMenuUI.apply(this, arguments);

      if(meta){
        drawSecondarySubheader(meta);
        drawSecondaryFooter(meta);
      }
    };
  }
})();
