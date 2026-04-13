// ============ SUPABASE / AUTH / GLOBAL RANKING ============
const SUPABASE_URL = 'https://poedjpfrwpdsdjjjduow.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvZWRqcGZyd3Bkc2RqampkdW93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMTgyNTksImV4cCI6MjA5MTU5NDI1OX0.6D0p4m9QPBPSlICDEMb2Y8umJpETbQ3FpInfwmpN-9o';

let sb = null;
function initSupabase() {
  if (sb) return sb;
  if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
    try {
      sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      console.log('[Orbita] Supabase client created');
    } catch(e) {
      console.error('[Orbita] Supabase init failed', e);
    }
  } else {
    console.warn('[Orbita] Supabase SDK not available yet');
  }
  return sb;
}
initSupabase();

// Auth state
let currentUser = null;
let playerName = '';
let authLoading = true;
let needsNickname = false;
let nicknameBuffer = '';
let nicknameError = '';
let nicknameChecking = false;

// Ranking state
let rankings = [];
let rankingsLoading = false;
let rankingsError = '';
let userPosition = -1;
let lastSubmittedScore = 0;

// Initialize auth on load
async function initAuth() {
  // Try to initialize Supabase if not yet done
  if (!sb) initSupabase();

  console.log('[Orbita] initAuth starting. SDK available:', !!sb);

  if (!sb) {
    console.warn('[Orbita] No Supabase SDK - offline mode');
    authLoading = false;
    menuScreen = 'main';
    return;
  }

  // Safety timeout - if auth check takes more than 5 seconds, go to main
  const timeoutId = setTimeout(() => {
    console.warn('[Orbita] Auth check timeout');
    if (authLoading) {
      authLoading = false;
      menuScreen = 'main';
    }
  }, 5000);

  try {
    const { data: { session } } = await sb.auth.getSession();
    console.log('[Orbita] Session:', !!session);
    if (session && session.user) {
      currentUser = session.user;
      await loadProfile();
      console.log('[Orbita] Profile loaded. playerName:', playerName, 'needsNickname:', needsNickname);
      if (playerName && !needsNickname) {
        menuScreen = 'main';
      } else {
        menuScreen = 'nickname';
      }
    } else {
      menuScreen = 'main';
    }
  } catch(e) {
    console.error('[Orbita] Auth init failed', e);
    menuScreen = 'main';
  }
  clearTimeout(timeoutId);
  authLoading = false;
  console.log('[Orbita] initAuth done. Screen:', menuScreen);
}

async function loadProfile() {
  if (!sb || !currentUser) return;
  try {
    const { data, error } = await sb
      .from('profiles')
      .select('name')
      .eq('id', currentUser.id)
      .maybeSingle();
    if (error) throw error;
    if (data && data.name) {
      playerName = data.name;
      needsNickname = false;
    } else {
      needsNickname = true;
    }
  } catch(e) {
    console.error('Load profile failed', e);
  }
}

async function signInWithGoogle() {
  if (!sb) return;
  try {
    await sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + window.location.pathname }
    });
  } catch(e) { console.error('Sign in failed', e); }
}

async function signOut() {
  if (!sb) return;
  try {
    await sb.auth.signOut();
    currentUser = null;
    playerName = '';
    needsNickname = false;
    menuScreen = 'main';
  } catch(e) { console.error('Sign out failed', e); }
}

async function checkNicknameAvailable(name) {
  if (!sb) return false;
  try {
    const { data, error } = await sb
      .from('profiles')
      .select('name')
      .eq('name', name)
      .maybeSingle();
    if (error) throw error;
    return !data; // available if no result
  } catch(e) {
    console.error('Check failed', e);
    return false;
  }
}

async function saveNickname(name) {
  if (!sb || !currentUser) return false;
  try {
    const { error } = await sb
      .from('profiles')
      .upsert({ id: currentUser.id, name: name });
    if (error) throw error;
    playerName = name;
    needsNickname = false;
    return true;
  } catch(e) {
    console.error('Save nickname failed', e);
    return false;
  }
}

async function submitScore(score, skin) {
  if (!sb || !currentUser || !playerName) return false;
  try {
    // Check if user has existing entry
    const { data: existing } = await sb
      .from('rankings')
      .select('id, score')
      .eq('user_id', currentUser.id)
      .maybeSingle();

    if (existing) {
      // Only update if new score is higher
      if (score > existing.score) {
        await sb.from('rankings')
          .update({ score, skin, name: playerName })
          .eq('id', existing.id);
      }
    } else {
      await sb.from('rankings').insert({
        user_id: currentUser.id,
        name: playerName,
        score,
        skin
      });
    }
    return true;
  } catch(e) {
    console.error('Submit failed', e);
    return false;
  }
}

async function loadRankings() {
  if (!sb) { rankingsError='Sem conexão'; return; }
  rankingsLoading = true;
  rankingsError = '';
  try {
    const { data, error } = await sb
      .from('rankings')
      .select('name, score, skin, user_id')
      .order('score', { ascending: false })
      .limit(50);
    if (error) throw error;
    rankings = data || [];
    userPosition = -1;
    if (currentUser) {
      for (let i=0; i<rankings.length; i++) {
        if (rankings[i].user_id === currentUser.id) {
          userPosition = i;
          break;
        }
      }
    }
  } catch(e) {
    rankingsError = 'Erro ao carregar';
    console.error('Load failed', e);
  }
  rankingsLoading = false;
}

async function deleteAccount() {
  if (!sb || !currentUser) return false;
  try {
    // Delete ranking entry
    await sb.from('rankings').delete().eq('user_id', currentUser.id);
    // Delete profile
    await sb.from('profiles').delete().eq('id', currentUser.id);
    // Sign out (actual user deletion requires admin, but this effectively removes their presence)
    await sb.auth.signOut();
    // Clear local storage
    try { localStorage.removeItem('orbita_save'); } catch(e) {}
    // Reset all local state
    currentUser = null;
    playerName = '';
    needsNickname = false;
    best = 0;
    totalGames = 0;
    totalScoreEver = 0;
    totalNodesEver = 0;
    bestComboEver = 0;
    highestPhase = 1;
    totalGoldCaptured = 0;
    achievements = [];
    unlockedSkins = ['default'];
    unlockedBgs = ['space'];
    zenUnlocked = false;
    selectedSkin = 'default';
    selectedBg = 'space';
    menuScreen = 'login';
    return true;
  } catch(e) {
    console.error('Delete account failed', e);
    return false;
  }
}

function resetLocalProgress() {
  try { localStorage.removeItem('orbita_save'); } catch(e) {}
  best = 0;
  totalGames = 0;
  totalScoreEver = 0;
  totalNodesEver = 0;
  bestComboEver = 0;
  highestPhase = 1;
  totalGoldCaptured = 0;
  achievements = [];
  unlockedSkins = ['default'];
  unlockedBgs = ['space'];
  zenUnlocked = false;
  selectedSkin = 'default';
  selectedBg = 'space';
  // Keep sound/vibration prefs
  saveData();
}

async function changeNickname(newName) {
  if (!sb || !currentUser) return {ok:false, error:'Não logado'};
  const available = await checkNicknameAvailable(newName);
  if (!available) return {ok:false, error:'Apelido já em uso!'};
  try {
    await sb.from('profiles').update({name: newName}).eq('id', currentUser.id);
    // Also update the rankings entry
    await sb.from('rankings').update({name: newName}).eq('user_id', currentUser.id);
    playerName = newName;
    return {ok:true};
  } catch(e) {
    console.error('Change nickname failed', e);
    return {ok:false, error:'Erro ao salvar'};
  }
}

// Listen to auth state changes
if (sb) {
  sb.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session) {
      currentUser = session.user;
      await loadProfile();
      // Redirect based on profile state
      if (playerName && !needsNickname) {
        menuScreen = 'main';
      } else {
        menuScreen = 'nickname';
      }
    } else if (event === 'SIGNED_OUT') {
      currentUser = null;
      playerName = '';
      needsNickname = false;
      menuScreen = 'login';
    }
  });
}

// Wait for DOM and SDK before initializing auth
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initAuth, 100);
  });
} else {
  setTimeout(initAuth, 100);
}
