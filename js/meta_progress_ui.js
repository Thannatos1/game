(function(){
window.drawMetaProgressTopStatusBadges = function() {
  const badges = [];
  if (typeof networkOnline !== 'undefined' && !networkOnline) {
    badges.push({ text:'SEM INTERNET', color:'#ff6b6b' });
  }
  if (typeof hasPendingScoreSubmission === 'function' && hasPendingScoreSubmission()) {
    badges.push({ text:'SCORE PENDENTE', color:'#ffd32a' });
  }
  if (!badges.length) return;

  let x = 18;
  const y = H - 28;
  for (const badge of badges) {
    X.font='bold 10px -apple-system, system-ui, sans-serif';
    const pad = 10;
    const w = X.measureText(badge.text).width + pad*2;
    X.globalAlpha=0.85;
    X.fillStyle='rgba(0,0,0,0.65)';
    roundRect(x,y,w,22,11); X.fill();
    X.strokeStyle=badge.color; X.lineWidth=1.5; roundRect(x,y,w,22,11); X.stroke();
    X.globalAlpha=1;
    X.fillStyle=badge.color; X.textAlign='center'; X.textBaseline='middle';
    X.fillText(badge.text, x+w/2, y+11);
    x += w + 8;
  }
}


window.drawMetaProgressMissionInfoCard = function(x,y,w,compact){
  if(!currentUser) return false;
  if(typeof ensureDailyMissionState==='function') ensureDailyMissionState();
  const mission = (typeof getDailyMissionTemplate==='function') ? getDailyMissionTemplate() : null;
  const event = (typeof getActiveEvent==='function') ? getActiveEvent() : null;
  if(!mission) return false;

  const hasEvent = !!event;
  const h = compact ? (hasEvent ? 72 : 60) : (hasEvent ? 84 : 70);

  X.save();
  X.globalAlpha=0.78;
  const bg=X.createLinearGradient(x,y,x,y+h);
  bg.addColorStop(0,'rgba(0,0,0,0.72)');
  bg.addColorStop(1,'rgba(0,0,0,0.88)');
  X.fillStyle=bg;
  roundRect(x,y,w,h,12); X.fill();
  X.strokeStyle=event ? event.color : '#7bed9f';
  X.lineWidth=1.5;
  roundRect(x,y,w,h,12); X.stroke();
  X.globalAlpha=1;

  X.textAlign='left';
  X.textBaseline='middle';
  const pad=12;
  let titleY = y + 18;

  if(hasEvent){
    X.fillStyle=event.color;
    X.font='bold 11px -apple-system, system-ui, sans-serif';
    X.fillText(event.icon + ' ' + event.name.toUpperCase(), x+pad, titleY);
    titleY += compact ? 18 : 22;
  }

  const progressText = (typeof getDailyMissionProgressText==='function') ? getDailyMissionProgressText() : '0/0';
  const progressRatio = (typeof getDailyMissionProgress==='function') ? Math.min(1, getDailyMissionProgress()/mission.target) : 0;
  const done = !!(dailyMissionState && dailyMissionState.completed);

  X.fillStyle=done ? '#7bed9f' : '#ffd32a';
  X.font='bold 11px -apple-system, system-ui, sans-serif';
  X.fillText((done?'✅ ':'🎯 ') + 'MISSÃO DO DIA', x+pad, titleY);

  X.fillStyle='#fff';
  X.font='bold 12px -apple-system, system-ui, sans-serif';
  X.fillText(mission.desc, x+pad, titleY + 16);

  const barX=x+pad, barY=y+h-18, barW=w-pad*2, barH=8;
  X.fillStyle='rgba(255,255,255,0.12)';
  roundRect(barX,barY,barW,barH,4); X.fill();

  const fillW = progressRatio > 0 ? Math.max(8, barW*progressRatio) : 0;
  if(fillW > 0){
    X.fillStyle=done ? '#7bed9f' : '#ffd32a';
    roundRect(barX,barY,fillW,barH,4); X.fill();
  }

  X.fillStyle='rgba(255,255,255,0.72)';
  X.font='bold 10px -apple-system, system-ui, sans-serif';
  X.textAlign='right';
  X.fillText(progressText, x+w-pad, barY-4);
  X.restore();
  return true;
}


window.drawMetaProgressStatsMenu = function(){
  X.textAlign='center';X.textBaseline='middle';

  X.fillStyle='#e0e0ff';X.font='bold 30px -apple-system, system-ui, sans-serif';
  X.shadowColor='#ffd32a';X.shadowBlur=15;
  X.fillText('ESTATÍSTICAS',W/2,H*0.06);
  X.shadowBlur=0;

  drawBackBtn();

  // Stats grid
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

  const cols=2;
  const cellW=Math.min(W*0.42,160);
  const cellH=58;
  const gap=10;
  const startX=(W-(cols*cellW+gap))/2;
  let curY=H*0.13;

  for(let i=0;i<stats.length;i++){
    const s=stats[i];
    const col=i%cols;
    const row=Math.floor(i/cols);
    const cx=startX+col*(cellW+gap);
    const cy=curY+row*(cellH+gap);

    // Cell bg
    X.globalAlpha=0.7;
    const bg=X.createLinearGradient(cx,cy,cx,cy+cellH);
    bg.addColorStop(0,'rgba(0,0,0,0.6)');
    bg.addColorStop(1,'rgba(0,0,0,0.85)');
    X.fillStyle=bg;
    roundRect(cx,cy,cellW,cellH,8);
    X.fill();

    X.strokeStyle=s.color;
    X.lineWidth=1;
    X.globalAlpha=0.5;
    roundRect(cx,cy,cellW,cellH,8);
    X.stroke();
    X.globalAlpha=1;

    // Label
    X.fillStyle=s.color;
    X.font='bold 9px -apple-system, system-ui, sans-serif';
    X.textAlign='center';
    X.textBaseline='middle';
    X.fillText(s.label,cx+cellW/2,cy+14);

    // Value
    X.fillStyle='#fff';
    X.font='bold 20px -apple-system, system-ui, sans-serif';
    X.fillText(s.value,cx+cellW/2,cy+36);
  }

  const missionCardY=curY+Math.ceil(stats.length/cols)*(cellH+gap)+12;
  const missionCardVisible = !!currentUser;
  if(missionCardVisible){
    window.drawMetaProgressMissionInfoCard((W-Math.min(W*0.86,330))/2, missionCardY, Math.min(W*0.86,330), false);
  }

  // Achievements section
  const achY=missionCardVisible ? missionCardY+102 : missionCardY;
  X.fillStyle='#ffd32a';
  X.font='bold 12px -apple-system, system-ui, sans-serif';
  X.textAlign='center';
  X.fillText('CONQUISTAS '+achievements.length+'/'+Object.keys(ACHIEVEMENTS).length,W/2,achY);

  // Achievement grid
  const aSize=42;
  const aGap=8;
  const aPerRow=Math.floor((W-30)/(aSize+aGap));
  const allAch=Object.keys(ACHIEVEMENTS);
  const aStartX=(W-(aPerRow*(aSize+aGap)-aGap))/2;
  let aCurY=achY+18;

  for(let i=0;i<allAch.length;i++){
    const k=allAch[i];
    const a=ACHIEVEMENTS[k];
    const unlocked=achievements.includes(k);
    const ac=i%aPerRow;
    const ar=Math.floor(i/aPerRow);
    const ax=aStartX+ac*(aSize+aGap);
    const ay=aCurY+ar*(aSize+aGap);

    X.globalAlpha=unlocked?0.9:0.3;
    X.fillStyle=unlocked?'rgba(255,211,42,0.2)':'rgba(0,0,0,0.5)';
    roundRect(ax,ay,aSize,aSize,8);
    X.fill();

    X.strokeStyle=unlocked?'#ffd32a':'#444';
    X.lineWidth=1.5;
    if(unlocked){X.shadowColor='#ffd32a';X.shadowBlur=8;}
    roundRect(ax,ay,aSize,aSize,8);
    X.stroke();
    X.shadowBlur=0;

    // Icon
    X.globalAlpha=unlocked?1:0.3;
    X.font='22px sans-serif';
    X.textAlign='center';
    X.textBaseline='middle';
    X.fillStyle=unlocked?'#fff':'#666';
    X.fillText(unlocked?a.icon:'🔒',ax+aSize/2,ay+aSize/2);

    // Tap to see name
    menuBtnAreas.push({
      x:ax,y:ay,w:aSize,h:aSize,
      action:()=>{
        if(unlocked){
          // Could show toast - for now just no-op
        }
      }
    });
  }
  X.globalAlpha=1;

  // Hint at bottom
  X.fillStyle='rgba(255,255,255,0.4)';
  X.font='10px -apple-system, system-ui, sans-serif';
  X.textAlign='center';
  X.fillText('Continue jogando para desbloquear mais!',W/2,H*0.96);
}


window.drawMetaProgressRankingMenu = function(){
  window.drawMetaProgressTopStatusBadges();
  X.textAlign='center';X.textBaseline='middle';

  X.fillStyle='#e0e0ff';X.font='bold 26px -apple-system, system-ui, sans-serif';
  X.shadowColor='#ff6b9d';X.shadowBlur=15;
  X.fillText('🌍 RANKING GLOBAL',W/2,H*0.05);
  X.shadowBlur=0;

  drawBackBtn();

  // Player info
  X.fillStyle='rgba(255,255,255,0.5)';
  X.font='11px -apple-system, system-ui, sans-serif';
  X.textAlign='center';
  X.fillText(playerName+' · Recorde: '+best,W/2,H*0.10);

  // Refresh button
  const rbx=W/2-40, rby=H*0.115, rbw=80, rbh=26;
  X.globalAlpha=0.8;
  X.fillStyle='rgba(0,0,0,0.6)';
  roundRect(rbx,rby,rbw,rbh,6);
  X.fill();
  X.strokeStyle='#00f5d4';X.lineWidth=1;
  roundRect(rbx,rby,rbw,rbh,6);
  X.stroke();
  X.fillStyle='#00f5d4';
  X.font='bold 10px -apple-system, system-ui, sans-serif';
  X.fillText('↻ ATUALIZAR',rbx+rbw/2,rby+rbh/2);
  X.globalAlpha=1;
  menuBtnAreas.push({
    x:rbx,y:rby,w:rbw,h:rbh,
    action:()=>{loadRankings();}
  });

  if(rankingsLoading){
    X.fillStyle='#fff';
    X.font='14px -apple-system, system-ui, sans-serif';
    X.fillText('Carregando...',W/2,H*0.5);
    return;
  }

  if(rankingsError){
    X.fillStyle='#ff6b6b';
    X.font='14px -apple-system, system-ui, sans-serif';
    X.fillText(rankingsError,W/2,H*0.5);
    X.fillStyle='rgba(255,255,255,0.5)';
    X.font='11px -apple-system, system-ui, sans-serif';
    X.fillText('Verifique sua conexão',W/2,H*0.54);
    return;
  }

  if(rankings.length===0){
    X.fillStyle='rgba(255,255,255,0.5)';
    X.font='14px -apple-system, system-ui, sans-serif';
    X.fillText('Nenhum recorde ainda!',W/2,H*0.5);
    X.font='11px -apple-system, system-ui, sans-serif';
    X.fillText('Seja o primeiro a marcar pontos',W/2,H*0.54);
    return;
  }

  // Ranking list
  const startY=H*0.16;
  const rowH=42;
  const maxRows=Math.floor((H*0.82)/rowH);
  const visibleRows=Math.min(maxRows, rankings.length);

  for(let i=0;i<visibleRows;i++){
    const r=rankings[i];
    const y=startY+i*rowH;
    const isUser=currentUser && r.user_id===currentUser.id;
    const rank=i+1;

    // Row bg
    X.globalAlpha=0.7;
    let bgColor='rgba(0,0,0,0.5)';
    let borderColor='rgba(255,255,255,0.1)';
    if(rank===1){bgColor='rgba(255,211,42,0.15)';borderColor='#ffd32a';}
    else if(rank===2){bgColor='rgba(200,200,220,0.12)';borderColor='#c8c8dc';}
    else if(rank===3){bgColor='rgba(205,127,50,0.12)';borderColor='#cd7f32';}
    if(isUser){bgColor='rgba(0,245,212,0.15)';borderColor='#00f5d4';}

    X.fillStyle=bgColor;
    roundRect(15,y,W-30,rowH-4,8);
    X.fill();
    X.strokeStyle=borderColor;
    X.lineWidth=isUser?2:1;
    if(isUser){X.shadowColor='#00f5d4';X.shadowBlur=8;}
    roundRect(15,y,W-30,rowH-4,8);
    X.stroke();
    X.shadowBlur=0;
    X.globalAlpha=1;

    // Rank number
    X.fillStyle=rank===1?'#ffd32a':(rank===2?'#c8c8dc':(rank===3?'#cd7f32':'rgba(255,255,255,0.6)'));
    X.font='bold 16px -apple-system, system-ui, sans-serif';
    X.textAlign='center';
    let rankText='#'+rank;
    if(rank===1)rankText='🥇';
    else if(rank===2)rankText='🥈';
    else if(rank===3)rankText='🥉';
    X.fillText(rankText,38,y+rowH/2-2);

    // Skin preview (mini ball)
    X.save();
    drawBallAt(75,y+rowH/2-2,1,false,r.skin||'default');
    X.restore();

    // Name
    X.textAlign='left';
    X.fillStyle=isUser?'#00f5d4':'#fff';
    X.font='bold 14px -apple-system, system-ui, sans-serif';
    let displayName=r.name;
    if(displayName.length>14)displayName=displayName.substring(0,14)+'…';
    X.fillText(displayName,98,y+rowH/2-2);

    if(isUser){
      X.fillStyle='#00f5d4';
      X.font='bold 9px -apple-system, system-ui, sans-serif';
      X.fillText('VOCÊ',98,y+rowH/2+10);
    }

    // Score
    X.textAlign='right';
    X.fillStyle='#fff';
    X.font='bold 18px -apple-system, system-ui, sans-serif';
    X.fillText(r.score,W-25,y+rowH/2-2);
  }

  if(userPosition===-1 && currentUser && best>0){
    X.globalAlpha=0.6;
    X.fillStyle='rgba(255,255,255,0.4)';
    X.font='11px -apple-system, system-ui, sans-serif';
    X.textAlign='center';
    X.fillText('Você não está no top 50 ainda',W/2,H*0.96);
    X.globalAlpha=1;
  }
}


})();
