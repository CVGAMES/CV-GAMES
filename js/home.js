(function () {
  'use strict';

  const profileNickname = String(window.CV_GAMES_PROFILE?.getProfile?.()?.nickname || '')
    .trim().replace(/\s+/g, ' ').toLocaleLowerCase('pt-BR');
  window.addEventListener('pageshow', () => {
    const currentNickname = String(window.CV_GAMES_PROFILE?.getProfile?.()?.nickname || '')
      .trim().replace(/\s+/g, ' ').toLocaleLowerCase('pt-BR');
    if (currentNickname !== profileNickname) window.location.reload();
  });
  const orbitalProfileAllowed = profileNickname === 'educvv dev1';
  const turboProfileAllowed = ['educvv dev1', 'educvv dev'].includes(profileNickname);
  const labyrinthProfileAllowed = turboProfileAllowed;
  const catalog = (Array.isArray(window.CV_GAMES_CATALOG) ? window.CV_GAMES_CATALOG : [])
    .filter((game) => (game.id !== 'cv-dodge' || orbitalProfileAllowed)
      && (game.id !== 'cv-turbo-circuit' || turboProfileAllowed)
      && (game.id !== 'cv-labirinto' || labyrinthProfileAllowed));
  const stats = window.CV_GAMES_STATS;
  const favoriteStorageKey = 'cv-games-favorites';
  const themeStorageKey = 'cv-games-theme';
  const ownGamesPriority = ['cv-starfall', ...(labyrinthProfileAllowed ? ['cv-labirinto'] : []), 'cv-xadrez', 'cv-damas', 'cv-quadrados', 'cv-jogo-da-velha', 'nexus-rota-zero', 'cv-neon-breaker', 'cv-turbo-circuit', ...(orbitalProfileAllowed ? ['cv-dodge'] : [])];
  const filters = { category: 'todos', favoritesOnly: false };

  const getFavorites = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(favoriteStorageKey) || '[]');
      return new Set(Array.isArray(saved) ? saved : []);
    } catch {
      return new Set();
    }
  };

  let favorites = getFavorites();

  const notifyFavoritesChange = () => {
    window.dispatchEvent(new Event('cv-games-favorites-change'));
  };

  const saveFavorites = () => {
    try {
      localStorage.setItem(favoriteStorageKey, JSON.stringify([...favorites]));
      notifyFavoritesChange();
    } catch {
      // O portal continua utilizável se o navegador bloquear armazenamento local.
    }
  };

  const normalizeText = (value) => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim();

  const ratingStars = (rating) => `${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}`;

  const createCard = (game, options = {}) => {
    const isFavorite = favorites.has(game.id);
    const localStats = options.showLocalStats && typeof stats?.getGameStats === 'function'
      ? stats.getGameStats(game.id)
      : { visits: 0 };
    const localVisits = Number(localStats.visits) || 0;
    const localStatsLabel = localVisits === 1 ? 'acesso neste dispositivo' : 'acessos neste dispositivo';
    const card = document.createElement('article');
    card.className = 'game-card';
    card.dataset.gameId = game.id;
    card.dataset.category = game.categoryKey;
    if (game.imageFit === 'contain') card.dataset.imageFit = 'contain';
    card.innerHTML = `
      <div class="card-cover">
        <img src="${game.image}" alt="Capa de ${game.title}" loading="lazy">
        <span class="type-badge">${game.type}</span>
        ${game.exclusivo === true ? '<span class="exclusive-badge">⭐ Exclusivo CV GAMES</span>' : ''}
        <button class="card-favorite" type="button" data-favorite-id="${game.id}" aria-label="${isFavorite ? 'Remover' : 'Adicionar'} ${game.title} ${isFavorite ? 'dos' : 'aos'} favoritos" aria-pressed="${isFavorite}">${isFavorite ? '♥' : '♡'}</button>
      </div>
      <div class="card-body">
        <h3>${game.title}</h3>
        <p class="card-meta">${game.category}</p>
        <div class="stars" aria-label="Avaliação visual: ${game.rating} de 5 estrelas">${ratingStars(game.rating)}</div>
        ${localVisits > 0 ? `<p class="card-local-stats">🎮 ${localVisits} ${localStatsLabel}</p>` : ''}
        <a class="button button-primary" href="${game.href}"${game.externalPortal === true ? ' target="_blank" rel="noopener noreferrer"' : ''}${game.externalWarning === true ? ' data-external-warning="true"' : ''} data-play-game-id="${game.id}">${game.externalPortal === true ? 'Abrir site ↗' : 'Jogar'}</a>
      </div>
    `;

    const image = card.querySelector('img');
    image.addEventListener('error', () => {
      const fallback = document.createElement('div');
      fallback.className = 'cover-fallback';
      fallback.setAttribute('role', 'img');
      fallback.setAttribute('aria-label', `Capa indisponível de ${game.title}`);
      fallback.textContent = game.fallback;
      image.replaceWith(fallback);
    }, { once: true });

    return card;
  };

  const createEmptyState = () => {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML = `
      <span aria-hidden="true">😕</span>
      <div>
        <strong>Nenhum jogo encontrado</strong>
        <p>Tente pesquisar outro nome ou categoria.</p>
      </div>
      <button class="button button-secondary" type="button" data-clear-filters>Limpar filtros</button>
    `;
    return empty;
  };

  const renderGames = (targetId, games, options = {}) => {
    const target = document.getElementById(targetId);
    if (!target) return;

    if (!games.length) {
      target.replaceChildren(createEmptyState());
      return;
    }

    const fragment = document.createDocumentFragment();
    games.forEach((game) => fragment.appendChild(createCard(game, options)));
    target.replaceChildren(fragment);
  };

  // A seleção editorial mantém a seção útil antes do primeiro acesso local.
  const fallbackPopularGames = catalog.filter((game) => game.popular);
  const featuredPriority = ['cv-starfall', 'gx-launcher', 'cv-labirinto', 'cv-quadrados', 'cv-xadrez', 'cv-damas', 'bad-ice-cream', 'fireboy-watergirl', 'drive-mad', 'moto-x3m', 'geometry-jump'];

  const setupGxAnnouncement = () => {
    const dialog = document.querySelector('[data-gx-announcement]');
    if (!dialog) return;

    const storageKey = 'cv-games-gx-launcher-announcement-v5';
    try {
      if (localStorage.getItem(storageKey) === 'seen') return;
    } catch {
      // Se o navegador bloquear armazenamento, o anúncio ainda pode ser fechado nesta visita.
    }

    const closeDialog = () => {
      if (typeof dialog.close === 'function' && dialog.open) dialog.close();
      else dialog.removeAttribute('open');
    };

    dialog.querySelectorAll('[data-gx-close]').forEach((button) => button.addEventListener('click', closeDialog));
    dialog.querySelector('[data-gx-visit]')?.addEventListener('click', closeDialog);
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) closeDialog();
    });

    const showAnnouncement = () => {
      try {
        if (typeof dialog.showModal === 'function') dialog.showModal();
        else dialog.setAttribute('open', '');
        localStorage.setItem(storageKey, 'seen');
      } catch {
        dialog.setAttribute('open', '');
      }
    };

    window.setTimeout(showAnnouncement, 550);
  };

  const getFeaturedGames = () => {
    const featured = catalog.filter((game) => game.featured);
    const priorityIds = new Set(featuredPriority);
    const priorityGames = featuredPriority
      .map((id) => featured.find((game) => game.id === id))
      .filter(Boolean);
    return [...priorityGames, ...featured.filter((game) => !priorityIds.has(game.id))];
  };

  const renderStatisticsSections = () => {
    const recentlyPlayed = typeof stats?.getRecentlyPlayed === 'function'
      ? stats.getRecentlyPlayed(catalog, 6)
      : [];
    const continueSection = document.querySelector('[data-continue-section]');
    const continueGrid = document.getElementById('continue-games');

    if (continueSection) continueSection.hidden = recentlyPlayed.length === 0;
    if (recentlyPlayed.length) {
      renderGames('continue-games', recentlyPlayed, { showLocalStats: true });
      const continueDescription = document.querySelector('[data-continue-description]');
      if (continueDescription) continueDescription.textContent = 'Seus últimos jogos acessados neste dispositivo.';
    } else if (continueGrid) {
      continueGrid.replaceChildren();
    }

    const mostPlayed = typeof stats?.getMostPlayed === 'function'
      ? stats.getMostPlayed(catalog, fallbackPopularGames.length)
      : [];
    const usesLocalStats = mostPlayed.length > 0;
    renderGames('popular-games', usesLocalStats ? mostPlayed : fallbackPopularGames, { showLocalStats: usesLocalStats });

    const popularDescription = document.querySelector('[data-popular-description]');
    if (popularDescription) {
      popularDescription.textContent = usesLocalStats
        ? 'Ranking local ordenado por acessos neste dispositivo.'
        : 'Sem histórico local, exibimos uma seleção inicial do CV GAMES.';
    }
  };

  const getSearchableText = (game) => [
    game.title,
    game.category,
    game.description,
    ...(Array.isArray(game.tags) ? game.tags : [])
  ].join(' ');

  const matchesCategory = (game) => {
    if (filters.category === 'todos') return true;
    if (filters.category === 'pc-fraco') return game.pcFraco === true;
    return game.categoryKey === filters.category;
  };

  const getFilteredGames = () => {
    const games = catalog.filter((game) => {
      const matchesFavorite = !filters.favoritesOnly || favorites.has(game.id);
      return matchesCategory(game) && matchesFavorite;
    });
    if (filters.favoritesOnly) {
      const priority = new Map(ownGamesPriority.map((id, index) => [id, index]));
      const catalogOrder = new Map(catalog.map((game, index) => [game.id, index]));
      games.sort((a, b) => (priority.get(a.id) ?? ownGamesPriority.length + catalogOrder.get(a.id))
        - (priority.get(b.id) ?? ownGamesPriority.length + catalogOrder.get(b.id)));
    }
    return games;
  };

  const hasActiveFilters = () => Boolean(filters.category !== 'todos' || filters.favoritesOnly);

  const refreshFavoriteControls = () => {
    document.querySelectorAll('[data-favorite-id]').forEach((button) => {
      const isFavorite = favorites.has(button.dataset.favoriteId);
      button.setAttribute('aria-pressed', String(isFavorite));
      button.textContent = isFavorite ? '♥' : '♡';
      button.setAttribute('aria-label', isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos');
    });

    const count = document.querySelector('[data-favorite-count]');
    if (count) count.textContent = String(catalog.reduce((total, game) => total + Number(favorites.has(game.id)), 0));
  };

  const updateFilterInterface = (resultCount) => {
    const active = hasActiveFilters();
    document.body.classList.toggle('is-filtering', active);

    document.querySelectorAll('[data-category-filter]').forEach((button) => {
      const selected = button.dataset.categoryFilter === filters.category;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });

    const favoriteToggle = document.querySelector('[data-favorites-toggle]');
    if (favoriteToggle) {
      favoriteToggle.classList.toggle('is-active', filters.favoritesOnly);
      favoriteToggle.setAttribute('aria-pressed', String(filters.favoritesOnly));
      favoriteToggle.setAttribute('aria-label', filters.favoritesOnly ? 'Mostrar todos os jogos' : 'Mostrar somente favoritos');
      favoriteToggle.setAttribute('title', filters.favoritesOnly ? 'Mostrar todos os jogos' : 'Mostrar somente favoritos');
    }

    const resultLabel = document.querySelector('[data-results-count]');
    if (resultLabel) resultLabel.textContent = `${resultCount} ${resultCount === 1 ? 'jogo encontrado' : 'jogos encontrados'}`;

    const title = document.querySelector('[data-catalog-title]');
    if (title) title.textContent = filters.favoritesOnly ? '❤️ Favoritos' : '🎮 Todos os jogos';

    const resetButton = document.querySelector('[data-clear-filters]');
    if (resetButton && resetButton.parentElement?.classList.contains('catalog-summary')) {
      resetButton.hidden = !active;
    }

  };

  const applyFilters = () => {
    const games = getFilteredGames();
    renderGames('all-games', games);
    refreshFavoriteControls();
    updateFilterInterface(games.length);
  };

  const clearFilters = () => {
    filters.category = 'todos';
    filters.favoritesOnly = false;
    const input = document.querySelector('[data-game-search]');
    if (input) input.value = '';
    if (input) input.setAttribute('aria-expanded', 'false');
    const suggestions = document.querySelector('[data-search-results]');
    if (suggestions) {
      suggestions.hidden = true;
      suggestions.replaceChildren();
    }
    const searchStatus = document.querySelector('[data-search-status]');
    if (searchStatus) searchStatus.textContent = 'Pesquise por nome, categoria, descrição ou tags.';
    applyFilters();
  };

  const setTheme = (theme) => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(themeStorageKey, theme);
    } catch {
      // Sem persistência, a alternância continua válida durante a visita atual.
    }

    const toggle = document.querySelector('[data-theme-toggle]');
    if (toggle) {
      const isLight = theme === 'light';
      toggle.textContent = isLight ? '☀️' : '🌙';
      toggle.setAttribute('aria-label', isLight ? 'Ativar modo escuro' : 'Ativar modo claro');
      toggle.setAttribute('title', isLight ? 'Ativar modo escuro' : 'Ativar modo claro');
    }
  };

  const prepareSearch = () => {
    const input = document.querySelector('[data-game-search]');
    const resultsPanel = document.querySelector('[data-search-results]');
    const status = document.querySelector('[data-search-status]');
    if (!input || !resultsPanel) return;

    const closeResults = () => {
      resultsPanel.hidden = true;
      input.setAttribute('aria-expanded', 'false');
    };

    const createSearchResult = (game) => {
      const result = document.createElement('a');
      result.className = 'search-result';
      result.href = game.href;
      result.dataset.playGameId = game.id;
      result.setAttribute('role', 'option');
      result.setAttribute('aria-label', `${game.title}, ${game.category}${game.externalPortal === true ? ', abre em outra aba' : ''}${game.externalWarning === true ? ', mostra aviso de site externo antes de abrir' : ''}`);
      if (game.externalWarning === true) result.dataset.externalWarning = 'true';
      if (game.externalPortal === true) {
        result.target = '_blank';
        result.rel = 'noopener noreferrer';
      }

      const cover = document.createElement('img');
      cover.src = game.image;
      cover.alt = '';
      cover.loading = 'lazy';
      cover.addEventListener('error', () => {
        const fallback = document.createElement('span');
        fallback.className = 'search-result-cover-fallback';
        fallback.setAttribute('aria-hidden', 'true');
        fallback.textContent = game.fallback || '🎮';
        cover.replaceWith(fallback);
      }, { once: true });

      const copy = document.createElement('span');
      copy.className = 'search-result-copy';
      const title = document.createElement('strong');
      title.textContent = game.title;
      const category = document.createElement('span');
      category.textContent = game.category;
      copy.append(title, category);
      result.append(cover, copy);

      if (game.externalPortal === true) {
        const externalMark = document.createElement('span');
        externalMark.className = 'search-result-external';
        externalMark.setAttribute('aria-hidden', 'true');
        externalMark.textContent = '↗';
        result.append(externalMark);
      }
      return result;
    };

    const renderSearchResults = () => {
      const rawQuery = input.value.trim();
      const query = normalizeText(rawQuery);
      if (!query) {
        closeResults();
        resultsPanel.replaceChildren();
        if (status) status.textContent = 'Pesquise por nome, categoria, descrição ou tags.';
        return;
      }

      const matches = catalog
        .filter((game) => normalizeText(getSearchableText(game)).includes(query))
        .sort((a, b) => {
          const titleA = normalizeText(a.title);
          const titleB = normalizeText(b.title);
          const score = (title) => title === query ? 0 : title.startsWith(query) ? 1 : title.includes(query) ? 2 : 3;
          return score(titleA) - score(titleB);
        });
      const visibleMatches = matches.slice(0, 10);
      resultsPanel.replaceChildren();

      if (visibleMatches.length) {
        visibleMatches.forEach((game) => resultsPanel.appendChild(createSearchResult(game)));
        if (status) {
          status.textContent = matches.length > visibleMatches.length
            ? `Mostrando ${visibleMatches.length} de ${matches.length} jogos. Digite mais para refinar.`
            : `${matches.length} ${matches.length === 1 ? 'jogo encontrado' : 'jogos encontrados'}. Selecione para abrir.`;
        }
      } else {
        const empty = document.createElement('p');
        empty.className = 'search-results-empty';
        empty.textContent = 'Nenhum jogo encontrado. Tente outro nome ou categoria.';
        resultsPanel.appendChild(empty);
        if (status) status.textContent = 'Nenhum resultado para essa pesquisa.';
      }

      resultsPanel.hidden = false;
      input.setAttribute('aria-expanded', 'true');
    };

    input.addEventListener('input', () => {
      renderSearchResults();
    });
    input.addEventListener('focus', () => {
      if (input.value.trim()) renderSearchResults();
    });
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !resultsPanel.hidden) {
        closeResults();
        return;
      }
      if (event.key === 'ArrowDown' && !resultsPanel.hidden) {
        const firstResult = resultsPanel.querySelector('.search-result');
        if (firstResult) {
          event.preventDefault();
          firstResult.focus();
        }
      }
    });
    resultsPanel.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeResults();
        input.focus();
        return;
      }
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
      const items = [...resultsPanel.querySelectorAll('.search-result')];
      const currentIndex = items.indexOf(document.activeElement);
      if (event.key === 'ArrowUp' && currentIndex <= 0) {
        event.preventDefault();
        input.focus();
      } else {
        const nextIndex = event.key === 'ArrowDown'
          ? Math.min(items.length - 1, currentIndex + 1)
          : Math.max(0, currentIndex - 1);
        if (items[nextIndex]) {
          event.preventDefault();
          items[nextIndex].focus();
        }
      }
    });
    resultsPanel.addEventListener('click', (event) => {
      if (event.target.closest('.search-result')) closeResults();
    });
    document.addEventListener('click', (event) => {
      if (!event.target.closest('.search-control')) closeResults();
    });
  };

  const prepareCategories = () => {
    document.querySelectorAll('[data-category-filter]').forEach((button) => {
      button.addEventListener('click', () => {
        const category = button.dataset.categoryFilter;
        filters.category = filters.category === category ? 'todos' : category;
        applyFilters();
        document.getElementById('jogos')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  };

  const prepareFavorites = () => {
    const toggle = document.querySelector('[data-favorites-toggle]');
    if (!toggle) return;
    toggle.addEventListener('click', () => {
      filters.favoritesOnly = !filters.favoritesOnly;
      applyFilters();
      document.getElementById('jogos')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const clearLocalStats = async () => {
    if (typeof stats?.clearStats !== 'function') return;
    const confirmed = await window.CV_GAMES_DIALOG.confirm({
      title:'Limpar histórico de jogos?',
      message:'Isso apagará somente o histórico e as estatísticas salvas neste dispositivo. Favoritos e tema serão mantidos.',
      confirmText:'Limpar histórico', cancelText:'Manter dados', tone:'danger'
    });
    if (!confirmed) return;
    stats.clearStats();
  };

  const scheduleStatisticsRender = () => {
    window.setTimeout(renderStatisticsSections, 0);
  };

  const init = () => {
    const initialParams = new URLSearchParams(window.location.search);
    if (initialParams.get('favoritos') === '1') filters.favoritesOnly = true;

    ownGamesPriority.forEach((id) => favorites.add(id));
    saveFavorites();

    renderGames('featured-games', getFeaturedGames());
    renderGames('recent-games', catalog.filter((game) => game.recent));
    renderStatisticsSections();

    document.addEventListener('click', (event) => {
      const favoriteButton = event.target.closest('[data-favorite-id]');
      if (favoriteButton) {
        const { favoriteId } = favoriteButton.dataset;
        if (favorites.has(favoriteId)) favorites.delete(favoriteId);
        else favorites.add(favoriteId);
        saveFavorites();
        applyFilters();
        return;
      }

      const guardedExternalLink = event.target.closest('[data-external-warning="true"]');
      if (guardedExternalLink) {
        event.preventDefault();
        const warningDialog = document.querySelector('[data-external-warning-dialog]');
        const continueLink = warningDialog?.querySelector('[data-warning-continue]');
        if (!warningDialog || !continueLink) return;
        continueLink.href = guardedExternalLink.href;
        continueLink.dataset.playGameId = guardedExternalLink.dataset.playGameId;
        if (typeof warningDialog.showModal === 'function') warningDialog.showModal();
        else warningDialog.setAttribute('open', '');
        return;
      }

      const playLink = event.target.closest('[data-play-game-id]');
      if (playLink) {
        if (typeof stats?.registerAccess === 'function'
          && typeof stats?.isExternalDestination === 'function'
          && stats.isExternalDestination(playLink.href)) {
          stats.registerAccess(playLink.dataset.playGameId);
        }
        return;
      }

      if (event.target.closest('[data-clear-stats]')) {
        clearLocalStats();
        return;
      }

      if (event.target.closest('[data-clear-filters]')) clearFilters();
    });

    const externalWarningDialog = document.querySelector('[data-external-warning-dialog]');
    externalWarningDialog?.querySelectorAll('[data-warning-close]').forEach((button) => button.addEventListener('click', () => externalWarningDialog.close()));
    externalWarningDialog?.querySelector('[data-warning-continue]')?.addEventListener('click', () => externalWarningDialog.close());
    externalWarningDialog?.addEventListener('click', (event) => {
      if (event.target === externalWarningDialog) externalWarningDialog.close();
    });

    if (typeof stats?.storageKey === 'string') {
      window.addEventListener('cv-games-stats-change', scheduleStatisticsRender);
      window.addEventListener('storage', (event) => {
        if (event.key === stats.storageKey) scheduleStatisticsRender();
      });
    }

    const menuButton = document.querySelector('[data-menu-toggle]');
    const menu = document.querySelector('[data-primary-nav]');
    const setMenuOpen = (isOpen) => {
      menu?.classList.toggle('is-open', isOpen);
      menuButton?.setAttribute('aria-expanded', String(isOpen));
      menuButton?.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
    };
    if (menuButton && menu) {
      menuButton.addEventListener('click', () => {
        setMenuOpen(!menu.classList.contains('is-open'));
      });
      menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenuOpen(false)));
    }

    document.querySelectorAll('a[href="#inicio"]').forEach((link) => link.addEventListener('click', (event) => {
      event.preventDefault();
      clearFilters();
      if (window.location.hash) window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
      setMenuOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }));

    document.querySelectorAll('a[href="#jogos"]').forEach((link) => link.addEventListener('click', (event) => {
      event.preventDefault();
      clearFilters();
      setMenuOpen(false);
      document.getElementById('jogos')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }));

    const themeButton = document.querySelector('[data-theme-toggle]');
    if (themeButton) {
      setTheme(document.documentElement.dataset.theme || 'dark');
      themeButton.addEventListener('click', () => {
        setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
      });
    }

    prepareSearch();
    prepareCategories();
    prepareFavorites();
    applyFilters();
    setupGxAnnouncement();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}());
