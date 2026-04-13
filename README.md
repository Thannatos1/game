# Órbita modularizado

## Estrutura
- `index.html`
- `js/main.js`
- `js/game.js`
- `js/data.js`
- `js/services.js`
- `supabase_hardening.sql`

## Correções aplicadas
- Acessórios/skins que usavam `r` fora de escopo agora recebem o raio corretamente.
- `totalGames` agora incrementa apenas quando a partida termina.
- `devicePixelRatio` é recalculado no `resize()`.
- O reset do progresso local usa modal dentro do canvas, sem `confirm()` nativo.
- O código foi dividido em módulos básicos para manutenção.

## Como rodar
Use um servidor estático local, por exemplo:

```bash
python -m http.server 8000
```

Depois abra `http://localhost:8000/orbita_modular/`.

## Observação
O pacote entregue é uma base modularizada com as correções principais. Como o projeto original era um arquivo único grande, esta versão prioriza estabilidade e organização em vez de reproduzir 100% de todas as telas e efeitos avançados do original.
