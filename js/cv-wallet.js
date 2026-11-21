(function () {
  'use strict';

  const storagePrefix = 'cv-games-cv-coin-v1:';
  const maxBalance = 10000000;
  const normalizeNickname = (value) => String(value || 'Jogador')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase('pt-BR') || 'jogador';
  const isUnlimitedProfile = (nickname = currentNickname()) => normalizeNickname(nickname) === 'teste';
  const currentNickname = () => {
    try {
      const profile = window.CV_GAMES_PROFILE?.getProfile?.()
        || JSON.parse(localStorage.getItem('cv-games-profile') || 'null');
      return normalizeNickname(profile?.nickname);
    } catch {
      return 'jogador';
    }
  };
  const storageKey = (nickname = currentNickname()) => storagePrefix + encodeURIComponent(normalizeNickname(nickname));
  const getBalance = (nickname) => {
    if (isUnlimitedProfile(nickname || currentNickname())) return Infinity;
    try {
      const value = Number(localStorage.getItem(storageKey(nickname)) || 0);
      return Number.isFinite(value) ? Math.max(0, Math.min(maxBalance, Math.floor(value))) : 0;
    } catch {
      return 0;
    }
  };
  const refreshBadges = () => {
    const nickname = currentNickname();
    const balance = isUnlimitedProfile(nickname) ? '∞' : getBalance(nickname).toLocaleString('pt-BR');
    document.querySelectorAll('[data-cv-coin-balance]').forEach((node) => {
      node.textContent = balance;
      node.setAttribute('aria-label', `${balance} CV Coins`);
    });
  };
  const setBalance = (value, nickname) => {
    if (isUnlimitedProfile(nickname || currentNickname())) {
      refreshBadges();
      return Infinity;
    }
    const safeValue = Math.max(0, Math.min(maxBalance, Math.floor(Number(value) || 0)));
    const key = storageKey(nickname);
    try { localStorage.setItem(key, String(safeValue)); } catch { /* O saldo continua disponível nesta sessão. */ }
    refreshBadges();
    try {
      window.dispatchEvent(new CustomEvent('cv-games-wallet-change', {
        detail: { currency: 'cv-coin', balance: safeValue, nickname: normalizeNickname(nickname || currentNickname()) }
      }));
    } catch { /* O saldo permanece salvo mesmo sem suporte a eventos personalizados. */ }
    return safeValue;
  };
  const addCoins = (amount, nickname) => isUnlimitedProfile(nickname || currentNickname())
    ? Infinity
    : setBalance(getBalance(nickname) + Math.max(0, Math.floor(Number(amount) || 0)), nickname);
  const spendCoins = (amount, nickname) => {
    if (isUnlimitedProfile(nickname || currentNickname())) return true;
    const cost = Math.max(0, Math.floor(Number(amount) || 0));
    const balance = getBalance(nickname);
    if (balance < cost) return false;
    setBalance(balance - cost, nickname);
    return true;
  };

  window.CV_GAMES_WALLET = Object.freeze({ currency: 'CV Coin', getBalance, setBalance, addCoins, spendCoins, hasUnlimitedBalance: isUnlimitedProfile, refresh: refreshBadges });
  window.addEventListener('cv-games-profile-change', refreshBadges);
  window.addEventListener('cv-games-wallet-change', refreshBadges);
  window.addEventListener('storage', (event) => {
    if (!event.key || event.key.startsWith(storagePrefix) || event.key === 'cv-games-profile') refreshBadges();
  });
  refreshBadges();
}());
