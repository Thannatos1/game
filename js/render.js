// ============ DRAW ============
function drawBackground(){
  const bg=BACKGROUNDS[selectedBg]||BACKGROUNDS.space;
  const t=menuT;

  if(bg.type==='stars'){
    // Default space - just dark
    const bgc=getBgColors();
    const grad=X.createLinearGradient(0,0,0,H);
    grad.addColorStop(0,bgc.top);grad.addColorStop(0.5,bgc.mid);grad.addColorStop(1,bgc.bot);
    X.fillStyle=grad;X.fillRect(-10,-10,W+20,H+20);
  }
  else if(bg.type==='nebula'){
    // Nebula - colorful clouds
    X.fillStyle='#0a0518';X.fillRect(-10,-10,W+20,H+20);
    // Nebula clouds
    const clouds=[
      {x:W*0.3,y:H*0.3,r:W*0.5,c1:'rgba(150,50,200,0.3)',c2:'rgba(150,50,200,0)'},
      {x:W*0.7,y:H*0.6,r:W*0.45,c1:'rgba(50,100,200,0.25)',c2:'rgba(50,100,200,0)'},
      {x:W*0.5,y:H*0.5,r:W*0.4,c1:'rgba(200,50,100,0.2)',c2:'rgba(200,50,100,0)'},
    ];
    for(const c of clouds){
      const g=X.createRadialGradient(c.x+Math.sin(t*0.3)*30,c.y+Math.cos(t*0.2)*20,0,c.x,c.y,c.r);
      g.addColorStop(0,c.c1);g.addColorStop(1,c.c2);
      X.fillStyle=g;X.fillRect(-10,-10,W+20,H+20);
    }
  }
  else if(bg.type==='galaxy'){
    // Galaxy with spiral
    X.fillStyle='#040418';X.fillRect(-10,-10,W+20,H+20);
    const cx=W/2,cy=H/2;
    // Spiral arms
    for(let i=0;i<3;i++){
      const armAngle=t*0.05+i*Math.PI*2/3;
      for(let j=0;j<60;j++){
        const dist=j*8;
        const angle=armAngle+j*0.15;
        const x=cx+Math.cos(angle)*dist;
        const y=cy+Math.sin(angle)*dist*0.6;
        X.globalAlpha=0.3-j*0.004;
        X.fillStyle=j<20?'#fff080':(j<40?'#ff80c0':'#a080ff');
        X.beginPath();X.arc(x,y,3-j*0.03,0,Math.PI*2);X.fill();
      }
    }
    // Core glow
    const cg=X.createRadialGradient(cx,cy,0,cx,cy,80);
    cg.addColorStop(0,'rgba(255,240,180,0.6)');
    cg.addColorStop(1,'rgba(255,240,180,0)');
    X.fillStyle=cg;X.fillRect(-10,-10,W+20,H+20);
    X.globalAlpha=1;
  }
  else if(bg.type==='blackhole'){
    // Black hole with accretion disk
    X.fillStyle='#000005';X.fillRect(-10,-10,W+20,H+20);
    const cx=W/2,cy=H/2;
    // Accretion disk
    for(let i=0;i<40;i++){
      const a=t*0.5+i*0.157;
      const r1=80+i*3;
      X.globalAlpha=0.4-i*0.008;
      const hue=20+i*5;
      X.fillStyle=`hsl(${hue},90%,60%)`;
      X.beginPath();
      X.ellipse(cx+Math.cos(a)*r1,cy+Math.sin(a)*r1*0.3,2,2,0,0,Math.PI*2);
      X.fill();
    }
    X.globalAlpha=1;
    // Event horizon
    X.fillStyle='#000';
    X.shadowColor='#ff8000';X.shadowBlur=40;
    X.beginPath();X.arc(cx,cy,50,0,Math.PI*2);X.fill();
    X.shadowBlur=0;
    // Light ring
    X.strokeStyle='rgba(255,180,80,0.6)';X.lineWidth=3;
    X.beginPath();X.arc(cx,cy,55,0,Math.PI*2);X.stroke();
  }
  else if(bg.type==='redgiant'){
    // Red giant star
    X.fillStyle='#1a0008';X.fillRect(-10,-10,W+20,H+20);
    const cx=W*0.7,cy=H*0.3;
    // Atmosphere
    const ag=X.createRadialGradient(cx,cy,0,cx,cy,W*0.6);
    ag.addColorStop(0,'rgba(255,80,40,0.5)');
    ag.addColorStop(0.3,'rgba(200,40,20,0.3)');
    ag.addColorStop(1,'rgba(100,0,0,0)');
    X.fillStyle=ag;X.fillRect(-10,-10,W+20,H+20);
    // Star core
    X.shadowColor='#ff4000';X.shadowBlur=60;
    const sg=X.createRadialGradient(cx,cy,0,cx,cy,120);
    sg.addColorStop(0,'#ffff80');
    sg.addColorStop(0.4,'#ff8000');
    sg.addColorStop(1,'#cc2200');
    X.fillStyle=sg;
    X.beginPath();X.arc(cx,cy,120+Math.sin(t)*5,0,Math.PI*2);X.fill();
    X.shadowBlur=0;
    // Solar flares
    for(let i=0;i<6;i++){
      const fa=t*0.5+i*Math.PI/3;
      X.fillStyle='rgba(255,150,50,0.4)';
      X.beginPath();
      X.moveTo(cx+Math.cos(fa)*120,cy+Math.sin(fa)*120);
      X.lineTo(cx+Math.cos(fa)*(150+Math.sin(t*2+i)*15),cy+Math.sin(fa)*(150+Math.sin(t*2+i)*15));
      X.lineTo(cx+Math.cos(fa+0.1)*120,cy+Math.sin(fa+0.1)*120);
      X.closePath();X.fill();
    }
  }
  else if(bg.type==='cosmic'){
    // Cosmic - everything
    X.fillStyle='#02020a';X.fillRect(-10,-10,W+20,H+20);
    // Nebula
    const ng=X.createRadialGradient(W*0.3,H*0.4,0,W*0.3,H*0.4,W*0.6);
    ng.addColorStop(0,'rgba(100,50,200,0.4)');
    ng.addColorStop(1,'rgba(100,50,200,0)');
    X.fillStyle=ng;X.fillRect(-10,-10,W+20,H+20);
    const ng2=X.createRadialGradient(W*0.7,H*0.6,0,W*0.7,H*0.6,W*0.5);
    ng2.addColorStop(0,'rgba(0,150,200,0.3)');
    ng2.addColorStop(1,'rgba(0,150,200,0)');
    X.fillStyle=ng2;X.fillRect(-10,-10,W+20,H+20);
    // Distant galaxy
    const cx=W*0.2,cy=H*0.7;
    for(let i=0;i<25;i++){
      const a=t*0.05+i*0.25;
      const d=i*4;
      X.globalAlpha=0.4-i*0.012;
      X.fillStyle=i<10?'#fff':'#80a0ff';
      X.beginPath();X.arc(cx+Math.cos(a)*d,cy+Math.sin(a)*d*0.6,2,0,Math.PI*2);X.fill();
    }
    X.globalAlpha=1;
    // Bright stars
    for(let i=0;i<8;i++){
      const sx=(i*97)%W;
      const sy=(i*131)%H;
      const tw=0.5+0.5*Math.sin(t*2+i);
      X.globalAlpha=tw;
      X.fillStyle='#fff';
      X.beginPath();X.arc(sx,sy,2,0,Math.PI*2);X.fill();
      // Cross flare
      X.strokeStyle='rgba(255,255,255,0.5)';
      X.lineWidth=1;
      X.beginPath();
      X.moveTo(sx-6,sy);X.lineTo(sx+6,sy);
      X.moveTo(sx,sy-6);X.lineTo(sx,sy+6);
      X.stroke();
    }
    X.globalAlpha=1;
  }
}

function draw(){
  X.save();
  if(shakeT>0)X.translate((Math.random()-0.5)*shakeA,(Math.random()-0.5)*shakeA);

  // Draw background variant
  drawBackground();

  // Camera zoom (with gold zoom boost)
  let z=cam.zoom;
  if(goldZoomT>0){
    z += Math.sin(goldZoomT*Math.PI) * 0.15;
  }
  if(z!==1){
    X.translate(W/2,H/2);X.scale(z,z);X.translate(-W/2,-H/2);
  }

  // Stars / speed lines
  const isFlying=!ball.orbiting&&state===ST.PLAY;
  const speedRatio=clamp(ball.speed/500,0,1);

  for(const s of stars){
    const sx=s.x-cam.x,sy=s.y-cam.y;
    if(sx<-30||sx>W+30||sy<-30||sy>H+30)continue;
    const tw=s.alpha*(0.6+0.4*Math.sin(menuT*s.twinkle+s.phase));
    X.globalAlpha=tw;

    if(isFlying&&speedRatio>0.3){
      // Speed lines
      const lineLen=s.size*3*speedRatio*8;
      const angle=Math.atan2(ball.vy,ball.vx);
      X.strokeStyle=speedRatio>0.6?'#8080ff':'#d4c5ff';
      X.lineWidth=s.size*0.8;
      X.beginPath();
      X.moveTo(sx,sy);
      X.lineTo(sx-Math.cos(angle)*lineLen,sy-Math.sin(angle)*lineLen);
      X.stroke();
    } else {
      X.fillStyle='#d4c5ff';
      X.beginPath();X.arc(sx,sy,s.size,0,Math.PI*2);X.fill();
    }
  }
  X.globalAlpha=1;

  // Ring particles
  for(const r of ringParticles){
    X.globalAlpha=r.life*0.5;X.strokeStyle=r.color;X.lineWidth=2;
    X.beginPath();X.arc(r.x-cam.x,r.y-cam.y,r.r,0,Math.PI*2);X.stroke();
  }
  X.globalAlpha=1;

  // Only render game world when playing, paused or dead
  if(state!==ST.MENU){

  // Connection lines
  for(let i=0;i<nodes.length;i++){
    const n=nodes[i];
    if(n.captured||n.branchGroup<0)continue;
    // Find parent (last captured node before this branch group)
    let parent=null;
    for(let j=i-1;j>=0;j--){
      if(nodes[j].captured){parent=nodes[j];break;}
    }
    if(!parent)continue;
    const ax=parent.x-cam.x,ay=parent.y-cam.y;
    const bx=n.x-cam.x,by=n.y-cam.y;
    if(!n.visible){X.globalAlpha=0.03;}else{X.globalAlpha=0.1;}

    const tc=TIERS[n.tier]||TIERS.medium;
    X.strokeStyle=tc.color.main;
    X.lineWidth=1;X.setLineDash([4,8]);
    X.beginPath();X.moveTo(ax,ay);X.lineTo(bx,by);X.stroke();
    X.setLineDash([]);
  }
  X.globalAlpha=1;

  // Asteroids
  for(const a of asteroids){
    const ax=a.x-cam.x,ay=a.y-cam.y;
    if(ax<-60||ax>W+60||ay<-60||ay>H+60)continue;
    drawAsteroid(a,ax,ay);
  }

  // Nodes
  for(let i=0;i<nodes.length;i++){
    const n=nodes[i];
    const nx=n.x-cam.x,ny=n.y-cam.y;
    if(nx<-100||nx>W+100||ny<-100||ny>H+100)continue;
    if(!n.visible&&!n.captured){
      // Ghost
      X.globalAlpha=0.08+Math.sin(n.pulse*3)*0.04;
      const tc=TIERS[n.tier]||TIERS.medium;
      X.strokeStyle=tc.color.main;X.lineWidth=1;X.setLineDash([2,4]);
      X.beginPath();X.arc(nx,ny,n.nodeR+2,0,Math.PI*2);X.stroke();
      X.setLineDash([]);X.globalAlpha=1;
      continue;
    }
    drawNode(n,nx,ny,i);
  }

  // Trajectory prediction line - shows where ball will fly if released now
  if(state===ST.PLAY&&ball.orbiting&&shouldShowAssistGuides()){
    const tang=ball.angle+(ball.orbitDir*Math.PI/2);
    const bx=ball.x-cam.x,by=ball.y-cam.y;
    const dx=Math.cos(tang),dy=Math.sin(tang);

    // Find which node the trajectory points toward (best match)
    let bestNode=null,bestScore=Infinity;
    for(const n of nodes){
      if(n.captured||!n.visible)continue;
      const ndx=n.x-ball.x,ndy=n.y-ball.y;
      const d=Math.sqrt(ndx*ndx+ndy*ndy);
      if(d<20)continue;
      // How aligned is the trajectory with this node?
      const dot=(dx*ndx+dy*ndy)/d;
      if(dot>0.7){ // forward-ish
        // Perpendicular distance from node to trajectory line
        const perpDist=Math.abs(dx*ndy-dy*ndx);
        if(perpDist<bestScore && d<700){
          bestScore=perpDist;
          bestNode=n;
        }
      }
    }

    // Draw the line
    const tc=bestNode?(TIERS[bestNode.tier]||TIERS.medium):TIERS.medium;
    const lineColor=bestNode?tc.color.main:'#ffffff';
    const lineLen=bestNode?dist(ball.x,ball.y,bestNode.x,bestNode.y):300;

    X.save();
    X.globalAlpha=0.35+Math.sin(menuT*4)*0.1;
    X.strokeStyle=lineColor;
    X.lineWidth=2;
    X.lineCap='round';
    X.setLineDash([6,8]);
    X.lineDashOffset=-menuT*30;
    X.shadowColor=lineColor;
    X.shadowBlur=8;
    X.beginPath();
    X.moveTo(bx+dx*BALL_R,by+dy*BALL_R);
    X.lineTo(bx+dx*lineLen,by+dy*lineLen);
    X.stroke();
    X.setLineDash([]);
    X.shadowBlur=0;

    // Highlight target node
    if(bestNode){
      const nx=bestNode.x-cam.x,ny=bestNode.y-cam.y;
      X.globalAlpha=0.4+Math.sin(menuT*5)*0.2;
      X.strokeStyle=lineColor;
      X.lineWidth=2.5;
      X.shadowColor=lineColor;
      X.shadowBlur=12;
      X.beginPath();
      X.arc(nx,ny,bestNode.captureR+4,0,Math.PI*2);
      X.stroke();
      X.shadowBlur=0;
    }
    X.restore();
    X.globalAlpha=1;
  }

  // Direction arrow hint (toward nearest uncaptured node)
  if(state===ST.PLAY&&ball.orbiting&&shouldShowAssistGuides()){
    let closest=null,closestD=Infinity;
    for(const n of nodes){
      if(n.captured||!n.visible)continue;
      const d=dist(ball.x,ball.y,n.x,n.y);
      if(d<closestD){closestD=d;closest=n;}
    }
    // Draw small arrows toward each available node
    for(const n of nodes){
      if(n.captured||!n.visible)continue;
      const nx=n.x-cam.x,ny=n.y-cam.y;
      const bx=ball.x-cam.x,by=ball.y-cam.y;
      const ang=Math.atan2(ny-by,nx-bx);
      const arrowDist=45;
      const ax2=bx+Math.cos(ang)*arrowDist;
      const ay2=by+Math.sin(ang)*arrowDist;
      const tc=TIERS[n.tier]||TIERS.medium;
      X.globalAlpha=0.2+Math.sin(menuT*3)*0.1;
      X.strokeStyle=tc.color.main;X.lineWidth=1.5;X.lineCap='round';
      const aLen=6;
      X.beginPath();
      X.moveTo(ax2-Math.cos(ang-0.5)*aLen,ay2-Math.sin(ang-0.5)*aLen);
      X.lineTo(ax2,ay2);
      X.lineTo(ax2-Math.cos(ang+0.5)*aLen,ay2-Math.sin(ang+0.5)*aLen);
      X.stroke();
    }
    X.globalAlpha=1;
  }

  // Power-ups in world
  for(const p of powerups){
    drawPowerup(p);
  }

  // Ball trail with skin-specific effects
  drawBallTrail();
  X.globalAlpha=1;

  // Ball
  if(state!==ST.DEAD||deathT<0.08)drawBall();

  // Shield effect around ball
  if(activeShield&&state===ST.PLAY){
    const bx=ball.x-cam.x,by=ball.y-cam.y;
    X.globalAlpha=0.4+Math.sin(menuT*5)*0.2;
    X.strokeStyle='#00ffff';
    X.lineWidth=2;
    X.shadowColor='#00ffff';
    X.shadowBlur=15;
    X.beginPath();
    X.arc(bx,by,BALL_R+8+Math.sin(menuT*4)*2,0,Math.PI*2);
    X.stroke();
    // Inner ring
    X.globalAlpha=0.2;
    X.beginPath();
    X.arc(bx,by,BALL_R+4,0,Math.PI*2);
    X.stroke();
    X.shadowBlur=0;
    X.globalAlpha=1;
  }

  // Slow-mo overlay tint
  if(slowMoTimer>0&&state===ST.PLAY){
    X.globalAlpha=0.1;
    X.fillStyle='#c084fc';
    X.fillRect(-10,-10,W+20,H+20);
    X.globalAlpha=1;
  }

  // Magnet aura around ball
  if(magnetTimer>0&&state===ST.PLAY){
    const bx=ball.x-cam.x,by=ball.y-cam.y;
    X.globalAlpha=0.2+Math.sin(menuT*6)*0.1;
    X.strokeStyle='#ffd32a';
    X.lineWidth=1.5;
    X.setLineDash([4,4]);
    X.beginPath();
    X.arc(bx,by,30+Math.sin(menuT*3)*5,0,Math.PI*2);
    X.stroke();
    X.beginPath();
    X.arc(bx,by,45+Math.sin(menuT*3+1)*5,0,Math.PI*2);
    X.stroke();
    X.setLineDash([]);
    X.globalAlpha=1;
  }

  // Particles
  for(const p of particles){
    X.globalAlpha=Math.max(0,p.life);X.fillStyle=p.color;
    X.beginPath();X.arc(p.x-cam.x,p.y-cam.y,p.size*Math.max(0.2,p.life),0,Math.PI*2);X.fill();
  }
  X.globalAlpha=1;

  // Score popups
  for(const p of scorePopups){
    X.globalAlpha=Math.min(p.life*2,1);
    X.fillStyle=p.color;
    X.font='bold 22px -apple-system, system-ui, sans-serif';
    X.textAlign='center';X.textBaseline='middle';
    X.fillText(p.text,p.x-cam.x,p.y-cam.y);
  }
  X.globalAlpha=1;

  } // end !MENU

  // Flash
  if(flashA>0){X.globalAlpha=flashA;X.fillStyle='#fff';X.fillRect(-10,-10,W+20,H+20);X.globalAlpha=1;}

  // Gold flash overlay
  if(goldFlashT>0){
    X.globalAlpha=goldFlashT*0.4;
    const gg=X.createRadialGradient(W/2,H/2,0,W/2,H/2,W);
    gg.addColorStop(0,'rgba(255,211,42,0.8)');
    gg.addColorStop(0.5,'rgba(255,170,0,0.3)');
    gg.addColorStop(1,'rgba(255,170,0,0)');
    X.fillStyle=gg;
    X.fillRect(-10,-10,W+20,H+20);
    X.globalAlpha=1;
  }

  // Reset zoom for UI
  if(z!==1){
    X.translate(W/2,H/2);X.scale(1/z,1/z);X.translate(-W/2,-H/2);
  }

  if(state===ST.PLAY){drawPlayUI();drawPauseBtn();drawMuteBtn();}
  else if(state===ST.MENU){drawMenuUI();drawMuteBtn();}
  else if(state===ST.DEAD){drawDeadUI();drawMuteBtn();}
  else if(state===ST.PAUSE){drawPlayUI();drawPauseScreen();drawMuteBtn();}

  X.restore();
}

function drawAsteroid(a,ax,ay){
  X.save();X.translate(ax,ay);X.rotate(a.rot);
  const g=X.createRadialGradient(-2,-2,0,0,0,a.r);
  g.addColorStop(0,'#5a5a6e');g.addColorStop(1,'#2a2a3e');
  X.fillStyle=g;
  X.beginPath();
  a.vertices.forEach((v,i)=>{
    const px=Math.cos(v.a)*a.r*v.r,py=Math.sin(v.a)*a.r*v.r;
    i===0?X.moveTo(px,py):X.lineTo(px,py);
  });
  X.closePath();X.fill();
  X.strokeStyle='rgba(150,150,180,0.3)';X.lineWidth=1;X.stroke();
  X.fillStyle='rgba(0,0,0,0.2)';
  X.beginPath();X.arc(a.r*0.2,-a.r*0.15,a.r*0.2,0,Math.PI*2);X.fill();
  X.restore();
}

function drawNode(n,nx,ny,idx){
  const tc=TIERS[n.tier]||TIERS.medium;
  const col=tc.color;
  const isActive=idx===ball.currentNode&&ball.orbiting;
  const isNext=!n.captured;
  const ps=Math.sin(n.pulse)*2;

  let nodeAlpha=1;
  if(n.disappearing&&!n.captured&&n.visible&&n.disappearTimer<0.8){
    nodeAlpha=0.4+Math.sin(menuT*15)*0.4;
  }

  // Teleport ring effect
  if(n.teleporting&&!n.captured){
    if(n.teleportFlash>0){
      X.globalAlpha=n.teleportFlash*0.6;
      X.strokeStyle='#ff00ff';
      X.lineWidth=2;
      X.shadowColor='#ff00ff';
      X.shadowBlur=10;
      X.beginPath();
      X.arc(nx,ny,(1-n.teleportFlash)*40+10,0,Math.PI*2);
      X.stroke();
      X.shadowBlur=0;
    }
    // Warning ring before teleport
    if(n.teleportTimer<0.6){
      X.globalAlpha=0.3+Math.sin(menuT*20)*0.3;
      X.strokeStyle='#ff00ff';
      X.lineWidth=1.5;
      X.setLineDash([3,3]);
      X.beginPath();
      X.arc(nx,ny,n.nodeR+8,0,Math.PI*2);
      X.stroke();
      X.setLineDash([]);
    }
  }

  // Capture zone
  if(isNext){
    X.globalAlpha=(0.04+Math.sin(n.pulse)*0.02)*nodeAlpha;
    X.fillStyle=col.main;
    X.beginPath();X.arc(nx,ny,n.captureR,0,Math.PI*2);X.fill();
    X.globalAlpha=0.1*nodeAlpha;
    X.strokeStyle=col.main;X.lineWidth=1;X.setLineDash([3,5]);
    X.beginPath();X.arc(nx,ny,n.captureR,0,Math.PI*2);X.stroke();
    X.setLineDash([]);
  }

  // Moving path
  if(n.moving&&!n.captured){
    X.globalAlpha=0.06;X.strokeStyle=col.main;X.lineWidth=1;X.setLineDash([2,4]);
    X.beginPath();X.arc(n.baseX-cam.x,n.baseY-cam.y,n.mRadius,0,Math.PI*2);X.stroke();
    X.setLineDash([]);
  }

  // Orbit ring
  if(isActive){
    X.globalAlpha=0.2;X.strokeStyle='#ffffff';X.lineWidth=1;X.setLineDash([3,6]);
    X.beginPath();X.arc(nx,ny,ball.orbitRadius,0,Math.PI*2);X.stroke();
    X.setLineDash([]);
  }

  // Body
  X.globalAlpha=nodeAlpha;
  const r=n.nodeR+ps;
  X.shadowColor=col.glow;X.shadowBlur=isActive?20:(isNext?12:5);
  const ng=X.createRadialGradient(nx-2,ny-2,0,nx,ny,r);
  ng.addColorStop(0,col.light);ng.addColorStop(0.6,col.main);ng.addColorStop(1,col.glow);
  X.fillStyle=n.captured&&!isActive?'rgba(60,60,80,0.3)':ng;
  X.beginPath();X.arc(nx,ny,r,0,Math.PI*2);X.fill();
  X.shadowBlur=0;

  // Shine
  if(!n.captured||isActive){
    const sg=X.createRadialGradient(nx-3,ny-3,0,nx,ny,r);
    sg.addColorStop(0,'rgba(255,255,255,0.4)');sg.addColorStop(1,'rgba(255,255,255,0)');
    X.fillStyle=sg;X.beginPath();X.arc(nx,ny,r,0,Math.PI*2);X.fill();
  }

  // Points label
  if(isNext&&n.label){
    X.globalAlpha=0.8*nodeAlpha;
    X.fillStyle='#ffffff';
    X.font='bold 11px -apple-system, system-ui, sans-serif';
    X.textAlign='center';X.textBaseline='middle';
    X.fillText(n.label,nx,ny);
  }

  X.globalAlpha=1;
}

function drawBallTrail(){
  const skin=SKINS[selectedSkin]||SKINS.default;
  const trailType=skin.trail;

  // Special trails
  if(trailType==='fire'){
    // Phoenix fire trail
    for(let i=0;i<ball.trail.length;i++){
      const t=ball.trail[i];
      if(t.a<=0)continue;
      const tx=t.x-cam.x,ty=t.y-cam.y;
      const prog=i/ball.trail.length;
      X.globalAlpha=t.a*0.6;
      X.shadowColor='#ff4500';X.shadowBlur=8;
      const fg=X.createRadialGradient(tx,ty,0,tx,ty,BALL_R*t.a*0.8);
      fg.addColorStop(0,'#ffff80');
      fg.addColorStop(0.4,'#ff8000');
      fg.addColorStop(1,'rgba(255,0,0,0)');
      X.fillStyle=fg;
      X.beginPath();X.arc(tx,ty,BALL_R*t.a*0.8,0,Math.PI*2);X.fill();
      X.shadowBlur=0;
    }
  }
  else if(trailType==='ice'){
    // Ice crystals trail
    for(let i=0;i<ball.trail.length;i++){
      const t=ball.trail[i];
      if(t.a<=0)continue;
      const tx=t.x-cam.x,ty=t.y-cam.y;
      X.globalAlpha=t.a*0.5;
      X.shadowColor='#00ffff';X.shadowBlur=6;
      X.fillStyle='#80ffff';
      // Crystal shape
      const sz=BALL_R*t.a*0.5;
      X.save();
      X.translate(tx,ty);
      X.rotate(i*0.3);
      X.beginPath();
      X.moveTo(0,-sz);X.lineTo(sz*0.6,0);X.lineTo(0,sz);X.lineTo(-sz*0.6,0);
      X.closePath();
      X.fill();
      X.restore();
      X.shadowBlur=0;
    }
  }
  else if(trailType==='gold'){
    // Golden sparkles
    for(let i=0;i<ball.trail.length;i++){
      const t=ball.trail[i];
      if(t.a<=0)continue;
      const tx=t.x-cam.x,ty=t.y-cam.y;
      X.globalAlpha=t.a*0.6;
      X.shadowColor='#ffd700';X.shadowBlur=10;
      X.fillStyle='#ffd700';
      X.beginPath();X.arc(tx,ty,BALL_R*t.a*0.5,0,Math.PI*2);X.fill();
      // Sparkle cross
      if(i%2===0){
        X.strokeStyle='rgba(255,255,200,0.8)';
        X.lineWidth=1;
        const sz=BALL_R*t.a*0.8;
        X.beginPath();
        X.moveTo(tx-sz,ty);X.lineTo(tx+sz,ty);
        X.moveTo(tx,ty-sz);X.lineTo(tx,ty+sz);
        X.stroke();
      }
      X.shadowBlur=0;
    }
  }
  else if(trailType==='metal'){
    // Metallic gleaming trail
    for(let i=0;i<ball.trail.length;i++){
      const t=ball.trail[i];
      if(t.a<=0)continue;
      const tx=t.x-cam.x,ty=t.y-cam.y;
      X.globalAlpha=t.a*0.4;
      const mg=X.createRadialGradient(tx,ty,0,tx,ty,BALL_R*t.a*0.6);
      mg.addColorStop(0,'#ffffff');
      mg.addColorStop(0.5,'#ccccdd');
      mg.addColorStop(1,'rgba(120,120,160,0)');
      X.fillStyle=mg;
      X.beginPath();X.arc(tx,ty,BALL_R*t.a*0.6,0,Math.PI*2);X.fill();
    }
  }
  else if(trailType==='ghost'){
    // Ghostly purple trail
    for(let i=0;i<ball.trail.length;i++){
      const t=ball.trail[i];
      if(t.a<=0)continue;
      const tx=t.x-cam.x,ty=t.y-cam.y;
      const wobble=Math.sin(menuT*5+i*0.5)*3;
      X.globalAlpha=t.a*0.5;
      X.shadowColor='#7a00ff';X.shadowBlur=15;
      const gg=X.createRadialGradient(tx+wobble,ty,0,tx+wobble,ty,BALL_R*t.a*0.9);
      gg.addColorStop(0,'rgba(200,100,255,0.8)');
      gg.addColorStop(1,'rgba(122,0,255,0)');
      X.fillStyle=gg;
      X.beginPath();X.arc(tx+wobble,ty,BALL_R*t.a*0.9,0,Math.PI*2);X.fill();
      X.shadowBlur=0;
    }
  }
  else if(trailType==='hellfire'){
    // Demon hellfire - red/black
    for(let i=0;i<ball.trail.length;i++){
      const t=ball.trail[i];
      if(t.a<=0)continue;
      const tx=t.x-cam.x,ty=t.y-cam.y;
      X.globalAlpha=t.a*0.7;
      X.shadowColor='#ff0000';X.shadowBlur=12;
      const hg=X.createRadialGradient(tx,ty,0,tx,ty,BALL_R*t.a*0.8);
      hg.addColorStop(0,'#ff4400');
      hg.addColorStop(0.5,'#8b0000');
      hg.addColorStop(1,'rgba(0,0,0,0)');
      X.fillStyle=hg;
      X.beginPath();X.arc(tx,ty,BALL_R*t.a*0.8,0,Math.PI*2);X.fill();
      X.shadowBlur=0;
    }
  }
  else if(trailType==='stars'){
    // Cosmic star trail
    for(let i=0;i<ball.trail.length;i++){
      const t=ball.trail[i];
      if(t.a<=0)continue;
      const tx=t.x-cam.x,ty=t.y-cam.y;
      X.globalAlpha=t.a*0.6;
      const colors=['#ffffff','#a0a0ff','#ff80ff','#80ffff'];
      X.fillStyle=colors[i%colors.length];
      X.shadowColor=colors[i%colors.length];
      X.shadowBlur=8;
      X.beginPath();X.arc(tx,ty,BALL_R*t.a*0.4,0,Math.PI*2);X.fill();
      // Small star points
      if(i%3===0){
        const sz=BALL_R*t.a*0.7;
        X.strokeStyle=colors[i%colors.length];
        X.lineWidth=0.8;
        X.beginPath();
        X.moveTo(tx-sz,ty);X.lineTo(tx+sz,ty);
        X.moveTo(tx,ty-sz);X.lineTo(tx,ty+sz);
        X.stroke();
      }
      X.shadowBlur=0;
    }
  }
  else {
    // Default colored trail based on skin color
    const trailColor=skin.trail||skin.color||'#ffffff';
    for(const t of ball.trail){
      if(t.a<=0)continue;
      const tx=t.x-cam.x,ty=t.y-cam.y;
      X.globalAlpha=t.a*0.35;
      X.fillStyle=trailColor;
      X.beginPath();X.arc(tx,ty,BALL_R*t.a*0.5,0,Math.PI*2);X.fill();
    }
  }
}

function drawPowerup(p){
  const px=p.x-cam.x, py=p.y-cam.y+p.bobY;
  const scale=p.life<2?p.life/2:1;

  X.save();
  X.translate(px,py);
  X.scale(scale,scale);

  let color1,color2,glow,icon;
  if(p.type==='shield'){
    color1='#80ffff';color2='#00aaff';glow='#00ffff';icon='shield';
  } else if(p.type==='slowmo'){
    color1='#e0a0ff';color2='#7000c0';glow='#c084fc';icon='clock';
  } else {
    color1='#ffe066';color2='#ff8000';glow='#ffd32a';icon='magnet';
  }

  // Outer glow ring
  X.shadowColor=glow;
  X.shadowBlur=18;
  X.globalAlpha=0.5+Math.sin(p.pulse)*0.3;
  X.strokeStyle=glow;
  X.lineWidth=2;
  X.beginPath();
  X.arc(0,0,18+Math.sin(p.pulse)*2,0,Math.PI*2);
  X.stroke();

  // Inner background circle
  X.globalAlpha=1;
  const bg=X.createRadialGradient(-3,-4,0,0,0,16);
  bg.addColorStop(0,color1);
  bg.addColorStop(1,color2);
  X.fillStyle=bg;
  X.beginPath();
  X.arc(0,0,15,0,Math.PI*2);
  X.fill();
  X.shadowBlur=0;

  // Icon
  X.fillStyle='#ffffff';
  X.strokeStyle='#ffffff';
  X.lineWidth=2;
  X.lineCap='round';
  X.lineJoin='round';

  if(icon==='shield'){
    // Shield shape
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
    // Clock circle
    X.beginPath();
    X.arc(0,0,7,0,Math.PI*2);
    X.stroke();
    // Hands
    X.beginPath();
    X.moveTo(0,0);X.lineTo(0,-5);
    X.moveTo(0,0);X.lineTo(4,2);
    X.stroke();
  } else if(icon==='magnet'){
    // U-shaped magnet
    X.lineWidth=3;
    X.beginPath();
    X.arc(0,0,6,Math.PI,0,false);
    X.stroke();
    X.beginPath();
    X.moveTo(-6,0);X.lineTo(-6,5);
    X.moveTo(6,0);X.lineTo(6,5);
    X.stroke();
    // Red tips
    X.fillStyle='#ff4444';
    X.fillRect(-8,4,4,3);
    X.fillRect(4,4,4,3);
  }

  // Fade out near end
  if(p.life<3){
    X.globalAlpha=Math.max(0,p.life/3);
  }

  X.restore();
  X.globalAlpha=1;
}

function drawBall(){
  const bx=ball.x-cam.x,by=ball.y-cam.y;
  drawBallAt(bx,by,ball.squash,!ball.orbiting,selectedSkin);
}

function drawBallAt(bx,by,squash,isFlying,skinKey){
  const skin=SKINS[skinKey]||SKINS.default;
  X.save();X.translate(bx,by);
  const sc=squash||1;
  X.scale(2-sc,sc);
  const r=BALL_R;
  const glowP=0.5+Math.sin(ball.glow)*0.3;
  const sr=clamp(ball.speed/500,0,1);

  const glowColor=skin.glow||skin.color;
  X.shadowColor=sr>0.5?'#6688ff':glowColor;
  X.shadowBlur=12+glowP*6+(skin.rarity==='stellar'?8:skin.rarity==='legendary'?5:0);

  // Body
  const bg=X.createRadialGradient(-2,-2,0,0,0,r);
  bg.addColorStop(0,'#ffffff');
  bg.addColorStop(0.4,skin.color);
  bg.addColorStop(1,skin.color2);
  X.fillStyle=bg;X.beginPath();X.arc(0,0,r,0,Math.PI*2);X.fill();
  X.shadowBlur=0;

  // Eyes
  X.fillStyle='#1a1a2e';
  if(isFlying){
    X.beginPath();X.ellipse(-3.5,-1,2.5,3,0,0,Math.PI*2);X.fill();
    X.beginPath();X.ellipse(3.5,-1,2.5,3,0,0,Math.PI*2);X.fill();
  } else {
    X.beginPath();X.arc(-3.5,-1,2,0,Math.PI*2);X.fill();
    X.beginPath();X.arc(3.5,-1,2,0,Math.PI*2);X.fill();
  }
  X.fillStyle='rgba(255,255,255,0.9)';
  X.beginPath();X.arc(-4,-2.5,1,0,Math.PI*2);X.fill();
  X.beginPath();X.arc(3,-2.5,1,0,Math.PI*2);X.fill();
  if(isFlying){
    X.fillStyle='#1a1a2e';X.beginPath();X.ellipse(0,3.5,2.5,2,0,0,Math.PI*2);X.fill();
  } else {
    X.strokeStyle='#1a1a2e';X.lineWidth=1;X.lineCap='round';
    X.beginPath();X.arc(0,2,2.5,0.3,Math.PI-0.3);X.stroke();
  }

  // Accessories
  if(skin.accessory)drawAccessory(skin.accessory,skin,r);

  X.restore();
}

function drawAccessory(type,skin,r){
  X.save();
  switch(type){
    case 'tophat':
      X.fillStyle='#1a1a1a';
      X.fillRect(-7,-15,14,3);
      X.fillRect(-5,-23,10,8);
      X.fillStyle='#ff0000';
      X.fillRect(-5,-17,10,1.5);
      break;

    case 'glasses':
      X.strokeStyle='#1a1a2e';X.lineWidth=1.5;
      X.beginPath();X.arc(-3.5,-1,3.5,0,Math.PI*2);X.stroke();
      X.beginPath();X.arc(3.5,-1,3.5,0,Math.PI*2);X.stroke();
      X.beginPath();X.moveTo(0,-1);X.lineTo(0,-1);X.stroke();
      X.fillStyle='rgba(100,200,255,0.3)';
      X.beginPath();X.arc(-3.5,-1,3,0,Math.PI*2);X.fill();
      X.beginPath();X.arc(3.5,-1,3,0,Math.PI*2);X.fill();
      break;

    case 'cap':
      X.fillStyle='#ff4757';
      X.beginPath();X.arc(0,-3,9,Math.PI,0);X.fill();
      X.fillRect(2,-4,12,2);
      X.fillStyle='#fff';
      X.font='bold 6px sans-serif';
      X.textAlign='center';
      X.fillText('O',0,-7);
      break;

    case 'crown':
      X.fillStyle='#ffd700';
      X.beginPath();
      X.moveTo(-8,-8);
      X.lineTo(-8,-13);
      X.lineTo(-5,-10);
      X.lineTo(-2,-15);
      X.lineTo(0,-10);
      X.lineTo(2,-15);
      X.lineTo(5,-10);
      X.lineTo(8,-13);
      X.lineTo(8,-8);
      X.closePath();
      X.fill();
      X.fillStyle='#ff0000';
      X.beginPath();X.arc(0,-10,1.5,0,Math.PI*2);X.fill();
      break;

    case 'flames':
      // Phoenix flames around head
      const ft=menuT*8;
      X.fillStyle='#ff4500';
      X.shadowColor='#ff8c00';X.shadowBlur=10;
      for(let i=0;i<5;i++){
        const a=-Math.PI/2+(i-2)*0.4;
        const len=8+Math.sin(ft+i)*3;
        X.beginPath();
        X.moveTo(Math.cos(a-0.15)*r,Math.sin(a-0.15)*r);
        X.quadraticCurveTo(Math.cos(a)*(r+len*0.5),Math.sin(a)*(r+len*0.5),
                           Math.cos(a)*(r+len),Math.sin(a)*(r+len));
        X.quadraticCurveTo(Math.cos(a)*(r+len*0.5),Math.sin(a)*(r+len*0.5),
                           Math.cos(a+0.15)*r,Math.sin(a+0.15)*r);
        X.closePath();
        X.fill();
      }
      X.fillStyle='#ffd700';
      for(let i=0;i<3;i++){
        const a=-Math.PI/2+(i-1)*0.4;
        const len=4+Math.sin(ft+i)*2;
        X.beginPath();
        X.arc(Math.cos(a)*(r+len*0.5),Math.sin(a)*(r+len*0.5),2,0,Math.PI*2);
        X.fill();
      }
      X.shadowBlur=0;
      break;

    case 'iceShards':
      X.fillStyle='#80ffff';
      X.shadowColor='#00ffff';X.shadowBlur=8;
      for(let i=0;i<6;i++){
        const a=(i/6)*Math.PI*2;
        const x1=Math.cos(a)*r;
        const y1=Math.sin(a)*r;
        X.beginPath();
        X.moveTo(x1-2,y1);
        X.lineTo(Math.cos(a)*(r+6),Math.sin(a)*(r+6));
        X.lineTo(x1+2,y1);
        X.closePath();
        X.fill();
      }
      X.shadowBlur=0;
      break;

    case 'royalCrown':
      X.fillStyle='#ffd700';
      X.shadowColor='#fff080';X.shadowBlur=6;
      X.beginPath();
      X.moveTo(-10,-8);
      X.lineTo(-10,-15);
      X.lineTo(-6,-11);
      X.lineTo(-3,-18);
      X.lineTo(0,-12);
      X.lineTo(3,-18);
      X.lineTo(6,-11);
      X.lineTo(10,-15);
      X.lineTo(10,-8);
      X.closePath();
      X.fill();
      // Gems
      X.fillStyle='#ff0066';
      X.beginPath();X.arc(-3,-15,1.5,0,Math.PI*2);X.fill();
      X.beginPath();X.arc(3,-15,1.5,0,Math.PI*2);X.fill();
      X.fillStyle='#00ff88';
      X.beginPath();X.arc(0,-13,1.5,0,Math.PI*2);X.fill();
      X.shadowBlur=0;
      break;

    case 'helmet':
      // Medieval knight helmet
      X.fillStyle='#a0a0c0';
      X.shadowColor='#fff';X.shadowBlur=4;
      X.beginPath();
      X.arc(0,-4,r+2,Math.PI,Math.PI*2);
      X.lineTo(r+2,3);
      X.lineTo(-r-2,3);
      X.closePath();
      X.fill();
      // Visor slit
      X.fillStyle='#000';
      X.fillRect(-7,-3,14,2);
      // Top crest
      X.fillStyle='#ff0000';
      X.beginPath();
      X.moveTo(-2,-r-4);
      X.lineTo(0,-r-10);
      X.lineTo(2,-r-4);
      X.closePath();
      X.fill();
      X.shadowBlur=0;
      break;

    case 'skull':
      // Skull mask
      X.fillStyle='#f0f0f0';
      X.shadowColor='#7a00ff';X.shadowBlur=10;
      X.beginPath();
      X.arc(0,-2,r-1,0,Math.PI*2);
      X.fill();
      X.shadowBlur=0;
      // Eye sockets glowing
      X.fillStyle='#7a00ff';
      X.shadowColor='#7a00ff';X.shadowBlur=8;
      X.beginPath();X.arc(-3.5,-2,2.5,0,Math.PI*2);X.fill();
      X.beginPath();X.arc(3.5,-2,2.5,0,Math.PI*2);X.fill();
      X.shadowBlur=0;
      // Nose
      X.fillStyle='#000';
      X.beginPath();
      X.moveTo(0,1);X.lineTo(-1,3);X.lineTo(1,3);X.closePath();
      X.fill();
      // Teeth
      X.fillStyle='#000';
      X.fillRect(-4,4,8,1);
      for(let i=-3;i<=3;i+=2){
        X.fillRect(i,4,1,2);
      }
      break;

    case 'horns':
      // Demon horns
      X.fillStyle='#1a0000';
      X.shadowColor='#ff0000';X.shadowBlur=8;
      X.beginPath();
      X.moveTo(-6,-6);
      X.quadraticCurveTo(-12,-12,-9,-16);
      X.quadraticCurveTo(-7,-14,-4,-7);
      X.closePath();
      X.fill();
      X.beginPath();
      X.moveTo(6,-6);
      X.quadraticCurveTo(12,-12,9,-16);
      X.quadraticCurveTo(7,-14,4,-7);
      X.closePath();
      X.fill();
      X.shadowBlur=0;
      // Glow eyes red
      X.fillStyle='#ff0000';
      X.shadowColor='#ff0000';X.shadowBlur=6;
      X.beginPath();X.arc(-3.5,-1,1.5,0,Math.PI*2);X.fill();
      X.beginPath();X.arc(3.5,-1,1.5,0,Math.PI*2);X.fill();
      X.shadowBlur=0;
      break;

    case 'galaxy':
      // Galaxy swirl around ball
      const gt=menuT*1.5;
      X.shadowColor='#a0a0ff';X.shadowBlur=10;
      for(let i=0;i<12;i++){
        const a=gt+(i/12)*Math.PI*2;
        const dist=r+3+Math.sin(gt*2+i)*2;
        X.fillStyle=i%3===0?'#ffffff':(i%3===1?'#a0a0ff':'#ff80ff');
        X.beginPath();
        X.arc(Math.cos(a)*dist,Math.sin(a)*dist,1.5,0,Math.PI*2);
        X.fill();
      }
      // Inner ring
      X.strokeStyle='rgba(160,160,255,0.4)';
      X.lineWidth=1;
      X.beginPath();
      X.ellipse(0,0,r+5,r+2,gt*0.5,0,Math.PI*2);
      X.stroke();
      X.shadowBlur=0;
      break;
  }
  X.restore();
}

function getRarityColor(rarity){
  switch(rarity){
    case 'common':return '#a0a0a0';
    case 'rare':return '#4d9eff';
    case 'legendary':return '#c084fc';
    case 'stellar':return '#ffd700';
  }
  return '#fff';
}

function getRarityName(rarity){
  switch(rarity){
    case 'common':return 'COMUM';
    case 'rare':return 'RARO';
    case 'legendary':return 'LENDÁRIO';
    case 'stellar':return 'ESTELAR';
  }
  return '';
}

function getMedal(s){
  if(s>=200)return{name:'DIAMANTE',color:'#b9f6ff',glow:'#00d4ff',icon:'◆'};
  if(s>=100)return{name:'OURO',color:'#ffd32a',glow:'#ffaa00',icon:'★'};
  if(s>=50)return{name:'PRATA',color:'#e0e0e8',glow:'#a0a0b0',icon:'★'};
  if(s>=20)return{name:'BRONZE',color:'#cd7f32',glow:'#8b4513',icon:'★'};
  return null;
}

function drawMedal(x,y,medal,scale){
  if(!medal)return;
  scale=scale||1;
  X.save();
  X.translate(x,y);
  X.scale(scale,scale);

  // Glow background
  X.shadowColor=medal.glow;
  X.shadowBlur=20;

  // Outer ring
  const grad=X.createRadialGradient(0,-3,0,0,0,28);
  grad.addColorStop(0,medal.color);
  grad.addColorStop(0.7,medal.color);
  grad.addColorStop(1,medal.glow);
  X.fillStyle=grad;
  X.beginPath();
  X.arc(0,0,28,0,Math.PI*2);
  X.fill();
  X.shadowBlur=0;

  // Inner shine
  const sh=X.createRadialGradient(-6,-8,0,0,0,28);
  sh.addColorStop(0,'rgba(255,255,255,0.6)');
  sh.addColorStop(0.5,'rgba(255,255,255,0.1)');
  sh.addColorStop(1,'rgba(255,255,255,0)');
  X.fillStyle=sh;
  X.beginPath();
  X.arc(0,0,28,0,Math.PI*2);
  X.fill();

  // Border
  X.strokeStyle='rgba(0,0,0,0.3)';
  X.lineWidth=2;
  X.beginPath();
  X.arc(0,0,28,0,Math.PI*2);
  X.stroke();

  // Icon
  X.fillStyle='rgba(0,0,0,0.5)';
  X.font='bold 28px -apple-system, system-ui, sans-serif';
  X.textAlign='center';
  X.textBaseline='middle';
  X.fillText(medal.icon,0,2);

  X.restore();
}

function drawMuteBtn(){
  const s=MUTE_BTN.size, m=MUTE_BTN.margin;
  const bx=W-m-PAUSE_BTN.size-8-s, by=m;

  // Background circle
  X.globalAlpha=0.3;
  X.fillStyle='#000';
  X.beginPath();X.arc(bx+s/2,by+s/2,s/2,0,Math.PI*2);X.fill();
  X.globalAlpha=0.4;
  X.strokeStyle='#ffffff';
  X.lineWidth=1.5;
  X.beginPath();X.arc(bx+s/2,by+s/2,s/2,0,Math.PI*2);X.stroke();

  // Speaker icon
  X.globalAlpha=0.85;
  X.fillStyle='#ffffff';
  X.strokeStyle='#ffffff';
  X.lineWidth=2;
  X.lineCap='round';
  const cx=bx+s/2, cy=by+s/2;

  // Speaker body
  X.beginPath();
  X.moveTo(cx-7,cy-3);
  X.lineTo(cx-2,cy-3);
  X.lineTo(cx+3,cy-7);
  X.lineTo(cx+3,cy+7);
  X.lineTo(cx-2,cy+3);
  X.lineTo(cx-7,cy+3);
  X.closePath();
  X.fill();

  if(muted){
    // X mark
    X.strokeStyle='#ff6b6b';
    X.beginPath();
    X.moveTo(cx+6,cy-5);
    X.lineTo(cx+12,cy+5);
    X.moveTo(cx+12,cy-5);
    X.lineTo(cx+6,cy+5);
    X.stroke();
  } else {
    // Sound waves
    X.beginPath();
    X.arc(cx+3,cy,5,-Math.PI/4,Math.PI/4);
    X.stroke();
    X.beginPath();
    X.arc(cx+3,cy,9,-Math.PI/4,Math.PI/4);
    X.stroke();
  }
  X.globalAlpha=1;
}

function drawPauseBtn(){
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

function drawPauseScreen(){
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
    setMusicVolume(0.12);
  });

  drawActionBtn(btnX,H*0.58+btnH+12,btnW,btnH,'MENU PRINCIPAL','#ff6b9d',false,()=>{
    zenMode=false;
    state=ST.MENU;
    menuScreen='main';
    setMusicVolume(0.08);
  });
}

function drawActionBtn(x,y,w,h,label,color,highlight,action){
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

function drawPlayUI(){
  X.textAlign='center';X.textBaseline='top';

  // Score
  X.fillStyle='rgba(0,0,0,0.25)';
  X.font='bold 50px -apple-system, system-ui, sans-serif';
  X.fillText(score,W/2+2,32);
  X.fillStyle='#ffffff';X.fillText(score,W/2,30);

  // Phase
  const phase=getPhase();
  if(zenMode){
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

function drawPuTimer(x,y,icon,color,progress){
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

function drawTutorial(){
  const pulse=0.5+Math.sin(menuT*3)*0.5;

  if(tutorialStep===1){
    // Step 1: Tap to release
    // Big arrow pointing at ball
    const bx=ball.x-cam.x, by=ball.y-cam.y;

    // Pulsing circle around ball
    X.globalAlpha=0.3+Math.sin(menuT*4)*0.2;
    X.strokeStyle='#ffd32a';
    X.lineWidth=3;
    X.beginPath();
    X.arc(bx,by,30+Math.sin(menuT*4)*5,0,Math.PI*2);
    X.stroke();
    X.globalAlpha=1;

    // Big text at top
    X.globalAlpha=0.95;
    X.fillStyle='rgba(0,0,0,0.6)';
    X.fillRect(0,H*0.15,W,80);
    X.fillStyle='#ffd32a';
    X.font='bold 22px -apple-system, system-ui, sans-serif';
    X.textAlign='center';X.textBaseline='middle';
    X.fillText('A bolinha está orbitando',W/2,H*0.18);
    X.fillStyle='#ffffff';
    X.font='bold 26px -apple-system, system-ui, sans-serif';
    X.fillText('TOQUE A TELA PARA SOLTAR',W/2,H*0.215);
    X.globalAlpha=1;

    // Bottom hint with finger icon
    const fingerY=H*0.78+Math.sin(menuT*3)*8;
    X.globalAlpha=pulse;
    X.font='40px -apple-system, system-ui, sans-serif';
    X.fillText('👆',W/2,fingerY);
    X.globalAlpha=1;
  }
  else if(tutorialStep===2){
    // Step 2: Ball is flying, will be captured automatically
    X.globalAlpha=0.9;
    X.fillStyle='rgba(0,0,0,0.6)';
    X.fillRect(0,H*0.15,W,60);
    X.fillStyle='#00f5d4';
    X.font='bold 22px -apple-system, system-ui, sans-serif';
    X.textAlign='center';X.textBaseline='middle';
    X.fillText('Ela vai pousar no próximo nó!',W/2,H*0.195);
    X.globalAlpha=1;
  }
  else if(tutorialStep===3){
    // Step 3: Explain branches and timing
    X.globalAlpha=0.9;
    X.fillStyle='rgba(0,0,0,0.65)';
    X.fillRect(0,H*0.13,W,100);
    X.fillStyle='#ffd32a';
    X.font='bold 20px -apple-system, system-ui, sans-serif';
    X.textAlign='center';X.textBaseline='middle';
    X.fillText('Escolha qual nó pegar!',W/2,H*0.16);
    X.fillStyle='#ffffff';
    X.font='14px -apple-system, system-ui, sans-serif';
    X.fillText('Solte no momento certo para mirar',W/2,H*0.19);
    X.fillStyle='#d4c5ff';
    X.font='12px -apple-system, system-ui, sans-serif';
    X.fillText('🟢 +1 fácil   🔵 +2 médio   🔴 +3 difícil',W/2,H*0.215);
    X.globalAlpha=1;
  }
  else if(tutorialStep===4){
    // Step 4: Combo tip
    X.globalAlpha=0.9;
    X.fillStyle='rgba(0,0,0,0.6)';
    X.fillRect(0,H*0.13,W,80);
    X.fillStyle='#00f5d4';
    X.font='bold 20px -apple-system, system-ui, sans-serif';
    X.textAlign='center';X.textBaseline='middle';
    X.fillText('Capture rápido para fazer COMBO!',W/2,H*0.16);
    X.fillStyle='#ffffff';
    X.font='13px -apple-system, system-ui, sans-serif';
    X.fillText('Combos multiplicam seus pontos',W/2,H*0.195);
    X.globalAlpha=1;
  }
}

function drawMenuUI(){
  menuBtnAreas = [];
  if(menuScreen==='loading')drawLoadingScreen();
  else if(menuScreen==='main')drawMainMenu();
  else if(menuScreen==='skins')drawSkinsMenu();
  else if(menuScreen==='backgrounds')drawBackgroundsMenu();
  else if(menuScreen==='stats')drawStatsMenu();
  else if(menuScreen==='ranking')drawRankingMenu();
  else if(menuScreen==='login')drawLoginScreen();
  else if(menuScreen==='nickname')drawNicknameScreen();
  else if(menuScreen==='settings')drawSettingsMenu();
  else if(menuScreen==='changeNickname')drawChangeNicknameScreen();
  else if(menuScreen==='confirmDelete')drawConfirmDeleteScreen();
}

function drawMainMenu(){
  X.textAlign='center';X.textBaseline='middle';

  // Title
  X.shadowColor='#b0b0ff';X.shadowBlur=30;
  X.fillStyle='#e0e0ff';X.font='bold 56px -apple-system, system-ui, sans-serif';
  X.fillText('ÓRBITA',W/2,H*0.18);X.shadowBlur=0;

  X.fillStyle='rgba(255,255,255,0.45)';X.font='13px -apple-system, system-ui, sans-serif';
  X.fillText('Salte de órbita em órbita',W/2,H*0.18+38);

  // Preview ball with current skin
  const py=H*0.36+Math.sin(menuT*2)*8;
  X.save();
  drawBallAt(W/2,py,1,false,selectedSkin);
  X.restore();

  // Skin name
  const skin=SKINS[selectedSkin];
  X.fillStyle=getRarityColor(skin.rarity);
  X.font='bold 12px -apple-system, system-ui, sans-serif';
  X.fillText(skin.name.toUpperCase(),W/2,H*0.36+30);

  // Buttons
  const btnW=Math.min(W*0.7,260);
  const isFirstSession = totalGames===0 && best===0;
  const metaUnlocked = totalGames>=3 || best>=10;
  const btnH=isFirstSession?46:(zenUnlocked?34:38);
  const btnX=(W-btnW)/2;
  let btnY=isFirstSession?H*0.44:(zenUnlocked?H*0.37:H*0.40);

  // PLAY button (highlighted)
  drawMenuButton(btnX,btnY,btnW,btnH,'JOGAR','#00f5d4',true,()=>{
    startRun(false,'menu_play');
  });

  if(isFirstSession){
    X.fillStyle='rgba(255,255,255,0.55)';
    X.font='13px -apple-system, system-ui, sans-serif';
    X.textAlign='center';
    X.fillText('Primeira partida: toque em JOGAR e entre no ritmo.',W/2,btnY+btnH+22);
    X.fillStyle='rgba(255,255,255,0.35)';
    X.font='11px -apple-system, system-ui, sans-serif';
    X.fillText('Skins, ranking e estatísticas aparecem depois da 1ª partida.',W/2,btnY+btnH+40);

    drawMenuButton(btnX,H*0.74,btnW,34,'⚙ CONFIGURAÇÕES','#a0a0c0',false,()=>{
      menuScreen='settings';
    });

    return;
  }

  btnY+=btnH+8;

  if(!metaUnlocked){
    X.fillStyle='rgba(255,255,255,0.45)';
    X.font='12px -apple-system, system-ui, sans-serif';
    X.textAlign='center';
    X.fillText('Continue jogando para abrir ranking, skins e fundos.',W/2,btnY+8);
    X.fillStyle='rgba(255,255,255,0.3)';
    X.font='10px -apple-system, system-ui, sans-serif';
    X.fillText('Libera com 3 partidas ou recorde 10.',W/2,btnY+24);

    btnY+=36;
    drawMenuButton(btnX,btnY,btnW,btnH,'ESTATÍSTICAS','#ffd32a',false,()=>{
      menuScreen='stats';
    });

    btnY+=btnH+8;
    drawMenuButton(btnX,btnY,btnW,btnH,'⚙ CONFIGURAÇÕES','#a0a0c0',false,()=>{
      menuScreen='settings';
    });

    if(best>0){
      X.fillStyle='rgba(255,255,255,0.4)';
      X.font='14px -apple-system, system-ui, sans-serif';
      X.textAlign='center';X.textBaseline='middle';
      X.fillText('RECORDE: '+best,W/2,H*0.92);
    }
    return;
  }

  drawMenuButton(btnX,btnY,btnW,btnH,'🌍 RANKING GLOBAL','#ff6b9d',false,()=>{
    if(needsNickname){
      menuScreen='nickname';
      nicknameBuffer='';
      nicknameError='';
    } else {
      menuScreen='ranking';
      loadRankings();
    }
  });

  btnY+=btnH+8;
  drawMenuButton(btnX,btnY,btnW,btnH,'SKINS','#c084fc',false,()=>{
    menuScreen='skins';
  });

  btnY+=btnH+8;
  drawMenuButton(btnX,btnY,btnW,btnH,'FUNDOS','#70a1ff',false,()=>{
    menuScreen='backgrounds';
  });

  btnY+=btnH+8;
  drawMenuButton(btnX,btnY,btnW,btnH,'ESTATÍSTICAS','#ffd32a',false,()=>{
    menuScreen='stats';
  });

  btnY+=btnH+8;
  drawMenuButton(btnX,btnY,btnW,btnH,'⚙ CONFIGURAÇÕES','#a0a0c0',false,()=>{
    menuScreen='settings';
  });

  // ZEN MODE button (kept secondary even when unlocked)
  if(zenUnlocked){
    btnY+=btnH+8;
    drawMenuButton(btnX,btnY,btnW,btnH,'☯ MODO ZEN','#7bed9f',false,()=>{
      startRun(true,'menu_zen');
    });
  }

  // Best score
  if(best>0){
    X.fillStyle='rgba(255,255,255,0.4)';
    X.font='14px -apple-system, system-ui, sans-serif';
    X.textAlign='center';X.textBaseline='middle';
    X.fillText('RECORDE: '+best,W/2,H*0.92);
  }
}

function drawMenuButton(x,y,w,h,label,color,highlight,action){
  const isHl=highlight;
  // Background
  X.globalAlpha=isHl?0.9:0.7;
  const g=X.createLinearGradient(x,y,x,y+h);
  if(isHl){
    g.addColorStop(0,color);
    g.addColorStop(1,'rgba(0,0,0,0.4)');
  } else {
    g.addColorStop(0,'rgba(0,0,0,0.5)');
    g.addColorStop(1,'rgba(0,0,0,0.7)');
  }
  X.fillStyle=g;
  roundRect(x,y,w,h,12);
  X.fill();

  // Border
  X.strokeStyle=color;
  X.lineWidth=isHl?2.5:1.5;
  X.shadowColor=color;
  X.shadowBlur=isHl?15:5;
  roundRect(x,y,w,h,12);
  X.stroke();
  X.shadowBlur=0;

  // Text
  X.globalAlpha=1;
  X.fillStyle=isHl?'#fff':color;
  X.font='bold 22px -apple-system, system-ui, sans-serif';
  X.textAlign='center';
  X.textBaseline='middle';
  X.fillText(label,x+w/2,y+h/2);

  menuBtnAreas.push({x,y,w,h,action});
}

function roundRect(x,y,w,h,r){
  X.beginPath();
  X.moveTo(x+r,y);
  X.lineTo(x+w-r,y);
  X.quadraticCurveTo(x+w,y,x+w,y+r);
  X.lineTo(x+w,y+h-r);
  X.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  X.lineTo(x+r,y+h);
  X.quadraticCurveTo(x,y+h,x,y+h-r);
  X.lineTo(x,y+r);
  X.quadraticCurveTo(x,y,x+r,y);
  X.closePath();
}

function drawSkinsMenu(){
  X.textAlign='center';X.textBaseline='middle';

  // Title
  X.fillStyle='#e0e0ff';X.font='bold 30px -apple-system, system-ui, sans-serif';
  X.shadowColor='#b0b0ff';X.shadowBlur=15;
  X.fillText('SKINS',W/2,H*0.06);
  X.shadowBlur=0;

  // Counter
  X.fillStyle='rgba(255,255,255,0.5)';
  X.font='12px -apple-system, system-ui, sans-serif';
  const totalSkins=Object.keys(SKINS).length;
  X.fillText(unlockedSkins.length+' / '+totalSkins+' DESBLOQUEADAS',W/2,H*0.06+22);

  // Back button
  drawBackBtn();

  // Group skins by rarity
  const rarities=['common','rare','legendary','stellar'];
  const skinsByRarity={common:[],rare:[],legendary:[],stellar:[]};
  for(const k in SKINS){
    skinsByRarity[SKINS[k].rarity].push(k);
  }

  // Grid
  const itemSize=70;
  const gap=12;
  const cols=Math.floor((W-40)/(itemSize+gap));
  let curY=H*0.13;

  for(const rarity of rarities){
    const skins=skinsByRarity[rarity];
    if(skins.length===0)continue;

    // Rarity header
    X.fillStyle=getRarityColor(rarity);
    X.font='bold 13px -apple-system, system-ui, sans-serif';
    X.textAlign='left';
    X.shadowColor=getRarityColor(rarity);
    X.shadowBlur=8;
    X.fillText(getRarityName(rarity),20,curY);
    X.shadowBlur=0;
    curY+=22;

    // Items
    let col=0;
    const startX=(W-(cols*(itemSize+gap)-gap))/2;
    for(const skinKey of skins){
      const skin=SKINS[skinKey];
      const ix=startX+col*(itemSize+gap);
      const iy=curY;
      const isUnlocked=unlockedSkins.includes(skinKey);
      const isSelected=selectedSkin===skinKey;

      // Background
      X.globalAlpha=isUnlocked?0.6:0.3;
      X.fillStyle='#000';
      roundRect(ix,iy,itemSize,itemSize,10);
      X.fill();

      // Border
      X.globalAlpha=1;
      X.strokeStyle=isSelected?'#ffd32a':getRarityColor(rarity);
      X.lineWidth=isSelected?3:1.5;
      if(isSelected){
        X.shadowColor='#ffd32a';X.shadowBlur=12;
      }
      roundRect(ix,iy,itemSize,itemSize,10);
      X.stroke();
      X.shadowBlur=0;

      if(isUnlocked){
        // Draw mini ball
        X.save();
        const cx=ix+itemSize/2,cy=iy+itemSize/2-4;
        drawBallAt(cx,cy,1,false,skinKey);
        X.restore();

        // Name
        X.fillStyle='#fff';
        X.font='bold 9px -apple-system, system-ui, sans-serif';
        X.textAlign='center';
        X.fillText(skin.name,ix+itemSize/2,iy+itemSize-8);

        menuBtnAreas.push({
          x:ix,y:iy,w:itemSize,h:itemSize,
          action:()=>{selectedSkin=skinKey;saveData();}
        });
      } else {
        // Lock icon
        X.fillStyle='rgba(255,255,255,0.3)';
        X.font='24px sans-serif';
        X.textAlign='center';
        X.fillText('🔒',ix+itemSize/2,iy+itemSize/2-4);

        // Unlock text
        X.fillStyle='rgba(255,255,255,0.5)';
        X.font='9px -apple-system, system-ui, sans-serif';
        X.fillText(skin.unlock+' pts',ix+itemSize/2,iy+itemSize-8);
      }

      col++;
      if(col>=cols){col=0;curY+=itemSize+gap;}
    }
    if(col>0)curY+=itemSize+gap;
    curY+=8;
  }
}

function drawBackgroundsMenu(){
  X.textAlign='center';X.textBaseline='middle';

  X.fillStyle='#e0e0ff';X.font='bold 30px -apple-system, system-ui, sans-serif';
  X.shadowColor='#b0b0ff';X.shadowBlur=15;
  X.fillText('FUNDOS',W/2,H*0.06);
  X.shadowBlur=0;

  X.fillStyle='rgba(255,255,255,0.5)';
  X.font='12px -apple-system, system-ui, sans-serif';
  const totalBgs=Object.keys(BACKGROUNDS).length;
  X.fillText(unlockedBgs.length+' / '+totalBgs+' DESBLOQUEADOS',W/2,H*0.06+22);

  drawBackBtn();

  // Grid - bigger items since they're previews
  const itemW=Math.min(W*0.8,280);
  const itemH=80;
  const gap=12;
  const startX=(W-itemW)/2;
  let curY=H*0.14;

  for(const bgKey in BACKGROUNDS){
    const bg=BACKGROUNDS[bgKey];
    const isUnlocked=unlockedBgs.includes(bgKey);
    const isSelected=selectedBg===bgKey;

    // Preview background (mini)
    X.save();
    X.beginPath();
    roundRect(startX,curY,itemW,itemH,10);
    X.clip();

    if(isUnlocked){
      // Draw a mini version of the bg
      drawMiniBg(bg.type,startX,curY,itemW,itemH);
    } else {
      X.fillStyle='#0a0a18';
      X.fillRect(startX,curY,itemW,itemH);
    }
    X.restore();

    // Border
    X.strokeStyle=isSelected?'#ffd32a':(isUnlocked?'#70a1ff':'#444');
    X.lineWidth=isSelected?3:1.5;
    if(isSelected){X.shadowColor='#ffd32a';X.shadowBlur=12;}
    roundRect(startX,curY,itemW,itemH,10);
    X.stroke();
    X.shadowBlur=0;

    // Name overlay
    X.fillStyle='rgba(0,0,0,0.6)';
    X.fillRect(startX,curY+itemH-22,itemW,22);
    X.fillStyle=isUnlocked?'#fff':'rgba(255,255,255,0.4)';
    X.font='bold 13px -apple-system, system-ui, sans-serif';
    X.textAlign='center';
    X.textBaseline='middle';
    X.fillText(bg.name.toUpperCase(),startX+itemW/2,curY+itemH-11);

    if(!isUnlocked){
      X.fillStyle='rgba(255,255,255,0.6)';
      X.font='28px sans-serif';
      X.fillText('🔒',startX+itemW/2,curY+itemH/2-12);
      X.fillStyle='rgba(255,255,255,0.5)';
      X.font='11px -apple-system, system-ui, sans-serif';
      X.fillText(bg.unlock+' pts',startX+itemW/2,curY+itemH/2+12);
    } else {
      menuBtnAreas.push({
        x:startX,y:curY,w:itemW,h:itemH,
        action:()=>{selectedBg=bgKey;saveData();}
      });
    }

    curY+=itemH+gap;
  }
}

function drawMiniBg(type,x,y,w,h){
  // Simplified versions of each background for previews
  if(type==='stars'){
    X.fillStyle='#0a0a1a';X.fillRect(x,y,w,h);
    for(let i=0;i<20;i++){
      const sx=x+(i*47)%w, sy=y+(i*73)%h;
      X.fillStyle='#fff';X.globalAlpha=0.5;
      X.fillRect(sx,sy,1,1);
    }
    X.globalAlpha=1;
  }
  else if(type==='nebula'){
    X.fillStyle='#0a0518';X.fillRect(x,y,w,h);
    const g=X.createRadialGradient(x+w*0.3,y+h*0.5,0,x+w*0.3,y+h*0.5,w*0.6);
    g.addColorStop(0,'rgba(150,50,200,0.6)');g.addColorStop(1,'rgba(150,50,200,0)');
    X.fillStyle=g;X.fillRect(x,y,w,h);
    const g2=X.createRadialGradient(x+w*0.7,y+h*0.5,0,x+w*0.7,y+h*0.5,w*0.5);
    g2.addColorStop(0,'rgba(50,100,200,0.5)');g2.addColorStop(1,'rgba(50,100,200,0)');
    X.fillStyle=g2;X.fillRect(x,y,w,h);
  }
  else if(type==='galaxy'){
    X.fillStyle='#040418';X.fillRect(x,y,w,h);
    const cx=x+w/2,cy=y+h/2;
    for(let i=0;i<3;i++){
      for(let j=0;j<25;j++){
        const a=i*Math.PI*2/3+j*0.2;
        const d=j*3;
        const px=cx+Math.cos(a)*d,py=cy+Math.sin(a)*d*0.5;
        X.fillStyle=j<8?'#fff080':'#a080ff';
        X.globalAlpha=0.6-j*0.02;
        X.fillRect(px,py,1.5,1.5);
      }
    }
    X.globalAlpha=1;
  }
  else if(type==='blackhole'){
    X.fillStyle='#000005';X.fillRect(x,y,w,h);
    const cx=x+w/2,cy=y+h/2;
    for(let i=0;i<25;i++){
      const a=i*0.4;
      const r=20+i;
      X.fillStyle=`hsla(${20+i*5},90%,60%,0.4)`;
      X.fillRect(cx+Math.cos(a)*r,cy+Math.sin(a)*r*0.3,2,2);
    }
    X.fillStyle='#000';
    X.beginPath();X.arc(cx,cy,15,0,Math.PI*2);X.fill();
    X.strokeStyle='rgba(255,180,80,0.8)';X.lineWidth=2;
    X.beginPath();X.arc(cx,cy,17,0,Math.PI*2);X.stroke();
  }
  else if(type==='redgiant'){
    X.fillStyle='#1a0008';X.fillRect(x,y,w,h);
    const cx=x+w*0.7,cy=y+h*0.3;
    const ag=X.createRadialGradient(cx,cy,0,cx,cy,w*0.6);
    ag.addColorStop(0,'rgba(255,80,40,0.6)');
    ag.addColorStop(1,'rgba(100,0,0,0)');
    X.fillStyle=ag;X.fillRect(x,y,w,h);
    const sg=X.createRadialGradient(cx,cy,0,cx,cy,30);
    sg.addColorStop(0,'#ffff80');sg.addColorStop(0.5,'#ff8000');sg.addColorStop(1,'#cc2200');
    X.fillStyle=sg;
    X.beginPath();X.arc(cx,cy,30,0,Math.PI*2);X.fill();
  }
  else if(type==='cosmic'){
    X.fillStyle='#02020a';X.fillRect(x,y,w,h);
    const ng=X.createRadialGradient(x+w*0.3,y+h*0.4,0,x+w*0.3,y+h*0.4,w*0.6);
    ng.addColorStop(0,'rgba(100,50,200,0.6)');ng.addColorStop(1,'rgba(100,50,200,0)');
    X.fillStyle=ng;X.fillRect(x,y,w,h);
    const ng2=X.createRadialGradient(x+w*0.7,y+h*0.6,0,x+w*0.7,y+h*0.6,w*0.5);
    ng2.addColorStop(0,'rgba(0,150,200,0.5)');ng2.addColorStop(1,'rgba(0,150,200,0)');
    X.fillStyle=ng2;X.fillRect(x,y,w,h);
    for(let i=0;i<8;i++){
      const sx=x+(i*53)%w,sy=y+(i*37)%h;
      X.fillStyle='#fff';
      X.fillRect(sx,sy,2,2);
    }
  }
}

function drawBackBtn(){
  const bx=20,by=H*0.05,bw=70,bh=32;
  X.globalAlpha=0.8;
  X.fillStyle='rgba(0,0,0,0.6)';
  roundRect(bx,by,bw,bh,8);
  X.fill();
  X.strokeStyle='#fff';X.lineWidth=1.5;
  roundRect(bx,by,bw,bh,8);
  X.stroke();
  X.fillStyle='#fff';
  X.font='bold 13px -apple-system, system-ui, sans-serif';
  X.textAlign='center';X.textBaseline='middle';
  X.fillText('← VOLTAR',bx+bw/2,by+bh/2);
  X.globalAlpha=1;
  menuBtnAreas.push({
    x:bx,y:by,w:bw,h:bh,
    action:()=>{menuScreen='main';}
  });
}

function drawStatsMenu(){
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

  // Achievements section
  const achY=curY+Math.ceil(stats.length/cols)*(cellH+gap)+15;
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

function drawRankingMenu(){
  X.textAlign='center';X.textBaseline='middle';

  X.fillStyle='#e0e0ff';X.font='bold 26px -apple-system, system-ui, sans-serif';
  X.shadowColor='#ff6b9d';X.shadowBlur=15;
  X.fillText('🌍 RANKING GLOBAL',W/2,H*0.05);
  X.shadowBlur=0;

  drawBackBtn();

  // Logout button
  const loX=W-85, loY=H*0.04, loW=72, loH=28;
  X.globalAlpha=0.7;
  X.fillStyle='rgba(0,0,0,0.6)';
  roundRect(loX,loY,loW,loH,8);
  X.fill();
  X.strokeStyle='#ff6b6b';X.lineWidth=1;
  roundRect(loX,loY,loW,loH,8);
  X.stroke();
  X.fillStyle='#ff6b6b';
  X.font='bold 10px -apple-system, system-ui, sans-serif';
  X.textAlign='center';X.textBaseline='middle';
  X.fillText('SAIR',loX+loW/2,loY+loH/2);
  X.globalAlpha=1;
  menuBtnAreas.push({
    x:loX,y:loY,w:loW,h:loH,
    action:()=>{signOut();menuScreen='main';}
  });

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

function drawLoadingScreen(){
  X.textAlign='center';X.textBaseline='middle';

  // Big title
  X.shadowColor='#b0b0ff';X.shadowBlur=30;
  X.fillStyle='#e0e0ff';
  X.font='bold 54px -apple-system, system-ui, sans-serif';
  X.fillText('ÓRBITA',W/2,H*0.4);
  X.shadowBlur=0;

  // Animated ball orbiting
  const orbR=40;
  const cx=W/2, cy=H*0.55;
  const ang=menuT*3;

  // Center dot
  X.fillStyle='rgba(255,255,255,0.4)';
  X.beginPath();
  X.arc(cx,cy,3,0,Math.PI*2);
  X.fill();

  // Orbit trail
  for(let i=0;i<8;i++){
    const a=ang-i*0.15;
    const alpha=(8-i)/8*0.6;
    X.globalAlpha=alpha;
    X.fillStyle='#00f5d4';
    X.beginPath();
    X.arc(cx+Math.cos(a)*orbR,cy+Math.sin(a)*orbR,4-i*0.3,0,Math.PI*2);
    X.fill();
  }
  X.globalAlpha=1;

  // Ball
  const bx=cx+Math.cos(ang)*orbR;
  const by=cy+Math.sin(ang)*orbR;
  X.shadowColor='#00f5d4';
  X.shadowBlur=10;
  X.fillStyle='#fff';
  X.beginPath();
  X.arc(bx,by,6,0,Math.PI*2);
  X.fill();
  X.shadowBlur=0;

  // Loading text
  X.fillStyle='rgba(255,255,255,0.5)';
  X.font='12px -apple-system, system-ui, sans-serif';
  const dots='.'.repeat(Math.floor(menuT*2)%4);
  X.fillText('Carregando'+dots,W/2,H*0.68);
}

function drawLoginScreen(){
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

function drawNicknameScreen(){
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

  // Sign out button (top)
  const soX=20, soY=H*0.05, soW=80, soH=30;
  X.globalAlpha=0.7;
  X.fillStyle='rgba(0,0,0,0.6)';
  roundRect(soX,soY,soW,soH,8);
  X.fill();
  X.strokeStyle='#ff6b6b';X.lineWidth=1;
  roundRect(soX,soY,soW,soH,8);
  X.stroke();
  X.fillStyle='#ff6b6b';
  X.font='bold 11px -apple-system, system-ui, sans-serif';
  X.textAlign='center';X.textBaseline='middle';
  X.fillText('SAIR',soX+soW/2,soY+soH/2);
  X.globalAlpha=1;
  menuBtnAreas.push({
    x:soX,y:soY,w:soW,h:soH,
    action:()=>{signOut();menuScreen='login';}
  });

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

function drawVirtualKeyboard(){
  const keys=[
    'QWERTYUIOP',
    'ASDFGHJKL',
    'ZXCVBNM⌫'
  ];
  const startY=H*0.67;
  const keyW=Math.min(W*0.085,32);
  const keyH=34;
  const gap=4;

  for(let r=0;r<keys.length;r++){
    const row=keys[r];
    const rowW=row.length*(keyW+gap)-gap;
    const rowX=(W-rowW)/2;
    const ky=startY+r*(keyH+gap);

    for(let c=0;c<row.length;c++){
      const ch=row[c];
      const kx=rowX+c*(keyW+gap);

      X.globalAlpha=0.8;
      X.fillStyle='rgba(40,40,60,0.9)';
      roundRect(kx,ky,keyW,keyH,6);
      X.fill();
      X.strokeStyle='rgba(255,255,255,0.3)';
      X.lineWidth=1;
      roundRect(kx,ky,keyW,keyH,6);
      X.stroke();
      X.globalAlpha=1;

      X.fillStyle='#fff';
      X.font='bold 14px -apple-system, system-ui, sans-serif';
      X.textAlign='center';
      X.textBaseline='middle';
      X.fillText(ch,kx+keyW/2,ky+keyH/2);

      menuBtnAreas.push({
        x:kx,y:ky,w:keyW,h:keyH,
        action:()=>{
          nicknameError='';
          if(ch==='⌫'){
            nicknameBuffer=nicknameBuffer.slice(0,-1);
          } else if(nicknameBuffer.length<16){
            nicknameBuffer+=ch;
          }
        }
      });
    }
  }

  // Numbers row
  const numRow='0123456789';
  const nY=startY+3*(keyH+gap);
  const nRowW=numRow.length*(keyW+gap)-gap;
  const nRowX=(W-nRowW)/2;
  for(let i=0;i<numRow.length;i++){
    const ch=numRow[i];
    const kx=nRowX+i*(keyW+gap);
    X.globalAlpha=0.8;
    X.fillStyle='rgba(40,40,60,0.9)';
    roundRect(kx,nY,keyW,keyH,6);
    X.fill();
    X.strokeStyle='rgba(255,255,255,0.3)';
    X.lineWidth=1;
    roundRect(kx,nY,keyW,keyH,6);
    X.stroke();
    X.globalAlpha=1;
    X.fillStyle='#fff';
    X.font='bold 14px -apple-system, system-ui, sans-serif';
    X.textAlign='center';
    X.textBaseline='middle';
    X.fillText(ch,kx+keyW/2,nY+keyH/2);
    menuBtnAreas.push({
      x:kx,y:nY,w:keyW,h:keyH,
      action:()=>{
        nicknameError='';
        if(nicknameBuffer.length<16)nicknameBuffer+=ch;
      }
    });
  }
}

// ============ SETTINGS SCREENS ============
function drawSettingsMenu(){
  X.textAlign='center';X.textBaseline='middle';

  X.fillStyle='#e0e0ff';X.font='bold 28px -apple-system, system-ui, sans-serif';
  X.shadowColor='#a0a0c0';X.shadowBlur=15;
  X.fillText('⚙ CONFIGURAÇÕES',W/2,H*0.06);
  X.shadowBlur=0;

  drawBackBtn();

  let curY = H*0.14;
  const contentW = Math.min(W*0.85, 320);
  const contentX = (W-contentW)/2;

  // Account info section
  if(currentUser){
    X.fillStyle='#ffd32a';
    X.font='bold 11px -apple-system, system-ui, sans-serif';
    X.textAlign='left';
    X.fillText('CONTA',contentX,curY);
    curY+=16;

    // Info card
    X.fillStyle='rgba(0,0,0,0.5)';
    roundRect(contentX,curY,contentW,50,8);
    X.fill();
    X.strokeStyle='rgba(255,211,42,0.3)';
    X.lineWidth=1;
    roundRect(contentX,curY,contentW,50,8);
    X.stroke();

    X.fillStyle='rgba(255,255,255,0.5)';
    X.font='10px -apple-system, system-ui, sans-serif';
    X.fillText('Apelido:',contentX+12,curY+14);
    X.fillStyle='#fff';
    X.font='bold 14px -apple-system, system-ui, sans-serif';
    X.fillText(playerName||'(sem apelido)',contentX+12,curY+30);

    // Email
    if(currentUser.email){
      X.fillStyle='rgba(255,255,255,0.4)';
      X.font='9px -apple-system, system-ui, sans-serif';
      let email = currentUser.email;
      if(email.length>30) email = email.substring(0,28)+'...';
      X.fillText(email,contentX+12,curY+44);
    }
    curY+=60;

    // Change nickname button
    drawSettingsBtn(contentX,curY,contentW,'Trocar apelido','✏','#00f5d4',()=>{
      nicknameBuffer='';
      nicknameError='';
      menuScreen='changeNickname';
    });
    curY+=44;
  }

  // Sound section
  X.fillStyle='#70a1ff';
  X.font='bold 11px -apple-system, system-ui, sans-serif';
  X.textAlign='left';
  X.fillText('ÁUDIO',contentX,curY);
  curY+=16;

  // Music volume slider
  drawSlider(contentX,curY,contentW,'Música',musicVol,(v)=>{
    musicVol=v;
    if(musicGain && !muted){
      musicGain.gain.linearRampToValueAtTime(0.12*musicVol, actx.currentTime+0.1);
    }
    saveData();
  });
  curY+=50;

  // SFX volume slider
  drawSlider(contentX,curY,contentW,'Efeitos',sfxVol,(v)=>{
    sfxVol=v;
    saveData();
    // Play a test tone
    if(actx && sfxVol>0) playTone(600,0.1,'sine',0.15);
  });
  curY+=50;

  // Mute toggle
  drawToggle(contentX,curY,contentW,'Silenciar tudo',muted,()=>{
    toggleMute();
  });
  curY+=44;

  // Vibration section
  X.fillStyle='#ffd32a';
  X.font='bold 11px -apple-system, system-ui, sans-serif';
  X.textAlign='left';
  X.fillText('OUTROS',contentX,curY);
  curY+=16;

  drawToggle(contentX,curY,contentW,'Vibração',vibrationOn,()=>{
    vibrationOn = !vibrationOn;
    saveData();
    if(vibrationOn) vibrate(30);
  });
  curY+=44;

  // Reset progress button
  drawSettingsBtn(contentX,curY,contentW,'Resetar progresso local','↻','#ffa502',()=>{
    if(confirm('Isso vai apagar suas skins, fundos, conquistas e estatísticas locais. Continuar?')){
      resetLocalProgress();
    }
  });
  curY+=44;

  // Delete account button (danger)
  if(currentUser){
    drawSettingsBtn(contentX,curY,contentW,'EXCLUIR CONTA','⚠','#ff4757',()=>{
      menuScreen='confirmDelete';
    });
    curY+=44;
  }

  X.textAlign='center';
}

function drawSettingsBtn(x,y,w,label,icon,color,action){
  const h=38;
  X.globalAlpha=0.7;
  const g=X.createLinearGradient(x,y,x,y+h);
  g.addColorStop(0,'rgba(0,0,0,0.6)');
  g.addColorStop(1,'rgba(0,0,0,0.8)');
  X.fillStyle=g;
  roundRect(x,y,w,h,8);
  X.fill();
  X.strokeStyle=color;
  X.lineWidth=1.5;
  roundRect(x,y,w,h,8);
  X.stroke();
  X.globalAlpha=1;

  X.fillStyle=color;
  X.font='bold 16px -apple-system, system-ui, sans-serif';
  X.textAlign='left';
  X.textBaseline='middle';
  X.fillText(icon,x+14,y+h/2);

  X.fillStyle='#fff';
  X.font='bold 13px -apple-system, system-ui, sans-serif';
  X.fillText(label,x+38,y+h/2);

  // Chevron
  X.fillStyle='rgba(255,255,255,0.4)';
  X.textAlign='right';
  X.font='14px -apple-system, system-ui, sans-serif';
  X.fillText('›',x+w-14,y+h/2-1);

  menuBtnAreas.push({x,y,w,h,action});
}

function drawSlider(x,y,w,label,value,onChange){
  const h=44;
  // Label
  X.fillStyle='#fff';
  X.font='bold 12px -apple-system, system-ui, sans-serif';
  X.textAlign='left';
  X.textBaseline='middle';
  X.fillText(label,x,y+8);

  // Value %
  X.fillStyle='rgba(255,255,255,0.5)';
  X.font='10px -apple-system, system-ui, sans-serif';
  X.textAlign='right';
  X.fillText(Math.round(value*100)+'%',x+w,y+8);

  // Track
  const trackY=y+26;
  const trackH=6;
  X.fillStyle='rgba(0,0,0,0.5)';
  roundRect(x,trackY,w,trackH,3);
  X.fill();

  // Fill
  const fillW=w*value;
  if(fillW>0){
    const g=X.createLinearGradient(x,trackY,x+fillW,trackY);
    g.addColorStop(0,'#00f5d4');
    g.addColorStop(1,'#70a1ff');
    X.fillStyle=g;
    roundRect(x,trackY,fillW,trackH,3);
    X.fill();
  }

  // Knob
  const knobX=x+fillW;
  X.shadowColor='#00f5d4';
  X.shadowBlur=8;
  X.fillStyle='#fff';
  X.beginPath();
  X.arc(knobX,trackY+trackH/2,9,0,Math.PI*2);
  X.fill();
  X.shadowBlur=0;
  X.strokeStyle='#00f5d4';
  X.lineWidth=2;
  X.beginPath();
  X.arc(knobX,trackY+trackH/2,9,0,Math.PI*2);
  X.stroke();

  // Touch zone (bigger than visual)
  menuBtnAreas.push({
    x:x-5, y:trackY-15, w:w+10, h:36,
    action:(tapX)=>{
      const newV = clamp((tapX-x)/w, 0, 1);
      onChange(newV);
    }
  });
}

function drawToggle(x,y,w,label,isOn,action){
  const h=38;
  X.fillStyle='rgba(0,0,0,0.5)';
  roundRect(x,y,w,h,8);
  X.fill();
  X.strokeStyle='rgba(255,255,255,0.15)';
  X.lineWidth=1;
  roundRect(x,y,w,h,8);
  X.stroke();

  // Label
  X.fillStyle='#fff';
  X.font='bold 13px -apple-system, system-ui, sans-serif';
  X.textAlign='left';
  X.textBaseline='middle';
  X.fillText(label,x+14,y+h/2);

  // Toggle switch
  const swW=42, swH=22;
  const swX=x+w-swW-12;
  const swY=y+(h-swH)/2;

  X.fillStyle=isOn?'#00f5d4':'rgba(255,255,255,0.15)';
  roundRect(swX,swY,swW,swH,swH/2);
  X.fill();

  // Knob
  const knobX=isOn?swX+swW-swH/2:swX+swH/2;
  X.fillStyle='#fff';
  if(isOn){X.shadowColor='#00f5d4';X.shadowBlur=6;}
  X.beginPath();
  X.arc(knobX,swY+swH/2,swH/2-3,0,Math.PI*2);
  X.fill();
  X.shadowBlur=0;

  menuBtnAreas.push({x,y,w,h,action});
}

function drawChangeNicknameScreen(){
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

function drawConfirmDeleteScreen(){
  X.textAlign='center';X.textBaseline='middle';

  // Dim background
  X.globalAlpha=0.5;
  X.fillStyle='#000';
  X.fillRect(-10,-10,W+20,H+20);
  X.globalAlpha=1;

  // Card
  const cardW=Math.min(W*0.85,340);
  const cardH=300;
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
  X.fillStyle='#ff6b6b';
  X.font='bold 11px -apple-system, system-ui, sans-serif';
  X.fillText('Essa ação NÃO pode ser desfeita!',W/2,cardY+205);

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

function drawDeadUI(){
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

  if(deathT>0.55){
    X.globalAlpha=f*(0.65+Math.sin(menuT*6)*0.15);
    X.fillStyle='#00f5d4';
    X.font='bold 16px -apple-system, system-ui, sans-serif';
    X.fillText('TOQUE EM QUALQUER LUGAR PARA JOGAR DE NOVO',W/2,H*0.79);
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
    } else {
      X.fillStyle='#70a1ff';
      X.font='bold 10px -apple-system, system-ui, sans-serif';
      X.fillText('NOVO FUNDO',bx+58,by+58);
    }

    X.fillStyle='rgba(255,255,255,0.5)';
    X.font='10px -apple-system, system-ui, sans-serif';
    if(u.type==='achievement'){
      X.fillText('Veja em estatísticas',bx+58,by+74);
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
        state=ST.MENU;
        menuScreen='main';
        setMusicVolume(0.08);
      });
    } else {
      // Smaller menu btn alongside
      drawActionBtn(btnX,btnY1+btnH+6,btnW,36,'IR AO MENU','#ff6b9d',false,()=>{
        pendingUnlocks=[];
        zenMode=false;
        state=ST.MENU;
        menuScreen='main';
        setMusicVolume(0.08);
      });
    }
  }
  X.globalAlpha=1;
}
