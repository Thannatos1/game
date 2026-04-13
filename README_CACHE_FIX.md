# Órbita - pacote consolidado com correção de cache/PWA

Este pacote junta os arquivos atuais em uma estrutura única e inclui um `sw.js` corrigido para reduzir o problema de arquivos JS antigos presos no cache.

## O que mudou
- `sw.js` com `CACHE_NAME = orbita-pwa-v3`
- estratégia `network-first` para HTML/JS/CSS/manifest
- `index.html` com `mobile-web-app-capable`

## Antes de testar
Se você já abriu uma versão antiga com PWA/service worker:
1. DevTools > Application > Service Workers > **Unregister**
2. DevTools > Application > Storage > **Clear site data**
3. Se instalou o app na tela inicial, remova a instalação antiga
4. Reabra a página e faça reload forçado

## Estrutura
- `index.html`
- `sw.js`
- `manifest.webmanifest`
- `icons/`
- `js/`
