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
const MUSIC_BASE_GAIN = 0.90;
let actx = null;
let musicSceneLevel = 0.75;
function getMusicTargetGain(sceneLevel = musicSceneLevel) {
  return muted ? 0 : MUSIC_BASE_GAIN * clamp(sceneLevel, 0, 1) * clamp(musicVol, 0, 1);
}
function initAudio() {
  if (!actx) {
    actx = new AudioCtx();
    initMusic();
  }
  if (actx && actx.state === 'suspended') {
    actx.resume().catch(()=>{});
  }
}

window.addEventListener('pointerdown', () => {
  if (actx && actx.state === 'suspended') actx.resume().catch(()=>{});
}, { passive:true });

// ============ AMBIENT MUSIC ============
let musicGain = null;
let musicNodes = [];
let musicStarted = false;

function initMusic() {
  if (!actx || musicStarted) return;
  musicStarted = true;

  // Master music gain (low volume)
  musicGain = actx.createGain();
  musicGain.gain.value = getMusicTargetGain(0.75);

  // Reverb-like delay for spacious feel
  const delay = actx.createDelay(2);
  delay.delayTime.value = 0.4;
  const delayGain = actx.createGain();
  delayGain.gain.value = 0.3;
  delay.connect(delayGain);
  delayGain.connect(delay);

  // Lowpass filter for warmth
  const filter = actx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 1200;
  filter.Q.value = 1;

  musicGain.connect(filter);
  filter.connect(delay);
  filter.connect(actx.destination);
  delayGain.connect(actx.destination);

  // Chord progression: Am - F - C - G (i - VI - III - VII in A minor, ethereal)
  // Frequencies for A minor chord notes
  const chords = [
    [220.00, 261.63, 329.63], // A minor (A C E)
    [174.61, 220.00, 261.63], // F major (F A C)
    [261.63, 329.63, 392.00], // C major (C E G)
    [196.00, 246.94, 293.66], // G major (G B D)
  ];

  let chordIdx = 0;

  function playChord() {
    if (!actx) return;
    const chord = chords[chordIdx];
    const now = actx.currentTime;
    const dur = 6; // 6 seconds per chord

    chord.forEach((freq, i) => {
      // Two detuned oscillators per note for richness
      [0, 7].forEach(detune => {
        const osc = actx.createOscillator();
        const g = actx.createGain();
        osc.type = i === 0 ? 'sine' : 'triangle';
        osc.frequency.value = freq;
        osc.detune.value = detune;

        // Slow envelope: fade in and out
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.15, now + 1.5);
        g.gain.setValueAtTime(0.15, now + dur - 1.5);
        g.gain.linearRampToValueAtTime(0, now + dur);

        osc.connect(g);
        g.connect(musicGain);
        osc.start(now);
        osc.stop(now + dur);
      });
    });

    // High shimmer note
    const shimmer = actx.createOscillator();
    const sg = actx.createGain();
    shimmer.type = 'sine';
    shimmer.frequency.value = chord[0] * 4;
    sg.gain.setValueAtTime(0, now);
    sg.gain.linearRampToValueAtTime(0.04, now + 2);
    sg.gain.linearRampToValueAtTime(0, now + dur);
    shimmer.connect(sg);
    sg.connect(musicGain);
    shimmer.start(now);
    shimmer.stop(now + dur);

    chordIdx = (chordIdx + 1) % chords.length;
    setTimeout(playChord, (dur - 0.5) * 1000); // overlap chords slightly
  }

  playChord();
}

function setMusicVolume(v) {
  musicSceneLevel = clamp(v, 0, 1);
  if (musicGain && actx) {
    musicGain.gain.linearRampToValueAtTime(getMusicTargetGain(), actx.currentTime + 0.25);
  }
}

function toggleMute() {
  muted = !muted;
  saveData();
  if (musicGain && actx) {
    musicGain.gain.linearRampToValueAtTime(getMusicTargetGain(), actx.currentTime + 0.18);
  }
}

function vibrate(pattern) {
  if (!vibrationOn || !navigator.vibrate) return;
  navigator.vibrate(pattern);
}

function playTone(freq, dur, type, vol, detune) {
  if (!actx || muted || sfxVol<=0) return;
  const o = actx.createOscillator();
  const g = actx.createGain();
  o.type = type || 'sine';
  o.frequency.value = freq;
  if (detune) o.detune.value = detune;
  g.gain.setValueAtTime((vol||0.15)*sfxVol, actx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + dur);
  o.connect(g); g.connect(actx.destination);
  o.start(); o.stop(actx.currentTime + dur);
}

function sndRelease() { playTone(300, 0.15, 'sine', 0.1); playTone(450, 0.1, 'triangle', 0.05); }
function sndCapture(pts, combo) {
  const base = 400 + combo * 40;
  playTone(base, 0.2, 'sine', 0.12);
  playTone(base * 1.5, 0.15, 'triangle', 0.06);
  if (pts >= 3) { setTimeout(()=>playTone(base*2, 0.2, 'sine', 0.08), 60); }
  if (pts >= 5) { setTimeout(()=>playTone(base*2.5, 0.25, 'triangle', 0.1), 120); }
}
function sndDie() {
  playTone(200, 0.4, 'sawtooth', 0.1);
  playTone(120, 0.6, 'sine', 0.08);
}
function sndPhase() {
  playTone(600, 0.15, 'sine', 0.1);
  setTimeout(()=>playTone(800, 0.15, 'sine', 0.1), 100);
  setTimeout(()=>playTone(1000, 0.2, 'triangle', 0.08), 200);
}
function sndRecord() {
  [0,100,200,300].forEach((d,i)=>setTimeout(()=>playTone(500+i*150,0.2,'sine',0.1),d));
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
let musicVol=0.5;  // 0-1
let sfxVol=0.8;    // 0-1
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
