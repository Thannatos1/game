(function(){
function pushDebugArea(x,y,w,h,action){
  const screenY = y + menuScrollY;
  menuBtnAreas.push({x,y:screenY,w,h,action});
}

function drawDebugSectionTitle(x,y,text,color){
  X.fillStyle=color||'#c084fc';
  X.font='bold 12px -apple-system, system-ui, sans-serif';
  X.textAlign='left';
  X.textBaseline='middle';
  X.fillText(text,x,y);
}

function drawDebugCard(x,y,w,h){
  X.globalAlpha=0.82;
  const g=X.createLinearGradient(x,y,x,y+h);
  g.addColorStop(0,'rgba(8,10,26,0.84)');
  g.addColorStop(1,'rgba(0,0,0,0.92)');
  X.fillStyle=g;
  roundRect(x,y,w,h,12); X.fill();
  X.strokeStyle='rgba(255,255,255,0.12)';
  X.lineWidth=1;
  roundRect(x,y,w,h,12); X.stroke();
  X.globalAlpha=1;
}

function drawDebugActionBtn(x,y,w,h,label,color,action,small){
  X.globalAlpha=0.86;
  const g=X.createLinearGradient(x,y,x,y+h);
  g.addColorStop(0,'rgba(0,0,0,0.58)');
  g.addColorStop(1,'rgba(0,0,0,0.82)');
  X.fillStyle=g;
  roundRect(x,y,w,h,9); X.fill();
  X.strokeStyle=color; X.lineWidth=1.4; roundRect(x,y,w,h,9); X.stroke();
  X.globalAlpha=1;
  X.fillStyle='#fff';
  X.font=(small?'bold 11px':'bold 12px')+' -apple-system, system-ui, sans-serif';
  X.textAlign='center'; X.textBaseline='middle';
  X.fillText(label,x+w/2,y+h/2);
  pushDebugArea(x,y,w,h,action);
}

function debugEnsureAchievements(count){
  const all = Object.keys(ACHIEVEMENTS||{});
  const next = all.slice(0, clamp(count,0,all.length));
  achievements = Array.from(new Set([...(achievements||[]), ...next]));
}

function applyDebugPreset(kind){
  if(kind==='starter'){
    best = Math.max(best, 30);
    totalGames = Math.max(totalGames, 5);
    highestPhase = Math.max(highestPhase, 3);
    bestComboEver = Math.max(bestComboEver, 5);
    totalGoldCaptured = Math.max(totalGoldCaptured, 2);
  } else if(kind==='advanced'){
    best = Math.max(best, 120);
    totalGames = Math.max(totalGames, 20);
    highestPhase = Math.max(highestPhase, 6);
    bestComboEver = Math.max(bestComboEver, 10);
    totalGoldCaptured = Math.max(totalGoldCaptured, 10);
    missionsCompletedTotal = Math.max(missionsCompletedTotal||0, 5);
    debugEnsureAchievements(6);
  } else if(kind==='masterpiece'){
    best = Math.max(best, 300);
    totalGames = Math.max(totalGames, 60);
    highestPhase = Math.max(highestPhase, 6);
    bestComboEver = Math.max(bestComboEver, 15);
    totalGoldCaptured = Math.max(totalGoldCaptured, 30);
    missionsCompletedTotal = Math.max(missionsCompletedTotal||0, 20);
    achievements = Object.keys(ACHIEVEMENTS||{});
    zenUnlocked = true;
  }
  if(typeof checkUnlocks==='function') checkUnlocks();
  if(typeof saveData==='function') saveData();
}

function debugUnlockAllSkins(){
  unlockedSkins = Array.from(new Set(Object.keys(SKINS||{})));
  if(!unlockedSkins.includes('default')) unlockedSkins.unshift('default');
  if(typeof saveData==='function') saveData();
}

function debugUnlockAllBackgrounds(){
  unlockedBgs = Array.from(new Set(Object.keys(BACKGROUNDS||{})));
  if(!unlockedBgs.includes('space')) unlockedBgs.unshift('space');
  if(typeof saveData==='function') saveData();
}

function debugUnlockAll(){
  debugUnlockAllSkins();
  debugUnlockAllBackgrounds();
  zenUnlocked = true;
  achievements = Object.keys(ACHIEVEMENTS||{});
  best = Math.max(best, 300);
  bestComboEver = Math.max(bestComboEver, 15);
  highestPhase = Math.max(highestPhase, 6);
  totalGoldCaptured = Math.max(totalGoldCaptured, 30);
  missionsCompletedTotal = Math.max(missionsCompletedTotal||0, 20);
  if(typeof saveData==='function') saveData();
}

function debugSelectBackground(bgKey){
  if(!bgKey || !BACKGROUNDS[bgKey]) return;
  if(!unlockedBgs.includes(bgKey)) unlockedBgs.push(bgKey);
  selectedBg = bgKey;
  if(typeof saveData==='function') saveData();
}

function debugPlaySfx(kind){
  if(typeof initAudio==='function') initAudio();
  if(kind==='release' && typeof sndRelease==='function') sndRelease();
  else if(kind==='capture' && typeof sndCapture==='function') sndCapture(2,2);
  else if(kind==='gold' && typeof sndCapture==='function') sndCapture(5,5);
  else if(kind==='phase' && typeof sndPhase==='function') sndPhase();
  else if(kind==='die' && typeof sndDie==='function') sndDie();
  else if(kind==='record' && typeof sndRecord==='function') sndRecord();
}

function drawDebugMenu(){
  X.textAlign='center'; X.textBaseline='middle';
  X.fillStyle='#e0e0ff'; X.font='bold 28px -apple-system, system-ui, sans-serif';
  X.shadowColor='#c084fc'; X.shadowBlur=15;
  X.fillText('🧪 DEBUG / TESTES', W/2, H*0.06);
  X.shadowBlur=0;

  drawBackBtn();

  const contentW = Math.min(W*0.88, 360);
  const contentX = (W-contentW)/2;
  const viewport = beginMenuScrollClip();
  const contentStartY = Math.max(H*0.13, (viewport ? viewport.top + 10 : H*0.13));
  let curY = contentStartY;

  drawDebugCard(contentX,curY,contentW,60);
  X.fillStyle='rgba(255,255,255,0.86)';
  X.font='bold 12px -apple-system, system-ui, sans-serif';
  X.textAlign='left';
  X.fillText('Use isso só para teste local.', contentX+14, curY+18);
  X.fillStyle='rgba(255,255,255,0.55)';
  X.font='11px -apple-system, system-ui, sans-serif';
  X.fillText('Nada aqui deveria ser usado como regra de produção.', contentX+14, curY+38);
  curY += 76;

  drawDebugSectionTitle(contentX, curY, 'RUN RÁPIDA', '#00f5d4');
  curY += 14;
  const gap=10;
  const halfW=(contentW-gap)/2;
  drawDebugActionBtn(contentX,curY,halfW,36,'▶ NORMAL','#00f5d4',()=>startRun(false,'debug_normal'),false);
  drawDebugActionBtn(contentX+halfW+gap,curY,halfW,36,'☯ ZEN','#7bed9f',()=>startRun(true,'debug_zen'),false);
  curY += 44;
  drawDebugActionBtn(contentX,curY,contentW,36,'🧪 TESTE SEM ERRO','#ffd32a',()=>startTestRun('debug_test'),false);
  curY += 52;

  drawDebugSectionTitle(contentX, curY, 'ÁUDIO', '#70a1ff');
  curY += 14;
  const hasSplitMusic=(typeof menuMusicVol !== 'undefined') && (typeof gameMusicVol !== 'undefined');
  if(hasSplitMusic){
    drawVolumeStepper(contentX,curY,contentW,'Música do menu',menuMusicVol,(v)=>{ menuMusicVol=v; musicVol=v; if(typeof refreshMusicGain==='function') refreshMusicGain(0.08); if(typeof saveData==='function') saveData(); }, '#70a1ff');
    curY += 48;
    drawVolumeStepper(contentX,curY,contentW,'Música do jogo',gameMusicVol,(v)=>{ gameMusicVol=v; if(typeof saveData==='function') saveData(); }, '#00f5d4');
    curY += 48;
  } else {
    drawVolumeStepper(contentX,curY,contentW,'Música',musicVol,(v)=>{ musicVol=v; if(typeof refreshMusicGain==='function') refreshMusicGain(0.08); else if(typeof setMusicVolume==='function') setMusicVolume(typeof musicSceneLevel !== 'undefined' ? musicSceneLevel : 0.75); if(typeof saveData==='function') saveData(); }, '#70a1ff');
    curY += 48;
  }
  drawVolumeStepper(contentX,curY,contentW,'Efeitos',sfxVol,(v)=>{ sfxVol=v; if(typeof saveData==='function') saveData(); }, '#c084fc');
  curY += 52;
  const testLabels=[['RELEASE','release','#70a1ff'],['CAPTURA','capture','#00f5d4'],['OURO','gold','#ffd32a'],['FASE','phase','#ff6b9d'],['MORTE','die','#ff4757'],['RECORDE','record','#c084fc']];
  const testW=(contentW-gap*2)/3;
  for(let i=0;i<testLabels.length;i++){
    const row=Math.floor(i/3), col=i%3;
    const x=contentX+col*(testW+gap), y=curY+row*42;
    const [label,key,color]=testLabels[i];
    drawDebugActionBtn(x,y,testW,32,label,color,()=>debugPlaySfx(key),true);
  }
  curY += 92;

  drawDebugSectionTitle(contentX, curY, 'FUNDOS', '#ffd32a');
  curY += 14;
  const bgKeys=Object.keys(BACKGROUNDS||{});
  const bgCols=2;
  const bgGap=10;
  const bgW=(contentW-bgGap)/2;
  const bgH=46;
  for(let i=0;i<bgKeys.length;i++){
    const k=bgKeys[i];
    const bg=BACKGROUNDS[k];
    const row=Math.floor(i/bgCols), col=i%bgCols;
    const x=contentX+col*(bgW+bgGap), y=curY+row*(bgH+bgGap);
    const selected=selectedBg===k;
    X.globalAlpha=0.86;
    X.fillStyle='rgba(0,0,0,0.55)'; roundRect(x,y,bgW,bgH,9); X.fill();
    X.strokeStyle=selected?'#ffd32a':'rgba(255,255,255,0.16)'; X.lineWidth=selected?2:1; roundRect(x,y,bgW,bgH,9); X.stroke();
    X.globalAlpha=1;
    X.fillStyle=selected?'#ffd32a':'#fff';
    X.font='bold 12px -apple-system, system-ui, sans-serif'; X.textAlign='left'; X.textBaseline='middle';
    let name=String(bg.name||k); if(name.length>18) name=name.slice(0,17)+'…';
    X.fillText(name, x+12, y+16);
    X.fillStyle='rgba(255,255,255,0.48)'; X.font='10px -apple-system, system-ui, sans-serif';
    X.fillText(selected?'SELECIONADO':'TOQUE PARA EQUIPAR', x+12, y+31);
    pushDebugArea(x,y,bgW,bgH,()=>debugSelectBackground(k));
  }
  curY += Math.ceil(bgKeys.length/2)*(bgH+bgGap)+6;

  drawDebugSectionTitle(contentX, curY, 'DESBLOQUEIOS / PRESETS', '#ff9f43');
  curY += 14;
  drawDebugActionBtn(contentX,curY,halfW,34,'PRESET INÍCIO','#70a1ff',()=>applyDebugPreset('starter'),false);
  drawDebugActionBtn(contentX+halfW+gap,curY,halfW,34,'PRESET AVANÇADO','#00f5d4',()=>applyDebugPreset('advanced'),false);
  curY += 44;
  drawDebugActionBtn(contentX,curY,halfW,34,'PRESET OBRA-PRIMA','#ffd32a',()=>applyDebugPreset('masterpiece'),false);
  drawDebugActionBtn(contentX+halfW+gap,curY,halfW,34,'LIBERAR TUDO','#ff6b9d',()=>debugUnlockAll(),false);
  curY += 44;
  drawDebugActionBtn(contentX,curY,halfW,34,'SKINS','#c084fc',()=>debugUnlockAllSkins(),false);
  drawDebugActionBtn(contentX+halfW+gap,curY,halfW,34,'FUNDOS','#70a1ff',()=>debugUnlockAllBackgrounds(),false);
  curY += 44;
  drawDebugActionBtn(contentX,curY,contentW,36,'RESETAR PROGRESSO LOCAL','#ff4757',()=>{ if(confirm('Apagar progresso local de teste?')) resetLocalProgress(); },false);
  curY += 50;

  drawDebugSectionTitle(contentX, curY, 'ATALHOS', '#7bed9f');
  curY += 14;
  drawDebugActionBtn(contentX,curY,halfW,34,'ABRIR SKINS','#c084fc',()=>{menuScreen='skins';},false);
  drawDebugActionBtn(contentX+halfW+gap,curY,halfW,34,'ABRIR FUNDOS','#70a1ff',()=>{menuScreen='backgrounds';},false);
  curY += 44;
  drawDebugActionBtn(contentX,curY,halfW,34,'ABRIR STATS','#ffd32a',()=>{menuScreen='stats';},false);
  drawDebugActionBtn(contentX+halfW+gap,curY,halfW,34,'MENU PRINCIPAL','#a0a0c0',()=>{menuScreen='main';},false);
  curY += 56;

  endMenuScrollClip();
  setMenuScrollBounds(contentStartY, curY, viewport);
  drawMenuScrollBar(viewport);
  drawMenuScrollFades(viewport);
}


window.drawOrbitaDebugMenu = drawDebugMenu;
})();
