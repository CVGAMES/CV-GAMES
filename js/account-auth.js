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

  const profileClaim = (user) => String(user?.app_metadata?.cv_profile || '').trim().toLocaleLowerCase('pt-BR');
  const isOwner = (user) => profileClaim(user) === 'educvv';
  const isScoreAdmin = (user) => profileClaim(user) === 'poder';
  const isAuthorizedAccount = (user) => isOwner(user) || isScoreAdmin(user);

  async function getAuthorizedSession() {
    if (!client) return null;
    const { data, error } = await client.auth.getSession();
    if (error || !data.session) return null;
    const { data: userData, error: userError } = await client.auth.getUser(data.session.access_token);
    if (userError || !isAuthorizedAccount(userData.user)) {
      await client.auth.signOut({ scope: 'local' });
      return null;
    }
    return { ...data.session, user: userData.user };
  }

  async function getOwnerSession() {
    const session = await getAuthorizedSession();
    return isOwner(session?.user) ? session : null;
  }

  async function getPowerSession() {
    const session = await getAuthorizedSession();
    return isScoreAdmin(session?.user) ? session : null;
  }

  async function signIn(email, password) {
    if (!client) throw new Error('O serviço de login não está disponível agora.');
    const normalizedEmail = String(email || '').trim().toLocaleLowerCase('pt-BR');
    const { data, error } = await client.auth.signInWithPassword({ email: normalizedEmail, password: String(password || '') });
    if (error) throw error;
    const { data: userData, error: userError } = await client.auth.getUser(data.session.access_token);
    if (userError || !isAuthorizedAccount(userData.user)) {
      await client.auth.signOut({ scope: 'local' });
      throw new Error('Esta conta não está autorizada para um perfil protegido do CV GAMES.');
    }
    return { ...data.session, user: userData.user };
  }

  async function signOut() {
    if (!client) return;
    const { error } = await client.auth.signOut({ scope: 'local' });
    if (error) throw error;
  }

  window.CV_GAMES_AUTH = Object.freeze({ client, isOwner, isScoreAdmin, getAuthorizedSession, getOwnerSession, getPowerSession, signIn, signOut });
}());

