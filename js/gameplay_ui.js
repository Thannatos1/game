(function(){
function drawPauseBtnModule(){
  const s=PAUSE_BTN.size, m=PAUSE_BTN.margin;
  const bx=W-m-s, by=m;

  // Background circle
  X.globalAlpha=0.3;
  X.fillStyle='#000';
  X.beginPath();X.arc(bx+s/2,by+s/2,s/2,0,Math.PI*2);X.fill();
  X.globalAlpha=0.4;
  X.strokeStyle='#ffffff';
  X.lineWidth=1.5;
  X.beginPath();X.arc(bx+s/2,by+s/2,s/2,0,Math.PI*2);X.stroke();

  // Pause icon (two bars)
  X.globalAlpha=0.85;
  X.fillStyle='#ffffff';
  const barW=4, barH=14, gap=4;
  X.fillRect(bx+s/2-barW-gap/2, by+s/2-barH/2, barW, barH);
  X.fillRect(bx+s/2+gap/2, by+s/2-barH/2, barW, barH);
  X.globalAlpha=1;
}

function drawPauseScreenModule(){
  menuBtnAreas = [];
  // Dim overlay
  X.globalAlpha=0.65;
  X.fillStyle='#000';
  X.fillRect(-10,-10,W+20,H+20);
  X.globalAlpha=1;

  X.textAlign='center';X.textBaseline='middle';

  // Title
  X.shadowColor='#b0b0ff';X.shadowBlur=20;
  X.fillStyle='#e0e0ff';
  X.font='bold 48px -apple-system, system-ui, sans-serif';
  X.fillText('PAUSADO',W/2,H*0.30);
  X.shadowBlur=0;

  // Current score
  X.fillStyle='rgba(255,255,255,0.5)';
  X.font='14px -apple-system, system-ui, sans-serif';
  X.fillText('PONTUAÇÃO ATUAL',W/2,H*0.40);
  X.fillStyle='#fff';
  X.font='bold 42px -apple-system, system-ui, sans-serif';
  X.fillText(score,W/2,H*0.46);

  // Continue button
  const btnW=Math.min(W*0.7,260);
  const btnH=48;
  const btnX=(W-btnW)/2;

  drawActionBtn(btnX,H*0.58,btnW,btnH,'CONTINUAR','#00f5d4',true,()=>{
    state=ST.PLAY;
    setMusicVolume(0.95);
  });

  drawActionBtn(btnX,H*0.58+btnH+12,btnW,btnH,'MENU PRINCIPAL','#ff6b9d',false,()=>{
    zenMode=false;
    testMode=false;
    state=ST.MENU;
    menuScreen='main';
    setMusicVolume(0.80);
  });
}

function drawActionBtnModule(x,y,w,h,label,color,highlight,action){
  // Background
  X.globalAlpha=highlight?0.9:0.7;
  const g=X.createLinearGradient(x,y,x,y+h);
  if(highlight){
    g.addColorStop(0,color);
    g.addColorStop(1,'rgba(0,0,0,0.4)');
  } else {
    g.addColorStop(0,'rgba(0,0,0,0.5)');
    g.addColorStop(1,'rgba(0,0,0,0.7)');
  }
  X.fillStyle=g;
  roundRect(x,y,w,h,12);
  X.fill();

  X.strokeStyle=color;
  X.lineWidth=highlight?2.5:1.5;
  X.shadowColor=color;
  X.shadowBlur=highlight?12:4;
  roundRect(x,y,w,h,12);
  X.stroke();
  X.shadowBlur=0;

  X.globalAlpha=1;
  X.fillStyle=highlight?'#fff':color;
  X.font='bold 19px -apple-system, system-ui, sans-serif';
  X.textAlign='center';
  X.textBaseline='middle';
  X.fillText(label,x+w/2,y+h/2);

  menuBtnAreas.push({x,y,w,h,action});
}

function drawPlayUIModule(){
  X.textAlign='center';X.textBaseline='top';

  // Score
  X.fillStyle='rgba(0,0,0,0.25)';
  X.font='bold 50px -apple-system, system-ui, sans-serif';
  X.fillText(score,W/2+2,32);
  X.fillStyle='#ffffff';X.fillText(score,W/2,30);

  // Phase
  const phase=getPhase();
  if(testMode){
    X.globalAlpha=0.72;X.fillStyle='#ffd32a';
    X.font='bold 12px -apple-system, system-ui, sans-serif';
    X.fillText('TESTE / SEM ERRO',W/2,85);X.globalAlpha=1;
  } else if(zenMode){
    X.globalAlpha=0.5;X.fillStyle='#7bed9f';
    X.font='bold 12px -apple-system, system-ui, sans-serif';
    X.fillText('☯ MODO ZEN',W/2,85);X.globalAlpha=1;
  } else if(phase>1){
    X.globalAlpha=0.35;X.fillStyle='#d4c5ff';
    X.font='12px -apple-system, system-ui, sans-serif';
    X.fillText('FASE '+phase,W/2,85);X.globalAlpha=1;
  }

  // Combo
  if(combo>=2&&comboTimer>0){
    X.globalAlpha=Math.min(comboTimer,1)*0.7;
    X.fillStyle=combo>=5?'#ffd32a':'#00f5d4';
    X.font='bold 16px -apple-system, system-ui, sans-serif';
    const cText=combo>=5?'🔥 COMBO x'+combo+' 🔥':'COMBO x'+combo;
    X.fillText(cText,W/2,100);X.globalAlpha=1;
  }

  // Phase transition
  if(phaseMsgT>0){
    const f=phaseMsgT>2?(2.5-phaseMsgT)*2:Math.min(phaseMsgT*2,1);
    X.globalAlpha=f;X.fillStyle='#ffd32a';
    X.font='bold 26px -apple-system, system-ui, sans-serif';
    X.textBaseline='middle';
    X.fillText('FASE '+getPhase()+': '+phaseMsg,W/2,H*0.18);
    X.textBaseline='top';X.globalAlpha=1;
  }

  // Power-up active timers (left side)
  let puY = 130;
  if(activeShield){
    drawPuTimer(20,puY,'shield','#00ffff',1);
    puY+=42;
  }
  if(slowMoTimer>0){
    drawPuTimer(20,puY,'clock','#c084fc',slowMoTimer/3);
    puY+=42;
  }
  if(magnetTimer>0){
    drawPuTimer(20,puY,'magnet','#ffd32a',magnetTimer/4);
    puY+=42;
  }

  // Tutorial overlay
  if(tutorialStep>0){
    drawTutorial();
  }
}

function drawPuTimerModule(x,y,icon,color,progress){
  const size=34;
  X.save();

  // Background
  X.globalAlpha=0.7;
  X.fillStyle='rgba(0,0,0,0.6)';
  X.beginPath();
  X.arc(x+size/2,y+size/2,size/2,0,Math.PI*2);
  X.fill();

  // Progress arc
  X.globalAlpha=0.9;
  X.strokeStyle=color;
  X.lineWidth=2.5;
  X.shadowColor=color;
  X.shadowBlur=8;
  X.beginPath();
  X.arc(x+size/2,y+size/2,size/2-2,-Math.PI/2,-Math.PI/2+Math.PI*2*progress);
  X.stroke();
  X.shadowBlur=0;

  // Icon centered
  X.globalAlpha=1;
  X.translate(x+size/2,y+size/2);
  X.scale(0.7,0.7);
  X.fillStyle='#ffffff';
  X.strokeStyle='#ffffff';
  X.lineWidth=2;
  X.lineCap='round';
  X.lineJoin='round';

  if(icon==='shield'){
    X.beginPath();
    X.moveTo(0,-8);
    X.lineTo(7,-5);
    X.lineTo(7,2);
    X.quadraticCurveTo(7,7,0,9);
    X.quadraticCurveTo(-7,7,-7,2);
    X.lineTo(-7,-5);
    X.closePath();
    X.fill();
  } else if(icon==='clock'){
    X.beginPath();
    X.arc(0,0,7,0,Math.PI*2);
    X.stroke();
    X.beginPath();
    X.moveTo(0,0);X.lineTo(0,-5);
    X.moveTo(0,0);X.lineTo(4,2);
    X.stroke();
  } else if(icon==='magnet'){
    X.lineWidth=3;
    X.beginPath();
    X.arc(0,0,6,Math.PI,0,false);
    X.stroke();
    X.beginPath();
    X.moveTo(-6,0);X.lineTo(-6,5);
    X.moveTo(6,0);X.lineTo(6,5);
    X.stroke();
    X.fillStyle='#ff4444';
    X.fillRect(-8,4,4,3);
    X.fillRect(4,4,4,3);
  }

  X.restore();
}

function drawDeadUIModule(){
  menuBtnAreas = [];
  const oa=Math.min(deathT*2.5,0.7);
  X.globalAlpha=oa;X.fillStyle='#000';X.fillRect(-10,-10,W+20,H+20);X.globalAlpha=1;
  if(deathT<0.25)return;
  const f=Math.min((deathT-0.25)*3,1);
  X.globalAlpha=f;X.textAlign='center';X.textBaseline='middle';

  X.fillStyle='#ff6b6b';X.font='bold 36px -apple-system, system-ui, sans-serif';
  X.fillText('PERDIDO NO',W/2,H*0.13);
  X.fillText('ESPAÇO',W/2,H*0.185);

  // Medal
  const medal=getMedal(score);
  if(medal&&deathT>0.4){
    const ms=Math.min((deathT-0.4)*4,1);
    const popScale=1+Math.sin(Math.min(ms*Math.PI,Math.PI))*0.3;
    X.globalAlpha=f*ms;
    drawMedal(W/2,H*0.28,medal,popScale*1.1);

    X.fillStyle=medal.color;
    X.font='bold 14px -apple-system, system-ui, sans-serif';
    X.shadowColor=medal.glow;
    X.shadowBlur=10;
    X.fillText(medal.name,W/2,H*0.36);
    X.shadowBlur=0;
    X.globalAlpha=f;
  }

  // Stats
  X.fillStyle='rgba(255,255,255,0.4)';X.font='12px -apple-system, system-ui, sans-serif';
  X.fillText('FASE '+getPhase(),W/2,H*0.42);

  X.fillStyle='#fff';X.font='13px -apple-system, system-ui, sans-serif';
  X.fillText('PONTUAÇÃO',W/2,H*0.47);
  X.font='bold 56px -apple-system, system-ui, sans-serif';
  X.shadowColor='#b0b0ff';X.shadowBlur=15;
  X.fillText(score,W/2,H*0.535);X.shadowBlur=0;

  X.fillStyle='rgba(255,255,255,0.4)';X.font='14px -apple-system, system-ui, sans-serif';
  X.fillText('RECORDE: '+best,W/2,H*0.61);

  // Combo info
  if(maxCombo>=3){
    X.fillStyle='#00f5d4';X.font='12px -apple-system, system-ui, sans-serif';
    X.fillText('MELHOR COMBO: x'+maxCombo,W/2,H*0.66);
  }

  // Next medal hint
  const nextThresholds=[20,50,100,200];
  const nextT=nextThresholds.find(t=>t>score);
  if(nextT){
    const nm=getMedal(nextT);
    X.fillStyle='rgba(255,255,255,0.35)';
    X.font='11px -apple-system, system-ui, sans-serif';
    X.fillText('Próxima medalha: '+nm.name+' em '+nextT+' pts',W/2,H*0.71);
  }

  if(newRec){
    const nrp=0.7+Math.sin(menuT*5)*0.3;
    X.globalAlpha=f*nrp;X.fillStyle='#ffd32a';
    X.font='bold 20px -apple-system, system-ui, sans-serif';
    X.fillText('⭐ NOVO RECORDE! ⭐',W/2,H*0.745);
    X.globalAlpha=f;
  }


  // Unlock notification
  if(pendingUnlocks.length>0 && deathT>0.8){
    const u=pendingUnlocks[0];
    const up=Math.min((deathT-0.8)*3,1);
    const pulse=0.85+Math.sin(menuT*4)*0.15;

    // Background banner
    X.globalAlpha=f*up*0.9;
    const bw=Math.min(W*0.85,320);
    const bh=90;
    const bx=(W-bw)/2;
    const by=H*0.735;

    let rColor='#00f5d4';
    if(u.type==='skin'){
      rColor=getRarityColor(u.data.rarity);
    } else if(u.type==='achievement'){
      rColor='#ffd32a';
    } else if(u.type==='mission'){
      rColor='#7bed9f';
    } else {
      rColor='#70a1ff';
    }

    const bg2=X.createLinearGradient(bx,by,bx,by+bh);
    bg2.addColorStop(0,'rgba(0,0,0,0.85)');
    bg2.addColorStop(1,'rgba(0,0,0,0.95)');
    X.fillStyle=bg2;
    roundRect(bx,by,bw,bh,12);
    X.fill();

    X.strokeStyle=rColor;
    X.lineWidth=2.5;
    X.shadowColor=rColor;
    X.shadowBlur=15*pulse;
    roundRect(bx,by,bw,bh,12);
    X.stroke();
    X.shadowBlur=0;
    X.globalAlpha=f*up;

    // Icon preview
    if(u.type==='skin'){
      X.save();
      drawBallAt(bx+30,by+bh/2,1,false,u.key);
      X.restore();
    } else if(u.type==='achievement'){
      X.fillStyle=rColor;
      X.font='32px sans-serif';
      X.textAlign='center';
      X.textBaseline='middle';
      X.fillText(u.data.icon,bx+30,by+bh/2);
    } else if(u.type==='mission'){
      X.fillStyle=rColor;
      X.font='30px sans-serif';
      X.textAlign='center';
      X.textBaseline='middle';
      X.fillText(u.data.icon || '🌠',bx+30,by+bh/2);
    } else {
      X.save();
      X.beginPath();
      X.arc(bx+30,by+bh/2,18,0,Math.PI*2);
      X.clip();
      drawMiniBg(u.data.type,bx+12,by+bh/2-18,36,36);
      X.restore();
    }

    // Text
    X.textAlign='left';X.textBaseline='middle';
    X.fillStyle=rColor;
    X.font='bold 11px -apple-system, system-ui, sans-serif';
    let label='🎉 DESBLOQUEADO!';
    if(u.type==='achievement')label='🏆 CONQUISTA!';
    if(u.type==='mission')label='🌠 MISSÃO COMPLETA!';
    X.fillText(label,bx+58,by+20);

    X.fillStyle='#fff';
    X.font='bold 18px -apple-system, system-ui, sans-serif';
    X.fillText(u.data.name.toUpperCase(),bx+58,by+40);

    if(u.type==='skin'){
      X.fillStyle=rColor;
      X.font='bold 10px -apple-system, system-ui, sans-serif';
      X.fillText(getRarityName(u.data.rarity),bx+58,by+58);
    } else if(u.type==='achievement'){
      X.fillStyle='rgba(255,255,255,0.7)';
      X.font='10px -apple-system, system-ui, sans-serif';
      X.fillText(u.data.desc,bx+58,by+58);
    } else if(u.type==='mission'){
      X.fillStyle='#7bed9f';
      X.font='bold 10px -apple-system, system-ui, sans-serif';
      X.fillText('MISSÃO DO DIA',bx+58,by+58);
    } else {
      X.fillStyle='#70a1ff';
      X.font='bold 10px -apple-system, system-ui, sans-serif';
      X.fillText('NOVO FUNDO',bx+58,by+58);
    }

    X.fillStyle='rgba(255,255,255,0.5)';
    X.font='10px -apple-system, system-ui, sans-serif';
    if(u.type==='achievement'){
      X.fillText('Veja em estatísticas',bx+58,by+74);
    } else if(u.type==='mission'){
      X.fillText(u.data.desc || 'Volte amanhã para outra missão',bx+58,by+74);
    } else {
      X.fillText('Equipe no menu principal',bx+58,by+74);
    }

    // Count badge if multiple
    if(pendingUnlocks.length>1){
      X.fillStyle='#ffd32a';
      X.font='bold 14px -apple-system, system-ui, sans-serif';
      X.textAlign='right';
      X.fillText('+'+(pendingUnlocks.length-1),bx+bw-12,by+20);
    }

    X.textAlign='center';X.textBaseline='middle';
  }
  X.globalAlpha=f;

  // Action buttons (after small delay)
  if(deathT>0.6){
    X.globalAlpha=f;
    const btnW=Math.min(W*0.7,260);
    const btnH=44;
    const btnX=(W-btnW)/2;
    const hasUnlock = pendingUnlocks.length>0;
    const btnY1 = hasUnlock ? H*0.86 : H*0.79;

    drawActionBtn(btnX,btnY1,btnW,btnH,'JOGAR DE NOVO','#00f5d4',true,()=>{
      quickRestartGame('death_button');
    });

    if(!hasUnlock){
      drawActionBtn(btnX,btnY1+btnH+8,btnW,btnH,'MENU PRINCIPAL','#ff6b9d',false,()=>{
        pendingUnlocks=[];
        zenMode=false;
        testMode=false;
        state=ST.MENU;
        menuScreen='main';
        setMusicVolume(0.95);
      });
    } else {
      // Smaller menu btn alongside
      drawActionBtn(btnX,btnY1+btnH+6,btnW,36,'IR AO MENU','#ff6b9d',false,()=>{
        pendingUnlocks=[];
        zenMode=false;
        testMode=false;
        state=ST.MENU;
        menuScreen='main';
        setMusicVolume(0.95);
      });
    }
  }
  X.globalAlpha=1;
}

window.drawPauseBtnModule = drawPauseBtnModule;
window.drawPauseScreenModule = drawPauseScreenModule;
window.drawActionBtnModule = drawActionBtnModule;
window.drawPlayUIModule = drawPlayUIModule;
window.drawPuTimerModule = drawPuTimerModule;
window.drawDeadUIModule = drawDeadUIModule;
})();
