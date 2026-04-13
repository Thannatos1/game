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
let nicknameStatusText = '';

// Ranking state
let rankings = [];
let rankingsLoading = false;
let rankingsError = '';
let userPosition = -1;
let lastSubmittedScore = 0;


// Analytics
const ANALYTICS_QUEUE_KEY = 'orbita_analytics_queue';
const ANALYTICS_SESSION_KEY = 'orbita_analytics_session_id';
let analyticsQueue = [];
let analyticsFlushTimer = null;
let analyticsSending = false;
let analyticsSessionId = null;

function getAnalyticsSessionId() {
  if (analyticsSessionId) return analyticsSessionId;
  try {
    analyticsSessionId = sessionStorage.getItem(ANALYTICS_SESSION_KEY);
    if (!analyticsSessionId) {
      analyticsSessionId = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : ('sess_' + Date.now() + '_' + Math.random().toString(16).slice(2));
      sessionStorage.setItem(ANALYTICS_SESSION_KEY, analyticsSessionId);
    }
  } catch (e) {
    analyticsSessionId = 'sess_' + Date.now() + '_' + Math.random().toString(16).slice(2);
  }
  return analyticsSessionId;
}

function loadAnalyticsQueue() {
  try {
    const raw = localStorage.getItem(ANALYTICS_QUEUE_KEY);
    analyticsQueue = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(analyticsQueue)) analyticsQueue = [];
  } catch (e) {
    analyticsQueue = [];
  }
}

function persistAnalyticsQueue() {
  try {
    localStorage.setItem(ANALYTICS_QUEUE_KEY, JSON.stringify(analyticsQueue.slice(-200)));
  } catch (e) {}
}

function sanitizeAnalyticsValue(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.slice(0, 120);
  if (Array.isArray(value)) return value.slice(0, 20).map(sanitizeAnalyticsValue);
  if (typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value).slice(0, 24)) {
      out[k] = sanitizeAnalyticsValue(v);
    }
    return out;
  }
  return String(value).slice(0, 120);
}

function trackEvent(eventName, payload = {}, opts = {}) {
  if (!eventName) return;
  const evt = {
    session_id: getAnalyticsSessionId(),
    event_name: String(eventName).slice(0, 64),
    payload: sanitizeAnalyticsValue(payload || {}),
    client_ts: new Date().toISOString(),
  };
  analyticsQueue.push(evt);
  if (analyticsQueue.length > 200) analyticsQueue = analyticsQueue.slice(-200);
  persistAnalyticsQueue();
  scheduleAnalyticsFlush(opts.urgent ? 250 : 1500);
}

function scheduleAnalyticsFlush(delay = 1500) {
  if (analyticsFlushTimer) return;
  analyticsFlushTimer = setTimeout(() => {
    analyticsFlushTimer = null;
    flushAnalyticsQueue();
  }, delay);
}

async function flushAnalyticsQueue(force = false) {
  if (analyticsSending) return false;
  if (!analyticsQueue.length) return true;
  if (!sb) initSupabase();
  if (!sb) return false;

  const batch = analyticsQueue.slice(0, force ? 100 : 25);
  analyticsSending = true;
  try {
    const { error } = await sb.rpc('log_analytics_events', { p_events: batch });
    if (error) throw error;
    analyticsQueue.splice(0, batch.length);
    persistAnalyticsQueue();
    if (analyticsQueue.length) scheduleAnalyticsFlush(400);
    return true;
  } catch (e) {
    console.warn('[Orbita] analytics flush failed', e);
    return false;
  } finally {
    analyticsSending = false;
  }
}

loadAnalyticsQueue();

// Initialize auth on load
async function initAuth() {
  if (!sb) initSupabase();

  console.log('[Orbita] initAuth starting. SDK available:', !!sb);

  if (!sb) {
    console.warn('[Orbita] No Supabase SDK - offline mode');
    authLoading = false;
    menuScreen = 'main';
    return;
  }

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
      trackEvent('auth_signed_in', { has_nickname: !!playerName });
      scheduleAnalyticsFlush(400);
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
  trackEvent('app_open', { screen: menuScreen, has_session: !!currentUser });
  scheduleAnalyticsFlush(600);
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
      playerName = String(data.name);
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
    trackEvent('auth_sign_in_click', { screen: menuScreen || 'unknown' });
    await sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + window.location.pathname }
    });
  } catch(e) {
    console.error('Sign in failed', e);
  }
}

async function signOut() {
  if (!sb) return;
  try {
    trackEvent('auth_sign_out', { screen: menuScreen || 'unknown' });
    await sb.auth.signOut();
    currentUser = null;
    playerName = '';
    needsNickname = false;
    menuScreen = 'main';
  } catch(e) {
    console.error('Sign out failed', e);
  }
}

function normalizeNickname(name) {
  return String(name || '').trim().toUpperCase();
}

function getRpcNicknameError(e) {
  const msg = String(e?.message || e?.details || '').toLowerCase();
  if (msg.includes('nickname already in use')) return 'Apelido já em uso!';
  if (msg.includes('invalid nickname')) return 'Use 3 a 16 letras ou números';
  if (msg.includes('not authenticated')) return 'Faça login para salvar';
  return 'Erro ao salvar';
}

function getRpcScoreError(e) {
  const msg = String(e?.message || e?.details || '').toLowerCase();
  if (msg.includes('profile without nickname')) return 'Defina um apelido antes de enviar score';
  if (msg.includes('not authenticated')) return 'Login necessário para ranking';
  return 'Erro ao enviar score';
}

async function setNicknameViaRpc(name) {
  if (!sb || !currentUser) {
    return { ok: false, error: 'Não logado' };
  }

  const cleanName = normalizeNickname(name);
  if (!/^[A-Z0-9]{3,16}$/.test(cleanName)) {
    return { ok: false, error: 'Use 3 a 16 letras ou números' };
  }

  try {
    const { data, error } = await sb.rpc('set_nickname', { p_name: cleanName });
    if (error) throw error;
    const finalName = String(data?.name || cleanName);
    playerName = finalName;
    needsNickname = false;
    nicknameError = '';
    nicknameStatusText = '';
    trackEvent('nickname_set', { name_len: finalName.length });
    return { ok: true, name: finalName };
  } catch (e) {
    console.error('set_nickname failed', e);
    return { ok: false, error: getRpcNicknameError(e) };
  }
}

async function saveNickname(name) {
  const result = await setNicknameViaRpc(name);
  if (!result.ok) {
    nicknameError = result.error;
    return false;
  }
  return true;
}

async function submitScore(score, skin) {
  if (!sb || !currentUser || !playerName) return false;
  try {
    const { data, error } = await sb.rpc('submit_score', {
      p_score: score,
      p_skin: skin
    });
    if (error) throw error;
    if (data?.stored !== undefined) {
      lastSubmittedScore = Math.max(lastSubmittedScore, Number(data.stored) || 0);
    }
    trackEvent('score_submitted', { submitted: score, stored: Number(data?.stored || score), new_record: !!data?.new_record, skin: skin || null });
    return true;
  } catch(e) {
    console.error('submit_score failed', e);
    const friendly = getRpcScoreError(e);
    if (friendly === 'Defina um apelido antes de enviar score') {
      needsNickname = true;
    }
    return false;
  }
}

async function loadRankings() {
  if (!sb) {
    rankingsError = 'Sem conexão';
    return;
  }
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
      for (let i = 0; i < rankings.length; i++) {
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
  console.warn('deleteAccount requires a dedicated backend function; current SQL locks direct deletes.');
  return false;
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
  saveData();
}

async function changeNickname(newName) {
  const result = await setNicknameViaRpc(newName);
  if (!result.ok) {
    return { ok: false, error: result.error };
  }
  return { ok: true };
}

if (sb) {
  sb.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session) {
      currentUser = session.user;
      await loadProfile();
      if (playerName && !needsNickname) {
        menuScreen = 'main';
      } else {
        menuScreen = 'nickname';
      }
      trackEvent('auth_signed_in', { has_nickname: !!playerName });
      scheduleAnalyticsFlush(400);
    } else if (event === 'SIGNED_OUT') {
      currentUser = null;
      playerName = '';
      needsNickname = false;
      menuScreen = 'login';
      trackEvent('auth_signed_out', {});
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initAuth, 100);
  });
} else {
  setTimeout(initAuth, 100);
}


document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    flushAnalyticsQueue(true);
  } else if (analyticsQueue.length) {
    scheduleAnalyticsFlush(500);
  }
});

window.addEventListener('beforeunload', () => {
  persistAnalyticsQueue();
});
