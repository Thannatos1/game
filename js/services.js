import { SUPABASE_URL, SUPABASE_KEY } from './data.js';

export function createServices() {
  let sb = null;
  try {
    if (window.supabase?.createClient) {
      sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }
  } catch (e) {
    console.error('Supabase init failed', e);
  }

  async function signInWithGoogle() {
    if (!sb) return;
    return sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + window.location.pathname },
    });
  }

  async function signOut() {
    if (!sb) return;
    return sb.auth.signOut();
  }

  async function getSession() {
    if (!sb) return null;
    const { data } = await sb.auth.getSession();
    return data?.session ?? null;
  }

  async function loadProfile(userId) {
    if (!sb || !userId) return null;
    const { data, error } = await sb.from('profiles').select('name').eq('id', userId).maybeSingle();
    if (error) throw error;
    return data;
  }

  async function checkNicknameAvailable(name) {
    if (!sb) return false;
    const { data, error } = await sb.from('profiles').select('name').eq('name', name).maybeSingle();
    if (error) throw error;
    return !data;
  }

  async function saveNickname(userId, name) {
    if (!sb || !userId) return false;
    const { error } = await sb.from('profiles').upsert({ id: userId, name });
    if (error) throw error;
    return true;
  }

  async function submitScore({ userId, playerName, score, skin }) {
    if (!sb || !userId || !playerName) return false;
    const { data: existing } = await sb.from('rankings').select('id, score').eq('user_id', userId).maybeSingle();
    if (existing) {
      if (score > existing.score) {
        await sb.from('rankings').update({ score, skin, name: playerName }).eq('id', existing.id);
      }
    } else {
      await sb.from('rankings').insert({ user_id: userId, name: playerName, score, skin });
    }
    return true;
  }

  async function loadRankings(limit = 50) {
    if (!sb) return [];
    const { data, error } = await sb.from('rankings').select('name, score, skin, user_id').order('score', { ascending: false }).limit(limit);
    if (error) throw error;
    return data || [];
  }

  return { sb, signInWithGoogle, signOut, getSession, loadProfile, checkNicknameAvailable, saveNickname, submitScore, loadRankings };
}
