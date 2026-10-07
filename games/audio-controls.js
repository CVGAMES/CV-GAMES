(function () {
  'use strict';

  const root = document.querySelector('[data-game-audio]');
  if (!root) return;
  const settingsKey = 'cv-games-audio-settings-v1';
  const readSettings = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(settingsKey) || '{}');
      return {
        musicVolume: Number.isFinite(Number(saved.musicVolume)) ? Math.max(0, Math.min(100, Number(saved.musicVolume))) : 3,
        gameVolume: Number.isFinite(Number(saved.gameVolume)) ? Math.max(0, Math.min(100, Number(saved.gameVolume))) : 100,
        muted: saved.muted === true
      };
    } catch { return { musicVolume:3, gameVolume:100, muted:false }; }
  };
  const settings = readSettings();
  const saveSettings = () => {
    try { localStorage.setItem(settingsKey, JSON.stringify({ musicVolume:Number(musicSlider.value), gameVolume:Number(gameSlider.value), muted })); } catch { /* Áudio segue configurado nesta sessão. */ }
  };

  const panelId = `cv-audio-panel-${document.body.className.split(/\s+/)[0] || 'game'}`;
  root.innerHTML = `
    <button class="cv-game-audio-button" type="button" data-audio-toggle aria-expanded="false" aria-controls="${panelId}" aria-label="Abrir controles de áudio" title="Controles de áudio"><span data-audio-icon aria-hidden="true">🔊</span><span>Volume</span></button>
    <section class="cv-game-audio-panel" id="${panelId}" data-audio-panel aria-label="Controles de áudio" hidden>
      <h2 class="cv-game-audio-heading">Áudio</h2>
      <button class="cv-game-audio-play" type="button" data-music-play aria-pressed="false">▶ Tocar música</button>
      <button class="cv-game-audio-mute" type="button" data-music-mute aria-pressed="false">🔇 Mutar música</button>
      <label class="cv-game-audio-row"><span class="cv-game-audio-label"><span>Volume da música</span><output data-music-output>3%</output></span><input type="range" min="0" max="100" step="1" value="3" data-music-volume aria-label="Volume da música"></label>
      <label class="cv-game-audio-row"><span class="cv-game-audio-label"><span>Volume do jogo</span><output data-game-output>100%</output></span><input type="range" min="0" max="100" step="1" value="100" data-game-volume aria-label="Volume dos efeitos do jogo"></label>
      <p class="cv-game-audio-status" data-audio-status aria-live="polite">A música começa no primeiro toque ou clique.</p>
    </section>`;

  const toggle = root.querySelector('[data-audio-toggle]');
  const panel = root.querySelector('[data-audio-panel]');
  const musicPlay = root.querySelector('[data-music-play]');
  const musicMute = root.querySelector('[data-music-mute]');
  const musicSlider = root.querySelector('[data-music-volume]');
  const gameSlider = root.querySelector('[data-game-volume]');
  const musicOutput = root.querySelector('[data-music-output]');
  const gameOutput = root.querySelector('[data-game-output]');
  const audioStatus = root.querySelector('[data-audio-status]');
  const icon = root.querySelector('[data-audio-icon]');
  const music = new Audio(new URL(root.dataset.musicSrc, document.baseURI).href);
  music.loop = true;
  music.preload = 'none';
  musicSlider.value = String(settings.musicVolume);
  gameSlider.value = String(settings.gameVolume);
  musicOutput.value = `${settings.musicVolume}%`;
  musicOutput.textContent = `${settings.musicVolume}%`;
  gameOutput.value = `${settings.gameVolume}%`;
  gameOutput.textContent = `${settings.gameVolume}%`;
  music.volume = settings.musicVolume / 100;

  let muted = settings.muted;
  let hasStartedMusic = false;
  let musicStartPending = false;
  let userPausedMusic = false;
  let gameVolume = settings.gameVolume / 100;
  let audioContext;
  const sfxChannels = new Map();

  const getAudioContext = () => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    audioContext ||= new AudioContextClass();
    if (audioContext.state === 'suspended') audioContext.resume()?.catch?.(() => {});
    return audioContext;
  };

  const playSfx = (src, level = 0.5) => {
    if (!gameVolume || !src) return;
    const url = new URL(src, document.baseURI).href;
    let channels = sfxChannels.get(url);
    if (!channels) {
      channels = Array.from({ length: 2 }, () => {
        const audio = new Audio(url);
        audio.preload = 'auto';
        return audio;
      });
      sfxChannels.set(url, channels);
    }
    const audio = channels.find((channel) => channel.paused || channel.ended) || channels[0];
    try { audio.currentTime = 0; } catch { /* O navegador ainda pode estar carregando o clipe. */ }
    audio.volume = Math.max(0, Math.min(1, gameVolume * level));
    audio.play()?.catch?.(() => {});
  };

  const updateMusicControl = () => {
    music.muted = muted;
    musicMute.setAttribute('aria-pressed', String(muted));
    musicMute.textContent = muted ? '🔊 Ativar música' : '🔇 Mutar música';
    const isPlaying = !music.paused;
    musicPlay.setAttribute('aria-pressed', String(isPlaying));
    musicPlay.textContent = isPlaying ? '⏸ Pausar música' : '▶ Tocar música';
    icon.textContent = muted ? '🔇' : '🔊';
    toggle.setAttribute('aria-label', muted ? 'Abrir controles de áudio; música mutada' : 'Abrir controles de áudio');
  };

  const startMusic = () => {
    if (document.hidden || muted || userPausedMusic || !music.paused || musicStartPending) return;
    musicStartPending = true;
    try {
      const result = music.play();
      if (result && typeof result.then === 'function') {
        result.then(() => {
          hasStartedMusic = true;
          musicStartPending = false;
          audioStatus.textContent = 'Música tocando em repetição.';
          updateMusicControl();
        }).catch(() => {
          musicStartPending = false;
          audioStatus.textContent = 'Toque em “Tocar música” para iniciar o áudio.';
          updateMusicControl();
        });
      } else {
        hasStartedMusic = true;
        musicStartPending = false;
        audioStatus.textContent = 'Música tocando em repetição.';
        updateMusicControl();
      }
    } catch (error) {
      musicStartPending = false;
      audioStatus.textContent = 'Toque em “Tocar música” para iniciar o áudio.';
      updateMusicControl();
    }
  };

  music.addEventListener('error', () => {
    audioStatus.textContent = 'Não foi possível carregar o arquivo de música.';
  });
  music.addEventListener('play', updateMusicControl);
  music.addEventListener('pause', updateMusicControl);

  toggle.addEventListener('click', () => {
    const open = panel.hidden;
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
  });

  musicMute.addEventListener('click', () => {
    muted = !muted;
    saveSettings();
    updateMusicControl();
    if (!muted) startMusic();
  });

  musicPlay.addEventListener('click', () => {
    if (music.paused) {
      userPausedMusic = false;
      startMusic();
    } else {
      userPausedMusic = true;
      music.pause();
      audioStatus.textContent = 'Música pausada.';
      updateMusicControl();
    }
  });

  musicSlider.addEventListener('input', () => {
    const value = Number(musicSlider.value);
    music.volume = value / 100;
    musicOutput.value = `${value}%`;
    musicOutput.textContent = `${value}%`;
    saveSettings();
  });

  gameSlider.addEventListener('input', () => {
    const value = Number(gameSlider.value);
    gameVolume = value / 100;
    gameOutput.value = `${value}%`;
    gameOutput.textContent = `${value}%`;
    saveSettings();
  });

  document.addEventListener('click', (event) => {
    if (!root.contains(event.target)) {
      panel.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
    }
    if (!hasStartedMusic) startMusic();
  });

  document.addEventListener('pointerdown', (event) => {
    if (event.target instanceof Element && event.target.closest('[data-music-mute], [data-music-play]')) return;
    if (!hasStartedMusic) startMusic();
  }, { capture:true });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hidden) {
      panel.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      toggle.focus();
    }
    if (!hasStartedMusic) startMusic();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) music.pause();
    else if (hasStartedMusic && !userPausedMusic) startMusic();
  });

  window.CV_GAME_AUDIO = {
    playSfx,
    playTone(frequency, duration = 0.08, type = 'sine', level = 0.04) {
      if (!gameVolume || !(window.AudioContext || window.webkitAudioContext)) return;
      const context = getAudioContext();
      if (!context) return;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = context.currentTime;
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(Math.max(0.0001, level * gameVolume), start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + duration);
    }
  };

  updateMusicControl();
})();
