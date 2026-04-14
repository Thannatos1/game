const C = document.getElementById('c');
const X = C.getContext('2d');
let dpr = Math.min(window.devicePixelRatio || 1, 3);
let W, H;
function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 3);
  W = window.innerWidth; H = window.innerHeight;
  C.width = W*dpr; C.height = H*dpr;
  C.style.width = W+'px'; C.style.height = H+'px';
  X.setTransform(dpr,0,0,dpr,0,0);
}
resize();
window.addEventListener('resize', resize);
document.addEventListener('touchstart', e=>e.preventDefault(), {passive:false});
document.addEventListener('touchmove', e=>e.preventDefault(), {passive:false});
document.addEventListener('gesturestart', e=>e.preventDefault());

// ============ AUDIO ============
const AudioCtx = window.AudioContext || window.webkitAudioContext;
const MUSIC_BASE_GAIN = 0.88;
const SFX_BASE_GAIN = 0.74;
let actx = null;
let musicSceneLevel = 0.90;
let musicDuckGain = null;
let musicGain = null;
let musicMasterGain = null;
let musicCompressor = null;
let sfxGain = null;
let sfxCompressor = null;
let sfxOutputGain = null;
let musicStarted = false;
let musicNodes = [];

function getCurrentMusicUserVolume() {
  const isGameplayContext = state === ST.PLAY || state === ST.PAUSE;
  return clamp(isGameplayContext ? gameMusicVol : menuMusicVol, 0, 1);
}

function getMusicTargetGain(sceneLevel = musicSceneLevel) {
  return muted ? 0 : MUSIC_BASE_GAIN * clamp(sceneLevel, 0, 1) * getCurrentMusicUserVolume();
}

function refreshMusicGain(rampSeconds = 0.25) {
  if (musicGain && actx) {
    musicGain.gain.cancelScheduledValues(actx.currentTime);
    musicGain.gain.linearRampToValueAtTime(getMusicTargetGain(), actx.currentTime + rampSeconds);
  }
}

function makeStereoNode(pan = 0) {
  if (!actx) return null;
  if (typeof actx.createStereoPanner === 'function') {
    const p = actx.createStereoPanner();
    p.pan.value = clamp(pan, -1, 1);
    return p;
  }
  const g = actx.createGain();
  g.gain.value = 1;
  return g;
}

function duckMusicTo(mult = 0.88, holdMs = 140, rampDown = 0.012, rampUp = 0.18) {
  if (!musicDuckGain || !actx) return;
  const now = actx.currentTime;
  const holdSec = Math.max(0.04, holdMs / 1000);
  const safeMult = clamp(mult, 0.55, 1);
  musicDuckGain.gain.cancelScheduledValues(now);
  musicDuckGain.gain.setValueAtTime(musicDuckGain.gain.value, now);
  musicDuckGain.gain.linearRampToValueAtTime(safeMult, now + rampDown);
  musicDuckGain.gain.setValueAtTime(safeMult, now + rampDown + holdSec);
  musicDuckGain.gain.linearRampToValueAtTime(1, now + rampDown + holdSec + rampUp);
}

function initSfxBus() {
  if (!actx || sfxGain) return;

  sfxGain = actx.createGain();
  sfxGain.gain.value = SFX_BASE_GAIN;

  sfxCompressor = actx.createDynamicsCompressor();
  sfxCompressor.threshold.value = -24;
  sfxCompressor.knee.value = 16;
  sfxCompressor.ratio.value = 3.8;
  sfxCompressor.attack.value = 0.004;
  sfxCompressor.release.value = 0.18;

  sfxOutputGain = actx.createGain();
  sfxOutputGain.gain.value = 0.96;

  sfxGain.connect(sfxCompressor);
  sfxCompressor.connect(sfxOutputGain);
  sfxOutputGain.connect(actx.destination);
}

function initAudio() {
  if (!actx) {
    actx = new AudioCtx();
    initMusic();
    initSfxBus();
  }
  if (actx && actx.state === 'suspended') {
    actx.resume().catch(()=>{});
  }
}

window.addEventListener('pointerdown', () => {
  if (actx && actx.state === 'suspended') actx.resume().catch(()=>{});
}, { passive:true });

// ============ AMBIENT MUSIC ============
function initMusic() {
  if (!actx || musicStarted) return;
  musicStarted = true;

  musicGain = actx.createGain();
  musicGain.gain.value = getMusicTargetGain(0.90);

  musicDuckGain = actx.createGain();
  musicDuckGain.gain.value = 1;

  const toneFilter = actx.createBiquadFilter();
  toneFilter.type = 'lowpass';
  toneFilter.frequency.value = 1800;
  toneFilter.Q.value = 0.7;

  musicCompressor = actx.createDynamicsCompressor();
  musicCompressor.threshold.value = -26;
  musicCompressor.knee.value = 20;
  musicCompressor.ratio.value = 2.6;
  musicCompressor.attack.value = 0.02;
  musicCompressor.release.value = 0.25;

  musicMasterGain = actx.createGain();
  musicMasterGain.gain.value = 0.98;

  musicGain.connect(musicDuckGain);
  musicDuckGain.connect(toneFilter);
  toneFilter.connect(musicCompressor);
  musicCompressor.connect(musicMasterGain);
  musicMasterGain.connect(actx.destination);

  // Wide stereo ambience
  const delayL = actx.createDelay(1.5);
  delayL.delayTime.value = 0.19;
  const delayLGain = actx.createGain();
  delayLGain.gain.value = 0.09;
  const delayLPan = makeStereoNode(-0.62);

  const delayR = actx.createDelay(1.5);
  delayR.delayTime.value = 0.27;
  const delayRGain = actx.createGain();
  delayRGain.gain.value = 0.08;
  const delayRPan = makeStereoNode(0.62);

  const shimmerDelayL = actx.createDelay(0.08);
  shimmerDelayL.delayTime.value = 0.014;
  const shimmerGainL = actx.createGain();
  shimmerGainL.gain.value = 0.035;
  const shimmerPanL = makeStereoNode(-0.35);

  const shimmerDelayR = actx.createDelay(0.08);
  shimmerDelayR.delayTime.value = 0.021;
  const shimmerGainR = actx.createGain();
  shimmerGainR.gain.value = 0.03;
  const shimmerPanR = makeStereoNode(0.35);

  musicMasterGain.connect(delayL);
  delayL.connect(delayLGain);
  delayLGain.connect(delayLPan);
  delayLPan.connect(actx.destination);

  musicMasterGain.connect(delayR);
  delayR.connect(delayRGain);
  delayRGain.connect(delayRPan);
  delayRPan.connect(actx.destination);

  musicMasterGain.connect(shimmerDelayL);
  shimmerDelayL.connect(shimmerGainL);
  shimmerGainL.connect(shimmerPanL);
  shimmerPanL.connect(actx.destination);

  musicMasterGain.connect(shimmerDelayR);
  shimmerDelayR.connect(shimmerGainR);
  shimmerGainR.connect(shimmerPanR);
  shimmerPanR.connect(actx.destination);

  const chords = [
    [220.00, 261.63, 329.63], // A minor
    [174.61, 220.00, 261.63], // F major
    [261.63, 329.63, 392.00], // C major
    [196.00, 246.94, 293.66], // G major
  ];

  let chordIdx = 0;

  function playChord() {
    if (!actx) return;
    const chord = chords[chordIdx];
    const now = actx.currentTime;
    const dur = 6;
    const notePans = [-0.32, 0, 0.32];

    // Soft sub layer for more body
    const sub = actx.createOscillator();
    const subGain = actx.createGain();
    const subPan = makeStereoNode(0);
    sub.type = 'sine';
    sub.frequency.value = chord[0] * 0.5;
    subGain.gain.setValueAtTime(0.0001, now);
    subGain.gain.linearRampToValueAtTime(0.05, now + 1.6);
    subGain.gain.setValueAtTime(0.05, now + dur - 1.2);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    sub.connect(subGain);
    subGain.connect(subPan);
    subPan.connect(musicGain);
    sub.start(now);
    sub.stop(now + dur);

    chord.forEach((freq, i) => {
      [0, 7].forEach((detune, j) => {
        const osc = actx.createOscillator();
        const g = actx.createGain();
        const p = makeStereoNode(notePans[i] + (j === 0 ? -0.08 : 0.08));
        const noteFilter = actx.createBiquadFilter();

        osc.type = i === 0 ? 'sine' : 'triangle';
        osc.frequency.value = freq;
        osc.detune.value = detune;

        noteFilter.type = 'lowpass';
        noteFilter.frequency.value = i === 0 ? 1600 : 2400;
        noteFilter.Q.value = 0.6;

        g.gain.setValueAtTime(0.0001, now);
        g.gain.linearRampToValueAtTime(0.12, now + 1.4);
        g.gain.setValueAtTime(0.12, now + dur - 1.3);
        g.gain.exponentialRampToValueAtTime(0.001, now + dur);

        osc.connect(noteFilter);
        noteFilter.connect(g);
        g.connect(p);
        p.connect(musicGain);
        osc.start(now);
        osc.stop(now + dur);
      });
    });

    const shimmer = actx.createOscillator();
    const sg = actx.createGain();
    const sp = makeStereoNode(chordIdx % 2 === 0 ? 0.42 : -0.42);
    shimmer.type = 'sine';
    shimmer.frequency.value = chord[0] * 4;
    shimmer.detune.value = chordIdx % 2 === 0 ? 4 : -4;
    sg.gain.setValueAtTime(0.0001, now);
    sg.gain.linearRampToValueAtTime(0.03, now + 1.8);
    sg.gain.exponentialRampToValueAtTime(0.001, now + dur);
    shimmer.connect(sg);
    sg.connect(sp);
    sp.connect(musicGain);
    shimmer.start(now);
    shimmer.stop(now + dur);

    chordIdx = (chordIdx + 1) % chords.length;
    setTimeout(playChord, (dur - 0.5) * 1000);
  }

  playChord();
}

function setMusicVolume(v) {
  musicSceneLevel = clamp(v, 0, 1);
  refreshMusicGain(0.25);
}

function toggleMute() {
  muted = !muted;
  saveData();
  refreshMusicGain(0.18);
}

function vibrate(pattern) {
  if (!vibrationOn || !navigator.vibrate) return;
  navigator.vibrate(pattern);
}

function playTone(freq, dur, type, vol, detune, opts) {
  if (!actx || muted || sfxVol <= 0) return;
  initSfxBus();
  const now = actx.currentTime;
  const cfg = opts || {};
  const attack = Math.max(0.004, Math.min(cfg.attack ?? 0.012, dur * 0.45));
  const releaseLead = Math.min(cfg.releaseLead ?? 0.030, dur * 0.55);
  const peak = clamp((vol || 0.15) * sfxVol * (cfg.trim ?? 1), 0, 0.32);
  const basePan = clamp((cfg.pan !== undefined ? cfg.pan : (Math.random() * 0.18 - 0.09)), -1, 1);
  const stereoWidth = clamp(cfg.stereoWidth ?? 0.0, 0, 0.7);

  function emitLayer(freqMul, detuneOffset, panOffset, gainMul, layerType) {
    const o = actx.createOscillator();
    const g = actx.createGain();
    const f = actx.createBiquadFilter();
    const p = makeStereoNode(basePan + panOffset);

    o.type = layerType || type || 'sine';
    o.frequency.value = freq * freqMul;
    o.detune.value = (detune || 0) + detuneOffset;

    if (cfg.highpass) {
      f.type = 'highpass';
      f.frequency.value = cfg.highpass;
    } else if (cfg.lowpass) {
      f.type = 'lowpass';
      f.frequency.value = cfg.lowpass;
    } else {
      f.type = 'lowpass';
      f.frequency.value = 4200;
    }
    f.Q.value = cfg.q ?? 0.7;

    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(peak * gainMul, now + attack);
    g.gain.setValueAtTime(peak * gainMul, now + Math.max(attack, dur - releaseLead));
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);

    o.connect(f);
    f.connect(g);
    g.connect(p);
    p.connect(sfxGain);

    o.start(now);
    o.stop(now + dur + 0.03);
  }

  emitLayer(1, 0, 0, 1, type);
  if (stereoWidth > 0.01) {
    emitLayer(1.003, 4, stereoWidth, 0.42, cfg.layerType || type || 'sine');
    emitLayer(0.997, -4, -stereoWidth, 0.35, cfg.layerType || type || 'sine');
  }

  if (cfg.duck && musicDuckGain) {
    duckMusicTo(cfg.duck, cfg.duckMs || Math.max(120, dur * 1000 * 1.1), cfg.duckAttack || 0.012, cfg.duckRelease || 0.18);
  }
}

function sndRelease() {
  playTone(300, 0.11, 'sine', 0.065, 0, { trim:0.92, lowpass:1800, stereoWidth:0.14, pan:-0.08 });
  playTone(450, 0.08, 'triangle', 0.032, 0, { trim:0.90, lowpass:2400, stereoWidth:0.10, pan:0.08 });
}
function sndCapture(pts, combo) {
  const base = 380 + combo * 34;
  playTone(base, 0.16, 'sine', 0.08, 0, { duck:0.95, duckMs:110, lowpass:2500, stereoWidth:0.18 });
  playTone(base * 1.5, 0.12, 'triangle', 0.04, 0, { trim:0.94, lowpass:3200, stereoWidth:0.14 });
  if (pts >= 3) { setTimeout(()=>playTone(base*2, 0.12, 'sine', 0.045, 0, { trim:0.90, lowpass:2600, stereoWidth:0.18, pan:0.12 }), 50); }
  if (pts >= 5) { setTimeout(()=>playTone(base*2.5, 0.16, 'triangle', 0.055, 0, { trim:0.90, lowpass:3400, duck:0.93, duckMs:120, stereoWidth:0.22, pan:-0.12 }), 105); }
}
function sndDie() {
  playTone(200, 0.32, 'sawtooth', 0.07, 0, { duck:0.84, duckMs:260, lowpass:1400, stereoWidth:0.20, pan:-0.18 });
  playTone(120, 0.50, 'sine', 0.05, 0, { trim:0.88, lowpass:900, stereoWidth:0.12, pan:0.16 });
}
function sndPhase() {
  playTone(600, 0.12, 'sine', 0.065, 0, { duck:0.90, duckMs:150, lowpass:2600, stereoWidth:0.18, pan:-0.14 });
  setTimeout(()=>playTone(800, 0.12, 'sine', 0.06, 0, { trim:0.94, lowpass:3000, stereoWidth:0.18, pan:0.14 }), 95);
  setTimeout(()=>playTone(1000, 0.16, 'triangle', 0.05, 0, { trim:0.92, lowpass:3400, stereoWidth:0.24, pan:0 }), 190);
}
function sndRecord() {
  [0,100,200,300].forEach((d,i)=>setTimeout(()=>playTone(500+i*150, 0.18, 'sine', 0.075, 0, {
    duck:i===0?0.82:0.88,
    duckMs:180,
    lowpass:3200,
    trim:0.92,
    stereoWidth:0.24,
    pan:(i%2===0?-0.16:0.16)
  }), d));
}

// ============ UTILS ============
function dist(x1,y1,x2,y2){return Math.sqrt((x2-x1)**2+(y2-y1)**2)}
function rand(a,b){return a+Math.random()*(b-a)}
function clamp(v,mn,mx){return Math.max(mn,Math.min(mx,v))}
function lerpColor(a,b,t){
  const ah=parseInt(a.slice(1),16),bh=parseInt(b.slice(1),16);
  const ar=(ah>>16)&255,ag=(ah>>8)&255,ab=ah&255;
  const br=(bh>>16)&255,bg=(bh>>8)&255,bb=bh&255;
  const r=Math.round(ar+(br-ar)*t),g=Math.round(ag+(bg-ag)*t),bl=Math.round(ab+(bb-ab)*t);
  return `rgb(${r},${g},${bl})`;
}

// ============ STATE ============
const ST={MENU:0,PLAY:1,DEAD:2,PAUSE:3};
let state=ST.MENU;
let score=0, best=0, newRec=false;
let menuT=0, deathT=0, shakeT=0, shakeA=0, flashA=0;
let phaseMsg='', phaseMsgT=0;
let combo=0, maxCombo=0, comboTimer=0;
let totalGames=0;
let lastCaptureTime=0;
let tutorialStep=0;
let tutorialT=0;
let muted=false;
let musicVol=0.5;      // legado
let menuMusicVol=0.45; // 0-1
let gameMusicVol=0.80; // 0-1
let sfxVol=0.8;        // 0-1
let vibrationOn=true;
let goldFlashT=0;
let goldZoomT=0;
let selectedSkin='default';
let selectedBg='space';
let unlockedSkins=['default'];
let unlockedBgs=['space'];
let totalGoldCaptured=0;
let menuScreen='loading'; // starts loading, then login or main
let zenMode=false;
let zenUnlocked=false;
// Stats
let totalScoreEver=0;
let totalNodesEver=0;
let bestComboEver=0;
let highestPhase=1;
// Achievements
let achievements=[];
let pendingAchievements=[];
// Power-ups
let powerups=[]; // floating powerups in world
let activeShield=false;
let slowMoTimer=0;
let magnetTimer=0;
let powerupSpawnTimer=0;
