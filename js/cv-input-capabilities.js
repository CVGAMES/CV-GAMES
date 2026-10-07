(() => {
  const root = document.documentElement;
  const finePointer = window.matchMedia('(any-pointer: fine)');
  const hoverPointer = window.matchMedia('(any-hover: hover)');

  const update = (detected) => {
    const hasHardwareInput = Boolean(detected);
    root.classList.toggle('cv-hardware-input-detected', hasHardwareInput);
    window.dispatchEvent(new CustomEvent('cv-input-capabilities-change', {
      detail: { hasHardwareInput },
    }));
  };

  update(finePointer.matches || hoverPointer.matches);

  const handlePointer = (event) => {
    if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
      update(true);
      window.removeEventListener('pointerdown', handlePointer, true);
      window.removeEventListener('pointermove', handlePointer, true);
    }
  };
  const handleKeyboard = (event) => {
    if (event.isTrusted) {
      update(true);
      window.removeEventListener('keydown', handleKeyboard, true);
    }
  };

  window.addEventListener('pointerdown', handlePointer, true);
  window.addEventListener('pointermove', handlePointer, true);
  window.addEventListener('keydown', handleKeyboard, true);
  finePointer.addEventListener?.('change', (event) => update(event.matches || hoverPointer.matches));
  hoverPointer.addEventListener?.('change', (event) => update(event.matches || finePointer.matches));
})();
