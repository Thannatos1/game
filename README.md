# Órbita - versão modular fiel

Baseado diretamente no arquivo original enviado pelo usuário, preservando o comportamento do jogo.

## Estrutura
- `index.html`
- `js/core.js`
- `js/services.js`
- `js/data.js`
- `js/game.js`
- `js/render.js`
- `js/main.js`

## Correções mínimas aplicadas
1. Corrigido crash de render em skins com acessórios que usavam a variável `r` fora de escopo.
2. Corrigida contagem duplicada de partidas (`totalGames`) ao iniciar/reiniciar.
3. `devicePixelRatio` passa a ser recalculado em `resize()`.

## O que foi preservado
- gameplay
- físicas
- menus
- áudio
- sistema de ranking/auth
- skins, fundos, conquistas
- UI e timings

## Observação
Abra via servidor estático (por exemplo, VS Code Live Server, `python -m http.server`, etc.).
