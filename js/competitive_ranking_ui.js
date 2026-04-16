(function(){
  const state = {
    top: [],
    around: [],
    summary: null
  };

  const _origLoadRankings = typeof loadRankings === 'function' ? loadRankings : async function(){ return false; };

  function n(v){ return Number(v || 0) || 0; }
  function fmtRank(v){ return (n(v) > 0) ? ('#' + n(v)) : '--'; }

  function getCompetitiveTier(score){
    score = n(score);
    if (score >= 250) return { name:'LENDÁRIO', color:'#ffd32a' };
    if (score >= 150) return { name:'DIAMANTE', color:'#b9f6ff' };
    if (score >= 90) return { name:'OURO', color:'#ffd32a' };
    if (score >= 45) return { name:'PRATA', color:'#dfe6f0' };
    if (score >= 20) return { name:'BRONZE', color:'#cd7f32' };
    return { name:'INICIANTE', color:'#7bed9f' };
  }

  function rowByRank(list, rank){
    rank = n(rank);
    return Array.isArray(list) ? list.find(r => n(r.rank) === rank) || null : null;
  }

  function uniqueRows(rows){
    const out = [];
    const seen = new Set();
    for (const r of rows || []) {
      const key = String(r.user_id || '') + ':' + String(r.rank || '');
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(r);
    }
    return out;
  }

  function currentUserRank(){ return n(state.summary?.user_rank); }
  function currentUserScore(){ return n(state.summary?.user_score || best || 0); }

  function getDisplayRows(){
    const rank = currentUserRank();
    if (!rank) return [];

    if (rank === 1) {
      return uniqueRows(state.top.filter(r => n(r.rank) > 1).slice(0, 3));
    }

    if (rank <= 3) {
      return uniqueRows((state.around || []).filter(r => n(r.rank) !== rank).sort((a,b)=>n(a.rank)-n(b.rank)));
    }

    return uniqueRows(state.around || []);
  }

  function getDisplayTitle(){
    const rank = currentUserRank();
    if (!rank) return 'PERTO DE VOCÊ';
    if (rank === 1) return 'QUEM ESTÁ TE CAÇANDO';
    if (rank <= 3) return 'RIVAIS DO PÓDIO';
    return 'PERTO DE VOCÊ';
  }

  function getObjectiveState(){
    const rank = currentUserRank();
    const score = currentUserScore();
    const rank2 = rowByRank(state.top, 2);
    const rank3 = rowByRank(state.top, 3);
    const below = rowByRank(getDisplayRows().concat(state.top), rank + 1);
    const nextPts = n(state.summary?.points_to_next);
    const top5Pts = n(state.summary?.points_to_top);
    const nextName = String(state.summary?.next_better_name || 'próximo rival').toUpperCase();

    if (!rank) {
      return {
        right1Label:'PARA ENTRAR',
        right1Value:'+5',
        right1Color:'#00f5d4',
        right2Label:'META INICIAL',
        right2Value:'RANK',
        right2Color:'#ffd32a',
        message:'Envie um score para entrar na disputa competitiva.',
        sub:'A primeira meta é aparecer no ranking.'
      };
    }

    if (rank === 1) {
      const lead = Math.max(0, score - n(rank2?.score));
      const hunter = String(rank2?.name || '2º lugar').toUpperCase();
      return {
        right1Label:'VANTAGEM SOBRE #2',
        right1Value:'+' + lead,
        right1Color:'#00f5d4',
        right2Label:'STATUS',
        right2Value:'👑 TOPO',
        right2Color:'#ffd32a',
        message: lead > 0
          ? ('Você lidera por ' + lead + ' ponto' + (lead === 1 ? '' : 's') + ' sobre ' + hunter + '.')
          : 'Você está empatado na liderança; qualquer erro custa o topo.',
        sub:'Agora o foco não é subir. É defender a liderança.'
      };
    }

    if (rank <= 3) {
      const defend = below ? Math.max(0, score - n(below.score)) : 0;
      const targetRank = Math.max(1, rank - 1);
      const podiumText = (nextPts > 0)
        ? ('Faça +' + nextPts + ' para passar ' + nextName + '.')
        : 'Você já encostou no próximo rival do pódio.';
      return {
        right1Label:'PARA O #' + targetRank,
        right1Value: nextPts > 0 ? ('+' + nextPts) : '--',
        right1Color:'#00f5d4',
        right2Label:'SOBRE O ABAIXO',
        right2Value: below ? ('+' + defend) : '--',
        right2Color:'#ffd32a',
        message: podiumText,
        sub:'Você já está no pódio. Agora é disputa por posição.'
      };
    }

    if (rank <= 5) {
      const ptsPodium = rank3 ? Math.max(0, n(rank3.score) - score + 1) : 0;
      return {
        right1Label:'PARA O PÓDIO',
        right1Value: ptsPodium > 0 ? ('+' + ptsPodium) : '+0',
        right1Color:'#ffd32a',
        right2Label:'PARA O PRÓXIMO',
        right2Value: nextPts > 0 ? ('+' + nextPts) : '--',
        right2Color:'#00f5d4',
        message: ptsPodium > 0
          ? ('Faça +' + ptsPodium + ' para entrar no Top 3.')
          : 'Você já colou na fronteira do pódio.',
        sub:'Top 5 garantido. A meta agora é subir para o pódio.'
      };
    }

    return {
      right1Label:'PARA O TOP 5',
      right1Value: top5Pts > 0 ? ('+' + top5Pts) : '--',
      right1Color:'#ffd32a',
      right2Label:'PARA O PRÓXIMO',
      right2Value: nextPts > 0 ? ('+' + nextPts) : '--',
      right2Color:'#00f5d4',
      message: nextPts > 0
        ? ('Faça +' + nextPts + ' para passar ' + nextName + '.')
        : 'Seu próximo alvo ainda não está visível.',
      sub:'A entrada no Top 5 é o primeiro corte competitivo relevante.'
    };
  }

  async function loadCompetitiveRankings(){
    if (!networkOnline) {
      rankingsError = 'Sem internet';
      return false;
    }
    if (!sb) {
      rankingsError = 'Sem conexão';
      return false;
    }

    rankingsLoading = true;
    rankingsError = '';
    try {
      const { data, error } = await sb.rpc('get_rankings_competitive', {
        p_top_limit: 5,
        p_window: 2
      });
      if (error) throw error;

      state.top = Array.isArray(data?.top) ? data.top : [];
      state.around = Array.isArray(data?.around_me) ? data.around_me : [];
      state.summary = data?.summary || null;

      rankings = state.top.slice();
      userPosition = n(state.summary?.user_rank) > 0 ? n(state.summary.user_rank) - 1 : -1;

      if (typeof trackEvent === 'function') {
        trackEvent('ranking_loaded', {
          total_players: n(state.summary?.total_players),
          user_rank: n(state.summary?.user_rank),
          source: 'competitive_unified'
        });
      }
      return true;
    } catch (e) {
      rankingsError = 'Erro ao carregar';
      console.error('[Orbita] loadCompetitiveRankings failed', e);
      if (typeof trackEvent === 'function') {
        trackEvent('ranking_load_failed', {
          source: 'competitive_unified',
          message: String(e?.message || e || '').slice(0, 100)
        });
      }
      try {
        await _origLoadRankings();
      } catch (_) {}
      return false;
    } finally {
      rankingsLoading = false;
    }
  }

  function drawCompetitiveRow(r, x, y, w, h, mode){
    const isUser = currentUser && r.user_id === currentUser.id;
    const rank = n(r.rank);
    let borderColor = 'rgba(255,255,255,0.10)';
    let bgColor = 'rgba(0,0,0,0.46)';

    if (rank === 1) { borderColor = '#ffd32a'; bgColor = 'rgba(255,211,42,0.12)'; }
    else if (rank === 2) { borderColor = '#dfe6f0'; bgColor = 'rgba(223,230,240,0.09)'; }
    else if (rank === 3) { borderColor = '#cd7f32'; bgColor = 'rgba(205,127,50,0.10)'; }
    if (isUser) { borderColor = '#00f5d4'; bgColor = 'rgba(0,245,212,0.12)'; }

    X.globalAlpha = 0.95;
    X.fillStyle = bgColor;
    roundRect(x, y, w, h, 10); X.fill();
    X.strokeStyle = borderColor;
    X.lineWidth = isUser ? 2 : 1.2;
    if (isUser) { X.shadowColor = '#00f5d4'; X.shadowBlur = 8; }
    roundRect(x, y, w, h, 10); X.stroke();
    X.shadowBlur = 0;
    X.globalAlpha = 1;

    let rankText = '#' + rank;
    if (rank === 1) rankText = '🥇';
    else if (rank === 2) rankText = '🥈';
    else if (rank === 3) rankText = '🥉';

    X.fillStyle = rank <= 3 ? '#fff' : 'rgba(255,255,255,0.72)';
    X.font = 'bold 15px -apple-system, system-ui, sans-serif';
    X.textAlign = 'center'; X.textBaseline = 'middle';
    X.fillText(rankText, x + 26, y + h/2);

    if (typeof drawBallAt === 'function') {
      X.save();
      drawBallAt(x + 60, y + h/2, 1, false, r.skin || 'default');
      X.restore();
    }

    X.textAlign = 'left';
    X.fillStyle = isUser ? '#00f5d4' : '#fff';
    X.font = 'bold 13px -apple-system, system-ui, sans-serif';
    const name = String(r.name || 'SEM NOME').slice(0, mode === 'top' ? 14 : 18);
    X.fillText(name, x + 82, y + h/2 - 7);

    X.fillStyle = 'rgba(255,255,255,0.52)';
    X.font = '10px -apple-system, system-ui, sans-serif';
    if (isUser) X.fillText('VOCÊ', x + 82, y + h/2 + 9);
    else X.fillText(mode === 'top' ? 'TOP GLOBAL' : getDisplayTitle(), x + 82, y + h/2 + 9);

    X.textAlign = 'right';
    X.fillStyle = '#fff';
    X.font = 'bold 17px -apple-system, system-ui, sans-serif';
    X.fillText(String(r.score || 0), x + w - 12, y + h/2 - 1);
  }

  function drawCompetitiveRankingMenu(){
    if (typeof window.drawMetaProgressTopStatusBadges === 'function') {
      window.drawMetaProgressTopStatusBadges();
    }
    X.textAlign='center'; X.textBaseline='middle';

    X.fillStyle='#e0e0ff';
    X.font='bold 26px -apple-system, system-ui, sans-serif';
    X.shadowColor='#ff6b9d'; X.shadowBlur=15;
    X.fillText('🌍 RANKING COMPETITIVO',W/2,H*0.05);
    X.shadowBlur=0;

    drawBackBtn();

    const rbx=W/2-44, rby=H*0.115, rbw=88, rbh=26;
    X.globalAlpha=0.84;
    X.fillStyle='rgba(0,0,0,0.6)';
    roundRect(rbx,rby,rbw,rbh,6); X.fill();
    X.strokeStyle='#00f5d4'; X.lineWidth=1;
    roundRect(rbx,rby,rbw,rbh,6); X.stroke();
    X.fillStyle='#00f5d4';
    X.font='bold 10px -apple-system, system-ui, sans-serif';
    X.fillText('↻ ATUALIZAR',rbx+rbw/2,rby+rbh/2);
    X.globalAlpha=1;
    menuBtnAreas.push({ x:rbx,y:rby,w:rbw,h:rbh, action:()=>{ loadRankings(); } });

    if (rankingsLoading) {
      X.fillStyle='#fff';
      X.font='14px -apple-system, system-ui, sans-serif';
      X.fillText('Carregando...',W/2,H*0.5);
      return;
    }

    if (rankingsError) {
      X.fillStyle='#ff6b6b';
      X.font='14px -apple-system, system-ui, sans-serif';
      X.fillText(rankingsError,W/2,H*0.5);
      X.fillStyle='rgba(255,255,255,0.5)';
      X.font='11px -apple-system, system-ui, sans-serif';
      X.fillText('Verifique sua conexão',W/2,H*0.54);
      return;
    }

    const sx = 15;
    const sw = W - 30;
    let y = H * 0.16;
    const objective = getObjectiveState();

    X.fillStyle='rgba(0,0,0,0.56)';
    roundRect(sx, y, sw, 92, 12); X.fill();
    X.strokeStyle='rgba(255,255,255,0.10)';
    X.lineWidth=1.2;
    roundRect(sx, y, sw, 92, 12); X.stroke();

    const userScore = currentUserScore();
    const tier = getCompetitiveTier(userScore);
    X.textAlign='left'; X.textBaseline='middle';
    X.fillStyle='rgba(255,255,255,0.55)';
    X.font='11px -apple-system, system-ui, sans-serif';
    X.fillText((playerName || 'JOGADOR') + ' · Recorde ' + userScore, sx+14, y+16);

    X.fillStyle='#fff';
    X.font='bold 28px -apple-system, system-ui, sans-serif';
    X.fillText(fmtRank(state.summary?.user_rank), sx+14, y+44);

    X.fillStyle=tier.color;
    X.font='bold 12px -apple-system, system-ui, sans-serif';
    X.fillText(tier.name, sx+14, y+68);

    X.textAlign='center';
    X.fillStyle='rgba(255,255,255,0.52)';
    X.font='10px -apple-system, system-ui, sans-serif';
    X.fillText('JOGADORES', W/2, y+16);
    X.fillStyle='#fff';
    X.font='bold 18px -apple-system, system-ui, sans-serif';
    X.fillText(String(state.summary?.total_players || 0), W/2, y+39);

    X.fillStyle='rgba(255,255,255,0.52)';
    X.font='10px -apple-system, system-ui, sans-serif';
    X.fillText('PERCENTIL', W/2, y+62);
    X.fillStyle='#fff';
    X.font='bold 13px -apple-system, system-ui, sans-serif';
    X.fillText((state.summary?.percentile != null ? state.summary.percentile + '%' : '--'), W/2, y+76);

    X.textAlign='right';
    X.fillStyle='rgba(255,255,255,0.52)';
    X.font='10px -apple-system, system-ui, sans-serif';
    X.fillText(objective.right1Label, sx+sw-14, y+16);
    X.fillStyle=objective.right1Color;
    X.font='bold 18px -apple-system, system-ui, sans-serif';
    X.fillText(objective.right1Value, sx+sw-14, y+39);

    X.fillStyle='rgba(255,255,255,0.52)';
    X.font='10px -apple-system, system-ui, sans-serif';
    X.fillText(objective.right2Label, sx+sw-14, y+62);
    X.fillStyle=objective.right2Color;
    X.font='bold 13px -apple-system, system-ui, sans-serif';
    X.fillText(objective.right2Value, sx+sw-14, y+76);

    y += 106;

    X.textAlign='left';
    X.fillStyle='#ff6b9d';
    X.font='bold 12px -apple-system, system-ui, sans-serif';
    X.fillText('TOPO GLOBAL', sx, y);
    y += 10;

    for (const r of (state.top || []).slice(0, 3)) {
      drawCompetitiveRow(r, sx, y, sw, 42, 'top');
      y += 48;
    }

    y += 4;
    X.textAlign='left';
    X.textBaseline='middle';
    X.fillStyle='#00f5d4';
    X.font='bold 12px -apple-system, system-ui, sans-serif';
    X.fillText(getDisplayTitle(), sx, y);
    y += 10;

    const shownRows = getDisplayRows();
    if (shownRows.length) {
      for (const r of shownRows.slice(0, 4)) {
        drawCompetitiveRow(r, sx, y, sw, 38, 'around');
        y += 44;
      }
    } else {
      X.fillStyle='rgba(255,255,255,0.46)';
      X.font='11px -apple-system, system-ui, sans-serif';
      X.fillText('Envie um score para entrar na disputa.', sx, y + 18);
      y += 40;
    }

    y += 4;

    X.fillStyle='rgba(0,0,0,0.52)';
    roundRect(sx, y, sw, 56, 10); X.fill();
    X.strokeStyle='rgba(255,255,255,0.08)';
    X.lineWidth=1;
    roundRect(sx, y, sw, 56, 10); X.stroke();

    X.textAlign='left';
    X.fillStyle='rgba(255,255,255,0.55)';
    X.font='10px -apple-system, system-ui, sans-serif';
    X.fillText('OBJETIVO IMEDIATO', sx+12, y+16);

    X.fillStyle='#fff';
    X.font='bold 13px -apple-system, system-ui, sans-serif';
    X.fillText(objective.message, sx+12, y+35);

    X.fillStyle='rgba(255,255,255,0.42)';
    X.font='10px -apple-system, system-ui, sans-serif';
    X.fillText(objective.sub, sx+12, y+49);
  }

  window.loadCompetitiveRankings = loadCompetitiveRankings;
  window.drawCompetitiveRankingMenu = drawCompetitiveRankingMenu;
  window.drawMetaProgressRankingMenu = drawCompetitiveRankingMenu;
  loadRankings = loadCompetitiveRankings;
})();
