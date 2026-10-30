# Configurar o acesso do perfil educvv

O acesso usa Supabase Auth. Nenhuma senha fica no repositório. O ranking continua público para leitura, mas apenas a conta do dono pode gravar o resultado `educvv`.

1. Nas configurações de Authentication, desative o cadastro público de novos usuários. O acesso do perfil é somente para a conta criada pelo dono.
2. No painel do Supabase, abra **Authentication → Users → Add user**. Crie seu usuário, confirme o e-mail e defina uma senha nova e exclusiva diretamente no painel. Não coloque a senha em arquivos, mensagens ou no GitHub.
3. No **SQL Editor**, marque a conta como dona do perfil. Troque o texto de exemplo pelo e-mail usado no passo 2 e execute este comando uma vez:

   ```sql
   update auth.users
   set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"cv_profile":"educvv"}'::jsonb
   where email = 'SEU_EMAIL_DE_LOGIN';
   ```

   Confirme que o editor informou **UPDATE 1**. Se aparecer **UPDATE 0**, confira o e-mail antes de seguir.

4. Ainda no **SQL Editor**, execute novamente o conteúdo atualizado de `supabase-schema.sql`. Isso remove a gravação anônima antiga, limita o placar à conta autenticada e cria o armazenamento privado do hangar.
5. Publique os arquivos do site. Em `Perfil`, entre com o e-mail e a senha definidos no Supabase. Para encerrar o acesso no aparelho, use **Sair da conta**.

Os códigos de naves usados no banco são: 1 Aurora, 2 Aegis, 3 Chronos, 4 Tempestade, 5 Flashblade, 6 Bastião Rubro, 7 Eclipse e 8 Saurion. A conta sincroniza apenas as naves desbloqueadas, nave equipada e melhor onda concluída. Favoritos, estatísticas, histórico e conquistas continuam locais em cada aparelho.
