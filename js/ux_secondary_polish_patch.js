
(function(){
  function isSecondaryHeaderCompactMobile(){
    return W <= 560 && H >= W * 1.25;
  }

  const _origIsMenuScreenScrollable = typeof isMenuScreenScrollable === 'function' ? isMenuScreenScrollable : null;
  const _origGetMenuScrollViewport = typeof getMenuScrollViewport === 'function' ? getMenuScrollViewport : null;
  const _origDrawMenuUI = typeof drawMenuUI === 'function' ? drawMenuUI : null;

  function getSecondaryMeta(){
    const mobile = isSecondaryHeaderCompactMobile();
    switch(menuScreen){
      case 'skins':
        return { subtitle:'Coleção de pilotos e raridades', hint:'Toque em uma skin para equipar.', accent:'#c084fc', width:560, stageY:mobile?0.135:0.11, chipY:mobile?0.102:0.092, chipW:mobile?250:320, footerW:350 };
      case 'backgrounds':
        return { subtitle:'Ambientes cósmicos desbloqueáveis', hint:'Toque em um fundo para equipar.', accent:'#70a1ff', width:380, stageY:mobile?0.135:0.11, chipY:mobile?0.102:0.092, chipW:mobile?250:320, footerW:320 };
      case 'stats':
        return { subtitle:'Seu desempenho, progresso e marcos', hint:'Use esta tela para acompanhar sua evolução.', accent:'#ffd32a', width:620, stageY:mobile?0.128:0.10, chipY:mobile?0.101:0.092, chipW:mobile?240:300, footerW:320 };
      case 'settings':
        return { subtitle:'Conta, áudio, instalação e preferências', hint:'Tudo o que muda o app fica aqui.', accent:'#a0a0c0', width:380, stageY:mobile?0.135:0.11, chipY:mobile?0.102:0.092, chipW:mobile?250:320, footerW:260 };
      case 'ranking':
        return { subtitle:'Posição atual, rival imediato e metas', hint:'Jogue mais uma para subir.', accent:'#ff6b9d', width:null, stageY:mobile?0.145:0.13, chipY:0.0, chipW:0, footerW:0, hideChip:true, hideFooter:true };
      case 'career':
        return { subtitle:'XP, títulos e metas de longo prazo', hint:'Progressão sem afetar a justiça competitiva.', accent:'#ffd32a', width:440, stageY:mobile?0.145:0.11, chipY:mobile?0.114:0.092, chipW:mobile?245:320, footerW:320 };
      case 'login':
        return { subtitle:'Entre para salvar e disputar o ranking', hint:'Sua conta sincroniza nickname e recorde.', accent:'#00f5d4', width:380, stageY:mobile?0.135:0.11, chipY:mobile?0.102:0.092, chipW:mobile?250:320, footerW:320 };
      case 'nickname':
      case 'changeNickname':
        return { subtitle:'Defina sua identidade competitiva', hint:'Seu apelido aparece no ranking global.', accent:'#00f5d4', width:380, stageY:mobile?0.135:0.11, chipY:mobile?0.102:0.092, chipW:mobile?250:320, footerW:320 };
      case 'confirmDelete':
        return { subtitle:'Ação irreversível', hint:'Revise antes de apagar seus dados.', accent:'#ff4757', width:380, stageY:mobile?0.135:0.11, chipY:mobile?0.102:0.092, chipW:mobile?250:320, footerW:300 };
      case 'installHelp':
        return { subtitle:'Transforme o jogo em app', hint:'Instalar reduz fricção de retorno.', accent:'#7bed9f', width:380, stageY:mobile?0.135:0.11, chipY:mobile?0.102:0.092, chipW:mobile?240:300, footerW:320 };
      case 'debug':
        return { subtitle:'Ferramentas internas de validação', hint:'Use para testar sem quebrar o fluxo real.', accent:'#00f5d4', width:720, stageY:mobile?0.135:0.11, chipY:mobile?0.102:0.092, chipW:mobile?250:320, footerW:320 };
      default:
        return null;
    }
  }

  function getStageRect(meta){
    const margin = 14;
    const w = meta && meta.width ? Math.min(W - margin*2, meta.width) : (W - margin*2);
    const y = H * ((meta && meta.stageY) ? meta.stageY : 0.11);
    return { x:(W-w)/2, y, w, h:H*0.82 };
  }

  function drawSecondaryStage(meta){
    const rect = getStageRect(meta);
    X.save();

    const shadow = X.createRadialGradient(W/2, rect.y + rect.h*0.24, 0, W/2, rect.y + rect.h*0.24, Math.max(W, H)*0.72);
    shadow.addColorStop(0, 'rgba(90,120,255,0.09)');
    shadow.addColorStop(1, 'rgba(90,120,255,0)');
    X.fillStyle = shadow;
    X.fillRect(0, 0, W, H);

    const g = X.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
    g.addColorStop(0, 'rgba(4,7,24,0.44)');
    g.addColorStop(0.5, 'rgba(3,5,18,0.18)');
    g.addColorStop(1, 'rgba(2,4,15,0.40)');
    X.fillStyle = g;
    roundRect(rect.x, rect.y, rect.w, rect.h, 18);
    X.fill();

    X.globalAlpha = 0.88;
    X.strokeStyle = 'rgba(255,255,255,0.07)';
    X.lineWidth = 1;
    roundRect(rect.x, rect.y, rect.w, rect.h, 18);
    X.stroke();

    X.globalAlpha = 0.62;
    X.strokeStyle = meta.accent;
    X.lineWidth = 1.3;
    X.beginPath();
    X.moveTo(rect.x + 18, rect.y + 10);
    X.lineTo(rect.x + rect.w - 18, rect.y + 10);
    X.stroke();

    X.restore();
  }

  function drawSecondarySubheader(meta){
    if (!meta || meta.hideChip) return;
    const mobile = isSecondaryHeaderCompactMobile();
    const chipW = Math.min(mobile ? W*0.74 : W*0.68, meta.chipW || 320);
    const chipH = mobile ? 22 : 24;
    const x = (W - chipW) / 2;
    const y = H * (meta.chipY || 0.092);

    X.save();
    X.globalAlpha = 0.88;
    const g = X.createLinearGradient(x, y, x, y + chipH);
    g.addColorStop(0, 'rgba(0,0,0,0.56)');
    g.addColorStop(1, 'rgba(0,0,0,0.30)');
    X.fillStyle = g;
    roundRect(x, y, chipW, chipH, 12);
    X.fill();

    X.strokeStyle = meta.accent;
    X.lineWidth = 1.1;
    roundRect(x, y, chipW, chipH, 12);
    X.stroke();

    X.fillStyle = '#ffffff';
    X.font = (mobile ? '10px -apple-system, system-ui, sans-serif' : '11px -apple-system, system-ui, sans-serif');
    X.textAlign = 'center';
    X.textBaseline = 'middle';
    X.fillText(meta.subtitle, x + chipW/2, y + chipH/2 + 0.5);
    X.restore();
  }

  function drawSecondaryFooter(meta){
    if(!meta || meta.hideFooter) return;
    const chipW = Math.min(W*0.72, meta.footerW || 330);
    const chipH = 24;
    const x = (W - chipW) / 2;
    const y = H - 32;

    X.save();
    X.globalAlpha = 0.62;
    X.fillStyle = 'rgba(0,0,0,0.54)';
    roundRect(x, y, chipW, chipH, 12);
    X.fill();
    X.strokeStyle = 'rgba(255,255,255,0.09)';
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

  function drawEdgeFocusVignette(meta){
    if (meta && meta.width && meta.width < W-30) {
      X.save();
      const gx = (W - Math.min(W-28, meta.width))/2;
      const left = X.createLinearGradient(0,0,gx+30,0);
      left.addColorStop(0,'rgba(2,4,18,0.42)');
      left.addColorStop(1,'rgba(2,4,18,0)');
      X.fillStyle = left;
      X.fillRect(0,0,gx+30,H);

      const right = X.createLinearGradient(W-gx-30,0,W,0);
      right.addColorStop(0,'rgba(2,4,18,0)');
      right.addColorStop(1,'rgba(2,4,18,0.42)');
      X.fillStyle = right;
      X.fillRect(W-gx-30,0,gx+30,H);
      X.restore();
      return;
    }

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

  function getContentRect(width){
    const w = Math.min(W-28, width);
    return { x:(W-w)/2, w };
  }

  function getInnerShellViewport(screen){
    const meta = getSecondaryMeta ? getSecondaryMeta() : null;
    const rect = getStageRect(meta || null);
    const topInset = (screen === 'debug') ? 26 : 22;
    const bottomInset = (screen === 'debug') ? 74 : 66;
    return {
      left: rect.x + 6,
      right: rect.x + rect.w - 6,
      top: rect.y + topInset,
      bottom: rect.y + rect.h - bottomInset
    };
  }


  // Re-layout SKINS to fit the centered shell instead of the full screen width.
  if (typeof drawSkinsMenu === 'function') {
    drawSkinsMenu = function(){
      X.textAlign='center'; X.textBaseline='middle';

      X.fillStyle='#e0e0ff';
      X.font='bold 30px -apple-system, system-ui, sans-serif';
      X.shadowColor='#b0b0ff'; X.shadowBlur=15;
      X.fillText('SKINS',W/2,H*0.06);
      X.shadowBlur=0;

      X.fillStyle='rgba(255,255,255,0.5)';
      X.font='12px -apple-system, system-ui, sans-serif';
      const totalSkins=Object.keys(SKINS).length;
      X.fillText(unlockedSkins.length+' / '+totalSkins+' DESBLOQUEADAS',W/2,H*0.06+22);

      drawBackBtn();

      const rarities=['common','rare','legendary','stellar'];
      const skinsByRarity={common:[],rare:[],legendary:[],stellar:[]};
      for(const k in SKINS) skinsByRarity[SKINS[k].rarity].push(k);

      const box = getContentRect(520);
      const itemSize=70, gap=12;
      const cols=Math.max(1, Math.floor((box.w+gap)/(itemSize+gap)));
      const gridW = cols*(itemSize+gap)-gap;
      const headerX = box.x + 4;
      const viewport = beginMenuScrollClip();
      const contentStartY=Math.max(H*0.13, (viewport ? viewport.top + 10 : H*0.13));
      let curY=contentStartY;

      for(const rarity of rarities){
        const skins=skinsByRarity[rarity];
        if(!skins.length) continue;

        X.fillStyle=getRarityColor(rarity);
        X.font='bold 13px -apple-system, system-ui, sans-serif';
        X.textAlign='left';
        X.shadowColor=getRarityColor(rarity); X.shadowBlur=8;
        X.fillText(getRarityName(rarity), headerX, curY);
        X.shadowBlur=0;
        curY+=22;

        let col=0;
        let startX=(W-gridW)/2;
        for(let idx=0; idx<skins.length; idx++){
          const skinKey=skins[idx];
          const skin=SKINS[skinKey];
          const ix=startX+col*(itemSize+gap);
          const iy=curY;
          const screenY=iy+menuScrollY;
          const isUnlocked=unlockedSkins.includes(skinKey);
          const isSelected=selectedSkin===skinKey;

          X.globalAlpha=isUnlocked?0.6:0.3;
          X.fillStyle='#000';
          roundRect(ix,iy,itemSize,itemSize,10); X.fill();

          X.globalAlpha=1;
          X.strokeStyle=isSelected?'#ffd32a':getRarityColor(rarity);
          X.lineWidth=isSelected?3:1.5;
          if(isSelected){ X.shadowColor='#ffd32a'; X.shadowBlur=12; }
          roundRect(ix,iy,itemSize,itemSize,10); X.stroke();
          X.shadowBlur=0;

          if(isUnlocked){
            X.save();
            drawBallAt(ix+itemSize/2, iy+itemSize/2-4, 1, false, skinKey);
            X.restore();

            X.fillStyle='#fff';
            X.font='bold 9px -apple-system, system-ui, sans-serif';
            X.textAlign='center';
            X.fillText(skin.name,ix+itemSize/2,iy+itemSize-8);

            menuBtnAreas.push({
              x:ix,y:screenY,w:itemSize,h:itemSize,
              action:()=>{ selectedSkin=skinKey; saveData(); }
            });
          } else {
            X.fillStyle='rgba(255,255,255,0.3)';
            X.font='24px sans-serif';
            X.textAlign='center';
            X.fillText('🔒',ix+itemSize/2,iy+itemSize/2-4);

            X.fillStyle='rgba(255,255,255,0.5)';
            X.font='9px -apple-system, system-ui, sans-serif';
            X.fillText(skin.unlock+' pts',ix+itemSize/2,iy+itemSize-8);
          }

          col++;
          if(col>=cols){ col=0; curY+=itemSize+gap; }
        }
        if(col>0) curY+=itemSize+gap;
        curY+=10;
      }

      endMenuScrollClip();
      setMenuScrollBounds(contentStartY, curY, viewport);
      drawMenuScrollBar(viewport);
      drawMenuScrollFades(viewport);
    };
  }

  // Re-layout STATS so achievements stay centered inside the stage.
  if (typeof drawStatsMenu === 'function') {
    drawStatsMenu = function(){
      X.textAlign='center'; X.textBaseline='middle';

      X.fillStyle='#e0e0ff';
      X.font='bold 30px -apple-system, system-ui, sans-serif';
      X.shadowColor='#ffd32a'; X.shadowBlur=15;
      X.fillText('ESTATÍSTICAS',W/2,H*0.06);
      X.shadowBlur=0;

      drawBackBtn();

      const stats=[
        {label:'RECORDE',value:best,color:'#00f5d4'},
        {label:'PARTIDAS',value:totalGames,color:'#70a1ff'},
        {label:'PONTOS TOTAIS',value:totalScoreEver,color:'#ffd32a'},
        {label:'NÓS CAPTURADOS',value:totalNodesEver,color:'#c084fc'},
        {label:'MELHOR COMBO',value:'x'+bestComboEver,color:'#ff6b9d'},
        {label:'NÓS DOURADOS',value:totalGoldCaptured,color:'#ffd700'},
        {label:'FASE MAIS ALTA',value:highestPhase,color:'#7bed9f'},
        {label:'SKINS',value:unlockedSkins.length+'/'+Object.keys(SKINS).length,color:'#c084fc'},
      ];

      const box = getContentRect(560);
      const viewport = beginMenuScrollClip();
      const contentStartY = Math.max(H*0.13, (viewport ? viewport.top + 10 : H*0.13));
      let curY = contentStartY;

      const cols=2;
      const gap=10;
      const cellW=Math.min((box.w-gap)/2, 210);
      const cellH=58;
      const startX=(W-(cols*cellW+gap))/2;

      for(let i=0;i<stats.length;i++){
        const s=stats[i];
        const col=i%cols;
        const row=Math.floor(i/cols);
        const cx=startX+col*(cellW+gap);
        const cy=curY+row*(cellH+gap);

        X.globalAlpha=0.74;
        const bg=X.createLinearGradient(cx,cy,cx,cy+cellH);
        bg.addColorStop(0,'rgba(0,0,0,0.60)');
        bg.addColorStop(1,'rgba(0,0,0,0.84)');
        X.fillStyle=bg;
        roundRect(cx,cy,cellW,cellH,8); X.fill();

        X.strokeStyle=s.color;
        X.lineWidth=1;
        X.globalAlpha=0.56;
        roundRect(cx,cy,cellW,cellH,8); X.stroke();
        X.globalAlpha=1;

        X.fillStyle=s.color;
        X.font='bold 9px -apple-system, system-ui, sans-serif';
        X.textAlign='center';
        X.fillText(s.label,cx+cellW/2,cy+14);

        X.fillStyle='#fff';
        X.font='bold 20px -apple-system, system-ui, sans-serif';
        X.fillText(s.value,cx+cellW/2,cy+36);
      }

      curY += Math.ceil(stats.length/cols)*(cellH+gap) + 12;

      if(currentUser){
        drawMissionInfoCard((W-Math.min(box.w, 360))/2, curY, Math.min(box.w, 360), false);
        curY += 102;
      }

      X.fillStyle='#ffd32a';
      X.font='bold 12px -apple-system, system-ui, sans-serif';
      X.textAlign='center';
      X.fillText('CONQUISTAS '+achievements.length+'/'+Object.keys(ACHIEVEMENTS).length, W/2, curY);

      const aSize=42, aGap=8;
      const usableW = Math.min(box.w, 420);
      const aPerRow=Math.max(3, Math.floor((usableW + aGap)/(aSize+aGap)));
      const allAch=Object.keys(ACHIEVEMENTS);
      const rowW=aPerRow*(aSize+aGap)-aGap;
      const aStartX=(W-rowW)/2;
      let aCurY=curY+18;

      for(let i=0;i<allAch.length;i++){
        const k=allAch[i];
        const a=ACHIEVEMENTS[k];
        const unlocked=achievements.includes(k);
        const ac=i%aPerRow;
        const ar=Math.floor(i/aPerRow);
        const ax=aStartX+ac*(aSize+aGap);
        const ay=aCurY+ar*(aSize+aGap);
        const screenY=ay+menuScrollY;

        X.globalAlpha=unlocked?0.9:0.3;
        X.fillStyle=unlocked?'rgba(255,211,42,0.2)':'rgba(0,0,0,0.5)';
        roundRect(ax,ay,aSize,aSize,8); X.fill();

        X.strokeStyle=unlocked?'#ffd32a':'#444';
        X.lineWidth=1.5;
        if(unlocked){ X.shadowColor='#ffd32a'; X.shadowBlur=8; }
        roundRect(ax,ay,aSize,aSize,8); X.stroke();
        X.shadowBlur=0;

        X.globalAlpha=unlocked?1:0.3;
        X.font='22px sans-serif';
        X.textAlign='center'; X.textBaseline='middle';
        X.fillStyle=unlocked?'#fff':'#666';
        X.fillText(unlocked?a.icon:'🔒',ax+aSize/2,ay+aSize/2);

        menuBtnAreas.push({ x:ax,y:screenY,w:aSize,h:aSize, action:()=>{} });
      }
      X.globalAlpha=1;

      curY = aCurY + Math.ceil(allAch.length / aPerRow)*(aSize+aGap) + 10;

      X.fillStyle='rgba(255,255,255,0.4)';
      X.font='10px -apple-system, system-ui, sans-serif';
      X.textAlign='center';
      X.fillText('Continue jogando para desbloquear mais!', W/2, curY);

      curY += 20;
      endMenuScrollClip();
      setMenuScrollBounds(contentStartY, curY, viewport);
      drawMenuScrollBar(viewport);
      drawMenuScrollFades(viewport);
    };
  }

  isMenuScreenScrollable = function(){
    const baseScrollable = _origIsMenuScreenScrollable ? _origIsMenuScreenScrollable() : false;
    return baseScrollable || menuScreen === 'stats' || menuScreen === 'settings' || menuScreen === 'career' || menuScreen === 'ranking' || menuScreen === 'skins' || menuScreen === 'backgrounds' || menuScreen === 'debug';
  };

  getMenuScrollViewport = function(){
    if(menuScreen === 'skins' || menuScreen === 'backgrounds' || menuScreen === 'debug' || menuScreen === 'stats' || menuScreen === 'settings' || menuScreen === 'career' || menuScreen === 'ranking'){
      return getInnerShellViewport(menuScreen);
    }
    if(_origGetMenuScrollViewport){
      const vp = _origGetMenuScrollViewport();
      if(vp) return vp;
    }
    return null;
  };

  if(_origDrawMenuUI){
    drawMenuUI = function(){
      const meta = getSecondaryMeta();
      if(meta){
        drawSecondaryStage(meta);
        drawEdgeFocusVignette(meta);
      }

      _origDrawMenuUI.apply(this, arguments);

      if(meta){
        drawSecondarySubheader(meta);
        drawSecondaryFooter(meta);
      }
    };
  }
})();
