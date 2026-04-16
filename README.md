# Orbita

Projeto arcade web em Canvas 2D com autenticacao/ranking via Supabase e suporte PWA.

## Boot atual

O jogo ainda roda com scripts classicos e ordem fixa em [index.html](./index.html).

Sequencia principal:

1. `js/app_bootstrap.js`
2. `js/core.js`
3. `js/services.js`
4. `js/pwa.js`
5. `js/data.js`
6. `js/game.js`
7. `js/render.js`
8. `js/ui e patches`
9. `js/main.js`

`main.js` inicia o loop. `core.js` define canvas, audio, utilitarios e estado global base. `game.js` controla reset/update/gameplay. `render.js` desenha o frame. `services.js` concentra Supabase, auth, analytics e ranking. `data.js` concentra save local, unlocks, missoes e eventos.

## Mapa de modulos

- `index.html`: shell principal, CSP e ordem de carga.
- `js/app_bootstrap.js`: nova fachada `window.App` para config, storage e services.
- `js/core.js`: canvas, audio, helpers e estado global compartilhado.
- `js/services.js`: Supabase, auth, nickname, ranking, analytics e persistencia de sessoes online.
- `js/pwa.js`: registro de service worker e fluxo de instalacao.
- `js/data.js`: save local, unlocks, achievements, missoes e eventos.
- `js/game.js`: regras da partida, reset, startRun, capture, die e update.
- `js/render.js`: draw principal e composicao visual.
- `js/*_ui.js`: UI especializada fora do render principal.
- `js/*patch*.js`: extensoes por monkey-patching ou hooks globais.
- `sw.js`: cache do app shell e fallback offline.
- `analytics.sql`: schema e funcoes RPC do backend.

## Contratos atuais

- O projeto ainda depende de globais compartilhados entre arquivos.
- Muitos patches sobrescrevem funcoes como `reset`, `capture`, `startRun` e `loadRankings`.
- O cache offline e manual: qualquer novo arquivo JS precisa entrar em `sw.js`.
- O estado persistido local continua em `localStorage`, mas agora passa por `App.storage` nos pontos centrais.

## Nova camada de migracao

`js/app_bootstrap.js` introduz uma fachada minima para reduzir acoplamento antes da migracao completa para modulos:

- `App.config`
  - `supabase.url`
  - `supabase.anonKey`
  - `storageKeys.*`
  - `pwa.serviceWorkerPath`
- `App.storage`
  - `getLocalText/getLocalJson`
  - `setLocalText/setLocalJson`
  - `getSessionText/getSessionJson`
  - `setSessionText/setSessionJson`
  - `removeLocal/removeSession`
- `App.services`
  - registro incremental de servicos estaveis como auth, analytics, ranking, save e PWA

Essa camada nao substitui os globais antigos ainda. Ela funciona como ponte para a migracao por etapas.

## Riscos tecnicos ainda abertos

- `render.js` e o maior ponto de concentracao de complexidade.
- `game.js` e `core.js` ainda compartilham muito estado mutavel.
- Parte das extensoes depende de monkey-patching em vez de API explicita.
- A CSP ainda permite `unsafe-inline` e `unsafe-eval`.
- O service worker faz fallback amplo para `index.html`, o que pode mascarar erro real de asset.

## Smoke test manual

1. Abrir o jogo e confirmar que o menu principal renderiza.
2. Iniciar uma run normal.
3. Capturar alguns nos e morrer.
4. Voltar ao menu e verificar persistencia local.
5. Testar login Google em ambiente online.
6. Abrir ranking.
7. Colocar offline e validar degradacao de analytics/ranking.
8. Reabrir online e validar flush de fila pendente.
9. Testar prompt de instalacao PWA quando disponivel.

## Proximo passo sugerido

Sprint 1 continua com:

1. extracao de um container de estado;
2. remocao gradual de acessos diretos a globais em `services/data/render`;
3. troca dos monkey-patches criticos por eventos/hooks oficiais.
