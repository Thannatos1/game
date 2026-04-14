// ============ ACHIEVEMENTS ============
const ACHIEVEMENTS = {
  first_gold:    {name:'Primeiro Dourado',desc:'Capture seu primeiro nó dourado',icon:'⭐'},
  combo_5:       {name:'Combo Iniciante',desc:'Faça um combo x5',icon:'🔥'},
  combo_10:      {name:'Combo Mestre',desc:'Faça um combo x10',icon:'💥'},
  score_50:      {name:'Estrelinha',desc:'Alcance 50 pontos',icon:'✨'},
  score_100:     {name:'Astronauta',desc:'Alcance 100 pontos',icon:'🚀'},
  score_200:     {name:'Lenda',desc:'Alcance 200 pontos',icon:'🌟'},
  phase_5:       {name:'Sobrevivente',desc:'Chegue à fase 5',icon:'🛡'},
  games_10:      {name:'Persistente',desc:'Jogue 10 partidas',icon:'🎮'},
  games_50:      {name:'Veterano',desc:'Jogue 50 partidas',icon:'🏆'},
  golds_10:      {name:'Caçador de Ouro',desc:'Capture 10 nós dourados',icon:'💰'},
  zen_unlocked:  {name:'Mente Calma',desc:'Desbloqueie o Modo Zen',icon:'☯'},
  legendary_owner:{name:'Lendário',desc:'Desbloqueie uma skin lendária',icon:'🔥'},
  stellar_owner: {name:'Estelar',desc:'Desbloqueie uma skin estelar',icon:'💫'},
};

function getAchievementStatus(){
  return {
    first_gold: totalGoldCaptured>=1,
    combo_5: bestComboEver>=5,
    combo_10: bestComboEver>=10,
    score_50: best>=50,
    score_100: best>=100,
    score_200: best>=200,
    phase_5: highestPhase>=5,
    games_10: totalGames>=10,
    games_50: totalGames>=50,
    golds_10: totalGoldCaptured>=10,
    zen_unlocked: zenUnlocked,
    legendary_owner: unlockedSkins.some(k=>SKINS[k]&&SKINS[k].rarity==='legendary'),
    stellar_owner: unlockedSkins.some(k=>SKINS[k]&&SKINS[k].rarity==='stellar'),
  };
}

function checkAchievements(){
  const status=getAchievementStatus();
  const newOnes=[];
  for(const k in ACHIEVEMENTS){
    if(!achievements.includes(k) && status[k]){
      achievements.push(k);
      newOnes.push({type:'achievement',key:k,data:ACHIEVEMENTS[k]});
    }
  }
  return newOnes;
}

// ============ SKINS ============
const SKINS = {
  // COMUNS - só cor
  default:    {rarity:'common',name:'Padrão',unlock:0,color:'#ffffff',color2:'#b0b0d0',trail:'#ffffff'},
  azul:       {rarity:'common',name:'Azul',unlock:5,color:'#70a1ff',color2:'#3a6dd0',trail:'#70a1ff'},
  verde:      {rarity:'common',name:'Verde',unlock:10,color:'#7bed9f',color2:'#2ed573',trail:'#7bed9f'},
  rosa:       {rarity:'common',name:'Rosa',unlock:20,color:'#ff6b9d',color2:'#d04575',trail:'#ff6b9d'},
  roxo:       {rarity:'common',name:'Roxo',unlock:30,color:'#c084fc',color2:'#7c3aed',trail:'#c084fc'},

  // RARAS - cor + acessórios simples
  cartola:    {rarity:'rare',name:'Cartola',unlock:50,color:'#ffd700',color2:'#b8860b',accessory:'tophat',trail:'#ffd700'},
  oculos:     {rarity:'rare',name:'Óculos',unlock:75,color:'#5dade2',color2:'#2874a6',accessory:'glasses',trail:'#5dade2'},
  bone:       {rarity:'rare',name:'Boné',unlock:100,color:'#ff7f50',color2:'#cd5c25',accessory:'cap',trail:'#ff7f50'},
  coroa:      {rarity:'rare',name:'Coroa',unlock:150,color:'#f4d03f',color2:'#b7950b',accessory:'crown',trail:'#f4d03f'},

  // LENDÁRIAS - cores brilhantes + trails especiais
  fenix:      {rarity:'legendary',name:'Fênix',unlock:250,color:'#ff4500',color2:'#ff8c00',accessory:'flames',glow:'#ff6b00',trail:'fire'},
  gelo:       {rarity:'legendary',name:'Gelo Eterno',unlock:400,color:'#00ffff',color2:'#0080ff',accessory:'iceShards',glow:'#80ffff',trail:'ice'},
  dourado:    {rarity:'legendary',name:'Rei Dourado',unlock:600,color:'#ffd700',color2:'#ffaa00',accessory:'royalCrown',glow:'#fff080',trail:'gold'},

  // ESTELARES - extravagantes com trails únicos
  cavaleiro:  {rarity:'stellar',name:'Cavaleiro',unlock:1000,color:'#a0a0c0',color2:'#505070',accessory:'helmet',glow:'#ccccdd',trail:'metal'},
  caveira:    {rarity:'stellar',name:'Reaper',unlock:1500,color:'#1a1a2e',color2:'#0a0a18',accessory:'skull',glow:'#7a00ff',trail:'ghost'},
  demonio:    {rarity:'stellar',name:'Demônio',unlock:2000,color:'#8b0000',color2:'#400000',accessory:'horns',glow:'#ff0000',trail:'hellfire'},
  cosmico:    {rarity:'stellar',name:'Cósmico',unlock:3000,color:'#4a00ff',color2:'#1a0080',accessory:'galaxy',glow:'#a0a0ff',trail:'stars'},
};

// ============ BACKGROUNDS ============
const BACKGROUNDS = {
  space:            {name:'Espaço',unlock:0,type:'stars'},
  nebula:           {name:'Nebulosa',unlock:30,type:'nebula'},
  galaxy:           {name:'Galáxia',unlock:80,type:'galaxy'},
  blackhole:        {name:'Buraco Negro',unlock:200,type:'blackhole'},
  redgiant:         {name:'Gigante Vermelha',unlock:500,type:'redgiant'},
  cosmic:           {name:'Cósmico',unlock:1000,type:'cosmic'},
  pulsar:           {name:'Pulsar',unlock:1400,type:'pulsar'},
  saturnrings:      {name:'Anéis de Saturno',unlock:1800,type:'saturnrings'},

  // OBRA-PRIMA - desbloqueios por desafio extremo
  astralcathedral:  {
    name:'Catedral Astral',
    type:'astralcathedral',
    masterpiece:true,
    challenge:true,
    challengeShort:'120 + F6 + 8 OUROS',
    challengeText:'Alcance 120 pontos, chegue à fase 6 e capture 8 nós dourados no total.'
  },
  andromedathrone:  {
    name:'Trono de Andrômeda',
    type:'andromedathrone',
    masterpiece:true,
    challenge:true,
    challengeShort:'180 + X12 + 15 OUROS + 7 MISSÕES',
    challengeText:'Alcance 180 pontos, faça combo x12, capture 15 nós dourados e complete 7 missões diárias.'
  },
  cosmicgenesis:    {
    name:'Gênese Cósmica',
    type:'cosmicgenesis',
    masterpiece:true,
    challenge:true,
    challengeShort:'250 + X15 + 25 OUROS + 15 MISSÕES + 10 CONQ.',
    challengeText:'Alcance 250 pontos, faça combo x15, capture 25 nós dourados, complete 15 missões diárias e desbloqueie 10 conquistas.'
  },
};

// ============ MISSÕES / EVENTOS ============
let dailyMissionState = null;
let currentEventState = null;
let missionsCompletedTotal = 0;

const DAILY_MISSION_TEMPLATES = [
  {id:'play_3', icon:'🎯', name:'Piloto do Dia', desc:'Termine 3 partidas hoje', metric:'games_finished', target:3, mode:'count'},
  {id:'score_20', icon:'🚀', name:'Arranque Perfeito', desc:'Faça 20 pontos em uma única run', metric:'best_run_score', target:20, mode:'max'},
  {id:'gold_2', icon:'⭐', name:'Caça ao Ouro', desc:'Capture 2 nós dourados hoje', metric:'gold_captures', target:2, mode:'count'},
  {id:'combo_5', icon:'🔥', name:'Ritmo Orbital', desc:'Faça combo x5 em uma run', metric:'best_run_combo', target:5, mode:'max'},
  {id:'phase_3', icon:'🛡', name:'Avanço Seguro', desc:'Chegue à fase 3 hoje', metric:'best_run_phase', target:3, mode:'max'},
  {id:'powerup_2', icon:'⚡', name:'Energia Extra', desc:'Colete 2 power-ups hoje', metric:'powerups_collected', target:2, mode:'count'},
];

const DAILY_REWARD_POOL = [
  {type:'skin', key:'azul'},
  {type:'skin', key:'verde'},
  {type:'skin', key:'rosa'},
  {type:'skin', key:'roxo'},
  {type:'bg', key:'nebula'},
  {type:'bg', key:'galaxy'},
];

// Load saved data
try {
  const saved = localStorage.getItem('orbita_save');
  if (saved) {
    const d = JSON.parse(saved);
    best = d.best || 0;
    totalGames = d.totalGames || 0;
    muted = d.muted || false;
    selectedSkin = d.selectedSkin || 'default';
    selectedBg = d.selectedBg || 'space';
    unlockedSkins = d.unlockedSkins || ['default'];
    unlockedBgs = d.unlockedBgs || ['space'];
    totalGoldCaptured = d.totalGoldCaptured || 0;
    zenUnlocked = d.zenUnlocked || false;
    totalScoreEver = d.totalScoreEver || 0;
    totalNodesEver = d.totalNodesEver || 0;
    bestComboEver = d.bestComboEver || 0;
    highestPhase = d.highestPhase || 1;
    achievements = d.achievements || [];
    const legacyMusicVol = d.musicVol !== undefined ? d.musicVol : 0.5;
    menuMusicVol = d.menuMusicVol !== undefined ? d.menuMusicVol : legacyMusicVol;
    gameMusicVol = d.gameMusicVol !== undefined ? d.gameMusicVol : legacyMusicVol;
    musicVol = legacyMusicVol;
    sfxVol = d.sfxVol !== undefined ? d.sfxVol : 0.8;
    vibrationOn = d.vibrationOn !== undefined ? d.vibrationOn : true;
    dailyMissionState = d.dailyMissionState || null;
    missionsCompletedTotal = d.missionsCompletedTotal || 0;
  }
} catch(e) {}

function saveData() {
  try {
    localStorage.setItem('orbita_save', JSON.stringify({
      best, totalGames, muted, selectedSkin, selectedBg,
      unlockedSkins, unlockedBgs, totalGoldCaptured, zenUnlocked,
      totalScoreEver, totalNodesEver, bestComboEver, highestPhase,
      achievements, musicVol: menuMusicVol, menuMusicVol, gameMusicVol, sfxVol, vibrationOn,
      dailyMissionState, missionsCompletedTotal
    }));
  } catch(e) {}
}


function isBackgroundChallengeUnlocked(bgKey){
  switch(bgKey){
    case 'astralcathedral':
      return best >= 120 && highestPhase >= 6 && totalGoldCaptured >= 8;
    case 'andromedathrone':
      return best >= 180 && bestComboEver >= 12 && totalGoldCaptured >= 15 && missionsCompletedTotal >= 7;
    case 'cosmicgenesis':
      return best >= 250 && bestComboEver >= 15 && totalGoldCaptured >= 25 && missionsCompletedTotal >= 15 && achievements.length >= 10;
    default:
      return false;
  }
}

function isBackgroundUnlockedByRule(bgKey){
  const bg = BACKGROUNDS[bgKey];
  if(!bg) return false;
  if(bg.challenge) return isBackgroundChallengeUnlocked(bgKey);
  return best >= (bg.unlock || 0);
}

function getBackgroundUnlockLabel(bgKey){
  const bg = BACKGROUNDS[bgKey];
  if(!bg) return '';
  return bg.challengeShort || ((bg.unlock || 0) + ' pts');
}

function checkUnlocks() {
  const newUnlocks = [];
  // Check skin unlocks based on best score
  for (const k in SKINS) {
    if (best >= SKINS[k].unlock && !unlockedSkins.includes(k)) {
      unlockedSkins.push(k);
      newUnlocks.push({type:'skin',key:k,data:SKINS[k]});
    }
  }
  for (const k in BACKGROUNDS) {
    if (isBackgroundUnlockedByRule(k) && !unlockedBgs.includes(k)) {
      unlockedBgs.push(k);
      newUnlocks.push({type:'bg',key:k,data:BACKGROUNDS[k]});
    }
  }
  // Zen mode unlock
  if (best >= 100 && !zenUnlocked) {
    zenUnlocked = true;
    newUnlocks.push({type:'mode',key:'zen',data:{name:'Modo Zen',desc:'Sem fim, sem pressa'}});
  }
  saveData();
  return newUnlocks;
}
checkUnlocks();

let pendingUnlocks = [];

function getLocalDayKey(date){
  const d = date || new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}

function hashString(str){
  let h = 2166136261 >>> 0;
  for(let i=0;i<str.length;i++){
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function getMissionTemplateById(id){
  return DAILY_MISSION_TEMPLATES.find(m=>m.id===id) || DAILY_MISSION_TEMPLATES[0];
}

function getMissionTemplateForDay(dayKey){
  const idx = hashString(dayKey + '_mission') % DAILY_MISSION_TEMPLATES.length;
  return DAILY_MISSION_TEMPLATES[idx];
}

function getEventForDay(dayKey){
  const d = new Date(dayKey + 'T12:00:00');
  const dow = d.getDay();
  if(dow===5 || dow===6 || dow===0){
    return {id:'gold_rush', icon:'🌟', name:'Corrida do Ouro', desc:'Nós dourados valem +1 ponto', color:'#ffd32a'};
  }
  if(dow===2 || dow===3){
    return {id:'combo_fever', icon:'🔥', name:'Febre de Combo', desc:'Combo dura +0.5s', color:'#00f5d4'};
  }
  if(dow===4){
    return {id:'power_surge', icon:'⚡', name:'Surto de Energia', desc:'Power-ups aparecem mais cedo', color:'#c084fc'};
  }
  return {id:'calm_orbit', icon:'☯', name:'Órbita Calma', desc:'Nós fáceis e médios ficam maiores', color:'#7bed9f'};
}

function buildDailyMissionState(dayKey){
  const tpl = getMissionTemplateForDay(dayKey);
  return {
    dayKey,
    missionId: tpl.id,
    progress: 0,
    completed: false,
    rewarded: false,
  };
}

function ensureDailyMissionState(force){
  const today = getLocalDayKey();
  if(force || !dailyMissionState || dailyMissionState.dayKey !== today){
    dailyMissionState = buildDailyMissionState(today);
  }
  currentEventState = getEventForDay(today);
  return dailyMissionState;
}

ensureDailyMissionState();

function getDailyMissionTemplate(){
  ensureDailyMissionState();
  return getMissionTemplateById(dailyMissionState.missionId);
}

function getActiveEvent(){
  ensureDailyMissionState();
  return currentEventState;
}

function getDailyMissionProgress(){
  ensureDailyMissionState();
  return Number(dailyMissionState.progress || 0);
}

function getDailyMissionProgressText(){
  const tpl = getDailyMissionTemplate();
  const progress = Math.min(getDailyMissionProgress(), tpl.target);
  return `${progress}/${tpl.target}`;
}

function chooseDailyReward(){
  const locked = DAILY_REWARD_POOL.filter(item=>{
    if(item.type==='skin') return !unlockedSkins.includes(item.key) && !!SKINS[item.key];
    if(item.type==='bg') return !unlockedBgs.includes(item.key) && !!BACKGROUNDS[item.key];
    return false;
  });

  if(!locked.length){
    return {type:'mission', key:'daily_complete', data:{name:'Missão diária', desc:'Concluída! Volte amanhã para outra.', icon:'🌠'}};
  }

  const idx = hashString(dailyMissionState.dayKey + '_reward') % locked.length;
  const reward = locked[idx];
  if(reward.type==='skin'){
    unlockedSkins.push(reward.key);
    return {type:'skin', key:reward.key, data:SKINS[reward.key]};
  }
  unlockedBgs.push(reward.key);
  return {type:'bg', key:reward.key, data:BACKGROUNDS[reward.key]};
}

function grantDailyMissionReward(){
  ensureDailyMissionState();
  if(dailyMissionState.rewarded) return null;
  dailyMissionState.rewarded = true;
  missionsCompletedTotal++;
  const reward = chooseDailyReward();
  if(typeof trackEvent==='function'){
    trackEvent('daily_mission_completed', {
      mission_id: dailyMissionState.missionId,
      reward_type: reward.type,
      reward_key: reward.key || null,
    }, {urgent:true});
  }
  saveData();
  return reward;
}

function applyMissionProgress(metric, value){
  ensureDailyMissionState();
  const tpl = getDailyMissionTemplate();
  if(tpl.metric !== metric) return null;
  if(dailyMissionState.rewarded) return null;

  const nextValue = Number(value || 0);
  if(tpl.mode === 'count'){
    dailyMissionState.progress = Math.min(tpl.target, Number(dailyMissionState.progress || 0) + nextValue);
  } else {
    dailyMissionState.progress = Math.max(Number(dailyMissionState.progress || 0), nextValue);
  }

  let reward = null;
  if(!dailyMissionState.completed && Number(dailyMissionState.progress || 0) >= tpl.target){
    dailyMissionState.completed = true;
    reward = grantDailyMissionReward();
  }
  saveData();
  return reward;
}

