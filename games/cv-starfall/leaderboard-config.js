/* Perfil de teste permitido no placar. URL e chave pública ficam no config compartilhado. */
window.CV_STARFALL_SUPABASE = Object.freeze({
  ...(window.CV_GAMES_SUPABASE || {}),
  allowedNicknames: ['educvv']
});
