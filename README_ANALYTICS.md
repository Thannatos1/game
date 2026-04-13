1. Rode analytics.sql no SQL Editor do Supabase.
2. Substitua os arquivos js/services.js, js/game.js e js/render.js.
3. Eventos enviados: app_open, auth_sign_in_click, auth_signed_in, auth_signed_out, nickname_set, game_start, phase_reached, gold_capture, powerup_collected, game_over, new_record, score_submitted.
4. A fila de analytics usa localStorage para sobreviver a offline/refresh e flush assíncrono para não travar a gameplay.
