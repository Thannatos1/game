(function(){
  const state = {
    top: [],
    around: [],
    summary: null
  };

  const _origLoadRankings = typeof loadRankings === 'function' ? loadRankings : async function(){ return false; };

  function n(v){
    return Number(v || 0) || 0;
  }

  function fmtRank(v){
    return n(v) > 0 ? ('#' + n(v)) : '--';
  }

  function safeName(v, fallback){
    const raw = String(v || fallback || 'SEM NOME').trim();
    return raw || String(fallback || 'SEM NOME');
  }

  function normalizeRow(row, fallbackRank){
    return {
      rank: n(row && row.rank) || n(fallbackRank),
      user_id: row && row.user_id ? row.user_id : null,
      name: safeName(row && row.name, 'SEM NOME'),
      score: n(row && row.score),
      skin: row && row.skin ? row.skin : 'default'
    };
  }

  function uniqueRows(rows){
    const out = [];
    const seen = new Set();

    for (const row of rows || []) {
      const normalized = normalizeRow(row, row && row.rank);
      const key = String(normalized.user_id || normalized.name) + ':' + String(normalized.rank || 0);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(normalized);
    }

    return out.sort((a, b) => n(a.rank) - n(b.rank));
  }

  function allKnownRows(){
    return uniqueRows((state.top || []).concat(state.around || []));
  }

  function rowByRank(list, rank){
    const wanted = n(rank);
    return uniqueRows(list || []).find(row => n(row.rank) === wanted) || null;
  }

  function buildSyntheticRow(rank, name, score, skin, userId){
    if (!n(rank) && !name && !n(score)) return null;
    return normalizeRow({
      rank: n(rank),
      name: safeName(name, 'RIVAL'),
      score: n(score),
      skin: skin || 'default',
      user_id: userId || null
    }, rank);
  }

  function currentUserRank(){
    return n(state.summary && state.summary.user_rank);
  }

  function currentUserScore(){
    if (state.summary && state.summary.user_score != null) return n(state.summary.user_score);
    return n(best);
  }

  function currentUserName(){
    return safeName(state.summary && state.summary.user_name, playerName || 'JOGADOR');
  }

  function getCompetitiveTier(score){
    score = n(score);
    if (score >= 250) return { name:'LENDARIO', color:'#ffd32a' };
    if (score >= 150) return { name:'DIAMANTE', color:'#b9f6ff' };
    if (score >= 90) return { name:'OURO', color:'#ffd32a' };
    if (score >= 45) return { name:'PRATA', color:'#dfe6f0' };
    if (score >= 20) return { name:'BRONZE', color:'#cd7f32' };
    return { name:'INICIANTE', color:'#7bed9f' };
  }

  function hydrateCompetitiveState(topRows, aroundRows, summary){
    state.top = uniqueRows((topRows || []).map((row, idx) => normalizeRow(row, idx + 1)));
    state.around = uniqueRows((aroundRows || []).map(row => normalizeRow(row, row && row.rank)));
    state.summary = summary || null;

    rankings = state.top.slice();
    userPosition = currentUserRank() > 0 ? currentUserRank() - 1 : -1;
  }

  function buildLegacyRows(){
    return uniqueRows((Array.isArray(rankings) ? rankings : []).map((row, idx) => normalizeRow(row, idx + 1)));
  }

  function buildLegacySummary(rows, topLimit, windowSize){
    const userId = currentUser && currentUser.id ? currentUser.id : '';
    const userRow = userId ? rows.find(row => row.user_id === userId) || null : null;
    const userRank = userRow ? n(userRow.rank) : 0;
    const userScore = userRow ? n(userRow.score) : n(best);
    const nextBetter = userRank > 1 ? rows[userRank - 2] : null;
    const topCutoff = rows.length >= topLimit ? rows[topLimit - 1] : null;
    const percentile = userRank > 0 && rows.length > 0
      ? Math.round((1000 * (rows.length - userRank + 1) / rows.length)) / 10
      : null;

    return {
      total_players: rows.length,
      user_rank: userRank || null,
      user_score: userScore || null,
      user_name: safeName(userRow && userRow.name, playerName || 'JOGADOR'),
      user_skin: userRow && userRow.skin ? userRow.skin : (selectedSkin || 'default'),
      percentile,
      next_better_rank: nextBetter ? n(nextBetter.rank) : null,
      next_better_score: nextBetter ? n(nextBetter.score) : null,
      next_better_name: nextBetter ? nextBetter.name : null,
      points_to_next: nextBetter ? Math.max(0, n(nextBetter.score) - userScore + 1) : 0,
      points_to_top: topCutoff ? Math.max(0, n(topCutoff.score) - userScore + 1) : 0,
      top_cutoff_score: topCutoff ? n(topCutoff.score) : null,
      top_limit: topLimit,
      window: windowSize
    };
  }

  function hydrateStateFromLegacyRankings(){
    const topLimit = 5;
    const windowSize = 2;
    const rows = buildLegacyRows();

    if (!rows.length) {
      hydrateCompetitiveState([], [], {
        total_players: 0,
        user_rank: null,
        user_score: n(best),
        user_name: safeName(playerName, 'JOGADOR'),
        user_skin: selectedSkin || 'default',
        percentile: null,
        next_better_rank: null,
        next_better_score: null,
        next_better_name: null,
        points_to_next: 0,
        points_to_top: 0,
        top_cutoff_score: null,
        top_limit: topLimit,
        window: windowSize
      });
      return false;
    }

    const summary = buildLegacySummary(rows, topLimit, windowSize);
    const userRank = n(summary.user_rank);
    const from = userRank > 0 ? Math.max(0, userRank - 1 - windowSize) : 0;
    const to = userRank > 0 ? Math.min(rows.length, userRank - 1 + windowSize + 1) : Math.min(rows.length, topLimit);
    const around = rows.slice(from, to);

    hydrateCompetitiveState(rows.slice(0, topLimit), around, summary);
    return true;
  }

  function getDisplayRows(){
    const rank = currentUserRank();
    if (!rank) return [];

    if (rank === 1) {
      return uniqueRows(state.top.filter(row => n(row.rank) > 1).slice(0, 3));
    }

    if (rank <= 3) {
      return uniqueRows((state.around || []).filter(row => n(row.rank) !== rank));
    }

    return uniqueRows(state.around || []);
  }

  function getDisplayTitle(){
    const rank = currentUserRank();
    const compactMobile = W <= 560 && H >= W * 1.25;
    if (!rank) return 'PERTO DE VOCE';
    if (rank === 1) return compactMobile ? 'CACADORES' : 'QUEM ESTA TE CACANDO';
    if (rank <= 3) return 'RIVAIS DO PODIO';
    return 'PERTO DE VOCE';
  }

  function getObjectiveState(){
    const rank = currentUserRank();
    const score = currentUserScore();
    const topLimit = n(state.summary && state.summary.top_limit) || 5;
    const topCutoff = n(state.summary && state.summary.top_cutoff_score);
    const rank2 = rowByRank(state.top, 2);
    const rank3 = rowByRank(state.top, 3);
    const below = rowByRank(getDisplayRows().concat(state.top), rank + 1);
    const nextPts = n(state.summary && state.summary.points_to_next);
    const topPts = n(state.summary && state.summary.points_to_top);
    const nextName = safeName(state.summary && state.summary.next_better_name, 'proximo rival').toUpperCase();

    if (!rank) {
      return {
        right1Label:'PARA O TOP ' + topLimit,
        right1Value: topPts > 0 ? ('+' + topPts) : '--',
        right1Color:'#ffd32a',
        right2Label:'META INICIAL',
        right2Value: topCutoff > 0 ? String(topCutoff) : 'RANK',
        right2Color:'#00f5d4',
        message: topPts > 0
          ? ('Seu primeiro corte real e o Top ' + topLimit + '.')
          : 'Envie um score para entrar na disputa competitiva.',
        sub:'A meta nao e so aparecer. E passar o corte competitivo.'
      };
    }

    if (rank === 1) {
      const lead = Math.max(0, score - n(rank2 && rank2.score));
      const hunter = safeName(rank2 && rank2.name, '2o lugar').toUpperCase();
      return {
        right1Label:'VANTAGEM SOBRE #2',
        right1Value:'+' + lead,
        right1Color:'#00f5d4',
        right2Label:'STATUS',
        right2Value:'TOPO',
        right2Color:'#ffd32a',
        message: lead > 0
          ? ('Voce lidera por ' + lead + ' ponto' + (lead === 1 ? '' : 's') + ' sobre ' + hunter + '.')
          : 'A lideranca esta empatada. Qualquer erro entrega o topo.',
        sub:'Agora a run e defesa de lideranca, nao subida.'
      };
    }

    if (rank <= 3) {
      const defend = below ? Math.max(0, score - n(below.score)) : 0;
      const targetRank = Math.max(1, rank - 1);
      return {
        right1Label:'PARA O #' + targetRank,
        right1Value: nextPts > 0 ? ('+' + nextPts) : '--',
        right1Color:'#00f5d4',
        right2Label:'SOBRE O ABAIXO',
        right2Value: below ? ('+' + defend) : '--',
        right2Color:'#ff6b9d',
        message: nextPts > 0
          ? ('Faca +' + nextPts + ' para passar ' + nextName + '.')
          : 'Voce ja colou no proximo rival do podio.',
        sub:'Voce ja esta no podio. Agora e troca direta de posicao.'
      };
    }

    if (rank <= topLimit) {
      const ptsPodium = rank3 ? Math.max(0, n(rank3.score) - score + 1) : 0;
      return {
        right1Label:'PARA O PODIO',
        right1Value: ptsPodium > 0 ? ('+' + ptsPodium) : '+0',
        right1Color:'#ffd32a',
        right2Label:'PARA O PROXIMO',
        right2Value: nextPts > 0 ? ('+' + nextPts) : '--',
        right2Color:'#00f5d4',
        message: ptsPodium > 0
          ? ('Faca +' + ptsPodium + ' para entrar no Top 3.')
          : 'Voce ja encostou na fronteira do podio.',
        sub:'Top ' + topLimit + ' ja e zona quente. O alvo agora e o podio.'
      };
    }

    return {
      right1Label:'PARA O TOP ' + topLimit,
      right1Value: topPts > 0 ? ('+' + topPts) : '--',
      right1Color:'#ffd32a',
      right2Label:'PARA O PROXIMO',
      right2Value: nextPts > 0 ? ('+' + nextPts) : '--',
      right2Color:'#00f5d4',
      message: nextPts > 0
        ? ('Faca +' + nextPts + ' para passar ' + nextName + '.')
        : 'Seu proximo alvo ainda nao esta visivel.',
      sub:'A entrada no Top ' + topLimit + ' e o primeiro corte competitivo relevante.'
    };
  }

  function getNextBetterRow(){
    const rank = currentUserRank();
    if (rank <= 1) return null;

    return rowByRank(allKnownRows(), state.summary && state.summary.next_better_rank) || buildSyntheticRow(
      state.summary && state.summary.next_better_rank,
      state.summary && state.summary.next_better_name,
      state.summary && state.summary.next_better_score,
      null,
      null
    );
  }

  function getPressureRow(){
    const rank = currentUserRank();
    if (!rank) return null;
    return rowByRank(allKnownRows(), rank + 1);
  }

  function getTopCutoffRow(){
    const topLimit = n(state.summary && state.summary.top_limit) || 5;
    return rowByRank(state.top, topLimit) || buildSyntheticRow(
      topLimit,
      'CORTE TOP ' + topLimit,
      state.summary && state.summary.top_cutoff_score,
      null,
      null
    );
  }

  function getRivalPanelData(){
    const rank = currentUserRank();
    const score = currentUserScore();
    const topLimit = n(state.summary && state.summary.top_limit) || 5;
    const nextBetter = getNextBetterRow();
    const pressure = getPressureRow();
    const cutoff = getTopCutoffRow();
    const leader = rowByRank(state.top, 1);

    if (!rank) {
      return {
        title:'ENTRE NO RADAR',
        subtitle:'Pare de consultar a lista e escolha quem voce quer cacar primeiro.',
        primary: cutoff ? {
          label:'CORTE DO TOP ' + topLimit,
          row: cutoff,
          color:'#ffd32a',
          gap: n(state.summary && state.summary.points_to_top),
          hint:'Esse e o score de entrada para aparecer na disputa.'
        } : null,
        secondary: leader ? {
          label:'LIDER ATUAL',
          row: leader,
          color:'#ff6b9d',
          gap: Math.max(0, n(leader.score) - score + 1),
          hint:'Olhe o teto da sala para entender o ritmo de quem esta na frente.'
        } : null
      };
    }

    if (rank === 1) {
      const hunter = rowByRank(allKnownRows(), 2) || rowByRank(state.top, 2);
      const third = rowByRank(allKnownRows(), 3) || rowByRank(state.top, 3);
      return {
        title:'DEFENDA O TOPO',
        subtitle:'Agora existe pressao real embaixo. Sua run vale defesa de margem.',
        primary: hunter ? {
          label:'CACADOR',
          row: hunter,
          color:'#ff6b9d',
          gap: Math.max(0, score - n(hunter.score)),
          hint:'Sua vantagem atual sobre quem mais ameaca a lideranca.'
        } : null,
        secondary: third ? {
          label:'FILA DO PODIO',
          row: third,
          color:'#ffd32a',
          gap: Math.max(0, score - n(third.score)),
          hint:'A fila do podio tambem importa. Uma run forte deles esquenta o topo.'
        } : null
      };
    }

    if (rank <= 3) {
      return {
        title:'BRIGA DE PODIO',
        subtitle:'Seu ranking agora muda por duelo direto, nao por tabela geral.',
        primary: nextBetter ? {
          label:'ALVO IMEDIATO',
          row: nextBetter,
          color:'#00f5d4',
          gap: n(state.summary && state.summary.points_to_next),
          hint:'Essa e a pessoa que a sua proxima run precisa derrubar.'
        } : null,
        secondary: pressure ? {
          label:'PRESSAO ABAIXO',
          row: pressure,
          color:'#ff6b9d',
          gap: Math.max(0, score - n(pressure.score)),
          hint:'Se vacilar, a sua posicao vira o alvo da vez.'
        } : null
      };
    }

    if (rank <= topLimit) {
      return {
        title:'CORRIDA PELO PODIO',
        subtitle:'Voce ja entrou na zona quente. Agora a disputa e por posicao.',
        primary: nextBetter ? {
          label:'PROXIMO RIVAL',
          row: nextBetter,
          color:'#00f5d4',
          gap: n(state.summary && state.summary.points_to_next),
          hint:'Passe essa pessoa primeiro. O podio vem logo depois.'
        } : null,
        secondary: pressure ? {
          label:'NA SUA COLA',
          row: pressure,
          color:'#ff6b9d',
          gap: Math.max(0, score - n(pressure.score)),
          hint:'Sua vantagem sobre quem esta logo abaixo.'
        } : null
      };
    }

    return {
      title:'CORTE COMPETITIVO',
      subtitle:'Subir uma posicao e entrar no Top ' + topLimit + ' sao metas diferentes. Leia as duas.',
      primary: nextBetter ? {
        label:'PROXIMO RIVAL',
        row: nextBetter,
        color:'#00f5d4',
        gap: n(state.summary && state.summary.points_to_next),
        hint:'Essa e a troca mais facil que sua proxima run pode buscar.'
      } : null,
      secondary: cutoff ? {
        label:'CORTE DO TOP ' + topLimit,
        row: cutoff,
        color:'#ffd32a',
        gap: n(state.summary && state.summary.points_to_top),
        hint:'Esse e o score minimo para entrar no grupo que realmente disputa visibilidade.'
      } : null
    };
  }

  function getRowTag(row){
    const rank = n(row && row.rank);
    const userRank = currentUserRank();
    const topLimit = n(state.summary && state.summary.top_limit) || 5;

    if (currentUser && row && row.user_id === currentUser.id) {
      return { text:'VOCE', color:'#00f5d4' };
    }

    if (userRank === 1 && rank === 2) {
      return { text:'CACADOR', color:'#ff6b9d' };
    }

    if (rank && rank === n(state.summary && state.summary.next_better_rank)) {
      return { text:'ALVO', color:'#00f5d4' };
    }

    if (userRank > 0 && rank === userRank + 1) {
      return { text:'PRESSAO', color:'#ff6b9d' };
    }

    if (!userRank && rank === topLimit) {
      return { text:'CORTE', color:'#ffd32a' };
    }

    return null;
  }

  function drawCompetitiveRow(row, x, y, w, h, mode){
    const r = normalizeRow(row, row && row.rank);
    const tag = getRowTag(r);
    const isUser = tag && tag.text === 'VOCE';
    const rank = n(r.rank);
    let borderColor = 'rgba(255,255,255,0.10)';
    let bgColor = 'rgba(0,0,0,0.46)';

    if (rank === 1) { borderColor = '#ffd32a'; bgColor = 'rgba(255,211,42,0.12)'; }
    else if (rank === 2) { borderColor = '#dfe6f0'; bgColor = 'rgba(223,230,240,0.09)'; }
    else if (rank === 3) { borderColor = '#cd7f32'; bgColor = 'rgba(205,127,50,0.10)'; }
    if (tag && !isUser) { borderColor = tag.color; bgColor = 'rgba(255,255,255,0.06)'; }
    if (isUser) { borderColor = '#00f5d4'; bgColor = 'rgba(0,245,212,0.12)'; }

    X.globalAlpha = 0.95;
    X.fillStyle = bgColor;
    roundRect(x, y, w, h, 10); X.fill();
    X.strokeStyle = borderColor;
    X.lineWidth = isUser ? 2 : 1.2;
    if (isUser || tag) {
      X.shadowColor = borderColor;
      X.shadowBlur = isUser ? 8 : 4;
    }
    roundRect(x, y, w, h, 10); X.stroke();
    X.shadowBlur = 0;
    X.globalAlpha = 1;

    let rankText = '#' + rank;
    if (rank === 1) rankText = '1';
    else if (rank === 2) rankText = '2';
    else if (rank === 3) rankText = '3';

    X.fillStyle = rank <= 3 ? '#fff' : 'rgba(255,255,255,0.72)';
    X.font = 'bold 15px -apple-system, system-ui, sans-serif';
    X.textAlign = 'center';
    X.textBaseline = 'middle';
    X.fillText(rankText, x + 26, y + h / 2);

    if (typeof drawBallAt === 'function') {
      X.save();
      drawBallAt(x + 60, y + h / 2, 1, false, r.skin || 'default');
      X.restore();
    }

    X.textAlign = 'left';
    X.fillStyle = isUser ? '#00f5d4' : '#fff';
    X.font = 'bold 13px -apple-system, system-ui, sans-serif';
    X.fillText(safeName(r.name, 'SEM NOME').slice(0, mode === 'top' ? 14 : 18), x + 82, y + h / 2 - 7);

    X.fillStyle = tag ? tag.color : 'rgba(255,255,255,0.52)';
    X.font = '10px -apple-system, system-ui, sans-serif';
    if (tag) X.fillText(tag.text, x + 82, y + h / 2 + 9);
    else X.fillText(mode === 'top' ? (W <= 560 ? 'TOP' : 'TOP GLOBAL') : getDisplayTitle(), x + 82, y + h / 2 + 9);

    X.textAlign = 'right';
    X.fillStyle = '#fff';
    X.font = 'bold 17px -apple-system, system-ui, sans-serif';
    X.fillText(String(r.score || 0), x + w - 12, y + h / 2 - 1);
  }

  function drawRivalMiniCard(card, x, y, w, h){
    if (!card || !card.row) return;

    X.fillStyle = 'rgba(0,0,0,0.48)';
    roundRect(x, y, w, h, 10); X.fill();
    X.strokeStyle = card.color;
    X.lineWidth = 1.2;
    roundRect(x, y, w, h, 10); X.stroke();

    X.textAlign = 'left';
    X.textBaseline = 'middle';
    X.fillStyle = card.color;
    X.font = 'bold 10px -apple-system, system-ui, sans-serif';
    X.fillText(card.label, x + 10, y + 12);

    X.fillStyle = '#fff';
    X.font = 'bold 13px -apple-system, system-ui, sans-serif';
    X.fillText(safeName(card.row.name, 'RIVAL').slice(0, 16), x + 10, y + 28);

    X.fillStyle = 'rgba(255,255,255,0.50)';
    X.font = '10px -apple-system, system-ui, sans-serif';
    X.fillText(fmtRank(card.row.rank) + '  SCORE ' + n(card.row.score), x + 10, y + 43);

    X.textAlign = 'right';
    X.fillStyle = card.color;
    X.font = 'bold 18px -apple-system, system-ui, sans-serif';
    X.fillText(card.gap > 0 ? ('+' + card.gap) : '0', x + w - 10, y + 22);

    X.fillStyle = 'rgba(255,255,255,0.42)';
    X.font = '10px -apple-system, system-ui, sans-serif';
    X.fillText(card.hint.slice(0, 28), x + w - 10, y + 40);
  }

  function drawRivalPanel(x, y, w){
    const panel = getRivalPanelData();
    if (!panel || (!panel.primary && !panel.secondary)) return 0;
    const compactMobile = W <= 560 && H >= W * 1.25;

    X.textAlign = 'left';
    X.textBaseline = 'middle';
    X.fillStyle = '#ff6b9d';
    X.font = 'bold 12px -apple-system, system-ui, sans-serif';
    X.fillText(panel.title, x, y);

    X.fillStyle = 'rgba(255,255,255,0.48)';
    X.font = '10px -apple-system, system-ui, sans-serif';
    X.fillText(panel.subtitle, x, y + 14);

    const cardsY = y + 24;
    const cardH = 52;

    if (panel.primary && panel.secondary) {
      if (compactMobile) {
        drawRivalMiniCard(panel.primary, x, cardsY, w, cardH);
        drawRivalMiniCard(panel.secondary, x, cardsY + cardH + 8, w, cardH);
        return 140;
      }

      const gap = 10;
      const cardW = (w - gap) / 2;
      drawRivalMiniCard(panel.primary, x, cardsY, cardW, cardH);
      drawRivalMiniCard(panel.secondary, x + cardW + gap, cardsY, cardW, cardH);
    } else if (panel.primary) {
      drawRivalMiniCard(panel.primary, x, cardsY, w, cardH);
    } else if (panel.secondary) {
      drawRivalMiniCard(panel.secondary, x, cardsY, w, cardH);
    }

    return 84;
  }

  async function loadCompetitiveRankings(){
    if (!networkOnline) {
      rankingsError = 'Sem internet';
      return false;
    }
    if (!sb) {
      rankingsError = 'Sem conexao';
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

      hydrateCompetitiveState(
        Array.isArray(data && data.top) ? data.top : [],
        Array.isArray(data && data.around_me) ? data.around_me : [],
        data && data.summary ? data.summary : null
      );

      if (typeof trackEvent === 'function') {
        trackEvent('ranking_loaded', {
          total_players: n(state.summary && state.summary.total_players),
          user_rank: n(state.summary && state.summary.user_rank),
          source: 'competitive_unified'
        });
      }
      return true;
    } catch (e) {
      console.error('[Orbita] loadCompetitiveRankings failed', e);

      let fallbackLoaded = false;
      try {
        await _origLoadRankings();
        fallbackLoaded = hydrateStateFromLegacyRankings();
      } catch (_) {}

      if (fallbackLoaded) {
        rankingsError = '';
        if (typeof trackEvent === 'function') {
          trackEvent('ranking_loaded', {
            total_players: n(state.summary && state.summary.total_players),
            user_rank: n(state.summary && state.summary.user_rank),
            source: 'competitive_fallback'
          });
        }
        return true;
      }

      rankingsError = 'Erro ao carregar';
      if (typeof trackEvent === 'function') {
        trackEvent('ranking_load_failed', {
          source: 'competitive_unified',
          message: String(e && (e.message || e.details) || e || '').slice(0, 100)
        });
      }
      return false;
    } finally {
      rankingsLoading = false;
    }
  }

  function drawCompetitiveRankingMenu(){
    if (typeof window.drawMetaProgressTopStatusBadges === 'function') {
      window.drawMetaProgressTopStatusBadges();
    }

    X.textAlign = 'center';
    X.textBaseline = 'middle';
    X.fillStyle = '#e0e0ff';
    X.font = 'bold 26px -apple-system, system-ui, sans-serif';
    X.shadowColor = '#ff6b9d';
    X.shadowBlur = 15;
    X.fillText('RANKING COMPETITIVO', W / 2, H * 0.05);
    X.shadowBlur = 0;

    drawBackBtn();

    const rbx = W / 2 - 44;
    const rby = H * 0.115;
    const rbw = 88;
    const rbh = 26;
    X.globalAlpha = 0.84;
    X.fillStyle = 'rgba(0,0,0,0.6)';
    roundRect(rbx, rby, rbw, rbh, 6); X.fill();
    X.strokeStyle = '#00f5d4';
    X.lineWidth = 1;
    roundRect(rbx, rby, rbw, rbh, 6); X.stroke();
    X.fillStyle = '#00f5d4';
    X.font = 'bold 10px -apple-system, system-ui, sans-serif';
    X.fillText('ATUALIZAR', rbx + rbw / 2, rby + rbh / 2);
    X.globalAlpha = 1;
    menuBtnAreas.push({ x:rbx, y:rby, w:rbw, h:rbh, action:()=>{ loadRankings(); } });

    if (rankingsLoading) {
      X.fillStyle = '#fff';
      X.font = '14px -apple-system, system-ui, sans-serif';
      X.fillText('Carregando...', W / 2, H * 0.5);
      return;
    }

    if (rankingsError) {
      X.fillStyle = '#ff6b6b';
      X.font = '14px -apple-system, system-ui, sans-serif';
      X.fillText(rankingsError, W / 2, H * 0.5);
      X.fillStyle = 'rgba(255,255,255,0.5)';
      X.font = '11px -apple-system, system-ui, sans-serif';
      X.fillText('Verifique sua conexao', W / 2, H * 0.54);
      return;
    }

    const viewport = beginMenuScrollClip();
    const shellLeft = viewport && typeof viewport.left === 'number' ? viewport.left : 14;
    const shellRight = viewport && typeof viewport.right === 'number' ? viewport.right : (W - 14);
    const sx = shellLeft + 6;
    const sw = Math.max(240, shellRight - shellLeft - 12);
    const contentStartY = Math.max(H * 0.16, (viewport ? viewport.top + 12 : H * 0.16));
    let y = contentStartY;
    const objective = getObjectiveState();

    X.fillStyle = 'rgba(0,0,0,0.56)';
    roundRect(sx, y, sw, 92, 12); X.fill();
    X.strokeStyle = 'rgba(255,255,255,0.10)';
    X.lineWidth = 1.2;
    roundRect(sx, y, sw, 92, 12); X.stroke();

    const userScore = currentUserScore();
    const tier = getCompetitiveTier(userScore);

    X.textAlign = 'left';
    X.textBaseline = 'middle';
    X.fillStyle = 'rgba(255,255,255,0.55)';
    X.font = '11px -apple-system, system-ui, sans-serif';
    X.fillText(currentUserName() + '  Recorde ' + userScore, sx + 14, y + 16);

    X.fillStyle = '#fff';
    X.font = 'bold 28px -apple-system, system-ui, sans-serif';
    X.fillText(fmtRank(state.summary && state.summary.user_rank), sx + 14, y + 44);

    X.fillStyle = tier.color;
    X.font = 'bold 12px -apple-system, system-ui, sans-serif';
    X.fillText(tier.name, sx + 14, y + 68);

    X.textAlign = 'center';
    X.fillStyle = 'rgba(255,255,255,0.52)';
    X.font = '10px -apple-system, system-ui, sans-serif';
    X.fillText('JOGADORES', W / 2, y + 16);
    X.fillStyle = '#fff';
    X.font = 'bold 18px -apple-system, system-ui, sans-serif';
    X.fillText(String(state.summary && state.summary.total_players || 0), W / 2, y + 39);

    X.fillStyle = 'rgba(255,255,255,0.52)';
    X.font = '10px -apple-system, system-ui, sans-serif';
    X.fillText('PERCENTIL', W / 2, y + 62);
    X.fillStyle = '#fff';
    X.font = 'bold 13px -apple-system, system-ui, sans-serif';
    X.fillText((state.summary && state.summary.percentile != null ? state.summary.percentile + '%' : '--'), W / 2, y + 76);

    X.textAlign = 'right';
    X.fillStyle = 'rgba(255,255,255,0.52)';
    X.font = '10px -apple-system, system-ui, sans-serif';
    X.fillText(objective.right1Label, sx + sw - 14, y + 16);
    X.fillStyle = objective.right1Color;
    X.font = 'bold 18px -apple-system, system-ui, sans-serif';
    X.fillText(objective.right1Value, sx + sw - 14, y + 39);

    X.fillStyle = 'rgba(255,255,255,0.52)';
    X.font = '10px -apple-system, system-ui, sans-serif';
    X.fillText(objective.right2Label, sx + sw - 14, y + 62);
    X.fillStyle = objective.right2Color;
    X.font = 'bold 13px -apple-system, system-ui, sans-serif';
    X.fillText(objective.right2Value, sx + sw - 14, y + 76);

    y += 106;
    y += drawRivalPanel(sx, y, sw);

    X.textAlign = 'left';
    X.fillStyle = '#ff6b9d';
    X.font = 'bold 12px -apple-system, system-ui, sans-serif';
    X.fillText('TOPO GLOBAL', sx, y);
    y += 10;

    for (const row of (state.top || []).slice(0, 3)) {
      drawCompetitiveRow(row, sx, y, sw, 42, 'top');
      y += 48;
    }

    y += 4;
    X.fillStyle = '#00f5d4';
    X.font = 'bold 12px -apple-system, system-ui, sans-serif';
    X.fillText(getDisplayTitle(), sx, y);
    y += 10;

    const shownRows = getDisplayRows();
    if (shownRows.length) {
      for (const row of shownRows.slice(0, 4)) {
        drawCompetitiveRow(row, sx, y, sw, 38, 'around');
        y += 44;
      }
    } else {
      X.fillStyle = 'rgba(255,255,255,0.46)';
      X.font = '11px -apple-system, system-ui, sans-serif';
      X.fillText('Envie um score para entrar na disputa.', sx, y + 18);
      y += 40;
    }

    y += 4;

    X.fillStyle = 'rgba(0,0,0,0.52)';
    roundRect(sx, y, sw, 56, 10); X.fill();
    X.strokeStyle = 'rgba(255,255,255,0.08)';
    X.lineWidth = 1;
    roundRect(sx, y, sw, 56, 10); X.stroke();

    X.textAlign = 'left';
    X.fillStyle = 'rgba(255,255,255,0.55)';
    X.font = '10px -apple-system, system-ui, sans-serif';
    X.fillText('OBJETIVO IMEDIATO', sx + 12, y + 16);

    X.fillStyle = '#fff';
    X.font = 'bold 13px -apple-system, system-ui, sans-serif';
    X.fillText(objective.message, sx + 12, y + 35);

    X.fillStyle = 'rgba(255,255,255,0.42)';
    X.font = '10px -apple-system, system-ui, sans-serif';
    X.fillText(objective.sub, sx + 12, y + 49);

    y += 68;
    endMenuScrollClip();
    setMenuScrollBounds(contentStartY, y, viewport);
    drawMenuScrollBar(viewport);
    drawMenuScrollFades(viewport);
  }

  window.loadCompetitiveRankings = loadCompetitiveRankings;
  window.drawCompetitiveRankingMenu = drawCompetitiveRankingMenu;
  window.drawMetaProgressRankingMenu = drawCompetitiveRankingMenu;
  loadRankings = loadCompetitiveRankings;
})();
