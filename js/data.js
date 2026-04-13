export const SUPABASE_URL = 'https://poedjpfrwpdsdjjjduow.supabase.co';
export const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJz...';

export const ST = { MENU: 0, PLAY: 1, DEAD: 2, PAUSE: 3 };
export const BALL_R = 10;
export const NODE_R = 12;
export const ORBIT_R_MIN = 36;
export const ORBIT_R_MAX = 52;

export const TIERS = {
  easy:   { color: { main: '#2ed573', glow: '#20bf55', light: '#7bed9f' }, pts: 1, label: '+1', distMul: 1.0, sizeMul: 1.15 },
  medium: { color: { main: '#70a1ff', glow: '#1e90ff', light: '#90b8ff' }, pts: 2, label: '+2', distMul: 1.1, sizeMul: 1.0 },
  hard:   { color: { main: '#ff4757', glow: '#e03050', light: '#ff6b7a' }, pts: 3, label: '+3', distMul: 1.55, sizeMul: 0.8 },
  gold:   { color: { main: '#ffd32a', glow: '#f0c000', light: '#ffe066' }, pts: 5, label: '+5', distMul: 1.75, sizeMul: 0.7 },
};

export const SKINS = {
  default: { rarity: 'common', name: 'Padrão', unlock: 0, color: '#ffffff', color2: '#b0b0d0', trail: '#ffffff' },
  azul:    { rarity: 'common', name: 'Azul', unlock: 5, color: '#70a1ff', color2: '#3a6dd0', trail: '#70a1ff' },
  verde:   { rarity: 'common', name: 'Verde', unlock: 10, color: '#7bed9f', color2: '#2ed573', trail: '#7bed9f' },
  rosa:    { rarity: 'common', name: 'Rosa', unlock: 20, color: '#ff6b9d', color2: '#d04575', trail: '#ff6b9d' },
  roxo:    { rarity: 'common', name: 'Roxo', unlock: 30, color: '#c084fc', color2: '#7c3aed', trail: '#c084fc' },
  cartola: { rarity: 'rare', name: 'Cartola', unlock: 50, color: '#ffd700', color2: '#b8860b', accessory: 'tophat', trail: '#ffd700' },
  oculos:  { rarity: 'rare', name: 'Óculos', unlock: 75, color: '#5dade2', color2: '#2874a6', accessory: 'glasses', trail: '#5dade2' },
  bone:    { rarity: 'rare', name: 'Boné', unlock: 100, color: '#ff7f50', color2: '#cd5c25', accessory: 'cap', trail: '#ff7f50' },
  coroa:   { rarity: 'rare', name: 'Coroa', unlock: 150, color: '#f4d03f', color2: '#b7950b', accessory: 'crown', trail: '#f4d03f' },
  fenix:   { rarity: 'legendary', name: 'Fênix', unlock: 250, color: '#ff4500', color2: '#ff8c00', accessory: 'flames', glow: '#ff6b00', trail: 'fire' },
  gelo:    { rarity: 'legendary', name: 'Gelo Eterno', unlock: 400, color: '#00ffff', color2: '#0080ff', accessory: 'iceShards', glow: '#80ffff', trail: 'ice' },
  dourado: { rarity: 'legendary', name: 'Rei Dourado', unlock: 600, color: '#ffd700', color2: '#ffaa00', accessory: 'royalCrown', glow: '#fff080', trail: 'gold' },
  cavaleiro: { rarity: 'stellar', name: 'Cavaleiro', unlock: 1000, color: '#a0a0c0', color2: '#505070', accessory: 'helmet', glow: '#ccccdd', trail: 'metal' },
  caveira:   { rarity: 'stellar', name: 'Reaper', unlock: 1500, color: '#1a1a2e', color2: '#0a0a18', accessory: 'skull', glow: '#7a00ff', trail: 'ghost' },
  demonio:   { rarity: 'stellar', name: 'Demônio', unlock: 2000, color: '#8b0000', color2: '#400000', accessory: 'horns', glow: '#ff0000', trail: 'hellfire' },
  cosmico:   { rarity: 'stellar', name: 'Cósmico', unlock: 3000, color: '#4a00ff', color2: '#1a0080', accessory: 'galaxy', glow: '#a0a0ff', trail: 'stars' },
};

export const BACKGROUNDS = {
  space: { name: 'Espaço', unlock: 0, type: 'stars' },
  nebula: { name: 'Nebulosa', unlock: 30, type: 'nebula' },
  galaxy: { name: 'Galáxia', unlock: 80, type: 'galaxy' },
  blackhole: { name: 'Buraco Negro', unlock: 200, type: 'blackhole' },
  redgiant: { name: 'Gigante Vermelha', unlock: 500, type: 'redgiant' },
  cosmic: { name: 'Cósmico', unlock: 1000, type: 'cosmic' },
};

export const ACHIEVEMENTS = {
  first_gold: { name: 'Primeiro Dourado', desc: 'Capture seu primeiro nó dourado', icon: '⭐' },
  combo_5: { name: 'Combo Iniciante', desc: 'Faça um combo x5', icon: '🔥' },
  combo_10: { name: 'Combo Mestre', desc: 'Faça um combo x10', icon: '💥' },
  score_50: { name: 'Estrelinha', desc: 'Alcance 50 pontos', icon: '✨' },
  score_100: { name: 'Astronauta', desc: 'Alcance 100 pontos', icon: '🚀' },
  score_200: { name: 'Lenda', desc: 'Alcance 200 pontos', icon: '🌟' },
  phase_5: { name: 'Sobrevivente', desc: 'Chegue à fase 5', icon: '🛡' },
  games_10: { name: 'Persistente', desc: 'Jogue 10 partidas', icon: '🎮' },
  games_50: { name: 'Veterano', desc: 'Jogue 50 partidas', icon: '🏆' },
  golds_10: { name: 'Caçador de Ouro', desc: 'Capture 10 nós dourados', icon: '💰' },
  zen_unlocked: { name: 'Mente Calma', desc: 'Desbloqueie o Modo Zen', icon: '☯' },
  legendary_owner: { name: 'Lendário', desc: 'Desbloqueie uma skin lendária', icon: '🔥' },
  stellar_owner: { name: 'Estelar', desc: 'Desbloqueie uma skin estelar', icon: '💫' },
};
