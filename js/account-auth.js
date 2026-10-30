(function () {
  'use strict';

  const config = window.CV_GAMES_SUPABASE;
  const createClient = window.supabase?.createClient;
  const client = config?.url && config?.publicKey && createClient
    ? createClient(config.url, config.publicKey, {
      auth: {
        storageKey: 'cv-games-auth',
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false
      }
    })
    : null;

  const isOwner = (user) => user?.app_metadata?.cv_profile === 'educvv';

  async function getOwnerSession() {
    if (!client) return null;
    const { data, error } = await client.auth.getSession();
    if (error || !data.session) return null;
    const { data: userData, error: userError } = await client.auth.getUser(data.session.access_token);
    if (userError || !isOwner(userData.user)) {
      await client.auth.signOut({ scope: 'local' });
      return null;
    }
    return { ...data.session, user: userData.user };
  }

  async function signIn(email, password) {
    if (!client) throw new Error('O serviço de login não está disponível agora.');
    const normalizedEmail = String(email || '').trim().toLocaleLowerCase('pt-BR');
    const { data, error } = await client.auth.signInWithPassword({ email: normalizedEmail, password: String(password || '') });
    if (error) throw error;
    if (!isOwner(data.user)) {
      await client.auth.signOut({ scope: 'local' });
      throw new Error('Esta conta não está autorizada para o perfil educvv.');
    }
    return data.session;
  }

  async function signOut() {
    if (!client) return;
    const { error } = await client.auth.signOut({ scope: 'local' });
    if (error) throw error;
  }

  window.CV_GAMES_AUTH = Object.freeze({ client, isOwner, getOwnerSession, signIn, signOut });
}());
