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

4. Ainda no **SQL Editor**, execute novamente o conteúdo atualizado de `supabase-schema.sql`. Isso limita `educvv` à conta autenticada, permite gravações de teste para os apelidos listados no arquivo e mantém o armazenamento do hangar privado.
5. Publique os arquivos do site. Em `Perfil`, entre com o e-mail e a senha definidos no Supabase. Para encerrar o acesso no aparelho, use **Sair da conta**.

Os demais pilotos devem usar no Perfil um destes apelidos: KAUAN B, EDUARDO F, LUIZ G, YAGO K, JOHNATA H, FELYPE J, JOAO P, NATAN R, ISMAIL S, BRENDO T, ADRYAN V, geovanagamer099, Cypher ou nys. A comparação ignora maiúsculas e minúsculas. Esses perfis gravam no placar sem conta; por isso, qualquer pessoa que conheça um apelido autorizado pode se passar por ele e enviar um recorde. A lista é adequada para testes entre conhecidos, não para um ranking competitivo seguro.

O código temporário do hangar libera as naves secretas somente neste aparelho. Ele é uma conveniência para os testes, não uma proteção: como o jogo roda no navegador, o código pode ser encontrado no código publicado. Remova essa opção quando a fase de teste terminar.

Os códigos de naves usados no banco são: 1 Aurora, 2 Aegis, 3 Chronos, 4 Tempestade, 5 Flashblade, 6 Bastião Rubro, 7 Eclipse e 8 Saurion. A conta sincroniza apenas as naves desbloqueadas, nave equipada e melhor onda concluída. Favoritos, estatísticas, histórico e conquistas continuam locais em cada aparelho.
