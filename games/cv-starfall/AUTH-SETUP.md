# Configurar o acesso do perfil educvv

O acesso usa Supabase Auth para proteger o recorde `educvv` e o progresso do hangar. O placar continua público para leitura; os apelidos de teste da turma podem gravar sem login enquanto esta fase de testes estiver ativa.

1. Nas configurações de Authentication, desative o cadastro público de novos usuários. O acesso do perfil é somente para a conta criada pelo dono.
2. No painel do Supabase, abra **Authentication → Users → Add user**. Crie seu usuário, confirme o e-mail e defina uma senha nova e exclusiva diretamente no painel. Não coloque a senha em arquivos, mensagens ou no GitHub.
3. No **SQL Editor**, marque a conta como dona do perfil. Troque o texto de exemplo pelo e-mail usado no passo 2 e execute este comando uma vez:

   ```sql
   update auth.users
   set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"cv_profile":"educvv"}'::jsonb
   where email = 'SEU_EMAIL_DE_LOGIN';
   ```

   Confirme que o editor informou **UPDATE 1**. Se aparecer **UPDATE 0**, confira o e-mail antes de seguir.

4. Ainda no **SQL Editor**, execute novamente o conteúdo atualizado de `supabase-schema.sql`. Isso limita `educvv` à conta autenticada, permite gravações de teste para os apelidos listados no arquivo, mantém o armazenamento do hangar privado e cria a tabela para sincronizar as preferências do CV STARFALL pelo apelido.
5. Para atualizar uma instalação que já existe, execute também `starfall-score-admin-migration.sql` uma vez no **SQL Editor**. Ela adiciona o registro de horários, as posições manuais e as funções seguras de administração do placar.
6. Para ativar o perfil **Poder**, crie uma conta separada em **Authentication → Users → Add user**, confirme o e-mail e defina uma senha. Depois, no **SQL Editor**, associe essa conta ao perfil protegido, trocando o e-mail de exemplo:

   ```sql
   update auth.users
   set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"cv_profile":"poder"}'::jsonb
   where email = 'EMAIL_DA_CONTA_PODER';
   ```

   Confirme que aparece **UPDATE 1**. O login dessa conta no Perfil seleciona automaticamente o perfil Poder. Digitar apenas “poder” como apelido local não libera as ações administrativas: o placar valida também a conta autenticada no Supabase.
7. Publique os arquivos do site. Em `Perfil`, entre com a conta correspondente. Para encerrar o acesso no aparelho, use **Sair da conta**.

Os demais pilotos devem usar no Perfil um destes apelidos: KAUAN B, EDUARDO F, LUIZ G, YAGO K, JOHNATA H, FELYPE J, JOAO P, NATAN R, ISMAIL S, BRENDO T, ADRYAN V, STORM, HIAGO A, CYPHER ou NYS. A comparação ignora maiúsculas e minúsculas, e todos os nomes aparecem em maiúsculas no placar. O apelido antigo geovanagamer099 é convertido para STORM. Esses perfis gravam no placar e sincronizam as preferências pelo apelido sem conta; qualquer pessoa que conheça um apelido autorizado pode se passar por ele, alterar preferências e enviar um recorde. A lista é adequada para testes entre conhecidos, não para um ranking competitivo seguro.

Para migrar a linha antiga do placar e atualizar as permissões do banco já existente, execute `leaderboard-hiago-storm-migration.sql` uma vez no SQL Editor do Supabase. HIAGO A poderá publicar um recorde depois de concluir uma missão; nenhum resultado fictício é criado.

O perfil Poder pode apagar todos os recordes ou mover pilotos uma posição para cima ou para baixo. Essas ações passam por funções do banco que exigem a conta autenticada marcada com `cv_profile=poder`; o acesso anônimo consegue ler e publicar recordes autorizados, mas não consegue alterar a ordem manual nem apagar o placar.

Para sincronizar a Flame Storm como nave equipada entre dispositivos, execute `flamestorm-ship-migration.sql` uma vez no SQL Editor do Supabase. O acesso à nave continua limitado aos perfis Storm, educvv dev e educvv dev1 no jogo.

O código temporário do hangar libera as naves secretas somente neste aparelho. Ele é uma conveniência para os testes, não uma proteção: como o jogo roda no navegador, o código pode ser encontrado no código publicado. Remova essa opção quando a fase de teste terminar.

Os códigos de naves usados no banco são: 1 Aurora, 2 Aegis, 3 Chronos, 4 Tempestade, 5 Flashblade, 6 Bastião Rubro, 7 Eclipse, 8 Saurion, 9 Prisma Real (exclusiva da conta autorizada `educvv`), 10 Ferrum, 11 reservado à forma interna Mahoraga e 12 Umbra. A conta sincroniza apenas as naves desbloqueadas, nave equipada e melhor onda concluída. Favoritos, estatísticas, histórico e conquistas continuam locais em cada aparelho.

