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
  space:    {name:'Espaço',unlock:0,type:'stars'},
  nebula:   {name:'Nebulosa',unlock:30,type:'nebula'},
  galaxy:   {name:'Galáxia',unlock:80,type:'galaxy'},
  blackhole:{name:'Buraco Negro',unlock:200,type:'blackhole'},
  redgiant: {name:'Gigante Vermelha',unlock:500,type:'redgiant'},
  cosmic:   {name:'Cósmico',unlock:1000,type:'cosmic'},
};

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
    musicVol = d.musicVol !== undefined ? d.musicVol : 0.5;
    sfxVol = d.sfxVol !== undefined ? d.sfxVol : 0.8;
    vibrationOn = d.vibrationOn !== undefined ? d.vibrationOn : true;
  }
} catch(e) {}

function saveData() {
  try {
    localStorage.setItem('orbita_save', JSON.stringify({
      best, totalGames, muted, selectedSkin, selectedBg,
      unlockedSkins, unlockedBgs, totalGoldCaptured, zenUnlocked,
      totalScoreEver, totalNodesEver, bestComboEver, highestPhase,
      achievements, musicVol, sfxVol, vibrationOn
    }));
  } catch(e) {}
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
    if (best >= BACKGROUNDS[k].unlock && !unlockedBgs.includes(k)) {
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
