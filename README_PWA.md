# PWA / Install - Órbita

Este pacote adiciona:
- `manifest.webmanifest`
- `sw.js` (service worker)
- `icons/icon-192.png`
- `icons/icon-512.png`
- `js/pwa.js`
- ajustes no `index.html`
- botão de instalação nas Configurações

## Como usar

Substitua os arquivos do projeto por este pacote.

## Requisitos

- publicar em HTTPS
- abrir pelo navegador do celular
- para Android/Chrome, o botão de instalar aparece quando o navegador libera `beforeinstallprompt`
- para iPhone/iPad, o menu mostra instruções de “Adicionar à Tela de Início”

## Observações

- o service worker faz cache do shell do app
- o jogo continua funcionando sem mudar o gameplay
- o Supabase continua vindo do CDN, então o modo offline depende do cache do navegador e do fallback do app
