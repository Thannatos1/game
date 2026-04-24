(function(){
function drawLoginScreenModule(){
  drawTopStatusBadges();
  X.textAlign='center';X.textBaseline='middle';

  // Big title
  X.shadowColor='#b0b0ff';X.shadowBlur=30;
  X.fillStyle='#e0e0ff';
  X.font='bold 54px -apple-system, system-ui, sans-serif';
  X.fillText('ÓRBITA',W/2,H*0.18);
  X.shadowBlur=0;

  X.fillStyle='rgba(255,255,255,0.5)';
  X.font='14px -apple-system, system-ui, sans-serif';
  X.fillText('Salte de órbita em órbita',W/2,H*0.25);

  // Animated preview ball
  const py=H*0.42+Math.sin(menuT*2)*8;
  X.save();
  drawBallAt(W/2,py,1,false,selectedSkin);
  X.restore();

  // Welcome text
  X.fillStyle='#ff6b9d';
  X.font='bold 18px -apple-system, system-ui, sans-serif';
  X.fillText('BEM-VINDO!',W/2,H*0.54);

  X.fillStyle='rgba(255,255,255,0.55)';
  X.font='13px -apple-system, system-ui, sans-serif';
  X.fillText('Faça login para começar a jogar',W/2,H*0.60);

  // Google login button
  const btnW=Math.min(W*0.8,300);
  const btnH=56;
  const btnX=(W-btnW)/2;
  const btnY=H*0.66;

  X.fillStyle='#ffffff';
  roundRect(btnX,btnY,btnW,btnH,12);
  X.fill();
  X.strokeStyle='rgba(0,0,0,0.1)';
  X.lineWidth=1;
  roundRect(btnX,btnY,btnW,btnH,12);
  X.stroke();
  X.shadowColor='rgba(255,255,255,0.3)';
  X.shadowBlur=20;
  roundRect(btnX,btnY,btnW,btnH,12);
  X.stroke();
  X.shadowBlur=0;

  // Google "G" icon
  const iconX=btnX+36, iconY=btnY+btnH/2;
  X.font='bold 28px sans-serif';
  X.textAlign='center';
  X.textBaseline='middle';
  X.fillStyle='#4285F4';
  X.fillText('G',iconX,iconY);

  X.fillStyle='#1a1a2e';
  X.font='bold 18px -apple-system, system-ui, sans-serif';
  X.textAlign='left';
  X.fillText('Entrar com Google',iconX+25,iconY);

  menuBtnAreas.push({
    x:btnX,y:btnY,w:btnW,h:btnH,
    action:()=>{
      signInWithGoogle();
    }
  });

  // Info text
  X.textAlign='center';
  X.fillStyle='rgba(255,255,255,0.4)';
  X.font='11px -apple-system, system-ui, sans-serif';
  X.fillText('Você poderá escolher um apelido único',W/2,H*0.82);
  X.fillText('para competir no ranking global',W/2,H*0.855);

  // Loading indicator
  if(authLoading){
    X.globalAlpha=0.7;
    X.fillStyle='#fff';
    X.font='12px -apple-system, system-ui, sans-serif';
    X.fillText('Verificando sessão...',W/2,H*0.93);
    X.globalAlpha=1;
  }
}
window.drawLoginScreenModule = drawLoginScreenModule;

function drawNicknameScreenModule(){
  X.textAlign='center';X.textBaseline='middle';

  // Title
  X.shadowColor='#00f5d4';X.shadowBlur=20;
  X.fillStyle='#00f5d4';
  X.font='bold 32px -apple-system, system-ui, sans-serif';
  X.fillText('ESCOLHA SEU',W/2,H*0.12);
  X.fillText('APELIDO',W/2,H*0.17);
  X.shadowBlur=0;

  X.fillStyle='rgba(255,255,255,0.5)';
  X.font='12px -apple-system, system-ui, sans-serif';
  X.fillText('Como você aparecerá no ranking',W/2,H*0.23);
  X.font='10px -apple-system, system-ui, sans-serif';
  X.fillText('(3-16 caracteres, único)',W/2,H*0.26);

  // Input box
  const ibW=Math.min(W*0.8,300);
  const ibH=52;
  const ibX=(W-ibW)/2;
  const ibY=H*0.30;

  X.fillStyle='rgba(0,0,0,0.6)';
  roundRect(ibX,ibY,ibW,ibH,12);
  X.fill();
  X.strokeStyle=nicknameError?'#ff6b6b':'#00f5d4';
  X.lineWidth=2;
  X.shadowColor=nicknameError?'#ff6b6b':'#00f5d4';
  X.shadowBlur=12;
  roundRect(ibX,ibY,ibW,ibH,12);
  X.stroke();
  X.shadowBlur=0;

  // Text + cursor
  X.fillStyle='#fff';
  X.font='bold 20px -apple-system, system-ui, sans-serif';
  X.textAlign='center';
  X.textBaseline='middle';
  const showCursor=Math.floor(menuT*2)%2===0;
  const displayText=nicknameBuffer+(showCursor?'|':'');
  X.fillText(displayText||(showCursor?'|':''),W/2,ibY+ibH/2);

  // Error or status message
  if(nicknameError){
    X.fillStyle='#ff6b6b';
    X.font='11px -apple-system, system-ui, sans-serif';
    X.fillText(nicknameError,W/2,ibY+ibH+14);
  } else if(nicknameChecking){
    X.fillStyle='#ffd32a';
    X.font='11px -apple-system, system-ui, sans-serif';
    X.fillText(nicknameStatusText || 'Salvando...',W/2,ibY+ibH+14);
  }

  // Confirm button
  const btnW=Math.min(W*0.7,260);
  const btnH=48;
  const btnX=(W-btnW)/2;
  const btnY=ibY+ibH+36;

  const canConfirm=nicknameBuffer.trim().length>=3 && !nicknameChecking;
  X.globalAlpha=canConfirm?1:0.4;
  const g=X.createLinearGradient(btnX,btnY,btnX,btnY+btnH);
  g.addColorStop(0,canConfirm?'#00f5d4':'rgba(0,0,0,0.4)');
  g.addColorStop(1,'rgba(0,0,0,0.6)');
  X.fillStyle=g;
  roundRect(btnX,btnY,btnW,btnH,12);
  X.fill();
  X.strokeStyle='#00f5d4';
  X.lineWidth=2;
  if(canConfirm){X.shadowColor='#00f5d4';X.shadowBlur=12;}
  roundRect(btnX,btnY,btnW,btnH,12);
  X.stroke();
  X.shadowBlur=0;
  X.fillStyle='#fff';
  X.font='bold 18px -apple-system, system-ui, sans-serif';
  X.textAlign='center';X.textBaseline='middle';
  X.fillText('CONFIRMAR',btnX+btnW/2,btnY+btnH/2);
  X.globalAlpha=1;

  if(canConfirm){
    menuBtnAreas.push({
      x:btnX,y:btnY,w:btnW,h:btnH,
      action:async ()=>{
        const name=nicknameBuffer.trim();
        nicknameChecking=true;
        nicknameStatusText='Salvando...';
        nicknameError='';
        const saved=await saveNickname(name);
        if(saved){
          if(best>=5){
            lastSubmittedScore=best;
            submitScore(best,selectedSkin);
          }
          menuScreen='main';
        }
        nicknameChecking=false;
        nicknameStatusText='';
      }
    });
  }

  // Virtual keyboard
  drawVirtualKeyboard();
}
window.drawNicknameScreenModule = drawNicknameScreenModule;

function drawSettingsMenuModule(){
  drawTopStatusBadges();
  X.textAlign='center';X.textBaseline='middle';

  X.fillStyle='#e0e0ff';X.font='bold 28px -apple-system, system-ui, sans-serif';
  X.shadowColor='#a0a0c0';X.shadowBlur=15;
  X.fillText('⚙ CONFIGURAÇÕES',W/2,H*0.06);
  X.shadowBlur=0;

  drawBackBtn();

  const viewport = beginMenuScrollClip();
  const contentStartY = Math.max(H*0.14, (viewport ? viewport.top + 10 : H*0.14));
  let curY = contentStartY;
  const shellLeft = viewport && typeof viewport.left === 'number' ? viewport.left : 14;
  const shellRight = viewport && typeof viewport.right === 'number' ? viewport.right : (W - 14);
  const shellW = shellRight - shellLeft;
  const contentW = Math.min(shellW - 10, W <= 560 ? 344 : 320);
  const contentX = shellLeft + (shellW - contentW)/2;

  // Conta
  X.fillStyle='#ff6b9d';
  X.font='bold 11px -apple-system, system-ui, sans-serif';
  X.textAlign='left';
  X.fillText('CONTA',contentX,curY);
  curY+=16;

  if(currentUser){
    X.fillStyle='rgba(0,0,0,0.5)';
    roundRect(contentX,curY,contentW,50,8);
    X.fill();
    X.strokeStyle='rgba(255,107,157,0.35)';
    X.lineWidth=1;
    roundRect(contentX,curY,contentW,50,8);
    X.stroke();

    X.fillStyle='rgba(255,255,255,0.5)';
    X.font='10px -apple-system, system-ui, sans-serif';
    X.fillText('Apelido:',contentX+12,curY+14);

    X.fillStyle='#fff';
    X.font='bold 14px -apple-system, system-ui, sans-serif';
    X.fillText(playerName||'(sem apelido)',contentX+12,curY+30);

    if(currentUser.email){
      X.fillStyle='rgba(255,255,255,0.4)';
      X.font='9px -apple-system, system-ui, sans-serif';
      let email = currentUser.email;
      if(email.length>30) email = email.substring(0,28)+'...';
      X.fillText(email,contentX+12,curY+44);
    }
    curY+=60;

    drawSettingsBtn(contentX,curY,contentW,'Trocar apelido','✏','#00f5d4',()=>{
      nicknameBuffer='';
      nicknameError='';
      menuScreen='changeNickname';
    });
    curY+=44;

    drawSettingsBtn(contentX,curY,contentW,'Sair da conta','↩','#ff6b6b',()=>{
      signOut();
    });
    curY+=52;
  } else {
    drawSettingsBtn(contentX,curY,contentW,'Entrar com Google','🌐','#00f5d4',()=>{
      signInWithGoogle();
    });
    curY+=52;
  }

  // Áudio
  X.fillStyle='#70a1ff';
  X.font='bold 11px -apple-system, system-ui, sans-serif';
  X.textAlign='left';
  X.fillText('ÁUDIO',contentX,curY);
  curY+=16;

  const hasSplitMusic = (typeof menuMusicVol !== 'undefined') && (typeof gameMusicVol !== 'undefined');
  if(hasSplitMusic){
    drawVolumeStepper(contentX,curY,contentW,'Música do menu',menuMusicVol,(v)=>{
      menuMusicVol=v;
      musicVol=v;
      if(typeof refreshMusicGain==='function') refreshMusicGain(0.12);
      else setMusicVolume(typeof musicSceneLevel !== 'undefined' ? musicSceneLevel : 0.75);
      saveData();
    }, '#70a1ff');
    curY+=48;

    drawVolumeStepper(contentX,curY,contentW,'Música do jogo',gameMusicVol,(v)=>{
      gameMusicVol=v;
      if(typeof refreshMusicGain==='function') refreshMusicGain(0.12);
      saveData();
    }, '#00f5d4');
    curY+=48;
  } else {
    drawVolumeStepper(contentX,curY,contentW,'Música',musicVol,(v)=>{
      musicVol=v;
      if(typeof refreshMusicGain==='function') refreshMusicGain(0.12);
      else setMusicVolume(typeof musicSceneLevel !== 'undefined' ? musicSceneLevel : 0.75);
      saveData();
    }, '#70a1ff');
    curY+=48;
  }

  drawVolumeStepper(contentX,curY,contentW,'Efeitos',sfxVol,(v)=>{
    sfxVol=v;
    saveData();
    if(actx && sfxVol>0) playTone(600,0.1,'sine',0.15);
  }, '#c084fc');
  curY+=52;

  drawToggle(contentX,curY,contentW,'Silenciar tudo',muted,()=>{
    toggleMute();
  });
  curY+=44;

  drawToggle(contentX,curY,contentW,'Vibração',vibrationOn,()=>{
    vibrationOn = !vibrationOn;
    saveData();
    if(vibrationOn) vibrate(30);
  });
  curY+=52;

  // Status de rede
  X.fillStyle='rgba(0,0,0,0.5)';
  roundRect(contentX,curY,contentW,42,8);
  X.fill();
  X.strokeStyle=(typeof networkOnline !== 'undefined' && networkOnline)?'rgba(123,237,159,0.35)':'rgba(255,107,107,0.35)';
  X.lineWidth=1;
  roundRect(contentX,curY,contentW,42,8);
  X.stroke();
  X.fillStyle=(typeof networkOnline !== 'undefined' && networkOnline)?'#7bed9f':'#ff6b6b';
  X.font='bold 12px -apple-system, system-ui, sans-serif';
  X.fillText((typeof networkOnline !== 'undefined' && networkOnline)?'Online':'Offline',contentX+12,curY+14);
  X.fillStyle='rgba(255,255,255,0.55)';
  X.font='10px -apple-system, system-ui, sans-serif';
  X.fillText((typeof hasPendingScoreSubmission === 'function' && hasPendingScoreSubmission())?'Seu melhor score será enviado quando voltar a internet.':'Ranking e login sincronizam quando houver conexão.',contentX+12,curY+29);
  curY+=52;

  drawSettingsBtn(contentX,curY,contentW,'Menu debug / testes','🧪','#c084fc',()=>{
    menuScreen='debug';
  });
  curY+=44;

  // Instalação
  const standaloneApp = (typeof isStandaloneApp !== 'undefined') ? isStandaloneApp : false;
  const installAvailable = (typeof canInstallApp !== 'undefined') ? canInstallApp : false;
  const iosInstallHelp = (typeof canShowIosInstallHelp !== 'undefined') ? canShowIosInstallHelp : false;
  const installStatusText = (typeof pwaStatusText !== 'undefined' && pwaStatusText) ? pwaStatusText : 'Abra no navegador do celular para instalar';
  const canPromptInstall = typeof promptInstallApp === 'function';
  if(!standaloneApp && canPromptInstall && (installAvailable || iosInstallHelp)){
    drawSettingsBtn(contentX,curY,contentW,installAvailable?'Instalar app':'Como instalar no iPhone','⬇','#7bed9f',()=>{
      promptInstallApp();
    });
    curY+=44;

    X.fillStyle='rgba(255,255,255,0.45)';
    X.font='10px -apple-system, system-ui, sans-serif';
    X.textAlign='left';
    X.fillText(installStatusText,contentX,curY+4);
    curY+=24;
  }

  drawSettingsBtn(contentX,curY,contentW,'Resetar progresso local','↻','#ffa502',()=>{
    if(confirm('Isso vai apagar suas skins, fundos, conquistas e estatísticas locais. Continuar?')){
      resetLocalProgress();
    }
  });
  curY+=44;

  if(currentUser){
    drawSettingsBtn(contentX,curY,contentW,'EXCLUIR CONTA','⚠','#ff4757',()=>{
      menuScreen='confirmDelete';
    });
    curY+=44;
  }

  endMenuScrollClip();
  setMenuScrollBounds(contentStartY, curY + 8, viewport);
  drawMenuScrollBar(viewport);
  drawMenuScrollFades(viewport);
}
window.drawSettingsMenuModule = drawSettingsMenuModule;

function drawInstallHelpScreenModule(){
  X.textAlign='center';X.textBaseline='middle';

  X.fillStyle='#e0e0ff';X.font='bold 26px -apple-system, system-ui, sans-serif';
  X.shadowColor='#7bed9f';X.shadowBlur=15;
  X.fillText('INSTALAR ÓRBITA',W/2,H*0.08);
  X.shadowBlur=0;

  drawBackBtn();

  const cardW=Math.min(W*0.86,340);
  const cardH=Math.min(H*0.62,360);
  const cardX=(W-cardW)/2;
  const cardY=H*0.16;

  X.fillStyle='rgba(0,0,0,0.55)';
  roundRect(cardX,cardY,cardW,cardH,14);
  X.fill();
  X.strokeStyle='#7bed9f';
  X.lineWidth=1.5;
  roundRect(cardX,cardY,cardW,cardH,14);
  X.stroke();

  X.fillStyle='#7bed9f';
  X.font='bold 18px -apple-system, system-ui, sans-serif';
  X.fillText('No iPhone / iPad',W/2,cardY+36);

  X.fillStyle='rgba(255,255,255,0.75)';
  X.font='13px -apple-system, system-ui, sans-serif';
  X.fillText('1. Toque no botão Compartilhar do Safari',W/2,cardY+88);
  X.fillText('2. Escolha “Adicionar à Tela de Início”',W/2,cardY+126);
  X.fillText('3. Confirme para instalar o app',W/2,cardY+164);

  X.fillStyle='rgba(255,255,255,0.45)';
  X.font='11px -apple-system, system-ui, sans-serif';
  X.fillText('Depois disso o jogo abre como app, sem barra do navegador.',W/2,cardY+214);

  drawActionBtn(cardX+20,cardY+cardH-72,cardW-40,44,'VOLTAR','#7bed9f',false,()=>{
    menuScreen='settings';
  });
}
window.drawInstallHelpScreenModule = drawInstallHelpScreenModule;

function drawChangeNicknameScreenModule(){
  X.textAlign='center';X.textBaseline='middle';

  X.shadowColor='#00f5d4';X.shadowBlur=20;
  X.fillStyle='#00f5d4';
  X.font='bold 28px -apple-system, system-ui, sans-serif';
  X.fillText('TROCAR APELIDO',W/2,H*0.08);
  X.shadowBlur=0;

  drawBackBtn();

  X.fillStyle='rgba(255,255,255,0.5)';
  X.font='12px -apple-system, system-ui, sans-serif';
  X.fillText('Atual: '+playerName,W/2,H*0.17);
  X.font='10px -apple-system, system-ui, sans-serif';
  X.fillText('(3-16 caracteres, único)',W/2,H*0.21);

  // Input box
  const ibW=Math.min(W*0.8,300);
  const ibH=50;
  const ibX=(W-ibW)/2;
  const ibY=H*0.26;

  X.fillStyle='rgba(0,0,0,0.6)';
  roundRect(ibX,ibY,ibW,ibH,12);
  X.fill();
  X.strokeStyle=nicknameError?'#ff6b6b':'#00f5d4';
  X.lineWidth=2;
  X.shadowColor=nicknameError?'#ff6b6b':'#00f5d4';
  X.shadowBlur=12;
  roundRect(ibX,ibY,ibW,ibH,12);
  X.stroke();
  X.shadowBlur=0;

  X.fillStyle='#fff';
  X.font='bold 20px -apple-system, system-ui, sans-serif';
  X.textAlign='center';
  X.textBaseline='middle';
  const showCursor=Math.floor(menuT*2)%2===0;
  const displayText=nicknameBuffer+(showCursor?'|':'');
  X.fillText(displayText||(showCursor?'|':''),W/2,ibY+ibH/2);

  if(nicknameError){
    X.fillStyle='#ff6b6b';
    X.font='11px -apple-system, system-ui, sans-serif';
    X.fillText(nicknameError,W/2,ibY+ibH+14);
  } else if(nicknameChecking){
    X.fillStyle='#ffd32a';
    X.font='11px -apple-system, system-ui, sans-serif';
    X.fillText(nicknameStatusText || 'Salvando...',W/2,ibY+ibH+14);
  }

  // Confirm button
  const btnW=Math.min(W*0.7,260);
  const btnH=46;
  const btnX=(W-btnW)/2;
  const btnY=ibY+ibH+32;

  const canConfirm=nicknameBuffer.trim().length>=3 && nicknameBuffer.trim()!==playerName && !nicknameChecking;
  X.globalAlpha=canConfirm?1:0.4;
  const g=X.createLinearGradient(btnX,btnY,btnX,btnY+btnH);
  g.addColorStop(0,canConfirm?'#00f5d4':'rgba(0,0,0,0.4)');
  g.addColorStop(1,'rgba(0,0,0,0.6)');
  X.fillStyle=g;
  roundRect(btnX,btnY,btnW,btnH,12);
  X.fill();
  X.strokeStyle='#00f5d4';
  X.lineWidth=2;
  if(canConfirm){X.shadowColor='#00f5d4';X.shadowBlur=12;}
  roundRect(btnX,btnY,btnW,btnH,12);
  X.stroke();
  X.shadowBlur=0;
  X.fillStyle='#fff';
  X.font='bold 16px -apple-system, system-ui, sans-serif';
  X.textAlign='center';X.textBaseline='middle';
  X.fillText('SALVAR',btnX+btnW/2,btnY+btnH/2);
  X.globalAlpha=1;

  if(canConfirm){
    menuBtnAreas.push({
      x:btnX,y:btnY,w:btnW,h:btnH,
      action:async ()=>{
        const name=nicknameBuffer.trim();
        nicknameChecking=true;
        nicknameStatusText='Salvando...';
        nicknameError='';
        const result=await changeNickname(name);
        if(result.ok){
          menuScreen='settings';
        } else {
          nicknameError=result.error;
        }
        nicknameChecking=false;
        nicknameStatusText='';
      }
    });
  }

  // Virtual keyboard
  drawVirtualKeyboard();
}
window.drawChangeNicknameScreenModule = drawChangeNicknameScreenModule;

function drawConfirmDeleteScreenModule(){
  X.textAlign='center';X.textBaseline='middle';

  // Dim background
  X.globalAlpha=0.5;
  X.fillStyle='#000';
  X.fillRect(-10,-10,W+20,H+20);
  X.globalAlpha=1;

  // Card
  const cardW=Math.min(W*0.85,340);
  const cardH=328;
  const cardX=(W-cardW)/2;
  const cardY=(H-cardH)/2;

  X.fillStyle='rgba(15,10,25,0.95)';
  roundRect(cardX,cardY,cardW,cardH,16);
  X.fill();
  X.strokeStyle='#ff4757';
  X.lineWidth=2;
  X.shadowColor='#ff4757';
  X.shadowBlur=20;
  roundRect(cardX,cardY,cardW,cardH,16);
  X.stroke();
  X.shadowBlur=0;

  // Warning icon
  X.fillStyle='#ff4757';
  X.font='48px sans-serif';
  X.fillText('⚠',W/2,cardY+55);

  // Title
  X.fillStyle='#ff4757';
  X.font='bold 22px -apple-system, system-ui, sans-serif';
  X.fillText('EXCLUIR CONTA?',W/2,cardY+100);

  // Description
  X.fillStyle='rgba(255,255,255,0.75)';
  X.font='12px -apple-system, system-ui, sans-serif';
  X.fillText('Essa ação vai apagar:',W/2,cardY+130);
  X.fillStyle='rgba(255,255,255,0.6)';
  X.font='11px -apple-system, system-ui, sans-serif';
  X.fillText('• Seu apelido do ranking',W/2,cardY+150);
  X.fillText('• Sua pontuação global',W/2,cardY+166);
  X.fillText('• Seu progresso local',W/2,cardY+182);
  X.fillStyle='rgba(255,255,255,0.85)';
  X.font='bold 12px -apple-system, system-ui, sans-serif';
  X.fillText('Apelido atual: ' + (playerName || '(sem apelido)'),W/2,cardY+204);
  X.fillStyle='#ff6b6b';
  X.font='bold 11px -apple-system, system-ui, sans-serif';
  X.fillText('Essa ação NÃO pode ser desfeita!',W/2,cardY+224);

  // Buttons
  const btnW=(cardW-48)/2;
  const btnH=42;
  const btnsY=cardY+cardH-62;

  // Cancel button
  const cx1=cardX+16;
  X.fillStyle='rgba(0,0,0,0.5)';
  roundRect(cx1,btnsY,btnW,btnH,10);
  X.fill();
  X.strokeStyle='#888';
  X.lineWidth=1.5;
  roundRect(cx1,btnsY,btnW,btnH,10);
  X.stroke();
  X.fillStyle='#aaa';
  X.font='bold 14px -apple-system, system-ui, sans-serif';
  X.fillText('CANCELAR',cx1+btnW/2,btnsY+btnH/2);
  menuBtnAreas.push({
    x:cx1,y:btnsY,w:btnW,h:btnH,
    action:()=>{menuScreen='settings';}
  });

  // Delete button
  const cx2=cardX+32+btnW;
  X.fillStyle='#ff4757';
  roundRect(cx2,btnsY,btnW,btnH,10);
  X.fill();
  X.strokeStyle='#ff4757';
  X.lineWidth=2;
  X.shadowColor='#ff4757';
  X.shadowBlur=10;
  roundRect(cx2,btnsY,btnW,btnH,10);
  X.stroke();
  X.shadowBlur=0;
  X.fillStyle='#fff';
  X.font='bold 13px -apple-system, system-ui, sans-serif';
  X.fillText('EXCLUIR',cx2+btnW/2,btnsY+btnH/2);
  menuBtnAreas.push({
    x:cx2,y:btnsY,w:btnW,h:btnH,
    action:async ()=>{
      await deleteAccount();
    }
  });
}
window.drawConfirmDeleteScreenModule = drawConfirmDeleteScreenModule;

})();
