(function () {
  'use strict';

  const options = Object.freeze([
    { id:'easy', name:'Fácil', face:'☺', summary:'Uma IA tranquila que deixa mais espaço para você experimentar estratégias.', behavior:'Faz escolhas espontâneas e pode deixar passar oportunidades ou ameaças.', wait:300 },
    { id:'medium', name:'Médio', face:'😐', summary:'Um desafio equilibrado para treinar sem exigir que você preveja muitas jogadas.', behavior:'Busca oportunidades claras e responde a ameaças simples, sem calcular muito à frente.', wait:430 },
    { id:'hard', name:'Difícil', face:'😠', summary:'A IA analisa sequências e joga com firmeza, mas ainda pode cometer um erro.', behavior:'Calcula mais respostas, com pequenas chances de escolher uma linha menos segura.', wait:590 },
    { id:'expert', name:'Extra difícil', face:'👹', summary:'O nível máximo: a IA escolhe a melhor resposta disponível neste jogo.', behavior:'Usa a estratégia mais forte implementada para o jogo.', wait:730 }
  ]);
  const normalize = (value) => options.some((option) => option.id === value) ? value : 'medium';
  const keyFor = (gameKey) => `cv-games-ai-difficulty:${String(gameKey || 'default')}`;
  const sessionValues = new Map();

  const get = (gameKey, fallback = 'medium') => {
    const key = keyFor(gameKey);
    try {
      const saved = localStorage.getItem(key);
      if (saved) return normalize(saved);
    } catch { /* Usa a escolha desta sessão quando o armazenamento estiver indisponível. */ }
    return normalize(sessionValues.get(key) || fallback);
  };

  const set = (gameKey, difficulty) => {
    const value = normalize(difficulty);
    const key = keyFor(gameKey);
    sessionValues.set(key, value);
    try { localStorage.setItem(key, value); } catch { /* A escolha vale nesta sessão mesmo sem armazenamento. */ }
    return value;
  };

  const renderPicker = (picker, difficulty, persist = false) => {
    const index = options.findIndex((option) => option.id === difficulty);
    const option = options[index];
    const key = picker.dataset.aiDifficultyKey || 'default';
    const progress = `${(index / (options.length - 1)) * 100}%`;
    picker.dataset.difficulty = option.id;
    picker.style.setProperty('--ai-progress', progress);
    picker.querySelector('[data-ai-difficulty-range]')?.setAttribute('aria-valuetext', `${option.name}, nível ${index + 1} de ${options.length}`);
    const range = picker.querySelector('[data-ai-difficulty-range]');
    if (range) range.value = String(index);
    const showcase = picker.querySelector('[data-ai-difficulty-showcase]');
    if (showcase) showcase.dataset.difficulty = option.id;
    const textMap = [
      ['[data-ai-difficulty-name]', option.name],
      ['[data-ai-difficulty-summary]', option.summary],
      ['[data-ai-difficulty-behavior]', key === 'cv-jogo-da-velha' && option.id === 'expert'
        ? `${option.behavior} No Jogo da Velha, não perde quando joga corretamente.`
          : key === 'cv-xadrez'
          ? ({
              easy:'Escolhe entre lances legais de forma espontânea, ideal para aprender e testar planos.',
              medium:'Avalia o resultado imediato dos lances e presta atenção em capturas e ameaças simples.',
              hard:'Calcula respostas por algumas jogadas e pode escolher uma linha menos segura de vez em quando.',
              expert:'Analisa sequências mais longas com busca de respostas e prioriza a melhor linha encontrada.'
            }[option.id])
          : key === 'cv-damas'
            ? ({
                easy:'Escolhe uma sequência legal de forma espontânea para você praticar capturas e coroações.',
                medium:'Dá preferência a capturas vantajosas e a avanços que aproximam as peças da coroação.',
                hard:'Calcula sequências de resposta e pode arriscar um lance menos seguro de vez em quando.',
                expert:'Analisa várias jogadas à frente, incluindo capturas obrigatórias e coroações.'
              }[option.id])
          : key === 'cv-quadrados'
            ? ({
                easy:'Escolhe linhas de forma espontânea e deixa espaço para você experimentar estratégias.',
                medium:'Fecha quadrados disponíveis e procura linhas que não entreguem uma captura imediata.',
                hard:'Avalia linhas seguras e considera as cadeias de quadrados que podem surgir depois.',
                expert:'Calcula mais respostas, prioriza capturas e tenta reduzir as oportunidades do adversário.'
              }[option.id])
          : key === 'cv-batalha-naval'
            ? ({
                easy:'Escolhe casas de forma aleatória e pode deixar navios inteiros fora da busca por bastante tempo.',
                medium:'Depois de um acerto, tenta procurar casas vizinhas para seguir o contato.',
                hard:'Estima onde os navios restantes cabem e concentra disparos nas casas mais prováveis.',
                expert:'Cruza os acertos e as águas já verificadas para perseguir os navios com mais precisão.'
              }[option.id])
          : option.behavior],
      ['[data-ai-difficulty-level]', `NÍVEL ${index + 1} / ${options.length}`],
      ['[data-ai-difficulty-value]', `${option.name.toLocaleUpperCase('pt-BR')} · ${index + 1}/${options.length}`],
      ['[data-ai-difficulty-face]', option.face],
      ['[data-ai-difficulty-start-label]', `JOGAR · NÍVEL ${index + 1}`]
    ];
    textMap.forEach(([selector, value]) => {
      const element = picker.querySelector(selector);
      if (element) element.textContent = value;
    });
    picker.querySelectorAll('[data-ai-difficulty-tick]').forEach((tick) => {
      const active = Number(tick.dataset.aiDifficultyTick) === index;
      tick.setAttribute('aria-current', String(active));
    });
    if (persist) {
      set(key, option.id);
      window.dispatchEvent(new CustomEvent('cv-ai-difficulty-change', { detail:{ gameKey:key, difficulty:option.id, level:index + 1 } }));
    }
  };

  window.CV_GAMES_AI_DIFFICULTY = Object.freeze({
    options,
    get,
    set,
    getDetails: (difficulty) => options.find((option) => option.id === normalize(difficulty))
  });

  document.querySelectorAll('[data-ai-difficulty-picker]').forEach((picker) => {
    const key = picker.dataset.aiDifficultyKey || 'default';
    renderPicker(picker, get(key), false);
    picker.querySelector('[data-ai-difficulty-range]')?.addEventListener('input', (event) => {
      const option = options[Math.max(0, Math.min(options.length - 1, Number(event.currentTarget.value)))] || options[1];
      renderPicker(picker, option.id, true);
    });
  });

  document.addEventListener('click', (event) => {
    const button = event.target instanceof Element ? event.target.closest('[data-ai-difficulty-start]') : null;
    if (!button) return;
    const picker = button.closest('[data-ai-difficulty-picker]');
    if (!picker) return;
    const gameKey = picker.dataset.aiDifficultyKey || 'default';
    const difficulty = get(gameKey);
    const level = options.findIndex((option) => option.id === difficulty) + 1;
    document.dispatchEvent(new CustomEvent('cv-ai-difficulty-start', { detail:{ gameKey, difficulty, level } }));
  });
})();
