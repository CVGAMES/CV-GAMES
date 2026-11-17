# CV XADREZ ARENA 3D — integração CV GAMES

O jogo original em React, TypeScript, Three.js e chess.js fica nesta pasta. O portal o abre em `portal.html`, que carrega o pacote estático de `public-build/` dentro de um iframe.

## Gerar e executar

Requer Node.js 20.19 ou mais recente.

```bash
npm install
npm run dev
```

Para conferir os tipos e gerar a versão que o portal usa:

```bash
npm run lint
npm run build
```

O build é criado em `public-build/`. Essa pasta precisa acompanhar o envio do site ao GitHub Pages, porque não há um servidor de build na hospedagem estática. `portal.html` mostra uma mensagem explicativa se ela estiver ausente.

Não é necessário configurar chave do Gemini: a versão atual do jogo funciona localmente, sem depender do Google AI Studio em tempo de execução.

## Acesso de teste

O catálogo e o próprio jogo aceitam os perfis `educvv dev`, `educvv dev1` e `lista`. O jogo reutiliza o perfil local `cv-games-profile` do CV GAMES; não cria outro login. Como essa checagem acontece no navegador e usa armazenamento local, é uma barreira de conveniência para testes, não um controle de segurança para dados confidenciais. Os arquivos do jogo ainda ficam disponíveis para quem tiver o endereço.

## Publicar

1. Execute `npm run lint` e `npm run build` nesta pasta.
2. Confirme que `games/cv-xadrez-arena/public-build/` foi incluída no commit.
3. Envie o portal junto com o restante do CV GAMES para a hospedagem habitual.
4. Entre com um dos três perfis autorizados, abra o CV XADREZ ARENA 3D e confirme o carregamento do tabuleiro, os controles, a IA e o áudio.

Os arquivos de configuração e cache do AI Studio não são necessários para o site. A pasta `.aistudio/` e `.pnpm-store/` ficam ignoradas; `public-build/` é intencionalmente mantida no projeto.
