
(function(){
  let rankingTop = [];
  let rankingAround = [];
  let rankingSummary = null;

  function getCompetitiveTier(score){
    score = Number(score || 0);
    if (score >= 250) return { name:'LENDÁRIO', color:'#ffd32a' };
    if (score >= 150) return { name:'DIAMANTE', color:'#b9f6ff' };
    if (score >= 90) return { name:'OURO', color:'#ffd32a' };
    if (score >= 45) return { name:'PRATA', color:'#dfe6f0' };
    if (score >= 20) return { name:'BRONZE', color:'#cd7f32' };
    return { name:'INICIANTE', color:'#7bed9f' };
  }

  function fmtRank(n){
    if (!n || n < 1) return '--';
    return '#' + n;
  }

  async function loadRankingsCompetitive(){
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

      rankingTop = Array.isArray(data?.top) ? data.top : [];
      rankingAround = Array.isArray(data?.around_me) ? data.around_me : [];
      rankingSummary = data?.summary || null;

      rankings = rankingTop.slice();
      userPosition = (rankingSummary && Number.isFinite(Number(rankingSummary.user_rank)))
        ? Number(rankingSummary.user_rank) - 1
        : -1;

      if (typeof trackEvent === 'function') {
        trackEvent('ranking_loaded', {
          total_players: Number(rankingSummary?.total_players || 0),
          user_rank: Number(rankingSummary?.user_rank || 0),
          source: 'competitive'
        });
      }

      return true;
    } catch (e) {
      rankingsError = 'Erro ao carregar';
      console.error('[Orbita] loadRankingsCompetitive failed', e);
      if (typeof trackEvent === 'function') {
        trackEvent('ranking_load_failed', {
          source: 'competitive',
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
    const rank = Number(r.rank || 0);
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
    if (isUser) {
      X.fillText('VOCÊ', x + 82, y + h/2 + 9);
    } else {
      X.fillText(mode === 'top' ? 'TOP GLOBAL' : 'PERTO DE VOCÊ', x + 82, y + h/2 + 9);
    }

    X.textAlign = 'right';
    X.fillStyle = '#fff';
    X.font = 'bold 17px -apple-system, system-ui, sans-serif';
    X.fillText(String(r.score || 0), x + w - 12, y + h/2 - 1);
  }

  function drawRankingMenuCompetitive(){
    drawTopStatusBadges();
    X.textAlign='center';X.textBaseline='middle';

    X.fillStyle='#e0e0ff';
    X.font='bold 26px -apple-system, system-ui, sans-serif';
    X.shadowColor='#ff6b9d';X.shadowBlur=15;
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

    X.fillStyle='rgba(0,0,0,0.56)';
    roundRect(sx, y, sw, 86, 12); X.fill();
    X.strokeStyle='rgba(255,255,255,0.10)';
    X.lineWidth=1.2;
    roundRect(sx, y, sw, 86, 12); X.stroke();

    const userScore = Number(rankingSummary?.user_score || best || 0);
    const tier = getCompetitiveTier(userScore);
    X.textAlign='left'; X.textBaseline='middle';
    X.fillStyle='rgba(255,255,255,0.55)';
    X.font='11px -apple-system, system-ui, sans-serif';
    X.fillText((playerName || 'JOGADOR') + ' · Recorde ' + userScore, sx+14, y+16);

    X.fillStyle='#fff';
    X.font='bold 28px -apple-system, system-ui, sans-serif';
    X.fillText(fmtRank(rankingSummary?.user_rank), sx+14, y+46);

    X.fillStyle=tier.color;
    X.font='bold 12px -apple-system, system-ui, sans-serif';
    X.fillText(tier.name, sx+14, y+68);

    X.textAlign='center';
    X.fillStyle='rgba(255,255,255,0.52)';
    X.font='10px -apple-system, system-ui, sans-serif';
    X.fillText('JOGADORES', W/2, y+18);
    X.fillStyle='#fff';
    X.font='bold 18px -apple-system, system-ui, sans-serif';
    X.fillText(String(rankingSummary?.total_players || 0), W/2, y+42);

    X.fillStyle='rgba(255,255,255,0.52)';
    X.font='10px -apple-system, system-ui, sans-serif';
    X.fillText('PERCENTIL', W/2, y+65);
    X.fillStyle='#fff';
    X.font='bold 13px -apple-system, system-ui, sans-serif';
    X.fillText((rankingSummary?.percentile != null ? rankingSummary.percentile + '%' : '--'), W/2, y+79);

    X.textAlign='right';
    X.fillStyle='rgba(255,255,255,0.52)';
    X.font='10px -apple-system, system-ui, sans-serif';
    X.fillText('PARA O PRÓXIMO', sx+sw-14, y+18);
    X.fillStyle='#00f5d4';
    X.font='bold 18px -apple-system, system-ui, sans-serif';
    X.fillText((rankingSummary?.points_to_next != null ? '+' + rankingSummary.points_to_next : '--'), sx+sw-14, y+42);

    X.fillStyle='rgba(255,255,255,0.52)';
    X.font='10px -apple-system, system-ui, sans-serif';
    X.fillText('PARA O TOP '+ String(rankingSummary?.top_limit || 5), sx+sw-14, y+65);
    X.fillStyle='#ffd32a';
    X.font='bold 13px -apple-system, system-ui, sans-serif';
    X.fillText((rankingSummary?.points_to_top != null ? '+' + rankingSummary.points_to_top : '--'), sx+sw-14, y+79);

    y += 100;

    X.textAlign='left';
    X.fillStyle='#ff6b9d';
    X.font='bold 12px -apple-system, system-ui, sans-serif';
    X.fillText('TOPO GLOBAL', sx, y);
    y += 10;

    const topRows = rankingTop.slice(0, 3);
    for (const r of topRows) {
      drawCompetitiveRow(r, sx, y, sw, 42, 'top');
      y += 48;
    }

    y += 4;
    X.fillStyle='#00f5d4';
    X.font='bold 12px -apple-system, system-ui, sans-serif';
    X.fillText('PERTO DE VOCÊ', sx, y);
    y += 10;

    if (rankingAround && rankingAround.length) {
      const shown = rankingAround.slice(0, 5);
      for (const r of shown) {
        drawCompetitiveRow(r, sx, y, sw, 38, 'around');
        y += 44;
      }
    } else {
      X.fillStyle='rgba(255,255,255,0.46)';
      X.font='11px -apple-system, system-ui, sans-serif';
      X.fillText('Jogue e envie score para entrar na disputa.', sx, y + 18);
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

    const nextName = rankingSummary?.next_better_name || 'próximo rival';
    const nextPts = rankingSummary?.points_to_next;
    const chaseText = (nextPts != null && nextPts > 0)
      ? ('Faça +' + nextPts + ' para passar ' + nextName)
      : 'Você já está na frente do próximo corte visível';

    X.fillStyle='#fff';
    X.font='bold 13px -apple-system, system-ui, sans-serif';
    X.fillText(chaseText, sx+12, y+35);

    X.fillStyle='rgba(255,255,255,0.42)';
    X.font='10px -apple-system, system-ui, sans-serif';
    X.fillText('Agora o ranking serve para perseguir meta, não só consultar lista.', sx+12, y+49);
  }

  const _origLoadRankings = typeof loadRankings === 'function' ? loadRankings : async function(){};
  loadRankings = async function(){
    return loadRankingsCompetitive();
  };

  drawRankingMenu = drawRankingMenuCompetitive;
})();
