// ============ DRAW ============
let bgDecorLayout = null;

function resetBackgroundAnchors(){
  bgDecorLayout = null;
}

function pickRandom(list){
  return list[Math.floor(Math.random()*list.length)];
}

function buildBackgroundDecorLayout(){
  const leftX  = () => rand(W*0.12, W*0.28);
  const rightX = () => rand(W*0.72, W*0.88);
  const topY   = () => rand(H*0.14, H*0.30);
  const midY   = () => rand(H*0.34, H*0.56);
  const lowY   = () => rand(H*0.72, H*0.86);

  const blackSide = Math.random() < 0.5 ? 'left' : 'right';
  const blackX = blackSide === 'left' ? leftX() : rightX();
  const blackY = lowY();

  const redSide = Math.random() < 0.5 ? 'left' : 'right';
  const redX = redSide === 'left' ? rand(W*0.18, W*0.34) : rand(W*0.66, W*0.82);
  const redY = topY();

  const pulsarOptions = [
    { x: rand(W*0.14, W*0.28), y: rand(H*0.18, H*0.32) },
    { x: rand(W*0.72, W*0.86), y: rand(H*0.18, H*0.32) },
    { x: rand(W*0.10, W*0.18), y: midY() },
    { x: rand(W*0.82, W*0.90), y: midY() },
  ];
  const pulsar = pickRandom(pulsarOptions);
  const radial = Math.atan2(pulsar.y - H/2, pulsar.x - W/2);

  const saturnOptions = [
    { x: rand(W*0.08, W*0.18), y: rand(H*0.22, H*0.36), side:'left'  },
    { x: rand(W*0.82, W*0.92), y: rand(H*0.22, H*0.36), side:'right' },
    { x: rand(W*0.10, W*0.20), y: rand(H*0.48, H*0.62), side:'left'  },
    { x: rand(W*0.80, W*0.90), y: rand(H*0.48, H*0.62), side:'right' },
  ];
  const saturn = pickRandom(saturnOptions);

  bgDecorLayout = {
    _w: W,
    _h: H,
    blackhole: {
      x: blackX,
      y: blackY,
      diskR: rand(26, 34),
      ringTilt: blackSide === 'left' ? rand(-0.34, -0.18) : rand(0.18, 0.34),
    },
    redgiant: {
      x: redX,
      y: redY,
      starR: rand(64, 80),
    },
    galaxy: (() => {
      const galaxyOptions = [
        { x: rand(W*0.12, W*0.22), y: rand(H*0.18, H*0.30), side:'left',  tilt: rand(0.18, 0.34) },
        { x: rand(W*0.78, W*0.88), y: rand(H*0.18, H*0.30), side:'right', tilt: rand(-0.34, -0.18) },
        { x: rand(W*0.10, W*0.20), y: rand(H*0.56, H*0.70), side:'left',  tilt: rand(0.16, 0.30) },
        { x: rand(W*0.80, W*0.90), y: rand(H*0.56, H*0.70), side:'right', tilt: rand(-0.30, -0.16) },
      ];
      const g = pickRandom(galaxyOptions);
      return {
        x: g.x,
        y: g.y,
        side: g.side,
        tilt: g.tilt,
        scale: rand(0.72, 0.92),
      };
    })(),
    pulsar: {
      x: pulsar.x,
      y: pulsar.y,
      scale: rand(0.90, 1.05),
      beamBase: radial + Math.PI/2 + rand(-0.18, 0.18),
    },
    saturn: {
      x: saturn.x,
      y: saturn.y,
      side: saturn.side,
      planetR: rand(56, 68),
      ringTilt: saturn.side === 'left' ? rand(0.18, 0.34) : rand(-0.34, -0.18),
      hazeR: rand(160, 190),
    },
  };
}

function getBackgroundDecor(type){
  if(!bgDecorLayout || bgDecorLayout._w !== W || bgDecorLayout._h !== H){
    buildBackgroundDecorLayout();
  }
  return bgDecorLayout[type] || {};
}

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
    X.fillStyle='#040418';X.fillRect(-10,-10,W+20,H+20);

    const decor = getBackgroundDecor('galaxy');
    const cx = decor.x ?? W*0.84;
    const cy = decor.y ?? H*0.24;
    const scale = decor.scale ?? 0.82;
    const tilt = (decor.tilt ?? -0.24) + Math.sin(t*0.10)*0.015;
    const drift = t*0.045;

    // soft cosmic haze kept tighter so it does not invade the play path
    const haze=X.createRadialGradient(cx,cy,0,cx,cy,150*scale);
    haze.addColorStop(0,'rgba(160,120,255,0.10)');
    haze.addColorStop(0.42,'rgba(90,70,180,0.06)');
    haze.addColorStop(1,'rgba(0,0,0,0)');
    X.fillStyle=haze;X.fillRect(-10,-10,W+20,H+20);

    // spiral arms, smaller and pushed toward the edge like Saturn/Pulsar
    for(let arm=0;arm<3;arm++){
      const armAngle=drift+arm*Math.PI*2/3;
      for(let j=0;j<42;j++){
        const dist=j*5.2*scale;
        const angle=armAngle+j*0.19;
        const rx=Math.cos(angle)*dist;
        const ry=Math.sin(angle)*dist*0.58;

        const x=cx + rx*Math.cos(tilt) - ry*Math.sin(tilt);
        const y=cy + rx*Math.sin(tilt) + ry*Math.cos(tilt);

        X.globalAlpha=Math.max(0.05,0.22-j*0.004);
        X.fillStyle=j<12?'rgba(255,245,170,0.92)':(j<26?'rgba(255,140,210,0.78)':'rgba(150,135,255,0.68)');
        X.beginPath();X.arc(x,y,Math.max(0.8,2.3-j*0.03)*scale,0,Math.PI*2);X.fill();
      }
    }

    // subtle dust ring to make it feel alive, but decorative
    for(let i=0;i<44;i++){
      const a=drift*1.2+i*(Math.PI*2/44);
      const radius=(78+Math.sin(i*1.7+t*0.3)*8)*scale;
      const px=cx + Math.cos(a)*radius*Math.cos(tilt) - Math.sin(a)*(radius*0.42)*Math.sin(tilt);
      const py=cy + Math.cos(a)*radius*Math.sin(tilt) + Math.sin(a)*(radius*0.42)*Math.cos(tilt);
      X.globalAlpha=0.10+0.05*Math.sin(t*0.8+i);
      X.fillStyle=i%2===0?'rgba(255,220,120,0.75)':'rgba(180,140,255,0.66)';
      X.beginPath();X.arc(px,py,1.3*scale,0,Math.PI*2);X.fill();
    }

    // core glow
    const cg=X.createRadialGradient(cx,cy,0,cx,cy,62*scale);
    cg.addColorStop(0,'rgba(255,245,185,0.46)');
    cg.addColorStop(1,'rgba(255,245,185,0)');
    X.fillStyle=cg;X.fillRect(-10,-10,W+20,H+20);
    X.globalAlpha=1;
  }
  else if(bg.type==='blackhole'){
    X.fillStyle='#000005';X.fillRect(-10,-10,W+20,H+20);

    const decor = getBackgroundDecor('blackhole');
    const cx = decor.x ?? W*0.10;
    const cy = decor.y ?? H*0.84;
    const diskR = decor.diskR ?? 30;
    const ringTilt = (decor.ringTilt ?? -0.22) + Math.sin(t*0.22)*0.02;

    // Soft distant haze
    const hg=X.createRadialGradient(cx,cy,0,cx,cy,150);
    hg.addColorStop(0,'rgba(255,140,40,0.06)');
    hg.addColorStop(0.45,'rgba(180,90,20,0.04)');
    hg.addColorStop(1,'rgba(0,0,0,0)');
    X.fillStyle=hg;X.fillRect(-10,-10,W+20,H+20);

    // Subtle accretion disk behind
    for(let i=0;i<7;i++){
      X.globalAlpha=0.12-i*0.012;
      X.strokeStyle=i%2===0?'rgba(255,185,95,0.42)':'rgba(255,120,40,0.24)';
      X.lineWidth=4.5-i*0.35;
      X.beginPath();
      X.ellipse(cx,cy,62+i*9,18+i*3.0,ringTilt,0,Math.PI*2);
      X.stroke();
    }

    // Moving dust tied to the ellipse so the ring feels alive but calm
    for(let i=0;i<48;i++){
      const a=t*0.55 + (i/48)*Math.PI*2;
      const ex=66 + (i%6)*7;
      const ey=17 + (i%4)*2.2;
      const cosA=Math.cos(a), sinA=Math.sin(a);
      const px=cx + cosA*ex*Math.cos(ringTilt) - sinA*ey*Math.sin(ringTilt);
      const py=cy + cosA*ex*Math.sin(ringTilt) + sinA*ey*Math.cos(ringTilt);
      X.globalAlpha=0.03 + (i%4)*0.012;
      X.fillStyle=i%2===0?'rgba(255,210,150,0.78)':'rgba(255,150,70,0.62)';
      X.beginPath();X.arc(px,py,0.85 + (i%3)*0.12,0,Math.PI*2);X.fill();
    }

    X.globalAlpha=1;

    // Event horizon
    X.fillStyle='#000';
    X.shadowColor='rgba(255,120,40,0.28)';X.shadowBlur=18;
    X.beginPath();X.arc(cx,cy,diskR,0,Math.PI*2);X.fill();
    X.shadowBlur=0;

    // Photon ring
    X.strokeStyle='rgba(255,185,95,0.34)';X.lineWidth=2.2;
    X.beginPath();X.arc(cx,cy,diskR+4,0,Math.PI*2);X.stroke();
  }

else if(bg.type==='redgiant'){
    // Decorative like Saturn: pushed to the edge, but now random every run.
    X.fillStyle='#08030a';X.fillRect(-10,-10,W+20,H+20);

    const decor = getBackgroundDecor('redgiant');
    const cx = decor.x ?? W*0.90;
    const cy = decor.y ?? H*0.18;
    const starR = decor.starR ?? 76;

    // Softer atmosphere, tighter to the star
    const ag=X.createRadialGradient(cx,cy,0,cx,cy,170);
    ag.addColorStop(0,'rgba(255,110,45,0.12)');
    ag.addColorStop(0.34,'rgba(210,55,20,0.07)');
    ag.addColorStop(1,'rgba(0,0,0,0)');
    X.fillStyle=ag;X.fillRect(-10,-10,W+20,H+20);

    // Star body
    X.shadowColor='rgba(255,70,0,0.28)';X.shadowBlur=22;
    const sg=X.createRadialGradient(cx,cy,0,cx,cy,starR);
    sg.addColorStop(0,'#fff4a0');
    sg.addColorStop(0.46,'#ff8a00');
    sg.addColorStop(1,'#d93400');
    X.fillStyle=sg;
    X.beginPath();X.arc(cx,cy,starR+Math.sin(t)*2.2,0,Math.PI*2);X.fill();
    X.shadowBlur=0;

    // More discreet flares
    for(let i=0;i<6;i++){
      const fa=t*0.42+i*Math.PI/3;
      const inner=starR*0.94;
      const outer=starR+26+Math.sin(t*2+i)*6;
      X.fillStyle='rgba(255,160,60,0.16)';
      X.beginPath();
      X.moveTo(cx+Math.cos(fa)*inner,cy+Math.sin(fa)*inner);
      X.lineTo(cx+Math.cos(fa)*outer,cy+Math.sin(fa)*outer);
      X.lineTo(cx+Math.cos(fa+0.11)*inner,cy+Math.sin(fa+0.11)*inner);
      X.closePath();X.fill();
    }
  }


else if(bg.type==='pulsar'){
    X.fillStyle='#030612';X.fillRect(-10,-10,W+20,H+20);

    const decor = getBackgroundDecor('pulsar');
    const pcx = decor.x ?? W*0.78;
    const pcy = decor.y ?? H*0.28;
    const pScale = decor.scale ?? 1.0;

    // Deep ambient glows
    const neb1=X.createRadialGradient(pcx,pcy,0,pcx,pcy,260*pScale);
    neb1.addColorStop(0,'rgba(80,180,255,0.14)');
    neb1.addColorStop(0.45,'rgba(70,100,255,0.08)');
    neb1.addColorStop(1,'rgba(0,0,0,0)');
    X.fillStyle=neb1;X.fillRect(-10,-10,W+20,H+20);

    const neb2=X.createRadialGradient(W*0.92,H*0.12,0,W*0.92,H*0.12,220*pScale);
    neb2.addColorStop(0,'rgba(180,120,255,0.08)');
    neb2.addColorStop(1,'rgba(0,0,0,0)');
    X.fillStyle=neb2;X.fillRect(-10,-10,W+20,H+20);

    // Magnetic field arcs
    for(let i=0;i<4;i++){
      X.globalAlpha=0.10-i*0.015;
      X.strokeStyle=i%2===0?'rgba(110,230,255,0.6)':'rgba(150,130,255,0.45)';
      X.lineWidth=1.4;
      X.beginPath();
      X.ellipse(pcx,pcy,(92+i*22)*pScale,(170+i*26)*pScale,0.55,0.12*Math.PI,0.88*Math.PI);
      X.stroke();
      X.beginPath();
      X.ellipse(pcx,pcy,(92+i*22)*pScale,(170+i*26)*pScale,-0.55,1.12*Math.PI,1.88*Math.PI);
      X.stroke();
    }

    // Radiation halo
    const ph=X.createRadialGradient(pcx,pcy,0,pcx,pcy,210*pScale);
    ph.addColorStop(0,'rgba(160,245,255,0.18)');
    ph.addColorStop(0.18,'rgba(110,180,255,0.14)');
    ph.addColorStop(1,'rgba(0,0,0,0)');
    X.fillStyle=ph;X.fillRect(-10,-10,W+20,H+20);

    // Rotating beams
    const beamA=(decor.beamBase ?? 0.75) + t*0.85;
    for(const off of [0, Math.PI]){
      const ang=beamA+off;
      X.globalAlpha=0.16;
      X.strokeStyle='rgba(90,225,255,0.95)';
      X.lineWidth=26;
      X.beginPath();
      X.moveTo(pcx-Math.cos(ang)*420*pScale,pcy-Math.sin(ang)*420*pScale);
      X.lineTo(pcx+Math.cos(ang)*420*pScale,pcy+Math.sin(ang)*420*pScale);
      X.stroke();

      X.globalAlpha=0.26;
      X.strokeStyle='rgba(210,250,255,0.95)';
      X.lineWidth=7;
      X.beginPath();
      X.moveTo(pcx-Math.cos(ang)*420*pScale,pcy-Math.sin(ang)*420*pScale);
      X.lineTo(pcx+Math.cos(ang)*420*pScale,pcy+Math.sin(ang)*420*pScale);
      X.stroke();
    }

    // Pulse shock rings
    for(let i=0;i<4;i++){
      const phase=(t*2.2+i*0.85)%4;
      const rr=(74+phase*46)*pScale;
      X.globalAlpha=Math.max(0,0.22-phase*0.045);
      X.strokeStyle=i%2===0?'rgba(130,250,255,0.9)':'rgba(110,150,255,0.7)';
      X.lineWidth=2.4-phase*0.2;
      X.beginPath();X.arc(pcx,pcy,rr,0,Math.PI*2);X.stroke();
    }

    // Core corona
    X.globalAlpha=1;
    X.shadowColor='#8ffcff';X.shadowBlur=32;
    const pg=X.createRadialGradient(pcx,pcy,0,pcx,pcy,88*pScale);
    pg.addColorStop(0,'#fffad8');
    pg.addColorStop(0.14,'#a9ffff');
    pg.addColorStop(0.32,'#56b8ff');
    pg.addColorStop(0.58,'rgba(90,130,255,0.55)');
    pg.addColorStop(1,'rgba(0,0,0,0)');
    X.fillStyle=pg;
    X.beginPath();X.arc(pcx,pcy,82*pScale,0,Math.PI*2);X.fill();
    X.shadowBlur=0;

    // Compact bright star
    X.fillStyle='#fffbe9';
    X.beginPath();X.arc(pcx,pcy,12*pScale,0,Math.PI*2);X.fill();
    X.strokeStyle='rgba(255,255,255,0.85)';X.lineWidth=2;
    X.beginPath();
    X.moveTo(pcx-24*pScale,pcy);X.lineTo(pcx+24*pScale,pcy);
    X.moveTo(pcx,pcy-24*pScale);X.lineTo(pcx,pcy+24*pScale);
    X.stroke();

    // Spark particles near the source
    for(let i=0;i<18;i++){
      const a=(i/18)*Math.PI*2 + t*0.4;
      const d=(26 + (i%3)*12 + Math.sin(t*2+i)*3)*pScale;
      X.globalAlpha=0.28;
      X.fillStyle=i%2===0?'#9bf6ff':'#c8b6ff';
      X.beginPath();X.arc(pcx+Math.cos(a)*d,pcy+Math.sin(a)*d,1.6,0,Math.PI*2);X.fill();
    }
    X.globalAlpha=1;
  }
  else if(bg.type==='saturnrings'){
    X.fillStyle='#06050c';X.fillRect(-10,-10,W+20,H+20);

    // Decorative Saturn, randomized every run but still kept near the edges
    const decor = getBackgroundDecor('saturn');
    const scx = decor.x ?? W*0.90;
    const scy = decor.y ?? H*0.34;
    const planetR = decor.planetR ?? 62;
    const ringTilt = (decor.ringTilt ?? -0.28) + Math.sin(t*0.18)*0.028;
    const ringSpin=t*0.65;
    const hazeR = decor.hazeR ?? 178;

    // Softer warm haze, tighter to the planet
    const sg=X.createRadialGradient(scx,scy,0,scx,scy,hazeR);
    sg.addColorStop(0,'rgba(255,215,150,0.10)');
    sg.addColorStop(0.34,'rgba(180,120,80,0.06)');
    sg.addColorStop(1,'rgba(0,0,0,0)');
    X.fillStyle=sg;X.fillRect(-10,-10,W+20,H+20);

    // Very subtle distant bands crossing the screen
    X.globalAlpha=0.05;
    X.strokeStyle='rgba(170,200,255,0.22)';
    X.lineWidth=1.5;
    for(let i=0;i<5;i++){
      X.beginPath();
      X.moveTo(W*0.18, H*(0.24+i*0.09));
      X.bezierCurveTo(W*0.42,H*(0.20+i*0.08),W*0.62,H*(0.34+i*0.06),W*0.96,H*(0.28+i*0.09));
      X.stroke();
    }
    X.globalAlpha=1;

    // Rings behind with toned-down variation
    for(let i=0;i<7;i++){
      X.globalAlpha=0.14-i*0.012;
      X.strokeStyle=i%3===0?'rgba(245,214,156,0.54)':(i%3===1?'rgba(175,205,255,0.26)':'rgba(214,168,120,0.30)');
      X.lineWidth=5.5-i*0.42;
      X.beginPath();
      X.ellipse(scx,scy,planetR+28+i*12,(planetR*0.35)+i*4.2,ringTilt,0,Math.PI*2);
      X.stroke();
    }

    // Ring dust speckles moving around the rings to sell rotation
    for(let i=0;i<72;i++){
      const orbitA=ringSpin + (i/72)*Math.PI*2;
      const rr=(planetR+26) + (i%10)*9;
      const ex=(rr + Math.sin(t*1.7+i)*2.0);
      const ey=(21 + (i%7)*2.6);
      const cosA=Math.cos(orbitA), sinA=Math.sin(orbitA);
      const px=scx + cosA*ex*Math.cos(ringTilt) - sinA*ey*Math.sin(ringTilt);
      const py=scy + cosA*ex*Math.sin(ringTilt) + sinA*ey*Math.cos(ringTilt);
      X.globalAlpha=0.035 + (i%5)*0.012;
      X.fillStyle=i%2===0?'rgba(255,232,186,0.80)':'rgba(170,210,255,0.72)';
      X.beginPath();X.arc(px,py,0.95 + (i%3)*0.14,0,Math.PI*2);X.fill();
    }

    // Rotating bright clumps on the ring front, but more discreet
    for(let i=0;i<3;i++){
      const a=ringSpin*0.9 + i*Math.PI*2/3;
      const ex=planetR+58, ey=planetR*0.53;
      const cosA=Math.cos(a), sinA=Math.sin(a);
      const px=scx + cosA*ex*Math.cos(ringTilt) - sinA*ey*Math.sin(ringTilt);
      const py=scy + cosA*ex*Math.sin(ringTilt) + sinA*ey*Math.cos(ringTilt);
      X.globalAlpha=0.11 + 0.04*Math.sin(t*2+i);
      X.shadowColor='rgba(255,240,190,0.50)';X.shadowBlur=7;
      X.fillStyle='rgba(255,240,190,0.72)';
      X.beginPath();X.arc(px,py,2.6,0,Math.PI*2);X.fill();
      X.shadowBlur=0;
    }

    // Planet body, smaller and pushed out of the play corridor
    X.globalAlpha=1;
    X.shadowColor='rgba(255,198,126,0.24)';X.shadowBlur=18;
    const sb=X.createRadialGradient(scx-10,scy-14,0,scx,scy,planetR+6);
    sb.addColorStop(0,'#fff7d4');
    sb.addColorStop(0.16,'#ffd78a');
    sb.addColorStop(0.36,'#f3b05d');
    sb.addColorStop(0.62,'#b97338');
    sb.addColorStop(1,'#5b3218');
    X.fillStyle=sb;
    X.beginPath();X.arc(scx,scy,planetR,0,Math.PI*2);X.fill();
    X.shadowBlur=0;

    // Planet bands
    X.save();
    X.beginPath();X.arc(scx,scy,planetR,0,Math.PI*2);X.clip();
    for(let i=0;i<5;i++){
      X.globalAlpha=0.08 + i*0.012;
      X.fillStyle=i%2===0?'rgba(90,45,18,0.42)':'rgba(255,220,170,0.16)';
      X.fillRect(scx-(planetR+20), scy-(planetR*0.75) + i*(planetR*0.30) + Math.sin(t*0.7+i)*2.2, (planetR+20)*2, 9 + i*1.6);
    }
    X.restore();

    // Ring front cut/highlight with slow drift, less contrast near gameplay area
    X.globalAlpha=0.30;
    X.strokeStyle='rgba(255,236,190,0.68)';
    X.lineWidth=4;
    X.beginPath();
    X.ellipse(scx,scy,planetR+66,planetR*0.56,ringTilt,0.10*Math.PI + 0.08*Math.sin(t*0.35),0.88*Math.PI + 0.06*Math.sin(t*0.35));
    X.stroke();
    X.globalAlpha=0.10;
    X.strokeStyle='rgba(130,170,255,0.50)';
    X.lineWidth=8;
    X.beginPath();
    X.ellipse(scx,scy,planetR+80,planetR*0.68,ringTilt,0.06*Math.PI + 0.06*Math.sin(t*0.32),0.92*Math.PI + 0.05*Math.sin(t*0.32));
    X.stroke();
    X.globalAlpha=1;

    // Tiny moons with faint orbits, relative to Saturn so they move with each randomized layout
    const moonOffsets = [
      [-planetR*2.9, -planetR*1.8, 4.5],
      [-planetR*3.2,  planetR*2.2, 3.0],
      [ planetR*1.7,  planetR*3.1, 2.5],
      [ planetR*2.2, -planetR*2.7, 2.8],
    ];
    for(let i=0;i<moonOffsets.length;i++){
      const m=moonOffsets[i];
      const mx=scx+m[0], my=scy+m[1];
      X.globalAlpha=0.18;
      X.strokeStyle='rgba(190,200,255,0.24)';
      X.lineWidth=1;
      X.beginPath();X.arc(mx,my,9+i*2,0,Math.PI*2);X.stroke();
      X.globalAlpha=0.40;
      X.fillStyle='rgba(230,230,255,0.65)';
      X.beginPath();X.arc(mx,my,m[2],0,Math.PI*2);X.fill();
    }
    X.globalAlpha=1;
  }

  else if(bg.type==='astralcathedral'){
    X.fillStyle='#050713';X.fillRect(-10,-10,W+20,H+20);

    // Deep side glows
    const lg=X.createRadialGradient(W*0.10,H*0.52,0,W*0.10,H*0.52,W*0.42);
    lg.addColorStop(0,'rgba(90,140,255,0.16)');
    lg.addColorStop(1,'rgba(90,140,255,0)');
    X.fillStyle=lg;X.fillRect(-10,-10,W+20,H+20);

    const rg=X.createRadialGradient(W*0.90,H*0.52,0,W*0.90,H*0.52,W*0.42);
    rg.addColorStop(0,'rgba(180,90,255,0.16)');
    rg.addColorStop(1,'rgba(180,90,255,0)');
    X.fillStyle=rg;X.fillRect(-10,-10,W+20,H+20);

    // Cathedral pillars / arches at the edges
    X.globalAlpha=0.34;
    for(const side of [0.12,0.88]){
      const cx=W*side;
      X.strokeStyle=side<0.5?'rgba(120,180,255,0.38)':'rgba(210,120,255,0.38)';
      X.lineWidth=3;
      X.beginPath();
      X.moveTo(cx,H*0.18);
      X.lineTo(cx,H*0.88);
      X.stroke();

      X.lineWidth=2;
      X.beginPath();
      X.arc(cx,H*0.18,56,Math.PI,0);
      X.stroke();

      X.globalAlpha=0.18;
      X.beginPath();
      X.arc(cx,H*0.18,88,Math.PI,0);
      X.stroke();
      X.globalAlpha=0.34;
    }

    // Floating stained-glass shards near the borders
    for(let i=0;i<10;i++){
      const side=i<5?0.18:0.82;
      const dir=i<5?-1:1;
      const px=W*side + Math.sin(t*0.6+i)*22;
      const py=H*(0.18 + (i%5)*0.15) + Math.cos(t*0.5+i)*9;
      X.fillStyle=i%2===0?'rgba(140,220,255,0.22)':'rgba(220,140,255,0.22)';
      X.beginPath();
      X.moveTo(px,py-12);
      X.lineTo(px+8*dir,py);
      X.lineTo(px,py+12);
      X.lineTo(px-5*dir,py);
      X.closePath();
      X.fill();
    }

    // Safe center glow that does not cover the aim corridor
    const cg=X.createRadialGradient(W/2,H*0.78,0,W/2,H*0.78,W*0.32);
    cg.addColorStop(0,'rgba(255,240,190,0.12)');
    cg.addColorStop(1,'rgba(255,240,190,0)');
    X.fillStyle=cg;X.fillRect(-10,-10,W+20,H+20);

    // Fine star field
    X.globalAlpha=1;
    for(let i=0;i<16;i++){
      const sx=(i*83)%W;
      const sy=(i*137)%H;
      X.globalAlpha=0.20+0.20*Math.sin(t*1.8+i);
      X.fillStyle='#ffffff';
      X.beginPath();X.arc(sx,sy,1.2,0,Math.PI*2);X.fill();
    }
    X.globalAlpha=1;
  }
  else if(bg.type==='andromedathrone'){
    X.fillStyle='#04040f';X.fillRect(-10,-10,W+20,H+20);

    // Large distant galaxy in the upper-right, away from the center lane
    const gcx=W*0.78, gcy=H*0.26;
    for(let arm=0;arm<4;arm++){
      const armBase=t*0.04+arm*Math.PI/2;
      for(let j=0;j<54;j++){
        const d=j*5.2;
        const a=armBase+j*0.17;
        X.globalAlpha=0.26-j*0.0035;
        X.fillStyle=j<18?'#ffe8ff':(j<36?'#c084fc':'#60a5fa');
        X.beginPath();
        X.arc(gcx+Math.cos(a)*d,gcy+Math.sin(a)*d*0.52,2.4-j*0.02,0,Math.PI*2);
        X.fill();
      }
    }
    const gg=X.createRadialGradient(gcx,gcy,0,gcx,gcy,120);
    gg.addColorStop(0,'rgba(255,235,255,0.22)');
    gg.addColorStop(1,'rgba(255,235,255,0)');
    X.globalAlpha=1;
    X.fillStyle=gg;X.fillRect(-10,-10,W+20,H+20);

    // Throne silhouette low center/right
    X.globalAlpha=0.22;
    X.fillStyle='rgba(170,120,255,0.20)';
    X.beginPath();
    X.moveTo(W*0.60,H*0.86);
    X.lineTo(W*0.66,H*0.70);
    X.lineTo(W*0.72,H*0.70);
    X.lineTo(W*0.78,H*0.86);
    X.closePath();
    X.fill();

    X.fillStyle='rgba(120,180,255,0.14)';
    X.beginPath();
    X.moveTo(W*0.63,H*0.70);
    X.lineTo(W*0.67,H*0.58);
    X.lineTo(W*0.71,H*0.70);
    X.closePath();
    X.fill();

    // Royal energy curtains
    for(let i=0;i<6;i++){
      const x=W*(0.08+i*0.16);
      const cg2=X.createLinearGradient(x,0,x,H);
      cg2.addColorStop(0,'rgba(0,0,0,0)');
      cg2.addColorStop(0.45,'rgba(80,120,255,0.05)');
      cg2.addColorStop(0.55,'rgba(200,100,255,0.07)');
      cg2.addColorStop(1,'rgba(0,0,0,0)');
      X.fillStyle=cg2;
      X.fillRect(x-20,0,40,H);
    }

    // Constellation nodes
    X.globalAlpha=0.35;
    const pts=[[W*0.16,H*0.24],[W*0.21,H*0.18],[W*0.27,H*0.25],[W*0.31,H*0.20],[W*0.36,H*0.28]];
    X.strokeStyle='rgba(180,210,255,0.18)';
    X.lineWidth=1;
    X.beginPath();
    pts.forEach((p,idx)=> idx===0 ? X.moveTo(p[0],p[1]) : X.lineTo(p[0],p[1]));
    X.stroke();
    for(const p of pts){
      X.fillStyle='rgba(255,255,255,0.45)';
      X.beginPath();X.arc(p[0],p[1],2,0,Math.PI*2);X.fill();
    }
    X.globalAlpha=1;
  }
  else if(bg.type==='cosmicgenesis'){
    X.fillStyle='#01030a';X.fillRect(-10,-10,W+20,H+20);

    // Creation rift
    const rcx=W*0.74, rcy=H*0.32;
    const rg1=X.createRadialGradient(rcx,rcy,0,rcx,rcy,150);
    rg1.addColorStop(0,'rgba(255,245,210,0.28)');
    rg1.addColorStop(0.18,'rgba(255,190,90,0.20)');
    rg1.addColorStop(0.38,'rgba(80,220,255,0.16)');
    rg1.addColorStop(1,'rgba(0,0,0,0)');
    X.fillStyle=rg1;X.fillRect(-10,-10,W+20,H+20);

    // Nested rings
    for(let i=0;i<3;i++){
      X.globalAlpha=0.22-i*0.05;
      X.strokeStyle=i===0?'rgba(255,220,120,0.55)':(i===1?'rgba(90,220,255,0.40)':'rgba(170,120,255,0.32)');
      X.lineWidth=2.2-i*0.4;
      X.beginPath();
      X.ellipse(rcx,rcy,96+i*26,58+i*16,t*0.10+i*0.6,0,Math.PI*2);
      X.stroke();
    }

    // Cosmic filaments sweeping from the corners
    for(let i=0;i<7;i++){
      const phase=t*0.18+i*0.7;
      X.globalAlpha=0.12;
      X.strokeStyle=i%2===0?'rgba(90,220,255,0.55)':'rgba(255,200,120,0.48)';
      X.lineWidth=1.8;
      X.beginPath();
      X.moveTo(-40,H*(0.12+i*0.10));
      X.bezierCurveTo(W*0.20,H*(0.06+i*0.04),W*0.46,H*(0.34+i*0.03),rcx+Math.sin(phase)*18,rcy+Math.cos(phase)*14);
      X.stroke();

      X.beginPath();
      X.moveTo(W+40,H*(0.84-i*0.08));
      X.bezierCurveTo(W*0.78,H*(0.88-i*0.04),W*0.52,H*(0.58-i*0.02),rcx+Math.cos(phase)*14,rcy+Math.sin(phase)*18);
      X.stroke();
    }

    // Tiny creation sparks
    for(let i=0;i<22;i++){
      const a=t*0.35+i*0.55;
      const d=40+(i%6)*18;
      X.globalAlpha=0.28;
      X.fillStyle=i%3===0?'#fff6cf':(i%3===1?'#80ffff':'#d8b4fe');
      X.beginPath();
      X.arc(rcx+Math.cos(a)*d,rcy+Math.sin(a)*d*0.65,1.6,0,Math.PI*2);
      X.fill();
    }

    // Subtle lower-left proto-galaxy
    const pcx=W*0.18,pcy=H*0.78;
    for(let i=0;i<18;i++){
      const a=t*0.03+i*0.32;
      const d=i*3.2;
      X.globalAlpha=0.18-i*0.006;
      X.fillStyle=i<8?'#fff':'#6ee7ff';
      X.beginPath();X.arc(pcx+Math.cos(a)*d,pcy+Math.sin(a)*d*0.55,1.8,0,Math.PI*2);X.fill();
    }
    X.globalAlpha=1;
  }

  else if(bg.type==='cosmic'){
    X.fillStyle='#02020a';X.fillRect(-10,-10,W+20,H+20);
    const ng=X.createRadialGradient(W*0.3,H*0.4,0,W*0.3,H*0.4,W*0.6);
    ng.addColorStop(0,'rgba(100,50,200,0.4)');
    ng.addColorStop(1,'rgba(100,50,200,0)');
    X.fillStyle=ng;X.fillRect(-10,-10,W+20,H+20);
    const ng2=X.createRadialGradient(W*0.7,H*0.6,0,W*0.7,H*0.6,W*0.5);
    ng2.addColorStop(0,'rgba(0,150,200,0.3)');
    ng2.addColorStop(1,'rgba(0,150,200,0)');
    X.fillStyle=ng2;X.fillRect(-10,-10,W+20,H+20);
    const cx=W*0.2,cy=H*0.7;
    for(let i=0;i<25;i++){
      const a=t*0.05+i*0.25;
      const d=i*4;
      X.globalAlpha=0.4-i*0.012;
      X.fillStyle=i<10?'#fff':'#80a0ff';
      X.beginPath();X.arc(cx+Math.cos(a)*d,cy+Math.sin(a)*d*0.6,2,0,Math.PI*2);X.fill();
    }
    X.globalAlpha=1;
    for(let i=0;i<8;i++){
      const sx=(i*97)%W;
      const sy=(i*131)%H;
      const tw=0.5+0.5*Math.sin(t*2+i);
      X.globalAlpha=tw;
      X.fillStyle='#fff';
      X.beginPath();X.arc(sx,sy,2,0,Math.PI*2);X.fill();
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

  if(state===ST.PLAY){drawPlayUI();drawPauseBtn();}
  else if(state===ST.MENU){drawMenuUI();}
  else if(state===ST.DEAD){drawDeadUI();}
  else if(state===ST.PAUSE){drawPlayUI();drawPauseScreen();}

  X.restore();
  return true;
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
    setMusicVolume(0.95);
  });

  drawActionBtn(btnX,H*0.58+btnH+12,btnW,btnH,'MENU PRINCIPAL','#ff6b9d',false,()=>{
    zenMode=false;
    state=ST.MENU;
    menuScreen='main';
    setMusicVolume(0.80);
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


function drawTopStatusBadges() {
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

function drawMenuUI(){
  menuBtnAreas = [];
  syncMenuScrollState();
  updateMenuScrollAnimation();
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
  else if(menuScreen==='installHelp')drawInstallHelpScreen();
  else if(menuScreen==='debug')drawDebugMenu();
}



function drawMissionInfoCard(x,y,w,compact){
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

function drawMainMenu(){
  drawTopStatusBadges();
  X.textAlign='center';X.textBaseline='middle';

  // Title
  X.shadowColor='#b0b0ff';X.shadowBlur=30;
  X.fillStyle='#e0e0ff';X.font='bold 56px -apple-system, system-ui, sans-serif';
  X.fillText('ÓRBITA',W/2,H*0.18);X.shadowBlur=0;

  X.fillStyle='rgba(255,255,255,0.45)';X.font='13px -apple-system, system-ui, sans-serif';
  X.fillText('Salte de órbita em órbita',W/2,H*0.18+38);

  // Preview ball with current skin
  const py=H*0.31+Math.sin(menuT*2)*8;
  X.save();
  drawBallAt(W/2,py,1,false,selectedSkin);
  X.restore();

  // Skin name
  const skin=SKINS[selectedSkin];
  X.fillStyle=getRarityColor(skin.rarity);
  X.font='bold 12px -apple-system, system-ui, sans-serif';
  X.fillText(skin.name.toUpperCase(),W/2,H*0.31+30);

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

    if(currentUser) drawMissionInfoCard((W-Math.min(W*0.82,320))/2, H*0.80, Math.min(W*0.82,320), true);
    if(best>0){
      X.fillStyle='rgba(255,255,255,0.4)';
      X.font='14px -apple-system, system-ui, sans-serif';
      X.textAlign='center';X.textBaseline='middle';
      X.fillText('RECORDE: '+best,W/2,H*0.93);
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

  if(currentUser) drawMissionInfoCard((W-Math.min(W*0.82,320))/2, Math.min(H*0.80, btnY+52), Math.min(W*0.82,320), true);

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


let menuScrollScreen = '';
let menuScrollY = 0;
let menuScrollTargetY = 0;
let menuScrollMinY = 0;
let menuScrollMaxY = 0;

function isMenuScreenScrollable(){
  return menuScreen==='skins' || menuScreen==='backgrounds' || menuScreen==='debug';
}

function syncMenuScrollState(){
  if(!isMenuScreenScrollable()){
    menuScrollScreen='';
    menuScrollY=0;
    menuScrollTargetY=0;
    menuScrollMinY=0;
    menuScrollMaxY=0;
    return;
  }
  if(menuScrollScreen!==menuScreen){
    menuScrollScreen=menuScreen;
    menuScrollY=0;
    menuScrollTargetY=0;
    menuScrollMinY=0;
    menuScrollMaxY=0;
  }
}

function updateMenuScrollAnimation(){
  if(!isMenuScreenScrollable()) return;
  menuScrollTargetY = clamp(menuScrollTargetY, menuScrollMinY, menuScrollMaxY);
  menuScrollY += (menuScrollTargetY - menuScrollY) * 0.22;
  if(Math.abs(menuScrollTargetY - menuScrollY) < 0.4){
    menuScrollY = menuScrollTargetY;
  }
}

function getMenuScrollViewport(){
  if(menuScreen==='skins') return { top:H*0.12, bottom:H-18 };
  if(menuScreen==='backgrounds') return { top:H*0.12, bottom:H-18 };
  if(menuScreen==='debug') return { top:H*0.12, bottom:H-18 };
  return null;
}

function beginMenuScrollClip(){
  const vp = getMenuScrollViewport();
  if(!vp) return null;
  X.save();
  X.beginPath();
  X.rect(0, vp.top, W, vp.bottom - vp.top);
  X.clip();
  X.translate(0, menuScrollY);
  return vp;
}

function endMenuScrollClip(){
  X.restore();
}

function setMenuScrollBounds(contentStartY, contentEndY, viewport){
  if(!viewport) return;
  const viewportH = Math.max(0, viewport.bottom - viewport.top);
  const contentH = Math.max(0, contentEndY - contentStartY);
  menuScrollMaxY = 0;
  menuScrollMinY = Math.min(0, viewportH - contentH - 10);
  menuScrollTargetY = clamp(menuScrollTargetY, menuScrollMinY, menuScrollMaxY);
  menuScrollY = clamp(menuScrollY, menuScrollMinY, menuScrollMaxY);
}

function canStartMenuScroll(x,y){
  if(!isMenuScreenScrollable()) return false;
  const vp = getMenuScrollViewport();
  if(!vp) return false;
  return y >= vp.top && y <= vp.bottom;
}

function applyMenuScrollGesture(deltaY){
  if(!isMenuScreenScrollable()) return;
  menuScrollTargetY = clamp(menuScrollTargetY + deltaY, menuScrollMinY, menuScrollMaxY);
  menuScrollY = menuScrollTargetY;
}

function wheelMenuScroll(deltaY){
  if(!isMenuScreenScrollable()) return;
  menuScrollTargetY = clamp(menuScrollTargetY - deltaY * 0.55, menuScrollMinY, menuScrollMaxY);
}

function drawMenuScrollBar(viewport){
  if(!viewport || menuScrollMinY >= -2) return;
  const trackX = W - 10;
  const trackY = viewport.top + 8;
  const trackH = viewport.bottom - viewport.top - 16;
  const viewportH = viewport.bottom - viewport.top;
  const contentH = viewportH - menuScrollMinY;
  const thumbH = Math.max(34, trackH * (viewportH / contentH));
  const progress = (-menuScrollY) / Math.max(1, -menuScrollMinY);
  const thumbY = trackY + (trackH - thumbH) * progress;

  X.globalAlpha = 0.18;
  X.fillStyle = '#ffffff';
  roundRect(trackX, trackY, 4, trackH, 2);
  X.fill();

  X.globalAlpha = 0.65;
  X.fillStyle = '#7aa8ff';
  roundRect(trackX, thumbY, 4, thumbH, 2);
  X.fill();
  X.globalAlpha = 1;
}

function drawMenuScrollFades(viewport){
  if(!viewport || menuScrollMinY >= -2) return;
  const fadeH = 24;
  if(menuScrollY < -1){
    const tg = X.createLinearGradient(0, viewport.top, 0, viewport.top + fadeH);
    tg.addColorStop(0, 'rgba(3,4,20,0.92)');
    tg.addColorStop(1, 'rgba(3,4,20,0)');
    X.fillStyle = tg;
    X.fillRect(0, viewport.top, W, fadeH);
  }
  if(menuScrollY > menuScrollMinY + 1){
    const bg = X.createLinearGradient(0, viewport.bottom - fadeH, 0, viewport.bottom);
    bg.addColorStop(0, 'rgba(3,4,20,0)');
    bg.addColorStop(1, 'rgba(3,4,20,0.92)');
    X.fillStyle = bg;
    X.fillRect(0, viewport.bottom - fadeH, W, fadeH);
  }
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

  drawBackBtn();

  const rarities=['common','rare','legendary','stellar'];
  const skinsByRarity={common:[],rare:[],legendary:[],stellar:[]};
  for(const k in SKINS){
    skinsByRarity[SKINS[k].rarity].push(k);
  }

  const itemSize=70;
  const gap=12;
  const cols=Math.max(1, Math.floor((W-40)/(itemSize+gap)));
  const contentStartY=H*0.13;
  let curY=contentStartY;
  const viewport = beginMenuScrollClip();

  for(const rarity of rarities){
    const skins=skinsByRarity[rarity];
    if(skins.length===0)continue;

    X.fillStyle=getRarityColor(rarity);
    X.font='bold 13px -apple-system, system-ui, sans-serif';
    X.textAlign='left';
    X.shadowColor=getRarityColor(rarity);
    X.shadowBlur=8;
    X.fillText(getRarityName(rarity),20,curY);
    X.shadowBlur=0;
    curY+=22;

    let col=0;
    const startX=(W-(cols*(itemSize+gap)-gap))/2;
    for(const skinKey of skins){
      const skin=SKINS[skinKey];
      const ix=startX+col*(itemSize+gap);
      const iy=curY;
      const screenY=iy+menuScrollY;
      const isUnlocked=unlockedSkins.includes(skinKey);
      const isSelected=selectedSkin===skinKey;

      X.globalAlpha=isUnlocked?0.6:0.3;
      X.fillStyle='#000';
      roundRect(ix,iy,itemSize,itemSize,10);
      X.fill();

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
        X.save();
        const cx=ix+itemSize/2,cy=iy+itemSize/2-4;
        drawBallAt(cx,cy,1,false,skinKey);
        X.restore();

        X.fillStyle='#fff';
        X.font='bold 9px -apple-system, system-ui, sans-serif';
        X.textAlign='center';
        X.fillText(skin.name,ix+itemSize/2,iy+itemSize-8);

        menuBtnAreas.push({
          x:ix,y:screenY,w:itemSize,h:itemSize,
          action:()=>{selectedSkin=skinKey;saveData();}
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
      if(col>=cols){col=0;curY+=itemSize+gap;}
    }
    if(col>0)curY+=itemSize+gap;
    curY+=8;
  }

  endMenuScrollClip();
  setMenuScrollBounds(contentStartY, curY, viewport);
  drawMenuScrollBar(viewport);
  drawMenuScrollFades(viewport);
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

  const itemW=Math.min(W*0.8,280);
  const itemH=80;
  const gap=12;
  const startX=(W-itemW)/2;
  const contentStartY=H*0.14;
  let curY=contentStartY;
  const viewport = beginMenuScrollClip();

  for(const bgKey in BACKGROUNDS){
    const bg=BACKGROUNDS[bgKey];
    const isUnlocked=unlockedBgs.includes(bgKey);
    const isSelected=selectedBg===bgKey;
    const screenY=curY+menuScrollY;

    X.save();
    X.beginPath();
    roundRect(startX,curY,itemW,itemH,10);
    X.clip();

    if(isUnlocked){
      drawMiniBg(bg.type,startX,curY,itemW,itemH);
    } else {
      X.fillStyle='#0a0a18';
      X.fillRect(startX,curY,itemW,itemH);
    }
    X.restore();

    X.strokeStyle=isSelected?'#ffd32a':(isUnlocked?'#70a1ff':'#444');
    X.lineWidth=isSelected?3:1.5;
    if(isSelected){X.shadowColor='#ffd32a';X.shadowBlur=12;}
    roundRect(startX,curY,itemW,itemH,10);
    X.stroke();
    X.shadowBlur=0;

    X.fillStyle='rgba(0,0,0,0.6)';
    X.fillRect(startX,curY+itemH-22,itemW,22);
    X.fillStyle=isUnlocked?'#fff':'rgba(255,255,255,0.4)';
    X.font='bold 13px -apple-system, system-ui, sans-serif';
    X.textAlign='center';
    X.textBaseline='middle';
    X.fillText(bg.name.toUpperCase(),startX+itemW/2,curY+itemH-11);

    if(bg.masterpiece){
      X.fillStyle='rgba(255,215,120,0.92)';
      X.font='bold 10px -apple-system, system-ui, sans-serif';
      X.textAlign='left';
      X.textBaseline='middle';
      X.fillText('✦ OBRA-PRIMA',startX+10,curY+12);
      X.textAlign='center';
      X.textBaseline='middle';
    }

    if(!isUnlocked){
      X.fillStyle='rgba(255,255,255,0.6)';
      X.font='28px sans-serif';
      X.fillText('🔒',startX+itemW/2,curY+itemH/2-14);
      X.fillStyle=bg.masterpiece?'rgba(255,220,140,0.76)':'rgba(255,255,255,0.5)';
      X.font=bg.masterpiece?'bold 9px -apple-system, system-ui, sans-serif':'11px -apple-system, system-ui, sans-serif';
      const unlockLabel=(typeof getBackgroundUnlockLabel==='function') ? getBackgroundUnlockLabel(bgKey) : (bg.unlock+' pts');
      X.fillText(unlockLabel,startX+itemW/2,curY+itemH/2+13);
    } else {
      menuBtnAreas.push({
        x:startX,y:screenY,w:itemW,h:itemH,
        action:()=>{selectedBg=bgKey;saveData();}
      });
    }

    curY+=itemH+gap;
  }

  endMenuScrollClip();
  setMenuScrollBounds(contentStartY, curY, viewport);
  drawMenuScrollBar(viewport);
  drawMenuScrollFades(viewport);
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

  else if(type==='pulsar'){
    X.fillStyle='#030612';X.fillRect(x,y,w,h);
    const pcx=x+w*0.74, pcy=y+h*0.34;
    const ph=X.createRadialGradient(pcx,pcy,0,pcx,pcy,w*0.46);
    ph.addColorStop(0,'rgba(120,230,255,0.52)');
    ph.addColorStop(1,'rgba(0,0,0,0)');
    X.fillStyle=ph;X.fillRect(x,y,w,h);
    X.strokeStyle='rgba(130,240,255,0.28)';X.lineWidth=5;
    X.beginPath();X.moveTo(x-w*0.02,y+h*0.10);X.lineTo(x+w*1.02,y+h*0.60);X.stroke();
    X.strokeStyle='rgba(255,255,255,0.78)';X.lineWidth=1.6;
    X.beginPath();X.moveTo(x-w*0.02,y+h*0.10);X.lineTo(x+w*1.02,y+h*0.60);X.stroke();
    for(let i=0;i<3;i++){
      X.globalAlpha=0.16-i*0.04;
      X.strokeStyle=i===0?'rgba(130,250,255,0.9)':'rgba(110,150,255,0.75)';
      X.lineWidth=1.2;
      X.beginPath();X.arc(pcx,pcy,12+i*8,0,Math.PI*2);X.stroke();
    }
    X.globalAlpha=1;
    X.fillStyle='#fff8cf';
    X.beginPath();X.arc(pcx,pcy,9,0,Math.PI*2);X.fill();
  }
  else if(type==='saturnrings'){
    X.fillStyle='#06050c';X.fillRect(x,y,w,h);
    const scx=x+w*0.73, scy=y+h*0.45;
    const ringTilt=-0.30 + Math.sin(menuT*0.18)*0.03;
    const ringSpin=menuT*0.65;
    X.strokeStyle='rgba(245,214,156,0.85)';X.lineWidth=4;
    X.beginPath();X.ellipse(scx,scy,w*0.24,h*0.12,ringTilt,0,Math.PI*2);X.stroke();
    X.strokeStyle='rgba(170,205,255,0.50)';X.lineWidth=2.4;
    X.beginPath();X.ellipse(scx,scy,w*0.30,h*0.16,ringTilt,0,Math.PI*2);X.stroke();
    X.strokeStyle='rgba(214,168,120,0.45)';X.lineWidth=1.6;
    X.beginPath();X.ellipse(scx,scy,w*0.19,h*0.09,ringTilt,0,Math.PI*2);X.stroke();
    for(let i=0;i<16;i++){
      const a=ringSpin + (i/16)*Math.PI*2;
      const ex=w*0.27, ey=h*0.13;
      const cosA=Math.cos(a), sinA=Math.sin(a);
      const px=scx + cosA*ex*Math.cos(ringTilt) - sinA*ey*Math.sin(ringTilt);
      const py=scy + cosA*ex*Math.sin(ringTilt) + sinA*ey*Math.cos(ringTilt);
      X.globalAlpha=0.12 + (i%4)*0.05;
      X.fillStyle=i%2===0?'rgba(255,235,190,0.9)':'rgba(170,205,255,0.82)';
      X.beginPath();X.arc(px,py,1.0 + (i%2)*0.2,0,Math.PI*2);X.fill();
    }
    const sb=X.createRadialGradient(scx-8,scy-8,0,scx,scy,30);
    sb.addColorStop(0,'#fff6d4');sb.addColorStop(0.22,'#ffd78a');sb.addColorStop(0.52,'#f3b05d');sb.addColorStop(1,'#7b4722');
    X.fillStyle=sb;
    X.beginPath();X.arc(scx,scy,24,0,Math.PI*2);X.fill();
    X.globalAlpha=0.16;X.fillStyle='rgba(255,255,255,0.9)';
    X.fillRect(x+w*0.12,y+h*0.20,w*0.46,1.2);
    X.globalAlpha=1;
  }

  else if(type==='astralcathedral'){
    X.fillStyle='#050713';X.fillRect(x,y,w,h);
    const lg=X.createRadialGradient(x+w*0.08,y+h*0.55,0,x+w*0.08,y+h*0.55,w*0.45);
    lg.addColorStop(0,'rgba(120,180,255,0.35)');
    lg.addColorStop(1,'rgba(120,180,255,0)');
    X.fillStyle=lg;X.fillRect(x,y,w,h);
    const rg=X.createRadialGradient(x+w*0.92,y+h*0.55,0,x+w*0.92,y+h*0.55,w*0.45);
    rg.addColorStop(0,'rgba(220,120,255,0.35)');
    rg.addColorStop(1,'rgba(220,120,255,0)');
    X.fillStyle=rg;X.fillRect(x,y,w,h);
    X.strokeStyle='rgba(180,220,255,0.35)';X.lineWidth=2;
    X.beginPath();X.moveTo(x+w*0.12,y+h*0.22);X.lineTo(x+w*0.12,y+h*0.88);X.stroke();
    X.beginPath();X.moveTo(x+w*0.88,y+h*0.22);X.lineTo(x+w*0.88,y+h*0.88);X.stroke();
    X.beginPath();X.arc(x+w*0.12,y+h*0.22,18,Math.PI,0);X.stroke();
    X.beginPath();X.arc(x+w*0.88,y+h*0.22,18,Math.PI,0);X.stroke();
  }
  else if(type==='andromedathrone'){
    X.fillStyle='#04040f';X.fillRect(x,y,w,h);
    const cx=x+w*0.74,cy=y+h*0.30;
    for(let i=0;i<3;i++){
      for(let j=0;j<20;j++){
        const a=i*Math.PI*2/3+j*0.24;
        const d=j*2.6;
        X.globalAlpha=0.45-j*0.014;
        X.fillStyle=j<7?'#ffe6ff':(j<14?'#c084fc':'#60a5fa');
        X.fillRect(cx+Math.cos(a)*d,cy+Math.sin(a)*d*0.55,1.6,1.6);
      }
    }
    X.globalAlpha=0.22;
    X.fillStyle='rgba(180,120,255,0.28)';
    X.beginPath();
    X.moveTo(x+w*0.55,y+h*0.88);
    X.lineTo(x+w*0.64,y+h*0.60);
    X.lineTo(x+w*0.73,y+h*0.88);
    X.closePath();X.fill();
    X.globalAlpha=1;
  }
  else if(type==='cosmicgenesis'){
    X.fillStyle='#01030a';X.fillRect(x,y,w,h);
    const cx=x+w*0.74,cy=y+h*0.34;
    const rg=X.createRadialGradient(cx,cy,0,cx,cy,w*0.34);
    rg.addColorStop(0,'rgba(255,230,180,0.55)');
    rg.addColorStop(0.25,'rgba(255,170,80,0.40)');
    rg.addColorStop(0.45,'rgba(80,220,255,0.28)');
    rg.addColorStop(1,'rgba(0,0,0,0)');
    X.fillStyle=rg;X.fillRect(x,y,w,h);
    X.strokeStyle='rgba(255,215,120,0.35)';X.lineWidth=1.6;
    X.beginPath();X.ellipse(cx,cy,w*0.16,h*0.12,0.4,0,Math.PI*2);X.stroke();
    X.strokeStyle='rgba(90,220,255,0.28)';
    X.beginPath();X.ellipse(cx,cy,w*0.24,h*0.18,-0.4,0,Math.PI*2);X.stroke();
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

function getBackTargetScreen(){
  if(menuScreen==='debug') return 'settings';
  if(menuScreen==='changeNickname') return 'settings';
  if(menuScreen==='confirmDelete') return 'settings';
  if(menuScreen==='installHelp') return 'settings';
  if(menuScreen==='settings') return 'main';
  if(menuScreen==='skins') return 'main';
  if(menuScreen==='backgrounds') return 'main';
  if(menuScreen==='stats') return 'main';
  if(menuScreen==='ranking') return 'main';
  if(menuScreen==='nickname') return 'main';
  return 'main';
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
    action:()=>{
      menuScreen=getBackTargetScreen();
    }
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

  const missionCardY=curY+Math.ceil(stats.length/cols)*(cellH+gap)+12;
  const missionCardVisible = !!currentUser;
  if(missionCardVisible){
    drawMissionInfoCard((W-Math.min(W*0.86,330))/2, missionCardY, Math.min(W*0.86,330), false);
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

function drawRankingMenu(){
  drawTopStatusBadges();
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
  drawTopStatusBadges();
  X.textAlign='center';X.textBaseline='middle';

  X.fillStyle='#e0e0ff';X.font='bold 28px -apple-system, system-ui, sans-serif';
  X.shadowColor='#a0a0c0';X.shadowBlur=15;
  X.fillText('⚙ CONFIGURAÇÕES',W/2,H*0.06);
  X.shadowBlur=0;

  drawBackBtn();

  let curY = H*0.14;
  const contentW = Math.min(W*0.85, 320);
  const contentX = (W-contentW)/2;

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
  if(!isStandaloneApp && (canInstallApp || canShowIosInstallHelp)){
    drawSettingsBtn(contentX,curY,contentW,canInstallApp?'Instalar app':'Como instalar no iPhone','⬇','#7bed9f',()=>{
      promptInstallApp();
    });
    curY+=44;

    X.fillStyle='rgba(255,255,255,0.45)';
    X.font='10px -apple-system, system-ui, sans-serif';
    X.textAlign='left';
    X.fillText(pwaStatusText||'Abra no navegador do celular para instalar',contentX,curY+4);
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

  X.textAlign='center';
}

function drawInstallHelpScreen(){
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


function drawVolumeStepper(x,y,w,label,value,onChange,color){
  const h=40;
  const accent=color||'#70a1ff';
  const vv=clamp(value||0,0,1);

  X.fillStyle='rgba(0,0,0,0.5)';
  roundRect(x,y,w,h,8);
  X.fill();
  X.strokeStyle='rgba(255,255,255,0.12)';
  X.lineWidth=1;
  roundRect(x,y,w,h,8);
  X.stroke();

  X.fillStyle='#fff';
  X.font='bold 12px -apple-system, system-ui, sans-serif';
  X.textAlign='left';
  X.textBaseline='middle';
  X.fillText(label,x+12,y+12);

  const valueText=Math.round(vv*100)+'%';
  X.fillStyle='rgba(255,255,255,0.55)';
  X.font='10px -apple-system, system-ui, sans-serif';
  X.fillText(valueText,x+12,y+28);

  const trackX=x+92, trackY=y+18, trackW=Math.max(70,w-160), trackH=6;
  X.fillStyle='rgba(255,255,255,0.08)';
  roundRect(trackX,trackY,trackW,trackH,3); X.fill();
  const fillW=Math.max(0,trackW*vv);
  if(fillW>0){
    const g=X.createLinearGradient(trackX,trackY,trackX+fillW,trackY);
    g.addColorStop(0,accent);
    g.addColorStop(1,'#ffffff');
    X.fillStyle=g;
    roundRect(trackX,trackY,fillW,trackH,3); X.fill();
  }

  const minusX=x+w-66, plusX=x+w-34, btnY=y+8, btnS=24;
  drawMiniStepButton(minusX,btnY,btnS,'−',accent,()=>onChange(clamp(vv-0.05,0,1)));
  drawMiniStepButton(plusX,btnY,btnS,'+',accent,()=>onChange(clamp(vv+0.05,0,1)));
}

function drawMiniStepButton(x,y,size,label,color,action){
  X.globalAlpha=0.85;
  X.fillStyle='rgba(20,20,35,0.9)';
  roundRect(x,y,size,size,7); X.fill();
  X.strokeStyle=color; X.lineWidth=1.4; roundRect(x,y,size,size,7); X.stroke();
  X.globalAlpha=1;
  X.fillStyle='#fff';
  X.font='bold 16px -apple-system, system-ui, sans-serif';
  X.textAlign='center'; X.textBaseline='middle';
  X.fillText(label,x+size/2,y+size/2+0.5);
  menuBtnAreas.push({x,y,w:size,h:size,action});
}

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

  X.fillStyle='rgba(255,255,255,0.5)';
  X.font='11px -apple-system, system-ui, sans-serif';
  X.fillText('Ferramentas locais para validar fundo, áudio e desbloqueios rápido', W/2, H*0.09);

  drawBackBtn();

  const contentW = Math.min(W*0.88, 360);
  const contentX = (W-contentW)/2;
  let curY = H*0.13;
  const contentStartY = curY;
  const viewport = beginMenuScrollClip();

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
  curY += 48;

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
        state=ST.MENU;
        menuScreen='main';
        setMusicVolume(0.95);
      });
    } else {
      // Smaller menu btn alongside
      drawActionBtn(btnX,btnY1+btnH+6,btnW,36,'IR AO MENU','#ff6b9d',false,()=>{
        pendingUnlocks=[];
        zenMode=false;
        state=ST.MENU;
        menuScreen='main';
        setMusicVolume(0.95);
      });
    }
  }
  X.globalAlpha=1;
}
